import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { ApiKey, insertApiKeySchema } from '@shared/schema';
import { ZodError } from 'zod';

export function registerApiKeyRoutes(app: Express) {
  // Middleware to require admin authentication
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Get all API keys
  app.get('/api/api-keys', requireAdmin, async (req: Request, res: Response) => {
    try {
      const apiKeys = await storage.getApiKeys();
      return res.status(200).json(apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return res.status(500).json({ message: 'Error fetching API keys' });
    }
  });

  // Get API key by ID
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
      console.error('Error fetching API key:', error);
      return res.status(500).json({ message: 'Error fetching API key' });
    }
  });

  // Get API key by type
  app.get('/api/api-keys/type/:type', async (req: Request, res: Response) => {
    try {
      const type = req.params.type;
      if (!type) {
        return res.status(400).json({ message: 'Invalid API key type' });
      }

      const apiKey = await storage.getApiKeyByType(type);
      if (!apiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }

      return res.status(200).json(apiKey);
    } catch (error) {
      console.error('Error fetching API key by type:', error);
      return res.status(500).json({ message: 'Error fetching API key' });
    }
  });

  // Create API key
  app.post('/api/api-keys', requireAdmin, async (req: Request, res: Response) => {
    try {
      const apiKeyData = insertApiKeySchema.parse(req.body);
      
      const apiKey = await storage.createApiKey({
        ...apiKeyData,
      });

      return res.status(201).json(apiKey);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid API key data', errors: error.errors });
      }
      console.error('Error creating API key:', error);
      return res.status(500).json({ message: 'Error creating API key' });
    }
  });

  // Update API key
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

      // Only validate the fields that are being updated
      const apiKeyData = req.body;
      
      const updatedApiKey = await storage.updateApiKey(id, apiKeyData);
      return res.status(200).json(updatedApiKey);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid API key data', errors: error.errors });
      }
      console.error('Error updating API key:', error);
      return res.status(500).json({ message: 'Error updating API key' });
    }
  });

  // Delete API key
  app.delete('/api/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid API key ID' });
      }

      const existingApiKey = await storage.getApiKeyById(id);
      if (!existingApiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }

      const success = await storage.deleteApiKey(id);
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete API key' });
      }

      return res.status(200).json({ message: 'API key deleted successfully' });
    } catch (error) {
      console.error('Error deleting API key:', error);
      return res.status(500).json({ message: 'Error deleting API key' });
    }
  });
}