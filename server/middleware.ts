import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized - Please log in' });
  }
  next();
};

// Middleware to check if user is an admin (legacy check)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  next();
};

// Middleware to check if user has a specific permission
export const hasPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }
    
    try {
      // Legacy admin check - admins have all permissions
      if (req.user.isAdmin) {
        return next();
      }
      
      const hasAccess = await storage.hasPermission(req.user.id, resource, action);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: `Forbidden - You don't have ${action} permission for ${resource}` 
        });
      }
      
      next();
    } catch (error) {
      console.error(`Permission check error for ${resource}:${action}:`, error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

// Permission middleware shortcuts for common resources
export const userPermissions = {
  view: hasPermission('users', 'view'),
  create: hasPermission('users', 'create'),
  edit: hasPermission('users', 'edit'),
  delete: hasPermission('users', 'delete')
};

export const gamePermissions = {
  view: hasPermission('games', 'view'),
  create: hasPermission('games', 'create'),
  edit: hasPermission('games', 'edit'),
  delete: hasPermission('games', 'delete')
};

export const blogPermissions = {
  view: hasPermission('blog', 'view'),
  create: hasPermission('blog', 'create'),
  edit: hasPermission('blog', 'edit'),
  delete: hasPermission('blog', 'delete')
};

export const analyticsPermissions = {
  view: hasPermission('analytics', 'view'),
  create: hasPermission('analytics', 'create'),
  edit: hasPermission('analytics', 'edit'),
  delete: hasPermission('analytics', 'delete')
};

export const settingsPermissions = {
  view: hasPermission('settings', 'view'),
  edit: hasPermission('settings', 'edit')
};

export const notificationPermissions = {
  view: hasPermission('notifications', 'view'),
  create: hasPermission('notifications', 'create'),
  edit: hasPermission('notifications', 'edit'),
  delete: hasPermission('notifications', 'delete')
};