import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertPushNotificationSchema } from "@shared/schema";
import { z } from "zod";

export function registerNotificationsRoutes(app: Express) {
  // Get all push notifications
  app.get('/api/notifications', async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getPushNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // Get active push notifications
  app.get('/api/notifications/active', async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getActivePushNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching active notifications:', error);
      res.status(500).json({ message: 'Failed to fetch active notifications' });
    }
  });

  // Get push notification by ID
  app.get('/api/notifications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      const notification = await storage.getPushNotificationById(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Error fetching notification:', error);
      res.status(500).json({ message: 'Failed to fetch notification' });
    }
  });

  // Create push notification
  app.post('/api/notifications', async (req: Request, res: Response) => {
    try {
      const validatedData = insertPushNotificationSchema.parse(req.body);
      const notification = await storage.createPushNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Failed to create notification' });
    }
  });

  // Update push notification
  app.put('/api/notifications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      const validatedData = insertPushNotificationSchema.partial().parse(req.body);
      const notification = await storage.updatePushNotification(id, validatedData);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating notification:', error);
      res.status(500).json({ message: 'Failed to update notification' });
    }
  });

  // Delete push notification
  app.delete('/api/notifications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      const success = await storage.deletePushNotification(id);
      if (!success) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  });

  // Increment notification impressions
  app.post('/api/notifications/:id/impressions', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      await storage.incrementNotificationImpressions(id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error incrementing impressions:', error);
      res.status(500).json({ message: 'Failed to increment impressions' });
    }
  });

  // Increment notification clicks
  app.post('/api/notifications/:id/clicks', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      await storage.incrementNotificationClicks(id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error incrementing clicks:', error);
      res.status(500).json({ message: 'Failed to increment clicks' });
    }
  });
}