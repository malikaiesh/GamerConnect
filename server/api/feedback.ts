import { Express, Request, Response } from "express";
import { db } from "@db";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { z } from "zod";
import { 
  feedback, 
  users,
  insertFeedbackSchema,
  type Feedback 
} from "@shared/schema";
import { eq, desc, and, sql, count, gte, or } from "drizzle-orm";

export function registerFeedbackRoutes(app: Express) {
  // User feedback submission
  app.post('/api/feedback', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Validate request body using Zod schema
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        userId: userId,
        status: 'pending', // Always set to pending for new submissions
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newFeedback = await db.insert(feedback).values(validatedData).returning();
      
      res.status(201).json({
        message: "Feedback submitted successfully",
        feedback: newFeedback[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid feedback data", 
          details: error.errors 
        });
      }
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Get user's own feedback
  app.get('/api/feedback/my', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const userFeedback = await db.query.feedback.findMany({
        where: eq(feedback.userId, userId),
        orderBy: [desc(feedback.createdAt)]
      });

      res.json(userFeedback);
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Admin routes for feedback management
  app.get('/api/admin/feedback', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;
      const type = req.query.type as string;
      const priority = req.query.priority as string;
      const search = req.query.search as string;

      // Build where conditions
      const conditions = [];
      
      if (status && status !== 'all') {
        conditions.push(eq(feedback.status, status as any));
      }
      
      if (type && type !== 'all') {
        conditions.push(eq(feedback.type, type as any));
      }
      
      if (priority && priority !== 'all') {
        conditions.push(eq(feedback.priority, priority as any));
      }
      
      if (search) {
        conditions.push(
          or(
            sql`${feedback.subject} ILIKE ${`%${search}%`}`,
            sql`${feedback.message} ILIKE ${`%${search}%`}`
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get feedback with basic query first, then join user data manually
      const feedbackList = await db
        .select()
        .from(feedback)
        .where(whereClause)
        .orderBy(desc(feedback.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      // Manually add user information
      const enrichedFeedbackList = await Promise.all(
        feedbackList.map(async (item) => {
          const user = await db.query.users.findFirst({
            where: eq(users.id, item.userId),
            columns: {
              id: true,
              username: true,
              displayName: true,
              email: true
            }
          });
          return { ...item, user };
        })
      );

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(feedback)
        .where(whereClause);
      
      const total = totalResult[0].count;

      // Add responded by user information if available
      const finalEnrichedFeedback = await Promise.all(
        enrichedFeedbackList.map(async (item) => {
          if (item.respondedBy) {
            const respondedByUser = await db.query.users.findFirst({
              where: eq(users.id, item.respondedBy),
              columns: {
                id: true,
                username: true,
                displayName: true
              }
            });
            return {
              ...item,
              respondedByUser
            };
          }
          return item;
        })
      );

      res.json({
        feedback: finalEnrichedFeedback,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      console.error('Error fetching admin feedback:', error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Admin respond to feedback
  app.post('/api/admin/feedback/:id/respond', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const adminId = (req as any).user?.id;

      if (isNaN(feedbackId)) {
        return res.status(400).json({ error: "Invalid feedback ID" });
      }

      const schema = z.object({
        adminResponse: z.string().min(10, "Response must be at least 10 characters").max(2000, "Response must be less than 2000 characters"),
        status: z.enum(['pending', 'in_review', 'resolved', 'closed'])
      });

      const validatedData = schema.parse(req.body);

      // Check if feedback exists
      const existingFeedback = await db.query.feedback.findFirst({
        where: eq(feedback.id, feedbackId)
      });

      if (!existingFeedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }

      // Update feedback with admin response
      const updatedFeedback = await db
        .update(feedback)
        .set({
          adminResponse: validatedData.adminResponse,
          status: validatedData.status,
          respondedById: adminId,
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(feedback.id, feedbackId))
        .returning();

      res.json({
        message: "Response sent successfully",
        feedback: updatedFeedback[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid response data", 
          details: error.errors 
        });
      }
      console.error('Error responding to feedback:', error);
      res.status(500).json({ error: "Failed to respond to feedback" });
    }
  });

  // Get feedback statistics for admin dashboard
  app.get('/api/admin/feedback/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await db
        .select({
          status: feedback.status,
          count: count()
        })
        .from(feedback)
        .groupBy(feedback.status);

      const formattedStats = {
        total: 0,
        pending: 0,
        in_review: 0,
        resolved: 0,
        closed: 0
      };

      stats.forEach(stat => {
        formattedStats.total += stat.count;
        formattedStats[stat.status as keyof typeof formattedStats] = stat.count;
      });

      res.json(formattedStats);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      res.status(500).json({ error: "Failed to fetch feedback statistics" });
    }
  });

  // Get recent feedback for admin dashboard
  app.get('/api/admin/feedback/recent', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const recentFeedback = await db
        .select({
          id: feedback.id,
          subject: feedback.subject,
          type: feedback.type,
          priority: feedback.priority,
          status: feedback.status,
          createdAt: feedback.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: users.displayName
          }
        })
        .from(feedback)
        .leftJoin(users, eq(feedback.userId, users.id))
        .orderBy(desc(feedback.createdAt))
        .limit(limit);

      res.json(recentFeedback);
    } catch (error) {
      console.error('Error fetching recent feedback:', error);
      res.status(500).json({ error: "Failed to fetch recent feedback" });
    }
  });

  // Update feedback status (admin only)
  app.patch('/api/admin/feedback/:id/status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const feedbackId = parseInt(req.params.id);
      
      if (isNaN(feedbackId)) {
        return res.status(400).json({ error: "Invalid feedback ID" });
      }

      const schema = z.object({
        status: z.enum(['pending', 'in_review', 'resolved', 'closed'])
      });

      const { status: newStatus } = schema.parse(req.body);

      // Check if feedback exists
      const existingFeedback = await db.query.feedback.findFirst({
        where: eq(feedback.id, feedbackId)
      });

      if (!existingFeedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }

      // Update feedback status
      const updatedFeedback = await db
        .update(feedback)
        .set({
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(feedback.id, feedbackId))
        .returning();

      res.json({
        message: "Status updated successfully",
        feedback: updatedFeedback[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid status data", 
          details: error.errors 
        });
      }
      console.error('Error updating feedback status:', error);
      res.status(500).json({ error: "Failed to update feedback status" });
    }
  });

  // Delete feedback (admin only)
  app.delete('/api/admin/feedback/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const feedbackId = parseInt(req.params.id);
      
      if (isNaN(feedbackId)) {
        return res.status(400).json({ error: "Invalid feedback ID" });
      }

      // Check if feedback exists
      const existingFeedback = await db.query.feedback.findFirst({
        where: eq(feedback.id, feedbackId)
      });

      if (!existingFeedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }

      // Delete feedback
      await db.delete(feedback).where(eq(feedback.id, feedbackId));

      res.json({ message: "Feedback deleted successfully" });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  });
}