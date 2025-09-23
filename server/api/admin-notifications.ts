import { Express, Request, Response } from "express";
import { isAdmin } from "../middleware/auth";
import { z } from "zod";
import { db } from "@db";
import { adminNotifications, adminActivityLogs } from "@shared/schema";
import { eq, desc, and, count } from "drizzle-orm";

export function registerAdminNotificationsRoutes(app: Express) {
  // Get admin notifications for current user
  app.get('/api/admin/notifications', isAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';
      const offset = (page - 1) * limit;

      let query = db.select().from(adminNotifications);
      
      if (unreadOnly) {
        query = query.where(
          and(
            eq(adminNotifications.userId, req.user!.id),
            eq(adminNotifications.isRead, false)
          )
        );
      } else {
        query = query.where(eq(adminNotifications.userId, req.user!.id));
      }

      const notifications = await query
        .orderBy(desc(adminNotifications.createdAt))
        .limit(limit)
        .offset(offset);

      // Get unread count
      const [{ count: unreadCount }] = await db
        .select({ count: count() })
        .from(adminNotifications)
        .where(
          and(
            eq(adminNotifications.userId, req.user!.id),
            eq(adminNotifications.isRead, false)
          )
        );

      res.json({
        notifications,
        unreadCount: Number(unreadCount),
        pagination: {
          page,
          limit,
          total: notifications.length
        }
      });
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // Mark notification as read
  app.patch('/api/admin/notifications/:id/read', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [notification] = await db
        .update(adminNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(adminNotifications.id, parseInt(id)),
            eq(adminNotifications.userId, req.user!.id)
          )
        )
        .returning();

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  app.patch('/api/admin/notifications/read-all', isAdmin, async (req: Request, res: Response) => {
    try {
      await db
        .update(adminNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(adminNotifications.userId, req.user!.id),
            eq(adminNotifications.isRead, false)
          )
        );

      // Log activity
      await db.insert(adminActivityLogs).values({
        userId: req.user!.id,
        action: 'notifications_read_all',
        entityType: 'notification',
        description: 'Marked all notifications as read',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  // Delete notification
  app.delete('/api/admin/notifications/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [notification] = await db
        .delete(adminNotifications)
        .where(
          and(
            eq(adminNotifications.id, parseInt(id)),
            eq(adminNotifications.userId, req.user!.id)
          )
        )
        .returning();

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  });

  // Create admin notification (for system use)
  app.post('/api/admin/notifications', isAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        type: z.enum(['update', 'activity', 'system', 'deployment', 'analytics']),
        title: z.string().min(1, "Title is required"),
        message: z.string().min(1, "Message is required"),
        icon: z.string().default('ri-notification-line'),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        actionUrl: z.string().optional(),
        relatedEntityType: z.string().optional(),
        relatedEntityId: z.number().optional(),
        userId: z.number().optional() // If not provided, use current user
      });

      const data = schema.parse(req.body);
      
      const [notification] = await db
        .insert(adminNotifications)
        .values({
          ...data,
          userId: data.userId || req.user!.id
        })
        .returning();

      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Failed to create notification' });
    }
  });

  // Get activity logs for current admin
  app.get('/api/admin/activity-logs', isAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const action = req.query.action as string;
      const entityType = req.query.entityType as string;
      const offset = (page - 1) * limit;

      let query = db.select().from(adminActivityLogs);
      
      const conditions = [eq(adminActivityLogs.userId, req.user!.id)];
      
      if (action) {
        conditions.push(eq(adminActivityLogs.action, action));
      }
      
      if (entityType) {
        conditions.push(eq(adminActivityLogs.entityType, entityType));
      }

      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      } else {
        query = query.where(conditions[0]);
      }

      const logs = await query
        .orderBy(desc(adminActivityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total: logs.length
        }
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  });
}