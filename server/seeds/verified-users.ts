import { db } from "@db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedVerifiedUsers() {
  try {
    // Check if verified users already exist
    const existingVerifiedUsers = await db
      .select()
      .from(users)
      .where(eq(users.isVerified, true));
    
    if (existingVerifiedUsers.length > 0) {
      console.log('ℹ️  Verified users already exist, skipping seeding');
      return;
    }

    // Create verified users
    const verifiedUsersData = [
      {
        username: 'verified_gamer',
        email: 'verified@example.com',
        displayName: 'Elite Gamer',
        isVerified: true,
        verifiedAt: new Date(),
        bio: 'Professional esports player and content creator',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'pro_player',
        email: 'pro@example.com',
        displayName: 'Pro Player ⭐',
        isVerified: true,
        verifiedAt: new Date(),
        bio: 'Tournament champion and gaming influencer',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'gaming_streamer',
        email: 'streamer@example.com',
        displayName: 'Gaming Streamer',
        isVerified: true,
        verifiedAt: new Date(),
        bio: 'Live streaming gaming content daily',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.insert(users).values(verifiedUsersData);
    console.log('✅ Verified users seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding verified users:', error);
    throw error;
  }
}