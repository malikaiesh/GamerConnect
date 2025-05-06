import { db, pool } from "@db";
import { eq, desc, and, or, like, sql, isNull, count } from "drizzle-orm";
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
  Analytic,
  users,
  games,
  blogCategories,
  blogPosts,
  ratings,
  siteSettings,
  pushNotifications,
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
  createUser(user: Omit<InsertUser, "createdAt">): Promise<User>;
  
  // Game methods
  getGames(options?: GameQueryOptions): Promise<{ games: Game[], totalGames: number, totalPages: number }>;
  getGameById(id: number): Promise<Game | null>;
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

  async createUser(user: Omit<InsertUser, "createdAt">): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
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
    let query = db.select().from(games).where(and(
      eq(games.status, 'active'),
      games.id !== gameId
    )).limit(4);
    
    if (category) {
      query = query.where(eq(games.category, category));
    }
    
    // Get games with similar tags if provided
    const result = await query;

    // If we have tags and not enough results, we could do more complex tag matching
    // For now, we'll just return what we have
    
    return result;
  }

  async getFeaturedGames(limit = 10): Promise<Game[]> {
    return db.select().from(games).where(eq(games.status, 'featured')).orderBy(desc(games.createdAt)).limit(limit);
  }

  async getPopularGames(category?: string, limit = 20): Promise<Game[]> {
    let query = db.select().from(games).where(eq(games.status, 'active'));
    
    if (category && category !== 'all') {
      query = query.where(eq(games.category, category));
    }
    
    return query.orderBy(desc(games.plays)).limit(limit);
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
    // If publishing now, set publishedAt
    const postData = { ...post };
    if (post.status === 'published' && !post.publishedAt) {
      postData.publishedAt = new Date();
    }
    
    const result = await db.insert(blogPosts).values(postData).returning();
    return result[0];
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | null> {
    // If changing from draft to published, set publishedAt if not already set
    const updateData = { ...postData, updatedAt: new Date() };
    if (postData.status === 'published') {
      const [existingPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      if (existingPost && existingPost.status === 'draft' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    const result = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    
    return result.length ? result[0] : null;
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
}

export const storage: IStorage = new DatabaseStorage();
