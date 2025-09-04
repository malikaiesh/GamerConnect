import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, uniqueIndex, date, index, decimal, varchar, unique } from 'drizzle-orm/pg-core';
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
export const apiKeyTypeEnum = pgEnum('api_key_type', ['tinymce', 'game-monetize', 'analytics', 'sendgrid', 'custom', 'stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net']);
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

// Event Status Enum
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'ongoing', 'completed', 'cancelled']);

// Event Type Enum  
export const eventTypeEnum = pgEnum('event_type', ['tournament', 'game_release', 'community', 'maintenance', 'seasonal', 'streaming', 'meetup', 'competition', 'other']);

// Event Location Type Enum
export const eventLocationTypeEnum = pgEnum('event_location_type', ['online', 'physical', 'hybrid']);

// Registration Status Enum
export const registrationStatusEnum = pgEnum('registration_status', ['registered', 'cancelled', 'attended', 'no_show']);

// Google Indexing Status Enum
export const indexingStatusEnum = pgEnum('indexing_status', ['pending', 'submitted', 'indexed', 'failed', 'rate_limited']);

// Content Type Enum for Indexing
export const indexingContentTypeEnum = pgEnum('indexing_content_type', ['game', 'blog_post', 'page', 'category']);

// Backup Status Enum
export const backupStatusEnum = pgEnum('backup_status', ['pending', 'in_progress', 'completed', 'failed', 'cancelled']);

// Backup Type Enum
export const backupTypeEnum = pgEnum('backup_type', ['full', 'database_only', 'files_only', 'settings_only']);

// Backup Storage Location Enum
export const backupStorageEnum = pgEnum('backup_storage', ['local', 'cloud', 'both']);

// Restore Status Enum
export const restoreStatusEnum = pgEnum('restore_status', ['pending', 'in_progress', 'completed', 'failed', 'cancelled']);

// Room System Enums
export const roomTypeEnum = pgEnum('room_type', ['public', 'private']);
export const roomStatusEnum = pgEnum('room_status', ['active', 'inactive', 'maintenance']);
export const roomUserRoleEnum = pgEnum('room_user_role', ['owner', 'manager', 'member', 'guest']);
export const roomUserStatusEnum = pgEnum('room_user_status', ['active', 'muted', 'kicked', 'banned']);
export const giftTypeEnum = pgEnum('gift_type', ['flower', 'car', 'diamond', 'crown', 'castle', 'ring', 'heart']);

// Short Links Enum
export const shortLinkTypeEnum = pgEnum('short_link_type', ['game', 'blog', 'category', 'page']);

// Payment Gateway Enums
export const paymentGatewayTypeEnum = pgEnum('payment_gateway_type', ['stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net', 'manual']);
export const paymentStatusEnum = pgEnum('payment_status', ['enabled', 'disabled', 'maintenance']);
export const paymentMethodTypeEnum = pgEnum('payment_method_type', ['automated', 'manual']);
export const paymentCurrencyEnum = pgEnum('payment_currency', ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']);
export const giftAnimationEnum = pgEnum('gift_animation', ['default', 'sparkle', 'confetti', 'fireworks']);

// Pricing Plan Enums
export const planTypeEnum = pgEnum('plan_type', ['diamonds', 'verification', 'room_creation', 'premium_features']);
export const planStatusEnum = pgEnum('plan_status', ['active', 'inactive', 'archived']);
export const planDurationEnum = pgEnum('plan_duration', ['one_time', 'monthly', '6_months', 'yearly', 'lifetime']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired', 'pending', 'suspended']);

// Verification Request Enums
export const verificationRequestTypeEnum = pgEnum('verification_request_type', ['user', 'room']);
export const verificationRequestStatusEnum = pgEnum('verification_request_status', ['pending', 'approved', 'rejected', 'under_review']);

// Webmaster Tools Enums
export const webmasterToolStatusEnum = pgEnum('webmaster_tool_status', ['active', 'inactive']);
export const webmasterVerificationStatusEnum = pgEnum('webmaster_verification_status', ['pending', 'verified', 'failed', 'not_verified']);

// Referral System Enums
export const referralStatusEnum = pgEnum('referral_status', ['pending', 'confirmed', 'cancelled', 'expired']);
export const referralRewardTypeEnum = pgEnum('referral_reward_type', ['registration', 'first_game', 'profile_complete', 'subscription', 'activity_bonus', 'milestone', 'recurring_commission']);
export const referralRewardStatusEnum = pgEnum('referral_reward_status', ['pending', 'approved', 'paid', 'cancelled']);
export const referralTierEnum = pgEnum('referral_tier', ['tier_1', 'tier_2', 'tier_3']);
export const referralCodeStatusEnum = pgEnum('referral_code_status', ['active', 'inactive', 'expired']);
export const payoutMethodEnum = pgEnum('payout_method', ['paypal', 'binance', 'payoneer', 'bank_transfer', 'crypto', 'store_credit', 'gift_card', 'wise']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);

// Revenue tracking enums
export const revenueCategoryEnum = pgEnum('revenue_category', [
  'subscriptions', 'advertising', 'games', 'in_app_purchases', 'referrals', 
  'partnerships', 'premium_features', 'virtual_currency', 'merchandise', 
  'verification_fees', 'room_hosting', 'tournaments', 'donations', 'other'
]);
export const revenueStatusEnum = pgEnum('revenue_status', ['pending', 'completed', 'failed', 'refunded', 'disputed']);
export const revenueFrequencyEnum = pgEnum('revenue_frequency', ['one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

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
  
  // Verification system
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: integer('verified_by').references(() => users.id),
  
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

// Short Links table
export const shortLinks = pgTable('short_links', {
  id: serial('id').primaryKey(),
  shortCode: text('short_code').notNull().unique(),
  originalUrl: text('original_url').notNull(),
  targetType: shortLinkTypeEnum('target_type').notNull(),
  targetId: integer('target_id'),
  targetSlug: text('target_slug'),
  clickCount: integer('click_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastClickedAt: timestamp('last_clicked_at')
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
  
  // Cookie settings
  cookiePopupEnabled: boolean('cookie_popup_enabled').default(true).notNull(),
  cookiePopupTitle: text('cookie_popup_title').default('We use cookies').notNull(),
  cookiePopupMessage: text('cookie_popup_message').default('We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.').notNull(),
  cookieAcceptButtonText: text('cookie_accept_button_text').default('Accept All').notNull(),
  cookieDeclineButtonText: text('cookie_decline_button_text').default('Decline').notNull(),
  cookieLearnMoreText: text('cookie_learn_more_text').default('Learn More').notNull(),
  cookieLearnMoreUrl: text('cookie_learn_more_url').default('/privacy').notNull(),
  cookiePopupPosition: text('cookie_popup_position').default('bottom').notNull(), // 'bottom', 'top', 'center'
  cookiePopupTheme: text('cookie_popup_theme').default('dark').notNull(), // 'dark', 'light'
  
  // Translation settings
  translationEnabled: boolean('translation_enabled').default(false).notNull(),
  defaultLanguage: text('default_language').default('en').notNull(),
  autoDetectLanguage: boolean('auto_detect_language').default(true).notNull(),
  showLanguageSelectorOnHomepage: boolean('show_language_selector_on_homepage').default(true).notNull(),
  
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
  sessions: many(userSessions),
  referralCodes: many(referralCodes),
  referralsAsReferrer: many(referrals, { relationName: 'referrer' }),
  referralsAsReferred: many(referrals, { relationName: 'referred' }),
  referralRewards: many(referralRewards),
  referralPayouts: many(referralPayouts),
  referralAnalytics: many(referralAnalytics),
  referralMilestones: many(referralMilestones)
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
  featuredImage: (schema) => schema.min(1, "Featured image is required").refine((val) => {
    // Allow local file paths (starting with /) or valid URLs
    if (val.startsWith('/')) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Featured image must be a valid URL or uploaded image" }),
  authorAvatar: (schema) => schema.optional().nullable().refine((val) => {
    if (!val) return true; // Allow null/undefined
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Author avatar must be a valid URL or left empty" })
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
  profilePicture: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "Profile picture must be a valid URL or empty"),
  bio: (schema) => schema.max(500, "Bio must not exceed 500 characters").optional().nullable(),
  socialLinkedin: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "LinkedIn must be a valid URL or empty"),
  socialTwitter: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "Twitter must be a valid URL or empty"),
  socialGithub: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "GitHub must be a valid URL or empty"),
  socialInstagram: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "Instagram must be a valid URL or empty"),
  socialTiktok: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "TikTok must be a valid URL or empty"),
  socialFacebook: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "Facebook must be a valid URL or empty"),
  socialYoutube: (schema) => schema.optional().nullable().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, "YouTube must be a valid URL or empty"),
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
      return !!(data.adCode && data.adCode.trim().length > 0);
    }
    // If not Google Ad, either imageUrl+targetUrl or adCode must be provided
    return (
      (!!data.imageUrl && !!data.targetUrl) || 
      (!!data.adCode && data.adCode.trim().length > 0)
    );
  },
  {
    message: "For Google Ads provide Ad Code. For custom ads provide either Ad Code or both Image URL and Target URL",
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

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  eventType: eventTypeEnum('event_type').notNull(),
  status: eventStatusEnum('status').default('draft').notNull(),
  
  // Date and time fields
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  timezone: text('timezone').default('UTC').notNull(),
  
  // Location fields
  locationType: eventLocationTypeEnum('location_type').notNull(),
  locationName: text('location_name'),
  locationAddress: text('location_address'),
  onlineUrl: text('online_url'),
  
  // Registration fields
  registrationEnabled: boolean('registration_enabled').default(false).notNull(),
  registrationStartDate: timestamp('registration_start_date'),
  registrationEndDate: timestamp('registration_end_date'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0).notNull(),
  registrationFee: integer('registration_fee').default(0).notNull(), // in cents
  
  // Media fields
  bannerImage: text('banner_image'),
  gallery: json('gallery').$type<string[]>().default([]),
  
  // Content fields
  rules: text('rules'),
  prizes: text('prizes'),
  requirements: text('requirements'),
  contactInfo: text('contact_info'),
  
  // SEO fields
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // System fields
  featured: boolean('featured').default(false).notNull(),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Event Registrations table
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Guest registration fields (for non-users)
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  guestPhone: text('guest_phone'),
  
  status: registrationStatusEnum('status').default('registered').notNull(),
  notes: text('notes'),
  paymentStatus: text('payment_status').default('pending'),
  
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    eventUserIdx: uniqueIndex('event_user_idx').on(table.eventId, table.userId),
    eventGuestEmailIdx: uniqueIndex('event_guest_email_idx').on(table.eventId, table.guestEmail)
  };
});

// Event Categories table (optional, for organizing events)
export const eventCategories = pgTable('event_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#6366f1'),
  icon: text('icon'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Event-Category relationship table
export const eventCategoryRelations = pgTable('event_category_relations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => eventCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => {
  return {
    eventCategoryIdx: uniqueIndex('event_category_idx').on(table.eventId, table.categoryId)
  };
});

// Events relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  }),
  registrations: many(eventRegistrations),
  categories: many(eventCategoryRelations)
}));

// Event Registrations relations
export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id]
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id]
  })
}));

// Event Categories relations
export const eventCategoriesRelations = relations(eventCategories, ({ many }) => ({
  events: many(eventCategoryRelations)
}));

// Event Category Relations relations
export const eventCategoryRelationsRelations = relations(eventCategoryRelations, ({ one }) => ({
  event: one(events, {
    fields: [eventCategoryRelations.eventId],
    references: [events.id]
  }),
  category: one(eventCategories, {
    fields: [eventCategoryRelations.categoryId],
    references: [eventCategories.id]
  })
}));

// Event validation schemas
export const insertEventSchema = createInsertSchema(events, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  startDate: (schema) => schema.refine(date => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return date >= yesterday;
  }, { message: "Start date must be today or in the future" }),
  endDate: (schema) => schema.optional().nullable(),
  timezone: (schema) => schema.optional().default('UTC'),
  locationType: (schema) => schema.refine(val => ['online', 'physical', 'hybrid'].includes(val)),
  registrationEnabled: (schema) => schema.optional().default(false),
  maxParticipants: (schema) => schema.optional().nullable(),
  registrationFee: (schema) => schema.optional().default(0),
  featured: (schema) => schema.optional().default(false),
  metaTitle: (schema) => schema.optional().nullable(),
  metaDescription: (schema) => schema.optional().nullable()
})
.refine(
  (data) => {
    // If end date is provided, it must be after start date
    if (data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
)
.refine(
  (data) => {
    // If registration is enabled, registration end date should be before or equal to event start date
    if (data.registrationEnabled && data.registrationEndDate) {
      return data.registrationEndDate <= data.startDate;
    }
    return true;
  },
  {
    message: "Registration end date must be before or equal to event start date",
    path: ["registrationEndDate"]
  }
);

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations, {
  eventId: (schema) => schema.positive().int("Event ID must be a positive integer"),
  userId: (schema) => schema.optional().nullable(),
  guestName: (schema) => schema.optional().nullable(),
  guestEmail: (schema) => schema.optional().nullable(),
  guestPhone: (schema) => schema.optional().nullable(),
  notes: (schema) => schema.optional().nullable()
});

export const insertEventCategorySchema = createInsertSchema(eventCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: (schema) => schema.optional().nullable(),
  color: (schema) => schema.optional().default('#6366f1'),
  icon: (schema) => schema.optional().nullable(),
  isActive: (schema) => schema.optional().default(true)
});

// Type exports for events
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventCategory = typeof eventCategories.$inferSelect;
export type InsertEventCategory = z.infer<typeof insertEventCategorySchema>;
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

// Google Indexing Credentials table
export const googleIndexingCredentials = pgTable('google_indexing_credentials', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull(),
  serviceAccountEmail: text('service_account_email').notNull(),
  privateKey: text('private_key').notNull(), // Encrypted service account private key
  clientEmail: text('client_email').notNull(),
  clientId: text('client_id').notNull(),
  authUri: text('auth_uri').notNull(),
  tokenUri: text('token_uri').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Indexing Requests table
export const indexingRequests = pgTable('indexing_requests', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  contentType: indexingContentTypeEnum('content_type').notNull(),
  contentId: integer('content_id').notNull(), // ID of the game, blog post, page, or category
  status: indexingStatusEnum('status').default('pending').notNull(),
  requestType: text('request_type').notNull().default('URL_UPDATED'), // URL_UPDATED, URL_DELETED
  submitDate: timestamp('submit_date').defaultNow().notNull(),
  indexedDate: timestamp('indexed_date'),
  responseData: json('response_data').$type<Record<string, any>>(), // Google API response
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Indexing Logs table (for history and analytics)
export const indexingLogs = pgTable('indexing_logs', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').references(() => indexingRequests.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'submit', 'retry', 'status_check', 'delete'
  status: indexingStatusEnum('status').notNull(),
  message: text('message'),
  responseData: json('response_data').$type<Record<string, any>>(),
  quotaUsed: integer('quota_used').default(1).notNull(), // Track API quota usage
  duration: integer('duration'), // Request duration in milliseconds
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Indexing settings table
export const indexingSettings = pgTable('indexing_settings', {
  id: serial('id').primaryKey(),
  autoIndexing: boolean('auto_indexing').default(false).notNull(), // Auto-submit new content
  batchSize: integer('batch_size').default(100).notNull(), // URLs per batch
  dailyQuotaLimit: integer('daily_quota_limit').default(200).notNull(), // Daily API calls limit
  quotaUsedToday: integer('quota_used_today').default(0).notNull(),
  lastQuotaReset: timestamp('last_quota_reset').defaultNow().notNull(),
  retryFailedAfterHours: integer('retry_failed_after_hours').default(24).notNull(),
  enableNotifications: boolean('enable_notifications').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Google indexing schema and types
export const insertGoogleIndexingCredentialSchema = createInsertSchema(googleIndexingCredentials);
export const insertIndexingRequestSchema = createInsertSchema(indexingRequests);
export const insertIndexingLogSchema = createInsertSchema(indexingLogs);
export const insertIndexingSettingsSchema = createInsertSchema(indexingSettings);

export type GoogleIndexingCredential = typeof googleIndexingCredentials.$inferSelect;
export type InsertGoogleIndexingCredential = z.infer<typeof insertGoogleIndexingCredentialSchema>;
export type IndexingRequest = typeof indexingRequests.$inferSelect;
export type InsertIndexingRequest = z.infer<typeof insertIndexingRequestSchema>;
export type IndexingLog = typeof indexingLogs.$inferSelect;
export type InsertIndexingLog = z.infer<typeof insertIndexingLogSchema>;
export type IndexingSettings = typeof indexingSettings.$inferSelect;
export type InsertIndexingSettings = z.infer<typeof insertIndexingSettingsSchema>;

// ================== BACKUP & RESTORE SYSTEM ==================

// Backup Configurations table (for scheduled backups)
export const backupConfigs = pgTable('backup_configs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Friendly name for the backup config
  description: text('description'),
  backupType: backupTypeEnum('backup_type').default('full').notNull(),
  storageLocation: backupStorageEnum('storage_location').default('local').notNull(),
  cloudStoragePath: text('cloud_storage_path'), // Cloud storage bucket/path
  schedule: text('schedule'), // Cron expression for scheduled backups
  isScheduleEnabled: boolean('is_schedule_enabled').default(false).notNull(),
  retentionDays: integer('retention_days').default(30).notNull(), // How long to keep backups
  maxBackups: integer('max_backups').default(10).notNull(), // Maximum number of backups to keep
  
  // Include/exclude options
  includeDatabaseStructure: boolean('include_database_structure').default(true).notNull(),
  includeDatabaseData: boolean('include_database_data').default(true).notNull(),
  includeUploads: boolean('include_uploads').default(true).notNull(),
  includeAssets: boolean('include_assets').default(true).notNull(),
  includeSettings: boolean('include_settings').default(true).notNull(),
  includeLogs: boolean('include_logs').default(false).notNull(),
  
  // Compression settings
  compressionEnabled: boolean('compression_enabled').default(true).notNull(),
  compressionLevel: integer('compression_level').default(6).notNull(), // 1-9, 6 is balanced
  
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Backups table (records of all backups taken)
export const backups = pgTable('backups', {
  id: serial('id').primaryKey(),
  configId: integer('config_id').references(() => backupConfigs.id, { onDelete: 'set null' }),
  name: text('name').notNull(), // Generated name for the backup
  description: text('description'),
  backupType: backupTypeEnum('backup_type').notNull(),
  status: backupStatusEnum('status').default('pending').notNull(),
  
  // File information
  fileName: text('file_name'), // Name of the backup file
  filePath: text('file_path'), // Local path to backup file
  cloudStoragePath: text('cloud_storage_path'), // Cloud storage path
  fileSize: integer('file_size'), // Size in bytes
  checksumMd5: text('checksum_md5'), // MD5 hash for integrity
  checksumSha256: text('checksum_sha256'), // SHA256 hash for integrity
  
  // Backup content information
  databaseTableCount: integer('database_table_count'),
  totalRecords: integer('total_records'),
  fileCount: integer('file_count'), // Number of files included
  
  // Timing information
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Duration in seconds
  
  // Error handling
  errorMessage: text('error_message'),
  warningMessage: text('warning_message'),
  
  // Metadata
  metadata: json('metadata').$type<{
    includes?: string[];
    excludes?: string[];
    compression?: {
      enabled: boolean;
      level: number;
      originalSize?: number;
      compressedSize?: number;
    };
    environment?: {
      nodeVersion?: string;
      databaseVersion?: string;
      serverInfo?: string;
    };
  }>(),
  
  // Track who initiated the backup
  triggeredBy: text('triggered_by').default('manual').notNull(), // 'manual', 'scheduled', 'api'
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Backup Files table (manifest of files in each backup)
export const backupFiles = pgTable('backup_files', {
  id: serial('id').primaryKey(),
  backupId: integer('backup_id').references(() => backups.id, { onDelete: 'cascade' }).notNull(),
  filePath: text('file_path').notNull(), // Relative path of the file
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // 'database', 'upload', 'asset', 'config', 'log'
  fileSize: integer('file_size'), // Size in bytes
  checksumMd5: text('checksum_md5'), // MD5 hash of the file
  lastModified: timestamp('last_modified'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Backup Logs table (detailed logs of backup operations)
export const backupLogs = pgTable('backup_logs', {
  id: serial('id').primaryKey(),
  backupId: integer('backup_id').references(() => backups.id, { onDelete: 'cascade' }),
  restoreId: integer('restore_id'), // Will add foreign key relation later to avoid circular reference
  operationType: text('operation_type').notNull().default('backup'), // 'backup', 'restore'
  level: text('level').notNull().default('info'), // 'debug', 'info', 'warn', 'error'
  message: text('message').notNull(),
  data: json('data').$type<Record<string, any>>(), // Additional structured data
  duration: integer('duration'), // Operation duration in milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Restores table (records of restore operations)
export const restores = pgTable('restores', {
  id: serial('id').primaryKey(),
  backupId: integer('backup_id').references(() => backups.id).notNull(),
  name: text('name').notNull(), // Name for the restore operation
  description: text('description'),
  status: restoreStatusEnum('status').default('pending').notNull(),
  
  // Restore options
  restoreDatabase: boolean('restore_database').default(true).notNull(),
  restoreFiles: boolean('restore_files').default(true).notNull(),
  restoreSettings: boolean('restore_settings').default(true).notNull(),
  createBackupBeforeRestore: boolean('create_backup_before_restore').default(true).notNull(),
  
  // Pre-restore backup information
  preRestoreBackupId: integer('pre_restore_backup_id').references(() => backups.id),
  
  // Timing information
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Duration in seconds
  
  // Progress tracking
  totalSteps: integer('total_steps'),
  completedSteps: integer('completed_steps'),
  currentStep: text('current_step'),
  
  // Results
  tablesRestored: integer('tables_restored'),
  recordsRestored: integer('records_restored'),
  filesRestored: integer('files_restored'),
  
  // Error handling
  errorMessage: text('error_message'),
  warningMessage: text('warning_message'),
  
  // Metadata
  metadata: json('metadata').$type<{
    originalBackupInfo?: {
      createdAt?: string;
      backupType?: string;
      fileSize?: number;
    };
    environment?: {
      nodeVersion?: string;
      databaseVersion?: string;
    };
  }>(),
  
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Backup & Restore schema and types
export const insertBackupConfigSchema = createInsertSchema(backupConfigs);
export const insertBackupSchema = createInsertSchema(backups);
export const insertBackupFileSchema = createInsertSchema(backupFiles);
export const insertBackupLogSchema = createInsertSchema(backupLogs);
export const insertRestoreSchema = createInsertSchema(restores);

export type BackupConfig = typeof backupConfigs.$inferSelect;
export type InsertBackupConfig = z.infer<typeof insertBackupConfigSchema>;
export type Backup = typeof backups.$inferSelect;
export type InsertBackup = z.infer<typeof insertBackupSchema>;
export type BackupFile = typeof backupFiles.$inferSelect;
export type InsertBackupFile = z.infer<typeof insertBackupFileSchema>;
export type BackupLog = typeof backupLogs.$inferSelect;
export type InsertBackupLog = z.infer<typeof insertBackupLogSchema>;
export type Restore = typeof restores.$inferSelect;
export type InsertRestore = z.infer<typeof insertRestoreSchema>;

// Room System Tables

// Rooms table
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull().unique(), // Unique room identifier for joining
  name: text('name').notNull(),
  description: text('description'),
  type: roomTypeEnum('type').default('public').notNull(),
  password: text('password'), // For private rooms
  maxSeats: integer('max_seats').default(8).notNull(),
  currentUsers: integer('current_users').default(0).notNull(),
  
  // Room settings
  voiceChatEnabled: boolean('voice_chat_enabled').default(true).notNull(),
  textChatEnabled: boolean('text_chat_enabled').default(true).notNull(),
  giftsEnabled: boolean('gifts_enabled').default(true).notNull(),
  backgroundTheme: text('background_theme').default('default'),
  backgroundMusic: text('background_music'),
  musicEnabled: boolean('music_enabled').default(false).notNull(),
  
  // Room customization
  bannerImage: text('banner_image'),
  tags: text('tags').array().default([]),
  category: text('category').default('general'),
  country: text('country'),
  language: text('language').default('en'),
  
  // Room state
  status: roomStatusEnum('status').default('active').notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  // Owner information
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Statistics
  totalVisits: integer('total_visits').default(0).notNull(),
  totalGiftsReceived: integer('total_gifts_received').default(0).notNull(),
  totalGiftValue: integer('total_gift_value').default(0).notNull(), // in cents
  
  // Verification system
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: integer('verified_by').references(() => users.id),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull()
});

// Room Users table (junction table for users in rooms)
export const roomUsers = pgTable('room_users', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  role: roomUserRoleEnum('role').default('member').notNull(),
  status: roomUserStatusEnum('status').default('active').notNull(),
  seatNumber: integer('seat_number'), // Which seat they're in (1-8)
  
  // User state in room
  isMuted: boolean('is_muted').default(false).notNull(),
  isMicOn: boolean('is_mic_on').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  
  // Statistics
  giftsReceived: integer('gifts_received').default(0).notNull(),
  giftsSent: integer('gifts_sent').default(0).notNull(),
  messagesCount: integer('messages_count').default(0).notNull(),
  
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull()
});

// Room Messages table
export const roomMessages = pgTable('room_messages', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  message: text('message').notNull(),
  messageType: text('message_type').default('text').notNull(), // 'text', 'emoji', 'system'
  isPrivate: boolean('is_private').default(false).notNull(),
  recipientId: integer('recipient_id').references(() => users.id, { onDelete: 'cascade' }), // For private messages
  
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Gifts table
export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: giftTypeEnum('type').notNull(),
  image: text('image').notNull(),
  animation: giftAnimationEnum('animation').default('default').notNull(),
  
  price: integer('price').notNull(), // Price in coins/diamonds
  rarity: text('rarity').default('common').notNull(), // 'common', 'rare', 'epic', 'legendary'
  
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Room Gifts table (gifts sent in rooms)
export const roomGifts = pgTable('room_gifts', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: integer('recipient_id').references(() => users.id, { onDelete: 'cascade' }), // Can be null for room-wide gifts
  giftId: integer('gift_id').notNull().references(() => gifts.id, { onDelete: 'cascade' }),
  
  quantity: integer('quantity').default(1).notNull(),
  totalValue: integer('total_value').notNull(), // Total value in coins/diamonds
  message: text('message'), // Optional message with gift
  
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// User Wallets table (for virtual currency)
export const userWallets = pgTable('user_wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  coins: integer('coins').default(0).notNull(),
  diamonds: integer('diamonds').default(0).notNull(),
  
  // Lifetime statistics
  totalCoinsEarned: integer('total_coins_earned').default(0).notNull(),
  totalDiamondsEarned: integer('total_diamonds_earned').default(0).notNull(),
  totalCoinsSpent: integer('total_coins_spent').default(0).notNull(),
  totalDiamondsSpent: integer('total_diamonds_spent').default(0).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User Relationships table (friends, followers)
export const userRelationships = pgTable('user_relationships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetUserId: integer('target_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  relationshipType: text('relationship_type').notNull(), // 'friend_request', 'friend', 'following', 'blocked'
  status: text('status').default('pending').notNull(), // 'pending', 'accepted', 'rejected', 'blocked'
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Room Analytics table
export const roomAnalytics = pgTable('room_analytics', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  
  date: timestamp('date').notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  totalMessages: integer('total_messages').default(0).notNull(),
  totalGifts: integer('total_gifts').default(0).notNull(),
  totalGiftValue: integer('total_gift_value').default(0).notNull(),
  averageStayDuration: integer('average_stay_duration').default(0).notNull(), // in seconds
  
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Room System Relations
export const roomsRelations = relations(rooms, ({ many, one }) => ({
  owner: one(users, {
    fields: [rooms.ownerId],
    references: [users.id]
  }),
  roomUsers: many(roomUsers),
  messages: many(roomMessages),
  gifts: many(roomGifts),
  analytics: many(roomAnalytics)
}));

export const roomUsersRelations = relations(roomUsers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomUsers.roomId],
    references: [rooms.id]
  }),
  user: one(users, {
    fields: [roomUsers.userId],
    references: [users.id]
  })
}));

export const roomMessagesRelations = relations(roomMessages, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMessages.roomId],
    references: [rooms.id]
  }),
  user: one(users, {
    fields: [roomMessages.userId],
    references: [users.id]
  }),
  recipient: one(users, {
    fields: [roomMessages.recipientId],
    references: [users.id]
  })
}));

export const giftsRelations = relations(gifts, ({ many }) => ({
  roomGifts: many(roomGifts)
}));

export const roomGiftsRelations = relations(roomGifts, ({ one }) => ({
  room: one(rooms, {
    fields: [roomGifts.roomId],
    references: [rooms.id]
  }),
  sender: one(users, {
    fields: [roomGifts.senderId],
    references: [users.id]
  }),
  recipient: one(users, {
    fields: [roomGifts.recipientId],
    references: [users.id]
  }),
  gift: one(gifts, {
    fields: [roomGifts.giftId],
    references: [gifts.id]
  })
}));

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id]
  })
}));

export const userRelationshipsRelations = relations(userRelationships, ({ one }) => ({
  user: one(users, {
    fields: [userRelationships.userId],
    references: [users.id]
  }),
  targetUser: one(users, {
    fields: [userRelationships.targetUserId],
    references: [users.id]
  })
}));

export const roomAnalyticsRelations = relations(roomAnalytics, ({ one }) => ({
  room: one(rooms, {
    fields: [roomAnalytics.roomId],
    references: [rooms.id]
  })
}));

// Room System Validation Schemas
export const insertRoomSchema = createInsertSchema(rooms, {
  name: (schema) => schema.min(3, "Room name must be at least 3 characters").max(50, "Room name must be less than 50 characters"),
  roomId: (schema) => schema.min(6, "Room ID must be at least 6 characters").max(12, "Room ID must be less than 12 characters"),
  description: (schema) => schema.optional(),
  password: (schema) => schema.optional(),
  maxSeats: (schema) => schema.min(2, "Minimum 2 seats").max(20, "Maximum 20 seats"),
  tags: (schema) => schema.optional()
});

export const insertRoomUserSchema = createInsertSchema(roomUsers, {
  seatNumber: (schema) => schema.optional().nullable()
});

export const insertRoomMessageSchema = createInsertSchema(roomMessages, {
  message: (schema) => schema.min(1, "Message cannot be empty").max(500, "Message too long")
});

export const insertGiftSchema = createInsertSchema(gifts, {
  name: (schema) => schema.min(3, "Gift name must be at least 3 characters"),
  price: (schema) => schema.min(1, "Gift price must be at least 1")
});

export const insertRoomGiftSchema = createInsertSchema(roomGifts, {
  quantity: (schema) => schema.min(1, "Quantity must be at least 1"),
  totalValue: (schema) => schema.min(1, "Total value must be at least 1")
});

export const insertUserWalletSchema = createInsertSchema(userWallets);
export const insertUserRelationshipSchema = createInsertSchema(userRelationships);
export const insertRoomAnalyticsSchema = createInsertSchema(roomAnalytics);

// Room System Type Exports
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type RoomUser = typeof roomUsers.$inferSelect;
export type InsertRoomUser = z.infer<typeof insertRoomUserSchema>;
export type RoomMessage = typeof roomMessages.$inferSelect;
export type InsertRoomMessage = z.infer<typeof insertRoomMessageSchema>;
export type Gift = typeof gifts.$inferSelect;
export type InsertGift = z.infer<typeof insertGiftSchema>;
export type RoomGift = typeof roomGifts.$inferSelect;
export type InsertRoomGift = z.infer<typeof insertRoomGiftSchema>;
export type UserWallet = typeof userWallets.$inferSelect;
export type InsertUserWallet = z.infer<typeof insertUserWalletSchema>;
export type UserRelationship = typeof userRelationships.$inferSelect;
export type InsertUserRelationship = z.infer<typeof insertUserRelationshipSchema>;
export type RoomAnalytics = typeof roomAnalytics.$inferSelect;
export type InsertRoomAnalytics = z.infer<typeof insertRoomAnalyticsSchema>;

// Payment Gateway Tables
export const paymentGateways = pgTable('payment_gateways', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  gatewayType: paymentGatewayTypeEnum('gateway_type').notNull(),
  methodType: paymentMethodTypeEnum('method_type').notNull(),
  status: paymentStatusEnum('status').default('disabled').notNull(),
  description: text('description'),
  logo: text('logo'), // Logo URL or path
  sortOrder: integer('sort_order').default(0).notNull(),
  isTestMode: boolean('is_test_mode').default(true).notNull(),
  supportedCurrencies: paymentCurrencyEnum('supported_currencies').array().notNull(),
  minimumAmount: integer('minimum_amount').default(100), // In cents/smallest unit
  maximumAmount: integer('maximum_amount'), // In cents/smallest unit
  processingFee: integer('processing_fee').default(0), // Percentage * 100 (250 = 2.5%)
  
  // API Configuration (JSON for flexibility)
  apiConfiguration: json('api_configuration').$type<{
    apiKey?: string;
    secretKey?: string;
    publicKey?: string;
    merchantId?: string;
    webhookSecret?: string;
    sandboxApiKey?: string;
    sandboxSecretKey?: string;
    customSettings?: Record<string, any>;
  }>(),
  
  // Manual payment method specific fields
  paymentInstructions: text('payment_instructions'), // For manual methods
  accountDetails: json('account_details').$type<{
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    beneficiaryName?: string;
    cryptoAddress?: string;
    qrCode?: string;
    additionalInfo?: string;
  }>(),
  
  createdBy: integer('created_by').references(() => users.id).notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const paymentTransactions = pgTable('payment_transactions', {
  id: serial('id').primaryKey(),
  transactionId: text('transaction_id').notNull().unique(),
  gatewayId: integer('gateway_id').references(() => paymentGateways.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(), // In cents/smallest unit
  currency: paymentCurrencyEnum('currency').notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  gatewayTransactionId: text('gateway_transaction_id'), // External payment gateway transaction ID
  gatewayResponse: json('gateway_response').$type<Record<string, any>>(), // Full response from gateway
  failureReason: text('failure_reason'),
  refundedAmount: integer('refunded_amount').default(0), // In cents/smallest unit
  
  // Manual payment verification
  paymentProof: text('payment_proof'), // File path to uploaded proof
  verificationNotes: text('verification_notes'),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  
  // Metadata for context
  metadata: json('metadata').$type<{
    productId?: string;
    productType?: string;
    description?: string;
    customerIP?: string;
    userAgent?: string;
    additionalData?: Record<string, any>;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Payment Gateway Relations
export const paymentGatewaysRelations = relations(paymentGateways, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [paymentGateways.createdBy],
    references: [users.id]
  }),
  updatedByUser: one(users, {
    fields: [paymentGateways.updatedBy],
    references: [users.id]
  }),
  transactions: many(paymentTransactions)
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  gateway: one(paymentGateways, {
    fields: [paymentTransactions.gatewayId],
    references: [paymentGateways.id]
  }),
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id]
  }),
  verifiedByUser: one(users, {
    fields: [paymentTransactions.verifiedBy],
    references: [users.id]
  })
}));

// Payment Gateway Validation Schemas
export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways, {
  name: (schema) => schema.min(3, "Gateway name must be at least 3 characters").max(50, "Gateway name must be less than 50 characters"),
  displayName: (schema) => schema.min(3, "Display name must be at least 3 characters").max(100, "Display name must be less than 100 characters"),
  minimumAmount: (schema) => schema.min(1, "Minimum amount must be at least 1"),
  maximumAmount: (schema) => schema.optional().nullable(),
  processingFee: (schema) => schema.min(0, "Processing fee cannot be negative").max(10000, "Processing fee cannot exceed 100%"),
  supportedCurrencies: (schema) => schema.min(1, "At least one currency must be supported")
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions, {
  amount: (schema) => schema.min(1, "Amount must be greater than 0"),
  transactionId: (schema) => schema.min(10, "Transaction ID must be at least 10 characters")
});

// Pricing Plans Table
export const pricingPlans = pgTable('pricing_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., "100 Diamonds", "1 Month Verification"
  displayName: text('display_name').notNull(), // User-friendly name
  planType: planTypeEnum('plan_type').notNull(),
  duration: planDurationEnum('duration').notNull(),
  
  // Pricing details
  price: integer('price').notNull(), // In cents/smallest currency unit
  currency: paymentCurrencyEnum('currency').notNull().default('USD'),
  originalPrice: integer('original_price'), // For showing discounts
  
  // Plan details
  diamondAmount: integer('diamond_amount'), // For diamond plans
  verificationDuration: integer('verification_duration'), // In days for verification plans
  roomCreationLimit: integer('room_creation_limit'), // Number of rooms user can create
  isPopular: boolean('is_popular').default(false),
  
  // Status and ordering
  status: planStatusEnum('status').default('active').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  
  // Features and benefits
  features: json('features').$type<string[]>(), // Array of feature descriptions
  description: text('description'),
  shortDescription: text('short_description'),
  
  // Metadata
  metadata: json('metadata').$type<{
    color?: string;
    badge?: string;
    icon?: string;
    category?: string;
    tags?: string[];
    additionalData?: Record<string, any>;
  }>(),
  
  // Audit fields
  createdBy: integer('created_by').references(() => users.id).notNull(),
  updatedBy: integer('updated_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User Subscriptions Table
export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  planId: integer('plan_id').references(() => pricingPlans.id).notNull(),
  transactionId: integer('transaction_id').references(() => paymentTransactions.id),
  
  // Subscription details
  status: subscriptionStatusEnum('status').default('pending').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'), // Null for lifetime plans
  autoRenew: boolean('auto_renew').default(false),
  
  // Usage tracking for applicable plans
  diamondsReceived: integer('diamonds_received').default(0),
  diamondsUsed: integer('diamonds_used').default(0),
  roomsCreated: integer('rooms_created').default(0),
  
  // Metadata
  metadata: json('metadata').$type<{
    giftedBy?: number; // User ID who gifted this subscription
    discountApplied?: number; // Discount percentage applied
    promoCode?: string;
    notes?: string;
    additionalData?: Record<string, any>;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Verification Requests Table
export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  
  // Request details
  requestType: verificationRequestTypeEnum('request_type').notNull(),
  status: verificationRequestStatusEnum('status').default('pending').notNull(),
  
  // User or Room details
  userId: integer('user_id').references(() => users.id),
  username: text('username'),
  roomId: integer('room_id').references(() => rooms.id),
  roomIdText: text('room_id_text'), // The actual room ID string (like SA1994181)
  
  // Supporting documents/info
  documents: json('documents').$type<{
    identityProof?: string;
    gameplayProof?: string;
    socialProof?: string;
    additionalFiles?: string[];
  }>(),
  
  // Request information
  reason: text('reason').notNull(),
  additionalInfo: text('additional_info'),
  
  // Payment related
  pricingPlanId: integer('pricing_plan_id').references(() => pricingPlans.id),
  paymentTransactionId: integer('payment_transaction_id').references(() => paymentTransactions.id),
  paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'failed'
  
  // Admin review details
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  adminFeedback: text('admin_feedback'),
  
  // Metadata
  metadata: json('metadata').$type<{
    ipAddress?: string;
    userAgent?: string;
    submissionSource?: string;
    priority?: 'low' | 'normal' | 'high';
    tags?: string[];
    additionalData?: Record<string, any>;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Webmaster Tools table
export const webmasterTools = pgTable('webmaster_tools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  verificationUrl: text('verification_url'),
  verificationCode: text('verification_code'),
  htmlTag: text('html_tag'),
  metaTag: text('meta_tag'),
  verificationFile: text('verification_file'),
  verificationFileName: text('verification_file_name'),
  status: webmasterToolStatusEnum('status').default('active').notNull(),
  verificationStatus: webmasterVerificationStatusEnum('verification_status').default('not_verified').notNull(),
  lastVerified: timestamp('last_verified'),
  verificationError: text('verification_error'),
  priority: integer('priority').default(0).notNull(),
  icon: text('icon'),
  helpUrl: text('help_url'),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ===== REFERRAL SYSTEM TABLES =====

// Referral Codes table - stores unique referral codes for users
export const referralCodes = pgTable('referral_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  status: referralCodeStatusEnum('status').default('active').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  clickCount: integer('click_count').default(0).notNull(),
  conversionCount: integer('conversion_count').default(0).notNull(),
  totalEarnings: integer('total_earnings').default(0).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Referrals table - tracks referral relationships
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: integer('referred_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referralCodeId: integer('referral_code_id').notNull().references(() => referralCodes.id, { onDelete: 'cascade' }),
  tier: referralTierEnum('tier').default('tier_1').notNull(),
  status: referralStatusEnum('status').default('pending').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceFingerprint: text('device_fingerprint'),
  source: text('source'),
  totalEarnings: integer('total_earnings').default(0).notNull(),
  lifetimeValue: integer('lifetime_value').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    referrerReferredIdx: uniqueIndex('referrer_referred_idx').on(table.referrerId, table.referredUserId)
  };
});

// Referral Rewards table - tracks individual reward transactions
export const referralRewards = pgTable('referral_rewards', {
  id: serial('id').primaryKey(),
  referralId: integer('referral_id').notNull().references(() => referrals.id, { onDelete: 'cascade' }),
  referrerId: integer('referrer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rewardType: referralRewardTypeEnum('reward_type').notNull(),
  amount: integer('amount').notNull(),
  tier: referralTierEnum('tier').notNull(),
  status: referralRewardStatusEnum('status').default('pending').notNull(),
  description: text('description'),
  metadata: json('metadata').$type<{
    subscription_id?: number;
    milestone_count?: number;
    activity_points?: number;
    original_amount?: number;
  }>(),
  processedAt: timestamp('processed_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Referral Settings table
export const referralSettings = pgTable('referral_settings', {
  id: serial('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value').notNull(),
  settingType: text('setting_type').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Referral Payouts table
export const referralPayouts = pgTable('referral_payouts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  method: payoutMethodEnum('method').notNull(),
  status: payoutStatusEnum('status').default('pending').notNull(),
  payoutDetails: json('payout_details').$type<{
    paypal_email?: string;
    bank_account?: string;
    crypto_address?: string;
    transaction_id?: string;
    processing_fee?: number;
  }>(),
  processedAt: timestamp('processed_at'),
  completedAt: timestamp('completed_at'),
  failureReason: text('failure_reason'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Referral Analytics table
export const referralAnalytics = pgTable('referral_analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  clicks: integer('clicks').default(0).notNull(),
  signups: integer('signups').default(0).notNull(),
  conversions: integer('conversions').default(0).notNull(),
  earnings: integer('earnings').default(0).notNull(),
  tier1Referrals: integer('tier1_referrals').default(0).notNull(),
  tier2Referrals: integer('tier2_referrals').default(0).notNull(),
  tier3Referrals: integer('tier3_referrals').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Referral Milestones table
export const referralMilestones = pgTable('referral_milestones', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  milestoneType: text('milestone_type').notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').default(0).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  rewardAmount: integer('reward_amount').default(0).notNull(),
  completedAt: timestamp('completed_at'),
  nextMilestone: integer('next_milestone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Payout Methods table for admin management
export const payoutMethods = pgTable('payout_methods', {
  id: serial('id').primaryKey(),
  method: payoutMethodEnum('method').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'), // Icon class or URL
  isEnabled: boolean('is_enabled').default(true).notNull(),
  minimumAmount: integer('minimum_amount').default(1000).notNull(), // $10.00
  processingFee: integer('processing_fee').default(0).notNull(), // Fee in cents
  processingTime: text('processing_time').default('1-3 business days'), // Processing time description
  requiredFields: json('required_fields').$type<{
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'email' | 'number';
      required: boolean;
      placeholder?: string;
      validation?: string;
    }>;
  }>().notNull(),
  instructions: text('instructions'), // Additional instructions for users
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User Payout Preferences table  
export const userPayoutPreferences = pgTable('user_payout_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  payoutMethodId: integer('payout_method_id').notNull().references(() => payoutMethods.id, { onDelete: 'cascade' }),
  payoutDetails: json('payout_details').$type<{
    paypal_email?: string;
    binance_email?: string;
    binance_uid?: string;
    payoneer_email?: string;
    bank_account_number?: string;
    bank_routing_number?: string;
    bank_name?: string;
    crypto_address?: string;
    crypto_network?: string;
    wise_email?: string;
    [key: string]: string | undefined;
  }>().notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    userMethodIdx: uniqueIndex('user_method_idx').on(table.userId, table.payoutMethodId)
  };
});

// ===== REVENUE TRACKING SYSTEM =====

// Revenue Sources table - Different revenue streams
export const revenueSources = pgTable('revenue_sources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: revenueCategoryEnum('category').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  trackingEnabled: boolean('tracking_enabled').default(true).notNull(),
  automaticTracking: boolean('automatic_tracking').default(false).notNull(), // Auto-track from integrations
  integrationId: text('integration_id'), // External service ID (Stripe, PayPal, etc.)
  integrationData: json('integration_data').$type<{
    webhook_url?: string;
    api_endpoint?: string;
    credentials?: Record<string, string>;
    mapping?: Record<string, string>;
  }>(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Revenue Transactions table - Individual revenue events
export const revenueTransactions = pgTable('revenue_transactions', {
  id: serial('id').primaryKey(),
  revenueSourceId: integer('revenue_source_id').notNull().references(() => revenueSources.id),
  userId: integer('user_id').references(() => users.id), // User who generated revenue (optional)
  transactionId: text('transaction_id').unique(), // External transaction ID
  amount: integer('amount').notNull(), // Amount in cents
  currency: text('currency').default('USD').notNull(),
  grossAmount: integer('gross_amount'), // Before fees
  fees: integer('fees').default(0).notNull(), // Processing fees
  netAmount: integer('net_amount'), // After fees
  status: revenueStatusEnum('status').default('pending').notNull(),
  description: text('description').notNull(),
  metadata: json('metadata').$type<{
    payment_method?: string;
    subscription_id?: string;
    product_id?: string;
    game_id?: string;
    referral_id?: string;
    campaign_id?: string;
    customer_data?: Record<string, any>;
    [key: string]: any;
  }>(),
  processedAt: timestamp('processed_at'),
  refundedAt: timestamp('refunded_at'),
  refundAmount: integer('refund_amount').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    sourceIdIdx: index('rev_trans_source_idx').on(table.revenueSourceId),
    userIdIdx: index('rev_trans_user_idx').on(table.userId),
    statusIdx: index('rev_trans_status_idx').on(table.status),
    dateIdx: index('rev_trans_date_idx').on(table.createdAt),
    amountIdx: index('rev_trans_amount_idx').on(table.amount)
  };
});

// Revenue Goals table - Target setting and tracking
export const revenueGoals = pgTable('revenue_goals', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  targetAmount: integer('target_amount').notNull(), // Target amount in cents
  currentAmount: integer('current_amount').default(0).notNull(),
  revenueSourceId: integer('revenue_source_id').references(() => revenueSources.id), // Specific source or null for overall
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  frequency: revenueFrequencyEnum('frequency').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at'),
  progressPercentage: integer('progress_percentage').default(0).notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Revenue Analytics table - Aggregated data for performance
export const revenueAnalytics = pgTable('revenue_analytics', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(), // Daily aggregation
  revenueSourceId: integer('revenue_source_id').references(() => revenueSources.id), // null for overall analytics
  totalRevenue: integer('total_revenue').default(0).notNull(),
  totalTransactions: integer('total_transactions').default(0).notNull(),
  averageTransaction: integer('average_transaction').default(0).notNull(),
  successfulTransactions: integer('successful_transactions').default(0).notNull(),
  failedTransactions: integer('failed_transactions').default(0).notNull(),
  refundedAmount: integer('refunded_amount').default(0).notNull(),
  grossRevenue: integer('gross_revenue').default(0).notNull(),
  fees: integer('fees').default(0).notNull(),
  netRevenue: integer('net_revenue').default(0).notNull(),
  uniqueUsers: integer('unique_users').default(0).notNull(),
  conversionRate: integer('conversion_rate').default(0).notNull(), // In basis points (0.01% = 1)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    dateIdx: uniqueIndex('rev_analytics_date_idx').on(table.date, table.revenueSourceId),
    sourceIdx: index('rev_analytics_source_idx').on(table.revenueSourceId),
    revenueIdx: index('rev_analytics_revenue_idx').on(table.totalRevenue)
  };
});

// Revenue Reports table - Saved reports and exports
export const revenueReports = pgTable('revenue_reports', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  reportType: text('report_type').notNull(), // daily, weekly, monthly, quarterly, yearly, custom
  filters: json('filters').$type<{
    date_range?: { start: string; end: string };
    revenue_sources?: number[];
    categories?: string[];
    status?: string[];
    min_amount?: number;
    max_amount?: number;
  }>(),
  reportData: json('report_data').$type<{
    summary?: Record<string, any>;
    charts?: Array<Record<string, any>>;
    tables?: Array<Record<string, any>>;
    metadata?: Record<string, any>;
  }>(),
  generatedBy: integer('generated_by').references(() => users.id),
  isScheduled: boolean('is_scheduled').default(false).notNull(),
  scheduleFrequency: revenueFrequencyEnum('schedule_frequency'),
  nextGeneration: timestamp('next_generation'),
  lastGenerated: timestamp('last_generated'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Pricing Plans Relations
export const pricingPlansRelations = relations(pricingPlans, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [pricingPlans.createdBy],
    references: [users.id]
  }),
  updatedByUser: one(users, {
    fields: [pricingPlans.updatedBy],
    references: [users.id]
  }),
  subscriptions: many(userSubscriptions)
}));

// User Subscriptions Relations
export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id]
  }),
  plan: one(pricingPlans, {
    fields: [userSubscriptions.planId],
    references: [pricingPlans.id]
  }),
  transaction: one(paymentTransactions, {
    fields: [userSubscriptions.transactionId],
    references: [paymentTransactions.id]
  })
}));

// Verification Requests Relations
export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id]
  }),
  room: one(rooms, {
    fields: [verificationRequests.roomId],
    references: [rooms.id]
  }),
  pricingPlan: one(pricingPlans, {
    fields: [verificationRequests.pricingPlanId],
    references: [pricingPlans.id]
  }),
  paymentTransaction: one(paymentTransactions, {
    fields: [verificationRequests.paymentTransactionId],
    references: [paymentTransactions.id]
  }),
  reviewedByUser: one(users, {
    fields: [verificationRequests.reviewedBy],
    references: [users.id]
  })
}));

// Pricing Plan Validation Schemas
export const insertPricingPlanSchema = createInsertSchema(pricingPlans, {
  name: (schema) => schema.min(3, "Plan name must be at least 3 characters").max(100, "Plan name must be less than 100 characters"),
  displayName: (schema) => schema.min(3, "Display name must be at least 3 characters").max(150, "Display name must be less than 150 characters"),
  price: (schema) => schema.min(0, "Price cannot be negative"),
  originalPrice: (schema) => schema.optional().nullable(),
  diamondAmount: (schema) => schema.optional().nullable(),
  verificationDuration: (schema) => schema.optional().nullable(),
  roomCreationLimit: (schema) => schema.optional().nullable(),
  sortOrder: (schema) => schema.min(0, "Sort order cannot be negative")
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions, {
  startDate: (schema) => schema,
  endDate: (schema) => schema.optional().nullable()
});

// Verification Requests Validation Schema
export const insertVerificationRequestSchema = createInsertSchema(verificationRequests, {
  reason: (schema) => schema.min(10, "Reason must be at least 10 characters").max(500, "Reason must be less than 500 characters"),
  additionalInfo: (schema) => schema.optional().nullable(),
  username: (schema) => schema.optional().nullable(),
  roomIdText: (schema) => schema.optional().nullable()
});

// Payment Gateway Type Exports
export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

// Pricing Plan Type Exports
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

// Verification Request Type Exports
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;

// Webmaster Tools Validation Schema
export const insertWebmasterToolSchema = createInsertSchema(webmasterTools, {
  name: (schema) => schema.min(3, "Tool name must be at least 3 characters").max(100, "Tool name must be less than 100 characters"),
  displayName: (schema) => schema.min(3, "Display name must be at least 3 characters").max(150, "Display name must be less than 150 characters"),
  priority: (schema) => schema.min(0, "Priority cannot be negative").max(100, "Priority must be less than 100")
});

// Webmaster Tools Type Exports
export type WebmasterTool = typeof webmasterTools.$inferSelect;
export type InsertWebmasterTool = z.infer<typeof insertWebmasterToolSchema>;

// ===== REFERRAL SYSTEM RELATIONS =====

export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [referralCodes.userId],
    references: [users.id]
  }),
  referrals: many(referrals)
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrer'
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: 'referred'
  }),
  referralCode: one(referralCodes, {
    fields: [referrals.referralCodeId],
    references: [referralCodes.id]
  }),
  rewards: many(referralRewards)
}));

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  referral: one(referrals, {
    fields: [referralRewards.referralId],
    references: [referrals.id]
  }),
  referrer: one(users, {
    fields: [referralRewards.referrerId],
    references: [users.id]
  })
}));

export const referralPayoutsRelations = relations(referralPayouts, ({ one }) => ({
  user: one(users, {
    fields: [referralPayouts.userId],
    references: [users.id]
  })
}));

export const referralAnalyticsRelations = relations(referralAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [referralAnalytics.userId],
    references: [users.id]
  })
}));

export const referralMilestonesRelations = relations(referralMilestones, ({ one }) => ({
  user: one(users, {
    fields: [referralMilestones.userId],
    references: [users.id]
  })
}));

export const payoutMethodsRelations = relations(payoutMethods, ({ many }) => ({
  userPreferences: many(userPayoutPreferences)
}));

export const userPayoutPreferencesRelations = relations(userPayoutPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPayoutPreferences.userId],
    references: [users.id]
  }),
  payoutMethod: one(payoutMethods, {
    fields: [userPayoutPreferences.payoutMethodId],
    references: [payoutMethods.id]
  })
}));

// ===== REVENUE TRACKING RELATIONS =====

export const revenueSourcesRelations = relations(revenueSources, ({ many }) => ({
  transactions: many(revenueTransactions),
  goals: many(revenueGoals),
  analytics: many(revenueAnalytics)
}));

export const revenueTransactionsRelations = relations(revenueTransactions, ({ one }) => ({
  revenueSource: one(revenueSources, {
    fields: [revenueTransactions.revenueSourceId],
    references: [revenueSources.id]
  }),
  user: one(users, {
    fields: [revenueTransactions.userId],
    references: [users.id]
  })
}));

export const revenueGoalsRelations = relations(revenueGoals, ({ one }) => ({
  revenueSource: one(revenueSources, {
    fields: [revenueGoals.revenueSourceId],
    references: [revenueSources.id]
  }),
  createdByUser: one(users, {
    fields: [revenueGoals.createdBy],
    references: [users.id]
  })
}));

export const revenueAnalyticsRelations = relations(revenueAnalytics, ({ one }) => ({
  revenueSource: one(revenueSources, {
    fields: [revenueAnalytics.revenueSourceId],
    references: [revenueSources.id]
  })
}));

export const revenueReportsRelations = relations(revenueReports, ({ one }) => ({
  generatedByUser: one(users, {
    fields: [revenueReports.generatedBy],
    references: [users.id]
  })
}));

// ===== REFERRAL SYSTEM VALIDATION SCHEMAS =====

export const insertReferralCodeSchema = createInsertSchema(referralCodes, {
  code: (schema) => schema.min(3, "Referral code must be at least 3 characters").max(20, "Referral code must be less than 20 characters")
}).omit({ id: true, clickCount: true, conversionCount: true, totalEarnings: true, createdAt: true, updatedAt: true });

export const insertReferralSchema = createInsertSchema(referrals, {
  ipAddress: (schema) => schema.optional(),
  userAgent: (schema) => schema.optional(),
  source: (schema) => schema.optional()
}).omit({ id: true, totalEarnings: true, lifetimeValue: true, createdAt: true, updatedAt: true });

export const insertReferralRewardSchema = createInsertSchema(referralRewards, {
  amount: (schema) => schema.min(0, "Reward amount cannot be negative"),
  description: (schema) => schema.optional()
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertReferralSettingSchema = createInsertSchema(referralSettings, {
  settingKey: (schema) => schema.min(1, "Setting key is required"),
  settingValue: (schema) => schema.min(1, "Setting value is required"),
  settingType: (schema) => schema.refine(val => ['string', 'number', 'boolean', 'json'].includes(val), "Invalid setting type")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertReferralPayoutSchema = createInsertSchema(referralPayouts, {
  amount: (schema) => schema.min(100, "Minimum payout amount is $1.00")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertReferralMilestoneSchema = createInsertSchema(referralMilestones, {
  targetValue: (schema) => schema.min(1, "Target value must be at least 1"),
  rewardAmount: (schema) => schema.min(0, "Reward amount cannot be negative")
}).omit({ id: true, createdAt: true, updatedAt: true });

// ===== REFERRAL SYSTEM TYPE EXPORTS =====

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralSetting = typeof referralSettings.$inferSelect;
export type InsertReferralSetting = z.infer<typeof insertReferralSettingSchema>;
export type ReferralPayout = typeof referralPayouts.$inferSelect;
export type InsertReferralPayout = z.infer<typeof insertReferralPayoutSchema>;
export type ReferralAnalytics = typeof referralAnalytics.$inferSelect;
export type ReferralMilestone = typeof referralMilestones.$inferSelect;
export type InsertReferralMilestone = z.infer<typeof insertReferralMilestoneSchema>;

export const insertPayoutMethodSchema = createInsertSchema(payoutMethods, {
  name: (schema) => schema.min(1, "Payout method name is required"),
  minimumAmount: (schema) => schema.min(100, "Minimum amount must be at least $1.00")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserPayoutPreferenceSchema = createInsertSchema(userPayoutPreferences, {
}).omit({ id: true, createdAt: true, updatedAt: true });

export type PayoutMethod = typeof payoutMethods.$inferSelect;
export type InsertPayoutMethod = z.infer<typeof insertPayoutMethodSchema>;
export type UserPayoutPreference = typeof userPayoutPreferences.$inferSelect;
export type InsertUserPayoutPreference = z.infer<typeof insertUserPayoutPreferenceSchema>;

// ===== REVENUE TRACKING VALIDATION SCHEMAS =====

export const insertRevenueSourceSchema = createInsertSchema(revenueSources, {
  name: (schema) => schema.min(1, "Revenue source name is required").max(100, "Name must be less than 100 characters"),
  description: (schema) => schema.optional()
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertRevenueTransactionSchema = createInsertSchema(revenueTransactions, {
  amount: (schema) => schema.min(1, "Amount must be greater than 0"),
  currency: (schema) => schema.length(3, "Currency must be 3 characters").default("USD"),
  description: (schema) => schema.min(1, "Description is required")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertRevenueGoalSchema = createInsertSchema(revenueGoals, {
  name: (schema) => schema.min(1, "Goal name is required").max(100, "Name must be less than 100 characters"),
  targetAmount: (schema) => schema.min(100, "Target amount must be at least $1.00"),
  startDate: (schema) => schema,
  endDate: (schema) => schema
}).omit({ id: true, currentAmount: true, isAchieved: true, progressPercentage: true, createdAt: true, updatedAt: true });

export const insertRevenueAnalyticsSchema = createInsertSchema(revenueAnalytics, {
  date: (schema) => schema,
  totalRevenue: (schema) => schema.min(0, "Revenue cannot be negative")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertRevenueReportSchema = createInsertSchema(revenueReports, {
  name: (schema) => schema.min(1, "Report name is required").max(100, "Name must be less than 100 characters"),
  reportType: (schema) => schema.min(1, "Report type is required")
}).omit({ id: true, lastGenerated: true, createdAt: true, updatedAt: true });

// ===== REVENUE TRACKING TYPE EXPORTS =====

export type RevenueSource = typeof revenueSources.$inferSelect;
export type InsertRevenueSource = z.infer<typeof insertRevenueSourceSchema>;
export type RevenueTransaction = typeof revenueTransactions.$inferSelect;
export type InsertRevenueTransaction = z.infer<typeof insertRevenueTransactionSchema>;
export type RevenueGoal = typeof revenueGoals.$inferSelect;
export type InsertRevenueGoal = z.infer<typeof insertRevenueGoalSchema>;
export type RevenueAnalytics = typeof revenueAnalytics.$inferSelect;
export type InsertRevenueAnalytics = z.infer<typeof insertRevenueAnalyticsSchema>;
export type RevenueReport = typeof revenueReports.$inferSelect;
export type InsertRevenueReport = z.infer<typeof insertRevenueReportSchema>;

// Languages table for multi-language support
export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g., 'en', 'es', 'fr'
  name: text('name').notNull(), // e.g., 'English', 'Spanish', 'French'
  nativeName: text('native_name').notNull(), // e.g., 'English', 'Español', 'Français'
  flag: text('flag').notNull(), // emoji flag or flag icon code
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Translations table for storing text translations
export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  translationKey: text('translation_key').notNull(), // e.g., 'nav.home', 'common.welcome'
  languageCode: text('language_code').notNull().references(() => languages.code),
  translatedText: text('translated_text').notNull(),
  category: text('category').default('general').notNull(), // e.g., 'navigation', 'common', 'pages'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    // Composite unique constraint to prevent duplicate translations for same key and language
    translationKeyLangIdx: uniqueIndex('translation_key_lang_idx').on(table.translationKey, table.languageCode)
  };
});

// ===== SHORT LINKS VALIDATION SCHEMAS =====

export const insertShortLinkSchema = createInsertSchema(shortLinks, {
  shortCode: (schema) => schema.min(3, "Short code must be at least 3 characters").max(10, "Short code must be less than 10 characters"),
  originalUrl: (schema) => schema.min(1, "Original URL is required").url("Must be a valid URL")
}).omit({ id: true, clickCount: true, createdAt: true, lastClickedAt: true });

// ===== TRANSLATION VALIDATION SCHEMAS =====

export const insertLanguageSchema = createInsertSchema(languages, {
  code: (schema) => schema.min(2, "Language code must be at least 2 characters").max(5, "Language code must be less than 5 characters"),
  name: (schema) => schema.min(1, "Language name is required").max(50, "Name must be less than 50 characters"),
  nativeName: (schema) => schema.min(1, "Native name is required").max(50, "Native name must be less than 50 characters"),
  flag: (schema) => schema.min(1, "Flag is required")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertTranslationSchema = createInsertSchema(translations, {
  translationKey: (schema) => schema.min(1, "Translation key is required").max(100, "Key must be less than 100 characters"),
  languageCode: (schema) => schema.min(2, "Language code is required"),
  translatedText: (schema) => schema.min(1, "Translated text is required"),
  category: (schema) => schema.min(1, "Category is required").max(50, "Category must be less than 50 characters")
}).omit({ id: true, createdAt: true, updatedAt: true });

// ===== SHORT LINKS TYPE EXPORTS =====

export type ShortLink = typeof shortLinks.$inferSelect;
export type InsertShortLink = z.infer<typeof insertShortLinkSchema>;

// ===== TRANSLATION TYPE EXPORTS =====

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

