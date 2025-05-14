import express, { Request, Response } from "express";
import { storage } from "../storage";
import { insertUrlRedirectSchema } from "@shared/schema";
import { z } from "zod";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

// Get all redirects with pagination and search
router.get('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';

    const redirects = await storage.getUrlRedirects({
      page,
      limit,
      search
    });

    return res.status(200).json(redirects);
  } catch (error) {
    console.error('Error fetching URL redirects:', error);
    return res.status(500).json({
      message: 'Failed to fetch URL redirects'
    });
  }
});

// Get redirect by ID
router.get('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const redirect = await storage.getUrlRedirectById(id);

    if (!redirect) {
      return res.status(404).json({
        message: 'URL redirect not found'
      });
    }

    return res.status(200).json(redirect);
  } catch (error) {
    console.error(`Error fetching URL redirect:`, error);
    return res.status(500).json({
      message: 'Failed to fetch URL redirect'
    });
  }
});

// Create a new redirect
router.post('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = insertUrlRedirectSchema.parse(req.body);
    
    const redirect = await storage.createUrlRedirect(validatedData);
    return res.status(201).json(redirect);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error creating URL redirect:', error);
    return res.status(500).json({
      message: 'Failed to create URL redirect'
    });
  }
});

// Update a redirect
router.put('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertUrlRedirectSchema.partial().parse(req.body);
    
    const redirect = await storage.updateUrlRedirect(id, validatedData);
    
    if (!redirect) {
      return res.status(404).json({
        message: 'URL redirect not found'
      });
    }
    
    return res.status(200).json(redirect);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error updating URL redirect:', error);
    return res.status(500).json({
      message: 'Failed to update URL redirect'
    });
  }
});

// Delete a redirect
router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteUrlRedirect(id);
    
    if (!deleted) {
      return res.status(404).json({
        message: 'URL redirect not found'
      });
    }
    
    return res.status(200).json({
      message: 'URL redirect deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting URL redirect:', error);
    return res.status(500).json({
      message: 'Failed to delete URL redirect'
    });
  }
});

export function registerUrlRedirectRoutes(app: express.Express) {
  app.use('/api/redirects', router);
}