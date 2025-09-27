import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  rooms, 
  roomUsers, 
  roomModerationEvents, 
  roomBans, 
  roomMicControl, 
  roomModeratorPermissions,
  users,
  insertRoomModerationEventSchema,
  insertRoomBanSchema,
  insertRoomMicControlSchema,
  insertRoomModeratorPermissionsSchema
} from '@shared/schema';
import { and, eq, desc, gte, lt, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';
import { webSocketBroadcaster } from '../services/websocket-broadcaster';

const router = express.Router();

// Helper function to check if user has moderation permissions in a room
async function checkModerationPermissions(
  userId: number, 
  roomId: number, 
  action: string
): Promise<{ hasPermission: boolean; isOwner: boolean; isManager: boolean; permissions?: any }> {
  // Check if user is room owner
  const room = await db
    .select({ ownerId: rooms.ownerId })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  if (room.length === 0) {
    return { hasPermission: false, isOwner: false, isManager: false };
  }

  const isOwner = room[0].ownerId === userId;
  if (isOwner) {
    return { hasPermission: true, isOwner: true, isManager: false };
  }

  // Check if user is a manager in the room
  const roomUser = await db
    .select({ role: roomUsers.role })
    .from(roomUsers)
    .where(and(
      eq(roomUsers.roomId, roomId),
      eq(roomUsers.userId, userId)
    ))
    .limit(1);

  const isManager = roomUser.length > 0 && roomUser[0].role === 'manager';

  // Check specific moderator permissions
  const permissions = await db
    .select()
    .from(roomModeratorPermissions)
    .where(and(
      eq(roomModeratorPermissions.roomId, roomId),
      eq(roomModeratorPermissions.userId, userId),
      eq(roomModeratorPermissions.isActive, true)
    ))
    .limit(1);

  const hasSpecificPermission = permissions.length > 0;
  let canPerformAction = false;

  if (hasSpecificPermission) {
    const perms = permissions[0];
    switch (action) {
      case 'invite_to_mic':
        canPerformAction = perms.canInviteToMic;
        break;
      case 'remove_from_mic':
        canPerformAction = perms.canRemoveFromMic;
        break;
      case 'lock_mic':
        canPerformAction = perms.canLockMic;
        break;
      case 'mute_mic':
        canPerformAction = perms.canMuteMic;
        break;
      case 'kick_user':
        canPerformAction = perms.canKickUsers;
        break;
      case 'ban_user':
        canPerformAction = perms.canBanUsers;
        break;
      case 'mute_user':
        canPerformAction = perms.canMuteUsers;
        break;
      case 'manage_moderators':
        canPerformAction = perms.canManageModerators;
        break;
      default:
        canPerformAction = false;
    }
  }

  return {
    hasPermission: isManager || canPerformAction,
    isOwner: false,
    isManager,
    permissions: hasSpecificPermission ? permissions[0] : null
  };
}

// Helper function to broadcast real-time updates via WebSocket
function broadcastRoomUpdate(roomId: number, event: any) {
  // Convert roomId to string for WebSocket broadcaster
  const roomIdString = roomId.toString();
  
  // Use the WebSocket broadcaster service to send real-time updates
  webSocketBroadcaster.broadcastModerationEvent(roomIdString, event);
  
  console.log(`Broadcasting room update for room ${roomId}:`, event);
}

// Get room moderation events
router.get('/rooms/:roomId/moderation/events', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;

    // Check if user has access to view moderation events
    const access = await checkModerationPermissions(userId, roomId, 'view_events');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const events = await db
      .select({
        id: roomModerationEvents.id,
        action: roomModerationEvents.action,
        reason: roomModerationEvents.reason,
        metadata: roomModerationEvents.metadata,
        createdAt: roomModerationEvents.createdAt,
        expiresAt: roomModerationEvents.expiresAt,
        isActive: roomModerationEvents.isActive,
        moderator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName
        },
        targetUser: {
          id: sql<number>`target_user.id`,
          username: sql<string>`target_user.username`,
          displayName: sql<string>`target_user.display_name`
        }
      })
      .from(roomModerationEvents)
      .leftJoin(users, eq(roomModerationEvents.moderatorId, users.id))
      .leftJoin(sql`${users} as target_user`, sql`${roomModerationEvents.targetUserId} = target_user.id`)
      .where(eq(roomModerationEvents.roomId, roomId))
      .orderBy(desc(roomModerationEvents.createdAt))
      .limit(50);

    res.json({ events });
  } catch (error) {
    console.error('Error fetching moderation events:', error);
    res.status(500).json({ error: 'Failed to fetch moderation events' });
  }
});

// Invite user to mic
router.post('/rooms/:roomId/moderation/invite-to-mic', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      targetUserId: z.number().positive(),
      seatNumber: z.number().min(1).max(8)
    });

    const { targetUserId, seatNumber } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'invite_to_mic');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to invite users to mic' });
    }

    // Check if seat is available
    const existingMicControl = await db
      .select()
      .from(roomMicControl)
      .where(and(
        eq(roomMicControl.roomId, roomId),
        eq(roomMicControl.seatNumber, seatNumber)
      ))
      .limit(1);

    if (existingMicControl.length > 0 && existingMicControl[0].status !== 'available') {
      return res.status(400).json({ error: 'Mic seat is not available' });
    }

    // Update room user to be invited to mic
    await db
      .update(roomUsers)
      .set({ isInvitedToMic: true })
      .where(and(
        eq(roomUsers.roomId, roomId),
        eq(roomUsers.userId, targetUserId)
      ));

    // Update or create mic control record
    if (existingMicControl.length > 0) {
      await db
        .update(roomMicControl)
        .set({
          status: 'invited_only',
          invitedUsers: sql`array_append(${roomMicControl.invitedUsers}, ${targetUserId})`,
          updatedAt: new Date()
        })
        .where(eq(roomMicControl.id, existingMicControl[0].id));
    } else {
      await db.insert(roomMicControl).values({
        roomId,
        seatNumber,
        status: 'invited_only',
        invitedUsers: [targetUserId]
      });
    }

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      targetUserId,
      action: 'invite_to_mic',
      metadata: { seatNumber }
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: 'mic_invitation',
      targetUserId,
      seatNumber,
      moderatorId: userId
    });

    res.json({ success: true, message: 'User invited to mic successfully' });
  } catch (error) {
    console.error('Error inviting user to mic:', error);
    res.status(500).json({ error: 'Failed to invite user to mic' });
  }
});

// Remove user from mic
router.post('/rooms/:roomId/moderation/remove-from-mic', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      targetUserId: z.number().positive(),
      seatNumber: z.number().min(1).max(8)
    });

    const { targetUserId, seatNumber } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'remove_from_mic');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to remove users from mic' });
    }

    // Update room user mic status
    await db
      .update(roomUsers)
      .set({ 
        isMicOn: false,
        isInvitedToMic: false
      })
      .where(and(
        eq(roomUsers.roomId, roomId),
        eq(roomUsers.userId, targetUserId)
      ));

    // Update mic control
    await db
      .update(roomMicControl)
      .set({
        status: 'available',
        occupiedBy: null,
        invitedUsers: sql`array_remove(${roomMicControl.invitedUsers}, ${targetUserId})`,
        updatedAt: new Date()
      })
      .where(and(
        eq(roomMicControl.roomId, roomId),
        eq(roomMicControl.seatNumber, seatNumber)
      ));

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      targetUserId,
      action: 'remove_from_mic',
      metadata: { seatNumber }
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: 'mic_removal',
      targetUserId,
      seatNumber,
      moderatorId: userId
    });

    res.json({ success: true, message: 'User removed from mic successfully' });
  } catch (error) {
    console.error('Error removing user from mic:', error);
    res.status(500).json({ error: 'Failed to remove user from mic' });
  }
});

// Lock/unlock mic
router.post('/rooms/:roomId/moderation/lock-mic', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      seatNumber: z.number().min(1).max(8),
      lock: z.boolean()
    });

    const { seatNumber, lock } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'lock_mic');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to lock/unlock mic' });
    }

    // Update mic control
    const existingMicControl = await db
      .select()
      .from(roomMicControl)
      .where(and(
        eq(roomMicControl.roomId, roomId),
        eq(roomMicControl.seatNumber, seatNumber)
      ))
      .limit(1);

    if (existingMicControl.length > 0) {
      await db
        .update(roomMicControl)
        .set({
          status: lock ? 'locked' : 'available',
          lockedBy: lock ? userId : null,
          updatedAt: new Date()
        })
        .where(eq(roomMicControl.id, existingMicControl[0].id));
    } else {
      await db.insert(roomMicControl).values({
        roomId,
        seatNumber,
        status: lock ? 'locked' : 'available',
        lockedBy: lock ? userId : null
      });
    }

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      action: lock ? 'lock_mic' : 'unlock_mic',
      metadata: { seatNumber }
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: lock ? 'mic_locked' : 'mic_unlocked',
      seatNumber,
      moderatorId: userId
    });

    res.json({ success: true, message: `Mic ${lock ? 'locked' : 'unlocked'} successfully` });
  } catch (error) {
    console.error('Error locking/unlocking mic:', error);
    res.status(500).json({ error: 'Failed to lock/unlock mic' });
  }
});

// Mute/unmute mic
router.post('/rooms/:roomId/moderation/mute-mic', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      seatNumber: z.number().min(1).max(8),
      mute: z.boolean()
    });

    const { seatNumber, mute } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'mute_mic');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to mute/unmute mic' });
    }

    // Update mic control
    const existingMicControl = await db
      .select()
      .from(roomMicControl)
      .where(and(
        eq(roomMicControl.roomId, roomId),
        eq(roomMicControl.seatNumber, seatNumber)
      ))
      .limit(1);

    if (existingMicControl.length > 0) {
      await db
        .update(roomMicControl)
        .set({
          isMuted: mute,
          mutedBy: mute ? userId : null,
          updatedAt: new Date()
        })
        .where(eq(roomMicControl.id, existingMicControl[0].id));
    } else {
      await db.insert(roomMicControl).values({
        roomId,
        seatNumber,
        isMuted: mute,
        mutedBy: mute ? userId : null
      });
    }

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      action: mute ? 'mute_mic' : 'unmute_mic',
      metadata: { seatNumber }
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: mute ? 'mic_muted' : 'mic_unmuted',
      seatNumber,
      moderatorId: userId
    });

    res.json({ success: true, message: `Mic ${mute ? 'muted' : 'unmuted'} successfully` });
  } catch (error) {
    console.error('Error muting/unmuting mic:', error);
    res.status(500).json({ error: 'Failed to mute/unmute mic' });
  }
});

// Kick user from room
router.post('/rooms/:roomId/moderation/kick-user', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      targetUserId: z.number().positive(),
      reason: z.string().max(500).optional()
    });

    const { targetUserId, reason } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'kick_user');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to kick users' });
    }

    // Cannot kick room owner
    const room = await db
      .select({ ownerId: rooms.ownerId })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (room.length > 0 && room[0].ownerId === targetUserId) {
      return res.status(400).json({ error: 'Cannot kick room owner' });
    }

    // Update room user status
    await db
      .update(roomUsers)
      .set({ 
        status: 'kicked',
        isActive: false,
        isMicOn: false
      })
      .where(and(
        eq(roomUsers.roomId, roomId),
        eq(roomUsers.userId, targetUserId)
      ));

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      targetUserId,
      action: 'kick_user',
      reason
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: 'user_kicked',
      targetUserId,
      reason,
      moderatorId: userId
    });

    res.json({ success: true, message: 'User kicked from room successfully' });
  } catch (error) {
    console.error('Error kicking user:', error);
    res.status(500).json({ error: 'Failed to kick user' });
  }
});

// Ban user from room
router.post('/rooms/:roomId/moderation/ban-user', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      targetUserId: z.number().positive(),
      duration: z.enum(['1_day', '7_days', '30_days', '1_year', 'permanent']),
      reason: z.string().max(500).optional()
    });

    const { targetUserId, duration, reason } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'ban_user');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to ban users' });
    }

    // Cannot ban room owner
    const room = await db
      .select({ ownerId: rooms.ownerId })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (room.length > 0 && room[0].ownerId === targetUserId) {
      return res.status(400).json({ error: 'Cannot ban room owner' });
    }

    // Calculate expiry date
    let expiresAt: Date | null = null;
    if (duration !== 'permanent') {
      const now = new Date();
      switch (duration) {
        case '1_day':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7_days':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '30_days':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case '1_year':
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Update room user status
    await db
      .update(roomUsers)
      .set({ 
        status: 'banned',
        isActive: false,
        isMicOn: false
      })
      .where(and(
        eq(roomUsers.roomId, roomId),
        eq(roomUsers.userId, targetUserId)
      ));

    // Create ban record
    await db.insert(roomBans).values({
      roomId,
      userId: targetUserId,
      bannedBy: userId,
      duration,
      reason,
      expiresAt
    });

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      targetUserId,
      action: 'ban_user',
      reason,
      metadata: { duration },
      expiresAt
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: 'user_banned',
      targetUserId,
      duration,
      reason,
      expiresAt,
      moderatorId: userId
    });

    res.json({ success: true, message: 'User banned from room successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Change mic - move user from one mic to another
router.post('/rooms/:roomId/moderation/change-mic', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;
    
    const bodySchema = z.object({
      targetUserId: z.number().positive(),
      fromSeat: z.number().min(1).max(8),
      toSeat: z.number().min(1).max(8)
    });

    const { targetUserId, fromSeat, toSeat } = bodySchema.parse(req.body);

    // Check permissions
    const access = await checkModerationPermissions(userId, roomId, 'change_mic');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to change mic' });
    }

    // Check if target seat is available
    const targetSeatControl = await db
      .select()
      .from(roomMicControl)
      .where(and(
        eq(roomMicControl.roomId, roomId),
        eq(roomMicControl.seatNumber, toSeat)
      ))
      .limit(1);

    if (targetSeatControl.length > 0 && targetSeatControl[0].status === 'occupied') {
      return res.status(400).json({ error: 'Target mic seat is already occupied' });
    }

    // Update from seat - make it available
    await db
      .update(roomMicControl)
      .set({
        status: 'available',
        occupiedBy: null,
        updatedAt: new Date()
      })
      .where(and(
        eq(roomMicControl.roomId, roomId),
        eq(roomMicControl.seatNumber, fromSeat)
      ));

    // Update to seat - make it occupied
    if (targetSeatControl.length > 0) {
      await db
        .update(roomMicControl)
        .set({
          status: 'occupied',
          occupiedBy: targetUserId,
          updatedAt: new Date()
        })
        .where(eq(roomMicControl.id, targetSeatControl[0].id));
    } else {
      await db.insert(roomMicControl).values({
        roomId,
        seatNumber: toSeat,
        status: 'occupied',
        occupiedBy: targetUserId
      });
    }

    // Update room user seat number
    await db
      .update(roomUsers)
      .set({ seatNumber: toSeat })
      .where(and(
        eq(roomUsers.roomId, roomId),
        eq(roomUsers.userId, targetUserId)
      ));

    // Log moderation event
    await db.insert(roomModerationEvents).values({
      roomId,
      moderatorId: userId,
      targetUserId,
      action: 'change_mic',
      metadata: { fromSeat, toSeat }
    });

    // Broadcast real-time update
    broadcastRoomUpdate(roomId, {
      type: 'mic_changed',
      targetUserId,
      fromSeat,
      toSeat,
      moderatorId: userId
    });

    res.json({ success: true, message: 'Mic changed successfully' });
  } catch (error) {
    console.error('Error changing mic:', error);
    res.status(500).json({ error: 'Failed to change mic' });
  }
});

// Get room mic control status
router.get('/rooms/:roomId/moderation/mic-control', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;

    // Check if user has access to view mic control
    const access = await checkModerationPermissions(userId, roomId, 'view_mic_control');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const micControls = await db
      .select({
        id: roomMicControl.id,
        seatNumber: roomMicControl.seatNumber,
        status: roomMicControl.status,
        isMuted: roomMicControl.isMuted,
        invitedUsers: roomMicControl.invitedUsers,
        occupiedBy: {
          id: users.id,
          username: users.username,
          displayName: users.displayName
        },
        lockedBy: {
          id: sql<number>`locked_user.id`,
          username: sql<string>`locked_user.username`,
          displayName: sql<string>`locked_user.display_name`
        },
        mutedBy: {
          id: sql<number>`muted_user.id`,
          username: sql<string>`muted_user.username`,
          displayName: sql<string>`muted_user.display_name`
        }
      })
      .from(roomMicControl)
      .leftJoin(users, eq(roomMicControl.occupiedBy, users.id))
      .leftJoin(sql`${users} as locked_user`, sql`${roomMicControl.lockedBy} = locked_user.id`)
      .leftJoin(sql`${users} as muted_user`, sql`${roomMicControl.mutedBy} = muted_user.id`)
      .where(eq(roomMicControl.roomId, roomId))
      .orderBy(roomMicControl.seatNumber);

    res.json({ micControls });
  } catch (error) {
    console.error('Error fetching mic control:', error);
    res.status(500).json({ error: 'Failed to fetch mic control' });
  }
});

// Get room bans
router.get('/rooms/:roomId/moderation/bans', isAuthenticated, async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user!.id;

    // Check if user has access to view bans
    const access = await checkModerationPermissions(userId, roomId, 'view_bans');
    if (!access.hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const bans = await db
      .select({
        id: roomBans.id,
        duration: roomBans.duration,
        reason: roomBans.reason,
        createdAt: roomBans.createdAt,
        expiresAt: roomBans.expiresAt,
        isActive: roomBans.isActive,
        liftedAt: roomBans.liftedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName
        },
        bannedBy: {
          id: sql<number>`banned_by_user.id`,
          username: sql<string>`banned_by_user.username`,
          displayName: sql<string>`banned_by_user.display_name`
        },
        liftedBy: {
          id: sql<number>`lifted_by_user.id`,
          username: sql<string>`lifted_by_user.username`,
          displayName: sql<string>`lifted_by_user.display_name`
        }
      })
      .from(roomBans)
      .leftJoin(users, eq(roomBans.userId, users.id))
      .leftJoin(sql`${users} as banned_by_user`, sql`${roomBans.bannedBy} = banned_by_user.id`)
      .leftJoin(sql`${users} as lifted_by_user`, sql`${roomBans.liftedBy} = lifted_by_user.id`)
      .where(eq(roomBans.roomId, roomId))
      .orderBy(desc(roomBans.createdAt));

    res.json({ bans });
  } catch (error) {
    console.error('Error fetching bans:', error);
    res.status(500).json({ error: 'Failed to fetch bans' });
  }
});

export default router;