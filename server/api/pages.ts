import { Request, Response, Express } from "express";
import { storage } from "../storage";
import { insertStaticPageSchema } from "@shared/schema";
import { z } from "zod";

export function registerPagesRoutes(app: Express) {
  // Get all static pages with pagination and filtering
  app.get('/api/pages', async (req: Request, res: Response) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        pageType: req.query.pageType as string,
        status: req.query.status as 'active' | 'inactive'
      };

      const result = await storage.getStaticPages(options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching static pages:', error);
      res.status(500).json({ error: 'Failed to fetch static pages' });
    }
  });

  // Get a specific static page by ID
  app.get('/api/pages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.getStaticPageById(id);
      
      if (!page) {
        return res.status(404).json({ error: 'Static page not found' });
      }
      
      res.json(page);
    } catch (error) {
      console.error(`Error fetching static page with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch static page' });
    }
  });

  // Get a specific static page by slug
  app.get('/api/pages/by-slug/:slug', async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const page = await storage.getStaticPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ error: 'Static page not found' });
      }
      
      res.json(page);
    } catch (error) {
      console.error(`Error fetching static page with slug ${req.params.slug}:`, error);
      res.status(500).json({ error: 'Failed to fetch static page' });
    }
  });

  // Get a specific static page by type
  app.get('/api/pages/by-type/:type', async (req: Request, res: Response) => {
    try {
      const pageType = req.params.type;
      const page = await storage.getStaticPageByType(pageType);
      
      if (!page) {
        return res.status(404).json({ error: 'Static page not found' });
      }
      
      res.json(page);
    } catch (error) {
      console.error(`Error fetching static page with type ${req.params.type}:`, error);
      res.status(500).json({ error: 'Failed to fetch static page' });
    }
  });

  // Create a new static page
  app.post('/api/pages', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertStaticPageSchema.parse(req.body);
      
      // Create the static page
      const newPage = await storage.createStaticPage(validatedData);
      
      res.status(201).json(newPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating static page:', error);
      res.status(500).json({ error: 'Failed to create static page' });
    }
  });

  // Update a static page
  app.put('/api/pages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body
      const validatedData = insertStaticPageSchema.partial().parse(req.body);
      
      // Update the static page
      const updatedPage = await storage.updateStaticPage(id, validatedData);
      
      if (!updatedPage) {
        return res.status(404).json({ error: 'Static page not found' });
      }
      
      res.json(updatedPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating static page with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update static page' });
    }
  });

  // Delete a static page
  app.delete('/api/pages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStaticPage(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Static page not found' });
      }
      
      res.status(200).json({ message: 'Static page deleted successfully' });
    } catch (error) {
      console.error(`Error deleting static page with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete static page' });
    }
  });
}