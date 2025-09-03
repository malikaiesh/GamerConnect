import { pgTable, foreignKey, serial, text, boolean, integer, timestamp, json, unique, uniqueIndex, index, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const adPosition = pgEnum("ad_position", ['above_featured', 'below_featured', 'above_popular', 'below_popular', 'above_about', 'below_about'])
export const apiKeyType = pgEnum("api_key_type", ['tinymce', 'game-monetize', 'analytics', 'sendgrid', 'custom'])
export const backupStatus = pgEnum("backup_status", ['pending', 'in_progress', 'completed', 'failed', 'cancelled'])
export const backupStorage = pgEnum("backup_storage", ['local', 'cloud', 'both'])
export const backupType = pgEnum("backup_type", ['full', 'database_only', 'files_only', 'settings_only'])
export const blogStatus = pgEnum("blog_status", ['draft', 'published'])
export const contentStatus = pgEnum("content_status", ['active', 'inactive'])
export const eventLocationType = pgEnum("event_location_type", ['online', 'physical', 'hybrid'])
export const eventStatus = pgEnum("event_status", ['draft', 'published', 'ongoing', 'completed', 'cancelled'])
export const eventType = pgEnum("event_type", ['tournament', 'game_release', 'community', 'maintenance', 'seasonal', 'streaming', 'meetup', 'competition', 'other'])
export const gameAdPosition = pgEnum("game_ad_position", ['above_game', 'below_game', 'above_related', 'below_related', 'sidebar_top', 'sidebar_bottom'])
export const gameFileType = pgEnum("game_file_type", ['html5', 'apk', 'ios', 'unity'])
export const gameSource = pgEnum("game_source", ['api', 'custom'])
export const gameStatus = pgEnum("game_status", ['active', 'inactive', 'featured'])
export const giftAnimation = pgEnum("gift_animation", ['default', 'sparkle', 'confetti', 'fireworks'])
export const giftType = pgEnum("gift_type", ['flower', 'car', 'diamond', 'crown', 'castle', 'ring', 'heart'])
export const indexingContentType = pgEnum("indexing_content_type", ['game', 'blog_post', 'page', 'category'])
export const indexingStatus = pgEnum("indexing_status", ['pending', 'submitted', 'indexed', 'failed', 'rate_limited'])
export const notificationType = pgEnum("notification_type", ['alert', 'banner', 'modal', 'slide-in', 'toast', 'web-push', 'survey'])
export const pageType = pgEnum("page_type", ['about', 'contact', 'privacy', 'terms', 'cookie-policy', 'faq', 'custom'])
export const paymentCurrency = pgEnum("payment_currency", ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT'])
export const paymentGatewayType = pgEnum("payment_gateway_type", ['stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net', 'manual'])
export const paymentMethodType = pgEnum("payment_method_type", ['automated', 'manual'])
export const paymentStatus = pgEnum("payment_status", ['enabled', 'disabled', 'maintenance'])
export const planDuration = pgEnum("plan_duration", ['one_time', 'monthly', '6_months', 'yearly', 'lifetime'])
export const planStatus = pgEnum("plan_status", ['active', 'inactive', 'archived'])
export const planType = pgEnum("plan_type", ['diamonds', 'verification', 'room_creation', 'premium_features'])
export const registrationStatus = pgEnum("registration_status", ['registered', 'cancelled', 'attended', 'no_show'])
export const restoreStatus = pgEnum("restore_status", ['pending', 'in_progress', 'completed', 'failed', 'cancelled'])
export const roomStatus = pgEnum("room_status", ['active', 'inactive', 'maintenance'])
export const roomType = pgEnum("room_type", ['public', 'private'])
export const roomUserRole = pgEnum("room_user_role", ['owner', 'manager', 'member', 'guest'])
export const roomUserStatus = pgEnum("room_user_status", ['active', 'muted', 'kicked', 'banned'])
export const schemaContentType = pgEnum("schema_content_type", ['game', 'blog_post', 'page', 'category', 'organization', 'global'])
export const schemaType = pgEnum("schema_type", ['VideoGame', 'Article', 'BlogPosting', 'Organization', 'WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'CollectionPage', 'BreadcrumbList', 'Review', 'Rating', 'Product', 'Person'])
export const sessionStatus = pgEnum("session_status", ['active', 'expired', 'revoked'])
export const signupProvider = pgEnum("signup_provider", ['email', 'google', 'facebook', 'github', 'discord', 'twitter', 'apple', 'microsoft', 'phone'])
export const sitemapType = pgEnum("sitemap_type", ['games', 'blog', 'pages', 'main'])
export const subscriptionStatus = pgEnum("subscription_status", ['active', 'cancelled', 'expired', 'pending', 'suspended'])
export const tokenType = pgEnum("token_type", ['password_reset', 'email_verification', 'admin_reset'])
export const transactionStatus = pgEnum("transaction_status", ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
export const userAccountType = pgEnum("user_account_type", ['local', 'google', 'facebook', 'github', 'discord', 'twitter', 'apple', 'microsoft', 'phone'])
export const userStatus = pgEnum("user_status", ['active', 'blocked'])
export const verificationRequestStatus = pgEnum("verification_request_status", ['pending', 'approved', 'rejected', 'under_review'])
export const verificationRequestType = pgEnum("verification_request_type", ['user', 'room'])
export const webmasterToolStatus = pgEnum("webmaster_tool_status", ['active', 'inactive'])
export const webmasterVerificationStatus = pgEnum("webmaster_verification_status", ['pending', 'verified', 'failed', 'not_verified'])


export const adminNotifications = pgTable("admin_notifications", {
	id: serial().primaryKey().notNull(),
	type: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	icon: text().default('ri-notification-line'),
	priority: text().default('medium').notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	actionUrl: text("action_url"),
	relatedEntityType: text("related_entity_type"),
	relatedEntityId: integer("related_entity_id"),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		adminNotificationsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admin_notifications_user_id_users_id_fk"
		}),
	}
});

export const backupConfigs = pgTable("backup_configs", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	backupType: backupType("backup_type").default('full').notNull(),
	storageLocation: backupStorage("storage_location").default('local').notNull(),
	cloudStoragePath: text("cloud_storage_path"),
	schedule: text(),
	isScheduleEnabled: boolean("is_schedule_enabled").default(false).notNull(),
	retentionDays: integer("retention_days").default(30).notNull(),
	maxBackups: integer("max_backups").default(10).notNull(),
	includeDatabaseStructure: boolean("include_database_structure").default(true).notNull(),
	includeDatabaseData: boolean("include_database_data").default(true).notNull(),
	includeUploads: boolean("include_uploads").default(true).notNull(),
	includeAssets: boolean("include_assets").default(true).notNull(),
	includeSettings: boolean("include_settings").default(true).notNull(),
	includeLogs: boolean("include_logs").default(false).notNull(),
	compressionEnabled: boolean("compression_enabled").default(true).notNull(),
	compressionLevel: integer("compression_level").default(6).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		backupConfigsCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "backup_configs_created_by_users_id_fk"
		}),
	}
});

export const analytics = pgTable("analytics", {
	id: serial().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	pageViews: integer("page_views").default(0).notNull(),
	uniqueVisitors: integer("unique_visitors").default(0).notNull(),
	gamePlayCount: integer("game_play_count").default(0).notNull(),
	averageSessionDuration: integer("average_session_duration").default(0).notNull(),
	topGames: json("top_games").default({}).notNull(),
	topPages: json("top_pages").default({}).notNull(),
});

export const apiKeys = pgTable("api_keys", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: apiKeyType().notNull(),
	key: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const backups = pgTable("backups", {
	id: serial().primaryKey().notNull(),
	configId: integer("config_id"),
	name: text().notNull(),
	description: text(),
	backupType: backupType("backup_type").notNull(),
	status: backupStatus().default('pending').notNull(),
	fileName: text("file_name"),
	filePath: text("file_path"),
	cloudStoragePath: text("cloud_storage_path"),
	fileSize: integer("file_size"),
	checksumMd5: text("checksum_md5"),
	checksumSha256: text("checksum_sha256"),
	databaseTableCount: integer("database_table_count"),
	totalRecords: integer("total_records"),
	fileCount: integer("file_count"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	warningMessage: text("warning_message"),
	metadata: json(),
	triggeredBy: text("triggered_by").default('manual').notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		backupsConfigIdBackupConfigsIdFk: foreignKey({
			columns: [table.configId],
			foreignColumns: [backupConfigs.id],
			name: "backups_config_id_backup_configs_id_fk"
		}).onDelete("set null"),
		backupsCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "backups_created_by_users_id_fk"
		}),
	}
});

export const backupLogs = pgTable("backup_logs", {
	id: serial().primaryKey().notNull(),
	backupId: integer("backup_id"),
	restoreId: integer("restore_id"),
	operationType: text("operation_type").default('backup').notNull(),
	level: text().default('info').notNull(),
	message: text().notNull(),
	data: json(),
	duration: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		backupLogsBackupIdBackupsIdFk: foreignKey({
			columns: [table.backupId],
			foreignColumns: [backups.id],
			name: "backup_logs_backup_id_backups_id_fk"
		}).onDelete("cascade"),
	}
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	action: text().notNull(),
	entityType: text("entity_type"),
	entityId: integer("entity_id"),
	description: text().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		adminActivityLogsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admin_activity_logs_user_id_users_id_fk"
		}),
	}
});

export const eventCategories = pgTable("event_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	color: text().default('#6366f1'),
	icon: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		eventCategoriesNameUnique: unique("event_categories_name_unique").on(table.name),
		eventCategoriesSlugUnique: unique("event_categories_slug_unique").on(table.slug),
	}
});

export const blogCategories = pgTable("blog_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		blogCategoriesNameUnique: unique("blog_categories_name_unique").on(table.name),
		blogCategoriesSlugUnique: unique("blog_categories_slug_unique").on(table.slug),
	}
});

export const gameCategories = pgTable("game_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	icon: text().default('ri-gamepad-line'),
	displayOrder: integer("display_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		gameCategoriesNameUnique: unique("game_categories_name_unique").on(table.name),
		gameCategoriesSlugUnique: unique("game_categories_slug_unique").on(table.slug),
	}
});

export const eventRegistrations = pgTable("event_registrations", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	userId: integer("user_id"),
	guestName: text("guest_name"),
	guestEmail: text("guest_email"),
	guestPhone: text("guest_phone"),
	status: registrationStatus().default('registered').notNull(),
	notes: text(),
	paymentStatus: text("payment_status").default('pending'),
	registeredAt: timestamp("registered_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		eventGuestEmailIdx: uniqueIndex("event_guest_email_idx").using("btree", table.eventId.asc().nullsLast(), table.guestEmail.asc().nullsLast()),
		eventUserIdx: uniqueIndex("event_user_idx").using("btree", table.eventId.asc().nullsLast(), table.userId.asc().nullsLast()),
		eventRegistrationsEventIdEventsIdFk: foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_registrations_event_id_events_id_fk"
		}).onDelete("cascade"),
		eventRegistrationsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "event_registrations_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const gameAds = pgTable("game_ads", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	position: gameAdPosition().notNull(),
	adCode: text("ad_code").notNull(),
	status: contentStatus().default('active').notNull(),
	imageUrl: text("image_url"),
	targetUrl: text("target_url"),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	isGoogleAd: boolean("is_google_ad").default(false).notNull(),
	adEnabled: boolean("ad_enabled").default(true).notNull(),
	clickCount: integer("click_count").default(0).notNull(),
	impressionCount: integer("impression_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const gifts = pgTable("gifts", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	type: giftType().notNull(),
	image: text().notNull(),
	animation: giftAnimation().default('default').notNull(),
	price: integer().notNull(),
	rarity: text().default('common').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	eventType: eventType("event_type").notNull(),
	status: eventStatus().default('draft').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	timezone: text().default('UTC').notNull(),
	locationType: eventLocationType("location_type").notNull(),
	locationName: text("location_name"),
	locationAddress: text("location_address"),
	onlineUrl: text("online_url"),
	registrationEnabled: boolean("registration_enabled").default(false).notNull(),
	registrationStartDate: timestamp("registration_start_date", { mode: 'string' }),
	registrationEndDate: timestamp("registration_end_date", { mode: 'string' }),
	maxParticipants: integer("max_participants"),
	currentParticipants: integer("current_participants").default(0).notNull(),
	registrationFee: integer("registration_fee").default(0).notNull(),
	bannerImage: text("banner_image"),
	gallery: json().default([]),
	rules: text(),
	prizes: text(),
	requirements: text(),
	contactInfo: text("contact_info"),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	featured: boolean().default(false).notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		eventsCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "events_created_by_users_id_fk"
		}),
		eventsSlugUnique: unique("events_slug_unique").on(table.slug),
	}
});

export const googleIndexingCredentials = pgTable("google_indexing_credentials", {
	id: serial().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	serviceAccountEmail: text("service_account_email").notNull(),
	privateKey: text("private_key").notNull(),
	clientEmail: text("client_email").notNull(),
	clientId: text("client_id").notNull(),
	authUri: text("auth_uri").notNull(),
	tokenUri: text("token_uri").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const heroImages = pgTable("hero_images", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	imagePath: text("image_path").notNull(),
	linkUrl: text("link_url"),
	linkText: text("link_text"),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	displayDuration: integer("display_duration").default(5000).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const homeAds = pgTable("home_ads", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	position: adPosition().notNull(),
	adCode: text("ad_code").notNull(),
	status: contentStatus().default('active').notNull(),
	imageUrl: text("image_url"),
	targetUrl: text("target_url"),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	isGoogleAd: boolean("is_google_ad").default(false).notNull(),
	adEnabled: boolean("ad_enabled").default(true).notNull(),
	clickCount: integer("click_count").default(0).notNull(),
	impressionCount: integer("impression_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const homepageContent = pgTable("homepage_content", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	position: integer().default(0).notNull(),
	status: contentStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const indexingLogs = pgTable("indexing_logs", {
	id: serial().primaryKey().notNull(),
	requestId: integer("request_id"),
	action: text().notNull(),
	status: indexingStatus().notNull(),
	message: text(),
	responseData: json("response_data"),
	quotaUsed: integer("quota_used").default(1).notNull(),
	duration: integer(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		indexingLogsRequestIdIndexingRequestsIdFk: foreignKey({
			columns: [table.requestId],
			foreignColumns: [indexingRequests.id],
			name: "indexing_logs_request_id_indexing_requests_id_fk"
		}).onDelete("cascade"),
	}
});

export const indexingSettings = pgTable("indexing_settings", {
	id: serial().primaryKey().notNull(),
	autoIndexing: boolean("auto_indexing").default(false).notNull(),
	batchSize: integer("batch_size").default(100).notNull(),
	dailyQuotaLimit: integer("daily_quota_limit").default(200).notNull(),
	quotaUsedToday: integer("quota_used_today").default(0).notNull(),
	lastQuotaReset: timestamp("last_quota_reset", { mode: 'string' }).defaultNow().notNull(),
	retryFailedAfterHours: integer("retry_failed_after_hours").default(24).notNull(),
	enableNotifications: boolean("enable_notifications").default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const paymentGateways = pgTable("payment_gateways", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	displayName: text("display_name").notNull(),
	gatewayType: paymentGatewayType("gateway_type").notNull(),
	methodType: paymentMethodType("method_type").notNull(),
	status: paymentStatus().default('disabled').notNull(),
	description: text(),
	logo: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isTestMode: boolean("is_test_mode").default(true).notNull(),
	supportedCurrencies: paymentCurrency("supported_currencies").array().notNull(),
	minimumAmount: integer("minimum_amount").default(100),
	maximumAmount: integer("maximum_amount"),
	processingFee: integer("processing_fee").default(0),
	apiConfiguration: json("api_configuration"),
	paymentInstructions: text("payment_instructions"),
	accountDetails: json("account_details"),
	createdBy: integer("created_by").notNull(),
	updatedBy: integer("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		paymentGatewaysCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "payment_gateways_created_by_users_id_fk"
		}),
		paymentGatewaysUpdatedByUsersIdFk: foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "payment_gateways_updated_by_users_id_fk"
		}),
		paymentGatewaysNameUnique: unique("payment_gateways_name_unique").on(table.name),
	}
});

export const paymentTransactions = pgTable("payment_transactions", {
	id: serial().primaryKey().notNull(),
	transactionId: text("transaction_id").notNull(),
	gatewayId: integer("gateway_id").notNull(),
	userId: integer("user_id").notNull(),
	amount: integer().notNull(),
	currency: paymentCurrency().notNull(),
	status: transactionStatus().default('pending').notNull(),
	gatewayTransactionId: text("gateway_transaction_id"),
	gatewayResponse: json("gateway_response"),
	failureReason: text("failure_reason"),
	refundedAmount: integer("refunded_amount").default(0),
	paymentProof: text("payment_proof"),
	verificationNotes: text("verification_notes"),
	verifiedBy: integer("verified_by"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		paymentTransactionsGatewayIdPaymentGatewaysIdFk: foreignKey({
			columns: [table.gatewayId],
			foreignColumns: [paymentGateways.id],
			name: "payment_transactions_gateway_id_payment_gateways_id_fk"
		}),
		paymentTransactionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payment_transactions_user_id_users_id_fk"
		}),
		paymentTransactionsVerifiedByUsersIdFk: foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "payment_transactions_verified_by_users_id_fk"
		}),
		paymentTransactionsTransactionIdUnique: unique("payment_transactions_transaction_id_unique").on(table.transactionId),
	}
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	tokenHash: text("token_hash").notNull(),
	type: tokenType().default('password_reset').notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	isAdmin: boolean("is_admin").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
}, (table) => {
	return {
		passwordResetTokensUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
		passwordResetTokensTokenUnique: unique("password_reset_tokens_token_unique").on(table.token),
	}
});

export const pushCampaigns = pgTable("push_campaigns", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	image: text(),
	link: text(),
	actionYes: text("action_yes"),
	actionNo: text("action_no"),
	notificationType: text("notification_type").default('toast').notNull(),
	isWebPush: boolean("is_web_push").default(false).notNull(),
	requireInteraction: boolean("require_interaction").default(false),
	badge: text(),
	icon: text(),
	vibrate: text(),
	isSurvey: boolean("is_survey").default(false),
	targetAll: boolean("target_all").default(true),
	targetFilters: json("target_filters").default({}),
	sentCount: integer("sent_count").default(0),
	deliveredCount: integer("delivered_count").default(0),
	clickCount: integer("click_count").default(0),
	scheduleDate: timestamp("schedule_date", { mode: 'string' }),
	status: text().default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const pushSubscribers = pgTable("push_subscribers", {
	id: serial().primaryKey().notNull(),
	endpoint: text().notNull(),
	p256Dh: text().notNull(),
	auth: text().notNull(),
	userAgent: text("user_agent"),
	browser: text(),
	os: text(),
	deviceType: text("device_type"),
	country: text(),
	region: text(),
	city: text(),
	lastSent: timestamp("last_sent", { mode: 'string' }),
	status: text().default('active').notNull(),
	webPushEnabled: boolean("web_push_enabled").default(true).notNull(),
	notificationPermission: text("notification_permission").default('default'),
	preferredTypes: text("preferred_types").array().default(["toast", "web-push"]),
	frequencyLimit: integer("frequency_limit").default(5),
	optInDate: timestamp("opt_in_date", { mode: 'string' }).defaultNow(),
	lastInteracted: timestamp("last_interacted", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		pushSubscribersEndpointUnique: unique("push_subscribers_endpoint_unique").on(table.endpoint),
	}
});

export const pushNotifications = pgTable("push_notifications", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	image: text(),
	link: text(),
	type: notificationType().default('toast').notNull(),
	active: boolean().default(false).notNull(),
	clickCount: integer("click_count").default(0).notNull(),
	impressionCount: integer("impression_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
	id: serial().primaryKey().notNull(),
	gameId: integer("game_id").notNull(),
	rating: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		ratingsGameIdGamesIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [games.id],
			name: "ratings_game_id_games_id_fk"
		}),
	}
});

export const restores = pgTable("restores", {
	id: serial().primaryKey().notNull(),
	backupId: integer("backup_id").notNull(),
	name: text().notNull(),
	description: text(),
	status: restoreStatus().default('pending').notNull(),
	restoreDatabase: boolean("restore_database").default(true).notNull(),
	restoreFiles: boolean("restore_files").default(true).notNull(),
	restoreSettings: boolean("restore_settings").default(true).notNull(),
	createBackupBeforeRestore: boolean("create_backup_before_restore").default(true).notNull(),
	preRestoreBackupId: integer("pre_restore_backup_id"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	totalSteps: integer("total_steps"),
	completedSteps: integer("completed_steps"),
	currentStep: text("current_step"),
	tablesRestored: integer("tables_restored"),
	recordsRestored: integer("records_restored"),
	filesRestored: integer("files_restored"),
	errorMessage: text("error_message"),
	warningMessage: text("warning_message"),
	metadata: json(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		restoresBackupIdBackupsIdFk: foreignKey({
			columns: [table.backupId],
			foreignColumns: [backups.id],
			name: "restores_backup_id_backups_id_fk"
		}),
		restoresPreRestoreBackupIdBackupsIdFk: foreignKey({
			columns: [table.preRestoreBackupId],
			foreignColumns: [backups.id],
			name: "restores_pre_restore_backup_id_backups_id_fk"
		}),
		restoresCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "restores_created_by_users_id_fk"
		}),
	}
});

export const rolePermissions = pgTable("role_permissions", {
	id: serial().primaryKey().notNull(),
	roleId: integer("role_id").notNull(),
	permissionId: integer("permission_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		rolePermissionIdx: uniqueIndex("role_permission_idx").using("btree", table.roleId.asc().nullsLast(), table.permissionId.asc().nullsLast()),
		rolePermissionsRoleIdRolesIdFk: foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_roles_id_fk"
		}).onDelete("cascade"),
		rolePermissionsPermissionIdPermissionsIdFk: foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_permissions_id_fk"
		}).onDelete("cascade"),
	}
});

export const permissions = pgTable("permissions", {
	id: serial().primaryKey().notNull(),
	resource: text().notNull(),
	action: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		resourceActionIdx: uniqueIndex("resource_action_idx").using("btree", table.resource.asc().nullsLast(), table.action.asc().nullsLast()),
	}
});

export const rooms = pgTable("rooms", {
	id: serial().primaryKey().notNull(),
	roomId: text("room_id").notNull(),
	name: text().notNull(),
	description: text(),
	type: roomType().default('public').notNull(),
	password: text(),
	maxSeats: integer("max_seats").default(8).notNull(),
	currentUsers: integer("current_users").default(0).notNull(),
	voiceChatEnabled: boolean("voice_chat_enabled").default(true).notNull(),
	textChatEnabled: boolean("text_chat_enabled").default(true).notNull(),
	giftsEnabled: boolean("gifts_enabled").default(true).notNull(),
	backgroundTheme: text("background_theme").default('default'),
	backgroundMusic: text("background_music"),
	musicEnabled: boolean("music_enabled").default(false).notNull(),
	bannerImage: text("banner_image"),
	tags: text().array().default([""]),
	category: text().default('general'),
	country: text(),
	language: text().default('en'),
	status: roomStatus().default('active').notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	ownerId: integer("owner_id").notNull(),
	totalVisits: integer("total_visits").default(0).notNull(),
	totalGiftsReceived: integer("total_gifts_received").default(0).notNull(),
	totalGiftValue: integer("total_gift_value").default(0).notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	verifiedBy: integer("verified_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		roomsOwnerIdUsersIdFk: foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "rooms_owner_id_users_id_fk"
		}).onDelete("cascade"),
		roomsVerifiedByUsersIdFk: foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "rooms_verified_by_users_id_fk"
		}),
		roomsRoomIdUnique: unique("rooms_room_id_unique").on(table.roomId),
	}
});

export const roomMessages = pgTable("room_messages", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id").notNull(),
	userId: integer("user_id").notNull(),
	message: text().notNull(),
	messageType: text("message_type").default('text').notNull(),
	isPrivate: boolean("is_private").default(false).notNull(),
	recipientId: integer("recipient_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		roomMessagesRoomIdRoomsIdFk: foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "room_messages_room_id_rooms_id_fk"
		}).onDelete("cascade"),
		roomMessagesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "room_messages_user_id_users_id_fk"
		}).onDelete("cascade"),
		roomMessagesRecipientIdUsersIdFk: foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.id],
			name: "room_messages_recipient_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const roomUsers = pgTable("room_users", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id").notNull(),
	userId: integer("user_id").notNull(),
	role: roomUserRole().default('member').notNull(),
	status: roomUserStatus().default('active').notNull(),
	seatNumber: integer("seat_number"),
	isMuted: boolean("is_muted").default(false).notNull(),
	isMicOn: boolean("is_mic_on").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	giftsReceived: integer("gifts_received").default(0).notNull(),
	giftsSent: integer("gifts_sent").default(0).notNull(),
	messagesCount: integer("messages_count").default(0).notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	lastSeen: timestamp("last_seen", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		roomUsersRoomIdRoomsIdFk: foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "room_users_room_id_rooms_id_fk"
		}).onDelete("cascade"),
		roomUsersUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "room_users_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const roomGifts = pgTable("room_gifts", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id").notNull(),
	senderId: integer("sender_id").notNull(),
	recipientId: integer("recipient_id"),
	giftId: integer("gift_id").notNull(),
	quantity: integer().default(1).notNull(),
	totalValue: integer("total_value").notNull(),
	message: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		roomGiftsRoomIdRoomsIdFk: foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "room_gifts_room_id_rooms_id_fk"
		}).onDelete("cascade"),
		roomGiftsSenderIdUsersIdFk: foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "room_gifts_sender_id_users_id_fk"
		}).onDelete("cascade"),
		roomGiftsRecipientIdUsersIdFk: foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.id],
			name: "room_gifts_recipient_id_users_id_fk"
		}).onDelete("cascade"),
		roomGiftsGiftIdGiftsIdFk: foreignKey({
			columns: [table.giftId],
			foreignColumns: [gifts.id],
			name: "room_gifts_gift_id_gifts_id_fk"
		}).onDelete("cascade"),
	}
});

export const seoSchemaTemplates = pgTable("seo_schema_templates", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	schemaType: schemaType("schema_type").notNull(),
	contentType: schemaContentType("content_type").notNull(),
	template: json().notNull(),
	description: text(),
	isDefault: boolean("is_default").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: integer("created_by").notNull(),
	updatedBy: integer("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		seoSchemaTemplatesCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "seo_schema_templates_created_by_users_id_fk"
		}),
		seoSchemaTemplatesUpdatedByUsersIdFk: foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "seo_schema_templates_updated_by_users_id_fk"
		}),
		seoSchemaTemplatesNameUnique: unique("seo_schema_templates_name_unique").on(table.name),
	}
});

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		rolesNameUnique: unique("roles_name_unique").on(table.name),
	}
});

export const seoSchemas = pgTable("seo_schemas", {
	id: serial().primaryKey().notNull(),
	schemaType: schemaType("schema_type").notNull(),
	contentType: schemaContentType("content_type").notNull(),
	contentId: integer("content_id"),
	name: text().notNull(),
	schemaData: json("schema_data").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isAutoGenerated: boolean("is_auto_generated").default(true).notNull(),
	lastValidated: timestamp("last_validated", { mode: 'string' }),
	validationErrors: json("validation_errors"),
	priority: integer().default(0).notNull(),
	createdBy: integer("created_by").notNull(),
	updatedBy: integer("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		seoSchemasCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "seo_schemas_created_by_users_id_fk"
		}),
		seoSchemasUpdatedByUsersIdFk: foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "seo_schemas_updated_by_users_id_fk"
		}),
	}
});

export const seoSchemaAnalytics = pgTable("seo_schema_analytics", {
	id: serial().primaryKey().notNull(),
	schemaId: integer("schema_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	impressions: integer().default(0).notNull(),
	clicks: integer().default(0).notNull(),
	avgPosition: integer("avg_position"),
	richSnippetAppearances: integer("rich_snippet_appearances").default(0).notNull(),
	validationStatus: text("validation_status").default('valid').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		seoSchemaAnalyticsSchemaIdSeoSchemasIdFk: foreignKey({
			columns: [table.schemaId],
			foreignColumns: [seoSchemas.id],
			name: "seo_schema_analytics_schema_id_seo_schemas_id_fk"
		}).onDelete("cascade"),
	}
});

export const signupOptions = pgTable("signup_options", {
	id: serial().primaryKey().notNull(),
	provider: signupProvider().notNull(),
	displayName: text("display_name").notNull(),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	icon: text().notNull(),
	color: text().notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	configuration: json(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		signupOptionsProviderUnique: unique("signup_options_provider_unique").on(table.provider),
	}
});

export const siteSettings = pgTable("site_settings", {
	id: serial().primaryKey().notNull(),
	siteTitle: text("site_title").notNull(),
	metaDescription: text("meta_description").notNull(),
	keywords: text().notNull(),
	siteLogo: text("site_logo"),
	siteFavicon: text("site_favicon"),
	useTextLogo: boolean("use_text_logo").default(true),
	textLogoColor: text("text_logo_color").default('#4f46e5'),
	currentTheme: text("current_theme").default('modern').notNull(),
	adsTxt: text("ads_txt"),
	footerCopyright: text("footer_copyright"),
	footerAppStoreLink: text("footer_app_store_link"),
	footerGooglePlayLink: text("footer_google_play_link"),
	footerAmazonLink: text("footer_amazon_link"),
	socialFacebook: text("social_facebook"),
	socialTwitter: text("social_twitter"),
	socialInstagram: text("social_instagram"),
	socialYoutube: text("social_youtube"),
	socialDiscord: text("social_discord"),
	socialWhatsapp: text("social_whatsapp"),
	socialTiktok: text("social_tiktok"),
	headerAds: text("header_ads"),
	footerAds: text("footer_ads"),
	sidebarAds: text("sidebar_ads"),
	contentAds: text("content_ads"),
	floatingHeaderAds: text("floating_header_ads"),
	floatingFooterAds: text("floating_footer_ads"),
	paragraph2Ad: text("paragraph2_ad"),
	paragraph4Ad: text("paragraph4_ad"),
	paragraph6Ad: text("paragraph6_ad"),
	paragraph8Ad: text("paragraph8_ad"),
	afterContentAd: text("after_content_ad"),
	enableGoogleAds: boolean("enable_google_ads").default(false),
	googleAdClient: text("google_ad_client"),
	pushNotificationsEnabled: boolean("push_notifications_enabled").default(true).notNull(),
	blogGamesEnabled: boolean("blog_games_enabled").default(true).notNull(),
	paragraph2GamesEnabled: boolean("paragraph2_games_enabled").default(true).notNull(),
	paragraph6GamesEnabled: boolean("paragraph6_games_enabled").default(true).notNull(),
	paragraph8GamesEnabled: boolean("paragraph8_games_enabled").default(true).notNull(),
	paragraph10GamesEnabled: boolean("paragraph10_games_enabled").default(true).notNull(),
	customHeaderCode: text("custom_header_code"),
	customBodyCode: text("custom_body_code"),
	customFooterCode: text("custom_footer_code"),
	robotsTxt: text("robots_txt"),
	cookiePopupEnabled: boolean("cookie_popup_enabled").default(true).notNull(),
	cookiePopupTitle: text("cookie_popup_title").default('We use cookies').notNull(),
	cookiePopupMessage: text("cookie_popup_message").default('We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.').notNull(),
	cookieAcceptButtonText: text("cookie_accept_button_text").default('Accept All').notNull(),
	cookieDeclineButtonText: text("cookie_decline_button_text").default('Decline').notNull(),
	cookieLearnMoreText: text("cookie_learn_more_text").default('Learn More').notNull(),
	cookieLearnMoreUrl: text("cookie_learn_more_url").default('/privacy').notNull(),
	cookiePopupPosition: text("cookie_popup_position").default('bottom').notNull(),
	cookiePopupTheme: text("cookie_popup_theme").default('dark').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const sitemaps = pgTable("sitemaps", {
	id: serial().primaryKey().notNull(),
	type: sitemapType().notNull(),
	lastGenerated: timestamp("last_generated", { mode: 'string' }).defaultNow().notNull(),
	url: text().notNull(),
	itemCount: integer("item_count").default(0).notNull(),
	content: text(),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const staticPages = pgTable("static_pages", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	content: text().notNull(),
	pageType: pageType("page_type").notNull(),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	status: contentStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		staticPagesSlugUnique: unique("static_pages_slug_unique").on(table.slug),
	}
});

export const teamMembers = pgTable("team_members", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	designation: text().notNull(),
	profilePicture: text("profile_picture"),
	bio: text(),
	socialLinkedin: text("social_linkedin"),
	socialTwitter: text("social_twitter"),
	socialGithub: text("social_github"),
	socialInstagram: text("social_instagram"),
	socialTiktok: text("social_tiktok"),
	socialFacebook: text("social_facebook"),
	socialYoutube: text("social_youtube"),
	displayOrder: integer("display_order").default(0).notNull(),
	status: contentStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const urlRedirects = pgTable("url_redirects", {
	id: serial().primaryKey().notNull(),
	sourceUrl: text("source_url").notNull(),
	targetUrl: text("target_url").notNull(),
	statusCode: integer("status_code").default(301).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	deviceInfo: json("device_info"),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	status: sessionStatus().default('active').notNull(),
	location: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		userSessionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const userRelationships = pgTable("user_relationships", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	targetUserId: integer("target_user_id").notNull(),
	relationshipType: text("relationship_type").notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		userRelationshipsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_relationships_user_id_users_id_fk"
		}).onDelete("cascade"),
		userRelationshipsTargetUserIdUsersIdFk: foreignKey({
			columns: [table.targetUserId],
			foreignColumns: [users.id],
			name: "user_relationships_target_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const userWallets = pgTable("user_wallets", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	coins: integer().default(0).notNull(),
	diamonds: integer().default(0).notNull(),
	totalCoinsEarned: integer("total_coins_earned").default(0).notNull(),
	totalDiamondsEarned: integer("total_diamonds_earned").default(0).notNull(),
	totalCoinsSpent: integer("total_coins_spent").default(0).notNull(),
	totalDiamondsSpent: integer("total_diamonds_spent").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		userWalletsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_wallets_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	email: text(),
	password: text(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	roleId: integer("role_id"),
	displayName: text("display_name"),
	profilePicture: text("profile_picture"),
	bio: text(),
	country: text(),
	accountType: userAccountType("account_type").default('local').notNull(),
	socialId: text("social_id"),
	status: userStatus().default('active').notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	location: json(),
	isVerified: boolean("is_verified").default(false).notNull(),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	verifiedBy: integer("verified_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		usersRoleIdRolesIdFk: foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "users_role_id_roles_id_fk"
		}).onDelete("set null"),
		usersVerifiedByUsersIdFk: foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [table.id],
			name: "users_verified_by_users_id_fk"
		}),
		usersUsernameUnique: unique("users_username_unique").on(table.username),
		usersEmailUnique: unique("users_email_unique").on(table.email),
	}
});

export const backupFiles = pgTable("backup_files", {
	id: serial().primaryKey().notNull(),
	backupId: integer("backup_id").notNull(),
	filePath: text("file_path").notNull(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	fileSize: integer("file_size"),
	checksumMd5: text("checksum_md5"),
	lastModified: timestamp("last_modified", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		backupFilesBackupIdBackupsIdFk: foreignKey({
			columns: [table.backupId],
			foreignColumns: [backups.id],
			name: "backup_files_backup_id_backups_id_fk"
		}).onDelete("cascade"),
	}
});

export const blogPosts = pgTable("blog_posts", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	content: text().notNull(),
	excerpt: text().notNull(),
	featuredImage: text("featured_image").notNull(),
	categoryId: integer("category_id"),
	tags: text().array(),
	status: blogStatus().default('draft').notNull(),
	author: text().notNull(),
	authorAvatar: text("author_avatar"),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		blogPostsCategoryIdBlogCategoriesIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [blogCategories.id],
			name: "blog_posts_category_id_blog_categories_id_fk"
		}),
		blogPostsSlugUnique: unique("blog_posts_slug_unique").on(table.slug),
	}
});

export const eventCategoryRelations = pgTable("event_category_relations", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	categoryId: integer("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		eventCategoryIdx: uniqueIndex("event_category_idx").using("btree", table.eventId.asc().nullsLast(), table.categoryId.asc().nullsLast()),
		eventCategoryRelationsEventIdEventsIdFk: foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_category_relations_event_id_events_id_fk"
		}).onDelete("cascade"),
		eventCategoryRelationsCategoryIdEventCategoriesIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [eventCategories.id],
			name: "event_category_relations_category_id_event_categories_id_fk"
		}).onDelete("cascade"),
	}
});

export const games = pgTable("games", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	thumbnail: text().notNull(),
	url: text(),
	apiId: text("api_id"),
	category: text().notNull(),
	categoryId: integer("category_id"),
	tags: text().array().notNull(),
	source: gameSource().notNull(),
	status: gameStatus().default('active').notNull(),
	plays: integer().default(0).notNull(),
	ratingSum: integer("rating_sum").default(0).notNull(),
	ratingCount: integer("rating_count").default(0).notNull(),
	fileType: gameFileType("file_type"),
	filePath: text("file_path"),
	fileSize: integer("file_size"),
	orientation: text().default('landscape'),
	instructions: text(),
	screenshot1: text(),
	screenshot2: text(),
	screenshot3: text(),
	screenshot4: text(),
	appStoreUrl: text("app_store_url"),
	playStoreUrl: text("play_store_url"),
	amazonAppStoreUrl: text("amazon_app_store_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		gamesCategoryIdGameCategoriesIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [gameCategories.id],
			name: "games_category_id_game_categories_id_fk"
		}),
		gamesSlugUnique: unique("games_slug_unique").on(table.slug),
	}
});

export const indexingRequests = pgTable("indexing_requests", {
	id: serial().primaryKey().notNull(),
	url: text().notNull(),
	contentType: indexingContentType("content_type").notNull(),
	contentId: integer("content_id").notNull(),
	status: indexingStatus().default('pending').notNull(),
	requestType: text("request_type").default('URL_UPDATED').notNull(),
	submitDate: timestamp("submit_date", { mode: 'string' }).defaultNow().notNull(),
	indexedDate: timestamp("indexed_date", { mode: 'string' }),
	responseData: json("response_data"),
	errorMessage: text("error_message"),
	retryCount: integer("retry_count").default(0).notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		indexingRequestsCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "indexing_requests_created_by_users_id_fk"
		}),
	}
});

export const pricingPlans = pgTable("pricing_plans", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	displayName: text("display_name").notNull(),
	planType: planType("plan_type").notNull(),
	duration: planDuration().notNull(),
	price: integer().notNull(),
	currency: paymentCurrency().default('USD').notNull(),
	originalPrice: integer("original_price"),
	diamondAmount: integer("diamond_amount"),
	verificationDuration: integer("verification_duration"),
	roomCreationLimit: integer("room_creation_limit"),
	isPopular: boolean("is_popular").default(false),
	status: planStatus().default('active').notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	features: json(),
	description: text(),
	shortDescription: text("short_description"),
	metadata: json(),
	createdBy: integer("created_by").notNull(),
	updatedBy: integer("updated_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		pricingPlansCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "pricing_plans_created_by_users_id_fk"
		}),
		pricingPlansUpdatedByUsersIdFk: foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "pricing_plans_updated_by_users_id_fk"
		}),
	}
});

export const pushResponses = pgTable("push_responses", {
	id: serial().primaryKey().notNull(),
	campaignId: integer("campaign_id").notNull(),
	subscriberId: integer("subscriber_id").notNull(),
	response: text(),
	clicked: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		pushResponsesCampaignIdPushCampaignsIdFk: foreignKey({
			columns: [table.campaignId],
			foreignColumns: [pushCampaigns.id],
			name: "push_responses_campaign_id_push_campaigns_id_fk"
		}),
		pushResponsesSubscriberIdPushSubscribersIdFk: foreignKey({
			columns: [table.subscriberId],
			foreignColumns: [pushSubscribers.id],
			name: "push_responses_subscriber_id_push_subscribers_id_fk"
		}),
	}
});

export const roomAnalytics = pgTable("room_analytics", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	uniqueVisitors: integer("unique_visitors").default(0).notNull(),
	totalMessages: integer("total_messages").default(0).notNull(),
	totalGifts: integer("total_gifts").default(0).notNull(),
	totalGiftValue: integer("total_gift_value").default(0).notNull(),
	averageStayDuration: integer("average_stay_duration").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		roomAnalyticsRoomIdRoomsIdFk: foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "room_analytics_room_id_rooms_id_fk"
		}).onDelete("cascade"),
	}
});

export const userSubscriptions = pgTable("user_subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	planId: integer("plan_id").notNull(),
	transactionId: integer("transaction_id"),
	status: subscriptionStatus().default('pending').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	autoRenew: boolean("auto_renew").default(false),
	diamondsReceived: integer("diamonds_received").default(0),
	diamondsUsed: integer("diamonds_used").default(0),
	roomsCreated: integer("rooms_created").default(0),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		userSubscriptionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_subscriptions_user_id_users_id_fk"
		}),
		userSubscriptionsPlanIdPricingPlansIdFk: foreignKey({
			columns: [table.planId],
			foreignColumns: [pricingPlans.id],
			name: "user_subscriptions_plan_id_pricing_plans_id_fk"
		}),
		userSubscriptionsTransactionIdPaymentTransactionsIdFk: foreignKey({
			columns: [table.transactionId],
			foreignColumns: [paymentTransactions.id],
			name: "user_subscriptions_transaction_id_payment_transactions_id_fk"
		}),
	}
});

export const verificationRequests = pgTable("verification_requests", {
	id: serial().primaryKey().notNull(),
	requestType: verificationRequestType("request_type").notNull(),
	status: verificationRequestStatus().default('pending').notNull(),
	userId: integer("user_id"),
	username: text(),
	roomId: integer("room_id"),
	roomIdText: text("room_id_text"),
	documents: json(),
	reason: text().notNull(),
	additionalInfo: text("additional_info"),
	pricingPlanId: integer("pricing_plan_id"),
	paymentTransactionId: integer("payment_transaction_id"),
	paymentStatus: text("payment_status").default('pending'),
	reviewedBy: integer("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	reviewNotes: text("review_notes"),
	adminFeedback: text("admin_feedback"),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		verificationRequestsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "verification_requests_user_id_users_id_fk"
		}),
		verificationRequestsRoomIdRoomsIdFk: foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "verification_requests_room_id_rooms_id_fk"
		}),
		verificationRequestsPricingPlanIdPricingPlansIdFk: foreignKey({
			columns: [table.pricingPlanId],
			foreignColumns: [pricingPlans.id],
			name: "verification_requests_pricing_plan_id_pricing_plans_id_fk"
		}),
		verificationRequestsPaymentTransactionIdPaymentTransactio: foreignKey({
			columns: [table.paymentTransactionId],
			foreignColumns: [paymentTransactions.id],
			name: "verification_requests_payment_transaction_id_payment_transactio"
		}),
		verificationRequestsReviewedByUsersIdFk: foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "verification_requests_reviewed_by_users_id_fk"
		}),
	}
});

export const websiteUpdates = pgTable("website_updates", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	version: text().notNull(),
	changeType: text("change_type").notNull(),
	priority: text().default('medium').notNull(),
	status: text().default('draft').notNull(),
	deploymentUrl: text("deployment_url"),
	githubCommitHash: text("github_commit_hash"),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
	deployedAt: timestamp("deployed_at", { mode: 'string' }),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		websiteUpdatesCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "website_updates_created_by_users_id_fk"
		}),
	}
});

export const websiteUpdateHistory = pgTable("website_update_history", {
	id: serial().primaryKey().notNull(),
	updateId: integer("update_id").notNull(),
	version: text().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	changeType: text("change_type").notNull(),
	priority: text().notNull(),
	status: text().notNull(),
	githubCommitHash: text("github_commit_hash"),
	deploymentUrl: text("deployment_url"),
	rollbackData: json("rollback_data"),
	isActive: boolean("is_active").default(false).notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		websiteUpdateHistoryUpdateIdWebsiteUpdatesIdFk: foreignKey({
			columns: [table.updateId],
			foreignColumns: [websiteUpdates.id],
			name: "website_update_history_update_id_website_updates_id_fk"
		}),
		websiteUpdateHistoryCreatedByUsersIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "website_update_history_created_by_users_id_fk"
		}),
	}
});

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => {
	return {
		idxSessionExpire: index("IDX_session_expire").using("btree", table.expire.asc().nullsLast()),
	}
});

export const webmasterTools = pgTable("webmaster_tools", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	displayName: text("display_name").notNull(),
	description: text(),
	verificationUrl: text("verification_url"),
	verificationCode: text("verification_code"),
	htmlTag: text("html_tag"),
	metaTag: text("meta_tag"),
	verificationFile: text("verification_file"),
	verificationFileName: text("verification_file_name"),
	status: webmasterToolStatus().default('active').notNull(),
	verificationStatus: webmasterVerificationStatus("verification_status").default('not_verified').notNull(),
	lastVerified: timestamp("last_verified", { mode: 'string' }),
	verificationError: text("verification_error"),
	priority: integer().default(0).notNull(),
	icon: text(),
	helpUrl: text("help_url"),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
