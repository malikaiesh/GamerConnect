import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Enums
export const gameSourceEnum = pgEnum('game_source', ['api', 'custom']);
export const gameStatusEnum = pgEnum('game_status', ['active', 'inactive', 'featured']);
export const gameFileTypeEnum = pgEnum('game_file_type', ['html5', 'apk', 'ios', 'unity']);
export const blogStatusEnum = pgEnum('blog_status', ['draft', 'published']);
export const notificationTypeEnum = pgEnum('notification_type', ['alert', 'banner', 'modal', 'slide-in', 'toast', 'web-push', 'survey']);
export const contentStatusEnum = pgEnum('content_status', ['active', 'inactive']);
export const pageTypeEnum = pgEnum('page_type', ['about', 'contact', 'privacy', 'terms', 'cookie-policy', 'faq', 'custom']);
export const apiKeyTypeEnum = pgEnum('api_key_type', ['tinymce', 'game-monetize', 'analytics', 'sendgrid', 'custom']);
export const adPositionEnum = pgEnum('ad_position', ['above_featured', 'below_featured', 'above_popular', 'below_popular', 'above_about', 'below_about']);
export const gameAdPositionEnum = pgEnum('game_ad_position', ['above_game', 'below_game', 'above_related', 'below_related', 'sidebar_top', 'sidebar_bottom']);
export const sitemapTypeEnum = pgEnum('sitemap_type', ['games', 'blog', 'pages', 'main']);

// User Account Type Enum
export const userAccountTypeEnum = pgEnum('user_account_type', ['local', 'google', 'facebook', 'github', 'discord', 'twitter', 'apple', 'microsoft', 'phone']);

// Signup Provider Enum
export const signupProviderEnum = pgEnum('signup_provider', ['email', 'google', 'facebook', 'github', 'discord', 'twitter', 'apple', 'microsoft', 'phone']);

// User Status Enum
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked']);

// User Session Status Enum
export const sessionStatusEnum = pgEnum('session_status', ['active', 'expired', 'revoked']);

// Token Type Enum
export const tokenTypeEnum = pgEnum('token_type', ['password_reset', 'email_verification', 'admin_reset']);

// SEO Schema Type Enum
export const schemaTypeEnum = pgEnum('schema_type', ['VideoGame', 'Article', 'BlogPosting', 'Organization', 'WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'CollectionPage', 'BreadcrumbList', 'Review', 'Rating', 'Product', 'Person']);

// SEO Schema Content Type Enum
export const schemaContentTypeEnum = pgEnum('schema_content_type', ['game', 'blog_post', 'page', 'category', 'organization', 'global']);

// Roles table
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    resourceActionIdx: uniqueIndex('resource_action_idx').on(table.resource, table.action)
  };
});

// Role-Permission junction table
export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => {
  return {
    rolePermissionIdx: uniqueIndex('role_permission_idx').on(table.roleId, table.permissionId)
  };
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').unique(),
  password: text('password'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  roleId: integer('role_id').references(() => roles.id, { onDelete: 'set null' }),
  displayName: text('display_name'),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  country: text('country'),
  accountType: userAccountTypeEnum('account_type').default('local').notNull(),
  socialId: text('social_id'), // Google or Facebook ID
  status: userStatusEnum('status').default('active').notNull(),
  lastLogin: timestamp('last_login'),
  location: json('location').$type<{
    ip?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Game Categories table
export const gameCategories = pgTable('game_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon').default('ri-gamepad-line'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  category: text('category').notNull(), // Legacy field kept for backward compatibility
  categoryId: integer('category_id').references(() => gameCategories.id),
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
  
  // Footer settings
  footerCopyright: text('footer_copyright'),
  footerAppStoreLink: text('footer_app_store_link'),
  footerGooglePlayLink: text('footer_google_play_link'),
  footerAmazonLink: text('footer_amazon_link'),
  
  // Social media links
  socialFacebook: text('social_facebook'),
  socialTwitter: text('social_twitter'),
  socialInstagram: text('social_instagram'),
  socialYoutube: text('social_youtube'),
  socialDiscord: text('social_discord'),
  socialWhatsapp: text('social_whatsapp'),
  socialTiktok: text('social_tiktok'),
  
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
  blogGamesEnabled: boolean('blog_games_enabled').default(true).notNull(),
  paragraph2GamesEnabled: boolean('paragraph2_games_enabled').default(true).notNull(),
  paragraph6GamesEnabled: boolean('paragraph6_games_enabled').default(true).notNull(),
  paragraph8GamesEnabled: boolean('paragraph8_games_enabled').default(true).notNull(),
  paragraph10GamesEnabled: boolean('paragraph10_games_enabled').default(true).notNull(),
  customHeaderCode: text('custom_header_code'),
  customBodyCode: text('custom_body_code'),
  customFooterCode: text('custom_footer_code'),
  robotsTxt: text('robots_txt'),
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
// Push Notification Subscribers table
export const pushSubscribers = pgTable('push_subscribers', {
  id: serial('id').primaryKey(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  browser: text('browser'),
  os: text('os'),
  deviceType: text('device_type'),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  lastSent: timestamp('last_sent'),
  status: text('status').default('active').notNull(),
  // Web push specific preferences
  webPushEnabled: boolean('web_push_enabled').default(true).notNull(),
  notificationPermission: text('notification_permission').default('default'),
  preferredTypes: text('preferred_types').array().default(['toast', 'web-push']),
  frequencyLimit: integer('frequency_limit').default(5), // Max notifications per day
  optInDate: timestamp('opt_in_date').defaultNow(),
  lastInteracted: timestamp('last_interacted'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Push Notification Campaigns table
export const pushCampaigns = pgTable('push_campaigns', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  image: text('image'),
  link: text('link'),
  actionYes: text('action_yes'),
  actionNo: text('action_no'),
  notificationType: text('notification_type').default('toast').notNull(), // Added notification type
  isWebPush: boolean('is_web_push').default(false).notNull(), // Flag for web push notifications
  requireInteraction: boolean('require_interaction').default(false), // Web Push specific
  badge: text('badge'), // Web Push specific (icon URL)
  icon: text('icon'), // Web Push specific
  vibrate: text('vibrate'), // Web Push specific (vibration pattern)
  isSurvey: boolean('is_survey').default(false),
  targetAll: boolean('target_all').default(true),
  targetFilters: json('target_filters').default({}),
  sentCount: integer('sent_count').default(0),
  deliveredCount: integer('delivered_count').default(0),
  clickCount: integer('click_count').default(0),
  scheduleDate: timestamp('schedule_date'),
  status: text('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Push Notification Campaign Responses table
export const pushResponses = pgTable('push_responses', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => pushCampaigns.id).notNull(),
  subscriberId: integer('subscriber_id').references(() => pushSubscribers.id).notNull(),
  response: text('response'),
  clicked: boolean('clicked').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

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

// Homepage Content validation schema
export const insertHomePageContentSchema = createInsertSchema(homePageContent, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
  position: (schema) => schema.optional(),
  status: (schema) => schema.optional().default('active')
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

// Games Ads table
export const gameAds = pgTable('game_ads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  position: gameAdPositionEnum('position').notNull(),
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

// Team Members table
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  designation: text('designation').notNull(),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  socialLinkedin: text('social_linkedin'),
  socialTwitter: text('social_twitter'),
  socialGithub: text('social_github'),
  socialInstagram: text('social_instagram'),
  socialTiktok: text('social_tiktok'),
  socialFacebook: text('social_facebook'),
  socialYoutube: text('social_youtube'),
  displayOrder: integer('display_order').default(0).notNull(),
  status: contentStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const gameCategoriesRelations = relations(gameCategories, ({ many }) => ({
  games: many(games)
}));

export const gamesRelations = relations(games, ({ many, one }) => ({
  ratings: many(ratings),
  category: one(gameCategories, {
    fields: [games.categoryId],
    references: [gameCategories.id]
  })
}));

// User Sessions Table
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceInfo: json('device_info').$type<{
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    device?: string;
    isMobile?: boolean;
  }>(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  status: sessionStatusEnum('status').default('active').notNull(),
  location: json('location').$type<{
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many, one }) => ({
  reviews: many(ratings),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id]
  }),
  sessions: many(userSessions)
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id]
  })
}));

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  tokenHash: text('token_hash').notNull(), // Store hashed token for security
  type: tokenTypeEnum('type').default('password_reset').notNull(),
  usedAt: timestamp('used_at'), // Track when token was used
  ipAddress: text('ip_address'), // Track IP that created the token
  userAgent: text('user_agent'), // Track browser/device info
  isAdmin: boolean('is_admin').default(false).notNull(), // Whether this is for admin or regular user
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull() // Tokens expire after a certain time
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id]
  })
}));



export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
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
// Role and Permission schemas
export const insertRoleSchema = createInsertSchema(roles, {
  name: (schema) => schema.min(3, "Role name must be at least 3 characters"),
  description: (schema) => schema.optional().nullable()
});

export const insertPermissionSchema = createInsertSchema(permissions, {
  resource: (schema) => schema.min(2, "Resource name must be at least 2 characters"),
  action: (schema) => schema.min(2, "Action name must be at least 2 characters"),
  description: (schema) => schema.optional().nullable()
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions);

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must be a valid email").optional().nullable(),
  password: (schema) => schema.min(6, "Password must be at least 6 characters").optional().nullable(),
  profilePicture: (schema) => schema.url("Profile picture must be a valid URL").optional().nullable(),
  bio: (schema) => schema.max(500, "Bio must not exceed 500 characters").optional().nullable(),
  country: (schema) => schema.optional().nullable(),
  accountType: (schema) => schema.optional(),
  socialId: (schema) => schema.optional().nullable(),
  status: (schema) => schema.optional(),
  roleId: (schema) => schema.optional().nullable(),
  location: (schema) => schema.optional().nullable()
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
  adsTxt: (schema) => schema.optional(),
  
  // Footer settings
  footerCopyright: (schema) => schema.optional(),
  footerAppStoreLink: (schema) => schema.url("App Store URL must be a valid URL").optional().nullable(),
  footerGooglePlayLink: (schema) => schema.url("Google Play URL must be a valid URL").optional().nullable(),
  footerAmazonLink: (schema) => schema.url("Amazon URL must be a valid URL").optional().nullable(),
  
  // Social media links
  socialFacebook: (schema) => schema.url("Facebook URL must be a valid URL").optional().nullable(),
  socialTwitter: (schema) => schema.url("Twitter URL must be a valid URL").optional().nullable(),
  socialInstagram: (schema) => schema.url("Instagram URL must be a valid URL").optional().nullable(),
  socialYoutube: (schema) => schema.url("YouTube URL must be a valid URL").optional().nullable(),
  socialDiscord: (schema) => schema.url("Discord URL must be a valid URL").optional().nullable(),
  socialWhatsapp: (schema) => schema.url("WhatsApp URL must be a valid URL").optional().nullable(),
  socialTiktok: (schema) => schema.url("TikTok URL must be a valid URL").optional().nullable()
});

export const insertPushNotificationSchema = createInsertSchema(pushNotifications, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
  image: (schema) => schema.url("Image must be a valid URL").optional().nullable()
});

export const insertStaticPageSchema = createInsertSchema(staticPages, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(50, "Content must be at least 50 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters"),
  metaTitle: (schema) => schema.optional().nullable(),
  metaDescription: (schema) => schema.optional().nullable()
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  designation: (schema) => schema.min(2, "Designation must be at least 2 characters"),
  profilePicture: (schema) => schema.url("Profile picture must be a valid URL").optional().nullable(),
  bio: (schema) => schema.max(500, "Bio must not exceed 500 characters").optional().nullable(),
  socialLinkedin: (schema) => schema.url("LinkedIn must be a valid URL").optional().nullable(),
  socialTwitter: (schema) => schema.url("Twitter must be a valid URL").optional().nullable(),
  socialGithub: (schema) => schema.url("GitHub must be a valid URL").optional().nullable(),
  socialInstagram: (schema) => schema.url("Instagram must be a valid URL").optional().nullable(),
  displayOrder: (schema) => schema.optional(),
  status: (schema) => schema.optional().default('active')
});

// Types for TypeScript
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// Game Category validation schema
export const insertGameCategorySchema = createInsertSchema(gameCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters"),
  description: (schema) => schema.optional().nullable(),
  icon: (schema) => schema.optional().nullable(),
  displayOrder: (schema) => schema.optional().nullable(),
  isActive: (schema) => schema.optional().default(true)
});

export const selectGameCategorySchema = createSelectSchema(gameCategories);

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type GameCategory = typeof gameCategories.$inferSelect;
export type InsertGameCategory = z.infer<typeof insertGameCategorySchema>;

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
  adCode: (schema) => schema.optional(),
  imageUrl: (schema) => schema.refine(
    (val) => !val || val.length === 0 || /^https?:\/\//.test(val),
    { message: "Image URL must be a valid URL or empty" }
  ).optional().nullable(),
  targetUrl: (schema) => schema.refine(
    (val) => !val || val.length === 0 || /^https?:\/\//.test(val),
    { message: "Target URL must be a valid URL or empty" }
  ).optional().nullable(),
  startDate: (schema) => schema.optional().nullable(),
  endDate: (schema) => schema.optional().nullable(),
  isGoogleAd: (schema) => schema.optional().default(false),
  adEnabled: (schema) => schema.optional().default(true)
})
.refine(
  (data) => {
    // If it's Google Ad, adCode is required
    if (data.isGoogleAd) {
      return !!data.adCode;
    }
    // If not Google Ad, either imageUrl+targetUrl or adCode must be provided
    return (
      (!!data.imageUrl && !!data.targetUrl) || 
      !!data.adCode
    );
  },
  {
    message: "Either provide Ad Code or both Image URL and Target URL",
    path: ["adCode"]
  }
);

// Sitemap table
export const sitemaps = pgTable('sitemaps', {
  id: serial('id').primaryKey(),
  type: sitemapTypeEnum('type').notNull(),
  lastGenerated: timestamp('last_generated').defaultNow().notNull(),
  url: text('url').notNull(),
  itemCount: integer('item_count').default(0).notNull(),
  content: text('content'),
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

// Push Subscriber validation schema
export const insertPushSubscriberSchema = createInsertSchema(pushSubscribers, {
  endpoint: (schema) => schema.min(5, "Endpoint is required"),
  p256dh: (schema) => schema.min(5, "p256dh key is required"),
  auth: (schema) => schema.min(5, "Auth secret is required"),
  userAgent: (schema) => schema.optional().nullable(),
  browser: (schema) => schema.optional().nullable(),
  os: (schema) => schema.optional().nullable(),
  deviceType: (schema) => schema.optional().nullable(),
  country: (schema) => schema.optional().nullable(),
  region: (schema) => schema.optional().nullable(),
  city: (schema) => schema.optional().nullable(),
  status: (schema) => schema.optional().default('active')
});

// Push Campaign validation schema
export const insertPushCampaignSchema = createInsertSchema(pushCampaigns, {
  name: (schema) => schema.min(3, "Campaign name must be at least 3 characters"),
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  message: (schema) => schema.min(5, "Message must be at least 5 characters"),
  image: (schema) => schema.optional().nullable(),
  link: (schema) => schema.optional().nullable(),
  actionYes: (schema) => schema.optional().nullable(),
  actionNo: (schema) => schema.optional().nullable(),
  isSurvey: (schema) => schema.optional().default(false),
  targetAll: (schema) => schema.optional().default(true),
  targetFilters: (schema) => schema.optional().default({}),
  status: (schema) => schema.optional().default('draft')
});

// Push Response validation schema
export const insertPushResponseSchema = createInsertSchema(pushResponses, {
  campaignId: (schema) => schema.positive().int("Campaign ID must be a positive integer"),
  subscriberId: (schema) => schema.positive().int("Subscriber ID must be a positive integer"),
  response: (schema) => schema.optional().nullable(),
  clicked: (schema) => schema.optional().default(false)
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export const insertGameAdSchema = createInsertSchema(gameAds, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  adCode: (schema) => schema.optional(),
  imageUrl: (schema) => schema.refine(
    (val) => !val || val.length === 0 || /^https?:\/\//.test(val),
    { message: "Image URL must be a valid URL or empty" }
  ).optional().nullable(),
  targetUrl: (schema) => schema.refine(
    (val) => !val || val.length === 0 || /^https?:\/\//.test(val),
    { message: "Target URL must be a valid URL or empty" }
  ).optional().nullable(),
  startDate: (schema) => schema.optional().nullable(),
  endDate: (schema) => schema.optional().nullable(),
  isGoogleAd: (schema) => schema.optional().default(false),
  adEnabled: (schema) => schema.optional().default(true)
})
.refine(
  (data) => {
    // If it's Google Ad, adCode is required
    if (data.isGoogleAd) {
      return !!data.adCode;
    }
    // If not Google Ad, either imageUrl+targetUrl or adCode must be provided
    return (
      (!!data.imageUrl && !!data.targetUrl) || 
      !!data.adCode
    );
  },
  {
    message: "For Google ads, ad code is required. For regular ads, either provide image URL + target URL or ad code.",
    path: ["adCode"]
  }
);

export type HomeAd = typeof homeAds.$inferSelect;
export type InsertHomeAd = z.infer<typeof insertHomeAdSchema>;
export type GameAd = typeof gameAds.$inferSelect;
export type InsertGameAd = z.infer<typeof insertGameAdSchema>;
export type Sitemap = typeof sitemaps.$inferSelect;
export type InsertSitemap = z.infer<typeof insertSitemapSchema>;

export type PushSubscriber = typeof pushSubscribers.$inferSelect;
export type InsertPushSubscriber = z.infer<typeof insertPushSubscriberSchema>;
export type PushCampaign = typeof pushCampaigns.$inferSelect;
export type InsertPushCampaign = z.infer<typeof insertPushCampaignSchema>;
export type PushResponse = typeof pushResponses.$inferSelect;
export type InsertPushResponse = z.infer<typeof insertPushResponseSchema>;

// URL Redirects schema
export const urlRedirects = pgTable('url_redirects', {
  id: serial('id').primaryKey(),
  sourceUrl: text('source_url').notNull(),
  targetUrl: text('target_url').notNull(),
  statusCode: integer('status_code').default(301).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const urlRedirectInsertSchema = createInsertSchema(urlRedirects, {
  sourceUrl: (schema) => schema.min(1, "Source URL is required"),
  targetUrl: (schema) => schema.min(1, "Target URL is required"),
  statusCode: (schema) => schema.int().gte(300, "Status code must be >= 300").lte(308, "Status code must be <= 308"),
  isActive: (schema) => schema.optional().default(true)
});

export const urlRedirectUpdateSchema = urlRedirectInsertSchema.partial();

export type UrlRedirect = typeof urlRedirects.$inferSelect;
export type UrlRedirectInsert = z.infer<typeof urlRedirectInsertSchema>;
export type UrlRedirectUpdate = z.infer<typeof urlRedirectUpdateSchema>;

// Website Updates table
export const websiteUpdates = pgTable('website_updates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  version: text('version').notNull(),
  changeType: text('change_type').notNull(), // 'feature', 'bugfix', 'security', 'improvement'
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high', 'critical'
  status: text('status').default('draft').notNull(), // 'draft', 'published', 'deploying', 'deployed', 'failed'
  deploymentUrl: text('deployment_url'), // GitHub deployment URL
  githubCommitHash: text('github_commit_hash'),
  scheduledAt: timestamp('scheduled_at'),
  deployedAt: timestamp('deployed_at'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Admin Notifications table
export const adminNotifications = pgTable('admin_notifications', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'update', 'activity', 'system', 'deployment', 'analytics'
  title: text('title').notNull(),
  message: text('message').notNull(),
  icon: text('icon').default('ri-notification-line'),
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
  isRead: boolean('is_read').default(false).notNull(),
  actionUrl: text('action_url'), // Optional URL to navigate to
  relatedEntityType: text('related_entity_type'), // 'update', 'user', 'game', 'blog'
  relatedEntityId: integer('related_entity_id'),
  userId: integer('user_id').references(() => users.id).notNull(), // Admin user
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Admin Activity Logs table
export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(), // 'login', 'update_published', 'game_added', 'settings_changed'
  entityType: text('entity_type'), // 'game', 'blog', 'user', 'settings', 'update'
  entityId: integer('entity_id'),
  description: text('description').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: json('metadata').$type<Record<string, any>>(), // Additional context data
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Create schemas for the new tables
export const insertWebsiteUpdateSchema = createInsertSchema(websiteUpdates);
export const insertAdminNotificationSchema = createInsertSchema(adminNotifications);
export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs);

export type WebsiteUpdate = typeof websiteUpdates.$inferSelect;
export type InsertWebsiteUpdate = z.infer<typeof insertWebsiteUpdateSchema>;
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;

// Website Update History table for rollback functionality
export const websiteUpdateHistory = pgTable('website_update_history', {
  id: serial('id').primaryKey(),
  updateId: integer('update_id').references(() => websiteUpdates.id).notNull(),
  version: text('version').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  changeType: text('change_type').notNull(),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
  githubCommitHash: text('github_commit_hash'),
  deploymentUrl: text('deployment_url'),
  rollbackData: json('rollback_data').$type<Record<string, any>>(), // Store rollback information
  isActive: boolean('is_active').default(false).notNull(), // Current active version
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const insertWebsiteUpdateHistorySchema = createInsertSchema(websiteUpdateHistory);
export type WebsiteUpdateHistory = typeof websiteUpdateHistory.$inferSelect;
export type InsertWebsiteUpdateHistory = z.infer<typeof insertWebsiteUpdateHistorySchema>;

// SEO Schema Management tables
export const seoSchemas = pgTable('seo_schemas', {
  id: serial('id').primaryKey(),
  schemaType: schemaTypeEnum('schema_type').notNull(),
  contentType: schemaContentTypeEnum('content_type').notNull(),
  contentId: integer('content_id'), // References the specific content (game, blog post, page, category)
  name: text('name').notNull(), // Human-readable name for admin interface
  schemaData: json('schema_data').$type<Record<string, any>>().notNull(), // The actual JSON-LD schema
  isActive: boolean('is_active').default(true).notNull(),
  isAutoGenerated: boolean('is_auto_generated').default(true).notNull(),
  lastValidated: timestamp('last_validated'),
  validationErrors: json('validation_errors').$type<string[]>(),
  priority: integer('priority').default(0).notNull(), // For ordering multiple schemas on same page
  createdBy: integer('created_by').references(() => users.id).notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// SEO Schema Templates for automatic generation
export const seoSchemaTemplates = pgTable('seo_schema_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  schemaType: schemaTypeEnum('schema_type').notNull(),
  contentType: schemaContentTypeEnum('content_type').notNull(),
  template: json('template').$type<Record<string, any>>().notNull(), // Template with placeholders
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// SEO Schema Analytics for tracking performance
export const seoSchemaAnalytics = pgTable('seo_schema_analytics', {
  id: serial('id').primaryKey(),
  schemaId: integer('schema_id').references(() => seoSchemas.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  avgPosition: integer('avg_position'),
  richSnippetAppearances: integer('rich_snippet_appearances').default(0).notNull(),
  validationStatus: text('validation_status').default('valid').notNull(), // 'valid', 'warning', 'error'
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Create schemas and types for SEO tables
export const insertSeoSchemaSchema = createInsertSchema(seoSchemas);
export const insertSeoSchemaTemplateSchema = createInsertSchema(seoSchemaTemplates);
export const insertSeoSchemaAnalyticsSchema = createInsertSchema(seoSchemaAnalytics);

export type SeoSchema = typeof seoSchemas.$inferSelect;
export type InsertSeoSchema = z.infer<typeof insertSeoSchemaSchema>;
export type SeoSchemaTemplate = typeof seoSchemaTemplates.$inferSelect;
export type InsertSeoSchemaTemplate = z.infer<typeof insertSeoSchemaTemplateSchema>;
export type SeoSchemaAnalytics = typeof seoSchemaAnalytics.$inferSelect;
export type InsertSeoSchemaAnalytics = z.infer<typeof insertSeoSchemaAnalyticsSchema>;

// Signup Options table for managing authentication providers
export const signupOptions = pgTable('signup_options', {
  id: serial('id').primaryKey(),
  provider: signupProviderEnum('provider').notNull().unique(),
  displayName: text('display_name').notNull(),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  icon: text('icon').notNull(), // CSS class or icon name
  color: text('color').notNull(), // Brand color for the button
  sortOrder: integer('sort_order').default(0).notNull(),
  configuration: json('configuration').$type<Record<string, any>>(), // Provider-specific config
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Signup options schema and types
export const insertSignupOptionSchema = createInsertSchema(signupOptions);
export type SignupOption = typeof signupOptions.$inferSelect;
export type InsertSignupOption = z.infer<typeof insertSignupOptionSchema>;

// Team Members types
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

// Hero Images table for hero section slider
export const heroImages = pgTable('hero_images', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imagePath: text('image_path').notNull(), // Path to the uploaded image
  linkUrl: text('link_url'), // Optional link when image is clicked
  linkText: text('link_text'), // Text for the link button
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  displayDuration: integer('display_duration').default(5000).notNull(), // milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Hero images schema and types
export const insertHeroImageSchema = createInsertSchema(heroImages);
export type HeroImage = typeof heroImages.$inferSelect;
export type InsertHeroImage = z.infer<typeof insertHeroImageSchema>;
