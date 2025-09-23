import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { db } from "@db";
import { tournaments, tournamentParticipants, tournamentGifts, tournamentLeaderboards, giftTransactions, verificationBadgeRewards, users, gifts } from "@shared/schema";
import { eq, desc, and, or, sql, count, sum, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { verificationBadgeService } from "../services/verification-badge-service";

// Validation schemas
const createTournamentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['gift_battle', 'room_competition', 'user_tournament']),
  startDate: z.string().refine(date => !isNaN(Date.parse(date))),
  endDate: z.string().refine(date => !isNaN(Date.parse(date))),
  registrationDeadline: z.string().refine(date => !isNaN(Date.parse(date))),
  maxParticipants: z.number().min(1).max(10000).default(100),
  entryFee: z.number().min(0).default(0),
  minimumGiftValue: z.number().min(1).default(100),
  prizes: z.record(z.any()).optional(),
  verificationRewards: z.record(z.any()).optional(),
  isPublic: z.boolean().default(true),
  allowRoomGifts: z.boolean().default(true),
  allowDirectGifts: z.boolean().default(false),
  featuredImageUrl: z.string().url().optional()
});

const updateTournamentSchema = createTournamentSchema.partial();

const joinTournamentSchema = z.object({
  roomId: z.number().optional()
});

export function registerTournamentRoutes(app: Express) {
  
  // Public Tournament Routes
  
  // Get all public tournaments
  app.get('/api/tournaments', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const type = req.query.type as string;
      const offset = (page - 1) * limit;

      let whereConditions = [eq(tournaments.isPublic, true)];
      
      if (status && ['upcoming', 'active', 'completed'].includes(status)) {
        whereConditions.push(eq(tournaments.status, status as any));
      }
      
      if (type && ['gift_battle', 'room_competition', 'user_tournament'].includes(type)) {
        whereConditions.push(eq(tournaments.type, type as any));
      }

      const [tournamentList, totalCount] = await Promise.all([
        db.select({
          id: tournaments.id,
          name: tournaments.name,
          description: tournaments.description,
          type: tournaments.type,
          status: tournaments.status,
          startDate: tournaments.startDate,
          endDate: tournaments.endDate,
          registrationDeadline: tournaments.registrationDeadline,
          maxParticipants: tournaments.maxParticipants,
          entryFee: tournaments.entryFee,
          minimumGiftValue: tournaments.minimumGiftValue,
          featuredImageUrl: tournaments.featuredImageUrl,
          totalParticipants: tournaments.totalParticipants,
          totalGiftsValue: tournaments.totalGiftsValue,
          totalGiftsCount: tournaments.totalGiftsCount,
          createdAt: tournaments.createdAt
        })
        .from(tournaments)
        .where(and(...whereConditions))
        .orderBy(desc(tournaments.createdAt))
        .limit(limit)
        .offset(offset),
        
        db.select({ count: count() })
        .from(tournaments)
        .where(and(...whereConditions))
      ]);

      const total = totalCount[0]?.count || 0;
      const hasMore = offset + limit < total;

      res.json({
        tournaments: tournamentList,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch tournaments' });
    }
  });

  // Get active tournaments
  app.get('/api/tournaments/active', async (req: Request, res: Response) => {
    try {
      const activeTournaments = await db.select({
        id: tournaments.id,
        name: tournaments.name,
        description: tournaments.description,
        type: tournaments.type,
        endDate: tournaments.endDate,
        minimumGiftValue: tournaments.minimumGiftValue,
        featuredImageUrl: tournaments.featuredImageUrl,
        totalParticipants: tournaments.totalParticipants,
        totalGiftsValue: tournaments.totalGiftsValue
      })
      .from(tournaments)
      .where(and(
        eq(tournaments.status, 'active'),
        eq(tournaments.isPublic, true)
      ))
      .orderBy(desc(tournaments.totalGiftsValue))
      .limit(10);

      res.json(activeTournaments);
    } catch (error) {
      console.error('Error fetching active tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch active tournaments' });
    }
  });

  // Get tournament by ID (public)
  app.get('/api/tournaments/:id', async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }
      
      const tournament = await db.select()
        .from(tournaments)
        .where(and(
          eq(tournaments.id, tournamentId),
          eq(tournaments.isPublic, true)
        ))
        .limit(1);

      if (!tournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      res.json(tournament[0]);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      res.status(500).json({ message: 'Failed to fetch tournament' });
    }
  });

  // Get tournament leaderboard
  app.get('/api/tournaments/:id/leaderboard', async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const leaderboard = await db.select({
        rank: tournamentLeaderboards.currentRank,
        userId: tournamentLeaderboards.userId,
        username: users.username,
        totalGiftsReceived: tournamentLeaderboards.totalGiftsReceived,
        totalValueReceived: tournamentLeaderboards.totalValueReceived,
        totalGiftsSent: tournamentLeaderboards.totalGiftsSent,
        totalValueSent: tournamentLeaderboards.totalValueSent,
        leaderboardScore: tournamentLeaderboards.leaderboardScore,
        hasEarnedVerificationBadge: tournamentLeaderboards.hasEarnedVerificationBadge,
        verificationBadgeDuration: tournamentLeaderboards.verificationBadgeDuration
      })
      .from(tournamentLeaderboards)
      .innerJoin(users, eq(tournamentLeaderboards.userId, users.id))
      .where(eq(tournamentLeaderboards.tournamentId, tournamentId))
      .orderBy(tournamentLeaderboards.currentRank)
      .limit(limit)
      .offset(offset);

      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching tournament leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch tournament leaderboard' });
    }
  });

  // Join tournament (requires authentication)
  app.post('/api/tournaments/:id/join', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }
      const { roomId } = joinTournamentSchema.parse(req.body);

      // Check if tournament exists and is joinable
      const tournament = await db.select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .limit(1);

      if (!tournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      const tournamentData = tournament[0];
      
      if (tournamentData.status !== 'upcoming' && tournamentData.status !== 'active') {
        return res.status(400).json({ message: 'Tournament is not open for registration' });
      }

      if (new Date() > new Date(tournamentData.registrationDeadline)) {
        return res.status(400).json({ message: 'Registration deadline has passed' });
      }

      if (tournamentData.totalParticipants >= tournamentData.maxParticipants) {
        return res.status(400).json({ message: 'Tournament is full' });
      }

      // Check if user is already participating
      const existingParticipation = await db.select()
        .from(tournamentParticipants)
        .where(and(
          eq(tournamentParticipants.tournamentId, tournamentId),
          eq(tournamentParticipants.userId, req.user.id)
        ))
        .limit(1);

      if (existingParticipation.length) {
        return res.status(400).json({ message: 'You are already participating in this tournament' });
      }

      // Join tournament
      await db.transaction(async (tx) => {
        // Add participant
        await tx.insert(tournamentParticipants).values({
          tournamentId,
          userId: req.user.id,
          roomId: roomId || null,
          status: 'registered'
        });

        // Update tournament participant count
        await tx.update(tournaments)
          .set({ 
            totalParticipants: sql`${tournaments.totalParticipants} + 1`,
            updatedAt: new Date()
          })
          .where(eq(tournaments.id, tournamentId));

        // Initialize leaderboard entry
        await tx.insert(tournamentLeaderboards).values({
          tournamentId,
          userId: req.user.id,
          totalGiftsReceived: 0,
          totalValueReceived: 0,
          totalGiftsSent: 0,
          totalValueSent: 0,
          leaderboardScore: 0
        });
      });

      res.json({ message: 'Successfully joined tournament' });
    } catch (error) {
      console.error('Error joining tournament:', error);
      res.status(500).json({ message: 'Failed to join tournament' });
    }
  });

  // Admin Tournament Routes (require authentication and admin role)
  
  // Get all tournaments (admin)
  app.get('/api/admin/tournaments', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      
      if (status && ['upcoming', 'active', 'completed'].includes(status)) {
        whereConditions.push(eq(tournaments.status, status as any));
      }

      const [tournamentList, totalCount] = await Promise.all([
        db.select()
        .from(tournaments)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(tournaments.createdAt))
        .limit(limit)
        .offset(offset),
        
        db.select({ count: count() })
        .from(tournaments)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      ]);

      const total = totalCount[0]?.count || 0;

      res.json({
        tournaments: tournamentList,
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching tournaments (admin):', error);
      res.status(500).json({ message: 'Failed to fetch tournaments' });
    }
  });

  // Create tournament (admin)
  app.post('/api/admin/tournaments', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentData = createTournamentSchema.parse(req.body);

      const newTournament = await db.insert(tournaments).values({
        ...tournamentData,
        startDate: new Date(tournamentData.startDate),
        endDate: new Date(tournamentData.endDate),
        registrationDeadline: new Date(tournamentData.registrationDeadline),
        createdBy: req.user.id,
        status: 'upcoming'
      }).returning();

      res.status(201).json(newTournament[0]);
    } catch (error) {
      console.error('Error creating tournament:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid tournament data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create tournament' });
    }
  });

  // Update tournament (admin)
  app.put('/api/admin/tournaments/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }
      const updateData = updateTournamentSchema.parse(req.body);

      const processedUpdateData: any = { ...updateData };
      
      if (updateData.startDate) {
        processedUpdateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        processedUpdateData.endDate = new Date(updateData.endDate);
      }
      if (updateData.registrationDeadline) {
        processedUpdateData.registrationDeadline = new Date(updateData.registrationDeadline);
      }

      processedUpdateData.updatedAt = new Date();

      const updatedTournament = await db.update(tournaments)
        .set(processedUpdateData)
        .where(eq(tournaments.id, tournamentId))
        .returning();

      if (!updatedTournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      res.json(updatedTournament[0]);
    } catch (error) {
      console.error('Error updating tournament:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid tournament data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update tournament' });
    }
  });

  // Delete tournament (admin)
  app.delete('/api/admin/tournaments/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }

      const deletedTournament = await db.delete(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .returning();

      if (!deletedTournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      res.json({ message: 'Tournament deleted successfully' });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      res.status(500).json({ message: 'Failed to delete tournament' });
    }
  });

  // Get tournament participants (admin)
  app.get('/api/admin/tournaments/:id/participants', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }

      const participants = await db.select({
        id: tournamentParticipants.id,
        userId: tournamentParticipants.userId,
        username: users.username,
        email: users.email,
        status: tournamentParticipants.status,
        giftsReceived: tournamentParticipants.giftsReceived,
        giftsSent: tournamentParticipants.giftsSent,
        totalGiftValueReceived: tournamentParticipants.totalGiftValueReceived,
        totalGiftValueSent: tournamentParticipants.totalGiftValueSent,
        currentRank: tournamentParticipants.currentRank,
        registeredAt: tournamentParticipants.registeredAt,
        completedAt: tournamentParticipants.completedAt
      })
      .from(tournamentParticipants)
      .innerJoin(users, eq(tournamentParticipants.userId, users.id))
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(tournamentParticipants.currentRank);

      res.json(participants);
    } catch (error) {
      console.error('Error fetching tournament participants:', error);
      res.status(500).json({ message: 'Failed to fetch tournament participants' });
    }
  });

  // Get tournament gifts/transactions (admin)
  app.get('/api/admin/tournaments/:id/gifts', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Fix Drizzle aliasing
      const sender = alias(users, 'sender');
      const recipient = alias(users, 'recipient');

      const [giftList, totalCount] = await Promise.all([
        db.select({
          id: tournamentGifts.id,
          senderUsername: sender.username,
          recipientUsername: recipient.username,
          giftName: gifts.name,
          quantity: tournamentGifts.quantity,
          unitPrice: tournamentGifts.unitPrice,
          totalCoins: tournamentGifts.totalCoins,
          totalDollars: tournamentGifts.totalDollars,
          message: tournamentGifts.message,
          leaderboardPointsAwarded: tournamentGifts.leaderboardPointsAwarded,
          createdAt: tournamentGifts.createdAt
        })
        .from(tournamentGifts)
        .innerJoin(sender, eq(tournamentGifts.senderId, sender.id))
        .innerJoin(recipient, eq(tournamentGifts.recipientId, recipient.id))
        .innerJoin(gifts, eq(tournamentGifts.giftId, gifts.id))
        .where(eq(tournamentGifts.tournamentId, tournamentId))
        .orderBy(desc(tournamentGifts.createdAt))
        .limit(limit)
        .offset(offset),
        
        db.select({ count: count() })
        .from(tournamentGifts)
        .where(eq(tournamentGifts.tournamentId, tournamentId))
      ]);

      const total = Number(totalCount[0]?.count || 0);

      res.json({
        gifts: giftList,
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching tournament gifts:', error);
      res.status(500).json({ message: 'Failed to fetch tournament gifts' });
    }
  });

  // Send gift during tournament (authenticated users)
  app.post('/api/tournaments/:id/gifts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const { giftId, recipientId, quantity = 1, message } = req.body;
      const senderId = (req as any).user?.id;

      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }

      if (!senderId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Validate input
      if (!giftId || !recipientId) {
        return res.status(400).json({ message: 'Gift ID and recipient ID are required' });
      }

      if (quantity < 1 || quantity > 100) {
        return res.status(400).json({ message: 'Quantity must be between 1 and 100' });
      }

      // Check if tournament exists and is active
      const tournament = await db.select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .limit(1);

      if (!tournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      if (tournament[0].status !== 'active') {
        return res.status(400).json({ message: 'Tournament is not active' });
      }

      // Check if both sender and recipient are participants
      const participants = await db.select()
        .from(tournamentParticipants)
        .where(
          and(
            eq(tournamentParticipants.tournamentId, tournamentId),
            or(
              eq(tournamentParticipants.userId, senderId),
              eq(tournamentParticipants.userId, recipientId)
            )
          )
        );

      const senderParticipant = participants.find(p => p.userId === senderId);
      const recipientParticipant = participants.find(p => p.userId === recipientId);

      if (!senderParticipant) {
        return res.status(403).json({ message: 'Sender must be a tournament participant' });
      }

      if (!recipientParticipant) {
        return res.status(400).json({ message: 'Recipient must be a tournament participant' });
      }

      // Get gift details
      const gift = await db.select()
        .from(gifts)
        .where(eq(gifts.id, giftId))
        .limit(1);

      if (!gift.length) {
        return res.status(404).json({ message: 'Gift not found' });
      }

      if (!gift[0].isActive) {
        return res.status(400).json({ message: 'Gift is not available' });
      }

      const totalCoins = gift[0].price * quantity;
      const totalDollars = (totalCoins / 100); // Assuming 100 coins = $1

      // Check if gift meets minimum value requirement
      if (totalDollars < tournament[0].minimumGiftValue) {
        return res.status(400).json({ 
          message: `Gift value must be at least $${tournament[0].minimumGiftValue}` 
        });
      }

      // TODO: Check if sender has enough coins/diamonds
      // This would integrate with the wallet system

      // Record the tournament gift
      await db.insert(tournamentGifts).values({
        tournamentId,
        senderId,
        recipientId,
        giftId,
        quantity,
        unitPrice: gift[0].price,
        totalCoins,
        totalDollars: totalDollars.toString(),
        message: message || null,
        leaderboardPointsAwarded: totalDollars // Points equal to dollar value
      });

      // Update tournament statistics
      await db.update(tournaments)
        .set({
          totalGiftsCount: sql`${tournaments.totalGiftsCount} + 1`,
          totalGiftsValue: sql`${tournaments.totalGiftsValue} + ${totalDollars}`,
          updatedAt: new Date()
        })
        .where(eq(tournaments.id, tournamentId));

      // Update participant statistics
      await db.update(tournamentParticipants)
        .set({
          giftsSent: sql`${tournamentParticipants.giftsSent} + 1`,
          totalGiftValueSent: sql`${tournamentParticipants.totalGiftValueSent} + ${totalDollars}`
        })
        .where(
          and(
            eq(tournamentParticipants.tournamentId, tournamentId),
            eq(tournamentParticipants.userId, senderId)
          )
        );

      await db.update(tournamentParticipants)
        .set({
          giftsReceived: sql`${tournamentParticipants.giftsReceived} + 1`,
          totalGiftValueReceived: sql`${tournamentParticipants.totalGiftValueReceived} + ${totalDollars}`
        })
        .where(
          and(
            eq(tournamentParticipants.tournamentId, tournamentId),
            eq(tournamentParticipants.userId, recipientId)
          )
        );

      // Check for verification badge eligibility (for both sender and recipient)
      await Promise.all([
        verificationBadgeService.checkAndAwardTournamentBadges(senderId, tournamentId),
        verificationBadgeService.checkAndAwardTournamentBadges(recipientId, tournamentId)
      ]);

      res.json({ 
        message: 'Gift sent successfully',
        gift: {
          name: gift[0].name,
          quantity,
          totalValue: totalDollars,
          recipient: recipientId
        }
      });

    } catch (error) {
      console.error('Error sending tournament gift:', error);
      res.status(500).json({ message: 'Failed to send gift' });
    }
  });

  // Get verification badge statistics (admin)
  app.get('/api/admin/tournaments/badge-stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await verificationBadgeService.getBadgeStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching badge statistics:', error);
      res.status(500).json({ message: 'Failed to fetch badge statistics' });
    }
  });

  // Manually trigger badge check for all tournaments (admin)
  app.post('/api/admin/tournaments/check-badges', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      await verificationBadgeService.checkAllTournamentBadges();
      res.json({ message: 'Badge check completed for all tournaments' });
    } catch (error) {
      console.error('Error checking tournament badges:', error);
      res.status(500).json({ message: 'Failed to check tournament badges' });
    }
  });

  // Get tournament stats/analytics (admin)
  app.get('/api/admin/tournaments/:id/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }

      // Get tournament basic info
      const tournament = await db.select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .limit(1);

      if (!tournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      // Get participant stats
      const participantStats = await db.select({
        totalParticipants: count(),
        activeParticipants: count(sql`CASE WHEN ${tournamentParticipants.status} = 'active' THEN 1 END`),
        completedParticipants: count(sql`CASE WHEN ${tournamentParticipants.status} = 'completed' THEN 1 END`)
      })
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId));

      // Get gift stats
      const giftStats = await db.select({
        totalGifts: count(),
        totalValue: sum(tournamentGifts.totalDollars),
        totalCoins: sum(tournamentGifts.totalCoins)
      })
      .from(tournamentGifts)
      .where(eq(tournamentGifts.tournamentId, tournamentId));

      // Get verification badge rewards stats
      const badgeStats = await db.select({
        totalBadgesAwarded: count(),
        totalMonthsAwarded: sum(verificationBadgeRewards.badgeDuration)
      })
      .from(verificationBadgeRewards)
      .where(and(
        eq(verificationBadgeRewards.tournamentId, tournamentId),
        eq(verificationBadgeRewards.wasApplied, true)
      ));

      // Get top performers
      const topPerformers = await db.select({
        userId: tournamentLeaderboards.userId,
        username: users.username,
        totalValueReceived: tournamentLeaderboards.totalValueReceived,
        currentRank: tournamentLeaderboards.currentRank,
        hasEarnedVerificationBadge: tournamentLeaderboards.hasEarnedVerificationBadge
      })
      .from(tournamentLeaderboards)
      .innerJoin(users, eq(tournamentLeaderboards.userId, users.id))
      .where(eq(tournamentLeaderboards.tournamentId, tournamentId))
      .orderBy(tournamentLeaderboards.currentRank)
      .limit(10);

      res.json({
        tournament: tournament[0],
        participantStats: participantStats[0],
        giftStats: giftStats[0],
        badgeStats: badgeStats[0],
        topPerformers
      });
    } catch (error) {
      console.error('Error fetching tournament stats:', error);
      res.status(500).json({ message: 'Failed to fetch tournament stats' });
    }
  });

  // Update tournament status (admin)
  app.patch('/api/admin/tournaments/:id/status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
      }
      const { status } = z.object({
        status: z.enum(['upcoming', 'active', 'completed', 'cancelled'])
      }).parse(req.body);

      const updatedTournament = await db.update(tournaments)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(tournaments.id, tournamentId))
        .returning();

      if (!updatedTournament.length) {
        return res.status(404).json({ message: 'Tournament not found' });
      }

      res.json(updatedTournament[0]);
    } catch (error) {
      console.error('Error updating tournament status:', error);
      res.status(500).json({ message: 'Failed to update tournament status' });
    }
  });
}