import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerUserRoutes(app: Express) {
  // Get a user's role
  app.get('/api/admin/users/:id/role', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const role = await storage.getUserRole(userId);
      return res.json(role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      return res.status(500).json({ message: 'Failed to fetch user role' });
    }
  });
  
  // Assign a role to a user
  app.post('/api/admin/users/:id/role', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      const roleId = parseInt(req.body.roleId);
      
      if (isNaN(userId) || isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid user ID or role ID' });
      }
      
      // Check if the role exists
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Check if the user exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const updatedUser = await storage.assignRoleToUser(userId, roleId);
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return res.status(500).json({ message: 'Failed to assign role to user' });
    }
  });
  
  // Remove role from a user
  app.delete('/api/admin/users/:id/role', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Check if the user exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Set the roleId to null
      const updatedUser = await storage.updateUser(userId, { roleId: null });
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error removing role from user:', error);
      return res.status(500).json({ message: 'Failed to remove role from user' });
    }
  });
  // Get users by status with pagination
  app.get('/api/admin/users', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const statusParam = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      
      // Convert string status to the expected type or undefined for "all"
      let status: 'active' | 'blocked' | undefined;
      if (statusParam === 'active') status = 'active';
      else if (statusParam === 'blocked') status = 'blocked';
      // else undefined (all users)
      
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
  
  // Get user emails for admin reset password functionality
  app.get('/api/admin/users/emails', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const userEmails = await storage.getUsersWithEmail();
      return res.json(userEmails);
    } catch (error) {
      console.error('Error fetching user emails:', error);
      return res.status(500).json({ message: 'Failed to fetch user emails' });
    }
  });
}