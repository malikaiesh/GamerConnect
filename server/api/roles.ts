import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, hasPermission } from '../middleware';

/**
 * Register routes for role management
 */
export function registerRoleRoutes(app: Express) {
  // Get all roles
  app.get('/api/roles', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const roles = await storage.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  });

  // Get a specific role by ID
  app.get('/api/roles/:id', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      res.status(200).json(role);
    } catch (error) {
      console.error(`Error fetching role with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch role' });
    }
  });

  // Create a new role
  app.post('/api/roles', isAuthenticated, hasPermission('users', 'edit'), async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name || name.trim().length < 3) {
        return res.status(400).json({ message: 'Role name must be at least 3 characters' });
      }

      // Check if role with same name already exists
      const existingRole = await storage.getRoleByName(name);
      if (existingRole) {
        return res.status(409).json({ message: 'A role with this name already exists' });
      }

      const newRole = await storage.createRole({
        name,
        description: description || null
      });

      res.status(201).json(newRole);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ message: 'Failed to create role' });
    }
  });

  // Update a role
  app.put('/api/roles/:id', isAuthenticated, hasPermission('users', 'edit'), async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      const { name, description } = req.body;
      
      if (name && name.trim().length < 3) {
        return res.status(400).json({ message: 'Role name must be at least 3 characters' });
      }

      // Prevent modifying the admin role name
      const existingRole = await storage.getRoleById(roleId);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      if (existingRole.name === 'admin' && name && name !== 'admin') {
        return res.status(403).json({ message: 'Cannot modify the admin role name' });
      }

      // Check if new name conflicts with existing role
      if (name && name !== existingRole.name) {
        const roleWithName = await storage.getRoleByName(name);
        if (roleWithName && roleWithName.id !== roleId) {
          return res.status(409).json({ message: 'A role with this name already exists' });
        }
      }

      const updatedRole = await storage.updateRole(roleId, {
        name: name || undefined,
        description: description !== undefined ? description : undefined
      });

      res.status(200).json(updatedRole);
    } catch (error) {
      console.error(`Error updating role with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update role' });
    }
  });

  // Delete a role
  app.delete('/api/roles/:id', isAuthenticated, hasPermission('users', 'edit'), async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      // Prevent deleting the admin role
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      if (role.name === 'admin') {
        return res.status(403).json({ message: 'Cannot delete the admin role' });
      }

      // Check if any users are assigned to this role
      const usersWithRole = await storage.getUsersByRoleId(roleId);
      if (usersWithRole.length > 0) {
        return res.status(409).json({ 
          message: 'Cannot delete a role that is assigned to users',
          usersCount: usersWithRole.length
        });
      }

      await storage.deleteRole(roleId);
      res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error(`Error deleting role with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete role' });
    }
  });

  // Get all permissions for a role
  app.get('/api/roles/:id/permissions', isAuthenticated, hasPermission('users', 'view'), async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      const permissions = await storage.getRolePermissions(roleId);
      res.status(200).json(permissions);
    } catch (error) {
      console.error(`Error fetching permissions for role ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch role permissions' });
    }
  });

  // Assign a permission to a role
  app.post('/api/roles/:roleId/permissions/:permissionId', isAuthenticated, hasPermission('users', 'edit'), async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);

      if (isNaN(roleId) || isNaN(permissionId)) {
        return res.status(400).json({ message: 'Invalid role ID or permission ID' });
      }

      // Check if role exists
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      // Check if permission exists
      const permission = await storage.getPermissionById(permissionId);
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      // Check if permission is already assigned to the role
      const existingAssignment = await storage.hasRolePermission(roleId, permissionId);
      if (existingAssignment) {
        return res.status(409).json({ message: 'Permission is already assigned to this role' });
      }

      await storage.assignPermissionToRole(roleId, permissionId);
      res.status(201).json({ 
        roleId, 
        permissionId,
        message: 'Permission assigned to role successfully'
      });
    } catch (error) {
      console.error(`Error assigning permission ${req.params.permissionId} to role ${req.params.roleId}:`, error);
      res.status(500).json({ message: 'Failed to assign permission to role' });
    }
  });

  // Remove a permission from a role
  app.delete('/api/roles/:roleId/permissions/:permissionId', isAuthenticated, hasPermission('users', 'edit'), async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);

      if (isNaN(roleId) || isNaN(permissionId)) {
        return res.status(400).json({ message: 'Invalid role ID or permission ID' });
      }

      // Check if role exists
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      // Prevent modifying admin role permissions
      if (role.name === 'admin') {
        return res.status(403).json({ message: 'Cannot modify permissions for the admin role' });
      }

      // Check if permission exists
      const permission = await storage.getPermissionById(permissionId);
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      // Check if permission is assigned to the role
      const hasPermission = await storage.hasRolePermission(roleId, permissionId);
      if (!hasPermission) {
        return res.status(404).json({ message: 'Permission is not assigned to this role' });
      }

      await storage.removePermissionFromRole(roleId, permissionId);
      res.status(200).json({ 
        roleId, 
        permissionId,
        message: 'Permission removed from role successfully'
      });
    } catch (error) {
      console.error(`Error removing permission ${req.params.permissionId} from role ${req.params.roleId}:`, error);
      res.status(500).json({ message: 'Failed to remove permission from role' });
    }
  });
}