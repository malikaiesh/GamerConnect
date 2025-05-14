import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { isAdmin } from '../middleware/auth';
import { urlRedirectInsertSchema, urlRedirectUpdateSchema } from '@shared/schema';
import { z } from 'zod';

export function registerUrlRedirectRoutes(app: Express) {
  const apiPrefix = '/api/redirects';

  // Get all redirects (admin only)
  app.get(`${apiPrefix}`, isAdmin, async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { redirects, total } = await storage.getAllRedirects(page, limit, search);
      
      return res.status(200).json({
        redirects,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching redirects:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a single redirect by ID (admin only)
  app.get(`${apiPrefix}/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const redirect = await storage.getRedirect(id);
      if (!redirect) {
        return res.status(404).json({ error: 'Redirect not found' });
      }

      return res.status(200).json(redirect);
    } catch (error) {
      console.error('Error fetching redirect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new redirect (admin only)
  app.post(`${apiPrefix}`, isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate and parse the request body
      const validatedData = urlRedirectInsertSchema.parse(req.body);
      
      // Create the redirect
      const newRedirect = await storage.createRedirect(validatedData);
      
      return res.status(201).json(newRedirect);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error creating redirect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update a redirect (admin only)
  app.put(`${apiPrefix}/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Check if redirect exists
      const existingRedirect = await storage.getRedirect(id);
      if (!existingRedirect) {
        return res.status(404).json({ error: 'Redirect not found' });
      }

      // Validate and parse the request body
      const validatedData = urlRedirectUpdateSchema.parse(req.body);
      
      // Update the redirect
      const updatedRedirect = await storage.updateRedirect(id, validatedData);
      
      return res.status(200).json(updatedRedirect);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error updating redirect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a redirect (admin only)
  app.delete(`${apiPrefix}/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Check if redirect exists
      const existingRedirect = await storage.getRedirect(id);
      if (!existingRedirect) {
        return res.status(404).json({ error: 'Redirect not found' });
      }

      // Delete the redirect
      await storage.deleteRedirect(id);
      
      return res.status(200).json({ message: 'Redirect deleted successfully' });
    } catch (error) {
      console.error('Error deleting redirect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle redirect active status (admin only)
  app.patch(`${apiPrefix}/:id/toggle`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Check if redirect exists
      const existingRedirect = await storage.getRedirect(id);
      if (!existingRedirect) {
        return res.status(404).json({ error: 'Redirect not found' });
      }

      // Toggle the active status
      const updatedRedirect = await storage.updateRedirect(id, {
        isActive: !existingRedirect.isActive
      });
      
      return res.status(200).json(updatedRedirect);
    } catch (error) {
      console.error('Error toggling redirect status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}