import { db } from "../db";
import { rooms, users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedVerifiedRooms() {
  try {
    // Check if verified rooms already exist
    const existingVerifiedRooms = await db
      .select()
      .from(rooms)
      .limit(1);
    
    if (existingVerifiedRooms.length > 0) {
      console.log('ℹ️  Rooms already exist, skipping seeding');
      return;
    }

    // Get verified users to assign as room owners
    const verifiedUsers = await db
      .select()
      .from(users)
      .where(eq(users.isVerified, true));

    if (verifiedUsers.length === 0) {
      console.log('⚠️  No verified users found, cannot seed verified rooms');
      return;
    }

    // Create verified rooms
    const verifiedRoomsData = [
      {
        roomId: 'VER001',
        name: 'Elite Gaming Hub',
        description: 'Premium gaming room for verified players only',
        type: 'public' as const,
        status: 'active' as const,
        maxSeats: 8,
        currentUsers: 0,
        category: 'elite',
        language: 'English',
        isLocked: false,
        isFeatured: true,
        voiceChatEnabled: true,
        textChatEnabled: true,
        giftsEnabled: true,
        backgroundTheme: 'galaxy',
        tags: ['elite', 'premium', 'verified'],
        totalVisits: 245,
        totalGiftsReceived: 35,
        totalGiftValue: 750.00,
        ownerId: verifiedUsers[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roomId: 'VER002',
        name: 'Pro Champions League',
        description: 'Competitive gaming room for tournament players',
        type: 'public' as const,
        status: 'active' as const,
        maxSeats: 6,
        currentUsers: 0,
        category: 'competitive',
        language: 'English',
        isLocked: false,
        isFeatured: false,
        voiceChatEnabled: true,
        textChatEnabled: true,
        giftsEnabled: true,
        backgroundTheme: 'sunset',
        tags: ['competitive', 'pro', 'esports'],
        totalVisits: 189,
        totalGiftsReceived: 28,
        totalGiftValue: 560.00,
        ownerId: verifiedUsers[1]?.id || verifiedUsers[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roomId: 'VER003',
        name: 'Streamer Lounge',
        description: 'Exclusive room for gaming content creators',
        type: 'public' as const,
        status: 'active' as const,
        maxSeats: 10,
        currentUsers: 0,
        category: 'social',
        language: 'English',
        isLocked: false,
        isFeatured: true,
        voiceChatEnabled: true,
        textChatEnabled: true,
        giftsEnabled: true,
        backgroundTheme: 'forest',
        tags: ['streaming', 'creators', 'social'],
        totalVisits: 320,
        totalGiftsReceived: 45,
        totalGiftValue: 920.00,
        ownerId: verifiedUsers[2]?.id || verifiedUsers[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.insert(rooms).values(verifiedRoomsData);
    console.log('✅ Verified rooms seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding verified rooms:', error);
    throw error;
  }
}