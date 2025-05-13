import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, hasPermission } from '../middleware';

/**
 * Register routes for permission management
 */
export function registerPermissionRoutes(app: Express) {
  // Get all permissions
  app.get('/api/permissions', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.status(200).json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ message: 'Failed to fetch permissions' });
    }
  });

  // Get a specific permission by ID
  app.get('/api/permissions/:id', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const permissionId = parseInt(req.params.id);
      if (isNaN(permissionId)) {
        return res.status(400).json({ message: 'Invalid permission ID' });
      }

      const permission = await storage.getPermissionById(permissionId);
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      res.status(200).json(permission);
    } catch (error) {
      console.error(`Error fetching permission with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch permission' });
    }
  });

  // Get permissions by resource
  app.get('/api/permissions/resource/:resourceName', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const resourceName = req.params.resourceName;
      
      if (!resourceName || resourceName.trim() === '') {
        return res.status(400).json({ message: 'Resource name is required' });
      }

      const permissions = await storage.getPermissionsByResource(resourceName);
      res.status(200).json(permissions);
    } catch (error) {
      console.error(`Error fetching permissions for resource ${req.params.resourceName}:`, error);
      res.status(500).json({ message: 'Failed to fetch permissions for resource' });
    }
  });

  // Get users by permission
  app.get('/api/permissions/:id/users', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const permissionId = parseInt(req.params.id);
      if (isNaN(permissionId)) {
        return res.status(400).json({ message: 'Invalid permission ID' });
      }

      const permission = await storage.getPermissionById(permissionId);
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      const users = await storage.getUsersByPermission(permissionId);
      res.status(200).json(users);
    } catch (error) {
      console.error(`Error fetching users with permission ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch users with permission' });
    }
  });

  // Get roles by permission
  app.get('/api/permissions/:id/roles', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const permissionId = parseInt(req.params.id);
      if (isNaN(permissionId)) {
        return res.status(400).json({ message: 'Invalid permission ID' });
      }

      const permission = await storage.getPermissionById(permissionId);
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      const roles = await storage.getRolesByPermission(permissionId);
      res.status(200).json(roles);
    } catch (error) {
      console.error(`Error fetching roles with permission ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch roles with permission' });
    }
  });
}