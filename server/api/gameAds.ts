import { Request, Response, Express } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertGameAdSchema } from '@shared/schema';
import { isAdmin } from '../middleware/auth';

export function registerGameAdsRoutes(app: Express) {
  // Get all game ads
  app.get('/api/game-ads', async (req: Request, res: Response) => {
    try {
      const gameAds = await storage.getGameAds();
      res.json(gameAds);
    } catch (error) {
      console.error('Error fetching game ads:', error);
      res.status(500).json({ error: 'Failed to fetch game ads' });
    }
  });

  // Get active game ads
  app.get('/api/game-ads/active', async (req: Request, res: Response) => {
    try {
      const gameAds = await storage.getActiveGameAds();
      res.json(gameAds);
    } catch (error) {
      console.error('Error fetching active game ads:', error);
      res.status(500).json({ error: 'Failed to fetch active game ads' });
    }
  });

  // Get a game ad by ID
  app.get('/api/game-ads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      const gameAd = await storage.getGameAdById(id);
      if (!gameAd) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.json(gameAd);
    } catch (error) {
      console.error(`Error fetching game ad with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch game ad' });
    }
  });

  // Get a game ad by position
  app.get('/api/game-ads/position/:position', async (req: Request, res: Response) => {
    try {
      const position = req.params.position;
      const gameAd = await storage.getGameAdByPosition(position);
      if (!gameAd) {
        return res.status(404).json({ error: 'Game ad not found for this position' });
      }

      res.json(gameAd);
    } catch (error) {
      console.error(`Error fetching game ad for position ${req.params.position}:`, error);
      res.status(500).json({ error: 'Failed to fetch game ad by position' });
    }
  });

  // Create a new game ad (supports both code-only and image uploads)
  app.post('/api/game-ads', isAdmin, async (req: Request, res: Response) => {
    try {
      // For code-only ads, we don't require an image
      const gameAdData = {
        ...req.body,
        clickCount: 0,
        impressionCount: 0
      };
      
      // Validate with zod schema
      const validatedData = insertGameAdSchema.parse(gameAdData);
      
      // Create the game ad
      const newGameAd = await storage.createGameAd(validatedData);
      res.status(201).json(newGameAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid game ad data',
          details: error.errors 
        });
      }
      console.error('Error creating game ad:', error);
      res.status(500).json({ error: 'Failed to create game ad' });
    }
  });

  // Update a game ad (PUT - full update)
  app.put('/api/game-ads/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      const gameAdData = insertGameAdSchema.parse(req.body);
      const updatedGameAd = await storage.updateGameAd(id, gameAdData);

      if (!updatedGameAd) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.json(updatedGameAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid game ad data',
          details: error.errors 
        });
      }
      console.error('Error updating game ad:', error);
      res.status(500).json({ error: 'Failed to update game ad' });
    }
  });

  // Update a game ad (PATCH - partial update)
  app.patch('/api/game-ads/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      // For PATCH, validate incoming data manually  
      const allowedFields = ['name', 'position', 'isGoogleAd', 'adCode', 'imageUrl', 'targetUrl', 'startDate', 'endDate', 'status', 'adEnabled'];
      const gameAdData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {} as any);
      const updatedGameAd = await storage.updateGameAd(id, gameAdData);

      if (!updatedGameAd) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.json(updatedGameAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid game ad data',
          details: error.errors 
        });
      }
      console.error('Error updating game ad:', error);
      res.status(500).json({ error: 'Failed to update game ad' });
    }
  });

  // Delete a game ad
  app.delete('/api/game-ads/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      const success = await storage.deleteGameAd(id);
      if (!success) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.status(200).json({ message: 'Game ad deleted successfully' });
    } catch (error) {
      console.error('Error deleting game ad:', error);
      res.status(500).json({ error: 'Failed to delete game ad' });
    }
  });

  // Increment impression count
  app.post('/api/game-ads/:id/impression', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      const success = await storage.incrementGameAdImpressions(id);
      if (!success) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.status(200).json({ message: 'Impression count updated' });
    } catch (error) {
      console.error('Error incrementing game ad impressions:', error);
      res.status(500).json({ error: 'Failed to update impression count' });
    }
  });

  // Increment click count
  app.post('/api/game-ads/:id/click', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      const success = await storage.incrementGameAdClicks(id);
      if (!success) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.status(200).json({ message: 'Click count updated' });
    } catch (error) {
      console.error('Error incrementing game ad clicks:', error);
      res.status(500).json({ error: 'Failed to update click count' });
    }
  });

  // Toggle game ad status (enable/disable)
  app.patch('/api/game-ads/:id/toggle', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid game ad ID' });
      }

      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled field must be a boolean' });
      }

      const updatedGameAd = await storage.updateGameAd(id, { adEnabled: enabled });
      if (!updatedGameAd) {
        return res.status(404).json({ error: 'Game ad not found' });
      }

      res.json(updatedGameAd);
    } catch (error) {
      console.error('Error toggling game ad status:', error);
      res.status(500).json({ error: 'Failed to toggle game ad status' });
    }
  });

  // Bulk toggle all game ads
  app.patch('/api/game-ads/toggle-all', isAdmin, async (req: Request, res: Response) => {
    try {
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled field must be a boolean' });
      }

      const gameAds = await storage.getGameAds();
      const adEnabled = enabled;

      // Update all ads
      await Promise.all(
        gameAds.map(ad => 
          storage.updateGameAd(ad.id, { adEnabled })
        )
      );

      res.status(200).json({ 
        message: `All ads have been ${adEnabled ? 'enabled' : 'disabled'} successfully`,
        count: gameAds.length
      });
    } catch (error) {
      console.error('Error toggling all game ads:', error);
      res.status(500).json({ error: 'Failed to toggle all game ads' });
    }
  });
}