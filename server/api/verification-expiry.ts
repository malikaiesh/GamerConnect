import express from "express";
import { db } from "@db";
import { users, rooms } from "@shared/schema";
import { eq, and, lt, isNotNull } from "drizzle-orm";

const router = express.Router();

// Function to check and remove expired verifications
export async function checkAndRemoveExpiredVerifications() {
  const now = new Date();
  
  try {
    // Remove expired user verifications
    const expiredUsers = await db
      .update(users)
      .set({
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null,
        verificationExpiresAt: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(users.isVerified, true),
          isNotNull(users.verificationExpiresAt),
          lt(users.verificationExpiresAt, now)
        )
      )
      .returning({
        id: users.id,
        username: users.username,
      });

    // Remove expired room verifications
    const expiredRooms = await db
      .update(rooms)
      .set({
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null,
        verificationExpiresAt: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(rooms.isVerified, true),
          isNotNull(rooms.verificationExpiresAt),
          lt(rooms.verificationExpiresAt, now)
        )
      )
      .returning({
        id: rooms.id,
        roomId: rooms.roomId,
        name: rooms.name,
      });

    console.log(`🔄 Verification expiry check completed at ${now.toISOString()}`);
    console.log(`📋 Expired user verifications removed: ${expiredUsers.length}`);
    console.log(`🏠 Expired room verifications removed: ${expiredRooms.length}`);

    if (expiredUsers.length > 0) {
      console.log(`👤 Expired users: ${expiredUsers.map(u => u.username).join(', ')}`);
    }
    if (expiredRooms.length > 0) {
      console.log(`🏠 Expired rooms: ${expiredRooms.map(r => `${r.name} (${r.roomId})`).join(', ')}`);
    }

    return {
      timestamp: now,
      expiredUsers: expiredUsers.length,
      expiredRooms: expiredRooms.length,
      users: expiredUsers,
      rooms: expiredRooms,
    };

  } catch (error) {
    console.error("❌ Error checking expired verifications:", error);
    throw error;
  }
}

// Manual endpoint to trigger expiration check (admin only)
router.post("/check-expired", async (req: any, res) => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const result = await checkAndRemoveExpiredVerifications();
    
    res.json({
      message: "Expiration check completed successfully",
      ...result,
    });

  } catch (error) {
    console.error("Error in manual expiration check:", error);
    res.status(500).json({ error: "Failed to check expired verifications" });
  }
});

// Endpoint to get verification expiry information
router.get("/expiry-info", async (req, res) => {
  try {
    const now = new Date();
    
    // Get users with expiring verifications in the next 7 days
    const expiringUsers = await db
      .select({
        id: users.id,
        username: users.username,
        verificationExpiresAt: users.verificationExpiresAt,
      })
      .from(users)
      .where(
        and(
          eq(users.isVerified, true),
          isNotNull(users.verificationExpiresAt),
          lt(users.verificationExpiresAt, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
        )
      );

    // Get rooms with expiring verifications in the next 7 days
    const expiringRooms = await db
      .select({
        id: rooms.id,
        roomId: rooms.roomId,
        name: rooms.name,
        verificationExpiresAt: rooms.verificationExpiresAt,
      })
      .from(rooms)
      .where(
        and(
          eq(rooms.isVerified, true),
          isNotNull(rooms.verificationExpiresAt),
          lt(rooms.verificationExpiresAt, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
        )
      );

    res.json({
      timestamp: now,
      expiringUsers,
      expiringRooms,
      summary: {
        usersExpiringNext7Days: expiringUsers.length,
        roomsExpiringNext7Days: expiringRooms.length,
      },
    });

  } catch (error) {
    console.error("Error getting expiry info:", error);
    res.status(500).json({ error: "Failed to get expiry information" });
  }
});

export default router;