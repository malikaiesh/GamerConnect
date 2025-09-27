import { Router, Request, Response } from "express";
import { db } from "@db";
import { 
  userRelationships,
  users,
  userFriendPresence,
  callLogs,
  rooms
} from "@shared/schema";
import { eq, desc, and, sql, count, gte, sum, asc, or, ne } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Get user's friends
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const friends = await db
      .select({
        relationshipId: userRelationships.id,
        friendId: users.id,
        friendUsername: users.username,
        friendDisplayName: users.displayName,
        friendProfilePicture: users.profilePicture,
        friendIsVerified: users.isVerified,
        friendBio: users.bio,
        friendCountry: users.country,
        friendLastLogin: users.lastLogin,
        friendsSince: userRelationships.createdAt
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.targetUserId, users.id))
      .where(and(
        eq(userRelationships.userId, userId),
        eq(userRelationships.relationshipType, 'friend'),
        eq(userRelationships.status, 'accepted')
      ))
      .orderBy(desc(userRelationships.createdAt));

    // Transform to expected format
    const formattedFriends = friends.map(f => ({
      id: f.friendId,
      username: f.friendUsername,
      displayName: f.friendDisplayName,
      profilePicture: f.friendProfilePicture,
      isVerified: f.friendIsVerified,
      bio: f.friendBio,
      country: f.friendCountry,
      status: f.friendLastLogin && new Date(f.friendLastLogin) > new Date(Date.now() - 15 * 60 * 1000) ? 'online' : 'offline',
      lastSeen: f.friendLastLogin || f.friendsSince,
      friendsSince: f.friendsSince,
      currentRoom: null // TODO: Add room status integration
    }));

    res.json(formattedFriends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// Get all users for Find Friends page (exclude current user and existing relationships)
router.get("/discover", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get all existing relationships for current user
    const existingRelationships = await db
      .select({ targetUserId: userRelationships.targetUserId })
      .from(userRelationships)
      .where(eq(userRelationships.userId, userId));

    const existingUserIds = existingRelationships.map(rel => rel.targetUserId);
    
    // Get all users except current user and those with existing relationships
    let query = db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        bio: users.bio,
        country: users.country,
        lastLogin: users.lastLogin
      })
      .from(users)
      .where(and(
        ne(users.id, userId),
        eq(users.status, 'active')
      ));

    const allUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(100); // Limit to prevent overwhelming response

    // Filter out users with existing relationships
    const filteredUsers = allUsers.filter(user => !existingUserIds.includes(user.id));

    res.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for discovery:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get friend suggestions
router.get("/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get users who have mutual friends (simplified version)
    const suggestions = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
        isVerified: users.isVerified,
        bio: users.bio,
        country: users.country
      })
      .from(users)
      .where(and(
        ne(users.id, userId),
        eq(users.status, 'active')
      ))
      .orderBy(desc(users.createdAt))
      .limit(10);

    // For now, add mock mutual friends count
    const formattedSuggestions = suggestions.map(user => ({
      ...user,
      mutualFriends: Math.floor(Math.random() * 5) // TODO: Calculate real mutual friends
    }));

    res.json(formattedSuggestions);
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    res.status(500).json({ error: "Failed to fetch friend suggestions" });
  }
});

// Send friend request
router.post("/request", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: "Target user ID is required" });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    // Check if target user exists
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if relationship already exists
    const existingRelationship = await db
      .select()
      .from(userRelationships)
      .where(and(
        eq(userRelationships.userId, userId),
        eq(userRelationships.targetUserId, targetUserId)
      ))
      .limit(1);

    if (existingRelationship.length > 0) {
      return res.status(400).json({ 
        error: "Relationship already exists",
        type: existingRelationship[0].relationshipType,
        status: existingRelationship[0].status
      });
    }

    // Create friend request
    const [friendRequest] = await db
      .insert(userRelationships)
      .values({
        userId,
        targetUserId,
        relationshipType: 'friend_request',
        status: 'pending'
      })
      .returning();

    res.status(201).json({
      message: "Friend request sent successfully",
      relationship: friendRequest
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Get incoming friend requests (requests sent to current user)
router.get("/requests/incoming", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const incomingRequests = await db
      .select({
        id: userRelationships.id,
        senderId: userRelationships.userId,
        receiverId: userRelationships.targetUserId,
        relationshipType: userRelationships.relationshipType,
        status: userRelationships.status,
        createdAt: userRelationships.createdAt,
        senderUsername: users.username,
        senderDisplayName: users.displayName,
        senderProfilePicture: users.profilePicture,
        senderIsVerified: users.isVerified,
        senderLastLogin: users.lastLogin
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.userId, users.id))
      .where(and(
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .orderBy(desc(userRelationships.createdAt));

    res.json(incomingRequests);
  } catch (error) {
    console.error("Error fetching incoming friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Get friend requests (legacy endpoint for backward compatibility)
router.get("/requests", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const incomingRequests = await db
      .select({
        id: userRelationships.id,
        senderId: userRelationships.userId,
        receiverId: userRelationships.targetUserId,
        status: userRelationships.status,
        createdAt: userRelationships.createdAt,
        senderUsername: users.username,
        senderDisplayName: users.displayName,
        senderProfilePicture: users.profilePicture,
        senderIsVerified: users.isVerified,
        senderLastLogin: users.lastLogin
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.userId, users.id))
      .where(and(
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .orderBy(desc(userRelationships.createdAt));

    res.json(incomingRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Accept friend request
router.post("/requests/:requestId/accept", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get the friend request
    const friendRequest = await db
      .select()
      .from(userRelationships)
      .where(and(
        eq(userRelationships.id, parseInt(requestId)),
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .limit(1);

    if (friendRequest.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    const request = friendRequest[0];

    // Update the original request to accepted friend relationship
    await db
      .update(userRelationships)
      .set({
        relationshipType: 'friend',
        status: 'accepted',
        updatedAt: new Date()
      })
      .where(eq(userRelationships.id, request.id));

    // Create reciprocal friendship
    await db
      .insert(userRelationships)
      .values({
        userId: request.targetUserId,
        targetUserId: request.userId,
        relationshipType: 'friend',
        status: 'accepted'
      });

    res.json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// Reject friend request
router.post("/requests/:requestId/reject", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get the friend request
    const friendRequest = await db
      .select()
      .from(userRelationships)
      .where(and(
        eq(userRelationships.id, parseInt(requestId)),
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .limit(1);

    if (friendRequest.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Reject the request
    await db
      .update(userRelationships)
      .set({
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(userRelationships.id, parseInt(requestId)));

    res.json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

// Remove friend
router.delete("/remove/:friendId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { friendId } = req.params;

    // Remove both directions of the friendship
    await db
      .delete(userRelationships)
      .where(or(
        and(
          eq(userRelationships.userId, userId),
          eq(userRelationships.targetUserId, parseInt(friendId)),
          eq(userRelationships.relationshipType, 'friend')
        ),
        and(
          eq(userRelationships.userId, parseInt(friendId)),
          eq(userRelationships.targetUserId, userId),
          eq(userRelationships.relationshipType, 'friend')
        )
      ));

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

// Get accepted friends with presence and room information
router.get("/accepted", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get accepted friends with their presence information
    const acceptedFriends = await db
      .select({
        relationshipId: userRelationships.id,
        friendId: users.id,
        friendUsername: users.username,
        friendDisplayName: users.displayName,
        friendProfilePicture: users.profilePicture,
        friendIsVerified: users.isVerified,
        friendBio: users.bio,
        friendCountry: users.country,
        friendsSince: userRelationships.createdAt,
        // Presence information
        presenceStatus: userFriendPresence.status,
        currentRoomId: userFriendPresence.currentRoomId,
        lastSeen: userFriendPresence.lastSeen
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.targetUserId, users.id))
      .leftJoin(userFriendPresence, eq(users.id, userFriendPresence.userId))
      .where(and(
        eq(userRelationships.userId, userId),
        eq(userRelationships.relationshipType, 'friend'),
        eq(userRelationships.status, 'accepted')
      ))
      .orderBy(desc(userRelationships.createdAt));

    // Format the response
    const formattedFriends = acceptedFriends.map(f => ({
      id: f.friendId,
      username: f.friendUsername,
      displayName: f.friendDisplayName,
      profilePicture: f.friendProfilePicture,
      isVerified: f.friendIsVerified,
      bio: f.friendBio,
      country: f.friendCountry,
      status: f.presenceStatus || 'offline',
      lastSeen: f.lastSeen || f.friendsSince,
      friendsSince: f.friendsSince,
      currentRoom: f.currentRoomId ? {
        id: f.currentRoomId,
        canJoin: true // TODO: Add room permissions check
      } : null
    }));

    res.json(formattedFriends);
  } catch (error) {
    console.error("Error fetching accepted friends:", error);
    res.status(500).json({ error: "Failed to fetch accepted friends" });
  }
});

// Update user presence status
router.post("/presence", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { status, currentRoomId } = req.body;
    
    if (!status || !['online', 'offline', 'away', 'busy', 'invisible'].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    // Update or insert presence information
    const existingPresence = await db
      .select()
      .from(userFriendPresence)
      .where(eq(userFriendPresence.userId, userId))
      .limit(1);

    if (existingPresence.length > 0) {
      // Update existing presence
      await db
        .update(userFriendPresence)
        .set({
          status,
          currentRoomId: currentRoomId || null,
          lastSeen: new Date(),
          presenceUpdatedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userFriendPresence.userId, userId));
    } else {
      // Insert new presence record
      await db
        .insert(userFriendPresence)
        .values({
          userId,
          status,
          currentRoomId: currentRoomId || null,
          lastSeen: new Date(),
          presenceUpdatedAt: new Date()
        });
    }

    res.json({ 
      message: "Presence updated successfully",
      status,
      currentRoomId: currentRoomId || null
    });
  } catch (error) {
    console.error("Error updating presence:", error);
    res.status(500).json({ error: "Failed to update presence" });
  }
});

// Get user's own presence status
router.get("/presence", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const presence = await db
      .select()
      .from(userFriendPresence)
      .where(eq(userFriendPresence.userId, userId))
      .limit(1);

    if (presence.length === 0) {
      return res.json({
        status: 'offline',
        currentRoomId: null,
        lastSeen: null
      });
    }

    res.json({
      status: presence[0].status,
      currentRoomId: presence[0].currentRoomId,
      lastSeen: presence[0].lastSeen
    });
  } catch (error) {
    console.error("Error fetching presence:", error);
    res.status(500).json({ error: "Failed to fetch presence" });
  }
});

// Call-related endpoints

// Get call history for the user
router.get("/calls/history", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get call logs where user is either caller or callee
    const callHistory = await db
      .select({
        id: callLogs.id,
        callType: callLogs.callType,
        duration: callLogs.duration,
        status: callLogs.status,
        roomId: callLogs.roomId,
        startTime: callLogs.startTime,
        endTime: callLogs.endTime,
        createdAt: callLogs.createdAt,
        // Caller info
        callerId: callLogs.callerId,
        callerUsername: sql<string>`caller.username`,
        callerDisplayName: sql<string>`caller.display_name`,
        callerProfilePicture: sql<string>`caller.profile_picture`,
        // Callee info  
        calleeId: callLogs.calleeId,
        calleeUsername: sql<string>`callee.username`,
        calleeDisplayName: sql<string>`callee.display_name`,
        calleeProfilePicture: sql<string>`callee.profile_picture`
      })
      .from(callLogs)
      .leftJoin(sql`users as caller`, eq(callLogs.callerId, sql`caller.id`))
      .leftJoin(sql`users as callee`, eq(callLogs.calleeId, sql`callee.id`))
      .where(or(
        eq(callLogs.callerId, userId),
        eq(callLogs.calleeId, userId)
      ))
      .orderBy(desc(callLogs.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Format the response
    const formattedCalls = callHistory.map(call => ({
      id: call.id,
      type: call.callType,
      duration: call.duration,
      status: call.status,
      roomId: call.roomId,
      startTime: call.startTime,
      endTime: call.endTime,
      timestamp: call.createdAt,
      // Determine if user was caller or callee and show the other person
      isOutgoing: call.callerId === userId,
      contact: call.callerId === userId ? {
        id: call.calleeId,
        username: call.calleeUsername,
        displayName: call.calleeDisplayName,
        profilePicture: call.calleeProfilePicture
      } : {
        id: call.callerId,
        username: call.callerUsername,
        displayName: call.callerDisplayName,
        profilePicture: call.callerProfilePicture
      }
    }));

    res.json({
      calls: formattedCalls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: callHistory.length === Number(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({ error: "Failed to fetch call history" });
  }
});

// Log a new call
router.post("/calls/log", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { calleeId, callType, duration, status, roomId, startTime, endTime } = req.body;
    
    if (!calleeId || !callType || !['voice', 'video', 'room_call'].includes(callType)) {
      return res.status(400).json({ error: "Valid calleeId and callType are required" });
    }

    if (!status || !['completed', 'missed', 'rejected', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    // Create the call log entry
    const [newCallLog] = await db
      .insert(callLogs)
      .values({
        callerId: userId,
        calleeId: Number(calleeId),
        callType,
        duration: duration || 0,
        status,
        roomId: roomId || null,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null
      })
      .returning();

    res.json({
      message: "Call logged successfully",
      callLog: newCallLog
    });
  } catch (error) {
    console.error("Error logging call:", error);
    res.status(500).json({ error: "Failed to log call" });
  }
});

// Start a call and update presence
router.post("/calls/start", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { calleeId, callType, roomId } = req.body;
    
    if (!calleeId || !callType || !['voice', 'video', 'room_call'].includes(callType)) {
      return res.status(400).json({ error: "Valid calleeId and callType are required" });
    }

    // Update caller's presence to 'busy'
    await db
      .insert(userFriendPresence)
      .values({
        userId,
        status: 'busy',
        currentRoomId: roomId || null,
        lastSeen: new Date(),
        presenceUpdatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: userFriendPresence.userId,
        set: {
          status: 'busy',
          currentRoomId: roomId || null,
          lastSeen: new Date(),
          presenceUpdatedAt: new Date(),
          updatedAt: new Date()
        }
      });

    // Create call log entry for the ongoing call
    const [callLog] = await db
      .insert(callLogs)
      .values({
        callerId: userId,
        calleeId: Number(calleeId),
        callType,
        duration: 0,
        status: 'ongoing',
        roomId: roomId || null,
        startTime: new Date()
      })
      .returning();

    res.json({
      message: "Call started successfully",
      callId: callLog.id,
      status: 'ongoing'
    });
  } catch (error) {
    console.error("Error starting call:", error);
    res.status(500).json({ error: "Failed to start call" });
  }
});

// End a call and update presence
router.post("/calls/end", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { callId, duration, status = 'completed' } = req.body;
    
    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
    }

    if (!['completed', 'missed', 'rejected', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    // Update the call log
    await db
      .update(callLogs)
      .set({
        duration: duration || 0,
        status,
        endTime: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(callLogs.id, Number(callId)),
        or(
          eq(callLogs.callerId, userId),
          eq(callLogs.calleeId, userId)
        )
      ));

    // Update user's presence back to 'online'
    await db
      .update(userFriendPresence)
      .set({
        status: 'online',
        lastSeen: new Date(),
        presenceUpdatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userFriendPresence.userId, userId));

    res.json({
      message: "Call ended successfully",
      callId: Number(callId),
      duration: duration || 0,
      status
    });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({ error: "Failed to end call" });
  }
});

export default router;