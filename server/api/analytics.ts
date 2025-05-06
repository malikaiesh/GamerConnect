import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

export function registerAnalyticsRoutes(app: Express) {
  // Get analytics data
  app.get('/api/analytics', async (req: Request, res: Response) => {
    try {
      const timeframe = req.query.timeframe as string || '7days';
      
      // Validate timeframe
      if (!['7days', '30days', '90days'].includes(timeframe)) {
        return res.status(400).json({ message: 'Invalid timeframe. Use 7days, 30days, or 90days.' });
      }
      
      const analyticsData = await storage.getAnalytics(timeframe);
      res.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });
  
  // Get user statistics
  app.get('/api/users/stats', async (req: Request, res: Response) => {
    try {
      // This would normally calculate user stats from database
      // For now, we'll return mock data
      res.json({
        totalUsers: 2856,
        activeUsers: 1423,
        newUsersPercent: 12
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
  });
}
