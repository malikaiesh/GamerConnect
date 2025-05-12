import { Request, Response } from "express";
import { Express } from "express";
import { storage } from "../storage";
import { insertStaticPageSchema } from "@shared/schema";
import { z } from "zod";

export function registerPagesRoutes(app: Express) {
  // Get all pages with optional filtering and pagination
  app.get('/api/pages', async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string | undefined;
      const pageType = req.query.pageType as string | undefined;
      const status = req.query.status as string | undefined;
      
      const result = await storage.getStaticPages({
        page,
        limit,
        search,
        pageType,
        status: status as 'active' | 'inactive' | undefined
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Failed to fetch pages' });
    }
  });
  
  // Get page by ID
  app.get('/api/pages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid page ID' });
      }
      
      const page = await storage.getStaticPageById(id);
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });
  
  // Get page by slug
  app.get('/api/pages/by-slug/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const page = await storage.getStaticPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      res.json(page);
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });
  
  // Get page by type
  app.get('/api/pages/by-type/:type', async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      
      const page = await storage.getStaticPageByType(type);
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      res.json(page);
    } catch (error) {
      console.error('Error fetching page by type:', error);
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });
  
  // Create a new page
  app.post('/api/pages', async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Admin privileges required' });
      }
      
      // Validate input
      const validatedData = insertStaticPageSchema.parse({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Check if a page with this slug already exists
      const existingPage = await storage.getStaticPageBySlug(validatedData.slug);
      if (existingPage) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }
      
      // Check if a page with this type already exists (except for custom)
      if (validatedData.pageType !== 'custom') {
        const existingPageType = await storage.getStaticPageByType(validatedData.pageType);
        if (existingPageType) {
          return res.status(400).json({ 
            error: `A page with type "${validatedData.pageType}" already exists. You can only have one page of each type (except custom).`
          });
        }
      }
      
      const newPage = await storage.createStaticPage(validatedData);
      
      res.status(201).json(newPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      
      console.error('Error creating page:', error);
      res.status(500).json({ error: 'Failed to create page' });
    }
  });
  
  // Update a page
  app.put('/api/pages/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Admin privileges required' });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid page ID' });
      }
      
      // Check if page exists
      const existingPage = await storage.getStaticPageById(id);
      
      if (!existingPage) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      // Validate input
      const validatedData = insertStaticPageSchema.parse({
        ...req.body,
        updatedAt: new Date()
      });
      
      // Check if a page with this slug already exists (excluding current page)
      const pageWithSlug = await storage.getStaticPageBySlug(validatedData.slug);
      if (pageWithSlug && pageWithSlug.id !== id) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }
      
      // Check if changing to a page type that already exists
      if (validatedData.pageType !== 'custom' && validatedData.pageType !== existingPage.pageType) {
        const existingPageType = await storage.getStaticPageByType(validatedData.pageType);
        if (existingPageType && existingPageType.id !== id) {
          return res.status(400).json({ 
            error: `A page with type "${validatedData.pageType}" already exists. You can only have one page of each type (except custom).`
          });
        }
      }
      
      // Update the page
      const updatedPage = await storage.updateStaticPage(id, validatedData);
      
      if (!updatedPage) {
        return res.status(500).json({ error: 'Failed to update page' });
      }
      
      res.json(updatedPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      
      console.error('Error updating page:', error);
      res.status(500).json({ error: 'Failed to update page' });
    }
  });
  
  // Delete a page
  app.delete('/api/pages/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Admin privileges required' });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid page ID' });
      }
      
      // Check if page exists
      const existingPage = await storage.getStaticPageById(id);
      
      if (!existingPage) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      const deleted = await storage.deleteStaticPage(id);
      
      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete page' });
      }
      
      res.json({ success: true, message: 'Page deleted successfully' });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  });
}