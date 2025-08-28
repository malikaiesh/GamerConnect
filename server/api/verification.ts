import express from "express";
import { db } from "../../db";
import { users, rooms } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const verifyUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  isVerified: z.boolean(),
});

const verifyRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"), 
  isVerified: z.boolean(),
});

// Search user by username
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
        bio: users.bio,
        isVerified: users.isVerified,
        verifiedAt: users.verifiedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Search room by room ID
router.get("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const [room] = await db
      .select({
        id: rooms.id,
        roomId: rooms.roomId,
        name: rooms.name,
        description: rooms.description,
        type: rooms.type,
        currentUsers: rooms.currentUsers,
        maxSeats: rooms.maxSeats,
        isVerified: rooms.isVerified,
        verifiedAt: rooms.verifiedAt,
        createdAt: rooms.createdAt,
      })
      .from(rooms)
      .where(eq(rooms.roomId, roomId))
      .limit(1);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Verify/unverify user
router.post("/user/:username", async (req: any, res) => {
  try {
    const { username } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const validatedData = verifyUserSchema.parse(req.body);

    const [updatedUser] = await db
      .update(users)
      .set({
        isVerified: validatedData.isVerified,
        verifiedAt: validatedData.isVerified ? new Date() : null,
        verifiedBy: validatedData.isVerified ? adminId : null,
        updatedAt: new Date(),
      })
      .where(eq(users.username, username))
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        isVerified: users.isVerified,
        verifiedAt: users.verifiedAt,
      });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      message: `User ${validatedData.isVerified ? 'verified' : 'unverified'} successfully`,
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user verification:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update user verification" });
  }
});

// Verify/unverify room
router.post("/room/:roomId", async (req: any, res) => {
  try {
    const { roomId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const validatedData = verifyRoomSchema.parse(req.body);

    const [updatedRoom] = await db
      .update(rooms)
      .set({
        isVerified: validatedData.isVerified,
        verifiedAt: validatedData.isVerified ? new Date() : null,
        verifiedBy: validatedData.isVerified ? adminId : null,
        updatedAt: new Date(),
      })
      .where(eq(rooms.roomId, roomId))
      .returning({
        id: rooms.id,
        roomId: rooms.roomId,
        name: rooms.name,
        isVerified: rooms.isVerified,
        verifiedAt: rooms.verifiedAt,
      });

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ 
      message: `Room ${validatedData.isVerified ? 'verified' : 'unverified'} successfully`,
      room: updatedRoom 
    });
  } catch (error) {
    console.error("Error updating room verification:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update room verification" });
  }
});

// Get verification statistics
router.get("/stats", async (req, res) => {
  try {
    const [verifiedUsersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isVerified, true));

    const [totalUsersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [verifiedRoomsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .where(eq(rooms.isVerified, true));

    const [totalRoomsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms);

    res.json({
      users: {
        verified: verifiedUsersCount.count,
        total: totalUsersCount.count,
      },
      rooms: {
        verified: verifiedRoomsCount.count,
        total: totalRoomsCount.count,
      },
    });
  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({ error: "Failed to fetch verification statistics" });
  }
});

export default router;