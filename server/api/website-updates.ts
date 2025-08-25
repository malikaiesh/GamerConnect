import { Express, Request, Response } from "express";
import { isAdmin } from "../middleware/auth";
import { z } from "zod";
import { db } from "../../db";
import { websiteUpdates, adminNotifications, adminActivityLogs } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export function registerWebsiteUpdatesRoutes(app: Express) {
  // Get all website updates
  app.get('/api/website-updates', isAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const offset = (page - 1) * limit;

      let query = db.select().from(websiteUpdates);
      
      if (status && status !== 'all') {
        query = query.where(eq(websiteUpdates.status, status));
      }

      const updates = await query
        .orderBy(desc(websiteUpdates.createdAt))
        .limit(limit)
        .offset(offset);

      const totalQuery = db.select({ count: websiteUpdates.id }).from(websiteUpdates);
      if (status && status !== 'all') {
        totalQuery.where(eq(websiteUpdates.status, status));
      }
      const [{ count: total }] = await totalQuery;

      res.json({
        updates,
        pagination: {
          page,
          limit,
          total: Number(total),
          pages: Math.ceil(Number(total) / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching website updates:', error);
      res.status(500).json({ message: 'Failed to fetch website updates' });
    }
  });

  // Get single website update
  app.get('/api/website-updates/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [update] = await db
        .select()
        .from(websiteUpdates)
        .where(eq(websiteUpdates.id, parseInt(id)));

      if (!update) {
        return res.status(404).json({ message: 'Website update not found' });
      }

      res.json(update);
    } catch (error) {
      console.error('Error fetching website update:', error);
      res.status(500).json({ message: 'Failed to fetch website update' });
    }
  });

  // Create new website update
  app.post('/api/website-updates', isAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        version: z.string().min(1, "Version is required"),
        changeType: z.enum(['feature', 'bugfix', 'security', 'improvement']),
        priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        scheduledAt: z.string().optional().nullable()
      });

      const data = schema.parse(req.body);
      
      const [newUpdate] = await db
        .insert(websiteUpdates)
        .values({
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          createdBy: req.user!.id
        })
        .returning();

      // Log activity
      await db.insert(adminActivityLogs).values({
        userId: req.user!.id,
        action: 'update_created',
        entityType: 'update',
        entityId: newUpdate.id,
        description: `Created website update: ${newUpdate.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Create notification for update creation
      await db.insert(adminNotifications).values({
        type: 'update',
        title: 'New Update Created',
        message: `Website update "${newUpdate.title}" has been created`,
        icon: 'ri-add-circle-line',
        priority: newUpdate.priority,
        userId: req.user!.id,
        relatedEntityType: 'update',
        relatedEntityId: newUpdate.id,
        actionUrl: `/admin/website-updates/${newUpdate.id}`
      });

      res.status(201).json(newUpdate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating website update:', error);
      res.status(500).json({ message: 'Failed to create website update' });
    }
  });

  // Update website update
  app.put('/api/website-updates/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const schema = z.object({
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        version: z.string().min(1, "Version is required").optional(),
        changeType: z.enum(['feature', 'bugfix', 'security', 'improvement']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        status: z.enum(['draft', 'published', 'deploying', 'deployed', 'failed']).optional(),
        deploymentUrl: z.string().optional().nullable(),
        githubCommitHash: z.string().optional().nullable(),
        scheduledAt: z.string().optional().nullable()
      });

      const data = schema.parse(req.body);
      
      const [updatedUpdate] = await db
        .update(websiteUpdates)
        .set({
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          deployedAt: data.status === 'deployed' ? new Date() : undefined,
          updatedAt: new Date()
        })
        .where(eq(websiteUpdates.id, parseInt(id)))
        .returning();

      if (!updatedUpdate) {
        return res.status(404).json({ message: 'Website update not found' });
      }

      // Log activity
      await db.insert(adminActivityLogs).values({
        userId: req.user!.id,
        action: 'update_modified',
        entityType: 'update',
        entityId: updatedUpdate.id,
        description: `Modified website update: ${updatedUpdate.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { changes: data }
      });

      // Create notification for status changes
      if (data.status === 'published') {
        await db.insert(adminNotifications).values({
          type: 'update',
          title: 'Update Published',
          message: `Website update "${updatedUpdate.title}" has been published`,
          icon: 'ri-rocket-line',
          priority: 'high',
          userId: req.user!.id,
          relatedEntityType: 'update',
          relatedEntityId: updatedUpdate.id,
          actionUrl: `/admin/website-updates/${updatedUpdate.id}`
        });
      } else if (data.status === 'deployed') {
        await db.insert(adminNotifications).values({
          type: 'deployment',
          title: 'Update Deployed',
          message: `Website update "${updatedUpdate.title}" has been successfully deployed`,
          icon: 'ri-check-line',
          priority: 'high',
          userId: req.user!.id,
          relatedEntityType: 'update',
          relatedEntityId: updatedUpdate.id,
          actionUrl: `/admin/website-updates/${updatedUpdate.id}`
        });
      }

      res.json(updatedUpdate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error updating website update:', error);
      res.status(500).json({ message: 'Failed to update website update' });
    }
  });

  // Delete website update
  app.delete('/api/website-updates/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [deletedUpdate] = await db
        .delete(websiteUpdates)
        .where(eq(websiteUpdates.id, parseInt(id)))
        .returning();

      if (!deletedUpdate) {
        return res.status(404).json({ message: 'Website update not found' });
      }

      // Log activity
      await db.insert(adminActivityLogs).values({
        userId: req.user!.id,
        action: 'update_deleted',
        entityType: 'update',
        entityId: deletedUpdate.id,
        description: `Deleted website update: ${deletedUpdate.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ message: 'Website update deleted successfully' });
    } catch (error) {
      console.error('Error deleting website update:', error);
      res.status(500).json({ message: 'Failed to delete website update' });
    }
  });

  // Trigger GitHub deployment
  app.post('/api/website-updates/:id/deploy', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Update status to deploying
      const [update] = await db
        .update(websiteUpdates)
        .set({ 
          status: 'deploying',
          updatedAt: new Date()
        })
        .where(eq(websiteUpdates.id, parseInt(id)))
        .returning();

      if (!update) {
        return res.status(404).json({ message: 'Website update not found' });
      }

      // TODO: Integrate with GitHub Actions API to trigger deployment
      // For now, we'll simulate the deployment process

      // Log activity
      await db.insert(adminActivityLogs).values({
        userId: req.user!.id,
        action: 'deployment_triggered',
        entityType: 'update',
        entityId: update.id,
        description: `Triggered deployment for update: ${update.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Create notification
      await db.insert(adminNotifications).values({
        type: 'deployment',
        title: 'Deployment Started',
        message: `Deployment started for update "${update.title}"`,
        icon: 'ri-rocket-2-line',
        priority: 'high',
        userId: req.user!.id,
        relatedEntityType: 'update',
        relatedEntityId: update.id,
        actionUrl: `/admin/website-updates/${update.id}`
      });

      res.json({ 
        message: 'Deployment triggered successfully',
        update 
      });
    } catch (error) {
      console.error('Error triggering deployment:', error);
      res.status(500).json({ message: 'Failed to trigger deployment' });
    }
  });
}