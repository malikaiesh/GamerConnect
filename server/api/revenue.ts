import { Router } from 'express';
import { db } from "@db";
import { 
  revenueSources, 
  revenueTransactions, 
  revenueGoals,
  revenueAnalytics,
  revenueReports,
  users,
  insertRevenueSourceSchema,
  insertRevenueTransactionSchema,
  insertRevenueGoalSchema,
  insertRevenueAnalyticsSchema,
  insertRevenueReportSchema,
  type RevenueSource,
  type RevenueTransaction,
  type RevenueGoal,
  type RevenueAnalytics,
  type RevenueReport
} from '@shared/schema';
import { eq, sql, desc, and, sum, count, gte, lte, like, between } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

// ===== ADMIN REVENUE DASHBOARD ENDPOINTS =====

// Get revenue overview/dashboard data
router.get('/admin/overview', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get total revenue in timeframe
    const totalRevenueResult = await db
      .select({
        total: sum(revenueTransactions.netAmount),
        transactions: count(revenueTransactions.id)
      })
      .from(revenueTransactions)
      .where(and(
        eq(revenueTransactions.status, 'completed'),
        gte(revenueTransactions.createdAt, startDate)
      ));

    // Get revenue by category
    const revenueByCategory = await db
      .select({
        category: revenueSources.category,
        total: sum(revenueTransactions.netAmount),
        transactions: count(revenueTransactions.id)
      })
      .from(revenueTransactions)
      .leftJoin(revenueSources, eq(revenueTransactions.revenueSourceId, revenueSources.id))
      .where(and(
        eq(revenueTransactions.status, 'completed'),
        gte(revenueTransactions.createdAt, startDate)
      ))
      .groupBy(revenueSources.category);

    // Get top revenue sources
    const topSources = await db
      .select({
        source: {
          id: revenueSources.id,
          name: revenueSources.name,
          category: revenueSources.category
        },
        total: sum(revenueTransactions.netAmount),
        transactions: count(revenueTransactions.id)
      })
      .from(revenueTransactions)
      .leftJoin(revenueSources, eq(revenueTransactions.revenueSourceId, revenueSources.id))
      .where(and(
        eq(revenueTransactions.status, 'completed'),
        gte(revenueTransactions.createdAt, startDate)
      ))
      .groupBy(revenueSources.id, revenueSources.name, revenueSources.category)
      .orderBy(desc(sum(revenueTransactions.netAmount)))
      .limit(10);

    // Get daily revenue trend (last 30 days)
    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${revenueTransactions.createdAt})`,
        revenue: sum(revenueTransactions.netAmount),
        transactions: count(revenueTransactions.id)
      })
      .from(revenueTransactions)
      .where(and(
        eq(revenueTransactions.status, 'completed'),
        gte(revenueTransactions.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      ))
      .groupBy(sql`DATE(${revenueTransactions.createdAt})`)
      .orderBy(sql`DATE(${revenueTransactions.createdAt})`);

    // Get active goals progress
    const activeGoals = await db
      .select()
      .from(revenueGoals)
      .where(and(
        eq(revenueGoals.isActive, true),
        lte(revenueGoals.startDate, now),
        gte(revenueGoals.endDate, now)
      ))
      .orderBy(desc(revenueGoals.createdAt))
      .limit(5);

    res.json({
      overview: {
        totalRevenue: totalRevenueResult[0]?.total || 0,
        totalTransactions: totalRevenueResult[0]?.transactions || 0,
        averageTransaction: totalRevenueResult[0]?.total && totalRevenueResult[0]?.transactions 
          ? Math.round((totalRevenueResult[0].total / totalRevenueResult[0].transactions)) 
          : 0
      },
      revenueByCategory,
      topSources,
      dailyRevenue,
      activeGoals,
      timeframe
    });
  } catch (error) {
    console.error('Error fetching revenue overview:', error);
    res.status(500).json({ error: 'Failed to fetch revenue overview' });
  }
});

// ===== REVENUE SOURCES MANAGEMENT =====

// Get all revenue sources
router.get('/admin/sources', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const sources = await db
      .select()
      .from(revenueSources)
      .orderBy(revenueSources.displayOrder, revenueSources.name);
    
    res.json(sources);
  } catch (error) {
    console.error('Error fetching revenue sources:', error);
    res.status(500).json({ error: 'Failed to fetch revenue sources' });
  }
});

// Create revenue source
router.post('/admin/sources', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertRevenueSourceSchema.parse(req.body);
    
    const [newSource] = await db
      .insert(revenueSources)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newSource);
  } catch (error) {
    console.error('Error creating revenue source:', error);
    res.status(500).json({ error: 'Failed to create revenue source' });
  }
});

// Update revenue source
router.put('/admin/sources/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedSource] = await db
      .update(revenueSources)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(revenueSources.id, parseInt(id)))
      .returning();

    if (!updatedSource) {
      return res.status(404).json({ error: 'Revenue source not found' });
    }
    
    res.json(updatedSource);
  } catch (error) {
    console.error('Error updating revenue source:', error);
    res.status(500).json({ error: 'Failed to update revenue source' });
  }
});

// Delete revenue source
router.delete('/admin/sources/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are any transactions for this source
    const transactionCount = await db
      .select({ count: count() })
      .from(revenueTransactions)
      .where(eq(revenueTransactions.revenueSourceId, parseInt(id)));

    if (transactionCount[0]?.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete revenue source with existing transactions' 
      });
    }
    
    const [deletedSource] = await db
      .delete(revenueSources)
      .where(eq(revenueSources.id, parseInt(id)))
      .returning();

    if (!deletedSource) {
      return res.status(404).json({ error: 'Revenue source not found' });
    }
    
    res.json({ message: 'Revenue source deleted successfully' });
  } catch (error) {
    console.error('Error deleting revenue source:', error);
    res.status(500).json({ error: 'Failed to delete revenue source' });
  }
});

// ===== REVENUE TRANSACTIONS MANAGEMENT =====

// Get revenue transactions with filtering and pagination
router.get('/admin/transactions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '50', 
      source, 
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      userId
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Build where conditions
    const whereConditions = [];
    
    if (source) {
      whereConditions.push(eq(revenueTransactions.revenueSourceId, parseInt(source as string)));
    }
    
    if (status && status !== 'all') {
      whereConditions.push(eq(revenueTransactions.status, status as any));
    }
    
    if (startDate) {
      whereConditions.push(gte(revenueTransactions.createdAt, new Date(startDate as string)));
    }
    
    if (endDate) {
      whereConditions.push(lte(revenueTransactions.createdAt, new Date(endDate as string)));
    }
    
    if (minAmount) {
      whereConditions.push(gte(revenueTransactions.netAmount, parseInt(minAmount as string)));
    }
    
    if (maxAmount) {
      whereConditions.push(lte(revenueTransactions.netAmount, parseInt(maxAmount as string)));
    }

    if (userId) {
      whereConditions.push(eq(revenueTransactions.userId, parseInt(userId as string)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get transactions with source and user details
    const transactions = await db
      .select({
        transaction: revenueTransactions,
        revenueSource: {
          id: revenueSources.id,
          name: revenueSources.name,
          category: revenueSources.category
        },
        user: {
          id: users.id,
          username: users.username,
          email: users.email
        }
      })
      .from(revenueTransactions)
      .leftJoin(revenueSources, eq(revenueTransactions.revenueSourceId, revenueSources.id))
      .leftJoin(users, eq(revenueTransactions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(revenueTransactions.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(revenueTransactions)
      .leftJoin(revenueSources, eq(revenueTransactions.revenueSourceId, revenueSources.id))
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / parseInt(limit as string));

    res.json({
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages,
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching revenue transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create manual revenue transaction
router.post('/admin/transactions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertRevenueTransactionSchema.parse(req.body);
    
    // Calculate net amount if not provided
    if (!validatedData.netAmount) {
      validatedData.netAmount = validatedData.amount - (validatedData.fees || 0);
    }
    
    const [newTransaction] = await db
      .insert(revenueTransactions)
      .values({
        ...validatedData,
        processedAt: validatedData.status === 'completed' ? new Date() : undefined
      })
      .returning();
    
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating revenue transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update revenue transaction
router.put('/admin/transactions/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Auto-set processedAt when status changes to completed
    if (updateData.status === 'completed' && !updateData.processedAt) {
      updateData.processedAt = new Date();
    }
    
    const [updatedTransaction] = await db
      .update(revenueTransactions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(revenueTransactions.id, parseInt(id)))
      .returning();

    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating revenue transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// ===== REVENUE GOALS MANAGEMENT =====

// Get revenue goals
router.get('/admin/goals', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const whereCondition = status === 'active' 
      ? eq(revenueGoals.isActive, true)
      : status === 'achieved'
      ? eq(revenueGoals.isAchieved, true)
      : undefined;

    const goals = await db
      .select({
        goal: revenueGoals,
        revenueSource: {
          id: revenueSources.id,
          name: revenueSources.name,
          category: revenueSources.category
        },
        createdByUser: {
          id: users.id,
          username: users.username
        }
      })
      .from(revenueGoals)
      .leftJoin(revenueSources, eq(revenueGoals.revenueSourceId, revenueSources.id))
      .leftJoin(users, eq(revenueGoals.createdBy, users.id))
      .where(whereCondition)
      .orderBy(desc(revenueGoals.createdAt));
    
    res.json(goals);
  } catch (error) {
    console.error('Error fetching revenue goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create revenue goal
router.post('/admin/goals', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertRevenueGoalSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const [newGoal] = await db
      .insert(revenueGoals)
      .values({ ...validatedData, createdBy: userId })
      .returning();
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating revenue goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update revenue goal
router.put('/admin/goals/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedGoal] = await db
      .update(revenueGoals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(revenueGoals.id, parseInt(id)))
      .returning();

    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating revenue goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// ===== REVENUE ANALYTICS ENDPOINTS =====

// Get revenue analytics with date range
router.get('/admin/analytics', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      sourceId,
      groupBy = 'day' // day, week, month
    } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Build date grouping SQL based on groupBy parameter
    let dateGroup;
    switch (groupBy) {
      case 'week':
        dateGroup = sql`DATE_TRUNC('week', ${revenueTransactions.createdAt})`;
        break;
      case 'month':
        dateGroup = sql`DATE_TRUNC('month', ${revenueTransactions.createdAt})`;
        break;
      default:
        dateGroup = sql`DATE(${revenueTransactions.createdAt})`;
    }

    const whereConditions = [
      eq(revenueTransactions.status, 'completed'),
      gte(revenueTransactions.createdAt, start),
      lte(revenueTransactions.createdAt, end)
    ];

    if (sourceId) {
      whereConditions.push(eq(revenueTransactions.revenueSourceId, parseInt(sourceId as string)));
    }

    const analytics = await db
      .select({
        date: dateGroup,
        totalRevenue: sum(revenueTransactions.netAmount),
        grossRevenue: sum(revenueTransactions.grossAmount),
        fees: sum(revenueTransactions.fees),
        transactions: count(revenueTransactions.id),
        averageTransaction: sql<number>`ROUND(AVG(${revenueTransactions.netAmount}))`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${revenueTransactions.userId})`
      })
      .from(revenueTransactions)
      .where(and(...whereConditions))
      .groupBy(dateGroup)
      .orderBy(dateGroup);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ===== REVENUE REPORTS ENDPOINTS =====

// Get saved reports
router.get('/admin/reports', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const reports = await db
      .select({
        report: revenueReports,
        generatedByUser: {
          id: users.id,
          username: users.username
        }
      })
      .from(revenueReports)
      .leftJoin(users, eq(revenueReports.generatedBy, users.id))
      .orderBy(desc(revenueReports.lastGenerated), desc(revenueReports.createdAt));
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching revenue reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Generate new revenue report
router.post('/admin/reports/generate', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { reportType, filters, name, description } = req.body;
    const userId = (req as any).user.id;

    // Generate report data based on filters
    const whereConditions = [eq(revenueTransactions.status, 'completed')];
    
    if (filters.date_range) {
      whereConditions.push(gte(revenueTransactions.createdAt, new Date(filters.date_range.start)));
      whereConditions.push(lte(revenueTransactions.createdAt, new Date(filters.date_range.end)));
    }
    
    if (filters.revenue_sources?.length > 0) {
      whereConditions.push(sql`${revenueTransactions.revenueSourceId} = ANY(${filters.revenue_sources})`);
    }

    // Get summary data
    const summaryData = await db
      .select({
        totalRevenue: sum(revenueTransactions.netAmount),
        totalTransactions: count(revenueTransactions.id),
        averageTransaction: sql<number>`ROUND(AVG(${revenueTransactions.netAmount}))`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${revenueTransactions.userId})`
      })
      .from(revenueTransactions)
      .where(and(...whereConditions));

    // Get revenue by source
    const revenueBySource = await db
      .select({
        source: revenueSources.name,
        category: revenueSources.category,
        total: sum(revenueTransactions.netAmount),
        transactions: count(revenueTransactions.id)
      })
      .from(revenueTransactions)
      .leftJoin(revenueSources, eq(revenueTransactions.revenueSourceId, revenueSources.id))
      .where(and(...whereConditions))
      .groupBy(revenueSources.id, revenueSources.name, revenueSources.category)
      .orderBy(desc(sum(revenueTransactions.netAmount)));

    const reportData = {
      summary: summaryData[0],
      revenueBySource,
      generatedAt: new Date(),
      filters
    };

    // Save report
    const [savedReport] = await db
      .insert(revenueReports)
      .values({
        name,
        description,
        reportType,
        filters,
        reportData,
        generatedBy: userId,
        lastGenerated: new Date()
      })
      .returning();
    
    res.status(201).json({ 
      report: savedReport, 
      data: reportData 
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// ===== PUBLIC REVENUE TRACKING API =====

// Add new revenue transaction (for integrations)
router.post('/track', async (req, res) => {
  try {
    // This endpoint can be called by webhooks or integrations
    const {
      revenueSourceId,
      amount,
      transactionId,
      userId,
      description,
      metadata,
      apiKey
    } = req.body;

    // TODO: Implement API key validation for external integrations
    // For now, we'll allow tracking without authentication for webhooks

    const validatedData = {
      revenueSourceId: parseInt(revenueSourceId),
      amount: parseInt(amount),
      transactionId,
      userId: userId ? parseInt(userId) : undefined,
      description,
      metadata,
      status: 'completed' as const,
      processedAt: new Date(),
      netAmount: parseInt(amount) // Assume no fees for now
    };

    const [transaction] = await db
      .insert(revenueTransactions)
      .values(validatedData)
      .returning();
    
    res.status(201).json({ 
      success: true, 
      transactionId: transaction.id 
    });
  } catch (error) {
    console.error('Error tracking revenue:', error);
    res.status(500).json({ error: 'Failed to track revenue' });
  }
});

export { router as revenueRouter };