import { db } from "../db";
import { 
  tournaments, 
  tournamentParticipants, 
  tournamentGifts, 
  verificationBadgeRewards,
  users,
  gifts,
  rooms
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedTournaments() {
  try {
    console.log('🏆 Seeding tournaments...');

    // Check if tournaments already exist
    const existingTournaments = await db.select().from(tournaments).limit(1);
    if (existingTournaments.length > 0) {
      console.log('ℹ️  Tournaments already exist, skipping seeding');
      return;
    }

    // Get existing users for participants
    const allUsers = await db.select({ id: users.id, username: users.username }).from(users);
    if (allUsers.length < 2) {
      console.log('⚠️  Not enough users for tournament seeding (need at least 2)');
      return;
    }

    // Get existing gifts
    const allGifts = await db.select().from(gifts).limit(5);
    if (allGifts.length === 0) {
      console.log('⚠️  No gifts available for tournament seeding');
      return;
    }

    // Get existing rooms
    const allRooms = await db.select().from(rooms).limit(3);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create sample tournaments
    const sampleTournaments = [
      {
        name: "Summer Gift Battle 2024",
        description: "The ultimate gift-giving competition! Send and receive gifts to climb the leaderboard and earn exclusive verification badges.",
        type: "gift_receiver" as const,
        status: "completed" as const,
        startDate: oneWeekAgo,
        endDate: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(oneWeekAgo.getTime() - 1 * 24 * 60 * 60 * 1000),
        maxParticipants: 150,
        entryFee: 0,
        minimumGiftValue: 100,
        prizes: {
          "1st": "3 months verification + $500 bonus",
          "2nd": "2 months verification + $300 bonus", 
          "3rd": "1 month verification + $200 bonus"
        },
        verificationRewards: {
          "$100": "1 month verification",
          "$200": "2 months verification",
          "$1200": "1 year verification"
        },
        isPublic: true,
        allowRoomGifts: true,
        allowDirectGifts: false,
        featuredImageUrl: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&h=400&fit=crop",
        totalParticipants: allUsers.length,
        totalGiftsValue: 1250,
        totalGiftsCount: 25,
        createdBy: allUsers[0].id
      },
      {
        name: "Gift Sender Championship",
        description: "Show your generosity! Compete to send the most valuable gifts and earn special recognition.",
        type: "gift_sender" as const,
        status: "completed" as const,
        startDate: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
        registrationDeadline: oneWeekAgo,
        maxParticipants: 100,
        entryFee: 50,
        minimumGiftValue: 50,
        prizes: {
          "1st": "2 months verification + Top Sender badge",
          "2nd": "1 month verification + Generous badge",
          "3rd": "1 month verification"
        },
        verificationRewards: {
          "$200": "2 months verification",
          "$500": "3 months verification"
        },
        isPublic: true,
        allowRoomGifts: true,
        allowDirectGifts: true,
        totalParticipants: allUsers.length,
        totalGiftsValue: 950,
        totalGiftsCount: 18,
        createdBy: allUsers[0].id
      },
      {
        name: "Room Battle Royale",
        description: "Rooms compete for supremacy! Join your favorite room and help them win through collective gifting.",
        type: "room_gifts" as const,
        status: "active" as const,
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        maxParticipants: 200,
        entryFee: 0,
        minimumGiftValue: 75,
        prizes: {
          "winning_room": "All members get 1 month verification",
          "top_contributor": "3 months verification + Room Hero badge"
        },
        verificationRewards: {
          "$300": "1 month verification",
          "$600": "2 months verification"
        },
        isPublic: true,
        allowRoomGifts: true,
        allowDirectGifts: false,
        totalParticipants: allUsers.length,
        totalGiftsValue: 450,
        totalGiftsCount: 12,
        createdBy: allUsers[0].id
      },
      {
        name: "Holiday Mega Tournament",
        description: "The biggest tournament of the year! Multiple competition types with massive prizes and year-long verification rewards.",
        type: "combined" as const,
        status: "upcoming" as const,
        startDate: oneWeekFromNow,
        endDate: twoWeeksFromNow,
        registrationDeadline: new Date(oneWeekFromNow.getTime() - 2 * 24 * 60 * 60 * 1000),
        maxParticipants: 500,
        entryFee: 100,
        minimumGiftValue: 200,
        prizes: {
          "grand_champion": "1 year verification + $2000 prize",
          "category_winners": "6 months verification + $500 prize",
          "top_10": "3 months verification + exclusive badge"
        },
        verificationRewards: {
          "$500": "3 months verification",
          "$1000": "6 months verification", 
          "$1200": "1 year verification"
        },
        isPublic: true,
        allowRoomGifts: true,
        allowDirectGifts: true,
        featuredImageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
        totalParticipants: 0,
        totalGiftsValue: 0,
        totalGiftsCount: 0,
        createdBy: allUsers[0].id
      }
    ];

    // Insert tournaments
    const insertedTournaments = await db.insert(tournaments).values(sampleTournaments).returning({ id: tournaments.id, name: tournaments.name, status: tournaments.status });
    console.log(`✅ Created ${insertedTournaments.length} sample tournaments`);

    // Add participants to completed and active tournaments
    const participantPromises = [];
    
    for (const tournament of insertedTournaments) {
      if (tournament.status === 'upcoming') continue;
      
      // Add participants per tournament (based on available users)
      const participantCount = Math.min(allUsers.length, tournament.status === 'completed' ? allUsers.length : Math.min(allUsers.length, 2));
      
      for (let i = 0; i < participantCount; i++) {
        const user = allUsers[i];
        const roomId = allRooms.length > i ? allRooms[i].id : null;
        
        participantPromises.push(
          db.insert(tournamentParticipants).values({
            tournamentId: tournament.id,
            userId: user.id,
            roomId: roomId,
            status: tournament.status === 'completed' ? 'completed' : 'active',
            giftsReceived: tournament.status === 'completed' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10),
            giftsSent: tournament.status === 'completed' ? Math.floor(Math.random() * 15) + 3 : Math.floor(Math.random() * 8),
            totalGiftValueReceived: tournament.status === 'completed' ? Math.floor(Math.random() * 2000) + 500 : Math.floor(Math.random() * 800) + 100,
            totalGiftValueSent: tournament.status === 'completed' ? Math.floor(Math.random() * 1500) + 300 : Math.floor(Math.random() * 600) + 50,
            currentRank: i + 1,
            bestRank: i + 1,
            registeredAt: new Date(tournament.status === 'completed' ? oneWeekAgo : now),
            completedAt: tournament.status === 'completed' ? new Date() : null
          })
        );
      }
    }

    await Promise.all(participantPromises);
    console.log(`✅ Added participants to tournaments`);

    // Add sample tournament gifts for completed tournaments
    const completedTournaments = insertedTournaments.filter(t => t.status === 'completed');
    const giftPromises = [];

    for (const tournament of completedTournaments) {
      // Get participants for this tournament
      const participants = await db.select()
        .from(tournamentParticipants)
        .where(eq(tournamentParticipants.tournamentId, tournament.id));

      // Create gift transactions per completed tournament (5-8 gifts)
      const giftCount = Math.min(8, allUsers.length * 3);
      for (let i = 0; i < giftCount; i++) {
        const sender = participants[Math.floor(Math.random() * participants.length)];
        const recipient = participants[Math.floor(Math.random() * participants.length)];
        
        if (sender.userId === recipient.userId) continue;

        const gift = allGifts[Math.floor(Math.random() * allGifts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalCoins = gift.price * quantity;
        const totalDollars = Math.floor(totalCoins / 100); // 100 coins = $1, ensure integer

        giftPromises.push(
          db.insert(tournamentGifts).values({
            tournamentId: tournament.id,
            senderId: sender.userId,
            recipientId: recipient.userId,
            giftId: gift.id,
            quantity,
            unitPrice: gift.price,
            totalCoins,
            totalDollars: totalDollars.toString(),
            message: Math.random() > 0.7 ? "Good luck in the tournament!" : null,
            leaderboardPointsAwarded: totalDollars,
            createdAt: new Date(oneWeekAgo.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
          })
        );
      }
    }

    await Promise.all(giftPromises);
    console.log(`✅ Added tournament gifts`);

    // Add sample verification badge rewards for top performers
    const rewardPromises = [];
    const topPerformers = [
      { userId: allUsers[0].id, tournamentId: insertedTournaments[0].id, amount: 1250, months: 12 },
      { userId: allUsers[1].id, tournamentId: insertedTournaments[0].id, amount: 950, months: 2 },
      { userId: allUsers[2].id, tournamentId: insertedTournaments[1].id, amount: 750, months: 2 },
      { userId: allUsers[0].id, tournamentId: insertedTournaments[2].id, amount: 450, months: 1 }
    ];

    for (const performer of topPerformers) {
      if (insertedTournaments.find(t => t.id === performer.tournamentId)?.status === 'completed') {
        const badgeExpiry = new Date();
        badgeExpiry.setMonth(badgeExpiry.getMonth() + performer.months);

        rewardPromises.push(
          db.insert(verificationBadgeRewards).values({
            userId: performer.userId,
            rewardType: 'tournament_gifts',
            triggerAmount: performer.amount.toString(),
            badgeDuration: performer.months,
            tournamentId: performer.tournamentId,
            isActive: true,
            wasApplied: true,
            appliedAt: new Date(),
            expiresAt: badgeExpiry,
            giftTransactionIds: [1, 2, 3], // Sample transaction IDs
            newVerificationExpiresAt: badgeExpiry
          })
        );

        // Update the participant with badge info
        rewardPromises.push(
          db.update(tournamentParticipants)
            .set({
              hasEarnedVerificationBadge: true,
              verificationBadgeEarnedAt: new Date(),
              verificationBadgeDuration: performer.months
            })
            .where(
              and(
                eq(tournamentParticipants.userId, performer.userId),
                eq(tournamentParticipants.tournamentId, performer.tournamentId)
              )
            )
        );
      }
    }

    await Promise.all(rewardPromises);
    console.log(`✅ Added verification badge rewards`);

    console.log('🎉 Tournament seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • ${insertedTournaments.length} tournaments created`);
    console.log(`   • Multiple tournament participants added`);
    console.log(`   • Sample tournament gifts and verification rewards created`);
    console.log(`   • Tournament types: Gift Receiver, Gift Sender, Room Gifts, Combined`);

  } catch (error) {
    console.error('❌ Error seeding tournaments:', error);
  }
}