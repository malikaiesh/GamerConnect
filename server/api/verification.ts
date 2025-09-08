import express from "express";
import { db } from "../../db";
import { users, rooms, userWallets, gifts, roomGifts } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const verifyUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  isVerified: z.boolean(),
});

const verifyRoomSchema = z.object({
  isVerified: z.boolean(),
});

const updateRoomSeatsSchema = z.object({
  maxSeats: z.number().min(1, "Max seats must be at least 1"),
});

const updateDiamondsSchema = z.object({
  amount: z.number().min(1, "Amount must be positive"),
  operation: z.enum(['add', 'subtract']),
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

// Update room seats
router.post("/room/:roomId/seats", async (req: any, res) => {
  try {
    const { roomId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const validatedData = updateRoomSeatsSchema.parse(req.body);

    const [updatedRoom] = await db
      .update(rooms)
      .set({
        maxSeats: validatedData.maxSeats,
        updatedAt: new Date(),
      })
      .where(eq(rooms.roomId, roomId))
      .returning({
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
      });

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ 
      message: `Room seats updated to ${validatedData.maxSeats} successfully`,
      room: updatedRoom 
    });
  } catch (error) {
    console.error("Error updating room seats:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update room seats" });
  }
});

// Get user wallet information
router.get("/user/:username/wallet", async (req, res) => {
  try {
    const { username } = req.params;
    
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get or create user wallet
    let [wallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, user.id))
      .limit(1);

    if (!wallet) {
      // Create wallet if it doesn't exist
      [wallet] = await db
        .insert(userWallets)
        .values({
          userId: user.id,
          coins: 0,
          diamonds: 0,
          totalCoinsEarned: 0,
          totalDiamondsEarned: 0,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        })
        .returning();
    }

    res.json({
      ...user,
      ...wallet,
    });
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    res.status(500).json({ error: "Failed to fetch user wallet" });
  }
});

// Update user diamonds
router.post("/user/:username/diamonds", async (req: any, res) => {
  try {
    const { username } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const validatedData = updateDiamondsSchema.parse(req.body);

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get or create user wallet
    let [wallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, user.id))
      .limit(1);

    if (!wallet) {
      // Create wallet if it doesn't exist
      [wallet] = await db
        .insert(userWallets)
        .values({
          userId: user.id,
          coins: 0,
          diamonds: 0,
          totalCoinsEarned: 0,
          totalDiamondsEarned: 0,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        })
        .returning();
    }

    // Calculate new diamond amount
    let newDiamonds = wallet.diamonds;
    let newTotalEarned = wallet.totalDiamondsEarned;
    let newTotalSpent = wallet.totalDiamondsSpent;

    if (validatedData.operation === 'add') {
      newDiamonds += validatedData.amount;
      newTotalEarned += validatedData.amount;
    } else {
      // Subtract - ensure we don't go below 0
      if (validatedData.amount > newDiamonds) {
        return res.status(400).json({ 
          error: `Cannot remove ${validatedData.amount} diamonds. User only has ${newDiamonds} diamonds.`
        });
      }
      newDiamonds -= validatedData.amount;
      newTotalSpent += validatedData.amount;
    }

    // Update wallet
    const [updatedWallet] = await db
      .update(userWallets)
      .set({
        diamonds: newDiamonds,
        totalDiamondsEarned: newTotalEarned,
        totalDiamondsSpent: newTotalSpent,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.userId, user.id))
      .returning();

    const operation = validatedData.operation === 'add' ? 'added' : 'removed';
    const preposition = validatedData.operation === 'add' ? 'to' : 'from';
    
    res.json({ 
      message: `Successfully ${operation} ${validatedData.amount} diamonds ${preposition} ${username}'s account`,
      userWallet: {
        ...user,
        ...updatedWallet,
      }
    });
  } catch (error) {
    console.error("Error updating user diamonds:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update user diamonds" });
  }
});

// Get current authenticated user's wallet
router.get("/my-wallet", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user wallet
    let [wallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId))
      .limit(1);

    if (!wallet) {
      // Create wallet if doesn't exist
      [wallet] = await db
        .insert(userWallets)
        .values({
          userId,
          coins: 0,
          diamonds: 0,
          totalCoinsEarned: 0,
          totalDiamondsEarned: 0,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        })
        .returning();
    }

    res.json({ wallet });

  } catch (error) {
    console.error("Error fetching user wallet:", error);
    res.status(500).json({ error: "Failed to fetch user wallet" });
  }
});

// Get user wallet information
router.get("/user/:username/wallet", async (req, res) => {
  try {
    const { username } = req.params;

    // Get user
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user wallet
    let [wallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, user.id))
      .limit(1);

    if (!wallet) {
      // Create wallet if doesn't exist
      [wallet] = await db
        .insert(userWallets)
        .values({
          userId: user.id,
          coins: 0,
          diamonds: 0,
          totalCoinsEarned: 0,
          totalDiamondsEarned: 0,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        })
        .returning();
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isVerified: user.isVerified,
      },
      wallet
    });

  } catch (error) {
    console.error("Error fetching user wallet:", error);
    res.status(500).json({ error: "Failed to fetch user wallet" });
  }
});

// Send gift to user with 40% commission
router.post("/user/:username/gift", async (req: any, res) => {
  try {
    const { username } = req.params;
    const { giftId, quantity = 1, message } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Get recipient user
    const [recipient] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Cannot send gift to yourself
    if (recipient.id === senderId) {
      return res.status(400).json({ error: "Cannot send gift to yourself" });
    }

    // Get gift details
    const [gift] = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift) {
      return res.status(404).json({ error: "Gift not found" });
    }

    if (!gift.isActive) {
      return res.status(400).json({ error: "Gift is not available" });
    }

    // Calculate total cost and 40% commission
    const totalCost = gift.price * quantity;
    const commission = Math.round(totalCost * 0.4); // 40% commission
    const actualCost = totalCost + commission;

    // Get sender's wallet
    let [senderWallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, senderId))
      .limit(1);

    if (!senderWallet) {
      // Create wallet if doesn't exist
      [senderWallet] = await db
        .insert(userWallets)
        .values({
          userId: senderId,
          coins: 0,
          diamonds: 0,
          totalCoinsEarned: 0,
          totalDiamondsEarned: 0,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        })
        .returning();
    }

    // Check if sender has enough diamonds
    if (senderWallet.diamonds < actualCost) {
      return res.status(400).json({
        error: "Insufficient diamonds",
        required: actualCost,
        available: senderWallet.diamonds,
        commission: commission
      });
    }

    // Get or create recipient's wallet
    let [recipientWallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, recipient.id))
      .limit(1);

    if (!recipientWallet) {
      // Create wallet if doesn't exist
      [recipientWallet] = await db
        .insert(userWallets)
        .values({
          userId: recipient.id,
          coins: 0,
          diamonds: 0,
          totalCoinsEarned: 0,
          totalDiamondsEarned: 0,
          totalCoinsSpent: 0,
          totalDiamondsSpent: 0,
        })
        .returning();
    }

    // Record gift transaction (we'll use roomGifts table with null roomId for user gifts)
    const [sentGift] = await db
      .insert(roomGifts)
      .values({
        roomId: null, // null for user-to-user gifts
        senderId,
        recipientId: recipient.id,
        giftId,
        quantity,
        totalValue: totalCost,
        message: message || null
      })
      .returning();

    // Deduct diamonds from sender (including 40% commission)
    await db
      .update(userWallets)
      .set({
        diamonds: sql`${userWallets.diamonds} - ${actualCost}`,
        totalDiamondsSpent: sql`${userWallets.totalDiamondsSpent} + ${actualCost}`
      })
      .where(eq(userWallets.userId, senderId));

    res.status(201).json({
      ...sentGift,
      gift,
      recipient: {
        id: recipient.id,
        username: recipient.username,
        displayName: recipient.displayName
      },
      actualCost,
      commission,
      message: "Gift sent successfully! 40% commission applied."
    });

  } catch (error) {
    console.error("Error sending user gift:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to send gift" });
  }
});

export default router;