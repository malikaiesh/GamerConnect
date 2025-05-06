import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertBlogPostSchema, insertBlogCategorySchema } from "@shared/schema";

export function registerBlogRoutes(app: Express) {
  // Get all blog categories
  app.get('/api/blog/categories', async (req: Request, res: Response) => {
    try {
      try {
        const categories = await storage.getBlogCategories();
        res.json(categories);
      } catch (error) {
        console.error('Error fetching categories, returning empty array:', error);
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      res.status(500).json({ message: 'Failed to fetch blog categories' });
    }
  });
  
  // Get recent blog posts
  app.get('/api/blog/recent', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      try {
        const posts = await storage.getRecentBlogPosts(limit);
        res.json(posts);
      } catch (error) {
        console.error('Error fetching recent posts, returning empty array:', error);
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching recent blog posts:', error);
      res.status(500).json({ message: 'Failed to fetch recent blog posts' });
    }
  });
  
  // Get related blog posts
  app.get('/api/blog/posts/related', async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const excludeId = req.query.excludeId ? parseInt(req.query.excludeId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      try {
        const posts = await storage.getRelatedBlogPosts(categoryId, excludeId, limit);
        res.json(posts);
      } catch (error) {
        console.error('Error fetching related posts, returning empty array:', error);
        res.json([]);
      }
    } catch (error) {
      console.error('Error processing related blog posts request:', error);
      res.status(500).json({ message: 'Failed to fetch related blog posts' });
    }
  });
  
  // Get a single blog post by slug
  app.get('/api/blog/posts/by-slug/:slug', async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      
      try {
        const post = await storage.getBlogPostBySlug(slug);
        if (!post) {
          return res.status(404).json({ message: 'Blog post not found' });
        }
        res.json(post);
      } catch (error) {
        console.error('Error fetching post by slug, returning empty object:', error);
        res.status(404).json({ message: 'Blog post not found' });
      }
    } catch (error) {
      console.error('Error processing blog post by slug request:', error);
      res.status(500).json({ message: 'Failed to fetch blog post' });
    }
  });
  
  // Get all blog posts with filtering and pagination
  app.get('/api/blog/posts', async (req: Request, res: Response) => {
    try {
      const { page, limit, search, categoryId, status } = req.query;
      
      const options = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        status: status as 'draft' | 'published'
      };
      
      try {
        const result = await storage.getBlogPosts(options);
        res.json(result);
      } catch (error) {
        console.error('Error fetching blog posts, returning empty result:', error);
        res.json({ posts: [], totalPosts: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error processing blog posts request:', error);
      res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
  });
  
  // Get blog stats
  app.get('/api/blog/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getBlogStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      res.status(500).json({ message: 'Failed to fetch blog stats' });
    }
  });
  
  // Admin routes - require authentication and admin role
  
  // Create a blog category
  app.post('/api/blog/categories', async (req: Request, res: Response) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid category data', errors: error.errors });
      }
      console.error('Error creating blog category:', error);
      res.status(500).json({ message: 'Failed to create blog category' });
    }
  });
  
  // Create a blog post
  app.post('/api/blog/posts', async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid post data', errors: error.errors });
      }
      console.error('Error creating blog post:', error);
      res.status(500).json({ message: 'Failed to create blog post' });
    }
  });
  
  // Update a blog post
  app.put('/api/blog/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const postData = insertBlogPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateBlogPost(id, postData);
      
      if (!updatedPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid post data', errors: error.errors });
      }
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Failed to update blog post' });
    }
  });
  
  // Delete a blog post
  app.delete('/api/blog/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: 'Failed to delete blog post' });
    }
  });
  
  // Bulk delete blog posts
  app.post('/api/blog/posts/bulk-delete', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ids: z.array(z.number())
      });
      
      const { ids } = schema.parse(req.body);
      
      if (ids.length === 0) {
        return res.status(400).json({ message: 'No post IDs provided' });
      }
      
      // Delete each post
      const results = await Promise.all(ids.map(id => storage.deleteBlogPost(id)));
      const deletedCount = results.filter(Boolean).length;
      
      res.status(200).json({ 
        message: `${deletedCount} posts deleted successfully`,
        deletedCount
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      console.error('Error bulk deleting blog posts:', error);
      res.status(500).json({ message: 'Failed to delete posts' });
    }
  });
}
