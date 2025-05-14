import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertHomePageContentSchema } from "@shared/schema";
import { z } from "zod";

export function registerHomePageContentRoutes(app: Express) {
  // Get all homepage content
  app.get('/api/homepage-content', async (req: Request, res: Response) => {
    try {
      const contents = await storage.getHomePageContents();
      res.json(contents);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get only active homepage content
  app.get('/api/homepage-content/active', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2; // Default to 2 items
      const page = parseInt(req.query.page as string) || 1; // Default to page 1
      
      const { contents, total } = await storage.getActiveHomePageContents(limit, page);
      
      res.json({
        contents,
        pagination: {
          page,
          limit,
          total,
          hasMore: total > page * limit
        }
      });
    } catch (error) {
      console.error('Error fetching active homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get a specific homepage content by ID
  app.get('/api/homepage-content/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const content = await storage.getHomePageContentById(id);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }

      res.json(content);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create a new homepage content (admin only)
  app.post('/api/homepage-content', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const validatedData = insertHomePageContentSchema.parse(req.body);
      const newContent = await storage.createHomePageContent(validatedData);
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update existing homepage content (admin only)
  app.put('/api/homepage-content/:id', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      // Check if content exists
      const existingContent = await storage.getHomePageContentById(id);
      if (!existingContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      // Validate the data (partial validation)
      const partialSchema = insertHomePageContentSchema.partial();
      const validatedData = partialSchema.parse(req.body);

      // Update content
      const updatedContent = await storage.updateHomePageContent(id, validatedData);
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete homepage content (admin only)
  app.delete('/api/homepage-content/:id', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      // Check if content exists
      const existingContent = await storage.getHomePageContentById(id);
      if (!existingContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      // Delete content
      const result = await storage.deleteHomePageContent(id);
      if (result) {
        res.status(200).json({ message: 'Content deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete content' });
      }
    } catch (error) {
      console.error('Error deleting homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}