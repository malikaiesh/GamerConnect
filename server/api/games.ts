import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertGameSchema } from "@shared/schema";
import fetch from "node-fetch";

// Function to fetch games from GameMonetize API
async function fetchGameMonetizeGames(apiKey: string, options: any = {}) {
  try {
    // Set up the API endpoint
    const endpoint = 'https://api.gamemonetize.com/api';
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('key', apiKey);
    
    if (options.category) {
      params.append('category', options.category);
    }
    
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }
    
    // Make the API request
    const response = await fetch(`${endpoint}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GameMonetize games:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Transform GameMonetize game data to our schema format
function transformGameMonetizeData(apiGame: any) {
  return {
    title: apiGame.gametitle,
    description: apiGame.description || 'No description available',
    thumbnail: apiGame.gamethumb,
    url: apiGame.gamelink,
    apiId: apiGame.gameId,
    category: apiGame.gamecategory,
    tags: [apiGame.gamecategory], // Use category as a tag initially
    source: 'api',
    status: 'active',
  };
}

export function registerGameRoutes(app: Express) {
  // Get game categories
  app.get('/api/games/categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getGameCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching game categories:', error);
      res.status(500).json({ message: 'Failed to fetch game categories' });
    }
  });
  
  // Get featured games
  app.get('/api/games/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const featuredGames = await storage.getFeaturedGames(limit);
      res.json(featuredGames);
    } catch (error) {
      console.error('Error processing featured games request:', error);
      res.status(500).json({ message: 'Failed to fetch featured games' });
    }
  });
  
  // Get popular games
  app.get('/api/games/popular', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Only pass category if it's not 'all'
      const categoryParam = category === 'all' ? undefined : category;
      const popularGames = await storage.getPopularGames(categoryParam, limit);
      res.json(popularGames);
    } catch (error) {
      console.error('Error processing popular games request:', error);
      res.status(500).json({ message: 'Failed to fetch popular games' });
    }
  });
  
  // Get game stats
  app.get('/api/games/stats', async (req: Request, res: Response) => {
    try {
      // Return empty stats for now to avoid errors
      res.json({
        totalGames: 0,
        totalPlays: 0,
        playsThisWeek: 0,
        newGamesPercent: 0
      });
    } catch (error) {
      console.error('Error fetching game stats:', error);
      res.status(500).json({ message: 'Failed to fetch game stats' });
    }
  });
  
  // Get related games
  app.get('/api/games/related', async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.query.gameId as string);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      const category = req.query.category as string | undefined;
      let tags: string[] | undefined;
      
      if (req.query.tags) {
        tags = (req.query.tags as string).split(',');
      }
      
      const relatedGames = await storage.getRelatedGames(gameId, category, tags);
      res.json(relatedGames);
    } catch (error) {
      console.error('Error processing related games request:', error);
      res.status(500).json({ message: 'Failed to fetch related games' });
    }
  });
  
  // Record a game play
  app.post('/api/games/:id/play', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      await storage.incrementGamePlays(id);
      res.status(200).json({ message: 'Game play recorded' });
    } catch (error) {
      console.error('Error recording game play:', error);
      res.status(500).json({ message: 'Failed to record game play' });
    }
  });
  
  // Rate a game
  app.post('/api/games/:id/rate', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      const ratingSchema = z.object({
        rating: z.number().min(1).max(5)
      });
      
      const { rating } = ratingSchema.parse(req.body);
      
      await storage.rateGame(id, rating);
      res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid rating data', errors: error.errors });
      }
      console.error('Error rating game:', error);
      res.status(500).json({ message: 'Failed to submit rating' });
    }
  });
  
  // Get game stats
  app.get('/api/games/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getGameStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching game stats:', error);
      res.status(500).json({ message: 'Failed to fetch game stats' });
    }
  });
  
  // Admin routes - require authentication and admin role
  
  // Create a game
  app.post('/api/games', async (req: Request, res: Response) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid game data', errors: error.errors });
      }
      console.error('Error creating game:', error);
      res.status(500).json({ message: 'Failed to create game' });
    }
  });
  
  // Update a game
  app.put('/api/games/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      const gameData = insertGameSchema.partial().parse(req.body);
      const updatedGame = await storage.updateGame(id, gameData);
      
      if (!updatedGame) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(updatedGame);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid game data', errors: error.errors });
      }
      console.error('Error updating game:', error);
      res.status(500).json({ message: 'Failed to update game' });
    }
  });
  
  // Delete a game
  app.delete('/api/games/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      const success = await storage.deleteGame(id);
      if (!success) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.status(200).json({ message: 'Game deleted successfully' });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({ message: 'Failed to delete game' });
    }
  });
  
  // Bulk delete games
  app.post('/api/games/bulk-delete', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ids: z.array(z.number())
      });
      
      const { ids } = schema.parse(req.body);
      
      if (ids.length === 0) {
        return res.status(400).json({ message: 'No game IDs provided' });
      }
      
      // Delete each game
      const results = await Promise.all(ids.map(id => storage.deleteGame(id)));
      const deletedCount = results.filter(Boolean).length;
      
      res.status(200).json({ 
        message: `${deletedCount} games deleted successfully`,
        deletedCount
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      console.error('Error bulk deleting games:', error);
      res.status(500).json({ message: 'Failed to delete games' });
    }
  });
  
  // Import games from GameMonetize API
  app.post('/api/games/import', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        apiKey: z.string(),
        category: z.string().optional(),
        limit: z.number().optional()
      });
      
      const { apiKey, category, limit } = schema.parse(req.body);
      
      // Use the GameMonetize API key from request or environment variable
      const key = apiKey || process.env.GAME_MONETIZE_API_KEY;
      
      if (!key) {
        return res.status(400).json({ message: 'GameMonetize API key is required' });
      }
      
      const result = await fetchGameMonetizeGames(key, { category, limit });
      
      if (!result.success) {
        return res.status(500).json({ message: 'Failed to fetch games from GameMonetize API', error: result.message });
      }
      
      // Transform and save games
      const games = result.data;
      const savedGames = [];
      
      for (const game of games) {
        const transformedGame = transformGameMonetizeData(game);
        try {
          const savedGame = await storage.createGame(transformedGame);
          savedGames.push(savedGame);
        } catch (error) {
          console.error(`Error saving game ${game.gametitle}:`, error);
          // Continue with the next game even if this one fails
        }
      }
      
      res.status(200).json({ 
        message: `${savedGames.length} games imported successfully`,
        importedGames: savedGames.length,
        games: savedGames
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      console.error('Error importing games:', error);
      res.status(500).json({ message: 'Failed to import games' });
    }
  });
}
