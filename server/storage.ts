import { db, pool } from "@db";
import { eq, desc, and, or, like, sql, isNull, isNotNull, lte, gte, count, asc, ilike, not } from "drizzle-orm";
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
  Role,
  InsertRole,
  Permission,
  InsertPermission,
  RolePermission,
  InsertRolePermission,
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
  analytics,
  roles,
  permissions,
  rolePermissions,
  PushSubscriber,
  InsertPushSubscriber,
  PushCampaign,
  InsertPushCampaign,
  PushResponse,
  InsertPushResponse,
  pushSubscribers,
  pushCampaigns,
  pushResponses
} from "@shared/schema";

// Create session store
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
  tableName: 'session'
});

export interface IStorage {
  sessionStore: session.Store;

  // Role and Permission methods
  getAllRoles(): Promise<Role[]>;
  getRoles(): Promise<Role[]>;
  getRoleById(id: number): Promise<Role | null>;
  getRoleByName(name: string): Promise<Role | null>;
  createRole(role: Omit<InsertRole, "createdAt" | "updatedAt">): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | null>;
  deleteRole(id: number): Promise<boolean>;
  
  getAllPermissions(): Promise<Permission[]>;
  getPermissions(): Promise<Permission[]>;
  getPermissionById(id: number): Promise<Permission | null>;
  getPermissionsByResource(resource: string): Promise<Permission[]>;
  
  getRolePermissions(roleId: number): Promise<Permission[]>;
  assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean>;
  hasRolePermission(roleId: number, permissionId: number): Promise<boolean>;
  
  getUsersByRoleId(roleId: number): Promise<User[]>;
  getUsersByPermission(permissionId: number): Promise<User[]>;
  getRolesByPermission(permissionId: number): Promise<Role[]>;
  
  getUserRole(userId: number): Promise<Role | null>;
  assignRoleToUser(userId: number, roleId: number): Promise<User | null>;
  hasPermission(userId: number, resource: string, action: string): Promise<boolean>;
  
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
    newUsersThisMonth: number
  }>;
  getUserLocations(): Promise<{
    ip?: string,
    city?: string,
    country?: string,
    latitude?: number,
    longitude?: number
  }[]>;
  getRecentUsersWithLocation(limit?: number): Promise<User[]>;
  
  // Game methods
  getGameById(id: number): Promise<Game | null>;
  getGameBySlug(slug: string): Promise<Game | null>;
  getGames(options?: { page?: number, limit?: number, status?: string, source?: string, category?: string }): Promise<{ games: Game[], total: number, totalPages: number }>;
  createGame(game: Omit<InsertGame, "createdAt" | "updatedAt">): Promise<Game>;
  updateGame(id: number, gameData: Partial<InsertGame>): Promise<Game | null>;
  deleteGame(id: number): Promise<boolean>;
  incrementGamePlays(id: number): Promise<void>;
  getGamesByCategory(category: string, options?: { page?: number, limit?: number }): Promise<{ games: Game[], total: number, totalPages: number }>;
  getFeaturedGames(limit?: number): Promise<Game[]>;
  getPopularGames(limit?: number): Promise<Game[]>;
  getRecentGames(limit?: number): Promise<Game[]>;
  searchGames(query: string, options?: { page?: number, limit?: number }): Promise<{ games: Game[], total: number, totalPages: number }>;
  getGameCategories(): Promise<string[]>;
  getGameStats(): Promise<{
    totalGames: number,
    apiGames: number,
    customGames: number,
    featuredGames: number,
    totalPlays: number
  }>;
  createSlugFromTitle(title: string): Promise<string>;
  
  // Blog methods
  getBlogCategoryById(id: number): Promise<BlogCategory | null>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null>;
  getBlogCategories(): Promise<BlogCategory[]>;
  createBlogCategory(category: Omit<InsertBlogCategory, "createdAt">): Promise<BlogCategory>;
  updateBlogCategory(id: number, categoryData: Partial<InsertBlogCategory>): Promise<BlogCategory | null>;
  deleteBlogCategory(id: number): Promise<boolean>;
  
  getBlogPostById(id: number): Promise<BlogPost | null>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  getBlogPosts(options?: { page?: number, limit?: number, status?: string, categoryId?: number }): Promise<{ posts: BlogPost[], total: number, totalPages: number }>;
  createBlogPost(post: Omit<InsertBlogPost, "createdAt" | "updatedAt">): Promise<BlogPost>;
  updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | null>;
  deleteBlogPost(id: number): Promise<boolean>;
  searchBlogPosts(query: string, options?: { page?: number, limit?: number }): Promise<{ posts: BlogPost[], total: number, totalPages: number }>;
  getRecentPosts(limit?: number): Promise<BlogPost[]>;
  getRecentBlogPosts(limit?: number): Promise<BlogPost[]>;
  publishBlogPost(id: number): Promise<BlogPost | null>;
  
  // Rating methods
  rateGame(gameId: number, rating: number): Promise<void>;
  
  // Site Settings methods
  getSiteSettings(): Promise<SiteSetting | null>;
  updateSiteSettings(settingsData: Partial<InsertSiteSetting>): Promise<SiteSetting | null>;
  
  // Push Notification methods
  getPushNotificationById(id: number): Promise<PushNotification | null>;
  getPushNotifications(options?: { page?: number, limit?: number }): Promise<{ notifications: PushNotification[], total: number, totalPages: number }>;
  createPushNotification(notification: Omit<InsertPushNotification, "createdAt" | "updatedAt">): Promise<PushNotification>;
  updatePushNotification(id: number, notificationData: Partial<InsertPushNotification>): Promise<PushNotification | null>;
  deletePushNotification(id: number): Promise<boolean>;
  incrementNotificationImpressions(id: number): Promise<void>;
  incrementNotificationClicks(id: number): Promise<void>;
  
  // Home Page Content methods
  getHomePageContentById(id: number): Promise<HomePageContent | null>;
  getHomePageContent(): Promise<HomePageContent[]>;
  getHomePageContents(): Promise<HomePageContent[]>;
  getActiveHomePageContents(): Promise<HomePageContent[]>;
  createHomePageContent(content: Omit<InsertHomePageContent, "createdAt" | "updatedAt">): Promise<HomePageContent>;
  updateHomePageContent(id: number, contentData: Partial<InsertHomePageContent>): Promise<HomePageContent | null>;
  deleteHomePageContent(id: number): Promise<boolean>;
  updateHomePageContentOrder(contents: { id: number, position: number }[]): Promise<HomePageContent[]>;
  
  // Static Pages methods
  getStaticPageById(id: number): Promise<StaticPage | null>;
  getStaticPageBySlug(slug: string): Promise<StaticPage | null>;
  getStaticPages(options?: { page?: number, limit?: number, type?: string }): Promise<{ pages: StaticPage[], total: number, totalPages: number }>;
  createStaticPage(page: Omit<InsertStaticPage, "createdAt" | "updatedAt">): Promise<StaticPage>;
  updateStaticPage(id: number, pageData: Partial<InsertStaticPage>): Promise<StaticPage | null>;
  deleteStaticPage(id: number): Promise<boolean>;
  
  // API Keys methods
  getApiKeyById(id: number): Promise<ApiKey | null>;
  getApiKeys(): Promise<ApiKey[]>;
  getApiKeyByType(type: string): Promise<ApiKey | null>;
  createApiKey(apiKey: Omit<InsertApiKey, "createdAt" | "updatedAt">): Promise<ApiKey>;
  updateApiKey(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | null>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Home Ads methods
  getHomeAdById(id: number): Promise<HomeAd | null>;
  getHomeAds(options?: { page?: number, limit?: number }): Promise<{ ads: HomeAd[], total: number, totalPages: number }>;
  getHomeAdsByPosition(position: string): Promise<HomeAd[]>;
  getHomeAdByPosition(position: string): Promise<HomeAd | null>;
  createHomeAd(ad: Omit<InsertHomeAd, "createdAt" | "updatedAt">): Promise<HomeAd>;
  updateHomeAd(id: number, adData: Partial<InsertHomeAd>): Promise<HomeAd | null>;
  deleteHomeAd(id: number): Promise<boolean>;
  incrementAdImpressions(id: number): Promise<void>;
  incrementAdClicks(id: number): Promise<void>;
  
  // Sitemap methods
  getSitemapById(id: number): Promise<Sitemap | null>;
  getSitemaps(): Promise<Sitemap[]>;
  getSitemapByType(type: string): Promise<Sitemap | null>;
  createSitemap(sitemap: Omit<InsertSitemap, "createdAt" | "updatedAt">): Promise<Sitemap>;
  updateSitemap(id: number, sitemapData: Partial<InsertSitemap>): Promise<Sitemap | null>;
  deleteSitemap(id: number): Promise<boolean>;
  generateSitemap(type: string): Promise<Sitemap | null>;
  
  // Analytics methods
  logPageView(page: string, userId?: number): Promise<void>;
  logGamePlay(gameId: number, userId?: number): Promise<void>;
  getPageViews(options?: { startDate?: Date, endDate?: Date, groupBy?: string }): Promise<{ date: string, count: number }[]>;
  getUniqueVisitors(options?: { startDate?: Date, endDate?: Date, groupBy?: string }): Promise<{ date: string, count: number }[]>;
  getGamePlays(options?: { startDate?: Date, endDate?: Date, groupBy?: string }): Promise<{ date: string, count: number }[]>;
  getMostViewedPages(limit?: number): Promise<{ page: string, count: number }[]>;
  getMostPlayedGames(limit?: number): Promise<{ gameId: number, title: string, count: number }[]>;
  
  // Push Subscribers methods
  createPushSubscriber(subscriber: InsertPushSubscriber): Promise<PushSubscriber>;
  getPushSubscriberByEndpoint(endpoint: string): Promise<PushSubscriber | null>;
  updatePushSubscriber(id: number, data: Partial<InsertPushSubscriber>): Promise<PushSubscriber | null>;
  getAllPushSubscribers(options?: { page?: number, limit?: number, status?: string }): Promise<{ subscribers: PushSubscriber[], total: number, totalPages: number }>;
  
  // Push Campaigns methods
  createPushCampaign(campaign: InsertPushCampaign): Promise<PushCampaign>;
  getPushCampaigns(options?: { page?: number, limit?: number, status?: string }): Promise<{ campaigns: PushCampaign[], total: number, totalPages: number }>;
  getPushCampaignById(id: number): Promise<PushCampaign | null>;
  updatePushCampaign(id: number, data: Partial<InsertPushCampaign>): Promise<PushCampaign | null>;
  deletePushCampaign(id: number): Promise<boolean>;
  
  // Push Responses methods
  createPushResponse(response: InsertPushResponse): Promise<PushResponse>;
  getPushResponsesByCampaign(campaignId: number): Promise<PushResponse[]>;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = sessionStore;
  }

  // Role and Permission methods
  async getAllRoles(): Promise<Role[]> {
    return db.select().from(roles).orderBy(asc(roles.name));
  }
  
  async getRoles(): Promise<Role[]> {
    return this.getAllRoles();
  }

  async getRoleById(id: number): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return result.length ? result[0] : null;
  }

  async createRole(role: Omit<InsertRole, "createdAt" | "updatedAt">): Promise<Role> {
    const result = await db.insert(roles).values({
      ...role,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role | null> {
    const result = await db.update(roles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return result.length ? result[0] : null;
  }
  
  async deleteRole(id: number): Promise<boolean> {
    try {
      // First, unassign this role from any users
      await db.update(users)
        .set({ roleId: null })
        .where(eq(users.roleId, id));
      
      // Then delete the role (role_permissions will be deleted via CASCADE)
      const result = await db.delete(roles).where(eq(roles.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      return false;
    }
  }
  
  async getAllPermissions(): Promise<Permission[]> {
    return db.select().from(permissions).orderBy(asc(permissions.resource), asc(permissions.action));
  }
  
  async getPermissions(): Promise<Permission[]> {
    return this.getAllPermissions();
  }
  
  async getPermissionById(id: number): Promise<Permission | null> {
    const result = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
    return result.length ? result[0] : null;
  }
  
  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return db.select().from(permissions).where(eq(permissions.resource, resource)).orderBy(asc(permissions.action));
  }
  
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const result = await db.select({
      id: permissions.id,
      resource: permissions.resource,
      action: permissions.action,
      description: permissions.description,
      createdAt: permissions.createdAt,
      updatedAt: permissions.updatedAt
    })
    .from(permissions)
    .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, roleId))
    .orderBy(asc(permissions.resource), asc(permissions.action));
    
    return result;
  }
  
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    const result = await db.insert(rolePermissions).values({
      roleId,
      permissionId,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }
  
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    const result = await db.delete(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ))
      .returning();
    
    return result.length > 0;
  }
  
  async hasRolePermission(roleId: number, permissionId: number): Promise<boolean> {
    const result = await db.select()
      .from(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ))
      .limit(1);
    
    return result.length > 0;
  }
  
  async getUsersByRoleId(roleId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.roleId, roleId));
  }
  
  async getUsersByPermission(permissionId: number): Promise<User[]> {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      password: users.password,
      profilePicture: users.profilePicture,
      bio: users.bio,
      country: users.country,
      isAdmin: users.isAdmin,
      roleId: users.roleId,
      accountType: users.accountType,
      socialId: users.socialId,
      status: users.status,
      lastLogin: users.lastLogin,
      location: users.location,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .where(eq(rolePermissions.permissionId, permissionId));
    
    return result;
  }
  
  async getRolesByPermission(permissionId: number): Promise<Role[]> {
    const result = await db.select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt
    })
    .from(roles)
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .where(eq(rolePermissions.permissionId, permissionId));
    
    return result;
  }
  
  async getUserRole(userId: number): Promise<Role | null> {
    const user = await this.getUserById(userId);
    if (!user || !user.roleId) return null;
    return this.getRoleById(user.roleId);
  }
  
  async assignRoleToUser(userId: number, roleId: number): Promise<User | null> {
    return this.updateUser(userId, { roleId });
  }
  
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    
    // Admin users have all permissions
    if (user.isAdmin) return true;
    
    // If no role assigned, user has no permissions
    if (!user.roleId) return false;
    
    // Get the permission ID for this resource/action
    const [permission] = await db
      .select()
      .from(permissions)
      .where(and(
        eq(permissions.resource, resource),
        eq(permissions.action, action)
      ))
      .limit(1);
    
    if (!permission) return false;
    
    // Check if the user's role has this permission
    return this.hasRolePermission(user.roleId, permission.id);
  }

  // User methods implementation
  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length ? result[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length ? result[0] : null;
  }

  async getUserBySocialId(socialId: string): Promise<User | null> {
    if (!socialId) return null;
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
      .set({ 
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return result.length ? result[0] : null;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
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

  async getUsersByStatus(status: 'active' | 'blocked', options: { page?: number, limit?: number } = {}): Promise<{ users: User[], total: number, totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const users = await db.select()
      .from(users)
      .where(eq(users.status, status))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const [{ value: total }] = await db.select({
      value: count()
    })
    .from(users)
    .where(eq(users.status, status));

    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages };
  }

  async getNewUsers(days: number = 7): Promise<User[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return db.select()
      .from(users)
      .where(gte(users.createdAt, date))
      .orderBy(desc(users.createdAt));
  }

  async getUsersByCountry(): Promise<{ country: string, count: number }[]> {
    try {
      const query = `
        SELECT 
          location->>'country' as country, 
          COUNT(*) as count 
        FROM users 
        WHERE location->>'country' IS NOT NULL 
        GROUP BY location->>'country' 
        ORDER BY count DESC
      `;
      
      const { rows } = await pool.query(query);
      
      return rows.map(row => ({
        country: String(row.country),
        count: Number(row.count)
      }));
    } catch (error) {
      console.error('Error getting users by country:', error);
      return [];
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number,
    activeUsers: number,
    blockedUsers: number,
    newUsersToday: number,
    newUsersThisWeek: number,
    newUsersThisMonth: number
  }> {
    // Get today, a week ago, and a month ago dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    // Run counts for total, active, and blocked users
    const [{ value: totalUsers }] = await db.select({
      value: count()
    }).from(users);

    const [{ value: activeUsers }] = await db.select({
      value: count()
    }).from(users).where(eq(users.status, 'active'));

    const [{ value: blockedUsers }] = await db.select({
      value: count()
    }).from(users).where(eq(users.status, 'blocked'));

    // Run counts for new users in different time periods
    const [{ value: newUsersToday }] = await db.select({
      value: count()
    }).from(users).where(gte(users.createdAt, today));

    const [{ value: newUsersThisWeek }] = await db.select({
      value: count()
    }).from(users).where(gte(users.createdAt, weekAgo));

    const [{ value: newUsersThisMonth }] = await db.select({
      value: count()
    }).from(users).where(gte(users.createdAt, monthAgo));

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth
    };
  }

  async getUserLocations(): Promise<{
    ip?: string,
    city?: string,
    country?: string,
    latitude?: number,
    longitude?: number
  }[]> {
    try {
      const result = await db.select({
        location: users.location
      })
      .from(users)
      .where(isNotNull(users.location));
      
      // Extract location data from each user
      return result.map(user => user.location || {});
    } catch (error) {
      console.error('Error getting user locations:', error);
      return [];
    }
  }
  
  async getRecentUsersWithLocation(limit: number = 100): Promise<User[]> {
    return db.select()
      .from(users)
      .where(isNotNull(users.location))
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  // The rest of the methods would be implemented here...

  // Add minimal implementations for the required methods to make the role management work

  async getGameById(id: number): Promise<Game | null> {
    const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async getGameBySlug(slug: string): Promise<Game | null> {
    const result = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
    return result.length ? result[0] : null;
  }

  async getGames(options: { page?: number, limit?: number, status?: string, source?: string, category?: string } = {}): Promise<{ games: Game[], total: number, totalPages: number }> {
    // Default implementation
    const gamesData = await db.select().from(games).limit(10);
    return { games: gamesData, total: gamesData.length, totalPages: 1 };
  }

  async createGame(game: Omit<InsertGame, "createdAt" | "updatedAt">): Promise<Game> {
    const result = await db.insert(games).values({
      ...game,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateGame(id: number, gameData: Partial<InsertGame>): Promise<Game | null> {
    const result = await db.update(games)
      .set({ 
        ...gameData,
        updatedAt: new Date()
      })
      .where(eq(games.id, id))
      .returning();
    return result.length ? result[0] : null;
  }

  async deleteGame(id: number): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id)).returning();
    return result.length > 0;
  }

  async incrementGamePlays(id: number): Promise<void> {
    await db.update(games)
      .set({ 
        plays: sql`${games.plays} + 1`
      })
      .where(eq(games.id, id));
  }

  async getGamesByCategory(category: string, options: { page?: number, limit?: number } = {}): Promise<{ games: Game[], total: number, totalPages: number }> {
    // Default implementation
    const games = await db.select().from(games).where(eq(games.category, category)).limit(10);
    return { games, total: games.length, totalPages: 1 };
  }

  async getFeaturedGames(limit: number = 10): Promise<Game[]> {
    return db.select()
      .from(games)
      .where(eq(games.status, 'featured'))
      .limit(limit)
      .orderBy(desc(games.createdAt));
  }

  async getPopularGames(limit: number = 10): Promise<Game[]> {
    return db.select()
      .from(games)
      .where(eq(games.status, 'active'))
      .limit(limit)
      .orderBy(desc(games.plays));
  }

  async getRecentGames(limit: number = 10): Promise<Game[]> {
    return db.select()
      .from(games)
      .where(eq(games.status, 'active'))
      .limit(limit)
      .orderBy(desc(games.createdAt));
  }

  async searchGames(query: string, options: { page?: number, limit?: number } = {}): Promise<{ games: Game[], total: number, totalPages: number }> {
    // Default implementation
    const games = await db.select().from(games).where(like(games.title, `%${query}%`)).limit(10);
    return { games, total: games.length, totalPages: 1 };
  }

  async getGameCategories(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT category 
        FROM games 
        ORDER BY category
      `;
      const { rows } = await pool.query(query);
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting game categories:', error);
      return [];
    }
  }

  async getGameStats(): Promise<{
    totalGames: number,
    apiGames: number,
    customGames: number,
    featuredGames: number,
    totalPlays: number
  }> {
    const [{ value: totalGames }] = await db.select({
      value: count()
    }).from(games);

    const [{ value: apiGames }] = await db.select({
      value: count()
    }).from(games).where(eq(games.source, 'api'));

    const [{ value: customGames }] = await db.select({
      value: count()
    }).from(games).where(eq(games.source, 'custom'));

    const [{ value: featuredGames }] = await db.select({
      value: count()
    }).from(games).where(eq(games.status, 'featured'));

    // Sum all game plays
    const [result] = await db.select({
      totalPlays: sql`SUM(${games.plays})`
    }).from(games);

    return {
      totalGames,
      apiGames,
      customGames,
      featuredGames,
      totalPlays: Number(result.totalPlays) || 0
    };
  }

  async createSlugFromTitle(title: string): Promise<string> {
    // Convert to lowercase and replace spaces with hyphens
    let slug = title.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    // Remove leading and trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    
    // Check if slug already exists
    const existing = await db.select().from(games).where(eq(games.slug, slug));
    
    if (existing.length === 0) {
      return slug;
    }
    
    // If it exists, append a number
    let counter = 1;
    let newSlug = `${slug}-${counter}`;
    
    while (true) {
      const exists = await db.select().from(games).where(eq(games.slug, newSlug));
      if (exists.length === 0) {
        return newSlug;
      }
      counter++;
      newSlug = `${slug}-${counter}`;
    }
  }

  // Rest of the methods would go here...

  // Minimal implementation to avoid TypeScript errors
  async getBlogCategoryById(id: number): Promise<BlogCategory | null> { return null; }
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> { return null; }
  async getBlogCategories(): Promise<BlogCategory[]> { return []; }
  async createBlogCategory(category: Omit<InsertBlogCategory, "createdAt">): Promise<BlogCategory> { throw new Error("Not implemented"); }
  async updateBlogCategory(id: number, categoryData: Partial<InsertBlogCategory>): Promise<BlogCategory | null> { return null; }
  async deleteBlogCategory(id: number): Promise<boolean> { return false; }
  
  async getBlogPostById(id: number): Promise<BlogPost | null> { return null; }
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> { return null; }
  async getBlogPosts(options?: { page?: number, limit?: number, status?: string, categoryId?: number }): Promise<{ posts: BlogPost[], total: number, totalPages: number }> { 
    return { posts: [], total: 0, totalPages: 0 }; 
  }
  async createBlogPost(post: Omit<InsertBlogPost, "createdAt" | "updatedAt">): Promise<BlogPost> { throw new Error("Not implemented"); }
  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | null> { return null; }
  async deleteBlogPost(id: number): Promise<boolean> { return false; }
  async searchBlogPosts(query: string, options?: { page?: number, limit?: number }): Promise<{ posts: BlogPost[], total: number, totalPages: number }> { 
    return { posts: [], total: 0, totalPages: 0 }; 
  }
  async getRecentPosts(limit?: number): Promise<BlogPost[]> { return []; }
  async getRecentBlogPosts(limit?: number): Promise<BlogPost[]> { return this.getRecentPosts(limit); }
  async publishBlogPost(id: number): Promise<BlogPost | null> { return null; }
  
  async rateGame(gameId: number, rating: number): Promise<void> {}
  
  async getSiteSettings(): Promise<SiteSetting | null> {
    try {
      const settings = await db.select().from(siteSettings).limit(1);
      return settings.length > 0 ? settings[0] : null;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }
  }
  
  async updateSiteSettings(settingsData: Partial<InsertSiteSetting>): Promise<SiteSetting | null> {
    try {
      // Check if settings exist
      const existingSettings = await this.getSiteSettings();
      
      if (existingSettings) {
        // Update existing settings
        const [updated] = await db.update(siteSettings)
          .set({
            ...settingsData,
            updatedAt: new Date()
          })
          .where(eq(siteSettings.id, existingSettings.id))
          .returning();
          
        return updated;
      } else {
        // Create new settings if they don't exist
        const [newSettings] = await db.insert(siteSettings)
          .values({
            siteTitle: settingsData.siteTitle || 'Gaming Portal',
            metaDescription: settingsData.metaDescription || 'Your one-stop gaming destination',
            keywords: settingsData.keywords || 'games, online games, gaming',
            currentTheme: settingsData.currentTheme || 'modern',
            ...settingsData,
            updatedAt: new Date()
          })
          .returning();
          
        return newSettings;
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
      return null;
    }
  }
  
  async getPushNotificationById(id: number): Promise<PushNotification | null> { return null; }
  async getPushNotifications(options?: { page?: number, limit?: number }): Promise<{ notifications: PushNotification[], total: number, totalPages: number }> { 
    return { notifications: [], total: 0, totalPages: 0 }; 
  }
  async getActivePushNotifications(): Promise<PushNotification[]> {
    return db.select()
      .from(pushNotifications)
      .where(eq(pushNotifications.active, true))
      .orderBy(desc(pushNotifications.createdAt));
  }
  async createPushNotification(notification: Omit<InsertPushNotification, "createdAt" | "updatedAt">): Promise<PushNotification> { throw new Error("Not implemented"); }
  async updatePushNotification(id: number, notificationData: Partial<InsertPushNotification>): Promise<PushNotification | null> { return null; }
  async deletePushNotification(id: number): Promise<boolean> { return false; }
  async incrementNotificationImpressions(id: number): Promise<void> {}
  async incrementNotificationClicks(id: number): Promise<void> {}
  
  async getHomePageContentById(id: number): Promise<HomePageContent | null> { return null; }
  async getHomePageContent(): Promise<HomePageContent[]> { return []; }
  async getHomePageContents(): Promise<HomePageContent[]> { return this.getHomePageContent(); }
  async getActiveHomePageContents(): Promise<HomePageContent[]> { 
    const contents = await this.getHomePageContent();
    return contents.filter(content => content.status === 'active');
  }
  async createHomePageContent(content: Omit<InsertHomePageContent, "createdAt" | "updatedAt">): Promise<HomePageContent> { throw new Error("Not implemented"); }
  async updateHomePageContent(id: number, contentData: Partial<InsertHomePageContent>): Promise<HomePageContent | null> { return null; }
  async deleteHomePageContent(id: number): Promise<boolean> { return false; }
  async updateHomePageContentOrder(contents: { id: number, position: number }[]): Promise<HomePageContent[]> { return []; }
  
  async getStaticPageById(id: number): Promise<StaticPage | null> { return null; }
  async getStaticPageBySlug(slug: string): Promise<StaticPage | null> { return null; }
  async getStaticPages(options?: { page?: number, limit?: number, type?: string }): Promise<{ pages: StaticPage[], total: number, totalPages: number }> { 
    return { pages: [], total: 0, totalPages: 0 }; 
  }
  async createStaticPage(page: Omit<InsertStaticPage, "createdAt" | "updatedAt">): Promise<StaticPage> { throw new Error("Not implemented"); }
  async updateStaticPage(id: number, pageData: Partial<InsertStaticPage>): Promise<StaticPage | null> { return null; }
  async deleteStaticPage(id: number): Promise<boolean> { return false; }
  
  async getApiKeyById(id: number): Promise<ApiKey | null> { return null; }
  async getApiKeys(): Promise<ApiKey[]> { return []; }
  async getApiKeyByType(type: string): Promise<ApiKey | null> { return null; }
  async createApiKey(apiKey: Omit<InsertApiKey, "createdAt" | "updatedAt">): Promise<ApiKey> { throw new Error("Not implemented"); }
  async updateApiKey(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | null> { return null; }
  async deleteApiKey(id: number): Promise<boolean> { return false; }
  
  async getHomeAdById(id: number): Promise<HomeAd | null> { return null; }
  async getHomeAds(options?: { page?: number, limit?: number }): Promise<{ ads: HomeAd[], total: number, totalPages: number }> { 
    return { ads: [], total: 0, totalPages: 0 }; 
  }
  async getHomeAdsByPosition(position: string): Promise<HomeAd[]> {
    try {
      const results = await db.select()
        .from(homeAds)
        .where(eq(homeAds.position, position))
        .orderBy(desc(homeAds.updatedAt));
      return results;
    } catch (error) {
      console.error(`Error fetching home ads for position ${position}:`, error);
      return [];
    }
  }
  
  async getHomeAdByPosition(position: string): Promise<HomeAd | null> { 
    try {
      const ads = await this.getHomeAdsByPosition(position);
      return ads.length > 0 ? ads[0] : null;
    } catch (error) {
      console.error(`Error fetching home ad for position ${position}:`, error);
      return null;
    }
  }
  async createHomeAd(ad: Omit<InsertHomeAd, "createdAt" | "updatedAt">): Promise<HomeAd> { throw new Error("Not implemented"); }
  async updateHomeAd(id: number, adData: Partial<InsertHomeAd>): Promise<HomeAd | null> { return null; }
  async deleteHomeAd(id: number): Promise<boolean> { return false; }
  async incrementAdImpressions(id: number): Promise<void> {}
  async incrementAdClicks(id: number): Promise<void> {}
  
  async getSitemapById(id: number): Promise<Sitemap | null> { return null; }
  async getSitemaps(): Promise<Sitemap[]> { return []; }
  async getSitemapByType(type: string): Promise<Sitemap | null> { return null; }
  async createSitemap(sitemap: Omit<InsertSitemap, "createdAt" | "updatedAt">): Promise<Sitemap> { throw new Error("Not implemented"); }
  async updateSitemap(id: number, sitemapData: Partial<InsertSitemap>): Promise<Sitemap | null> { return null; }
  async deleteSitemap(id: number): Promise<boolean> { return false; }
  async generateSitemap(type: string): Promise<Sitemap | null> {
    // Placeholder implementation - would actually regenerate the sitemap XML
    console.log(`Generating sitemap for type: ${type}`);
    return this.getSitemapByType(type);
  }
  
  async logPageView(page: string, userId?: number): Promise<void> {}
  async logGamePlay(gameId: number, userId?: number): Promise<void> {}
  async getPageViews(options?: { startDate?: Date, endDate?: Date, groupBy?: string }): Promise<{ date: string, count: number }[]> { return []; }
  async getUniqueVisitors(options?: { startDate?: Date, endDate?: Date, groupBy?: string }): Promise<{ date: string, count: number }[]> { return []; }
  async getGamePlays(options?: { startDate?: Date, endDate?: Date, groupBy?: string }): Promise<{ date: string, count: number }[]> { return []; }
  async getMostViewedPages(limit?: number): Promise<{ page: string, count: number }[]> { return []; }
  async getMostPlayedGames(limit?: number): Promise<{ gameId: number, title: string, count: number }[]> { return []; }
  
  async createPushSubscriber(subscriber: InsertPushSubscriber): Promise<PushSubscriber> { throw new Error("Not implemented"); }
  async getPushSubscriberByEndpoint(endpoint: string): Promise<PushSubscriber | null> { return null; }
  async updatePushSubscriber(id: number, data: Partial<InsertPushSubscriber>): Promise<PushSubscriber | null> { return null; }
  async getAllPushSubscribers(options?: { page?: number, limit?: number, status?: string }): Promise<{ subscribers: PushSubscriber[], total: number, totalPages: number }> { 
    return { subscribers: [], total: 0, totalPages: 0 }; 
  }
  
  async createPushCampaign(campaign: InsertPushCampaign): Promise<PushCampaign> { throw new Error("Not implemented"); }
  async getPushCampaigns(options?: { page?: number, limit?: number, status?: string }): Promise<{ campaigns: PushCampaign[], total: number, totalPages: number }> { 
    return { campaigns: [], total: 0, totalPages: 0 }; 
  }
  async getPushCampaignById(id: number): Promise<PushCampaign | null> { return null; }
  async updatePushCampaign(id: number, data: Partial<InsertPushCampaign>): Promise<PushCampaign | null> { return null; }
  async deletePushCampaign(id: number): Promise<boolean> { return false; }
  
  async createPushResponse(response: InsertPushResponse): Promise<PushResponse> { throw new Error("Not implemented"); }
  async getPushResponsesByCampaign(campaignId: number): Promise<PushResponse[]> { return []; }
}

export const storage: IStorage = new DatabaseStorage();