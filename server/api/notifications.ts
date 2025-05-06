import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertPushNotificationSchema } from "@shared/schema";

export function registerNotificationsRoutes(app: Express) {
  // Get all push notifications
  app.get('/api/notifications', async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getPushNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching push notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // Get active push notifications
  app.get('/api/notifications/active', async (req: Request, res: Response) => {
    try {
      try {
        const notifications = await storage.getActivePushNotifications();
        res.json(notifications);
      } catch (error) {
        console.error('Error fetching active push notifications, returning empty array:', error);
        res.json([]);
      }
    } catch (error) {
      console.error('Error processing active notifications request:', error);
      res.status(500).json({ message: 'Failed to fetch active notifications' });
    }
  });

  // Get a push notification by ID
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

  // Create a push notification
  app.post('/api/notifications', async (req: Request, res: Response) => {
    try {
      const notificationData = insertPushNotificationSchema.parse(req.body);
      const notification = await storage.createPushNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
      }
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Failed to create notification' });
    }
  });

  // Update a push notification
  app.put('/api/notifications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }
      
      const notificationData = insertPushNotificationSchema.partial().parse(req.body);
      const updatedNotification = await storage.updatePushNotification(id, notificationData);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
      }
      console.error('Error updating notification:', error);
      res.status(500).json({ message: 'Failed to update notification' });
    }
  });

  // Delete a push notification
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
      
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  });

  // Track notification impression
  app.post('/api/notifications/:id/impressions', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }
      
      await storage.incrementNotificationImpressions(id);
      res.status(200).json({ message: 'Impression recorded' });
    } catch (error) {
      console.error('Error recording notification impression:', error);
      res.status(500).json({ message: 'Failed to record impression' });
    }
  });

  // Track notification click
  app.post('/api/notifications/:id/clicks', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }
      
      await storage.incrementNotificationClicks(id);
      res.status(200).json({ message: 'Click recorded' });
    } catch (error) {
      console.error('Error recording notification click:', error);
      res.status(500).json({ message: 'Failed to record click' });
    }
  });
}