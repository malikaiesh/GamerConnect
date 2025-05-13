import { Router } from 'express';
import { storage } from '../storage';
import { isAdmin } from '../middleware';

const router = Router();

// Get all permissions
router.get('/', isAdmin, async (req, res) => {
  try {
    const permissions = await storage.getPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific permission by ID
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid permission ID' });
    }

    const permission = await storage.getPermissionById(id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    res.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get permissions by resource
router.get('/resource/:resource', isAdmin, async (req, res) => {
  try {
    const { resource } = req.params;
    const permissions = await storage.getPermissionsByResource(resource);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions by resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;