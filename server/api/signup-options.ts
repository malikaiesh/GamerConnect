import express, { type Express } from 'express';
import { db } from '../db';
import { signupOptions, insertSignupOptionSchema, type SignupOption, type InsertSignupOption } from '@shared/schema';
import { eq, asc } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

export function registerSignupOptionsRoutes(app: Express) {
  app.use('/api/signup-options', router);
}

// Get all signup options (public endpoint - for signup page)
router.get('/', async (req, res) => {
  try {
    const options = await db
      .select()
      .from(signupOptions)
      .orderBy(asc(signupOptions.sortOrder));

    res.json(options);
  } catch (error) {
    console.error('Error fetching signup options:', error);
    res.status(500).json({ error: 'Failed to fetch signup options' });
  }
});

// Get enabled signup options only (public endpoint)
router.get('/enabled', async (req, res) => {
  try {
    const options = await db
      .select()
      .from(signupOptions)
      .where(eq(signupOptions.isEnabled, true))
      .orderBy(asc(signupOptions.sortOrder));

    res.json(options);
  } catch (error) {
    console.error('Error fetching enabled signup options:', error);
    res.status(500).json({ error: 'Failed to fetch enabled signup options' });
  }
});

// Get single signup option by ID (admin only)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid signup option ID' });
    }

    const [option] = await db
      .select()
      .from(signupOptions)
      .where(eq(signupOptions.id, id));

    if (!option) {
      return res.status(404).json({ error: 'Signup option not found' });
    }

    res.json(option);
  } catch (error) {
    console.error('Error fetching signup option:', error);
    res.status(500).json({ error: 'Failed to fetch signup option' });
  }
});

// Update signup option (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid signup option ID' });
    }

    // Validate the request body
    const validatedData = insertSignupOptionSchema.partial().parse(req.body);

    const [updatedOption] = await db
      .update(signupOptions)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(signupOptions.id, id))
      .returning();

    if (!updatedOption) {
      return res.status(404).json({ error: 'Signup option not found' });
    }

    res.json(updatedOption);
  } catch (error) {
    console.error('Error updating signup option:', error);
    res.status(500).json({ error: 'Failed to update signup option' });
  }
});

// Toggle signup option enabled status (admin only)
router.patch('/:id/toggle', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid signup option ID' });
    }

    // Get current option
    const [currentOption] = await db
      .select()
      .from(signupOptions)
      .where(eq(signupOptions.id, id));

    if (!currentOption) {
      return res.status(404).json({ error: 'Signup option not found' });
    }

    // Toggle the enabled status
    const [updatedOption] = await db
      .update(signupOptions)
      .set({
        isEnabled: !currentOption.isEnabled,
        updatedAt: new Date()
      })
      .where(eq(signupOptions.id, id))
      .returning();

    res.json(updatedOption);
  } catch (error) {
    console.error('Error toggling signup option:', error);
    res.status(500).json({ error: 'Failed to toggle signup option' });
  }
});

// Update sort order for multiple options (admin only)
router.patch('/reorder', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { reorderedOptions } = req.body;

    if (!Array.isArray(reorderedOptions)) {
      return res.status(400).json({ error: 'Invalid reorder data' });
    }

    // Update sort order for each option
    for (const item of reorderedOptions) {
      await db
        .update(signupOptions)
        .set({
          sortOrder: item.sortOrder,
          updatedAt: new Date()
        })
        .where(eq(signupOptions.id, item.id));
    }

    // Return updated options
    const updatedOptions = await db
      .select()
      .from(signupOptions)
      .orderBy(asc(signupOptions.sortOrder));

    res.json(updatedOptions);
  } catch (error) {
    console.error('Error reordering signup options:', error);
    res.status(500).json({ error: 'Failed to reorder signup options' });
  }
});