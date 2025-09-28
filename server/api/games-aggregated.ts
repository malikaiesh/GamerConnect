import { Request, Response } from 'express';
import { desc, eq, and, count, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { games, gameCategories } from '../../shared/schema.js';
import { combinedCache, cacheConfigs } from '../middleware/cache.js';

export function gamesAggregatedRoutes(app: any) {
  // Aggregated endpoint for games listing page - combines games, categories, and stats
  app.get('/api/games/aggregated', combinedCache(cacheConfigs.dynamic), async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'newest'; // newest, popular, alphabetical
      const offset = (page - 1) * limit;

      // Build filter conditions
      const conditions = [eq(games.status, 'active')];
      if (category) {
        conditions.push(eq(games.categoryId, parseInt(category)));
      }
      if (search) {
        conditions.push(sql`${games.title} ILIKE ${`%${search}%`}`);
      }

      // Build order clause
      let orderClause;
      switch (sortBy) {
        case 'popular':
          orderClause = desc(games.plays);
          break;
        case 'alphabetical':
          orderClause = games.title;
          break;
        case 'newest':
        default:
          orderClause = desc(games.createdAt);
          break;
      }

      // Execute all queries in parallel for maximum performance
      const [
        gamesList,
        totalCount,
        categories,
        featuredGames,
        popularGames,
        recentGames
      ] = await Promise.all([
        // Main games for current page
        db.select({
          id: games.id,
          title: games.title,
          slug: games.slug,
          description: games.description,
          thumbnail: games.thumbnail,
          url: games.url,
          categoryId: games.categoryId,
          categoryName: gameCategories.name,
          categorySlug: gameCategories.slug,
          tags: games.tags,
          source: games.source,
          plays: games.plays,
          rating: games.rating,
          ratingCount: games.ratingCount,
          orientation: games.orientation,
          createdAt: games.createdAt
        })
        .from(games)
        .leftJoin(gameCategories, eq(games.categoryId, gameCategories.id))
        .where(and(...conditions))
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),

        // Total count for pagination
        db.select({ count: count() })
          .from(games)
          .where(and(...conditions))
          .then(result => result[0]?.count || 0),

        // All categories with game counts
        db.select({
          id: gameCategories.id,
          name: gameCategories.name,
          slug: gameCategories.slug,
          icon: gameCategories.icon,
          displayOrder: gameCategories.displayOrder,
          gameCount: count(games.id)
        })
        .from(gameCategories)
        .leftJoin(games, and(
          eq(games.categoryId, gameCategories.id),
          eq(games.status, 'active')
        ))
        .where(eq(gameCategories.isActive, true))
        .groupBy(
          gameCategories.id, 
          gameCategories.name, 
          gameCategories.slug, 
          gameCategories.icon, 
          gameCategories.displayOrder
        )
        .orderBy(gameCategories.displayOrder, gameCategories.name),

        // Featured games (most played 6)
        db.select({
          id: games.id,
          title: games.title,
          slug: games.slug,
          thumbnail: games.thumbnail,
          categoryName: gameCategories.name,
          plays: games.plays,
          rating: games.rating
        })
        .from(games)
        .leftJoin(gameCategories, eq(games.categoryId, gameCategories.id))
        .where(eq(games.status, 'active'))
        .orderBy(desc(games.plays))
        .limit(6),

        // Popular games (high play count)
        db.select({
          id: games.id,
          title: games.title,
          slug: games.slug,
          thumbnail: games.thumbnail,
          plays: games.plays
        })
        .from(games)
        .where(eq(games.status, 'active'))
        .orderBy(desc(games.plays))
        .limit(8),

        // Recent games (latest additions)
        db.select({
          id: games.id,
          title: games.title,
          slug: games.slug,
          thumbnail: games.thumbnail,
          createdAt: games.createdAt
        })
        .from(games)
        .where(eq(games.status, 'active'))
        .orderBy(desc(games.createdAt))
        .limit(8)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Get all unique tags from current games
      const allTags = [...new Set(gamesList.flatMap(game => game.tags || []))];

      res.json({
        // Main data
        games: gamesList,
        categories,
        featuredGames,
        popularGames,
        recentGames,
        
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
          category: category || null,
          search: search || null,
          sortBy
        },

        // Performance metadata
        meta: {
          timestamp: new Date().toISOString(),
          requestedAt: Date.now()
        }
      });

    } catch (error) {
      console.error('Games aggregated API error:', error);
      res.status(500).json({ error: 'Failed to fetch games data' });
    }
  });

  // Aggregated endpoint for single game with related content  
  app.get('/api/games/:slug/aggregated', combinedCache(cacheConfigs.semiStatic), async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      // Execute related queries in parallel
      const [game, relatedGames, allCategories] = await Promise.all([
        // Main game with category info
        db.select({
          id: games.id,
          title: games.title,
          slug: games.slug,
          description: games.description,
          thumbnail: games.thumbnail,
          url: games.url,
          categoryId: games.categoryId,
          categoryName: gameCategories.name,
          categorySlug: gameCategories.slug,
          tags: games.tags,
          source: games.source,
          plays: games.plays,
          rating: games.rating,
          ratingCount: games.ratingCount,
          orientation: games.orientation,
          instructions: games.instructions,
          screenshot1: games.screenshot1,
          screenshot2: games.screenshot2,
          screenshot3: games.screenshot3,
          screenshot4: games.screenshot4,
          createdAt: games.createdAt
        })
        .from(games)
        .leftJoin(gameCategories, eq(games.categoryId, gameCategories.id))
        .where(and(
          eq(games.slug, slug),
          eq(games.status, 'active')
        ))
        .limit(1),

        // Related games (same category, excluding current)
        db.select({
          id: games.id,
          title: games.title,
          slug: games.slug,
          thumbnail: games.thumbnail,
          categoryName: gameCategories.name,
          plays: games.plays,
          rating: games.rating
        })
        .from(games)
        .leftJoin(gameCategories, eq(games.categoryId, gameCategories.id))
        .where(and(
          eq(games.status, 'active'),
          sql`${games.slug} != ${slug}`
        ))
        .orderBy(desc(games.plays))
        .limit(6),

        // All categories for navigation
        db.select({
          id: gameCategories.id,
          name: gameCategories.name,
          slug: gameCategories.slug,
          icon: gameCategories.icon
        })
        .from(gameCategories)
        .where(eq(gameCategories.isActive, true))
        .orderBy(gameCategories.displayOrder, gameCategories.name)
      ]);

      if (!game[0]) {
        return res.status(404).json({ error: 'Game not found' });
      }

      res.json({
        game: game[0],
        relatedGames,
        categories: allCategories,
        
        // SEO metadata
        seo: {
          title: game[0].title,
          description: game[0].description,
          image: game[0].thumbnail,
          slug: game[0].slug
        },

        // Performance metadata
        meta: {
          timestamp: new Date().toISOString(),
          requestedAt: Date.now()
        }
      });

    } catch (error) {
      console.error('Game aggregated API error:', error);
      res.status(500).json({ error: 'Failed to fetch game data' });
    }
  });
}