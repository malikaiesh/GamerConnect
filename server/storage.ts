import { db, pool } from "@db";
import { eq, desc, and, or, like, sql, isNull, isNotNull, lte, gte, count, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import {
  User,
  InsertUser,
  Game,
  InsertGame,
  BlogCategory,
  InsertBlogCategory,
  BlogPost,
  InsertBlogPost,
  Rating,
  InsertRating,
  SiteSetting,
  InsertSiteSetting,
  PushNotification,
  InsertPushNotification,
  HomePageContent, 
  InsertHomePageContent,
  StaticPage,
  InsertStaticPage,
  ApiKey,
  InsertApiKey,
  HomeAd,
  InsertHomeAd,
  Sitemap,
  InsertSitemap,
  Analytic,
  users,
  games,
  blogCategories,
  blogPosts,
  ratings,
  siteSettings,
  pushNotifications,
  homePageContent,
  staticPages,
  apiKeys,
  homeAds,
  sitemaps,
  analytics
} from "@shared/schema";

// Create session store
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
  tableName: 'session'
});

export interface IStorage {
  // User methods
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserBySocialId(socialId: string): Promise<User | null>;
  createUser(user: Omit<InsertUser, "createdAt" | "updatedAt">): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | null>;
  updateUserLastLogin(id: number): Promise<void>;
  updateUserStatus(id: number, status: 'active' | 'blocked'): Promise<User | null>;
  getUsersByStatus(status: 'active' | 'blocked', options?: { page?: number, limit?: number }): Promise<{ users: User[], total: number, totalPages: number }>;
  getNewUsers(days?: number): Promise<User[]>;
  getUsersByCountry(): Promise<{ country: string, count: number }[]>;
  getUserStats(): Promise<{
    totalUsers: number,
    activeUsers: number,
    blockedUsers: number,
    newUsersToday: number,
    newUsersThisWeek: number,
    newUsersThisMonth: number,
    usersWithSocialLogin: number
  }>;
  
  // Game methods
  getGames(options?: GameQueryOptions): Promise<{ games: Game[], totalGames: number, totalPages: number }>;
  getGameById(id: number): Promise<Game | null>;
  getGameBySlug(slug: string): Promise<Game | null>;
  getGameCategories(): Promise<string[]>;
  createGame(game: Omit<InsertGame, "createdAt" | "updatedAt">): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | null>;
  deleteGame(id: number): Promise<boolean>;
  incrementGamePlays(id: number): Promise<void>;
  rateGame(gameId: number, rating: number): Promise<void>;
  getRelatedGames(gameId: number, category?: string, tags?: string[]): Promise<Game[]>;
  getFeaturedGames(limit?: number): Promise<Game[]>;
  getPopularGames(category?: string, limit?: number): Promise<Game[]>;
  getGameStats(): Promise<{ totalGames: number, totalPlays: number, playsThisWeek: number, newGamesPercent: number }>;
  
  // Blog methods
  getBlogCategories(): Promise<BlogCategory[]>;
  createBlogCategory(category: Omit<InsertBlogCategory, "createdAt">): Promise<BlogCategory>;
  getBlogPosts(options?: BlogQueryOptions): Promise<{ posts: BlogPost[], totalPosts: number, totalPages: number }>;
  getBlogPostById(id: number): Promise<BlogPost | null>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  createBlogPost(post: Omit<InsertBlogPost, "createdAt" | "updatedAt">): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | null>;
  deleteBlogPost(id: number): Promise<boolean>;
  getRelatedBlogPosts(categoryId?: number, excludeId?: number, limit?: number): Promise<BlogPost[]>;
  getRecentBlogPosts(limit?: number): Promise<BlogPost[]>;
  getBlogStats(): Promise<{ totalPosts: number, publishedPosts: number, newPostsPercent: number }>;
  
  // Settings methods
  getSiteSettings(): Promise<SiteSetting | null>;
  updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting>;
  
  // Notification methods
  getPushNotifications(): Promise<PushNotification[]>;
  getActivePushNotifications(): Promise<PushNotification[]>;
  getPushNotificationById(id: number): Promise<PushNotification | null>;
  createPushNotification(notification: Omit<InsertPushNotification, "createdAt" | "updatedAt">): Promise<PushNotification>;
  updatePushNotification(id: number, notification: Partial<InsertPushNotification>): Promise<PushNotification | null>;
  deletePushNotification(id: number): Promise<boolean>;
  incrementNotificationImpressions(id: number): Promise<void>;
  incrementNotificationClicks(id: number): Promise<void>;
  
  // Analytics methods
  getAnalytics(timeframe: string): Promise<any>;
  
  // Homepage Content methods
  getHomePageContents(): Promise<HomePageContent[]>;
  getActiveHomePageContents(): Promise<HomePageContent[]>;
  getHomePageContentById(id: number): Promise<HomePageContent | null>;
  createHomePageContent(content: Omit<InsertHomePageContent, "createdAt" | "updatedAt">): Promise<HomePageContent>;
  updateHomePageContent(id: number, content: Partial<InsertHomePageContent>): Promise<HomePageContent | null>;
  deleteHomePageContent(id: number): Promise<boolean>;
  
  // Static Pages methods
  getStaticPages(options?: PageQueryOptions): Promise<{ pages: StaticPage[], totalPages: number, totalCount: number }>;
  getStaticPageById(id: number): Promise<StaticPage | null>;
  getStaticPageBySlug(slug: string): Promise<StaticPage | null>;
  getStaticPageByType(pageType: string): Promise<StaticPage | null>;
  createStaticPage(page: Omit<InsertStaticPage, "createdAt" | "updatedAt">): Promise<StaticPage>;
  updateStaticPage(id: number, page: Partial<InsertStaticPage>): Promise<StaticPage | null>;
  deleteStaticPage(id: number): Promise<boolean>;
  
  // API Keys methods
  getApiKeys(): Promise<ApiKey[]>;
  getApiKeyById(id: number): Promise<ApiKey | null>;
  getApiKeyByType(type: string): Promise<ApiKey | null>;
  createApiKey(apiKey: Omit<InsertApiKey, "createdAt" | "updatedAt">): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<InsertApiKey>): Promise<ApiKey | null>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Home Ads methods
  getHomeAds(): Promise<HomeAd[]>;
  getHomeAdById(id: number): Promise<HomeAd | null>;
  getHomeAdByPosition(position: string): Promise<HomeAd | null>;
  getActiveHomeAds(): Promise<HomeAd[]>;
  createHomeAd(homeAd: Omit<InsertHomeAd, "createdAt" | "updatedAt">): Promise<HomeAd>;
  updateHomeAd(id: number, homeAd: Partial<InsertHomeAd>): Promise<HomeAd | null>;
  deleteHomeAd(id: number): Promise<boolean>;
  incrementAdClickCount(id: number): Promise<void>;
  incrementAdImpressionCount(id: number): Promise<void>;
  
  // Sitemap methods
  getSitemaps(): Promise<Sitemap[]>;
  getSitemapById(id: number): Promise<Sitemap | null>;
  getSitemapByType(type: string): Promise<Sitemap | null>;
  updateSitemap(id: number, sitemap: Partial<InsertSitemap>): Promise<Sitemap | null>;
  generateSitemap(type: string): Promise<Sitemap | null>;
  generateAllSitemaps(): Promise<Sitemap[]>;
  
  // Session store
  sessionStore: session.Store;
}

export interface GameQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  source?: 'api' | 'custom';
  status?: 'active' | 'inactive' | 'featured';
}

export interface BlogQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  status?: 'draft' | 'published';
}

export interface PageQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  pageType?: string;
  status?: 'active' | 'inactive';
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = sessionStore;
  }

  // User methods
  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length ? result[0] : null;
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length ? result[0] : null;
  }
  
  async getUserBySocialId(socialId: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.socialId, socialId)).limit(1);
    return result.length ? result[0] : null;
  }

  async createUser(user: Omit<InsertUser, "createdAt" | "updatedAt">): Promise<User> {
    const result = await db.insert(users).values({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result.length ? result[0] : null;
  }
  
  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }
  
  async updateUserStatus(id: number, status: 'active' | 'blocked'): Promise<User | null> {
    const result = await db.update(users)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return result.length ? result[0] : null;
  }
  
  async getUsersByStatus(status: 'active' | 'blocked', options: { page?: number, limit?: number, search?: string } = {}): Promise<{ users: User[], total: number, totalPages: number }> {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;
    
    let query = db.select({ count: count() }).from(users).where(eq(users.status, status));
    let dataQuery = db.select().from(users).where(eq(users.status, status));
    
    // Add search filter if provided
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      
      query = query.where(
        or(
          ilike(users.username, searchLower),
          ilike(users.email || '', searchLower),
          ilike(users.country || '', searchLower)
        )
      );
      
      dataQuery = dataQuery.where(
        or(
          ilike(users.username, searchLower),
          ilike(users.email || '', searchLower),
          ilike(users.country || '', searchLower)
        )
      );
    }
    
    const [countResult] = await query;
    const total = Number(countResult?.count || 0);
    
    const result = await dataQuery
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
      
    return {
      users: result,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async getRecentUsersWithLocation(limit: number = 100): Promise<User[]> {
    return db.select()
      .from(users)
      .where(
        and(
          isNotNull(users.location),
          not(sql`${users.location}::text = '{}'::text`)
        )
      )
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }
  
  async getNewUsers(days: number = 30): Promise<User[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return db.select()
      .from(users)
      .where(gte(users.createdAt, date))
      .orderBy(desc(users.createdAt));
  }
  
  async getUsersByCountry(): Promise<{ country: string, count: number }[]> {
    const result = await db.execute(sql`
      SELECT country, COUNT(*) as count
      FROM users
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY count DESC
    `);
    
    return result.map(row => ({
      country: row.country,
      count: Number(row.count)
    }));
  }
  
  async getUserStats(): Promise<{
    totalUsers: number,
    activeUsers: number,
    blockedUsers: number,
    newUsersToday: number,
    newUsersThisWeek: number,
    newUsersThisMonth: number,
    usersWithSocialLogin: number
  }> {
    const totalUsers = await db.select({ count: count() }).from(users);
    
    const activeUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.status, 'active'));
      
    const blockedUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.status, 'blocked'));
      
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    
    const newUsersToday = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, today));
      
    const newUsersThisWeek = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, oneWeekAgo));
      
    const newUsersThisMonth = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, oneMonthAgo));
      
    const usersWithSocialLogin = await db.select({ count: count() })
      .from(users)
      .where(
        or(
          eq(users.accountType, 'google'),
          eq(users.accountType, 'facebook')
        )
      );
      
    return {
      totalUsers: Number(totalUsers[0]?.count || 0),
      activeUsers: Number(activeUsers[0]?.count || 0),
      blockedUsers: Number(blockedUsers[0]?.count || 0),
      newUsersToday: Number(newUsersToday[0]?.count || 0),
      newUsersThisWeek: Number(newUsersThisWeek[0]?.count || 0),
      newUsersThisMonth: Number(newUsersThisMonth[0]?.count || 0),
      usersWithSocialLogin: Number(usersWithSocialLogin[0]?.count || 0)
    };
  }

  // Game methods
  async getGames(options: GameQueryOptions = {}): Promise<{ games: Game[], totalGames: number, totalPages: number }> {
    const { page = 1, limit = 10, search, category, source, status } = options;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(games);
    let countQuery = db.select({ count: count() }).from(games);
    
    // Apply filters
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.where(or(
        like(games.title, searchPattern),
        like(games.description, searchPattern)
      ));
      countQuery = countQuery.where(or(
        like(games.title, searchPattern),
        like(games.description, searchPattern)
      ));
    }
    
    if (category && category !== 'all') {
      query = query.where(eq(games.category, category));
      countQuery = countQuery.where(eq(games.category, category));
    }
    
    if (source) {
      query = query.where(eq(games.source, source));
      countQuery = countQuery.where(eq(games.source, source));
    }
    
    if (status) {
      query = query.where(eq(games.status, status));
      countQuery = countQuery.where(eq(games.status, status));
    }
    
    // Count total games matching filters
    const [countResult] = await countQuery;
    const totalGames = Number(countResult?.count || 0);
    
    // Apply pagination and order
    query = query.limit(limit).offset(offset).orderBy(desc(games.createdAt));
    
    // Fetch games
    const gamesResult = await query;
    
    return {
      games: gamesResult,
      totalGames,
      totalPages: Math.ceil(totalGames / limit)
    };
  }

  async getGameById(id: number): Promise<Game | null> {
    const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
    return result.length ? result[0] : null;
  }
  
  async getGameBySlug(slug: string): Promise<Game | null> {
    const result = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
    return result.length ? result[0] : null;
  }

  async getGameCategories(): Promise<string[]> {
    const result = await db.select({ category: games.category }).from(games).groupBy(games.category);
    return result.map(item => item.category);
  }

  async createGame(game: Omit<InsertGame, "createdAt" | "updatedAt">): Promise<Game> {
    const result = await db.insert(games).values(game).returning();
    return result[0];
  }

  async updateGame(id: number, gameData: Partial<InsertGame>): Promise<Game | null> {
    const result = await db.update(games)
      .set({ ...gameData, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return result.length ? result[0] : null;
  }

  async deleteGame(id: number): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id)).returning({ id: games.id });
    return result.length > 0;
  }

  async incrementGamePlays(id: number): Promise<void> {
    await db.update(games)
      .set({ plays: sql`${games.plays} + 1`, updatedAt: new Date() })
      .where(eq(games.id, id));
  }

  async rateGame(gameId: number, ratingValue: number): Promise<void> {
    // First add the rating to ratings table
    await db.insert(ratings).values({
      gameId,
      rating: ratingValue
    });
    
    // Then update the game's rating and rating count
    await db.update(games)
      .set({ 
        rating: sql`${games.rating} + ${ratingValue}`, 
        ratingCount: sql`${games.ratingCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(games.id, gameId));
  }

  async getRelatedGames(gameId: number, category?: string, tags?: string[]): Promise<Game[]> {
    // First, try to get games in the same category
    let categorySimilarGames: Game[] = [];
    if (category) {
      const categoryGames = await db.select().from(games)
        .where(and(
          eq(games.status, 'active'),
          eq(games.category, category)
        ))
        .orderBy(desc(games.rating))
        .limit(10);
      
      // Filter out the current game
      categorySimilarGames = categoryGames.filter(game => game.id !== gameId).slice(0, 6);
    }
    
    // If we have tags, try to find games with at least one matching tag
    let tagSimilarGames: Game[] = [];
    if (tags && tags.length > 0) {
      // Get all active games
      const allGames = await db.select().from(games)
        .where(eq(games.status, 'active'));
      
      // Filter out the current game and games with no matching tags
      const filteredGames = allGames.filter(game => game.id !== gameId);
      
      // Filter games with matching tags and score them by number of matching tags
      const gamesWithTagScore = filteredGames.map(game => {
        if (!game.tags || !Array.isArray(game.tags)) return { game, score: 0 };
        
        const matchingTagsCount = game.tags.filter(tag => 
          tags.includes(tag)
        ).length;
        
        return { game, score: matchingTagsCount };
      }).filter(item => item.score > 0);
      
      // Sort by score (number of matching tags) and limit
      tagSimilarGames = gamesWithTagScore
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.game);
    }
    
    // Combine and deduplicate results
    const allRelatedGames = [...categorySimilarGames, ...tagSimilarGames];
    const uniqueGamesMap = new Map<number, Game>();
    
    allRelatedGames.forEach(game => {
      if (!uniqueGamesMap.has(game.id)) {
        uniqueGamesMap.set(game.id, game);
      }
    });
    
    // If we don't have enough games, add popular games in different categories
    if (uniqueGamesMap.size < 4) {
      const popularGames = await db.select().from(games)
        .where(eq(games.status, 'active'))
        .orderBy(desc(games.plays))
        .limit(20);
      
      // Filter out the current game and games we already have
      // Also filter out games from the same category if we want variety
      const filteredPopularGames = popularGames.filter(game => 
        game.id !== gameId && 
        !uniqueGamesMap.has(game.id) && 
        (!category || category !== game.category)
      ).slice(0, 8 - uniqueGamesMap.size);
      
      filteredPopularGames.forEach(game => {
        uniqueGamesMap.set(game.id, game);
      });
    }
    
    // Convert map back to array and limit to 8 total related games
    return Array.from(uniqueGamesMap.values()).slice(0, 8);
  }

  async getFeaturedGames(limit = 10): Promise<Game[]> {
    try {
      return db.select().from(games).where(eq(games.status, 'featured')).orderBy(desc(games.createdAt)).limit(limit);
    } catch (error) {
      console.error('Error in getFeaturedGames:', error);
      // Fallback if the slug column doesn't exist yet
      const result = await db.execute(`
        SELECT id, title, description, thumbnail, url, api_id, category, tags, source, 
               status, plays, rating_sum, rating_count, file_type, file_path, file_size, 
               orientation, instructions, screenshot1, screenshot2, screenshot3, screenshot4,
               app_store_url, play_store_url, amazon_app_store_url, created_at, updated_at
        FROM games 
        WHERE status = 'featured' 
        ORDER BY created_at DESC 
        LIMIT $1
      `, [limit]);
      
      return result.map(row => {
        const tempSlug = this.createSlugFromTitle(row.title);
        
        return {
          id: row.id,
          title: row.title,
          slug: tempSlug,
          description: row.description,
          thumbnail: row.thumbnail,
          url: row.url,
          apiId: row.api_id,
          category: row.category,
          tags: row.tags,
          source: row.source,
          status: row.status,
          plays: row.plays,
          rating: row.rating_sum,
          ratingCount: row.rating_count,
          fileType: row.file_type,
          filePath: row.file_path,
          fileSize: row.file_size,
          orientation: row.orientation,
          instructions: row.instructions,
          screenshot1: row.screenshot1,
          screenshot2: row.screenshot2,
          screenshot3: row.screenshot3,
          screenshot4: row.screenshot4,
          appStoreUrl: row.app_store_url,
          playStoreUrl: row.play_store_url,
          amazonAppStoreUrl: row.amazon_app_store_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
    }
  }

  async getPopularGames(category?: string, limit = 20): Promise<Game[]> {
    try {
      let query = db.select().from(games).where(eq(games.status, 'active'));
      
      if (category && category !== 'all') {
        query = query.where(eq(games.category, category));
      }
      
      return query.orderBy(desc(games.plays)).limit(limit);
    } catch (error) {
      console.error('Error in getPopularGames:', error);
      // Fallback if the slug column doesn't exist yet
      let sql = `
        SELECT id, title, description, thumbnail, url, api_id, category, tags, source, 
               status, plays, rating_sum, rating_count, file_type, file_path, file_size, 
               orientation, instructions, screenshot1, screenshot2, screenshot3, screenshot4,
               app_store_url, play_store_url, amazon_app_store_url, created_at, updated_at
        FROM games 
        WHERE status = 'active'
      `;
      
      const params = [];
      
      if (category && category !== 'all') {
        sql += ` AND category = $1`;
        params.push(category);
      }
      
      sql += ` ORDER BY plays DESC LIMIT $${params.length + 1}`;
      params.push(limit);
      
      const result = await db.execute(sql, params);
      
      return result.map(row => ({
        id: row.id,
        title: row.title,
        slug: createSlugFromTitle(row.title), // Generate a temporary slug from title
        description: row.description,
        thumbnail: row.thumbnail,
        url: row.url,
        apiId: row.api_id,
        category: row.category,
        tags: row.tags,
        source: row.source,
        status: row.status,
        plays: row.plays,
        rating: row.rating_sum,
        ratingCount: row.rating_count,
        fileType: row.file_type,
        filePath: row.file_path,
        fileSize: row.file_size,
        orientation: row.orientation,
        instructions: row.instructions,
        screenshot1: row.screenshot1,
        screenshot2: row.screenshot2,
        screenshot3: row.screenshot3,
        screenshot4: row.screenshot4,
        appStoreUrl: row.app_store_url,
        playStoreUrl: row.play_store_url,
        amazonAppStoreUrl: row.amazon_app_store_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }
  }
  
  // Helper function to create a temporary slug from a title
  private createSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async getGameStats(): Promise<{ totalGames: number, totalPlays: number, playsThisWeek: number, newGamesPercent: number }> {
    // Get total games
    const [gamesCount] = await db.select({ count: count() }).from(games);
    const totalGames = Number(gamesCount?.count || 0);
    
    // Get total plays
    const [playsResult] = await db.select({ totalPlays: sql<number>`sum(${games.plays})` }).from(games);
    const totalPlays = playsResult?.totalPlays || 0;
    
    // Get plays this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // This is simplified - in a real app, this would require tracking play dates
    // For now, we'll just return a percentage of total plays
    const playsThisWeek = Math.floor(totalPlays * 0.3); // 30% of total plays
    
    // Calculate new games percent (games added in the last month vs. previous month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const [newGamesResult] = await db.select({ count: count() }).from(games)
      .where(games.createdAt >= oneMonthAgo);
    
    const [prevMonthGamesResult] = await db.select({ count: count() }).from(games)
      .where(and(
        games.createdAt >= twoMonthsAgo,
        games.createdAt < oneMonthAgo
      ));
    
    const newGames = Number(newGamesResult?.count || 0);
    const prevMonthGames = Number(prevMonthGamesResult?.count || 0);
    
    let newGamesPercent = 0;
    if (prevMonthGames > 0) {
      newGamesPercent = Math.round(((newGames - prevMonthGames) / prevMonthGames) * 100);
    } else if (newGames > 0) {
      newGamesPercent = 100; // If there were no games in the previous month
    }
    
    return {
      totalGames,
      totalPlays,
      playsThisWeek,
      newGamesPercent
    };
  }

  // Blog methods
  async getBlogCategories(): Promise<BlogCategory[]> {
    return db.select().from(blogCategories).orderBy(blogCategories.name);
  }

  async createBlogCategory(category: Omit<InsertBlogCategory, "createdAt">): Promise<BlogCategory> {
    const result = await db.insert(blogCategories).values(category).returning();
    return result[0];
  }

  async getBlogPosts(options: BlogQueryOptions = {}): Promise<{ posts: BlogPost[], totalPosts: number, totalPages: number }> {
    const { page = 1, limit = 10, search, categoryId, status } = options;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(blogPosts);
    let countQuery = db.select({ count: count() }).from(blogPosts);
    
    // Apply filters
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.where(or(
        like(blogPosts.title, searchPattern),
        like(blogPosts.content, searchPattern)
      ));
      countQuery = countQuery.where(or(
        like(blogPosts.title, searchPattern),
        like(blogPosts.content, searchPattern)
      ));
    }
    
    if (categoryId && categoryId !== 'all') {
      query = query.where(eq(blogPosts.categoryId, Number(categoryId)));
      countQuery = countQuery.where(eq(blogPosts.categoryId, Number(categoryId)));
    }
    
    if (status) {
      query = query.where(eq(blogPosts.status, status));
      countQuery = countQuery.where(eq(blogPosts.status, status));
    }
    
    // Count total posts matching filters
    const [countResult] = await countQuery;
    const totalPosts = Number(countResult?.count || 0);
    
    // Apply pagination and order
    query = query.limit(limit).offset(offset).orderBy(desc(blogPosts.createdAt));
    
    // Fetch posts
    const postsResult = await query;
    
    // For each post, look up its category if it has one
    const postsWithCategories = await Promise.all(postsResult.map(async (post) => {
      if (post.categoryId) {
        const [categoryResult] = await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).limit(1);
        return { ...post, category: categoryResult };
      }
      return post;
    }));
    
    return {
      posts: postsWithCategories,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit)
    };
  }

  async getBlogPostById(id: number): Promise<BlogPost | null> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    
    if (!post) return null;
    
    // Look up category if it exists
    if (post.categoryId) {
      const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).limit(1);
      return { ...post, category };
    }
    
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    
    if (!post) return null;
    
    // Look up category if it exists
    if (post.categoryId) {
      const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).limit(1);
      return { ...post, category };
    }
    
    return post;
  }

  async createBlogPost(post: Omit<InsertBlogPost, "createdAt" | "updatedAt">): Promise<BlogPost> {
    try {
      // Import the internal linking utility
      const { processInternalLinks } = await import('./utils/internal-linking');
      
      // If publishing now, set publishedAt
      const postData = { ...post };
      if (post.status === 'published' && !post.publishedAt) {
        postData.publishedAt = new Date();
      }
      
      // Apply internal linking if post is being published
      if (post.status === 'published' && post.content) {
        // Process content to add internal links
        postData.content = await processInternalLinks(post.content, null, post.title);
      }
      
      const result = await db.insert(blogPosts).values(postData).returning();
      return result[0];
    } catch (error) {
      console.error('Error in createBlogPost with internal linking:', error);
      // Fall back to standard creation without internal linking
      const result = await db.insert(blogPosts).values(post).returning();
      return result[0];
    }
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | null> {
    try {
      // Import the internal linking utility
      const { processInternalLinks } = await import('./utils/internal-linking');
      
      // If changing from draft to published, set publishedAt if not already set
      const updateData = { ...postData, updatedAt: new Date() };
      
      // Get the existing post
      const [existingPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      if (!existingPost) return null;
      
      // Handle publishedAt date
      if (postData.status === 'published' && existingPost.status === 'draft' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
      
      // Apply internal linking if post is being published or content is updated on a published post
      if (postData.content && (postData.status === 'published' || existingPost.status === 'published')) {
        // Process content to add internal links
        updateData.content = await processInternalLinks(
          postData.content, 
          id, 
          postData.title || existingPost.title
        );
      }
      
      const result = await db.update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Error in updateBlogPost with internal linking:', error);
      // Fall back to standard update without internal linking
      const updateData = { ...postData, updatedAt: new Date() };
      const result = await db.update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id });
    return result.length > 0;
  }

  async getRelatedBlogPosts(categoryId?: number, excludeId?: number, limit = 3): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts).where(eq(blogPosts.status, 'published'));
    
    if (excludeId) {
      query = query.where(blogPosts.id !== excludeId);
    }
    
    if (categoryId) {
      query = query.where(eq(blogPosts.categoryId, categoryId));
    }
    
    const result = await query.orderBy(desc(blogPosts.publishedAt)).limit(limit);
    
    // Look up categories
    const postsWithCategories = await Promise.all(result.map(async (post) => {
      if (post.categoryId) {
        const [categoryResult] = await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).limit(1);
        return { ...post, category: categoryResult };
      }
      return post;
    }));
    
    return postsWithCategories;
  }

  async getRecentBlogPosts(limit = 3): Promise<BlogPost[]> {
    const posts = await db.select().from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
    
    // Look up categories
    const postsWithCategories = await Promise.all(posts.map(async (post) => {
      if (post.categoryId) {
        const [categoryResult] = await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).limit(1);
        return { ...post, category: categoryResult };
      }
      return post;
    }));
    
    return postsWithCategories;
  }

  async getBlogStats(): Promise<{ totalPosts: number, publishedPosts: number, newPostsPercent: number }> {
    // Get total posts
    const [postsCount] = await db.select({ count: count() }).from(blogPosts);
    const totalPosts = Number(postsCount?.count || 0);
    
    // Get published posts
    const [publishedCount] = await db.select({ count: count() }).from(blogPosts)
      .where(eq(blogPosts.status, 'published'));
    const publishedPosts = Number(publishedCount?.count || 0);
    
    // Calculate new posts percent (posts added in the last month vs. previous month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const [newPostsResult] = await db.select({ count: count() }).from(blogPosts)
      .where(blogPosts.createdAt >= oneMonthAgo);
    
    const [prevMonthPostsResult] = await db.select({ count: count() }).from(blogPosts)
      .where(and(
        blogPosts.createdAt >= twoMonthsAgo,
        blogPosts.createdAt < oneMonthAgo
      ));
    
    const newPosts = Number(newPostsResult?.count || 0);
    const prevMonthPosts = Number(prevMonthPostsResult?.count || 0);
    
    let newPostsPercent = 0;
    if (prevMonthPosts > 0) {
      newPostsPercent = Math.round(((newPosts - prevMonthPosts) / prevMonthPosts) * 100);
    } else if (newPosts > 0) {
      newPostsPercent = 100; // If there were no posts in the previous month
    }
    
    return {
      totalPosts,
      publishedPosts,
      newPostsPercent
    };
  }

  // Settings methods
  async getSiteSettings(): Promise<SiteSetting | null> {
    const result = await db.select().from(siteSettings).limit(1);
    return result.length ? result[0] : null;
  }

  async updateSiteSettings(settingsData: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    const currentSettings = await this.getSiteSettings();
    
    if (currentSettings) {
      // Update existing settings
      const result = await db.update(siteSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(siteSettings.id, currentSettings.id))
        .returning();
      return result[0];
    } else {
      // Create initial settings
      const defaultSettings: InsertSiteSetting = {
        siteTitle: "GameZone - Play Free Online Games",
        metaDescription: "Discover and play thousands of free online games across all genres. No downloads required - play instantly in your browser!",
        keywords: "online games, free games, browser games, puzzle games, action games",
        currentTheme: "modern",
        pushNotificationsEnabled: true,
        siteLogo: null,
        siteFavicon: null,
        useTextLogo: true,
        textLogoColor: "#4f46e5",
        ...settingsData,
        updatedAt: new Date()
      };
      
      const result = await db.insert(siteSettings).values(defaultSettings).returning();
      return result[0];
    }
  }

  // Notification methods
  async getPushNotifications(): Promise<PushNotification[]> {
    return db.select().from(pushNotifications).orderBy(desc(pushNotifications.createdAt));
  }

  async getActivePushNotifications(): Promise<PushNotification[]> {
    return db.select().from(pushNotifications)
      .where(eq(pushNotifications.active, true))
      .orderBy(desc(pushNotifications.createdAt));
  }

  async getPushNotificationById(id: number): Promise<PushNotification | null> {
    const result = await db.select().from(pushNotifications).where(eq(pushNotifications.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async createPushNotification(notification: Omit<InsertPushNotification, "createdAt" | "updatedAt">): Promise<PushNotification> {
    const result = await db.insert(pushNotifications).values(notification).returning();
    return result[0];
  }

  async updatePushNotification(id: number, notificationData: Partial<InsertPushNotification>): Promise<PushNotification | null> {
    const result = await db.update(pushNotifications)
      .set({ ...notificationData, updatedAt: new Date() })
      .where(eq(pushNotifications.id, id))
      .returning();
    return result.length ? result[0] : null;
  }

  async deletePushNotification(id: number): Promise<boolean> {
    const result = await db.delete(pushNotifications).where(eq(pushNotifications.id, id)).returning({ id: pushNotifications.id });
    return result.length > 0;
  }

  async incrementNotificationImpressions(id: number): Promise<void> {
    await db.update(pushNotifications)
      .set({ 
        impressionCount: sql`${pushNotifications.impressionCount} + 1`, 
        updatedAt: new Date()
      })
      .where(eq(pushNotifications.id, id));
  }

  async incrementNotificationClicks(id: number): Promise<void> {
    await db.update(pushNotifications)
      .set({ 
        clickCount: sql`${pushNotifications.clickCount} + 1`, 
        updatedAt: new Date()
      })
      .where(eq(pushNotifications.id, id));
  }

  // Analytics methods
  async getHomePageContents(): Promise<HomePageContent[]> {
    return db.select().from(homePageContent).orderBy(homePageContent.position);
  }

  async getActiveHomePageContents(): Promise<HomePageContent[]> {
    return db.select().from(homePageContent)
      .where(eq(homePageContent.status, 'active'))
      .orderBy(homePageContent.position);
  }

  async getHomePageContentById(id: number): Promise<HomePageContent | null> {
    const result = await db.select().from(homePageContent).where(eq(homePageContent.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async createHomePageContent(content: Omit<InsertHomePageContent, "createdAt" | "updatedAt">): Promise<HomePageContent> {
    // Get the highest position and add 1
    const [positionResult] = await db.select({ 
      maxPosition: sql<number>`COALESCE(MAX(${homePageContent.position}), -1) + 1` 
    }).from(homePageContent);
    
    const position = positionResult?.maxPosition || 0;
    
    const result = await db.insert(homePageContent).values({
      ...content,
      position
    }).returning();
    
    return result[0];
  }

  async updateHomePageContent(id: number, contentData: Partial<InsertHomePageContent>): Promise<HomePageContent | null> {
    const result = await db.update(homePageContent)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(homePageContent.id, id))
      .returning();
    return result.length ? result[0] : null;
  }

  async deleteHomePageContent(id: number): Promise<boolean> {
    const result = await db.delete(homePageContent).where(eq(homePageContent.id, id)).returning({ id: homePageContent.id });
    return result.length > 0;
  }

  async getAnalytics(timeframe: string): Promise<any> {
    // This would normally be implemented with proper analytics tracking
    // For now, we'll return mock data based on the timeframe
    const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90;
    
    // Generate daily stats for the specified timeframe
    const dailyStats = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate some reasonable random numbers
      const pageViews = Math.floor(Math.random() * 500) + 500;
      const uniqueVisitors = Math.floor(pageViews * (0.6 + Math.random() * 0.2));
      const gamePlayCount = Math.floor(pageViews * (0.3 + Math.random() * 0.3));
      
      dailyStats.push({
        date: date.toISOString(),
        pageViews,
        uniqueVisitors,
        gamePlayCount
      });
    }
    
    // Calculate summary stats
    const totalPageViews = dailyStats.reduce((sum, day) => sum + day.pageViews, 0);
    const totalUniqueVisitors = dailyStats.reduce((sum, day) => sum + day.uniqueVisitors, 0);
    const totalGamePlayCount = dailyStats.reduce((sum, day) => sum + day.gamePlayCount, 0);
    
    // Generate top games data
    const topGames: Record<string, number> = {
      "Speed Racers": Math.floor(Math.random() * 1000) + 2000,
      "Brain Teaser": Math.floor(Math.random() * 1000) + 1800,
      "Sniper Elite": Math.floor(Math.random() * 1000) + 1600,
      "Fantasy Quest": Math.floor(Math.random() * 1000) + 1500,
      "Zombie Survival": Math.floor(Math.random() * 1000) + 1400,
      "Super Jumper": Math.floor(Math.random() * 1000) + 1300
    };
    
    // Generate top pages data
    const topPages: Record<string, number> = {
      "/": Math.floor(Math.random() * 1000) + 2000,
      "/categories": Math.floor(Math.random() * 500) + 1500,
      "/blog": Math.floor(Math.random() * 500) + 1200,
      "/game/1": Math.floor(Math.random() * 300) + 1000,
      "/game/2": Math.floor(Math.random() * 300) + 900,
      "/blog/post-1": Math.floor(Math.random() * 200) + 800
    };
    
    return {
      pageViews: totalPageViews,
      uniqueVisitors: totalUniqueVisitors,
      gamePlayCount: totalGamePlayCount,
      averageSessionDuration: Math.floor(Math.random() * 120) + 180, // 3-5 minutes in seconds
      topGames,
      topPages,
      dailyStats
    };
  }

  // Static Pages methods
  async getStaticPages(options: PageQueryOptions = {}): Promise<{ pages: StaticPage[], totalPages: number, totalCount: number }> {
    try {
      const { page = 1, limit = 10, search, pageType, status } = options;
      const offset = (page - 1) * limit;
      
      let query = db.select().from(staticPages);
      let countQuery = db.select({ count: count() }).from(staticPages);
      
      // Apply filters
      const filters = [];
      
      if (search) {
        filters.push(or(
          like(staticPages.title, `%${search}%`),
          like(staticPages.content, `%${search}%`)
        ));
      }
      
      if (pageType && pageType !== 'all') {
        filters.push(eq(staticPages.pageType, pageType));
      }
      
      if (status) {
        filters.push(eq(staticPages.status, status));
      }
      
      if (filters.length > 0) {
        const whereClause = filters.length === 1 ? filters[0] : and(...filters);
        query = query.where(whereClause);
        countQuery = countQuery.where(whereClause);
      }
      
      // Apply pagination and ordering
      query = query.limit(limit).offset(offset).orderBy(desc(staticPages.updatedAt));
      
      const [pages, countResult] = await Promise.all([
        query,
        countQuery
      ]);
      
      const totalCount = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(totalCount / limit);
      
      return { pages, totalPages, totalCount };
    } catch (error) {
      console.error("Error getting static pages:", error);
      throw new Error("Failed to get static pages");
    }
  }

  async getStaticPageById(id: number): Promise<StaticPage | null> {
    try {
      const result = await db.select().from(staticPages).where(eq(staticPages.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting static page with ID ${id}:`, error);
      throw new Error("Failed to get static page");
    }
  }

  async getStaticPageBySlug(slug: string): Promise<StaticPage | null> {
    try {
      const result = await db.select().from(staticPages).where(eq(staticPages.slug, slug)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting static page with slug ${slug}:`, error);
      throw new Error("Failed to get static page");
    }
  }

  async getStaticPageByType(pageType: string): Promise<StaticPage | null> {
    try {
      const result = await db.select().from(staticPages).where(eq(staticPages.pageType, pageType)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting static page with type ${pageType}:`, error);
      throw new Error("Failed to get static page");
    }
  }

  async createStaticPage(page: Omit<InsertStaticPage, "createdAt" | "updatedAt">): Promise<StaticPage> {
    try {
      const now = new Date();
      const [newPage] = await db.insert(staticPages).values({
        ...page,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      return newPage;
    } catch (error) {
      console.error("Error creating static page:", error);
      throw new Error("Failed to create static page");
    }
  }

  async updateStaticPage(id: number, pageData: Partial<InsertStaticPage>): Promise<StaticPage | null> {
    try {
      const [updatedPage] = await db.update(staticPages)
        .set({
          ...pageData,
          updatedAt: new Date()
        })
        .where(eq(staticPages.id, id))
        .returning();
      
      return updatedPage || null;
    } catch (error) {
      console.error(`Error updating static page with ID ${id}:`, error);
      throw new Error("Failed to update static page");
    }
  }

  async deleteStaticPage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(staticPages).where(eq(staticPages.id, id)).returning({ id: staticPages.id });
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting static page with ID ${id}:`, error);
      throw new Error("Failed to delete static page");
    }
  }

  // API Keys methods
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
    } catch (error) {
      console.error("Error getting API keys:", error);
      throw new Error("Failed to get API keys");
    }
  }

  async getApiKeyById(id: number): Promise<ApiKey | null> {
    try {
      const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting API key with ID ${id}:`, error);
      throw new Error("Failed to get API key");
    }
  }

  async getApiKeyByType(type: string): Promise<ApiKey | null> {
    try {
      const result = await db.select().from(apiKeys)
        .where(and(
          eq(apiKeys.type, type),
          eq(apiKeys.isActive, true)
        ))
        .orderBy(desc(apiKeys.createdAt))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting API key with type ${type}:`, error);
      throw new Error("Failed to get API key");
    }
  }

  async createApiKey(apiKeyData: Omit<InsertApiKey, "createdAt" | "updatedAt">): Promise<ApiKey> {
    try {
      const now = new Date();
      const [newApiKey] = await db.insert(apiKeys).values({
        ...apiKeyData,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      return newApiKey;
    } catch (error) {
      console.error("Error creating API key:", error);
      throw new Error("Failed to create API key");
    }
  }

  async updateApiKey(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | null> {
    try {
      const [updatedApiKey] = await db.update(apiKeys)
        .set({
          ...apiKeyData,
          updatedAt: new Date()
        })
        .where(eq(apiKeys.id, id))
        .returning();
      
      return updatedApiKey || null;
    } catch (error) {
      console.error(`Error updating API key with ID ${id}:`, error);
      throw new Error("Failed to update API key");
    }
  }

  async deleteApiKey(id: number): Promise<boolean> {
    try {
      const result = await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning({ id: apiKeys.id });
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting API key with ID ${id}:`, error);
      throw new Error("Failed to delete API key");
    }
  }

  // Home Ads methods
  async getHomeAds(): Promise<HomeAd[]> {
    try {
      return await db.select().from(homeAds).orderBy(asc(homeAds.position));
    } catch (error) {
      console.error("Error getting home ads:", error);
      throw new Error("Failed to get home ads");
    }
  }

  async getHomeAdById(id: number): Promise<HomeAd | null> {
    try {
      const result = await db.select().from(homeAds).where(eq(homeAds.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting home ad with ID ${id}:`, error);
      throw new Error("Failed to get home ad");
    }
  }

  async getHomeAdByPosition(position: string): Promise<HomeAd | null> {
    try {
      const result = await db.select().from(homeAds).where(eq(homeAds.position, position)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting home ad with position ${position}:`, error);
      throw new Error("Failed to get home ad");
    }
  }

  async getActiveHomeAds(): Promise<HomeAd[]> {
    try {
      const currentDate = new Date();
      const result = await db.select()
        .from(homeAds)
        .where(and(
          eq(homeAds.status, 'active'),
          or(
            and(
              isNotNull(homeAds.startDate),
              isNotNull(homeAds.endDate),
              lte(homeAds.startDate, currentDate),
              gte(homeAds.endDate, currentDate)
            ),
            and(
              isNotNull(homeAds.startDate),
              isNull(homeAds.endDate),
              lte(homeAds.startDate, currentDate)
            ),
            and(
              isNull(homeAds.startDate),
              isNotNull(homeAds.endDate),
              gte(homeAds.endDate, currentDate)
            ),
            and(
              isNull(homeAds.startDate),
              isNull(homeAds.endDate)
            )
          )
        ))
        .orderBy(asc(homeAds.position));
      
      return result;
    } catch (error) {
      console.error("Error getting active home ads:", error);
      throw new Error("Failed to get active home ads");
    }
  }

  async createHomeAd(homeAdData: Omit<InsertHomeAd, "createdAt" | "updatedAt">): Promise<HomeAd> {
    try {
      const now = new Date();
      const [newHomeAd] = await db.insert(homeAds).values({
        ...homeAdData,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      return newHomeAd;
    } catch (error) {
      console.error("Error creating home ad:", error);
      throw new Error("Failed to create home ad");
    }
  }

  async updateHomeAd(id: number, homeAdData: Partial<InsertHomeAd>): Promise<HomeAd | null> {
    try {
      const [updatedHomeAd] = await db.update(homeAds)
        .set({
          ...homeAdData,
          updatedAt: new Date()
        })
        .where(eq(homeAds.id, id))
        .returning();
      
      return updatedHomeAd || null;
    } catch (error) {
      console.error(`Error updating home ad with ID ${id}:`, error);
      throw new Error("Failed to update home ad");
    }
  }

  async deleteHomeAd(id: number): Promise<boolean> {
    try {
      const result = await db.delete(homeAds).where(eq(homeAds.id, id)).returning({ id: homeAds.id });
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting home ad with ID ${id}:`, error);
      throw new Error("Failed to delete home ad");
    }
  }

  async incrementAdClickCount(id: number): Promise<void> {
    try {
      await db.update(homeAds)
        .set({
          clickCount: sql`${homeAds.clickCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(homeAds.id, id));
    } catch (error) {
      console.error(`Error incrementing click count for home ad with ID ${id}:`, error);
      throw new Error("Failed to increment click count");
    }
  }

  async incrementAdImpressionCount(id: number): Promise<void> {
    try {
      await db.update(homeAds)
        .set({
          impressionCount: sql`${homeAds.impressionCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(homeAds.id, id));
    } catch (error) {
      console.error(`Error incrementing impression count for home ad with ID ${id}:`, error);
      throw new Error("Failed to increment impression count");
    }
  }

  // Sitemap methods
  async getSitemaps(): Promise<Sitemap[]> {
    try {
      const result = await db.select().from(sitemaps).orderBy(asc(sitemaps.type));
      return result;
    } catch (error) {
      console.error("Error getting sitemaps:", error);
      throw new Error("Failed to get sitemaps");
    }
  }
  
  async getSitemapById(id: number): Promise<Sitemap | null> {
    try {
      const result = await db.select().from(sitemaps).where(eq(sitemaps.id, id));
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error getting sitemap with ID ${id}:`, error);
      throw new Error("Failed to get sitemap");
    }
  }
  
  async getSitemapByType(type: string): Promise<Sitemap | null> {
    try {
      const result = await db.select().from(sitemaps).where(eq(sitemaps.type, type as any));
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error getting sitemap with type ${type}:`, error);
      throw new Error("Failed to get sitemap by type");
    }
  }
  
  async updateSitemap(id: number, sitemapData: Partial<InsertSitemap>): Promise<Sitemap | null> {
    try {
      const [updatedSitemap] = await db.update(sitemaps)
        .set({
          ...sitemapData,
          updatedAt: new Date()
        })
        .where(eq(sitemaps.id, id))
        .returning();
      
      return updatedSitemap || null;
    } catch (error) {
      console.error(`Error updating sitemap with ID ${id}:`, error);
      throw new Error("Failed to update sitemap");
    }
  }
  
  async generateSitemap(type: string): Promise<Sitemap | null> {
    try {
      // Get the sitemap by type
      const sitemap = await this.getSitemapByType(type);
      if (!sitemap) {
        console.error(`No sitemap found with type ${type}`);
        return null;
      }
      
      const baseUrl = 'https://' + (process.env.REPLIT_DOMAIN || 'localhost:5000');
      let items: any[] = [];
      let itemCount = 0;
      
      // Generate sitemap content based on type
      switch (type) {
        case 'games':
          // Get all active games
          const gamesResult = await db.select({
            id: games.id,
            slug: games.slug,
            updatedAt: games.updatedAt
          }).from(games).where(eq(games.status, 'active'));
          
          items = gamesResult.map(game => ({
            loc: `${baseUrl}/game/${game.slug}`,
            lastmod: game.updatedAt ? new Date(game.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8
          }));
          
          itemCount = gamesResult.length;
          break;
          
        case 'blog':
          // Get all published blog posts
          const blogPostsResult = await db.select({
            id: blogPosts.id,
            slug: blogPosts.slug,
            updatedAt: blogPosts.updatedAt
          }).from(blogPosts).where(eq(blogPosts.status, 'published'));
          
          items = blogPostsResult.map(post => ({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.7
          }));
          
          itemCount = blogPostsResult.length;
          break;
          
        case 'pages':
          // Get all active static pages
          const pagesResult = await db.select({
            id: staticPages.id,
            slug: staticPages.slug,
            updatedAt: staticPages.updatedAt
          }).from(staticPages).where(eq(staticPages.status, 'active'));
          
          items = pagesResult.map(page => ({
            loc: `${baseUrl}/${page.slug}`,
            lastmod: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.6
          }));
          
          itemCount = pagesResult.length;
          break;
          
        case 'main':
          // Add all primary sections
          items = [
            { loc: `${baseUrl}/`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
            { loc: `${baseUrl}/categories`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
            { loc: `${baseUrl}/top-games`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.9 },
            { loc: `${baseUrl}/about`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${baseUrl}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${baseUrl}/privacy`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
            { loc: `${baseUrl}/terms`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
            { loc: `${baseUrl}/faq`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${baseUrl}/blog`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.7 },
          ];
          
          itemCount = items.length;
          break;
          
        default:
          return null;
      }
      
      // Generate XML content - this would typically be stored as a file
      const xmlContent = this.generateSitemapXml({ urls: items });
      
      // For demo purposes, just update the database record
      const now = new Date();
      return await this.updateSitemap(sitemap.id, {
        lastGenerated: now,
        itemCount,
        updatedAt: now
      });
      
    } catch (error) {
      console.error(`Error generating sitemap for type ${type}:`, error);
      throw new Error("Failed to generate sitemap");
    }
  }
  
  private generateSitemapXml(data: { urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetEnd = '</urlset>';
    
    const urlElements = data.urls.map(url => {
      let urlElement = '<url>';
      urlElement += `<loc>${url.loc}</loc>`;
      
      if (url.lastmod) {
        urlElement += `<lastmod>${url.lastmod}</lastmod>`;
      }
      
      if (url.changefreq) {
        urlElement += `<changefreq>${url.changefreq}</changefreq>`;
      }
      
      if (url.priority !== undefined) {
        urlElement += `<priority>${url.priority.toFixed(1)}</priority>`;
      }
      
      urlElement += '</url>';
      return urlElement;
    });
    
    return `${xmlHeader}\n${urlsetStart}\n${urlElements.join('\n')}\n${urlsetEnd}`;
  }
  
  async generateAllSitemaps(): Promise<Sitemap[]> {
    try {
      const allSitemaps = await this.getSitemaps();
      const results: Sitemap[] = [];
      
      for (const sitemap of allSitemaps) {
        if (sitemap.isEnabled) {
          const updated = await this.generateSitemap(sitemap.type);
          if (updated) {
            results.push(updated);
          }
        }
      }
      
      // In a real implementation, we would generate a sitemap index file here
      await this.generateSitemapIndex(results);
      
      return results;
    } catch (error) {
      console.error("Error generating all sitemaps:", error);
      throw new Error("Failed to generate all sitemaps");
    }
  }
  
  private async generateSitemapIndex(sitemaps: Sitemap[]): Promise<void> {
    try {
      const baseUrl = 'https://' + (process.env.REPLIT_DOMAIN || 'localhost:5000');
      
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
      const sitemapIndexStart = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      const sitemapIndexEnd = '</sitemapindex>';
      
      const sitemapElements = sitemaps
        .filter(sitemap => sitemap.type !== 'main') // Exclude the main sitemap
        .map(sitemap => {
          return `<sitemap>
            <loc>${baseUrl}${sitemap.url}</loc>
            <lastmod>${new Date(sitemap.lastGenerated).toISOString()}</lastmod>
          </sitemap>`;
        });
      
      const sitemapIndexContent = `${xmlHeader}\n${sitemapIndexStart}\n${sitemapElements.join('\n')}\n${sitemapIndexEnd}`;
      
      // In a real implementation, we would write this content to a file
      console.log('Generated sitemap index');
    } catch (error) {
      console.error('Error generating sitemap index:', error);
      throw new Error("Failed to generate sitemap index");
    }
  }
}

export const storage: IStorage = new DatabaseStorage();
