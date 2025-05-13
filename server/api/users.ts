import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerUserRoutes(app: Express) {
  // Get users by status with pagination
  app.get('/api/admin/users', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const status = req.query.status as 'active' | 'blocked' || 'active';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      
      const result = await storage.getUsersByStatus(status, { 
        page, 
        limit,
        search
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Update user status (block/unblock)
  app.patch('/api/admin/users/:id/status', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const { status } = req.body;
      if (status !== 'active' && status !== 'blocked') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Prevent blocking oneself
      if (userId === req.user.id && status === 'blocked') {
        return res.status(400).json({ message: "Cannot block your own account" });
      }
      
      const updatedUser = await storage.updateUserStatus(userId, status);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ message: 'Failed to update user status' });
    }
  });
  
  // Get user stats for admin dashboard
  app.get('/api/admin/user-stats', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const stats = await storage.getUserStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
  });
  
  // Get user distribution by country
  app.get('/api/admin/users/countries', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const countryData = await storage.getUsersByCountry();
      return res.json(countryData);
    } catch (error) {
      console.error('Error fetching user country data:', error);
      return res.status(500).json({ message: 'Failed to fetch user country data' });
    }
  });
  
  // Get recent user locations for map visualization
  app.get('/api/admin/users/recent-locations', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      
      // Get recent users with location data
      const recentUsers = await storage.getRecentUsersWithLocation(limit);
      
      // Extract just the location data
      const locations = recentUsers.map(user => user.location);
      
      return res.json(locations);
    } catch (error) {
      console.error('Error fetching user location data:', error);
      return res.status(500).json({ message: 'Failed to fetch user location data' });
    }
  });
  
  // Get new user signups over time
  app.get('/api/admin/users/new', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const days = parseInt(req.query.days as string) || 30;
      const newUsers = await storage.getNewUsers(days);
      return res.json(newUsers);
    } catch (error) {
      console.error('Error fetching new user data:', error);
      return res.status(500).json({ message: 'Failed to fetch new user data' });
    }
  });
  
  // Get combined map data (countries + recent locations)
  app.get('/api/admin/users/map-data', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      // Get country statistics
      const countryStats = await storage.getUsersByCountry();
      
      // Get 100 most recent users with location data
      const recentUsers = await storage.getRecentUsersWithLocation(100);
      const recentLocations = recentUsers.map(user => user.location);
      
      return res.json({
        countryStats,
        recentLocations
      });
    } catch (error) {
      console.error('Error fetching map data:', error);
      return res.status(500).json({ message: 'Failed to fetch map data' });
    }
  });
}