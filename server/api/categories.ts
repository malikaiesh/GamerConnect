import { Request, Response, Router } from 'express';
import { isAdmin, isAuthenticated } from '../middleware/auth';
import { db } from '../../db';
import { gameCategories, insertGameCategorySchema } from '@shared/schema';
import { eq, desc, asc } from 'drizzle-orm';
import slugify from '../utils/slugify';
import { z } from 'zod';

const router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    
    let query = db.select().from(gameCategories);
    
    // Filter out inactive categories unless specifically requested
    if (!includeInactive) {
      query = query.where(eq(gameCategories.isActive, true));
    }
    
    // Order by displayOrder and then name
    const categories = await query.orderBy(asc(gameCategories.displayOrder), asc(gameCategories.name));
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get a single category by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const results = await db.select().from(gameCategories).where(eq(gameCategories.id, id)).limit(1);
    
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// Create a new category (admin only)
router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Generate slug if not provided
    if (!req.body.slug && req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    
    // Validate category data
    const validatedData = insertGameCategorySchema.parse(req.body);
    
    // Insert new category
    const newCategory = await db.insert(gameCategories).values({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(newCategory[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid category data', errors: error.errors });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// Update an existing category (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Generate slug if not provided but name is changed
    if (!req.body.slug && req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    
    // Validate category data with partial schema (allow updates to specific fields)
    const validatedData = insertGameCategorySchema.partial().parse(req.body);
    
    // Update the category
    const updatedCategory = await db.update(gameCategories)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(gameCategories.id, id))
      .returning();
    
    if (!updatedCategory || updatedCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(updatedCategory[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid category data', errors: error.errors });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// Delete a category (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Check if category exists
    const category = await db.select().from(gameCategories).where(eq(gameCategories.id, id)).limit(1);
    
    if (!category || category.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Delete the category
    await db.delete(gameCategories).where(eq(gameCategories.id, id));
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

export const registerCategoryRoutes = (app: Router) => {
  app.use('/categories', router);
};