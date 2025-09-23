import { db } from "../db";
import { 
  users, 
  tournaments, 
  tournamentParticipants,
  giftTransactions,
  verificationBadgeRewards,
  tournamentGifts 
} from "../../shared/schema";
import { eq, and, sum, gte, isNull, or, lt } from "drizzle-orm";
import { automatedMessaging } from "./automated-messaging";

export class VerificationBadgeService {
  
  /**
   * Check and award verification badges based on gift amounts during tournaments
   */
  async checkAndAwardTournamentBadges(userId: number, tournamentId: number): Promise<void> {
    try {
      // Get total gift value sent by user in this tournament
      const giftStats = await db
        .select({
          totalSent: sum(tournamentGifts.totalDollars),
          totalReceived: sum(tournamentGifts.totalDollars)
        })
        .from(tournamentGifts)
        .where(
          and(
            eq(tournamentGifts.tournamentId, tournamentId),
            or(
              eq(tournamentGifts.senderId, userId),
              eq(tournamentGifts.recipientId, userId)
            )
          )
        );

      const totalSent = Number(giftStats[0]?.totalSent || 0);
      const totalReceived = Number(giftStats[0]?.totalReceived || 0);
      const combinedTotal = Math.max(totalSent, totalReceived); // Use highest value

      // Check which badge tier they qualify for
      const badgeTier = this.calculateBadgeTier(combinedTotal);
      
      if (badgeTier.months > 0) {
        await this.awardVerificationBadge(userId, tournamentId, badgeTier, combinedTotal);
      }

    } catch (error) {
      console.error("Error checking tournament badge eligibility:", error);
    }
  }

  /**
   * Calculate badge tier based on total gift amount
   */
  private calculateBadgeTier(totalAmount: number): { months: number; type: string } {
    if (totalAmount >= 1200) {
      return { months: 12, type: "1-year-verification" };
    } else if (totalAmount >= 200) {
      return { months: 2, type: "2-month-verification" };
    } else if (totalAmount >= 100) {
      return { months: 1, type: "1-month-verification" };
    }
    return { months: 0, type: "none" };
  }

  /**
   * Award verification badge to user
   */
  private async awardVerificationBadge(
    userId: number, 
    tournamentId: number, 
    badgeTier: { months: number; type: string },
    triggerAmount: number
  ): Promise<void> {
    try {
      // Check if user already has this badge tier for this tournament
      const existingReward = await db
        .select()
        .from(verificationBadgeRewards)
        .where(
          and(
            eq(verificationBadgeRewards.userId, userId),
            eq(verificationBadgeRewards.tournamentId, tournamentId),
            gte(verificationBadgeRewards.badgeDuration, badgeTier.months)
          )
        )
        .limit(1);

      if (existingReward.length > 0) {
        return; // Already has equal or better badge for this tournament
      }

      // Get current user verification status
      const user = await db
        .select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          verificationExpiresAt: users.verificationExpiresAt
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return;
      }

      const currentUser = user[0];
      const now = new Date();
      const badgeDurationMs = badgeTier.months * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds

      // Calculate new expiration date
      let newExpiresAt: Date;
      if (currentUser.isVerified && currentUser.verificationExpiresAt && new Date(currentUser.verificationExpiresAt) > now) {
        // Extend existing verification
        newExpiresAt = new Date(new Date(currentUser.verificationExpiresAt).getTime() + badgeDurationMs);
      } else {
        // New verification or expired verification
        newExpiresAt = new Date(now.getTime() + badgeDurationMs);
      }

      // Create verification badge reward record
      await db.insert(verificationBadgeRewards).values({
        userId,
        rewardType: 'tournament_gifts',
        triggerAmount: triggerAmount.toString(),
        badgeDuration: badgeTier.months,
        tournamentId,
        isActive: true,
        wasApplied: true,
        appliedAt: now,
        expiresAt: newExpiresAt,
        oldVerificationExpiresAt: currentUser.verificationExpiresAt,
        newVerificationExpiresAt: newExpiresAt
      });

      // Update user verification status
      await db
        .update(users)
        .set({
          isVerified: true,
          verifiedAt: now,
          verificationExpiresAt: newExpiresAt,
          updatedAt: now
        })
        .where(eq(users.id, userId));

      // Update tournament participant with badge info
      await db
        .update(tournamentParticipants)
        .set({
          hasEarnedVerificationBadge: true,
          verificationBadgeEarnedAt: now,
          verificationBadgeDuration: badgeTier.months
        })
        .where(
          and(
            eq(tournamentParticipants.userId, userId),
            eq(tournamentParticipants.tournamentId, tournamentId)
          )
        );

      // Send automated notification
      await automatedMessaging.triggerVerificationApproval({
        userId,
        type: 'tournament-reward',
        badgeType: badgeTier.type
      });

      console.log(`🏆 Verification badge awarded: ${currentUser.username} received ${badgeTier.months} months for $${triggerAmount} in tournament ${tournamentId}`);

    } catch (error) {
      console.error("Error awarding verification badge:", error);
    }
  }

  /**
   * Check all active tournaments for badge eligibility
   */
  async checkAllTournamentBadges(): Promise<void> {
    try {
      // Get all active tournaments
      const activeTournaments = await db
        .select({ id: tournaments.id })
        .from(tournaments)
        .where(eq(tournaments.status, 'active'));

      // Check each tournament for badge eligibility
      for (const tournament of activeTournaments) {
        const participants = await db
          .select({ userId: tournamentParticipants.userId })
          .from(tournamentParticipants)
          .where(eq(tournamentParticipants.tournamentId, tournament.id));

        for (const participant of participants) {
          await this.checkAndAwardTournamentBadges(participant.userId, tournament.id);
        }
      }

    } catch (error) {
      console.error("Error checking all tournament badges:", error);
    }
  }

  /**
   * Get verification badge statistics
   */
  async getBadgeStatistics(): Promise<{
    totalBadgesAwarded: number;
    badgesByDuration: Record<string, number>;
    recentAwards: any[];
  }> {
    try {
      // Get total badges awarded
      const totalBadges = await db
        .select({ count: sum(verificationBadgeRewards.id) })
        .from(verificationBadgeRewards)
        .where(eq(verificationBadgeRewards.wasApplied, true));

      // Get badges by duration
      const badgesByDuration = await db
        .select({
          duration: verificationBadgeRewards.badgeDuration,
          count: sum(verificationBadgeRewards.id)
        })
        .from(verificationBadgeRewards)
        .where(eq(verificationBadgeRewards.wasApplied, true))
        .groupBy(verificationBadgeRewards.badgeDuration);

      // Get recent awards (last 10)
      const recentAwards = await db
        .select({
          username: users.username,
          badgeDuration: verificationBadgeRewards.badgeDuration,
          triggerAmount: verificationBadgeRewards.triggerAmount,
          appliedAt: verificationBadgeRewards.appliedAt,
          tournamentId: verificationBadgeRewards.tournamentId
        })
        .from(verificationBadgeRewards)
        .innerJoin(users, eq(verificationBadgeRewards.userId, users.id))
        .where(eq(verificationBadgeRewards.wasApplied, true))
        .orderBy(verificationBadgeRewards.appliedAt)
        .limit(10);

      const durationMap: Record<string, number> = {};
      badgesByDuration.forEach(badge => {
        const key = `${badge.duration}-month${badge.duration > 1 ? 's' : ''}`;
        durationMap[key] = Number(badge.count || 0);
      });

      return {
        totalBadgesAwarded: Number(totalBadges[0]?.count || 0),
        badgesByDuration: durationMap,
        recentAwards
      };

    } catch (error) {
      console.error("Error getting badge statistics:", error);
      return {
        totalBadgesAwarded: 0,
        badgesByDuration: {},
        recentAwards: []
      };
    }
  }
}

// Export singleton instance
export const verificationBadgeService = new VerificationBadgeService();