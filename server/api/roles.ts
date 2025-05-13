import { Router } from 'express';
import { storage } from '../storage';
import { isAdmin } from '../middleware';
import { insertRoleSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get all roles
router.get('/', isAdmin, async (req, res) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific role by ID
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    const role = await storage.getRoleById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new role
router.post('/', isAdmin, async (req, res) => {
  try {
    const roleData = insertRoleSchema.parse(req.body);
    
    // Check if role with same name already exists
    const existingRole = await storage.getRoleByName(roleData.name);
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }
    
    const newRole = await storage.createRole(roleData);
    res.status(201).json(newRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a role
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    const roleData = insertRoleSchema.partial().parse(req.body);
    
    // Check if role exists
    const existingRole = await storage.getRoleById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // If name is being changed, check if it conflicts
    if (roleData.name && roleData.name !== existingRole.name) {
      const roleWithSameName = await storage.getRoleByName(roleData.name);
      if (roleWithSameName) {
        return res.status(400).json({ message: 'Role with this name already exists' });
      }
    }
    
    const updatedRole = await storage.updateRole(id, roleData);
    res.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a role
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    // Check if role exists
    const existingRole = await storage.getRoleById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Don't allow deletion of admin role
    if (existingRole.name === 'admin') {
      return res.status(403).json({ message: 'Cannot delete the admin role' });
    }
    
    const success = await storage.deleteRole(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: 'Failed to delete role' });
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get permissions for a role
router.get('/:id/permissions', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    const role = await storage.getRoleById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const permissions = await storage.getRolePermissions(id);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign a permission to a role
router.post('/:roleId/permissions/:permissionId', isAdmin, async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const permissionId = parseInt(req.params.permissionId);
    
    if (isNaN(roleId) || isNaN(permissionId)) {
      return res.status(400).json({ message: 'Invalid role or permission ID' });
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

    const rolePermission = await storage.assignPermissionToRole(roleId, permissionId);
    res.status(201).json(rolePermission);
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a permission from a role
router.delete('/:roleId/permissions/:permissionId', isAdmin, async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const permissionId = parseInt(req.params.permissionId);
    
    if (isNaN(roleId) || isNaN(permissionId)) {
      return res.status(400).json({ message: 'Invalid role or permission ID' });
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
    
    // If this is the admin role and it's trying to remove an essential permission, prevent it
    if (role.name === 'admin') {
      return res.status(403).json({ 
        message: 'Cannot modify permissions for the admin role' 
      });
    }

    const success = await storage.removePermissionFromRole(roleId, permissionId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: 'Failed to remove permission from role' });
    }
  } catch (error) {
    console.error('Error removing permission from role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;