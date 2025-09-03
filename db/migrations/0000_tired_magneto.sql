-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."ad_position" AS ENUM('above_featured', 'below_featured', 'above_popular', 'below_popular', 'above_about', 'below_about');--> statement-breakpoint
CREATE TYPE "public"."api_key_type" AS ENUM('tinymce', 'game-monetize', 'analytics', 'sendgrid', 'custom');--> statement-breakpoint
CREATE TYPE "public"."backup_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."backup_storage" AS ENUM('local', 'cloud', 'both');--> statement-breakpoint
CREATE TYPE "public"."backup_type" AS ENUM('full', 'database_only', 'files_only', 'settings_only');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."event_location_type" AS ENUM('online', 'physical', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('tournament', 'game_release', 'community', 'maintenance', 'seasonal', 'streaming', 'meetup', 'competition', 'other');--> statement-breakpoint
CREATE TYPE "public"."game_ad_position" AS ENUM('above_game', 'below_game', 'above_related', 'below_related', 'sidebar_top', 'sidebar_bottom');--> statement-breakpoint
CREATE TYPE "public"."game_file_type" AS ENUM('html5', 'apk', 'ios', 'unity');--> statement-breakpoint
CREATE TYPE "public"."game_source" AS ENUM('api', 'custom');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('active', 'inactive', 'featured');--> statement-breakpoint
CREATE TYPE "public"."gift_animation" AS ENUM('default', 'sparkle', 'confetti', 'fireworks');--> statement-breakpoint
CREATE TYPE "public"."gift_type" AS ENUM('flower', 'car', 'diamond', 'crown', 'castle', 'ring', 'heart');--> statement-breakpoint
CREATE TYPE "public"."indexing_content_type" AS ENUM('game', 'blog_post', 'page', 'category');--> statement-breakpoint
CREATE TYPE "public"."indexing_status" AS ENUM('pending', 'submitted', 'indexed', 'failed', 'rate_limited');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('alert', 'banner', 'modal', 'slide-in', 'toast', 'web-push', 'survey');--> statement-breakpoint
CREATE TYPE "public"."page_type" AS ENUM('about', 'contact', 'privacy', 'terms', 'cookie-policy', 'faq', 'custom');--> statement-breakpoint
CREATE TYPE "public"."payment_currency" AS ENUM('USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway_type" AS ENUM('stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('automated', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('enabled', 'disabled', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."plan_duration" AS ENUM('one_time', 'monthly', '6_months', 'yearly', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('diamonds', 'verification', 'room_creation', 'premium_features');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('registered', 'cancelled', 'attended', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."restore_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('active', 'inactive', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."room_user_role" AS ENUM('owner', 'manager', 'member', 'guest');--> statement-breakpoint
CREATE TYPE "public"."room_user_status" AS ENUM('active', 'muted', 'kicked', 'banned');--> statement-breakpoint
CREATE TYPE "public"."schema_content_type" AS ENUM('game', 'blog_post', 'page', 'category', 'organization', 'global');--> statement-breakpoint
CREATE TYPE "public"."schema_type" AS ENUM('VideoGame', 'Article', 'BlogPosting', 'Organization', 'WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'CollectionPage', 'BreadcrumbList', 'Review', 'Rating', 'Product', 'Person');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."signup_provider" AS ENUM('email', 'google', 'facebook', 'github', 'discord', 'twitter', 'apple', 'microsoft', 'phone');--> statement-breakpoint
CREATE TYPE "public"."sitemap_type" AS ENUM('games', 'blog', 'pages', 'main');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired', 'pending', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('password_reset', 'email_verification', 'admin_reset');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_account_type" AS ENUM('local', 'google', 'facebook', 'github', 'discord', 'twitter', 'apple', 'microsoft', 'phone');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."verification_request_status" AS ENUM('pending', 'approved', 'rejected', 'under_review');--> statement-breakpoint
CREATE TYPE "public"."verification_request_type" AS ENUM('user', 'room');--> statement-breakpoint
CREATE TYPE "public"."webmaster_tool_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."webmaster_verification_status" AS ENUM('pending', 'verified', 'failed', 'not_verified');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"icon" text DEFAULT 'ri-notification-line',
	"priority" text DEFAULT 'medium' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"action_url" text,
	"related_entity_type" text,
	"related_entity_id" integer,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backup_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"backup_type" "backup_type" DEFAULT 'full' NOT NULL,
	"storage_location" "backup_storage" DEFAULT 'local' NOT NULL,
	"cloud_storage_path" text,
	"schedule" text,
	"is_schedule_enabled" boolean DEFAULT false NOT NULL,
	"retention_days" integer DEFAULT 30 NOT NULL,
	"max_backups" integer DEFAULT 10 NOT NULL,
	"include_database_structure" boolean DEFAULT true NOT NULL,
	"include_database_data" boolean DEFAULT true NOT NULL,
	"include_uploads" boolean DEFAULT true NOT NULL,
	"include_assets" boolean DEFAULT true NOT NULL,
	"include_settings" boolean DEFAULT true NOT NULL,
	"include_logs" boolean DEFAULT false NOT NULL,
	"compression_enabled" boolean DEFAULT true NOT NULL,
	"compression_level" integer DEFAULT 6 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"page_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"game_play_count" integer DEFAULT 0 NOT NULL,
	"average_session_duration" integer DEFAULT 0 NOT NULL,
	"top_games" json DEFAULT '{}'::json NOT NULL,
	"top_pages" json DEFAULT '{}'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "api_key_type" NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backups" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_id" integer,
	"name" text NOT NULL,
	"description" text,
	"backup_type" "backup_type" NOT NULL,
	"status" "backup_status" DEFAULT 'pending' NOT NULL,
	"file_name" text,
	"file_path" text,
	"cloud_storage_path" text,
	"file_size" integer,
	"checksum_md5" text,
	"checksum_sha256" text,
	"database_table_count" integer,
	"total_records" integer,
	"file_count" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"warning_message" text,
	"metadata" json,
	"triggered_by" text DEFAULT 'manual' NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backup_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"backup_id" integer,
	"restore_id" integer,
	"operation_type" text DEFAULT 'backup' NOT NULL,
	"level" text DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"data" json,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" integer,
	"description" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6366f1',
	"icon" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "event_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'ri-gamepad-line',
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "game_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer,
	"guest_name" text,
	"guest_email" text,
	"guest_phone" text,
	"status" "registration_status" DEFAULT 'registered' NOT NULL,
	"notes" text,
	"payment_status" text DEFAULT 'pending',
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" "game_ad_position" NOT NULL,
	"ad_code" text NOT NULL,
	"status" "content_status" DEFAULT 'active' NOT NULL,
	"image_url" text,
	"target_url" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_google_ad" boolean DEFAULT false NOT NULL,
	"ad_enabled" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "gift_type" NOT NULL,
	"image" text NOT NULL,
	"animation" "gift_animation" DEFAULT 'default' NOT NULL,
	"price" integer NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"event_type" "event_type" NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"location_type" "event_location_type" NOT NULL,
	"location_name" text,
	"location_address" text,
	"online_url" text,
	"registration_enabled" boolean DEFAULT false NOT NULL,
	"registration_start_date" timestamp,
	"registration_end_date" timestamp,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"registration_fee" integer DEFAULT 0 NOT NULL,
	"banner_image" text,
	"gallery" json DEFAULT '[]'::json,
	"rules" text,
	"prizes" text,
	"requirements" text,
	"contact_info" text,
	"meta_title" text,
	"meta_description" text,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "google_indexing_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"service_account_email" text NOT NULL,
	"private_key" text NOT NULL,
	"client_email" text NOT NULL,
	"client_id" text NOT NULL,
	"auth_uri" text NOT NULL,
	"token_uri" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hero_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_path" text NOT NULL,
	"link_url" text,
	"link_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"display_duration" integer DEFAULT 5000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "home_ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" "ad_position" NOT NULL,
	"ad_code" text NOT NULL,
	"status" "content_status" DEFAULT 'active' NOT NULL,
	"image_url" text,
	"target_url" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_google_ad" boolean DEFAULT false NOT NULL,
	"ad_enabled" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homepage_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indexing_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer,
	"action" text NOT NULL,
	"status" "indexing_status" NOT NULL,
	"message" text,
	"response_data" json,
	"quota_used" integer DEFAULT 1 NOT NULL,
	"duration" integer,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indexing_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"auto_indexing" boolean DEFAULT false NOT NULL,
	"batch_size" integer DEFAULT 100 NOT NULL,
	"daily_quota_limit" integer DEFAULT 200 NOT NULL,
	"quota_used_today" integer DEFAULT 0 NOT NULL,
	"last_quota_reset" timestamp DEFAULT now() NOT NULL,
	"retry_failed_after_hours" integer DEFAULT 24 NOT NULL,
	"enable_notifications" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_gateways" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"gateway_type" "payment_gateway_type" NOT NULL,
	"method_type" "payment_method_type" NOT NULL,
	"status" "payment_status" DEFAULT 'disabled' NOT NULL,
	"description" text,
	"logo" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_test_mode" boolean DEFAULT true NOT NULL,
	"supported_currencies" payment_currency[] NOT NULL,
	"minimum_amount" integer DEFAULT 100,
	"maximum_amount" integer,
	"processing_fee" integer DEFAULT 0,
	"api_configuration" json,
	"payment_instructions" text,
	"account_details" json,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_gateways_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"gateway_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" "payment_currency" NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"gateway_transaction_id" text,
	"gateway_response" json,
	"failure_reason" text,
	"refunded_amount" integer DEFAULT 0,
	"payment_proof" text,
	"verification_notes" text,
	"verified_by" integer,
	"verified_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"token_hash" text NOT NULL,
	"type" "token_type" DEFAULT 'password_reset' NOT NULL,
	"used_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"image" text,
	"link" text,
	"action_yes" text,
	"action_no" text,
	"notification_type" text DEFAULT 'toast' NOT NULL,
	"is_web_push" boolean DEFAULT false NOT NULL,
	"require_interaction" boolean DEFAULT false,
	"badge" text,
	"icon" text,
	"vibrate" text,
	"is_survey" boolean DEFAULT false,
	"target_all" boolean DEFAULT true,
	"target_filters" json DEFAULT '{}'::json,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"schedule_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"browser" text,
	"os" text,
	"device_type" text,
	"country" text,
	"region" text,
	"city" text,
	"last_sent" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"web_push_enabled" boolean DEFAULT true NOT NULL,
	"notification_permission" text DEFAULT 'default',
	"preferred_types" text[] DEFAULT '{"toast","web-push"}',
	"frequency_limit" integer DEFAULT 5,
	"opt_in_date" timestamp DEFAULT now(),
	"last_interacted" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscribers_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"image" text,
	"link" text,
	"type" "notification_type" DEFAULT 'toast' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restores" (
	"id" serial PRIMARY KEY NOT NULL,
	"backup_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "restore_status" DEFAULT 'pending' NOT NULL,
	"restore_database" boolean DEFAULT true NOT NULL,
	"restore_files" boolean DEFAULT true NOT NULL,
	"restore_settings" boolean DEFAULT true NOT NULL,
	"create_backup_before_restore" boolean DEFAULT true NOT NULL,
	"pre_restore_backup_id" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"total_steps" integer,
	"completed_steps" integer,
	"current_step" text,
	"tables_restored" integer,
	"records_restored" integer,
	"files_restored" integer,
	"error_message" text,
	"warning_message" text,
	"metadata" json,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "room_type" DEFAULT 'public' NOT NULL,
	"password" text,
	"max_seats" integer DEFAULT 8 NOT NULL,
	"current_users" integer DEFAULT 0 NOT NULL,
	"voice_chat_enabled" boolean DEFAULT true NOT NULL,
	"text_chat_enabled" boolean DEFAULT true NOT NULL,
	"gifts_enabled" boolean DEFAULT true NOT NULL,
	"background_theme" text DEFAULT 'default',
	"background_music" text,
	"music_enabled" boolean DEFAULT false NOT NULL,
	"banner_image" text,
	"tags" text[] DEFAULT '{""}',
	"category" text DEFAULT 'general',
	"country" text,
	"language" text DEFAULT 'en',
	"status" "room_status" DEFAULT 'active' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"owner_id" integer NOT NULL,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"total_gifts_received" integer DEFAULT 0 NOT NULL,
	"total_gift_value" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"recipient_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "room_user_role" DEFAULT 'member' NOT NULL,
	"status" "room_user_status" DEFAULT 'active' NOT NULL,
	"seat_number" integer,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_mic_on" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"gifts_received" integer DEFAULT 0 NOT NULL,
	"gifts_sent" integer DEFAULT 0 NOT NULL,
	"messages_count" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_gifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer,
	"gift_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_value" integer NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seo_schema_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"schema_type" "schema_type" NOT NULL,
	"content_type" "schema_content_type" NOT NULL,
	"template" json NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seo_schema_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seo_schemas" (
	"id" serial PRIMARY KEY NOT NULL,
	"schema_type" "schema_type" NOT NULL,
	"content_type" "schema_content_type" NOT NULL,
	"content_id" integer,
	"name" text NOT NULL,
	"schema_data" json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_auto_generated" boolean DEFAULT true NOT NULL,
	"last_validated" timestamp,
	"validation_errors" json,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seo_schema_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"schema_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"avg_position" integer,
	"rich_snippet_appearances" integer DEFAULT 0 NOT NULL,
	"validation_status" text DEFAULT 'valid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signup_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "signup_provider" NOT NULL,
	"display_name" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"configuration" json,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "signup_options_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"keywords" text NOT NULL,
	"site_logo" text,
	"site_favicon" text,
	"use_text_logo" boolean DEFAULT true,
	"text_logo_color" text DEFAULT '#4f46e5',
	"current_theme" text DEFAULT 'modern' NOT NULL,
	"ads_txt" text,
	"footer_copyright" text,
	"footer_app_store_link" text,
	"footer_google_play_link" text,
	"footer_amazon_link" text,
	"social_facebook" text,
	"social_twitter" text,
	"social_instagram" text,
	"social_youtube" text,
	"social_discord" text,
	"social_whatsapp" text,
	"social_tiktok" text,
	"header_ads" text,
	"footer_ads" text,
	"sidebar_ads" text,
	"content_ads" text,
	"floating_header_ads" text,
	"floating_footer_ads" text,
	"paragraph2_ad" text,
	"paragraph4_ad" text,
	"paragraph6_ad" text,
	"paragraph8_ad" text,
	"after_content_ad" text,
	"enable_google_ads" boolean DEFAULT false,
	"google_ad_client" text,
	"push_notifications_enabled" boolean DEFAULT true NOT NULL,
	"blog_games_enabled" boolean DEFAULT true NOT NULL,
	"paragraph2_games_enabled" boolean DEFAULT true NOT NULL,
	"paragraph6_games_enabled" boolean DEFAULT true NOT NULL,
	"paragraph8_games_enabled" boolean DEFAULT true NOT NULL,
	"paragraph10_games_enabled" boolean DEFAULT true NOT NULL,
	"custom_header_code" text,
	"custom_body_code" text,
	"custom_footer_code" text,
	"robots_txt" text,
	"cookie_popup_enabled" boolean DEFAULT true NOT NULL,
	"cookie_popup_title" text DEFAULT 'We use cookies' NOT NULL,
	"cookie_popup_message" text DEFAULT 'We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.' NOT NULL,
	"cookie_accept_button_text" text DEFAULT 'Accept All' NOT NULL,
	"cookie_decline_button_text" text DEFAULT 'Decline' NOT NULL,
	"cookie_learn_more_text" text DEFAULT 'Learn More' NOT NULL,
	"cookie_learn_more_url" text DEFAULT '/privacy' NOT NULL,
	"cookie_popup_position" text DEFAULT 'bottom' NOT NULL,
	"cookie_popup_theme" text DEFAULT 'dark' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sitemaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "sitemap_type" NOT NULL,
	"last_generated" timestamp DEFAULT now() NOT NULL,
	"url" text NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"content" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "static_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"page_type" "page_type" NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"status" "content_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "static_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"designation" text NOT NULL,
	"profile_picture" text,
	"bio" text,
	"social_linkedin" text,
	"social_twitter" text,
	"social_github" text,
	"social_instagram" text,
	"social_tiktok" text,
	"social_facebook" text,
	"social_youtube" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "url_redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_url" text NOT NULL,
	"target_url" text NOT NULL,
	"status_code" integer DEFAULT 301 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"device_info" json,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"location" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"target_user_id" integer NOT NULL,
	"relationship_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"diamonds" integer DEFAULT 0 NOT NULL,
	"total_coins_earned" integer DEFAULT 0 NOT NULL,
	"total_diamonds_earned" integer DEFAULT 0 NOT NULL,
	"total_coins_spent" integer DEFAULT 0 NOT NULL,
	"total_diamonds_spent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"role_id" integer,
	"display_name" text,
	"profile_picture" text,
	"bio" text,
	"country" text,
	"account_type" "user_account_type" DEFAULT 'local' NOT NULL,
	"social_id" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login" timestamp,
	"location" json,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backup_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"backup_id" integer NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"checksum_md5" text,
	"last_modified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text NOT NULL,
	"featured_image" text NOT NULL,
	"category_id" integer,
	"tags" text[],
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"author" text NOT NULL,
	"author_avatar" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_category_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail" text NOT NULL,
	"url" text,
	"api_id" text,
	"category" text NOT NULL,
	"category_id" integer,
	"tags" text[] NOT NULL,
	"source" "game_source" NOT NULL,
	"status" "game_status" DEFAULT 'active' NOT NULL,
	"plays" integer DEFAULT 0 NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"file_type" "game_file_type",
	"file_path" text,
	"file_size" integer,
	"orientation" text DEFAULT 'landscape',
	"instructions" text,
	"screenshot1" text,
	"screenshot2" text,
	"screenshot3" text,
	"screenshot4" text,
	"app_store_url" text,
	"play_store_url" text,
	"amazon_app_store_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indexing_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"content_type" "indexing_content_type" NOT NULL,
	"content_id" integer NOT NULL,
	"status" "indexing_status" DEFAULT 'pending' NOT NULL,
	"request_type" text DEFAULT 'URL_UPDATED' NOT NULL,
	"submit_date" timestamp DEFAULT now() NOT NULL,
	"indexed_date" timestamp,
	"response_data" json,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pricing_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"duration" "plan_duration" NOT NULL,
	"price" integer NOT NULL,
	"currency" "payment_currency" DEFAULT 'USD' NOT NULL,
	"original_price" integer,
	"diamond_amount" integer,
	"verification_duration" integer,
	"room_creation_limit" integer,
	"is_popular" boolean DEFAULT false,
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"features" json,
	"description" text,
	"short_description" text,
	"metadata" json,
	"created_by" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"subscriber_id" integer NOT NULL,
	"response" text,
	"clicked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"total_gifts" integer DEFAULT 0 NOT NULL,
	"total_gift_value" integer DEFAULT 0 NOT NULL,
	"average_stay_duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"transaction_id" integer,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"auto_renew" boolean DEFAULT false,
	"diamonds_received" integer DEFAULT 0,
	"diamonds_used" integer DEFAULT 0,
	"rooms_created" integer DEFAULT 0,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_type" "verification_request_type" NOT NULL,
	"status" "verification_request_status" DEFAULT 'pending' NOT NULL,
	"user_id" integer,
	"username" text,
	"room_id" integer,
	"room_id_text" text,
	"documents" json,
	"reason" text NOT NULL,
	"additional_info" text,
	"pricing_plan_id" integer,
	"payment_transaction_id" integer,
	"payment_status" text DEFAULT 'pending',
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"review_notes" text,
	"admin_feedback" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"version" text NOT NULL,
	"change_type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"deployment_url" text,
	"github_commit_hash" text,
	"scheduled_at" timestamp,
	"deployed_at" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_update_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"update_id" integer NOT NULL,
	"version" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"change_type" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"github_commit_hash" text,
	"deployment_url" text,
	"rollback_data" json,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webmaster_tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"verification_url" text,
	"verification_code" text,
	"html_tag" text,
	"meta_tag" text,
	"verification_file" text,
	"verification_file_name" text,
	"status" "webmaster_tool_status" DEFAULT 'active' NOT NULL,
	"verification_status" "webmaster_verification_status" DEFAULT 'not_verified' NOT NULL,
	"last_verified" timestamp,
	"verification_error" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"icon" text,
	"help_url" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backup_configs" ADD CONSTRAINT "backup_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backups" ADD CONSTRAINT "backups_config_id_backup_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."backup_configs"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backups" ADD CONSTRAINT "backups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backup_logs" ADD CONSTRAINT "backup_logs_backup_id_backups_id_fk" FOREIGN KEY ("backup_id") REFERENCES "public"."backups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "indexing_logs" ADD CONSTRAINT "indexing_logs_request_id_indexing_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."indexing_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_gateways" ADD CONSTRAINT "payment_gateways_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_gateways" ADD CONSTRAINT "payment_gateways_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_gateway_id_payment_gateways_id_fk" FOREIGN KEY ("gateway_id") REFERENCES "public"."payment_gateways"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restores" ADD CONSTRAINT "restores_backup_id_backups_id_fk" FOREIGN KEY ("backup_id") REFERENCES "public"."backups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restores" ADD CONSTRAINT "restores_pre_restore_backup_id_backups_id_fk" FOREIGN KEY ("pre_restore_backup_id") REFERENCES "public"."backups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restores" ADD CONSTRAINT "restores_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rooms" ADD CONSTRAINT "rooms_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_users" ADD CONSTRAINT "room_users_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_users" ADD CONSTRAINT "room_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_gifts" ADD CONSTRAINT "room_gifts_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_gifts" ADD CONSTRAINT "room_gifts_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_gifts" ADD CONSTRAINT "room_gifts_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_gifts" ADD CONSTRAINT "room_gifts_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seo_schema_templates" ADD CONSTRAINT "seo_schema_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seo_schema_templates" ADD CONSTRAINT "seo_schema_templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seo_schemas" ADD CONSTRAINT "seo_schemas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seo_schemas" ADD CONSTRAINT "seo_schemas_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seo_schema_analytics" ADD CONSTRAINT "seo_schema_analytics_schema_id_seo_schemas_id_fk" FOREIGN KEY ("schema_id") REFERENCES "public"."seo_schemas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backup_files" ADD CONSTRAINT "backup_files_backup_id_backups_id_fk" FOREIGN KEY ("backup_id") REFERENCES "public"."backups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_category_relations" ADD CONSTRAINT "event_category_relations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_category_relations" ADD CONSTRAINT "event_category_relations_category_id_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD CONSTRAINT "games_category_id_game_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."game_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "indexing_requests" ADD CONSTRAINT "indexing_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_responses" ADD CONSTRAINT "push_responses_campaign_id_push_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."push_campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_responses" ADD CONSTRAINT "push_responses_subscriber_id_push_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."push_subscribers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_analytics" ADD CONSTRAINT "room_analytics_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_pricing_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."pricing_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_pricing_plan_id_pricing_plans_id_fk" FOREIGN KEY ("pricing_plan_id") REFERENCES "public"."pricing_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_payment_transaction_id_payment_transactio" FOREIGN KEY ("payment_transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_updates" ADD CONSTRAINT "website_updates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_update_history" ADD CONSTRAINT "website_update_history_update_id_website_updates_id_fk" FOREIGN KEY ("update_id") REFERENCES "public"."website_updates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_update_history" ADD CONSTRAINT "website_update_history_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "event_guest_email_idx" ON "event_registrations" USING btree ("event_id","guest_email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "event_user_idx" ON "event_registrations" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_permission_idx" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "resource_action_idx" ON "permissions" USING btree ("resource","action");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "event_category_idx" ON "event_category_relations" USING btree ("event_id","category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" USING btree ("expire");
*/