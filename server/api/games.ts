import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertGameSchema } from "@shared/schema";
import fetch from "node-fetch";
import { imageProcessingService } from '../services/image-processing';
import { createSeoSchemaGenerator } from '../services/seoSchemaGenerator';
import slugify from '../utils/slugify';
import fs from 'fs/promises';
import path from 'path';

// Interface for GameMonetize API response
interface GameMonetizeResponse {
  success: boolean;
  data: any[];
  message?: string;
}

// Function to fetch games from GameMonetize API
async function fetchGameMonetizeGames(apiKey: string, options: any = {}): Promise<GameMonetizeResponse> {
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
    
    const responseData = await response.json();
    
    return {
      success: true,
      data: Array.isArray(responseData) ? responseData : [],
    };
  } catch (error) {
    console.error('Error fetching GameMonetize games:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Download and process thumbnail from URL
async function downloadAndProcessThumbnail(thumbnailUrl: string, gameTitle: string): Promise<{url: string, altText: string} | null> {
  try {
    console.log(`Downloading thumbnail for "${gameTitle}" from: ${thumbnailUrl}`);
    
    // Download the image
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`Failed to download thumbnail: ${response.status}`);
    }
    
    // Create temp file path
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const fileExt = path.extname(new URL(thumbnailUrl).pathname) || '.jpg';
    const tempFileName = `game-thumb-${Date.now()}${fileExt}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Save the downloaded image
    const buffer = await response.buffer();
    await fs.writeFile(tempFilePath, buffer);
    
    // Process the image (convert to WebP, compress, generate alt text)
    const processed = await imageProcessingService.processImage(tempFilePath, {
      quality: 85,
      maxWidth: 800,  // Smaller size for game thumbnails
      maxHeight: 600,
      generateAltText: true,
    });
    
    // Clean up temp file
    await fs.unlink(tempFilePath);
    
    const webpUrl = imageProcessingService.getImageUrl(processed.webpPath);
    
    console.log(`✓ Processed thumbnail for "${gameTitle}": ${processed.compressionRatio}% compression, alt text: "${processed.altText}"`);
    
    return {
      url: webpUrl,
      altText: processed.altText
    };
  } catch (error) {
    console.error(`Failed to process thumbnail for "${gameTitle}":`, error);
    return null;
  }
}

// Transform GameMonetize game data to our schema format
function transformGameMonetizeData(apiGame: any) {
  return {
    title: apiGame.gametitle,
    slug: slugify(apiGame.gametitle),
    description: apiGame.description || 'No description available',
    thumbnail: apiGame.gamethumb,
    url: apiGame.gamelink,
    apiId: apiGame.gameId,
    category: apiGame.gamecategory,
    tags: [apiGame.gamecategory], // Use category as a tag initially
    source: 'api' as const, // Use 'as const' to ensure it matches the expected type
    status: 'active' as const, // Use 'as const' to ensure it matches the expected type
  };
}

export function registerGameRoutes(app: Express) {
  // Get all games with filtering and pagination
  app.get('/api/games', async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;
      const source = req.query.source as string | undefined;
      
      // Handle our special "all_*" filter values
      const categoryParam = category === 'all_categories' ? undefined : category;
      const statusParam = status === 'all_statuses' ? undefined : status;
      const sourceParam = source === 'all' ? undefined : source;
      
      const options = {
        page,
        limit,
        search,
        category: categoryParam,
        status: statusParam,
        source: sourceParam
      };
      
      const result = await storage.getGames(options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Failed to fetch games' });
    }
  });

  // Get game categories
  app.get('/api/games/categories', async (req: Request, res: Response) => {
    try {
      // Set cache headers to improve performance
      res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
      
      const categories = await storage.getGameCategories();
      
      if (!categories || categories.length === 0) {
        // If no categories found, return a default set
        return res.json(['Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy']);
      }
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching game categories:', error);
      // Return a default set of categories on error
      res.json(['Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy']);
    }
  });
  
  // Get a random game
  app.get('/api/games/random', async (req: Request, res: Response) => {
    try {
      // Get all active games
      const { games } = await storage.getGames({
        status: 'active',
        limit: 1000 // Set a high limit to get all active games
      });
      
      if (games.length === 0) {
        return res.status(404).json({ error: 'No games found' });
      }
      
      // Select a random game
      const randomIndex = Math.floor(Math.random() * games.length);
      const randomGame = games[randomIndex];
      
      res.status(200).json(randomGame);
    } catch (error: any) {
      console.error('Error fetching random game:', error);
      res.status(500).json({ error: 'Failed to fetch random game', details: error.message });
    }
  });

  // Get featured games
  app.get('/api/games/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10; // Default to 10 featured games
      const featuredGames = await storage.getFeaturedGames(limit);
      res.json(featuredGames);
    } catch (error) {
      console.error('Error processing featured games request:', error);
      res.status(500).json({ message: 'Failed to fetch featured games' });
    }
  });
  
  // Get popular games (all uploaded games)
  app.get('/api/games/popular', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const offset = (page - 1) * limit; // Calculate proper offset based on page
      
      // Use getGames to get both active and featured games with proper pagination
      const { games, total } = await storage.getGames({
        page,
        limit,
        offset, // Add explicit offset
        status: undefined, // Include all statuses to show both active and featured games
        category: category === 'all' ? undefined : category
      });
      
      // Return both games and pagination metadata
      res.json({
        games,
        pagination: {
          page,
          limit,
          offset,
          total,
          hasMore: offset + games.length < total
        }
      });
    } catch (error) {
      console.error('Error processing popular games request:', error);
      res.status(500).json({ message: 'Failed to fetch popular games' });
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
  
  // Get top games (most played)
  app.get('/api/games/top', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      // Reuse the popular games endpoint but with a smaller limit
      const topGames = await storage.getPopularGames(undefined, limit);
      res.json(topGames);
    } catch (error) {
      console.error('Error fetching top games:', error);
      res.status(500).json({ message: 'Failed to fetch top games' });
    }
  });
  
  // Get top game categories
  app.get('/api/games/categories/top', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      // For now, just return the first few categories
      const allCategories = await storage.getGameCategories();
      const topCategories = allCategories.slice(0, limit);
      res.json(topCategories);
    } catch (error) {
      console.error('Error fetching top game categories:', error);
      res.status(500).json({ message: 'Failed to fetch top game categories' });
    }
  });
  
  // Get related games for a specific game
  app.get('/api/games/related', async (req: Request, res: Response) => {
    try {
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : 0;
      const category = req.query.category as string | undefined;
      const tagsParam = req.query.tags as string | undefined;
      
      if (!gameId) {
        return res.status(400).json({ message: 'Game ID is required' });
      }
      
      // Parse tags if provided
      const tags = tagsParam ? tagsParam.split(',') : undefined;
      
      const relatedGames = await storage.getRelatedGames(gameId, category, tags);
      res.json(relatedGames);
    } catch (error) {
      console.error('Error fetching related games:', error);
      res.status(500).json({ message: 'Failed to fetch related games' });
    }
  });
  
  // Get a game by ID
  app.get('/api/games/:id([0-9]+)', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGameById(id);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching game by ID:', error);
      res.status(500).json({ message: 'Failed to fetch game' });
    }
  });
  
  // Get a game by slug
  app.get('/api/games/slug/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const game = await storage.getGameBySlug(slug);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching game by slug:', error);
      res.status(500).json({ message: 'Failed to fetch game' });
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
  
  // Admin routes - require authentication and admin role
  
  // Create a game
  app.post('/api/games', async (req: Request, res: Response) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      
      // Auto-generate SEO schema for the new game
      try {
        const schemaGenerator = await createSeoSchemaGenerator();
        await schemaGenerator.autoGenerateAndSave('game', game.id, 1); // Default user ID 1
        console.log(`SEO schema generated for game: ${game.title}`);
      } catch (schemaError) {
        console.error('Error generating SEO schema for game:', schemaError);
        // Don't fail the game creation if schema generation fails
      }
      
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
      
      // Transform and save games with automatic thumbnail processing
      const games = result.data;
      const savedGames = [];
      
      console.log(`Processing ${games.length} games with automatic thumbnail optimization...`);
      
      for (const game of games) {
        const transformedGame = transformGameMonetizeData(game);
        
        // Download and process the thumbnail automatically
        if (transformedGame.thumbnail) {
          const processedThumbnail = await downloadAndProcessThumbnail(transformedGame.thumbnail, transformedGame.title);
          if (processedThumbnail) {
            transformedGame.thumbnail = processedThumbnail.url;
            // Store the alt text in the description if it was empty or generic
            if (!transformedGame.description || transformedGame.description === 'No description available') {
              transformedGame.description = processedThumbnail.altText;
            }
          }
        }
        
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
