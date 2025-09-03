import { relations } from "drizzle-orm/relations";
import { users, adminNotifications, backupConfigs, backups, backupLogs, adminActivityLogs, events, eventRegistrations, indexingRequests, indexingLogs, paymentGateways, paymentTransactions, passwordResetTokens, games, ratings, restores, roles, rolePermissions, permissions, rooms, roomMessages, roomUsers, roomGifts, gifts, seoSchemaTemplates, seoSchemas, seoSchemaAnalytics, userSessions, userRelationships, userWallets, backupFiles, blogCategories, blogPosts, eventCategoryRelations, eventCategories, gameCategories, pricingPlans, pushCampaigns, pushResponses, pushSubscribers, roomAnalytics, userSubscriptions, verificationRequests, websiteUpdates, websiteUpdateHistory } from "./schema";

export const adminNotificationsRelations = relations(adminNotifications, ({one}) => ({
	user: one(users, {
		fields: [adminNotifications.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	adminNotifications: many(adminNotifications),
	backupConfigs: many(backupConfigs),
	backups: many(backups),
	adminActivityLogs: many(adminActivityLogs),
	eventRegistrations: many(eventRegistrations),
	events: many(events),
	paymentGateways_createdBy: many(paymentGateways, {
		relationName: "paymentGateways_createdBy_users_id"
	}),
	paymentGateways_updatedBy: many(paymentGateways, {
		relationName: "paymentGateways_updatedBy_users_id"
	}),
	paymentTransactions_userId: many(paymentTransactions, {
		relationName: "paymentTransactions_userId_users_id"
	}),
	paymentTransactions_verifiedBy: many(paymentTransactions, {
		relationName: "paymentTransactions_verifiedBy_users_id"
	}),
	passwordResetTokens: many(passwordResetTokens),
	restores: many(restores),
	rooms_ownerId: many(rooms, {
		relationName: "rooms_ownerId_users_id"
	}),
	rooms_verifiedBy: many(rooms, {
		relationName: "rooms_verifiedBy_users_id"
	}),
	roomMessages_userId: many(roomMessages, {
		relationName: "roomMessages_userId_users_id"
	}),
	roomMessages_recipientId: many(roomMessages, {
		relationName: "roomMessages_recipientId_users_id"
	}),
	roomUsers: many(roomUsers),
	roomGifts_senderId: many(roomGifts, {
		relationName: "roomGifts_senderId_users_id"
	}),
	roomGifts_recipientId: many(roomGifts, {
		relationName: "roomGifts_recipientId_users_id"
	}),
	seoSchemaTemplates_createdBy: many(seoSchemaTemplates, {
		relationName: "seoSchemaTemplates_createdBy_users_id"
	}),
	seoSchemaTemplates_updatedBy: many(seoSchemaTemplates, {
		relationName: "seoSchemaTemplates_updatedBy_users_id"
	}),
	seoSchemas_createdBy: many(seoSchemas, {
		relationName: "seoSchemas_createdBy_users_id"
	}),
	seoSchemas_updatedBy: many(seoSchemas, {
		relationName: "seoSchemas_updatedBy_users_id"
	}),
	userSessions: many(userSessions),
	userRelationships_userId: many(userRelationships, {
		relationName: "userRelationships_userId_users_id"
	}),
	userRelationships_targetUserId: many(userRelationships, {
		relationName: "userRelationships_targetUserId_users_id"
	}),
	userWallets: many(userWallets),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	user: one(users, {
		fields: [users.verifiedBy],
		references: [users.id],
		relationName: "users_verifiedBy_users_id"
	}),
	users: many(users, {
		relationName: "users_verifiedBy_users_id"
	}),
	indexingRequests: many(indexingRequests),
	pricingPlans_createdBy: many(pricingPlans, {
		relationName: "pricingPlans_createdBy_users_id"
	}),
	pricingPlans_updatedBy: many(pricingPlans, {
		relationName: "pricingPlans_updatedBy_users_id"
	}),
	userSubscriptions: many(userSubscriptions),
	verificationRequests_userId: many(verificationRequests, {
		relationName: "verificationRequests_userId_users_id"
	}),
	verificationRequests_reviewedBy: many(verificationRequests, {
		relationName: "verificationRequests_reviewedBy_users_id"
	}),
	websiteUpdates: many(websiteUpdates),
	websiteUpdateHistories: many(websiteUpdateHistory),
}));

export const backupConfigsRelations = relations(backupConfigs, ({one, many}) => ({
	user: one(users, {
		fields: [backupConfigs.createdBy],
		references: [users.id]
	}),
	backups: many(backups),
}));

export const backupsRelations = relations(backups, ({one, many}) => ({
	backupConfig: one(backupConfigs, {
		fields: [backups.configId],
		references: [backupConfigs.id]
	}),
	user: one(users, {
		fields: [backups.createdBy],
		references: [users.id]
	}),
	backupLogs: many(backupLogs),
	restores_backupId: many(restores, {
		relationName: "restores_backupId_backups_id"
	}),
	restores_preRestoreBackupId: many(restores, {
		relationName: "restores_preRestoreBackupId_backups_id"
	}),
	backupFiles: many(backupFiles),
}));

export const backupLogsRelations = relations(backupLogs, ({one}) => ({
	backup: one(backups, {
		fields: [backupLogs.backupId],
		references: [backups.id]
	}),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({one}) => ({
	user: one(users, {
		fields: [adminActivityLogs.userId],
		references: [users.id]
	}),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({one}) => ({
	event: one(events, {
		fields: [eventRegistrations.eventId],
		references: [events.id]
	}),
	user: one(users, {
		fields: [eventRegistrations.userId],
		references: [users.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventRegistrations: many(eventRegistrations),
	user: one(users, {
		fields: [events.createdBy],
		references: [users.id]
	}),
	eventCategoryRelations: many(eventCategoryRelations),
}));

export const indexingLogsRelations = relations(indexingLogs, ({one}) => ({
	indexingRequest: one(indexingRequests, {
		fields: [indexingLogs.requestId],
		references: [indexingRequests.id]
	}),
}));

export const indexingRequestsRelations = relations(indexingRequests, ({one, many}) => ({
	indexingLogs: many(indexingLogs),
	user: one(users, {
		fields: [indexingRequests.createdBy],
		references: [users.id]
	}),
}));

export const paymentGatewaysRelations = relations(paymentGateways, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [paymentGateways.createdBy],
		references: [users.id],
		relationName: "paymentGateways_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [paymentGateways.updatedBy],
		references: [users.id],
		relationName: "paymentGateways_updatedBy_users_id"
	}),
	paymentTransactions: many(paymentTransactions),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one, many}) => ({
	paymentGateway: one(paymentGateways, {
		fields: [paymentTransactions.gatewayId],
		references: [paymentGateways.id]
	}),
	user_userId: one(users, {
		fields: [paymentTransactions.userId],
		references: [users.id],
		relationName: "paymentTransactions_userId_users_id"
	}),
	user_verifiedBy: one(users, {
		fields: [paymentTransactions.verifiedBy],
		references: [users.id],
		relationName: "paymentTransactions_verifiedBy_users_id"
	}),
	userSubscriptions: many(userSubscriptions),
	verificationRequests: many(verificationRequests),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	game: one(games, {
		fields: [ratings.gameId],
		references: [games.id]
	}),
}));

export const gamesRelations = relations(games, ({one, many}) => ({
	ratings: many(ratings),
	gameCategory: one(gameCategories, {
		fields: [games.categoryId],
		references: [gameCategories.id]
	}),
}));

export const restoresRelations = relations(restores, ({one}) => ({
	backup_backupId: one(backups, {
		fields: [restores.backupId],
		references: [backups.id],
		relationName: "restores_backupId_backups_id"
	}),
	backup_preRestoreBackupId: one(backups, {
		fields: [restores.preRestoreBackupId],
		references: [backups.id],
		relationName: "restores_preRestoreBackupId_backups_id"
	}),
	user: one(users, {
		fields: [restores.createdBy],
		references: [users.id]
	}),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	users: many(users),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const roomsRelations = relations(rooms, ({one, many}) => ({
	user_ownerId: one(users, {
		fields: [rooms.ownerId],
		references: [users.id],
		relationName: "rooms_ownerId_users_id"
	}),
	user_verifiedBy: one(users, {
		fields: [rooms.verifiedBy],
		references: [users.id],
		relationName: "rooms_verifiedBy_users_id"
	}),
	roomMessages: many(roomMessages),
	roomUsers: many(roomUsers),
	roomGifts: many(roomGifts),
	roomAnalytics: many(roomAnalytics),
	verificationRequests: many(verificationRequests),
}));

export const roomMessagesRelations = relations(roomMessages, ({one}) => ({
	room: one(rooms, {
		fields: [roomMessages.roomId],
		references: [rooms.id]
	}),
	user_userId: one(users, {
		fields: [roomMessages.userId],
		references: [users.id],
		relationName: "roomMessages_userId_users_id"
	}),
	user_recipientId: one(users, {
		fields: [roomMessages.recipientId],
		references: [users.id],
		relationName: "roomMessages_recipientId_users_id"
	}),
}));

export const roomUsersRelations = relations(roomUsers, ({one}) => ({
	room: one(rooms, {
		fields: [roomUsers.roomId],
		references: [rooms.id]
	}),
	user: one(users, {
		fields: [roomUsers.userId],
		references: [users.id]
	}),
}));

export const roomGiftsRelations = relations(roomGifts, ({one}) => ({
	room: one(rooms, {
		fields: [roomGifts.roomId],
		references: [rooms.id]
	}),
	user_senderId: one(users, {
		fields: [roomGifts.senderId],
		references: [users.id],
		relationName: "roomGifts_senderId_users_id"
	}),
	user_recipientId: one(users, {
		fields: [roomGifts.recipientId],
		references: [users.id],
		relationName: "roomGifts_recipientId_users_id"
	}),
	gift: one(gifts, {
		fields: [roomGifts.giftId],
		references: [gifts.id]
	}),
}));

export const giftsRelations = relations(gifts, ({many}) => ({
	roomGifts: many(roomGifts),
}));

export const seoSchemaTemplatesRelations = relations(seoSchemaTemplates, ({one}) => ({
	user_createdBy: one(users, {
		fields: [seoSchemaTemplates.createdBy],
		references: [users.id],
		relationName: "seoSchemaTemplates_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [seoSchemaTemplates.updatedBy],
		references: [users.id],
		relationName: "seoSchemaTemplates_updatedBy_users_id"
	}),
}));

export const seoSchemasRelations = relations(seoSchemas, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [seoSchemas.createdBy],
		references: [users.id],
		relationName: "seoSchemas_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [seoSchemas.updatedBy],
		references: [users.id],
		relationName: "seoSchemas_updatedBy_users_id"
	}),
	seoSchemaAnalytics: many(seoSchemaAnalytics),
}));

export const seoSchemaAnalyticsRelations = relations(seoSchemaAnalytics, ({one}) => ({
	seoSchema: one(seoSchemas, {
		fields: [seoSchemaAnalytics.schemaId],
		references: [seoSchemas.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const userRelationshipsRelations = relations(userRelationships, ({one}) => ({
	user_userId: one(users, {
		fields: [userRelationships.userId],
		references: [users.id],
		relationName: "userRelationships_userId_users_id"
	}),
	user_targetUserId: one(users, {
		fields: [userRelationships.targetUserId],
		references: [users.id],
		relationName: "userRelationships_targetUserId_users_id"
	}),
}));

export const userWalletsRelations = relations(userWallets, ({one}) => ({
	user: one(users, {
		fields: [userWallets.userId],
		references: [users.id]
	}),
}));

export const backupFilesRelations = relations(backupFiles, ({one}) => ({
	backup: one(backups, {
		fields: [backupFiles.backupId],
		references: [backups.id]
	}),
}));

export const blogPostsRelations = relations(blogPosts, ({one}) => ({
	blogCategory: one(blogCategories, {
		fields: [blogPosts.categoryId],
		references: [blogCategories.id]
	}),
}));

export const blogCategoriesRelations = relations(blogCategories, ({many}) => ({
	blogPosts: many(blogPosts),
}));

export const eventCategoryRelationsRelations = relations(eventCategoryRelations, ({one}) => ({
	event: one(events, {
		fields: [eventCategoryRelations.eventId],
		references: [events.id]
	}),
	eventCategory: one(eventCategories, {
		fields: [eventCategoryRelations.categoryId],
		references: [eventCategories.id]
	}),
}));

export const eventCategoriesRelations = relations(eventCategories, ({many}) => ({
	eventCategoryRelations: many(eventCategoryRelations),
}));

export const gameCategoriesRelations = relations(gameCategories, ({many}) => ({
	games: many(games),
}));

export const pricingPlansRelations = relations(pricingPlans, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [pricingPlans.createdBy],
		references: [users.id],
		relationName: "pricingPlans_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [pricingPlans.updatedBy],
		references: [users.id],
		relationName: "pricingPlans_updatedBy_users_id"
	}),
	userSubscriptions: many(userSubscriptions),
	verificationRequests: many(verificationRequests),
}));

export const pushResponsesRelations = relations(pushResponses, ({one}) => ({
	pushCampaign: one(pushCampaigns, {
		fields: [pushResponses.campaignId],
		references: [pushCampaigns.id]
	}),
	pushSubscriber: one(pushSubscribers, {
		fields: [pushResponses.subscriberId],
		references: [pushSubscribers.id]
	}),
}));

export const pushCampaignsRelations = relations(pushCampaigns, ({many}) => ({
	pushResponses: many(pushResponses),
}));

export const pushSubscribersRelations = relations(pushSubscribers, ({many}) => ({
	pushResponses: many(pushResponses),
}));

export const roomAnalyticsRelations = relations(roomAnalytics, ({one}) => ({
	room: one(rooms, {
		fields: [roomAnalytics.roomId],
		references: [rooms.id]
	}),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [userSubscriptions.userId],
		references: [users.id]
	}),
	pricingPlan: one(pricingPlans, {
		fields: [userSubscriptions.planId],
		references: [pricingPlans.id]
	}),
	paymentTransaction: one(paymentTransactions, {
		fields: [userSubscriptions.transactionId],
		references: [paymentTransactions.id]
	}),
}));

export const verificationRequestsRelations = relations(verificationRequests, ({one}) => ({
	user_userId: one(users, {
		fields: [verificationRequests.userId],
		references: [users.id],
		relationName: "verificationRequests_userId_users_id"
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
	user_reviewedBy: one(users, {
		fields: [verificationRequests.reviewedBy],
		references: [users.id],
		relationName: "verificationRequests_reviewedBy_users_id"
	}),
}));

export const websiteUpdatesRelations = relations(websiteUpdates, ({one, many}) => ({
	user: one(users, {
		fields: [websiteUpdates.createdBy],
		references: [users.id]
	}),
	websiteUpdateHistories: many(websiteUpdateHistory),
}));

export const websiteUpdateHistoryRelations = relations(websiteUpdateHistory, ({one}) => ({
	websiteUpdate: one(websiteUpdates, {
		fields: [websiteUpdateHistory.updateId],
		references: [websiteUpdates.id]
	}),
	user: one(users, {
		fields: [websiteUpdateHistory.createdBy],
		references: [users.id]
	}),
}));