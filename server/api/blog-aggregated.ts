import { Request, Response } from 'express';
import { desc, eq, and, count, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { blogPosts, blogCategories } from '../../shared/schema.js';
import { combinedCache, cacheConfigs } from '../middleware/cache.js';

export function blogAggregatedRoutes(app: any) {
  // Aggregated endpoint for blog listing page - combines posts, categories, and stats
  app.get('/api/blog/aggregated', combinedCache(cacheConfigs.dynamic), async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const category = req.query.category as string;
      const offset = (page - 1) * limit;

      // Build filter conditions
      const conditions = [eq(blogPosts.status, 'published')];
      if (category) {
        conditions.push(eq(blogPosts.categoryId, parseInt(category)));
      }

      // Execute all queries in parallel for maximum performance
      const [
        posts,
        totalCount,
        categories,
        featuredPosts,
        recentPosts
      ] = await Promise.all([
        // Main blog posts for current page
        db.select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          categoryId: blogPosts.categoryId,
          categoryName: blogCategories.name,
          categorySlug: blogCategories.slug,
          tags: blogPosts.tags,
          author: blogPosts.author,
          authorAvatar: blogPosts.authorAvatar,
          publishedAt: blogPosts.publishedAt,
          createdAt: blogPosts.createdAt
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset(offset),

        // Total count for pagination
        db.select({ count: count() })
          .from(blogPosts)
          .where(and(...conditions))
          .then(result => result[0]?.count || 0),

        // All categories with post counts
        db.select({
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
          postCount: count(blogPosts.id)
        })
        .from(blogCategories)
        .leftJoin(blogPosts, and(
          eq(blogPosts.categoryId, blogCategories.id),
          eq(blogPosts.status, 'published')
        ))
        .groupBy(blogCategories.id, blogCategories.name, blogCategories.slug)
        .orderBy(blogCategories.name),

        // Featured posts (most recent 3)
        db.select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          categoryName: blogCategories.name,
          author: blogPosts.author,
          publishedAt: blogPosts.publishedAt
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(3),

        // Recent posts sidebar (latest 5 excluding featured)
        db.select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          featuredImage: blogPosts.featuredImage,
          publishedAt: blogPosts.publishedAt
        })
        .from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(5)
        .offset(3) // Skip the featured posts
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Get all unique tags from current posts
      const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

      res.json({
        // Main data
        posts,
        categories,
        featuredPosts,
        recentPosts,
        
        // Pagination
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        },

        // Additional data
        tags: allTags,
        
        // Filter state
        filters: {
          category: category || null
        },

        // Performance metadata
        meta: {
          timestamp: new Date().toISOString(),
          requestedAt: Date.now()
        }
      });

    } catch (error) {
      console.error('Blog aggregated API error:', error);
      res.status(500).json({ error: 'Failed to fetch blog data' });
    }
  });

  // Aggregated endpoint for single blog post with related content
  app.get('/api/blog/post/:slug/aggregated', combinedCache(cacheConfigs.semiStatic), async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      // Execute related queries in parallel
      const [post, relatedPosts, allCategories] = await Promise.all([
        // Main blog post with category info
        db.select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          content: blogPosts.content,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          categoryId: blogPosts.categoryId,
          categoryName: blogCategories.name,
          categorySlug: blogCategories.slug,
          tags: blogPosts.tags,
          author: blogPosts.author,
          authorAvatar: blogPosts.authorAvatar,
          publishedAt: blogPosts.publishedAt,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, 'published')
        ))
        .limit(1),

        // Related posts (same category, excluding current)
        db.select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          categoryName: blogCategories.name,
          author: blogPosts.author,
          publishedAt: blogPosts.publishedAt
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(and(
          eq(blogPosts.status, 'published'),
          sql`${blogPosts.slug} != ${slug}`
        ))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(4),

        // All categories for navigation
        db.select({
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug
        })
        .from(blogCategories)
        .orderBy(blogCategories.name)
      ]);

      if (!post[0]) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      res.json({
        post: post[0],
        relatedPosts,
        categories: allCategories,
        
        // SEO metadata
        seo: {
          title: post[0].title,
          description: post[0].excerpt,
          image: post[0].featuredImage,
          slug: post[0].slug,
          publishedAt: post[0].publishedAt,
          author: post[0].author
        },

        // Performance metadata
        meta: {
          timestamp: new Date().toISOString(),
          requestedAt: Date.now()
        }
      });

    } catch (error) {
      console.error('Blog post aggregated API error:', error);
      res.status(500).json({ error: 'Failed to fetch blog post data' });
    }
  });
}