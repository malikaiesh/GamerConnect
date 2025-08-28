import { Router } from 'express';
import { ObjectStorageService } from '../objectStorage.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// Get upload URL for object entity
router.post('/upload', isAuthenticated, async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
});

export default router;