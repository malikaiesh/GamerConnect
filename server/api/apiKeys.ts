import { Request, Response } from 'express';
import { Express } from 'express';
import { storage } from '../storage';
import { insertApiKeySchema } from '@shared/schema';
import { z } from 'zod';

export function registerApiKeyRoutes(app: Express) {
  // Middleware to check admin access
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };

  // Get all API keys (admin only)
  app.get('/api/api-keys', requireAdmin, async (req: Request, res: Response) => {
    try {
      const apiKeys = await storage.getApiKeys();
      return res.status(200).json(apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return res.status(500).json({ message: 'Failed to fetch API keys' });
    }
  });

  // Get API key by ID (admin only)
  app.get('/api/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid API key ID' });
      }

      const apiKey = await storage.getApiKeyById(id);
      if (!apiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }

      return res.status(200).json(apiKey);
    } catch (error) {
      console.error(`Error fetching API key with ID ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch API key' });
    }
  });

  // Get active API key by type (used by the application)
  app.get('/api/api-keys/type/:type', async (req: Request, res: Response) => {
    try {
      const type = req.params.type;
      if (!type) {
        return res.status(400).json({ message: 'API key type is required' });
      }

      const apiKey = await storage.getApiKeyByType(type);
      if (!apiKey) {
        return res.status(404).json({ message: 'No active API key found for this type' });
      }

      return res.status(200).json(apiKey);
    } catch (error) {
      console.error(`Error fetching API key with type ${req.params.type}:`, error);
      return res.status(500).json({ message: 'Failed to fetch API key' });
    }
  });

  // Create new API key (admin only)
  app.post('/api/api-keys', requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertApiKeySchema.parse(req.body);
      const newApiKey = await storage.createApiKey(validatedData);
      return res.status(201).json(newApiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating API key:', error);
      return res.status(500).json({ message: 'Failed to create API key' });
    }
  });

  // Update API key (admin only)
  app.put('/api/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid API key ID' });
      }

      const existingApiKey = await storage.getApiKeyById(id);
      if (!existingApiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }

      const validatedData = insertApiKeySchema.partial().parse(req.body);
      const updatedApiKey = await storage.updateApiKey(id, validatedData);
      return res.status(200).json(updatedApiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating API key with ID ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to update API key' });
    }
  });

  // Delete API key (admin only)
  app.delete('/api/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid API key ID' });
      }

      const deleted = await storage.deleteApiKey(id);
      if (!deleted) {
        return res.status(404).json({ message: 'API key not found or already deleted' });
      }

      return res.status(200).json({ message: 'API key deleted successfully' });
    } catch (error) {
      console.error(`Error deleting API key with ID ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to delete API key' });
    }
  });
}