import { Router } from "express";
import { db } from "../../db";
import {
  rooms,
  roomUsers,
  roomMessages,
  gifts,
  roomGifts,
  userWallets,
  userRelationships,
  roomAnalytics,
  users,
  insertRoomSchema,
  insertRoomUserSchema,
  insertRoomMessageSchema,
  insertGiftSchema,
  insertRoomGiftSchema,
  type Room,
  type RoomUser,
  type Gift,
  type RoomMessage
} from "@shared/schema";
import { eq, desc, and, sql, count, gte, sum, asc } from "drizzle-orm";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { z } from "zod";
import { Request, Response } from "express";

const router = Router();

// Generate unique room ID with SA or MAB prefix and sequential numbering
async function generateRoomId(prefix?: 'SA' | 'MAB'): Promise<string> {
  try {
    // Alternate between SA and MAB if no prefix specified
    if (!prefix) {
      const totalRooms = await db.select({ count: count() }).from(rooms);
      prefix = totalRooms[0].count % 2 === 0 ? 'SA' : 'MAB';
    }
    
    // Get ALL room IDs for the specified prefix to find the highest
    const existingRooms = await db
      .select({ roomId: rooms.roomId })
      .from(rooms)
      .where(sql`${rooms.roomId} LIKE ${`${prefix}%`}`);

    let nextNumber = 1994181; // Starting number
    
    if (existingRooms.length > 0) {
      // Extract all numbers and find the maximum
      const numbers = existingRooms
        .map(room => {
          const numStr = room.roomId.substring(prefix.length);
          const num = parseInt(numStr);
          return isNaN(num) ? 0 : num;
        })
        .filter(num => num >= 1994181); // Only consider valid sequence numbers
        
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }
    }
    
    // Double check uniqueness
    let attempts = 0;
    let candidateId = `${prefix}${nextNumber}`;
    
    while (attempts < 10) {
      const existing = await db
        .select({ roomId: rooms.roomId })
        .from(rooms)
        .where(eq(rooms.roomId, candidateId))
        .limit(1);
        
      if (existing.length === 0) {
        return candidateId;
      }
      
      nextNumber++;
      candidateId = `${prefix}${nextNumber}`;
      attempts++;
    }
    
    return candidateId;
  } catch (error) {
    console.error("Error generating room ID:", error);
    // Fallback to timestamp-based ID if query fails
    const timestamp = Date.now().toString().slice(-7);
    const fallbackPrefix = prefix || 'SA';
    return `${fallbackPrefix}${timestamp}`;
  }
}

// Get all rooms for admin (paginated)
router.get("/admin", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const verified = req.query.verified as string;
    const newRooms = req.query.newRooms as string;

    const offset = (page - 1) * limit;

    let query = db
      .select({
        room: rooms,
        owner: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profilePicture: users.profilePicture,
          isVerified: users.isVerified
        }
      })
      .from(rooms)
      .innerJoin(users, eq(rooms.ownerId, users.id));

    // Add filters
    const conditions = [];
    if (search) {
      conditions.push(
        sql`${rooms.name} ILIKE ${`%${search}%`} OR ${rooms.roomId} ILIKE ${`%${search}%`}`
      );
    }
    if (status) {
      conditions.push(eq(rooms.status, status as any));
    }
    if (type) {
      conditions.push(eq(rooms.type, type as any));
    }
    if (verified) {
      conditions.push(eq(rooms.isVerified, verified === 'true'));
    }
    if (newRooms) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (newRooms === 'true') {
        // Show rooms created in last 24 hours
        conditions.push(gte(rooms.createdAt, yesterday));
      } else if (newRooms === 'false') {
        // Show rooms older than 24 hours
        conditions.push(sql`${rooms.createdAt} < ${yesterday}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const roomsData = await query
      .orderBy(desc(rooms.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(rooms);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalCount = await countQuery;

    res.json({
      rooms: roomsData,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching admin rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Get user's rooms (for user dashboard)
router.get("/my-rooms", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userRooms = await db
      .select({
        room: rooms,
        userCount: sql<number>`(SELECT COUNT(*) FROM ${roomUsers} WHERE ${roomUsers.roomId} = ${rooms.id} AND ${roomUsers.status} = 'active')`
      })
      .from(rooms)
      .where(eq(rooms.ownerId, userId))
      .orderBy(desc(rooms.lastActivity));

    res.json(userRooms);
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ error: "Failed to fetch user rooms" });
  }
});

// Get room details by ID
router.get("/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const roomData = await db
      .select({
        room: rooms,
        owner: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profilePicture: users.profilePicture,
          isVerified: users.isVerified
        }
      })
      .from(rooms)
      .innerJoin(users, eq(rooms.ownerId, users.id))
      .where(eq(rooms.roomId, roomId))
      .limit(1);

    if (roomData.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Get current users in room
    const roomUsersData = await db
      .select({
        id: roomUsers.id,
        seatNumber: roomUsers.seatNumber,
        role: roomUsers.role,
        isMuted: roomUsers.isMuted,
        isMicOn: roomUsers.isMicOn,
        isActive: roomUsers.isActive,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profilePicture: users.profilePicture
        }
      })
      .from(roomUsers)
      .innerJoin(users, eq(roomUsers.userId, users.id))
      .where(and(
        eq(roomUsers.roomId, roomData[0].room.id),
        eq(roomUsers.isActive, true)
      ))
      .orderBy(asc(roomUsers.seatNumber));

    res.json({
      room: roomData[0].room,
      owner: roomData[0].owner,
      users: roomUsersData
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Create new room
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Generate unique room ID
    const roomId = await generateRoomId();

    const validatedData = insertRoomSchema.parse({
      ...req.body,
      roomId,
      ownerId: userId
    });

    const [newRoom] = await db.insert(rooms).values(validatedData).returning();

    // Add owner as room user
    await db.insert(roomUsers).values({
      roomId: newRoom.id,
      userId,
      role: 'owner',
      seatNumber: 1
    });

    // Initialize room analytics
    await db.insert(roomAnalytics).values({
      roomId: newRoom.id,
      date: new Date()
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Update room
router.patch("/:roomId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;
    const isAdminUser = (req as any).user?.isAdmin;

    // Get room first
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is owner or admin
    if (room[0].ownerId !== userId && !isAdminUser) {
      return res.status(403).json({ error: "Not authorized to update this room" });
    }

    const updateData = insertRoomSchema.partial().parse(req.body);
    delete (updateData as any).roomId; // Don't allow changing roomId
    delete (updateData as any).ownerId; // Don't allow changing owner through this endpoint

    const [updatedRoom] = await db
      .update(rooms)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(rooms.id, room[0].id))
      .returning();

    res.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update room" });
  }
});

// Delete room
router.delete("/:roomId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;
    const isAdminUser = (req as any).user?.isAdmin;

    // Get room first
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is owner or admin
    if (room[0].ownerId !== userId && !isAdminUser) {
      return res.status(403).json({ error: "Not authorized to delete this room" });
    }

    await db.delete(rooms).where(eq(rooms.id, room[0].id));

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

// Get public rooms for explore page
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string; // hot, trending, explore, new
    const country = req.query.country as string;
    const search = req.query.search as string;

    const offset = (page - 1) * limit;

    let query = db
      .select({
        room: {
          id: rooms.id,
          roomId: rooms.roomId,
          name: rooms.name,
          description: rooms.description,
          type: rooms.type,
          status: rooms.status,
          maxSeats: rooms.maxSeats,
          currentUsers: rooms.currentUsers,
          category: rooms.category,
          country: rooms.country,
          language: rooms.language,
          isLocked: rooms.isLocked,
          isFeatured: rooms.isFeatured,
          isVerified: rooms.isVerified,
          voiceChatEnabled: rooms.voiceChatEnabled,
          textChatEnabled: rooms.textChatEnabled,
          giftsEnabled: rooms.giftsEnabled,
          backgroundTheme: rooms.backgroundTheme,
          tags: rooms.tags,
          totalVisits: rooms.totalVisits,
          totalGiftsReceived: rooms.totalGiftsReceived,
          totalGiftValue: rooms.totalGiftValue,
          createdAt: rooms.createdAt,
          lastActivity: rooms.updatedAt
        },
        userCount: sql<number>`(SELECT COUNT(*) FROM ${roomUsers} WHERE ${roomUsers.roomId} = ${rooms.id})`,
        owner: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profilePicture: users.profilePicture,
          isVerified: users.isVerified
        }
      })
      .from(rooms)
      .innerJoin(users, eq(rooms.ownerId, users.id))
      .where(and(
        eq(rooms.type, 'public'),
        eq(rooms.status, 'active')
      ));

    // Add search filter
    const conditions = [eq(rooms.type, 'public'), eq(rooms.status, 'active')];
    if (search) {
      conditions.push(
        sql`${rooms.name} ILIKE ${`%${search}%`} OR ${rooms.roomId} ILIKE ${`%${search}%`}`
      );
    }
    if (country) {
      conditions.push(eq(rooms.country, country));
    }

    query = query.where(and(...conditions));

    // Apply category-specific sorting
    switch (category) {
      case 'hot':
        // Hot rooms: most active users right now
        query = query
          .orderBy(desc(sql<number>`(SELECT COUNT(*) FROM ${roomUsers} WHERE ${roomUsers.roomId} = ${rooms.id})`), desc(rooms.createdAt))
          .limit(Math.min(limit, 20));
        break;
      case 'trending':
        // Trending: rooms with recent growth in users/activity
        query = query
          .orderBy(desc(sql<number>`(SELECT COUNT(*) FROM ${roomUsers} WHERE ${roomUsers.roomId} = ${rooms.id})`), desc(rooms.updatedAt))
          .limit(Math.min(limit, 20));
        break;
      case 'new':
        // New rooms: recently created
        query = query
          .orderBy(desc(rooms.createdAt))
          .limit(Math.min(limit, 20));
        break;
      case 'verified':
        // Verified rooms: only show rooms that are verified
        query = query
          .where(and(...conditions, eq(rooms.isVerified, true)))
          .orderBy(desc(rooms.isFeatured), desc(sql<number>`(SELECT COUNT(*) FROM ${roomUsers} WHERE ${roomUsers.roomId} = ${rooms.id})`), desc(rooms.createdAt))
          .limit(Math.min(limit, 20));
        break;
      case 'explore':
      default:
        // Explore: mix of popular and interesting rooms
        query = query
          .orderBy(desc(rooms.createdAt), desc(sql<number>`(SELECT COUNT(*) FROM ${roomUsers} WHERE ${roomUsers.roomId} = ${rooms.id})`))
          .limit(Math.min(limit, 20));
        break;
    }

    const publicRooms = await query.offset(offset);

    // Return the properly structured response
    const totalCount = await db.select({ count: count() }).from(rooms)
      .where(and(
        eq(rooms.type, 'public'),
        eq(rooms.status, 'active')
      ));

    res.json({
      rooms: publicRooms,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        hasMore: publicRooms.length === limit
      }
    });
  } catch (error) {
    console.error("Error fetching public rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Auto-join room when user enters
router.post("/:roomId/auto-join", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is already in room
    const existingUser = await db.select().from(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
    ).limit(1);

    if (existingUser.length > 0) {
      return res.json({ message: "Already in room", alreadyJoined: true });
    }

    // Check room capacity
    const currentUsers = await db.select({ count: count() }).from(roomUsers)
      .where(eq(roomUsers.roomId, room[0].id));
    
    if (currentUsers[0].count >= room[0].maxUsers) {
      return res.status(400).json({ error: "Room is full" });
    }

    // Add user to room
    await db.insert(roomUsers).values({
      roomId: room[0].id,
      userId,
      joinedAt: new Date(),
      seat: null,
      status: 'active'
    });

    res.json({ message: "Joined room successfully", joined: true });
  } catch (error) {
    console.error("Error auto-joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
});

// Switch seat endpoint
router.post("/:roomId/switch-seat", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { seatNumber } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is in room
    const userInRoom = await db.select().from(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
    ).limit(1);

    if (userInRoom.length === 0) {
      return res.status(400).json({ error: "User not in room" });
    }

    // Check if seat is available
    if (seatNumber !== null) {
      const seatTaken = await db.select().from(roomUsers).where(
        and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.seatNumber, seatNumber))
      ).limit(1);

      if (seatTaken.length > 0) {
        return res.status(400).json({ error: "Seat is already taken" });
      }
    }

    // Update user's seat
    await db.update(roomUsers)
      .set({ seatNumber: seatNumber })
      .where(
        and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
      );

    res.json({ message: "Seat switched successfully" });
  } catch (error) {
    console.error("Error switching seat:", error);
    res.status(500).json({ error: "Failed to switch seat" });
  }
});

// Get room statistics for dashboard
router.get("/stats/overview", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const [totalRoomsResult] = await db.select({ count: count() }).from(rooms);
    const [activeRoomsResult] = await db.select({ count: count() }).from(rooms).where(eq(rooms.status, 'active'));
    const [publicRoomsResult] = await db.select({ count: count() }).from(rooms).where(eq(rooms.type, 'public'));
    const [privateRoomsResult] = await db.select({ count: count() }).from(rooms).where(eq(rooms.type, 'private'));
    const [verifiedRoomsResult] = await db.select({ count: count() }).from(rooms).where(eq(rooms.isVerified, true));
    
    // Get newly created rooms (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const [newRoomsResult] = await db.select({ count: count() }).from(rooms).where(gte(rooms.createdAt, yesterday));

    // Get recent room activity
    const recentRooms = await db
      .select({
        room: rooms,
        owner: {
          username: users.username,
          displayName: users.displayName
        }
      })
      .from(rooms)
      .innerJoin(users, eq(rooms.ownerId, users.id))
      .orderBy(desc(rooms.createdAt))
      .limit(5);

    res.json({
      totalRooms: totalRoomsResult.count,
      activeRooms: activeRoomsResult.count,
      publicRooms: publicRoomsResult.count,
      privateRooms: privateRoomsResult.count,
      verifiedRooms: verifiedRoomsResult.count,
      newRooms: newRoomsResult.count,
      recentRooms
    });
  } catch (error) {
    console.error("Error fetching room stats:", error);
    res.status(500).json({ error: "Failed to fetch room statistics" });
  }
});

// Join room endpoint
router.post("/:roomId/join", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { seatNumber } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user already in room
    const existingUser = await db.select().from(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
    ).limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Already in room" });
    }

    // Check room capacity
    const currentUsers = await db.select({ count: count() }).from(roomUsers)
      .where(and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.isActive, true)));
    
    if (currentUsers[0].count >= room[0].maxSeats) {
      return res.status(400).json({ error: "Room is full" });
    }

    // Find available seat if not specified
    let finalSeatNumber = seatNumber;
    if (!finalSeatNumber) {
      const occupiedSeats = await db.select({ seatNumber: roomUsers.seatNumber })
        .from(roomUsers)
        .where(and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.isActive, true)));
      
      const occupied = occupiedSeats.map(s => s.seatNumber).filter(Boolean);
      for (let i = 1; i <= room[0].maxSeats; i++) {
        if (!occupied.includes(i)) {
          finalSeatNumber = i;
          break;
        }
      }
    }

    // Check if seat is occupied
    if (finalSeatNumber) {
      const seatTaken = await db.select().from(roomUsers).where(
        and(
          eq(roomUsers.roomId, room[0].id),
          eq(roomUsers.seatNumber, finalSeatNumber),
          eq(roomUsers.isActive, true)
        )
      ).limit(1);

      if (seatTaken.length > 0) {
        return res.status(400).json({ error: "Seat is already taken" });
      }
    }

    // Join room
    await db.insert(roomUsers).values({
      roomId: room[0].id,
      userId,
      seatNumber: finalSeatNumber,
      role: 'member'
    });

    // Update room current users count
    await db.update(rooms)
      .set({ currentUsers: currentUsers[0].count + 1, lastActivity: new Date() })
      .where(eq(rooms.id, room[0].id));

    res.json({ message: "Joined room successfully", seatNumber: finalSeatNumber });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
});

// Leave room endpoint
router.post("/:roomId/leave", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Remove user from room
    await db.delete(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
    );

    // Update room current users count
    const currentUsers = await db.select({ count: count() }).from(roomUsers)
      .where(and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.isActive, true)));
    
    await db.update(rooms)
      .set({ currentUsers: currentUsers[0].count, lastActivity: new Date() })
      .where(eq(rooms.id, room[0].id));

    res.json({ message: "Left room successfully" });
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({ error: "Failed to leave room" });
  }
});

// Send message endpoint
router.post("/:roomId/messages", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { message, messageType = 'text' } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is in room
    const userInRoom = await db.select().from(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
    ).limit(1);

    if (userInRoom.length === 0) {
      return res.status(403).json({ error: "Must be in room to send messages" });
    }

    if (!room[0].textChatEnabled) {
      return res.status(403).json({ error: "Text chat is disabled in this room" });
    }

    // Create message
    const [newMessage] = await db.insert(roomMessages).values({
      roomId: room[0].id,
      userId,
      message: message.trim(),
      messageType
    }).returning();

    // Update user message count
    await db.update(roomUsers)
      .set({ messagesCount: sql`${roomUsers.messagesCount} + 1` })
      .where(and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId)));

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get room messages endpoint
router.get("/:roomId/messages", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is in room
    const userInRoom = await db.select().from(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
    ).limit(1);

    if (userInRoom.length === 0) {
      return res.status(403).json({ error: "Must be in room to view messages" });
    }

    // Get recent messages
    const messages = await db
      .select()
      .from(roomMessages)
      .innerJoin(users, eq(roomMessages.userId, users.id))
      .where(eq(roomMessages.roomId, room[0].id))
      .orderBy(desc(roomMessages.createdAt))
      .limit(50);

    // Transform messages to include user object
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg.room_messages.id,
      message: msg.room_messages.content,
      messageType: msg.room_messages.messageType,
      createdAt: msg.room_messages.createdAt,
      user: {
        id: msg.users.id,
        username: msg.users.username,
        displayName: msg.users.displayName
      }
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export { router as roomsRouter };