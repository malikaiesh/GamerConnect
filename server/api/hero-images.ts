import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { eq, asc, desc } from 'drizzle-orm';
import { heroImages, insertHeroImageSchema, type HeroImage, type InsertHeroImage } from '@shared/schema';
import { db } from "@db";
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

// Validation schemas
const createHeroImageSchema = insertHeroImageSchema.omit({ id: true, createdAt: true, updatedAt: true });
const updateHeroImageSchema = insertHeroImageSchema.partial().omit({ id: true, createdAt: true });

// GET /api/hero-images - Get all hero images (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const images = await db
      .select()
      .from(heroImages)
      .where(eq(heroImages.isActive, true))
      .orderBy(asc(heroImages.sortOrder), desc(heroImages.createdAt));

    res.json(images);
  } catch (error) {
    console.error('Error fetching hero images:', error);
    res.status(500).json({ error: 'Failed to fetch hero images' });
  }
});

// GET /api/hero-images/admin - Get all hero images for admin (including inactive)
router.get('/admin', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const images = await db
      .select()
      .from(heroImages)
      .orderBy(asc(heroImages.sortOrder), desc(heroImages.createdAt));

    res.json(images);
  } catch (error) {
    console.error('Error fetching admin hero images:', error);
    res.status(500).json({ error: 'Failed to fetch hero images' });
  }
});

// POST /api/hero-images - Create new hero image
router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = createHeroImageSchema.parse(req.body);
    
    const [newImage] = await db
      .insert(heroImages)
      .values(validatedData)
      .returning();

    res.status(201).json(newImage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating hero image:', error);
    res.status(500).json({ error: 'Failed to create hero image' });
  }
});

// PUT /api/hero-images/:id - Update hero image
router.put('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = updateHeroImageSchema.parse(req.body);
    
    const [updatedImage] = await db
      .update(heroImages)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(heroImages.id, id))
      .returning();

    if (!updatedImage) {
      return res.status(404).json({ error: 'Hero image not found' });
    }

    res.json(updatedImage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating hero image:', error);
    res.status(500).json({ error: 'Failed to update hero image' });
  }
});

// DELETE /api/hero-images/:id - Delete hero image
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const [deletedImage] = await db
      .delete(heroImages)
      .where(eq(heroImages.id, id))
      .returning();

    if (!deletedImage) {
      return res.status(404).json({ error: 'Hero image not found' });
    }

    res.json({ message: 'Hero image deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero image:', error);
    res.status(500).json({ error: 'Failed to delete hero image' });
  }
});

// PATCH /api/hero-images/:id/toggle - Toggle hero image active status
router.patch('/:id/toggle', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get current status
    const [currentImage] = await db
      .select()
      .from(heroImages)
      .where(eq(heroImages.id, id));

    if (!currentImage) {
      return res.status(404).json({ error: 'Hero image not found' });
    }

    // Toggle status
    const [updatedImage] = await db
      .update(heroImages)
      .set({ isActive: !currentImage.isActive, updatedAt: new Date() })
      .where(eq(heroImages.id, id))
      .returning();

    res.json(updatedImage);
  } catch (error) {
    console.error('Error toggling hero image status:', error);
    res.status(500).json({ error: 'Failed to toggle hero image status' });
  }
});

// POST /api/hero-images/reorder - Reorder hero images
router.post('/reorder', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { imageIds } = req.body;
    
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'Invalid image IDs array' });
    }

    // Update sort order for each image
    for (let i = 0; i < imageIds.length; i++) {
      await db
        .update(heroImages)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(eq(heroImages.id, imageIds[i]));
    }

    res.json({ message: 'Hero images reordered successfully' });
  } catch (error) {
    console.error('Error reordering hero images:', error);
    res.status(500).json({ error: 'Failed to reorder hero images' });
  }
});

export function registerHeroImageRoutes(app: Router) {
  app.use('/api/hero-images', router);
}