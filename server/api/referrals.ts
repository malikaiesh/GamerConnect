import { Router } from 'express';
import { db } from '../db';
import { 
  users, 
  referralCodes, 
  referrals, 
  referralRewards, 
  referralSettings,
  referralPayouts,
  referralAnalytics,
  referralMilestones,
  insertReferralCodeSchema,
  insertReferralSchema,
  insertReferralRewardSchema,
  insertReferralPayoutSchema,
  type ReferralCode,
  type Referral,
  type ReferralReward,
  type ReferralSetting,
  type ReferralPayout,
  type ReferralAnalytics,
  type ReferralMilestone
} from '@shared/schema';
import { eq, sql, desc, and, sum, count } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// ===== UTILITY FUNCTIONS =====

// Generate unique referral code
function generateReferralCode(username: string): string {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const usernamePart = username.substring(0, 4).toUpperCase();
  return `${usernamePart}${randomPart}`;
}

// Calculate reward amount based on type and tier
function calculateRewardAmount(rewardType: string, tier: string, baseAmount: number): number {
  const tierMultipliers = {
    'tier_1': 1.0,    // 100%
    'tier_2': 0.5,    // 50%  
    'tier_3': 0.25    // 25%
  };
  
  const rewardAmounts = {
    'registration': 500,        // $5.00
    'first_game': 300,         // $3.00
    'profile_complete': 200,   // $2.00
    'subscription': baseAmount * 0.3, // 30%
    'activity_bonus': 100,     // $1.00
    'milestone': baseAmount,   // Variable
    'recurring_commission': baseAmount * 0.1 // 10%
  };

  const baseReward = rewardAmounts[rewardType as keyof typeof rewardAmounts] || 0;
  const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 0;
  
  return Math.round(baseReward * multiplier);
}

// ===== PUBLIC ENDPOINTS =====

// Register with referral code
router.post('/register-referral', async (req, res) => {
  try {
    const { referralCode, userId } = req.body;
    
    if (!referralCode || !userId) {
      return res.status(400).json({ error: 'Referral code and user ID are required' });
    }

    // Find referral code
    const [codeRecord] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, referralCode.toUpperCase()));

    if (!codeRecord) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    if (codeRecord.userId === userId) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // Check if user already has a referrer
    const [existingReferral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredUserId, userId));

    if (existingReferral) {
      return res.status(400).json({ error: 'User already has a referrer' });
    }

    // Create referral relationship
    const [newReferral] = await db
      .insert(referrals)
      .values({
        referrerId: codeRecord.userId,
        referredUserId: userId,
        referralCodeId: codeRecord.id,
        tier: 'tier_1',
        status: 'confirmed',
        confirmedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        source: 'registration'
      })
      .returning();

    // Create registration reward
    const rewardAmount = calculateRewardAmount('registration', 'tier_1', 0);
    await db.insert(referralRewards).values({
      referralId: newReferral.id,
      referrerId: codeRecord.userId,
      rewardType: 'registration',
      amount: rewardAmount,
      tier: 'tier_1',
      status: 'approved',
      description: 'New user registration reward',
      processedAt: new Date()
    });

    // Update referral code stats
    await db
      .update(referralCodes)
      .set({ 
        conversionCount: sql`${referralCodes.conversionCount} + 1`,
        totalEarnings: sql`${referralCodes.totalEarnings} + ${rewardAmount}`
      })
      .where(eq(referralCodes.id, codeRecord.id));

    res.json({
      success: true,
      referral: newReferral,
      reward: { amount: rewardAmount, type: 'registration' }
    });

  } catch (error) {
    console.error('Error registering referral:', error);
    res.status(500).json({ error: 'Failed to register referral' });
  }
});

// Track referral code click
router.post('/track-click/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const [codeRecord] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code.toUpperCase()));

    if (!codeRecord) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    // Update click count
    await db
      .update(referralCodes)
      .set({ clickCount: sql`${referralCodes.clickCount} + 1` })
      .where(eq(referralCodes.id, codeRecord.id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// ===== USER ENDPOINTS (Protected) =====

// Get user's referral dashboard
router.get('/my-dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Get user's referral codes
    const userCodes = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .orderBy(desc(referralCodes.isDefault), desc(referralCodes.createdAt));

    // Get referral statistics
    const referralStats = await db
      .select({
        totalReferrals: count(),
        totalEarnings: sum(referrals.totalEarnings),
        tier1Count: count(sql`CASE WHEN ${referrals.tier} = 'tier_1' THEN 1 END`),
        tier2Count: count(sql`CASE WHEN ${referrals.tier} = 'tier_2' THEN 1 END`),
        tier3Count: count(sql`CASE WHEN ${referrals.tier} = 'tier_3' THEN 1 END`)
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    // Get recent referrals
    const recentReferrals = await db
      .select({
        id: referrals.id,
        tier: referrals.tier,
        status: referrals.status,
        earnings: referrals.totalEarnings,
        createdAt: referrals.createdAt,
        referredUser: {
          id: users.id,
          username: users.username,
          profilePicture: users.profilePicture
        }
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt))
      .limit(10);

    // Get recent rewards
    const recentRewards = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.referrerId, userId))
      .orderBy(desc(referralRewards.createdAt))
      .limit(10);

    // Get pending payout amount
    const [pendingPayout] = await db
      .select({ total: sum(referralRewards.amount) })
      .from(referralRewards)
      .where(and(
        eq(referralRewards.referrerId, userId),
        eq(referralRewards.status, 'approved')
      ));

    res.json({
      codes: userCodes,
      stats: referralStats[0] || { totalReferrals: 0, totalEarnings: 0, tier1Count: 0, tier2Count: 0, tier3Count: 0 },
      recentReferrals,
      recentRewards,
      pendingPayout: pendingPayout?.total || 0
    });

  } catch (error) {
    console.error('Error fetching referral dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch referral dashboard' });
  }
});

// Create new referral code
router.post('/codes', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const user = (req as any).user;

    // Check if user already has 5 codes (limit)
    const existingCodes = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId));

    if (existingCodes.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 referral codes allowed per user' });
    }

    // Generate unique code
    let newCode: string;
    let attempts = 0;
    do {
      newCode = generateReferralCode(user.username);
      attempts++;
      const [existing] = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, newCode));
      
      if (!existing) break;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Unable to generate unique code' });
      }
    } while (true);

    // Create new referral code
    const [newCodeRecord] = await db
      .insert(referralCodes)
      .values({
        userId,
        code: newCode,
        status: 'active',
        isDefault: existingCodes.length === 0 // First code is default
      })
      .returning();

    res.json(newCodeRecord);
  } catch (error) {
    console.error('Error creating referral code:', error);
    res.status(500).json({ error: 'Failed to create referral code' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db
      .select({
        userId: referrals.referrerId,
        username: users.username,
        profilePicture: users.profilePicture,
        totalReferrals: count(),
        totalEarnings: sum(referrals.totalEarnings),
        tier1Count: count(sql`CASE WHEN ${referrals.tier} = 'tier_1' THEN 1 END`),
        tier2Count: count(sql`CASE WHEN ${referrals.tier} = 'tier_2' THEN 1 END`),
        tier3Count: count(sql`CASE WHEN ${referrals.tier} = 'tier_3' THEN 1 END`)
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .where(eq(referrals.status, 'confirmed'))
      .groupBy(referrals.referrerId, users.username, users.profilePicture)
      .orderBy(desc(sum(referrals.totalEarnings)))
      .limit(50);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Request payout
router.post('/request-payout', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { method, amount, payoutDetails } = req.body;

    // Validate minimum payout amount ($10.00)
    if (amount < 1000) {
      return res.status(400).json({ error: 'Minimum payout amount is $10.00' });
    }

    // Check available balance
    const [availableBalance] = await db
      .select({ total: sum(referralRewards.amount) })
      .from(referralRewards)
      .where(and(
        eq(referralRewards.referrerId, userId),
        eq(referralRewards.status, 'approved')
      ));

    if (!availableBalance?.total || availableBalance.total < amount) {
      return res.status(400).json({ error: 'Insufficient balance for payout' });
    }

    // Create payout request
    const [payoutRequest] = await db
      .insert(referralPayouts)
      .values({
        userId,
        amount,
        method,
        payoutDetails,
        status: 'pending'
      })
      .returning();

    res.json(payoutRequest);
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ error: 'Failed to request payout' });
  }
});

// ===== ADMIN ENDPOINTS =====

// Get all referrals (Admin only)
router.get('/admin/all-referrals', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allReferrals = await db
      .select({
        id: referrals.id,
        status: referrals.status,
        tier: referrals.tier,
        totalEarnings: referrals.totalEarnings,
        createdAt: referrals.createdAt,
        referrer: {
          id: users.id,
          username: users.username,
          email: users.email
        },
        referredUser: {
          id: users.id,
          username: users.username,
          email: users.email
        },
        referralCode: {
          code: referralCodes.code
        }
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .leftJoin(referralCodes, eq(referrals.referralCodeId, referralCodes.id))
      .orderBy(desc(referrals.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(referrals);

    res.json({
      referrals: allReferrals,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get referral analytics (Admin only)
router.get('/admin/analytics', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '30d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get overall stats
    const [overallStats] = await db
      .select({
        totalReferrals: count(),
        totalEarnings: sum(referrals.totalEarnings),
        confirmedReferrals: count(sql`CASE WHEN ${referrals.status} = 'confirmed' THEN 1 END`),
        pendingReferrals: count(sql`CASE WHEN ${referrals.status} = 'pending' THEN 1 END`)
      })
      .from(referrals)
      .where(sql`${referrals.createdAt} >= ${startDate}`);

    // Get daily analytics
    const dailyAnalytics = await db
      .select({
        date: sql`DATE(${referrals.createdAt})`.as('date'),
        signups: count(),
        earnings: sum(referrals.totalEarnings)
      })
      .from(referrals)
      .where(sql`${referrals.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${referrals.createdAt})`)
      .orderBy(sql`DATE(${referrals.createdAt}) DESC`);

    // Get top performers
    const topPerformers = await db
      .select({
        userId: referrals.referrerId,
        username: users.username,
        totalReferrals: count(),
        totalEarnings: sum(referrals.totalEarnings)
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .where(sql`${referrals.createdAt} >= ${startDate}`)
      .groupBy(referrals.referrerId, users.username)
      .orderBy(desc(sum(referrals.totalEarnings)))
      .limit(10);

    res.json({
      overall: overallStats,
      daily: dailyAnalytics,
      topPerformers
    });

  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Manage referral settings (Admin only)
router.get('/admin/settings', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const settings = await db
      .select()
      .from(referralSettings)
      .where(eq(referralSettings.isActive, true))
      .orderBy(referralSettings.settingKey);

    res.json(settings);
  } catch (error) {
    console.error('Error fetching referral settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/admin/settings', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { settingKey, settingValue, settingType, description } = req.body;

    const [setting] = await db
      .insert(referralSettings)
      .values({
        settingKey,
        settingValue,
        settingType,
        description
      })
      .onConflictDoUpdate({
        target: referralSettings.settingKey,
        set: {
          settingValue,
          settingType,
          description,
          updatedAt: new Date()
        }
      })
      .returning();

    res.json(setting);
  } catch (error) {
    console.error('Error updating referral setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Delete referral setting (Admin only)
router.delete('/admin/settings/:settingKey', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { settingKey } = req.params;

    const deletedSetting = await db
      .delete(referralSettings)
      .where(eq(referralSettings.settingKey, settingKey))
      .returning();

    if (deletedSetting.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting referral setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// Manage payouts (Admin only)
router.get('/admin/payouts', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query = db
      .select({
        payout: referralPayouts,
        user: {
          id: users.id,
          username: users.username,
          email: users.email
        }
      })
      .from(referralPayouts)
      .leftJoin(users, eq(referralPayouts.userId, users.id));

    if (status) {
      query = query.where(eq(referralPayouts.status, status as any));
    }

    const payouts = await query
      .orderBy(desc(referralPayouts.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(referralPayouts)
      .where(status ? eq(referralPayouts.status, status as any) : sql`true`);

    res.json({
      payouts,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Process payout (Admin only)
router.patch('/admin/payouts/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failureReason, adminNotes, transactionId } = req.body;

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.processedAt = new Date();
      if (transactionId) {
        updateData.payoutDetails = sql`
          CASE 
            WHEN ${referralPayouts.payoutDetails} IS NULL 
            THEN ${JSON.stringify({ transaction_id: transactionId })}
            ELSE ${referralPayouts.payoutDetails} || ${JSON.stringify({ transaction_id: transactionId })}
          END
        `;
      }
    } else if (status === 'failed') {
      updateData.failureReason = failureReason;
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const [updatedPayout] = await db
      .update(referralPayouts)
      .set(updateData)
      .where(eq(referralPayouts.id, parseInt(id)))
      .returning();

    res.json(updatedPayout);
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

export { router as referralRouter };