import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Validation schema for custom date range
const customDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
});

export function registerAnalyticsRoutes(app: Express) {
  // Get analytics data
  app.get('/api/analytics', async (req: Request, res: Response) => {
    try {
      const timeframe = req.query.timeframe as string || '7days';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Extended timeframe validation
      const validTimeframes = [
        '7days', '30days', '90days', '6months', '1year', '2years', '5years', 'custom'
      ];
      
      if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({ 
          message: 'Invalid timeframe. Use 7days, 30days, 90days, 6months, 1year, 2years, 5years, or custom.' 
        });
      }

      // Handle custom date range
      if (timeframe === 'custom') {
        if (!startDate || !endDate) {
          return res.status(400).json({ 
            message: 'Custom timeframe requires startDate and endDate parameters.' 
          });
        }

        const validation = customDateRangeSchema.safeParse({ startDate, endDate });
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid date format. Use YYYY-MM-DD format.',
            errors: validation.error.errors
          });
        }

        // Check if start date is before end date
        if (new Date(startDate) > new Date(endDate)) {
          return res.status(400).json({ 
            message: 'Start date must be before end date.' 
          });
        }
      }
      
      const analyticsData = await storage.getAnalytics(timeframe, startDate, endDate);
      res.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  // Export analytics data
  app.get('/api/analytics/export', async (req: Request, res: Response) => {
    try {
      const timeframe = req.query.timeframe as string || '7days';
      const format = req.query.format as string || 'json';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Validate timeframe (same as above)
      const validTimeframes = [
        '7days', '30days', '90days', '6months', '1year', '2years', '5years', 'custom'
      ];
      
      if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({ 
          message: 'Invalid timeframe. Use 7days, 30days, 90days, 6months, 1year, 2years, 5years, or custom.' 
        });
      }

      // Handle custom date range
      if (timeframe === 'custom') {
        if (!startDate || !endDate) {
          return res.status(400).json({ 
            message: 'Custom timeframe requires startDate and endDate parameters.' 
          });
        }

        const validation = customDateRangeSchema.safeParse({ startDate, endDate });
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid date format. Use YYYY-MM-DD format.',
            errors: validation.error.errors
          });
        }
      }

      // Validate export format
      if (!['json', 'csv'].includes(format)) {
        return res.status(400).json({ 
          message: 'Invalid export format. Use json or csv.' 
        });
      }

      const analyticsData = await storage.getAnalytics(timeframe, startDate, endDate);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics_${timeframe}_${timestamp}`;

      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertAnalyticsToCSV(analyticsData, timeframe);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csv);
      } else {
        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json({
          exportDate: new Date().toISOString(),
          timeframe,
          customRange: timeframe === 'custom' ? { startDate, endDate } : null,
          data: analyticsData
        });
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({ message: 'Failed to export analytics data' });
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

// Helper function to convert analytics data to CSV format
function convertAnalyticsToCSV(data: any, timeframe: string): string {
  const rows: string[] = [];
  
  // Add header
  rows.push(`Analytics Report - ${timeframe}`);
  rows.push(`Export Date: ${new Date().toISOString()}`);
  rows.push('');
  
  // Summary statistics
  rows.push('Summary Statistics');
  rows.push('Metric,Value');
  rows.push(`Page Views,${data.pageViews}`);
  rows.push(`Unique Visitors,${data.uniqueVisitors}`);
  rows.push(`Average Time on Site,${data.avgTimeOnSite}m`);
  rows.push(`Bounce Rate,${data.bounceRate}%`);
  rows.push('');
  
  // Top pages
  if (data.topPages && data.topPages.length > 0) {
    rows.push('Top Pages');
    rows.push('Page Path,Views');
    data.topPages.forEach((page: any) => {
      rows.push(`"${page.path}",${page.views}`);
    });
    rows.push('');
  }
  
  // Top games
  if (data.topGames && data.topGames.length > 0) {
    rows.push('Top Games');
    rows.push('Game Name,Plays');
    data.topGames.forEach((game: any) => {
      rows.push(`"${game.name}",${game.plays}`);
    });
    rows.push('');
  }
  
  // Daily visitors
  if (data.dailyVisitors && data.dailyVisitors.length > 0) {
    rows.push('Daily Visitors');
    rows.push('Date,Visitors');
    data.dailyVisitors.forEach((day: any) => {
      rows.push(`${day.date},${day.visitors}`);
    });
    rows.push('');
  }
  
  // User devices
  if (data.userDevices && data.userDevices.length > 0) {
    rows.push('Device Distribution');
    rows.push('Device,Count');
    data.userDevices.forEach((device: any) => {
      rows.push(`"${device.device}",${device.count}`);
    });
    rows.push('');
  }
  
  return rows.join('\n');
}
