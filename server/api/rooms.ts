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
  paymentTransactions,
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

// Payment endpoint for room/seat purchases
router.post("/purchase", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { roomData, paymentMethod } = req.body;
    
    // Validate room data
    if (!roomData || !roomData.maxSeats) {
      return res.status(400).json({ error: "Invalid room data" });
    }

    // Calculate pricing again to verify
    const userRooms = await db.select({ count: count() }).from(rooms).where(eq(rooms.ownerId, userId));
    const userRoomCount = userRooms[0].count;
    
    const requestedMaxSeats = parseInt(roomData.maxSeats) || 5;
    const isAdminUser = (req as any).user?.isAdmin;
    
    let totalCost = 0;
    let costBreakdown = {
      roomCost: 0,
      seatCost: 0,
      description: []
    };

    // Room pricing: First room free, $5 for each additional room
    if (!isAdminUser && userRoomCount >= 1) {
      costBreakdown.roomCost = 500; // $5.00 in cents
      costBreakdown.description.push(`Additional room: $5.00`);
    }

    // Seat pricing: $1 per seat beyond 5 seats
    if (requestedMaxSeats > 5) {
      const extraSeats = requestedMaxSeats - 5;
      costBreakdown.seatCost = extraSeats * 100; // $1.00 per seat in cents
      costBreakdown.description.push(`${extraSeats} extra seats: $${extraSeats}.00`);
    }

    totalCost = costBreakdown.roomCost + costBreakdown.seatCost;

    if (totalCost === 0) {
      return res.status(400).json({ error: "No payment required for this room configuration" });
    }

    // Create payment transaction record
    const transactionId = `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [transaction] = await db
      .insert(paymentTransactions)
      .values({
        transactionId: transactionId,
        gatewayId: paymentMethod?.gatewayId || 1, // Default to first gateway
        userId: userId,
        amount: totalCost,
        currency: 'USD',
        status: 'completed', // For now, assume payment is completed
        metadata: {
          type: 'room_purchase',
          roomData: roomData,
          costBreakdown: costBreakdown,
          createdVia: 'room_purchase'
        }
      })
      .returning();

    // Now create the room since payment is "completed"
    const roomId = await generateRoomId();
    const validatedRoomData = {
      ...roomData,
      roomId,
      ownerId: userId,
      backgroundTheme: roomData.backgroundTheme || 'lunexa',
      maxSeats: requestedMaxSeats
    };

    const validatedData = insertRoomSchema.parse(validatedRoomData);
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

    res.json({ 
      success: true, 
      room: newRoom, 
      transaction: transaction,
      totalPaid: totalCost / 100 
    });

  } catch (error) {
    console.error("Error processing room purchase:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

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

// Get deleted rooms (for admin recovery) - MUST BE BEFORE parameterized routes
router.get("/deleted", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const isAdminUser = (req as any).user?.isAdmin;
    
    if (!isAdminUser) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const deletedRooms = await db
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
      .where(sql`${rooms.deletedAt} IS NOT NULL`)
      .orderBy(desc(rooms.deletedAt));

    res.json(deletedRooms);
  } catch (error) {
    console.error("Error fetching deleted rooms:", error);
    res.status(500).json({ error: "Failed to fetch deleted rooms" });
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
      .where(and(eq(rooms.ownerId, userId), sql`${rooms.deletedAt} IS NULL`))
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
          profilePicture: users.profilePicture,
          isVerified: users.isVerified
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

// Admin create room endpoint (bypasses payment logic)
router.post("/admin/create", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { name, description, category, maxUsers, isPrivate, requiresVerification, allowGuests, moderationLevel } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // Generate unique room ID
    const roomId = await generateRoomId();
    
    // Prepare room data for admin creation (bypass payment logic)
    const roomData = {
      roomId,
      name: name.trim(),
      description: description || null,
      category: category || 'general',
      type: isPrivate ? 'private' : 'public',
      maxSeats: maxUsers || 50,
      ownerId: userId,
      status: 'active',
      language: 'en',
      isLocked: false,
      isFeatured: false,
      requiresVerification: requiresVerification || false,
      allowGuests: allowGuests !== false, // default to true
      moderationLevel: moderationLevel || 'standard',
      backgroundTheme: 'lunexa'
    };

    const validatedData = insertRoomSchema.parse(roomData);
    const [newRoom] = await db.insert(rooms).values(validatedData).returning();

    // Add owner as room user
    await db.insert(roomUsers).values({
      roomId: newRoom.id,
      userId,
      role: 'owner',
      seatNumber: 1,
      isActive: true,
      isMicOn: false,
      isMuted: false
    });

    // Initialize room analytics
    await db.insert(roomAnalytics).values({
      roomId: newRoom.id,
      date: new Date(),
      totalVisits: 0,
      uniqueVisitors: 0,
      peakConcurrentUsers: 1,
      averageSessionDuration: 0,
      totalMessages: 0,
      totalGifts: 0,
      totalGiftValue: 0
    });

    res.json({ 
      success: true, 
      room: newRoom,
      message: "Room created successfully"
    });

  } catch (error) {
    console.error("Error creating admin room:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Create new room
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check user's existing rooms count
    const userRooms = await db.select({ count: count() }).from(rooms).where(eq(rooms.ownerId, userId));
    const userRoomCount = userRooms[0].count;

    // Enforce room creation limits: 1 free room, max 5 total
    if (userRoomCount >= 5) {
      return res.status(403).json({ 
        error: "Maximum room limit reached", 
        details: "You can only create a maximum of 5 rooms. Contact support for higher limits." 
      });
    }

    // Calculate pricing for room and seats
    const requestedMaxSeats = parseInt(req.body.maxSeats) || 5;
    if (requestedMaxSeats < 2 || requestedMaxSeats > 20) {
      return res.status(400).json({ 
        error: "Invalid seat limit", 
        details: "Room must have between 2-20 seats" 
      });
    }

    // Pricing calculation
    const isAdminUser = (req as any).user?.isAdmin;
    let totalCost = 0;
    let costBreakdown = {
      roomCost: 0,
      seatCost: 0,
      description: []
    };

    // Room pricing: First room free, $5 for each additional room
    if (!isAdminUser && userRoomCount >= 1) {
      costBreakdown.roomCost = 500; // $5.00 in cents
      costBreakdown.description.push(`Additional room: $5.00`);
    }

    // Seat pricing: $1 per seat beyond 5 seats
    if (requestedMaxSeats > 5) {
      const extraSeats = requestedMaxSeats - 5;
      costBreakdown.seatCost = extraSeats * 100; // $1.00 per seat in cents
      costBreakdown.description.push(`${extraSeats} extra seats: $${extraSeats}.00`);
    }

    totalCost = costBreakdown.roomCost + costBreakdown.seatCost;

    // If payment is required, return pricing info instead of blocking
    if (!isAdminUser && totalCost > 0) {
      return res.status(402).json({ 
        error: "Payment required", 
        details: `Total cost: $${(totalCost / 100).toFixed(2)}`,
        requiresPayment: true,
        pricing: {
          totalCost,
          costBreakdown,
          currency: "USD"
        },
        redirectTo: "/checkout"
      });
    }

    // Generate unique room ID
    const roomId = await generateRoomId();

    // Set validated room data
    const roomData = {
      ...req.body,
      roomId,
      ownerId: userId,
      // Default theme to Lunexa
      backgroundTheme: req.body.backgroundTheme || 'lunexa',
      // Use validated maxSeats value
      maxSeats: requestedMaxSeats
    };

    const validatedData = insertRoomSchema.parse(roomData);

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

// Soft delete room (updated to use deletedAt)
router.delete("/:roomId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;
    const isAdminUser = (req as any).user?.isAdmin;

    // Get room first (only non-deleted rooms)
    const room = await db.select().from(rooms)
      .where(and(eq(rooms.roomId, roomId), sql`${rooms.deletedAt} IS NULL`))
      .limit(1);
    
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user is owner or admin
    if (room[0].ownerId !== userId && !isAdminUser) {
      return res.status(403).json({ error: "Not authorized to delete this room" });
    }

    // Soft delete by setting deletedAt timestamp
    await db.update(rooms)
      .set({ deletedAt: new Date() })
      .where(eq(rooms.id, room[0].id));

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
        eq(rooms.status, 'active'),
        sql`${rooms.deletedAt} IS NULL`
      ));

    // Add search filter
    const conditions = [
      eq(rooms.type, 'public'), 
      eq(rooms.status, 'active'),
      sql`${rooms.deletedAt} IS NULL`
    ];
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

    // If room is now empty, clear all messages
    if (currentUsers[0].count === 0) {
      await db.delete(roomMessages).where(eq(roomMessages.roomId, room[0].id));
    }

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
      message: msg.room_messages.message,
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

// Toggle mic status endpoint
router.post("/:roomId/toggle-mic", isAuthenticated, async (req: Request, res: Response) => {
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
      return res.status(400).json({ error: "User not in room" });
    }

    // Toggle mic status
    const currentMicStatus = userInRoom[0].isMicOn;
    await db.update(roomUsers)
      .set({ isMicOn: !currentMicStatus })
      .where(
        and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, userId))
      );

    res.json({ 
      message: "Mic status toggled successfully", 
      isMicOn: !currentMicStatus 
    });
  } catch (error) {
    console.error("Error toggling mic:", error);
    res.status(500).json({ error: "Failed to toggle mic status" });
  }
});

// Send gift in room with 40% commission
router.post("/:roomId/gifts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { giftId, recipientId, quantity = 1, message } = req.body;
    const senderId = (req as any).user?.id;

    if (!senderId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get room
    const room = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1);
    if (room.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if gifts are enabled in room
    if (!room[0].giftsEnabled) {
      return res.status(403).json({ error: "Gifts are disabled in this room" });
    }

    // Check if sender is in room
    const senderInRoom = await db.select().from(roomUsers).where(
      and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, senderId))
    ).limit(1);

    if (senderInRoom.length === 0) {
      return res.status(403).json({ error: "Must be in room to send gifts" });
    }

    // Get gift details
    const gift = await db.select().from(gifts).where(eq(gifts.id, giftId)).limit(1);
    if (gift.length === 0) {
      return res.status(404).json({ error: "Gift not found" });
    }

    if (!gift[0].isActive) {
      return res.status(400).json({ error: "Gift is not available" });
    }

    // Room owners can now send gifts in their own rooms if they have diamonds

    // Calculate total cost (100% deduction from sender)
    const totalCost = gift[0].price * quantity;
    const actualCost = totalCost; // 100% deduction from sender
    
    // For room gifts (not direct to user), no diamonds go to room admin
    // For direct user gifts, 50% goes to recipient
    const recipientReward = recipientId ? Math.round(totalCost * 0.5) : 0;

    // Get sender's wallet
    let [senderWallet] = await db.select().from(userWallets).where(eq(userWallets.userId, senderId)).limit(1);
    
    if (!senderWallet) {
      // Create wallet if doesn't exist
      [senderWallet] = await db.insert(userWallets).values({
        userId: senderId,
        coins: 0,
        diamonds: 0,
        totalCoinsEarned: 0,
        totalDiamondsEarned: 0,
        totalCoinsSpent: 0,
        totalDiamondsSpent: 0,
      }).returning();
    }

    // Check if user has received gifts before (can send gifts only if they received some)
    const receivedGifts = await db.select({ count: sql`count(*)` })
      .from(roomGifts)
      .where(eq(roomGifts.recipientId, senderId));
    
    if (receivedGifts[0].count === '0') {
      return res.status(403).json({ 
        error: "You must receive gifts from other users before you can send gifts"
      });
    }

    // Check if sender has enough diamonds
    if (senderWallet.diamonds < actualCost) {
      return res.status(400).json({ 
        error: "Insufficient diamonds", 
        required: actualCost,
        available: senderWallet.diamonds
      });
    }

    // If recipient specified, check if they're in room
    if (recipientId) {
      const recipientInRoom = await db.select().from(roomUsers).where(
        and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, recipientId))
      ).limit(1);

      if (recipientInRoom.length === 0) {
        return res.status(403).json({ error: "Recipient must be in room" });
      }
    }

    // Start transaction for gift sending
    const [sentGift] = await db.insert(roomGifts).values({
      roomId: room[0].id,
      senderId,
      recipientId: recipientId || null,
      giftId,
      quantity,
      totalValue: totalCost,
      message: message || null
    }).returning();

    // Deduct 100% diamonds from sender
    await db.update(userWallets)
      .set({ 
        diamonds: sql`${userWallets.diamonds} - ${actualCost}`,
        totalDiamondsSpent: sql`${userWallets.totalDiamondsSpent} + ${actualCost}`
      })
      .where(eq(userWallets.userId, senderId));

    // Add 50% diamonds to recipient if specified
    if (recipientId) {
      // Get or create recipient's wallet
      let [recipientWallet] = await db.select().from(userWallets).where(eq(userWallets.userId, recipientId)).limit(1);
      
      if (!recipientWallet) {
        // Create wallet if doesn't exist
        await db.insert(userWallets).values({
          userId: recipientId,
          coins: 0,
          diamonds: recipientReward,
          totalCoinsEarned: 0,
          totalDiamondsEarned: recipientReward,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        });
      } else {
        // Update existing wallet
        await db.update(userWallets)
          .set({ 
            diamonds: sql`${userWallets.diamonds} + ${recipientReward}`,
            totalDiamondsEarned: sql`${userWallets.totalDiamondsEarned} + ${recipientReward}`
          })
          .where(eq(userWallets.userId, recipientId));
      }
    }

    // Update sender's gift statistics
    await db.update(roomUsers)
      .set({ giftsSent: sql`${roomUsers.giftsSent} + ${quantity}` })
      .where(and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, senderId)));

    // Update recipient's gift statistics if specified
    if (recipientId) {
      await db.update(roomUsers)
        .set({ giftsReceived: sql`${roomUsers.giftsReceived} + ${quantity}` })
        .where(and(eq(roomUsers.roomId, room[0].id), eq(roomUsers.userId, recipientId)));
    }

    // Update room analytics
    await db.update(roomAnalytics)
      .set({
        totalGifts: sql`${roomAnalytics.totalGifts} + ${quantity}`,
        totalGiftValue: sql`${roomAnalytics.totalGiftValue} + ${totalCost}`
      })
      .where(eq(roomAnalytics.roomId, room[0].id));

    const responseMessage = recipientId 
      ? "Gift sent successfully! 100% deducted from sender, 50% rewarded to recipient."
      : "Gift sent to room successfully! 100% deducted from sender, no diamonds to room admin.";

    res.status(201).json({
      ...sentGift,
      gift: gift[0],
      actualCost,
      recipientReward,
      platformCommission: totalCost - recipientReward,
      message: responseMessage
    });

  } catch (error) {
    console.error("Error sending gift:", error);
    res.status(500).json({ error: "Failed to send gift" });
  }
});

// Route moved above to avoid conflicts

// Recover a deleted room
router.post("/:roomId/recover", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;
    const isAdminUser = (req as any).user?.isAdmin;

    if (!isAdminUser) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get deleted room
    const deletedRoom = await db.select().from(rooms)
      .where(and(eq(rooms.roomId, roomId), sql`${rooms.deletedAt} IS NOT NULL`))
      .limit(1);
    
    if (deletedRoom.length === 0) {
      return res.status(404).json({ error: "Deleted room not found" });
    }

    // Recover room by clearing deletedAt
    await db.update(rooms)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(rooms.id, deletedRoom[0].id));

    res.json({ message: "Room recovered successfully" });
  } catch (error) {
    console.error("Error recovering room:", error);
    res.status(500).json({ error: "Failed to recover room" });
  }
});

// Permanently delete a room
router.delete("/:roomId/permanent-delete", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;
    const isAdminUser = (req as any).user?.isAdmin;

    if (!isAdminUser) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get deleted room (only already soft-deleted rooms can be permanently deleted)
    const deletedRoom = await db.select().from(rooms)
      .where(and(eq(rooms.roomId, roomId), sql`${rooms.deletedAt} IS NOT NULL`))
      .limit(1);
    
    if (deletedRoom.length === 0) {
      return res.status(404).json({ error: "Deleted room not found" });
    }

    // Hard delete the room permanently
    await db.delete(rooms).where(eq(rooms.id, deletedRoom[0].id));

    res.json({ message: "Room permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting room:", error);
    res.status(500).json({ error: "Failed to permanently delete room" });
  }
});

export { router as roomsRouter };