import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { GoogleIndexingService } from '../services/google-indexing-service';
import { db } from '../../db';
import { 
  indexingRequests, 
  indexingSettings,
  games,
  blogPosts,
  staticPages,
  gameCategories
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

const googleIndexingService = new GoogleIndexingService();

// Validation schemas
const submitUrlSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  contentType: z.enum(['game', 'blog_post', 'page', 'category']),
  contentId: z.number().int().positive('Content ID must be a positive integer')
});

const bulkSubmitSchema = z.object({
  urls: z.array(submitUrlSchema).min(1, 'At least one URL is required').max(100, 'Maximum 100 URLs per batch')
});

const deleteUrlSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  contentId: z.number().int().positive('Content ID must be a positive integer')
});

const settingsUpdateSchema = z.object({
  autoIndexing: z.boolean().optional(),
  batchSize: z.number().int().min(1).max(200).optional(),
  dailyQuotaLimit: z.number().int().min(1).max(1000).optional(),
  retryFailedAfterHours: z.number().int().min(1).max(168).optional(),
  enableNotifications: z.boolean().optional()
});

export function registerGoogleIndexingRoutes(app: Express) {
  
  // Upload Google service account JSON
  app.post('/api/google-indexing/upload-credentials', isAuthenticated, isAdmin, upload.single('credentials'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No credentials file uploaded' });
      }

      const fileContent = req.file.buffer.toString('utf8');
      let credentials;

      try {
        credentials = JSON.parse(fileContent);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON file format' });
      }

      // Validate required fields
      const requiredFields = ['project_id', 'client_email', 'private_key', 'client_id', 'auth_uri', 'token_uri'];
      for (const field of requiredFields) {
        if (!credentials[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      const result = await googleIndexingService.saveCredentials(credentials);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error: any) {
      console.error('Error uploading credentials:', error);
      res.status(500).json({ error: 'Failed to process credentials file' });
    }
  });

  // Submit single URL for indexing
  app.post('/api/google-indexing/submit-url', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = submitUrlSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors 
        });
      }

      const { url, contentType, contentId } = validation.data;
      const userId = req.user?.id;

      const result = await googleIndexingService.submitUrl(url, contentType, contentId, userId);
      
      if (result.success) {
        res.json({ 
          message: result.message, 
          requestId: result.requestId 
        });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error: any) {
      console.error('Error submitting URL:', error);
      res.status(500).json({ error: 'Failed to submit URL for indexing' });
    }
  });

  // Submit multiple URLs for indexing
  app.post('/api/google-indexing/submit-bulk', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = bulkSubmitSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors 
        });
      }

      const { urls } = validation.data;
      const userId = req.user?.id;

      const result = await googleIndexingService.submitBulkUrls(urls, userId);
      
      res.json({
        message: result.message,
        results: result.results,
        summary: {
          total: urls.length,
          successful: result.results.filter(r => r.success).length,
          failed: result.results.filter(r => !r.success).length
        }
      });
    } catch (error: any) {
      console.error('Error submitting bulk URLs:', error);
      res.status(500).json({ error: 'Failed to submit URLs for indexing' });
    }
  });

  // Delete URL from Google index
  app.post('/api/google-indexing/delete-url', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = deleteUrlSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors 
        });
      }

      const { url, contentId } = validation.data;
      const userId = req.user?.id;

      const result = await googleIndexingService.deleteUrl(url, contentId, userId);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error: any) {
      console.error('Error deleting URL:', error);
      res.status(500).json({ error: 'Failed to delete URL from index' });
    }
  });

  // Get indexing history and logs
  app.get('/api/google-indexing/history', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;

      let query = db.select().from(indexingRequests).orderBy(desc(indexingRequests.createdAt));

      if (status) {
        query = query.where(eq(indexingRequests.status, status as any));
      }

      const history = await query.limit(limit).offset(offset);
      
      res.json({
        history,
        pagination: {
          limit,
          offset,
          count: history.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching indexing history:', error);
      res.status(500).json({ error: 'Failed to fetch indexing history' });
    }
  });

  // Get indexing statistics
  app.get('/api/google-indexing/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await googleIndexingService.getIndexingStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching indexing stats:', error);
      res.status(500).json({ error: 'Failed to fetch indexing statistics' });
    }
  });

  // Get/Update indexing settings
  app.get('/api/google-indexing/settings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const [settings] = await db.select().from(indexingSettings).limit(1);
      
      if (!settings) {
        // Create default settings
        const [newSettings] = await db.insert(indexingSettings).values({}).returning();
        res.json(newSettings);
      } else {
        res.json(settings);
      }
    } catch (error: any) {
      console.error('Error fetching indexing settings:', error);
      res.status(500).json({ error: 'Failed to fetch indexing settings' });
    }
  });

  app.put('/api/google-indexing/settings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = settingsUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors 
        });
      }

      const updates = validation.data;

      // Get existing settings or create new ones
      let [settings] = await db.select().from(indexingSettings).limit(1);
      
      if (!settings) {
        [settings] = await db.insert(indexingSettings).values(updates).returning();
      } else {
        [settings] = await db.update(indexingSettings)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(indexingSettings.id, settings.id))
          .returning();
      }

      res.json({ message: 'Settings updated successfully', settings });
    } catch (error: any) {
      console.error('Error updating indexing settings:', error);
      res.status(500).json({ error: 'Failed to update indexing settings' });
    }
  });

  // Get content URLs for indexing - helps build URL lists
  app.get('/api/google-indexing/content-urls', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const baseUrl = `https://${req.get('host')}`;
      const contentUrls = [];

      // Get games
      const gameList = await db.select({ id: games.id, slug: games.slug, title: games.title }).from(games);
      for (const game of gameList) {
        contentUrls.push({
          id: game.id,
          title: game.title,
          url: `${baseUrl}/game/${game.slug}`,
          contentType: 'game' as const,
          contentId: game.id
        });
      }

      // Get blog posts
      const blogList = await db.select({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title }).from(blogPosts);
      for (const post of blogList) {
        contentUrls.push({
          id: post.id,
          title: post.title,
          url: `${baseUrl}/blog/${post.slug}`,
          contentType: 'blog_post' as const,
          contentId: post.id
        });
      }

      // Get static pages
      const pageList = await db.select({ id: staticPages.id, slug: staticPages.slug, title: staticPages.title }).from(staticPages);
      for (const page of pageList) {
        contentUrls.push({
          id: page.id,
          title: page.title,
          url: `${baseUrl}/${page.slug}`,
          contentType: 'page' as const,
          contentId: page.id
        });
      }

      // Get categories
      const categoryList = await db.select({ id: gameCategories.id, slug: gameCategories.slug, name: gameCategories.name }).from(gameCategories);
      for (const category of categoryList) {
        contentUrls.push({
          id: category.id,
          title: category.name,
          url: `${baseUrl}/category/${category.slug}`,
          contentType: 'category' as const,
          contentId: category.id
        });
      }

      res.json({
        contentUrls,
        summary: {
          total: contentUrls.length,
          games: gameList.length,
          blogPosts: blogList.length,
          pages: pageList.length,
          categories: categoryList.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching content URLs:', error);
      res.status(500).json({ error: 'Failed to fetch content URLs' });
    }
  });

  // Test Google API connection
  app.get('/api/google-indexing/test-connection', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const initialized = await googleIndexingService.initialize();
      
      if (initialized) {
        res.json({ 
          success: true, 
          message: 'Google Indexing API connection successful' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to connect to Google Indexing API. Please check your credentials.' 
        });
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Connection test failed', 
        error: error.message 
      });
    }
  });

  // Bulk index all existing content
  app.post('/api/google-indexing/index-all-content', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { AutoIndexingService } = await import('../services/auto-indexing-service');
      const autoIndexingService = new AutoIndexingService();
      
      const result = await autoIndexingService.indexAllExistingContent(req.user?.id);
      
      res.json({
        message: `Bulk indexing completed: ${result.submitted} successful, ${result.failed} failed out of ${result.total} total`,
        ...result
      });
    } catch (error: any) {
      console.error('Error in bulk indexing:', error);
      res.status(500).json({ 
        error: 'Failed to index all content', 
        details: error.message 
      });
    }
  });
}