import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Enums
export const gameSourceEnum = pgEnum('game_source', ['api', 'custom']);
export const gameStatusEnum = pgEnum('game_status', ['active', 'inactive', 'featured']);
export const gameFileTypeEnum = pgEnum('game_file_type', ['html5', 'apk', 'ios', 'unity']);
export const blogStatusEnum = pgEnum('blog_status', ['draft', 'published']);
export const notificationTypeEnum = pgEnum('notification_type', ['alert', 'banner', 'modal', 'slide-in', 'toast']);
export const contentStatusEnum = pgEnum('content_status', ['active', 'inactive']);
export const pageTypeEnum = pgEnum('page_type', ['about', 'contact', 'privacy', 'terms', 'cookie-policy', 'faq', 'custom']);
export const apiKeyTypeEnum = pgEnum('api_key_type', ['tinymce', 'game-monetize', 'analytics', 'custom']);
export const adPositionEnum = pgEnum('ad_position', ['above_featured', 'below_featured', 'above_popular', 'below_popular', 'above_about', 'below_about']);
export const sitemapTypeEnum = pgEnum('sitemap_type', ['games', 'blog', 'pages', 'main']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Games table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(), // SEO-friendly URL slug
  description: text('description').notNull(),
  thumbnail: text('thumbnail').notNull(),
  url: text('url'), // For custom games, API games use the API URL
  apiId: text('api_id'), // For API games, refers to GameMonetize game ID
  category: text('category').notNull(),
  tags: text('tags').array().notNull(),
  source: gameSourceEnum('source').notNull(),
  status: gameStatusEnum('status').default('active').notNull(),
  plays: integer('plays').default(0).notNull(),
  rating: integer('rating_sum').default(0).notNull(),
  ratingCount: integer('rating_count').default(0).notNull(),
  
  // New fields for file uploads
  fileType: gameFileTypeEnum('file_type'), // 'html5', 'apk', 'ios', 'unity'
  filePath: text('file_path'), // Path to uploaded game file (APK, ZIP, etc.)
  fileSize: integer('file_size'), // Size of the uploaded file in bytes
  orientation: text('orientation').default('landscape'), // landscape or portrait
  instructions: text('instructions'), // Game instructions
  
  // Additional images
  screenshot1: text('screenshot1'),
  screenshot2: text('screenshot2'),
  screenshot3: text('screenshot3'),
  screenshot4: text('screenshot4'),
  
  // Store URLs
  appStoreUrl: text('app_store_url'),
  playStoreUrl: text('play_store_url'),
  amazonAppStoreUrl: text('amazon_app_store_url'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Blog Categories table
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Blog Posts table
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt').notNull(),
  featuredImage: text('featured_image').notNull(),
  categoryId: integer('category_id').references(() => blogCategories.id),
  tags: text('tags').array(),
  status: blogStatusEnum('status').default('draft').notNull(),
  author: text('author').notNull(),
  authorAvatar: text('author_avatar'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Ratings table
export const ratings = pgTable('ratings', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Site Settings table
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  siteTitle: text('site_title').notNull(),
  metaDescription: text('meta_description').notNull(),
  keywords: text('keywords').notNull(),
  siteLogo: text('site_logo'),
  siteFavicon: text('site_favicon'),
  useTextLogo: boolean('use_text_logo').default(true),
  textLogoColor: text('text_logo_color').default('#4f46e5'),
  currentTheme: text('current_theme').default('modern').notNull(),
  adsTxt: text('ads_txt'),
  
  // Standard blog ad positions
  headerAds: text('header_ads'),
  footerAds: text('footer_ads'),
  sidebarAds: text('sidebar_ads'),
  contentAds: text('content_ads'),
  floatingHeaderAds: text('floating_header_ads'),
  floatingFooterAds: text('floating_footer_ads'),
  
  // Paragraph-specific ad positions for blog articles
  paragraph2Ad: text('paragraph2_ad'),
  paragraph4Ad: text('paragraph4_ad'),
  paragraph6Ad: text('paragraph6_ad'),
  paragraph8Ad: text('paragraph8_ad'),
  afterContentAd: text('after_content_ad'),
  
  // Google AdSense integration
  enableGoogleAds: boolean('enable_google_ads').default(false),
  googleAdClient: text('google_ad_client'),
  
  // Other site settings
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(true).notNull(),
  customHeaderCode: text('custom_header_code'),
  customBodyCode: text('custom_body_code'),
  customFooterCode: text('custom_footer_code'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Push Notifications table
export const pushNotifications = pgTable('push_notifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  image: text('image'),
  link: text('link'),
  type: notificationTypeEnum('type').default('toast').notNull(),
  active: boolean('active').default(false).notNull(),
  clickCount: integer('click_count').default(0).notNull(),
  impressionCount: integer('impression_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Analytics table
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  date: timestamp('date').defaultNow().notNull(),
  pageViews: integer('page_views').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  gamePlayCount: integer('game_play_count').default(0).notNull(),
  averageSessionDuration: integer('average_session_duration').default(0).notNull(),
  topGames: json('top_games').default({}).notNull(),
  topPages: json('top_pages').default({}).notNull()
});

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: apiKeyTypeEnum('type').notNull(),
  key: text('key').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// HomePage Content table
export const homePageContent = pgTable('homepage_content', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  position: integer('position').default(0).notNull(),
  status: contentStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Static Pages table
export const staticPages = pgTable('static_pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  pageType: pageTypeEnum('page_type').notNull(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  status: contentStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Home Ads table
export const homeAds = pgTable('home_ads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  position: adPositionEnum('position').notNull(),
  adCode: text('ad_code').notNull(),
  status: contentStatusEnum('status').default('active').notNull(),
  imageUrl: text('image_url'),
  targetUrl: text('target_url'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isGoogleAd: boolean('is_google_ad').default(false).notNull(),
  adEnabled: boolean('ad_enabled').default(true).notNull(),
  clickCount: integer('click_count').default(0).notNull(),
  impressionCount: integer('impression_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const gamesRelations = relations(games, ({ many }) => ({
  ratings: many(ratings)
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  game: one(games, {
    fields: [ratings.gameId],
    references: [games.id]
  })
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts)
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id]
  })
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters")
});

export const insertGameSchema = createInsertSchema(games, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  slug: (schema) => schema.min(3, "Slug must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  thumbnail: (schema) => schema.url("Thumbnail must be a valid URL"),
  url: (schema) => schema.url("URL must be a valid URL").optional().nullable(),
  apiId: (schema) => schema.optional().nullable(),
  // New file upload fields
  fileType: (schema) => schema.optional().nullable(),
  filePath: (schema) => schema.optional().nullable(),
  fileSize: (schema) => schema.optional().nullable(),
  orientation: (schema) => schema.optional().nullable(),
  instructions: (schema) => schema.optional().nullable(),
  // Screenshot fields
  screenshot1: (schema) => schema.url("Screenshot must be a valid URL").optional().nullable(),
  screenshot2: (schema) => schema.url("Screenshot must be a valid URL").optional().nullable(),
  screenshot3: (schema) => schema.url("Screenshot must be a valid URL").optional().nullable(),
  screenshot4: (schema) => schema.url("Screenshot must be a valid URL").optional().nullable(),
  // Store URLs
  appStoreUrl: (schema) => schema.url("App Store URL must be a valid URL").optional().nullable(),
  playStoreUrl: (schema) => schema.url("Play Store URL must be a valid URL").optional().nullable(),
  amazonAppStoreUrl: (schema) => schema.url("Amazon App Store URL must be a valid URL").optional().nullable()
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters")
});

export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  content: (schema) => schema.min(50, "Content must be at least 50 characters"),
  excerpt: (schema) => schema.min(10, "Excerpt must be at least 10 characters"),
  featuredImage: (schema) => schema.url("Featured image must be a valid URL")
});

export const insertRatingSchema = createInsertSchema(ratings, {
  rating: (schema) => schema.min(1, "Rating must be at least 1").max(5, "Rating must be at most 5")
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings, {
  siteTitle: (schema) => schema.min(3, "Site title must be at least 3 characters"),
  metaDescription: (schema) => schema.min(10, "Meta description must be at least 10 characters"),
  siteLogo: (schema) => schema.url("Logo URL must be a valid URL").optional().nullable(),
  siteFavicon: (schema) => schema.url("Favicon URL must be a valid URL").optional().nullable(),
  useTextLogo: (schema) => schema.optional().default(true),
  textLogoColor: (schema) => schema.optional().default('#4f46e5'),
  adsTxt: (schema) => schema.optional()
});

export const insertPushNotificationSchema = createInsertSchema(pushNotifications, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
  image: (schema) => schema.url("Image must be a valid URL").optional().nullable()
});

export const insertHomePageContentSchema = createInsertSchema(homePageContent, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(50, "Content must be at least 50 characters")
});

export const insertStaticPageSchema = createInsertSchema(staticPages, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(50, "Content must be at least 50 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters"),
  metaTitle: (schema) => schema.optional().nullable(),
  metaDescription: (schema) => schema.optional().nullable()
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = z.infer<typeof insertPushNotificationSchema>;

export type Analytic = typeof analytics.$inferSelect;

export type HomePageContent = typeof homePageContent.$inferSelect;
export type InsertHomePageContent = z.infer<typeof insertHomePageContentSchema>;

export type StaticPage = typeof staticPages.$inferSelect;
export type InsertStaticPage = z.infer<typeof insertStaticPageSchema>;

// Add schema validation for API Keys
export const insertApiKeySchema = createInsertSchema(apiKeys, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  key: (schema) => schema.min(5, "API key must be at least 5 characters"),
  description: (schema) => schema.optional().nullable()
});

// Add schema validation for Home Ads
export const insertHomeAdSchema = createInsertSchema(homeAds, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  adCode: (schema) => schema.min(1, "Ad code is required"),
  imageUrl: (schema) => schema.url("Image URL must be a valid URL").optional().nullable(),
  targetUrl: (schema) => schema.url("Target URL must be a valid URL").optional().nullable(),
  startDate: (schema) => schema.optional().nullable(),
  endDate: (schema) => schema.optional().nullable(),
  isGoogleAd: (schema) => schema.optional().default(false),
  adEnabled: (schema) => schema.optional().default(true)
});

// Sitemap table
export const sitemaps = pgTable('sitemaps', {
  id: serial('id').primaryKey(),
  type: sitemapTypeEnum('type').notNull(),
  lastGenerated: timestamp('last_generated').defaultNow().notNull(),
  url: text('url').notNull(),
  itemCount: integer('item_count').default(0).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Sitemap validation schema
export const insertSitemapSchema = createInsertSchema(sitemaps, {
  type: (schema) => schema.refine(val => ['games', 'blog', 'pages', 'main'].includes(val), { 
    message: "Type must be one of: games, blog, pages, main" 
  }),
  url: (schema) => schema.min(1, "URL is required"),
  isEnabled: (schema) => schema.optional().default(true)
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type HomeAd = typeof homeAds.$inferSelect;
export type InsertHomeAd = z.infer<typeof insertHomeAdSchema>;
export type Sitemap = typeof sitemaps.$inferSelect;
export type InsertSitemap = z.infer<typeof insertSitemapSchema>;
