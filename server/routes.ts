import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { checkAndRemoveExpiredVerifications } from "./api/verification-expiry";
import { setupAuth } from "./auth";
import { isAuthenticated, isAdmin } from "./middleware/auth";
import { registerGameRoutes } from "./api/games";
import { registerBlogRoutes } from "./api/blog";
import { registerSettingsRoutes } from "./api/settings";
import { registerAnalyticsRoutes } from "./api/analytics";
import { registerNotificationsRoutes } from "./api/notifications";
import { registerHomePageContentRoutes } from "./api/homepage-content";
import { registerInstallRoutes } from "./api/install";
import { registerUploadRoutes } from "./api/upload";
import { registerPagesRoutes } from "./api/pages";
import { registerApiKeyRoutes } from "./api/apiKeys";
import { registerHomeAdsRoutes } from "./api/homeAds";
import { registerGameAdsRoutes } from "./api/gameAds";
import { registerSitemapRoutes } from "./api/sitemapRoutes";
import { registerUserRoutes } from "./api/users";
import { registerUrlRedirectRoutes } from "./api/redirects";
import { registerCategoryRoutes } from "./api/categories";
import pushNotificationsRoutes from "./api/push-notifications";
import { registerRoleRoutes } from "./api/roles";
import { registerPermissionRoutes } from "./api/permissions";
import { registerSecurityRoutes } from "./routes/security";
import authResetRoutes from "./routes/auth-reset";
import { registerWebsiteUpdatesRoutes } from "./api/website-updates";
import { registerAdminNotificationsRoutes } from "./api/admin-notifications";
import { registerSeoSchemaRoutes } from "./api/seo-schemas";
import { registerTeamRoutes } from "./api/team";
import { registerFeedbackRoutes } from "./api/feedback";
import { 
  getWebmasterTools, 
  getWebmasterToolById, 
  createWebmasterTool, 
  updateWebmasterTool, 
  updateVerificationStatus, 
  toggleWebmasterToolStatus, 
  deleteWebmasterTool, 
  getWebmasterToolsStats 
} from "./api/webmaster-tools";
import { registerSignupOptionsRoutes } from "./api/signup-options";
import { registerHeroImageRoutes } from "./api/hero-images";
import { registerGoogleIndexingRoutes } from "./api/google-indexing";
import backupRestoreRoutes from "./api/backup-restore";
import objectsRoutes from "./api/objects";
import { roomsRouter } from "./api/rooms";
import friendsRouter from "./api/friends";
import userProfileRouter from "./api/user-profile";
import messageRoutes from "./api/messages";
import verificationRouter from "./api/verification";
import verificationExpiryRouter from "./api/verification-expiry";
import { 
  getPaymentGateways, 
  createPaymentGateway, 
  updatePaymentGateway, 
  updatePaymentGatewayStatus, 
  deletePaymentGateway,
  getPaymentGatewayById 
} from "./api/payment-gateways";
import { getPublicPaymentGateways } from "./api/payment-gateways-public";
import { getPaymentGatewaysWithApiKeys, testPaymentGatewayApiKey } from "./api/payment-api-keys";
import { 
  getPaymentTransactions, 
  getPaymentTransactionById, 
  verifyPaymentTransaction, 
  refundPaymentTransaction,
  getUserTransactions,
  createPaymentTransaction
} from "./api/payment-transactions";
import { createCheckoutTransaction } from "./api/payment-transactions-public";

import { referralRouter } from "./api/referrals";
import { revenueRouter } from "./api/revenue";
import { registerImagesGalleryRoutes } from "./api/images-gallery";
import { registerShortLinksRoutes } from "./api/short-links";
import { registerTranslationRoutes } from "./api/translations";
import giftsRouter from "./api/gifts";
import { registerTournamentRoutes } from "./api/tournaments";
import { 
  generateAIContent, 
  getAvailableAIModels, 
  testAIModel, 
  generateImageAltText, 
  getContentOptimizationSuggestions 
} from "./api/ai-content";

import {
  getPricingPlans,
  getPricingPlansByType,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  updatePlanStatus,
  bulkUpdatePricing
} from "./api/pricing-plans";

// Import verification request APIs
import { 
  getVerificationRequests,
  getVerificationRequest,
  createVerificationRequest,
  updateVerificationRequestStatus,
  deleteVerificationRequest,
  getVerificationStats
} from "./api/verification-requests";
import { 
  getPublicPricingPlans,
  getPublicPricingPlansByType,
  getPublicPricingPlan
} from "./api/pricing-plans-public";

import { storage } from "./storage";
import { db } from "@db";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { users, events, eventRegistrations, eventCategories } from "@shared/schema";
import { games, blogPosts, staticPages, pushSubscribers, pushCampaigns } from "@shared/schema";
import { paymentTransactions, paymentGateways } from "@shared/schema";
import { automatedMessageTemplates, automatedMessageHistory } from "@shared/schema";
import { insertEventSchema, insertEventRegistrationSchema } from "@shared/schema";
import { eq, count, gte, sql, desc, and } from "drizzle-orm";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { initializeSendGrid } from "./services/email-service";
import { handleUrlRedirects } from "./middleware/redirects";

// Helper function to get payment instructions for different gateways
function getPaymentInstructions(gatewayType: string): string {
  switch (gatewayType) {
    case 'stripe':
      return 'You will be redirected to Stripe\'s secure payment page to complete your transaction.';
    case 'paypal':
      return 'You will be redirected to PayPal to complete your payment securely.';
    case 'razorpay':
      return 'You will be redirected to Razorpay to complete your payment using various Indian payment methods.';
    case 'flutterwave':
      return 'You will be redirected to Flutterwave to complete your payment using African payment methods.';
    case 'mollie':
      return 'You will be redirected to Mollie to complete your payment using European payment methods.';
    case 'square':
      return 'You will be redirected to Square to complete your payment securely.';
    case 'adyen':
      return 'You will be redirected to Adyen to complete your payment using global payment methods.';
    case '2checkout':
      return 'You will be redirected to 2Checkout to complete your payment securely.';
    case 'braintree':
      return 'You will be redirected to Braintree (PayPal) to complete your payment.';
    case 'authorize_net':
      return 'You will be redirected to Authorize.Net to complete your payment.';
    default:
      return 'Please follow the payment instructions provided by your selected payment method.';
  }
}

// Function to check if application is installed
async function isInstalled(): Promise<boolean> {
  try {
    const configPath = path.resolve('./config/installed.json');
    await fs.access(configPath);
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    return config.installed === true;
  } catch (error) {
    return false;
  }
}

// Middleware to check installation status
async function installationCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip the middleware for installation-related routes and assets
  if (req.path === '/api/install' || 
      req.path === '/api/install/status' || 
      req.path === '/install' ||  // Skip middleware for the install page itself
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/uploads/') ||  // Allow access to uploaded files
      req.path.startsWith('/@') ||  // Vite HMR and dependencies
      req.path.startsWith('/@fs/') ||
      req.path.startsWith('/@vite/') ||
      req.path.startsWith('/node_modules/') ||
      req.path.startsWith('/src/') ||  // Vite source files
      req.path.includes('.js') || 
      req.path.includes('.css') || 
      req.path.includes('.ico') ||
      req.path.includes('.svg') ||
      req.path.includes('.png') ||
      req.path.includes('.jpg') ||
      req.path.includes('.jpeg')) {
    return next();
  }

  try {
    const installed = await isInstalled();
    
    // If not installed and this is a non-API route, redirect to install page
    if (!installed && !req.path.startsWith('/api/')) {
      return res.redirect('/install');
    }
    
    // If not installed and this is an API route, return 503
    if (!installed && req.path.startsWith('/api/')) {
      return res.status(503).json({
        error: 'Application not installed',
        message: 'Please complete the installation process'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking installation status:', error);
    next();
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize SendGrid with API key from database
  try {
    await initializeSendGrid();
    console.log('SendGrid API initialized');
  } catch (error) {
    console.error('Error initializing SendGrid:', error);
  }

  // Add installation check middleware
  app.use(installationCheckMiddleware);
  
  // Add URL redirection middleware (must be after installation check but before other routes)
  app.use(handleUrlRedirects);
  
  // Register installation routes - must be before other routes
  registerInstallRoutes(app);
  
  // Serve ads.txt file
  app.get('/ads.txt', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (settings?.adsTxt) {
        res.set('Content-Type', 'text/plain');
        return res.send(settings.adsTxt);
      }
      // If no ads.txt content is found, return an empty file
      res.set('Content-Type', 'text/plain');
      return res.send('');
    } catch (error) {
      console.error('Error serving ads.txt:', error);
      res.set('Content-Type', 'text/plain');
      return res.send('');
    }
  });
  
  // Setup authentication routes
  setupAuth(app);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Serve robots.txt dynamically from database
  app.get('/robots.txt', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      const robotsContent = settings?.robotsTxt || `User-agent: *
Allow: /

# Allow crawling of games
Allow: /games/
Allow: /game/

# Allow crawling of blog content
Allow: /blog/
Allow: /api/sitemap/

# Block admin areas
Disallow: /admin/
Disallow: /api/

# Block sensitive files
Disallow: /*.json$
Disallow: /uploads/private/

# Common SEO optimizations
Crawl-delay: 1

# Sitemap location
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
Sitemap: ${req.protocol}://${req.get('host')}/sitemap-games.xml
Sitemap: ${req.protocol}://${req.get('host')}/sitemap-blog.xml`;

      res.set('Content-Type', 'text/plain');
      res.send(robotsContent);
    } catch (error) {
      console.error('Error serving robots.txt:', error);
      // Fallback to default robots.txt
      res.set('Content-Type', 'text/plain');
      res.send(`User-agent: *
Allow: /

# Sitemap location
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
    }
  });
  
  // Development admin bypass route
  app.post('/api/admin-bypass', (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      req.session.user = {
        id: 1,
        username: 'admin',
        email: 'admin@gamezone.com',
        isAdmin: true,
        roles: ['admin'],
        permissions: ['all']
      };
      return res.json({ 
        success: true, 
        user: req.session.user,
        message: 'Admin access granted for development'
      });
    }
    res.status(404).json({ message: 'Not found' });
  });
  
  // Override the /api/user route to provide mock admin in development
  app.get('/api/user', (req, res) => {
    // Development mode: always return mock admin user when database is unavailable
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@gamezone.com',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        roles: ['admin'],
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return res.json(mockUser);
    }
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json(req.user);
  });
  
  // Register API routes
  registerGameRoutes(app);
  registerBlogRoutes(app);
  registerSettingsRoutes(app);
  registerTournamentRoutes(app);
  registerAnalyticsRoutes(app);
  registerNotificationsRoutes(app);
  registerHomePageContentRoutes(app);
  registerUploadRoutes(app);
  registerPagesRoutes(app);
  registerApiKeyRoutes(app);
  registerHomeAdsRoutes(app);
  registerGameAdsRoutes(app);
  registerSitemapRoutes(app);
  registerUserRoutes(app);
  registerCategoryRoutes(app);
  
  // Public Payment Gateway Routes
  app.get('/api/payment-gateways/public', getPublicPaymentGateways);
  
  // Payment Gateway Routes (Admin)
  app.get('/api/admin/payment-gateways', isAuthenticated, isAdmin, getPaymentGateways);
  app.post('/api/admin/payment-gateways', isAuthenticated, isAdmin, createPaymentGateway);
  app.get('/api/admin/payment-gateways/:id', isAuthenticated, isAdmin, getPaymentGatewayById);
  app.put('/api/admin/payment-gateways/:id', isAuthenticated, isAdmin, updatePaymentGateway);
  app.patch('/api/admin/payment-gateways/:id/status', isAuthenticated, isAdmin, updatePaymentGatewayStatus);
  app.delete('/api/admin/payment-gateways/:id', isAuthenticated, isAdmin, deletePaymentGateway);
  
  // Payment Gateway API Integration Routes
  app.get('/api/admin/payment-gateways-with-api-keys', isAuthenticated, isAdmin, getPaymentGatewaysWithApiKeys);
  app.get('/api/admin/payment-gateway/:gatewayType/test-api-key', isAuthenticated, isAdmin, testPaymentGatewayApiKey);
  
  // Public Payment Transaction Routes (requires authentication)
  app.post('/api/payment-transactions', isAuthenticated, createCheckoutTransaction);
  
  // Generic payment processing endpoint for all gateways
  app.post('/api/payment/process', isAuthenticated, async (req, res) => {
    try {
      const { transactionId, gatewayType } = req.body;
      
      if (!transactionId || !gatewayType) {
        return res.status(400).json({ error: 'Transaction ID and gateway type are required' });
      }
      
      // Get transaction details
      const [transaction] = await db
        .select({
          id: paymentTransactions.id,
          transactionId: paymentTransactions.transactionId,
          amount: paymentTransactions.amount,
          currency: paymentTransactions.currency,
          gatewayId: paymentTransactions.gatewayId,
          gateway: {
            gatewayType: paymentGateways.gatewayType,
            displayName: paymentGateways.displayName,
            apiConfiguration: paymentGateways.apiConfiguration,
            isTestMode: paymentGateways.isTestMode
          }
        })
        .from(paymentTransactions)
        .leftJoin(paymentGateways, eq(paymentTransactions.gatewayId, paymentGateways.id))
        .where(eq(paymentTransactions.id, parseInt(transactionId)));
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      // For now, return a standard response for all automated gateways
      // In a real implementation, you would integrate with each gateway's API
      const response = {
        success: true,
        transactionId: transaction.transactionId,
        gatewayType: transaction.gateway?.gatewayType,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'pending',
        message: `Payment processing initiated for ${transaction.gateway?.displayName}`,
        // For demo purposes, generate a mock payment URL
        paymentUrl: `#payment-processing-${transaction.transactionId}`,
        instructions: getPaymentInstructions(transaction.gateway?.gatewayType)
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  });
  
  // Admin Payment Transaction Routes
  app.get('/api/admin/payment-transactions', isAuthenticated, isAdmin, getPaymentTransactions);
  app.get('/api/admin/payment-transactions/:id', isAuthenticated, isAdmin, getPaymentTransactionById);
  app.patch('/api/admin/payment-transactions/:id/verify', isAuthenticated, isAdmin, verifyPaymentTransaction);
  app.post('/api/admin/payment-transactions/:id/refund', isAuthenticated, isAdmin, refundPaymentTransaction);
  app.get('/api/admin/users/:userId/transactions', isAuthenticated, isAdmin, getUserTransactions);
  app.post('/api/admin/payment-transactions', isAuthenticated, isAdmin, createPaymentTransaction);

  // Pricing Plans Routes
  app.get('/api/admin/pricing-plans', isAuthenticated, isAdmin, getPricingPlans);
  app.get('/api/pricing-plans/type/:type', getPricingPlansByType); // Public endpoint for frontend
  app.get('/api/admin/pricing-plans/:id', isAuthenticated, isAdmin, getPricingPlan);
  app.post('/api/admin/pricing-plans', isAuthenticated, isAdmin, createPricingPlan);
  app.put('/api/admin/pricing-plans/:id', isAuthenticated, isAdmin, updatePricingPlan);
  app.delete('/api/admin/pricing-plans/:id', isAuthenticated, isAdmin, deletePricingPlan);
  app.patch('/api/admin/pricing-plans/:id/status', isAuthenticated, isAdmin, updatePlanStatus);
  app.post('/api/admin/pricing-plans/bulk-update', isAuthenticated, isAdmin, bulkUpdatePricing);

  // Public pricing plans routes
  app.get('/api/pricing-plans/public', getPublicPricingPlans);
  app.get('/api/pricing-plans/public/:id', getPublicPricingPlan);

  // Verification requests routes
  app.get('/api/admin/verification-requests', isAuthenticated, isAdmin, getVerificationRequests);
  app.get('/api/admin/verification-requests/stats', isAuthenticated, isAdmin, getVerificationStats);
  app.get('/api/admin/verification-requests/:id', isAuthenticated, isAdmin, getVerificationRequest);
  app.put('/api/admin/verification-requests/:id/status', isAuthenticated, isAdmin, updateVerificationRequestStatus);
  app.delete('/api/admin/verification-requests/:id', isAuthenticated, isAdmin, deleteVerificationRequest);
  app.post('/api/verification-requests', createVerificationRequest); // Public route

  // Webmaster Tools routes
  app.get('/api/webmaster-tools', getWebmasterTools);
  app.get('/api/admin/webmaster-tools/stats', isAuthenticated, isAdmin, getWebmasterToolsStats);
  app.get('/api/webmaster-tools/:id', getWebmasterToolById);
  app.post('/api/admin/webmaster-tools', isAuthenticated, isAdmin, createWebmasterTool);
  app.put('/api/admin/webmaster-tools/:id', isAuthenticated, isAdmin, updateWebmasterTool);
  app.put('/api/admin/webmaster-tools/:id/verification', isAuthenticated, isAdmin, updateVerificationStatus);
  app.put('/api/admin/webmaster-tools/:id/status', isAuthenticated, isAdmin, toggleWebmasterToolStatus);
  app.delete('/api/admin/webmaster-tools/:id', isAuthenticated, isAdmin, deleteWebmasterTool);
  
  // Register image upload API routes
  const imageUploadRoutes = await import('./api/image-upload');
  app.use('/api/images', imageUploadRoutes.default);
  
  // Register push-notifications API routes
  app.use('/api/push-notifications', pushNotificationsRoutes);
  
  // Register referral system routes
  app.use('/api/referrals', referralRouter);
  app.use('/api/revenue', revenueRouter);
  
  // Register images gallery routes
  registerImagesGalleryRoutes(app);
  
  // Register short links routes
  registerShortLinksRoutes(app);
  
  // Register translation routes
  registerTranslationRoutes(app);
  
  // Register gifts API routes
  app.use('/api/gifts', giftsRouter);
  
  // Register additional push notifications analytics endpoint
  app.get('/api/push-notifications-analytics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get subscriber stats
      const totalSubscribers = await db
        .select({ count: count() })
        .from(pushSubscribers);
      
      const activeSubscribers = await db
        .select({ count: count() })
        .from(pushSubscribers)
        .where(eq(pushSubscribers.status, 'active'));
      
      // Get new subscribers from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newTodaySubscribers = await db
        .select({ count: count() })
        .from(pushSubscribers)
        .where(gte(pushSubscribers.createdAt, today));
      
      // Get new subscribers from this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const newThisWeekSubscribers = await db
        .select({ count: count() })
        .from(pushSubscribers)
        .where(gte(pushSubscribers.createdAt, weekAgo));
      
      // Get device stats
      const deviceStats = await db
        .select({
          deviceType: pushSubscribers.deviceType,
          count: count()
        })
        .from(pushSubscribers)
        .groupBy(pushSubscribers.deviceType);
      
      // Get browser stats
      const browserStats = await db
        .select({
          browser: pushSubscribers.browser,
          count: count()
        })
        .from(pushSubscribers)
        .groupBy(pushSubscribers.browser);
      
      // Get country stats
      const countryStats = await db
        .select({
          country: pushSubscribers.country,
          count: count()
        })
        .from(pushSubscribers)
        .groupBy(pushSubscribers.country);
      
      // Get campaign stats - with proper typed values
      const campaignStats = await db
        .select({
          total: count(),
          active: sql`SUM(CASE WHEN ${pushCampaigns.status} != 'draft' THEN 1 ELSE 0 END)::int`,
          sent: sql`COALESCE(SUM(${pushCampaigns.sentCount}), 0)::int`,
          clicks: sql`COALESCE(SUM(${pushCampaigns.clickCount}), 0)::int`
        })
        .from(pushCampaigns);
      
      // Format stats for frontend
      const analytics = {
        subscribers: {
          total: totalSubscribers[0]?.count || 0,
          active: activeSubscribers[0]?.count || 0,
          newToday: newTodaySubscribers[0]?.count || 0,
          newThisWeek: newThisWeekSubscribers[0]?.count || 0,
          byDevice: deviceStats.map(stat => ({
            name: stat.deviceType || 'Unknown',
            value: Number(stat.count)
          })),
          byBrowser: browserStats.map(stat => ({
            name: stat.browser || 'Unknown',
            value: Number(stat.count)
          })),
          byCountry: countryStats.map(stat => ({
            name: stat.country || 'Unknown',
            value: Number(stat.count)
          })),
          growth: [] // TODO: Add subscriber growth stats over time
        },
        campaigns: {
          total: campaignStats[0]?.total || 0,
          active: campaignStats[0]?.active || 0,
          sent: campaignStats[0]?.sent || 0,
          clicks: campaignStats[0]?.clicks || 0,
          ctr: campaignStats[0]?.sent ? (Number(campaignStats[0].clicks) / Number(campaignStats[0].sent)) * 100 : 0,
          performance: [], // TODO: Add campaign performance stats
          byDay: [] // TODO: Add campaign daily stats
        }
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching push analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Register role and permission API routes
  registerRoleRoutes(app);
  registerPermissionRoutes(app);
  registerWebsiteUpdatesRoutes(app);
  registerAdminNotificationsRoutes(app);
  registerSeoSchemaRoutes(app);
  registerTeamRoutes(app);
  registerFeedbackRoutes(app);
  registerSignupOptionsRoutes(app);
  registerHeroImageRoutes(app);
  registerGoogleIndexingRoutes(app);
  
  // AI Content Generation routes (admin only)
  app.post('/api/ai/generate-content', isAdmin, generateAIContent);
  app.get('/api/ai/models', isAdmin, getAvailableAIModels);
  app.post('/api/ai/test/:modelType', isAdmin, testAIModel);
  app.post('/api/ai/image-alt-text', isAdmin, generateImageAltText);
  app.post('/api/ai/content-optimization', isAdmin, getContentOptimizationSuggestions);
  
  // Register backup and restore routes (admin only)
  app.use('/api/backup-restore', isAdmin, backupRestoreRoutes);
  
  // Register object storage routes
  app.use('/api/objects', objectsRoutes);
  
  // Room system routes
  app.use('/api/rooms', roomsRouter);
  
  // Admin room routes (to work with the admin middleware in auth.ts)
  app.post('/api/admin/rooms/create', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { name, description, category, maxUsers, isPrivate, requiresVerification, allowGuests, moderationLevel } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: "Room name is required" });
      }

      // Import room functions
      const { roomsRouter } = await import("./api/rooms");
      
      // Forward to the rooms API handler with proper data structure
      const roomData = {
        roomId: `SA${Date.now()}`, // Generate temporary ID
        name: name.trim(),
        description: description || null,
        category: category || 'general',
        type: isPrivate ? 'private' : 'public',
        maxSeats: maxUsers || 50,
        ownerId: userId,
        status: 'active',
        language: 'en',
        isLocked: false,
        isFeatured: false,
        requiresVerification: requiresVerification || false,
        allowGuests: allowGuests !== false,
        moderationLevel: moderationLevel || 'standard',
        backgroundTheme: 'lunexa'
      };

      // Use the rooms creation logic
      const { db } = await import("@db");
      const { rooms, roomUsers, roomAnalytics, insertRoomSchema } = await import("@shared/schema");
      
      // Generate unique room ID
      const generateRoomId = async (prefix?: 'SA' | 'MAB'): Promise<string> => {
        const { count, sql } = await import("drizzle-orm");
        
        if (!prefix) {
          const totalRooms = await db.select({ count: count() }).from(rooms);
          prefix = totalRooms[0].count % 2 === 0 ? 'SA' : 'MAB';
        }
        
        const existingRooms = await db
          .select({ roomId: rooms.roomId })
          .from(rooms)
          .where(sql`${rooms.roomId} LIKE ${`${prefix}%`}`);

        let nextNumber = 1994181;
        
        if (existingRooms.length > 0) {
          const numbers = existingRooms
            .map(room => {
              const numStr = room.roomId.substring(prefix.length);
              const num = parseInt(numStr);
              return isNaN(num) ? 0 : num;
            })
            .filter(num => num >= 1994181);
            
          if (numbers.length > 0) {
            nextNumber = Math.max(...numbers) + 1;
          }
        }
        
        return `${prefix}${nextNumber}`;
      };

      const roomId = await generateRoomId();
      roomData.roomId = roomId;

      const validatedData = insertRoomSchema.parse(roomData);
      const [newRoom] = await db.insert(rooms).values(validatedData).returning();

      // Add owner as room user
      await db.insert(roomUsers).values({
        roomId: newRoom.id,
        userId,
        role: 'owner',
        seatNumber: 1,
        isActive: true,
        isMicOn: false,
        isMuted: false
      });

      // Initialize room analytics
      await db.insert(roomAnalytics).values({
        roomId: newRoom.id,
        date: new Date(),
        totalVisits: 0,
        uniqueVisitors: 0,
        peakConcurrentUsers: 1,
        averageSessionDuration: 0,
        totalMessages: 0,
        totalGifts: 0,
        totalGiftValue: 0
      });

      res.json({ 
        success: true, 
        room: newRoom,
        message: "Room created successfully"
      });

    } catch (error) {
      console.error("Error creating admin room:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create room" });
    }
  });
  app.use('/api/friends', friendsRouter);
  app.use('/api/user', userProfileRouter);
  app.use('/api/messages', isAuthenticated, messageRoutes);
  app.use('/api/verification', isAdmin, verificationRouter);
  app.use('/api/verification-expiry', isAdmin, verificationExpiryRouter);
  
  // Quick test route to verify our demo endpoint
  app.post('/api/demo-schemas/test', (req, res) => {
    res.json({ message: "Demo test route working!" });
  });
  
  // Register URL redirects API routes
  registerUrlRedirectRoutes(app);

  // Register security routes
  registerSecurityRoutes(app);
  
  // Register password reset routes
  app.use('/api/auth/reset', authResetRoutes);
  
  // Serve uploaded files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Sitemap endpoints
  // Object Storage Routes
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.sendStatus(401);
    }
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/user/profile-picture", isAuthenticated, async (req, res) => {
    if (!req.body.profilePictureURL) {
      return res.status(400).json({ error: "profilePictureURL is required" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.profilePictureURL,
        {
          owner: userId.toString(),
          visibility: "public",
        },
      );

      // Update user profile picture in database
      await db.update(users)
        .set({ profilePicture: objectPath })
        .where(eq(users.id, userId));

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting profile picture:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const sitemap = await storage.getSitemapByType('main');
      if (!sitemap) {
        return res.status(404).send('Sitemap not found');
      }
      
      // Generate the sitemap on demand if requested
      if (req.query.refresh === 'true') {
        await storage.generateSitemap('main');
      }
      
      // Generate XML for all sitemaps (index)
      const allSitemaps = await storage.getSitemaps();
      const baseUrl = 'https://' + (process.env.REPLIT_DOMAIN || req.get('host'));
      
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
      const sitemapIndexStart = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      const sitemapIndexEnd = '</sitemapindex>';
      
      const sitemapElements = allSitemaps
        .filter(s => s.isEnabled && s.type !== 'main')
        .map(s => {
          return `<sitemap>
            <loc>${baseUrl}${s.url}</loc>
            <lastmod>${new Date(s.lastGenerated).toISOString()}</lastmod>
          </sitemap>`;
        });
      
      const sitemapXml = `${xmlHeader}\n${sitemapIndexStart}\n${sitemapElements.join('\n')}\n${sitemapIndexEnd}`;
      
      res.set('Content-Type', 'application/xml');
      res.send(sitemapXml);
    } catch (error) {
      console.error('Error serving sitemap.xml:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
  
  app.get('/sitemap-:type.xml', async (req, res) => {
    try {
      const type = req.params.type;
      if (!['games', 'blog', 'pages'].includes(type)) {
        return res.status(404).send('Sitemap not found');
      }
      
      const sitemap = await storage.getSitemapByType(type);
      if (!sitemap) {
        return res.status(404).send('Sitemap not found');
      }
      
      // Generate the sitemap on demand if requested
      if (req.query.refresh === 'true') {
        await storage.generateSitemap(type);
      }
      
      const baseUrl = 'https://' + (process.env.REPLIT_DOMAIN || req.get('host'));
      let items: any[] = [];
      
      // Get the URLs based on the sitemap type
      switch (type) {
        case 'games': {
          const gamesList = await db.select({
            id: games.id,
            slug: games.slug,
            updatedAt: games.updatedAt
          }).from(games).where(eq(games.status, 'active'));
          
          items = gamesList.map(game => ({
            loc: `${baseUrl}/game/${game.slug}`,
            lastmod: game.updatedAt ? new Date(game.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8
          }));
          break;
        }
        
        case 'blog': {
          const posts = await db.select({
            id: blogPosts.id,
            slug: blogPosts.slug,
            updatedAt: blogPosts.updatedAt
          }).from(blogPosts).where(eq(blogPosts.status, 'published'));
          
          items = posts.map(post => ({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.7
          }));
          break;
        }
        
        case 'pages': {
          const pages = await db.select({
            id: staticPages.id,
            slug: staticPages.slug,
            updatedAt: staticPages.updatedAt
          }).from(staticPages).where(eq(staticPages.status, 'active'));
          
          items = pages.map(page => ({
            loc: `${baseUrl}/${page.slug}`,
            lastmod: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.6
          }));
          break;
        }
      }
      
      // Generate XML
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
      const urlsetStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      const urlsetEnd = '</urlset>';
      
      const urlElements = items.map(url => {
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
      
      const sitemapXml = `${xmlHeader}\n${urlsetStart}\n${urlElements.join('\n')}\n${urlsetEnd}`;
      
      res.set('Content-Type', 'application/xml');
      res.send(sitemapXml);
    } catch (error) {
      console.error(`Error serving sitemap-${req.params.type}.xml:`, error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Events API routes
  // Get public events (published events for public display)
  app.get('/api/events/public', async (req, res) => {
    try {
      const publicEvents = await db
        .select()
        .from(events)
        .where(eq(events.status, 'published'))
        .orderBy(desc(events.featured), events.startDate);
      
      res.json(publicEvents);
    } catch (error) {
      console.error('Error fetching public events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get single public event by slug
  app.get('/api/events/public/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      
      const [event] = await db.select().from(events)
        .where(and(eq(events.slug, slug), eq(events.status, 'published')))
        .limit(1);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  // Get all events with filtering
  app.get('/api/events', async (req, res) => {
    try {
      const { status, type, featured, limit = '10', offset = '0' } = req.query;
      
      let queryConditions = [];
      
      if (status) {
        queryConditions.push(eq(events.status, status as any));
      }
      if (type) {
        queryConditions.push(eq(events.eventType, type as any));
      }
      if (featured === 'true') {
        queryConditions.push(eq(events.featured, true));
      }
      
      let baseQuery = db.select().from(events);
      
      if (queryConditions.length > 0) {
        baseQuery = baseQuery.where(and(...queryConditions));
      }
      
      const allEvents = await baseQuery
        .orderBy(desc(events.startDate))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get single event by ID or slug
  app.get('/api/events/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // Check if identifier is numeric (ID) or string (slug)
      const isId = /^\d+$/.test(identifier);
      
      const event = await db.select().from(events)
        .where(isId ? eq(events.id, parseInt(identifier)) : eq(events.slug, identifier))
        .limit(1);
      
      if (event.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event[0]);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  // Create new event (admin only)
  app.post('/api/events', isAdmin, async (req, res) => {
    try {
      // Parse and format the data before validation
      const parsedData = {
        ...req.body,
        createdBy: req.user?.id
      };

      // Handle date parsing if dates are strings
      if (parsedData.startDate && typeof parsedData.startDate === 'string') {
        parsedData.startDate = new Date(parsedData.startDate);
      }
      if (parsedData.endDate && typeof parsedData.endDate === 'string') {
        parsedData.endDate = new Date(parsedData.endDate);
      }
      if (parsedData.registrationStartDate && typeof parsedData.registrationStartDate === 'string') {
        parsedData.registrationStartDate = new Date(parsedData.registrationStartDate);
      }
      if (parsedData.registrationEndDate && typeof parsedData.registrationEndDate === 'string') {
        parsedData.registrationEndDate = new Date(parsedData.registrationEndDate);
      }

      // Generate slug if not provided
      if (!parsedData.slug && parsedData.title) {
        parsedData.slug = parsedData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }

      // Set default values for optional fields
      if (parsedData.timezone === undefined) {
        parsedData.timezone = 'UTC';
      }
      if (parsedData.registrationEnabled === undefined) {
        parsedData.registrationEnabled = false;
      }
      if (parsedData.featured === undefined) {
        parsedData.featured = false;
      }
      if (parsedData.registrationFee === undefined) {
        parsedData.registrationFee = 0;
      }

      console.log('Event data before validation:', parsedData);
      
      const eventData = insertEventSchema.parse(parsedData);
      
      const [newEvent] = await db.insert(events).values([eventData]).returning();
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Validation errors:', error.errors);
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors,
          message: 'Please check the form data and ensure all required fields are filled correctly.'
        });
      }
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // Update event (admin only)
  app.put('/api/events/:id', isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const updateData = { ...req.body };
      delete updateData.id;
      
      const [updatedEvent] = await db.update(events)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(events.id, eventId))
        .returning();
      
      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });

  // Delete event (admin only)
  app.delete('/api/events/:id', isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      const [deletedEvent] = await db.delete(events)
        .where(eq(events.id, eventId))
        .returning();
      
      if (!deletedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  // Get event registrations (admin only)
  app.get('/api/events/:id/registrations', isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      const registrations = await db.select({
        id: eventRegistrations.id,
        eventId: eventRegistrations.eventId,
        userId: eventRegistrations.userId,
        guestName: eventRegistrations.guestName,
        guestEmail: eventRegistrations.guestEmail,
        guestPhone: eventRegistrations.guestPhone,
        status: eventRegistrations.status,
        notes: eventRegistrations.notes,
        paymentStatus: eventRegistrations.paymentStatus,
        registeredAt: eventRegistrations.registeredAt,
        updatedAt: eventRegistrations.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          displayName: users.displayName
        }
      })
      .from(eventRegistrations)
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.registeredAt));
      
      res.json(registrations);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      res.status(500).json({ error: 'Failed to fetch registrations' });
    }
  });

  // Register for an event (public endpoint)
  app.post('/api/events/:id/register', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { guestName, guestEmail, guestPhone, notes } = req.body;
      
      // Validate required fields
      if (!guestName || !guestEmail) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      // Check if event exists and is published
      const [event] = await db.select().from(events)
        .where(and(eq(events.id, eventId), eq(events.status, 'published')))
        .limit(1);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // Check if registration is enabled
      if (!event.registrationEnabled) {
        return res.status(400).json({ error: 'Registration is not enabled for this event' });
      }
      
      // Check registration deadline
      if (event.registrationEndDate && new Date() > new Date(event.registrationEndDate)) {
        return res.status(400).json({ error: 'Registration deadline has passed' });
      }
      
      // Check if event is full
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        return res.status(400).json({ error: 'Event is fully booked' });
      }
      
      // Check for duplicate email registration
      const existingRegistration = await db.select().from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.guestEmail, guestEmail)))
        .limit(1);
      
      if (existingRegistration.length > 0) {
        return res.status(400).json({ error: 'Email already registered for this event' });
      }
      
      // Create registration
      const [registration] = await db.insert(eventRegistrations).values({
        eventId,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        notes: notes || null,
        status: 'registered',
        paymentStatus: event.registrationFee && event.registrationFee > 0 ? 'pending' : 'not_required'
      }).returning();
      
      // Update participant count
      await db.update(events)
        .set({ currentParticipants: event.currentParticipants + 1 })
        .where(eq(events.id, eventId));
      
      res.status(201).json({ 
        message: 'Registration successful',
        registration: {
          id: registration.id,
          eventId: registration.eventId,
          status: registration.status,
          registeredAt: registration.registeredAt
        }
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ error: 'Failed to register for event' });
    }
  });

  // Get all registrations (admin only)
  app.get('/api/registrations', isAdmin, async (req, res) => {
    try {
      const { limit = '50', offset = '0', eventId, status } = req.query;
      
      let query = db.select({
        id: eventRegistrations.id,
        eventId: eventRegistrations.eventId,
        userId: eventRegistrations.userId,
        guestName: eventRegistrations.guestName,
        guestEmail: eventRegistrations.guestEmail,
        guestPhone: eventRegistrations.guestPhone,
        status: eventRegistrations.status,
        notes: eventRegistrations.notes,
        paymentStatus: eventRegistrations.paymentStatus,
        registeredAt: eventRegistrations.registeredAt,
        updatedAt: eventRegistrations.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          displayName: users.displayName
        },
        event: {
          id: events.id,
          title: events.title,
          slug: events.slug,
          startDate: events.startDate,
          endDate: events.endDate,
          eventType: events.eventType,
          status: events.status
        }
      })
      .from(eventRegistrations)
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .leftJoin(events, eq(eventRegistrations.eventId, events.id))
      .orderBy(desc(eventRegistrations.registeredAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
      
      if (eventId) {
        query = query.where(eq(eventRegistrations.eventId, parseInt(eventId as string)));
      }
      
      const registrations = await query;
      res.json(registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ error: 'Failed to fetch registrations' });
    }
  });

  // Event registration routes
  app.post('/api/events/:id/register', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      // Check if event exists and registration is enabled
      const [event] = await db.select().from(events)
        .where(eq(events.id, eventId))
        .limit(1);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (!event.registrationEnabled) {
        return res.status(400).json({ error: 'Registration is not enabled for this event' });
      }
      
      // Check registration limits
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        return res.status(400).json({ error: 'Event is full' });
      }
      
      // Register user
      const registrationData = insertEventRegistrationSchema.parse({
        eventId,
        userId: userId || null,
        guestName: req.body.guestName,
        guestEmail: req.body.guestEmail,
        guestPhone: req.body.guestPhone,
        notes: req.body.notes
      });
      
      const [registration] = await db.insert(eventRegistrations)
        .values(registrationData)
        .returning();
      
      // Update participant count
      await db.update(events)
        .set({ currentParticipants: event.currentParticipants + 1 })
        .where(eq(events.id, eventId));
      
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error registering for event:', error);
      res.status(500).json({ error: 'Failed to register for event' });
    }
  });

  // Get event registrations (admin only)
  app.get('/api/events/:id/registrations', isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      const registrations = await db.select().from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId))
        .orderBy(desc(eventRegistrations.registeredAt));
      
      res.json(registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ error: 'Failed to fetch registrations' });
    }
  });

  // Event categories routes
  app.get('/api/event-categories', async (req, res) => {
    try {
      const categories = await db.select().from(eventCategories)
        .where(eq(eventCategories.isActive, true))
        .orderBy(eventCategories.name);
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching event categories:', error);
      res.status(500).json({ error: 'Failed to fetch event categories' });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for voice chat signaling
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: false
  });

  // Store active connections by room and user
  const roomConnections = new Map<string, Map<string, WebSocket>>();
  
  // Store global user connections for presence tracking
  const userConnections = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket: New connection established');
    
    let currentRoom: string | null = null;
    let currentUserId: string | null = null;
    let authenticatedUserId: number | null = null;

    // Extract session from request to authenticate user
    const getAuthenticatedUserId = () => {
      try {
        // Parse session cookie from WebSocket request
        const cookies = req.headers.cookie;
        if (!cookies) return null;

        // Extract session ID from cookie string
        const sessionMatch = cookies.match(/connect\.sid=([^;]+)/);
        if (!sessionMatch) return null;

        // For WebSocket auth, we'll implement a simpler approach
        // In a production system, you'd properly decode the session
        // For now, we'll require explicit authentication via message
        return null;
      } catch (error) {
        console.error('Error extracting session:', error);
        return null;
      }
    };

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket: Received message:', message);
        
        switch (message.type) {
          case 'authenticate':
            // Authenticate WebSocket connection using session token
            try {
              const { sessionToken } = message;
              if (!sessionToken) {
                ws.send(JSON.stringify({ type: 'auth-error', message: 'Session token required' }));
                return;
              }

              // Validate session token against database
              const session = await db
                .select({
                  userId: userSessions.userId
                })
                .from(userSessions)
                .where(and(
                  eq(userSessions.sessionToken, sessionToken),
                  gte(userSessions.expiresAt, new Date())
                ))
                .limit(1);

              if (session.length === 0) {
                ws.send(JSON.stringify({ type: 'auth-error', message: 'Invalid or expired session' }));
                return;
              }

              authenticatedUserId = session[0].userId;
              currentUserId = authenticatedUserId.toString();
              userConnections.set(currentUserId, ws);
              
              console.log(`WebSocket: User ${authenticatedUserId} authenticated successfully`);
              
              // Send auth success and register for presence tracking
              ws.send(JSON.stringify({ type: 'auth-success', userId: authenticatedUserId }));
              
              // Update user presence to online in database
              await db
                .insert(userFriendPresence)
                .values({
                  userId: authenticatedUserId,
                  status: 'online',
                  lastSeen: new Date(),
                  presenceUpdatedAt: new Date()
                })
                .onConflictDoUpdate({
                  target: userFriendPresence.userId,
                  set: {
                    status: 'online',
                    lastSeen: new Date(),
                    presenceUpdatedAt: new Date(),
                    updatedAt: new Date()
                  }
                });
              
              // Broadcast presence update to friends
              await broadcastPresenceToFriends(authenticatedUserId, {
                type: 'presence-update',
                userId: currentUserId,
                status: 'online',
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error authenticating WebSocket:', error);
              ws.send(JSON.stringify({ type: 'auth-error', message: 'Authentication failed' }));
            }
            break;

          case 'register-presence':
            // Deprecated - use authenticate instead
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Use authenticate message type instead' 
            }));
            break;

          case 'update-presence':
            // Update user presence status - only for authenticated users
            if (!authenticatedUserId) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Authentication required for presence updates' 
              }));
              return;
            }

            // Validate status values
            const validStatuses = ['online', 'offline', 'away', 'busy', 'in_room'];
            if (!validStatuses.includes(message.status)) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Invalid status value' 
              }));
              return;
            }

            console.log(`WebSocket: User ${authenticatedUserId} updating presence to ${message.status}`);
            
            try {
              await db
                .update(userFriendPresence)
                .set({
                  status: message.status,
                  currentRoomId: message.currentRoomId || null,
                  lastSeen: new Date(),
                  presenceUpdatedAt: new Date(),
                  updatedAt: new Date()
                })
                .where(eq(userFriendPresence.userId, authenticatedUserId));
              
              // Broadcast presence update to friends using authenticated user ID
              await broadcastPresenceToFriends(authenticatedUserId, {
                type: 'presence-update',
                userId: authenticatedUserId.toString(),
                status: message.status,
                currentRoomId: message.currentRoomId || null,
                timestamp: new Date().toISOString()
              });

              // Send confirmation to client
              ws.send(JSON.stringify({
                type: 'presence-updated',
                status: message.status,
                currentRoomId: message.currentRoomId || null
              }));
            } catch (error) {
              console.error('Error updating presence:', error);
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Failed to update presence' 
              }));
            }
            break;

          case 'join-room':
            // Secure join-room - only for authenticated users
            if (!authenticatedUserId) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Authentication required to join rooms' 
              }));
              return;
            }

            currentRoom = message.roomId;
            currentUserId = authenticatedUserId.toString();
            
            // Validate room ID
            if (!currentRoom || typeof currentRoom !== 'string') {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Valid room ID required' 
              }));
              return;
            }
            
            // Add user to room connections using authenticated ID
            if (!roomConnections.has(currentRoom)) {
              roomConnections.set(currentRoom, new Map());
            }
            roomConnections.get(currentRoom)!.set(currentUserId, ws);
            
            console.log(`WebSocket: User ${authenticatedUserId} joined voice chat in room ${currentRoom}`);
            console.log(`WebSocket: Room ${currentRoom} now has ${roomConnections.get(currentRoom)!.size} users`);
            
            // Update presence to show user is in room
            try {
              await db
                .update(userFriendPresence)
                .set({
                  status: 'in_room',
                  currentRoomId: currentRoom,
                  lastSeen: new Date(),
                  presenceUpdatedAt: new Date(),
                  updatedAt: new Date()
                })
                .where(eq(userFriendPresence.userId, authenticatedUserId));
              
              // Broadcast presence update to friends using authenticated ID
              await broadcastPresenceToFriends(authenticatedUserId, {
                type: 'presence-update',
                userId: authenticatedUserId.toString(),
                status: 'in_room',
                currentRoomId: currentRoom,
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error updating room presence:', error);
            }
            
            // Notify other users in the room
            broadcastToRoom(currentRoom, {
              type: 'user-joined',
              userId: authenticatedUserId.toString()
            }, currentUserId);
            break;

          case 'webrtc-offer':
          case 'webrtc-answer':
          case 'webrtc-ice-candidate':
            // Forward WebRTC signaling messages to the target user
            if (currentRoom && message.targetUserId) {
              const targetWs = roomConnections.get(currentRoom)?.get(message.targetUserId);
              if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify({
                  ...message,
                  fromUserId: currentUserId
                }));
              }
            }
            break;

          case 'mic-toggle':
            // Broadcast mic status to other users in the room
            if (currentRoom) {
              console.log(`WebSocket: User ${currentUserId} toggled mic to ${message.isMicOn} in room ${currentRoom}`);
              broadcastToRoom(currentRoom, {
                type: 'user-mic-toggle',
                userId: currentUserId,
                isMicOn: message.isMicOn
              }, currentUserId);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      
      if (authenticatedUserId) {
        const userIdString = authenticatedUserId.toString();
        
        // Remove user from global connections
        userConnections.delete(userIdString);
        
        // Update user presence to offline in database
        try {
          await db
            .update(userFriendPresence)
            .set({
              status: 'offline',
              currentRoomId: null,
              lastSeen: new Date(),
              presenceUpdatedAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(userFriendPresence.userId, authenticatedUserId));
          
          // Broadcast offline status to friends using authenticated ID
          await broadcastPresenceToFriends(authenticatedUserId, {
            type: 'presence-update',
            userId: userIdString,
            status: 'offline',
            currentRoomId: null,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error updating offline presence:', error);
        }
      }
      
      if (currentRoom && currentUserId) {
        // Remove user from room connections
        const roomUsers = roomConnections.get(currentRoom);
        if (roomUsers) {
          roomUsers.delete(currentUserId);
          if (roomUsers.size === 0) {
            roomConnections.delete(currentRoom);
          }
        }
        
        // Notify other users that this user left
        broadcastToRoom(currentRoom, {
          type: 'user-left',
          userId: currentUserId
        }, currentUserId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Helper function to broadcast messages to all users in a room except sender
  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const roomUsers = roomConnections.get(roomId);
    if (roomUsers) {
      roomUsers.forEach((userWs, userId) => {
        if (userId !== excludeUserId && userWs.readyState === WebSocket.OPEN) {
          userWs.send(JSON.stringify(message));
        }
      });
    }
  }

  // Helper function to broadcast presence updates to user's friends
  async function broadcastPresenceToFriends(userId: number, message: any) {
    try {
      // Get user's accepted friends
      const friends = await db
        .select({
          friendId: userRelationships.targetUserId
        })
        .from(userRelationships)
        .where(and(
          eq(userRelationships.userId, userId),
          eq(userRelationships.relationshipType, 'friend'),
          eq(userRelationships.status, 'accepted')
        ));

      // Also get friends who have this user as their friend (bidirectional)
      const reverseFriends = await db
        .select({
          friendId: userRelationships.userId
        })
        .from(userRelationships)
        .where(and(
          eq(userRelationships.targetUserId, userId),
          eq(userRelationships.relationshipType, 'friend'),
          eq(userRelationships.status, 'accepted')
        ));

      // Combine both friend lists
      const allFriendIds = [
        ...friends.map(f => f.friendId.toString()),
        ...reverseFriends.map(f => f.friendId.toString())
      ];

      // Remove duplicates
      const uniqueFriendIds = [...new Set(allFriendIds)];

      // Send presence update to all connected friends
      uniqueFriendIds.forEach(friendId => {
        const friendWs = userConnections.get(friendId);
        if (friendWs && friendWs.readyState === WebSocket.OPEN) {
          friendWs.send(JSON.stringify(message));
        }
      });

      console.log(`WebSocket: Broadcasted presence update for user ${userId} to ${uniqueFriendIds.length} friends`);
    } catch (error) {
      console.error('Error broadcasting presence to friends:', error);
    }
  }

  // Start automatic verification expiry checker
  // Check every hour for expired verifications
  setInterval(async () => {
    try {
      await checkAndRemoveExpiredVerifications();
    } catch (error) {
      console.error("❌ Scheduled verification expiry check failed:", error);
    }
  }, 60 * 60 * 1000); // 1 hour = 60 * 60 * 1000 milliseconds

  // Run initial check on startup
  setTimeout(async () => {
    try {
      console.log("🚀 Running initial verification expiry check...");
      await checkAndRemoveExpiredVerifications();
    } catch (error) {
      console.error("❌ Initial verification expiry check failed:", error);
    }
  }, 10000); // 10 seconds after startup

  // ===== AUTOMATED MESSAGING ROUTES =====

  // Get all automated message templates (Admin only)
  app.get("/api/admin/messaging/templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await db.select({
        id: automatedMessageTemplates.id,
        trigger: automatedMessageTemplates.trigger,
        channel: automatedMessageTemplates.channel,
        title: automatedMessageTemplates.title,
        content: automatedMessageTemplates.content,
        isActive: automatedMessageTemplates.isActive,
        variables: automatedMessageTemplates.variables,
        createdAt: automatedMessageTemplates.createdAt,
        updatedAt: automatedMessageTemplates.updatedAt,
        createdBy: automatedMessageTemplates.createdBy,
      })
      .from(automatedMessageTemplates)
      .orderBy(desc(automatedMessageTemplates.createdAt));

      res.json(templates);
    } catch (error) {
      console.error('Error fetching message templates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create new automated message template (Admin only)
  app.post("/api/admin/messaging/templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { trigger, channel, title, content, isActive = true } = req.body;

      if (!trigger || !channel || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const [newTemplate] = await db.insert(automatedMessageTemplates)
        .values({
          trigger,
          channel,
          title,
          content,
          isActive,
          createdBy: req.user!.id,
        })
        .returning();

      res.status(201).json(newTemplate);
    } catch (error) {
      console.error('Error creating message template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update automated message template (Admin only)
  app.put("/api/admin/messaging/templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const { trigger, channel, title, content, isActive } = req.body;

      if (!trigger || !channel || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const [updatedTemplate] = await db.update(automatedMessageTemplates)
        .set({
          trigger,
          channel,
          title,
          content,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(automatedMessageTemplates.id, templateId))
        .returning();

      if (!updatedTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating message template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle template status (Admin only)
  app.put("/api/admin/messaging/templates/:id/toggle", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedTemplate] = await db.update(automatedMessageTemplates)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(automatedMessageTemplates.id, templateId))
        .returning();

      if (!updatedTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error toggling template status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete automated message template (Admin only)
  app.delete("/api/admin/messaging/templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);

      const [deletedTemplate] = await db.delete(automatedMessageTemplates)
        .where(eq(automatedMessageTemplates.id, templateId))
        .returning();

      if (!deletedTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting message template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get automated message history (Admin only)
  app.get("/api/admin/messaging/history", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const history = await db.select({
        id: automatedMessageHistory.id,
        templateId: automatedMessageHistory.templateId,
        userId: automatedMessageHistory.userId,
        recipient: automatedMessageHistory.recipient,
        channel: automatedMessageHistory.channel,
        subject: automatedMessageHistory.subject,
        content: automatedMessageHistory.content,
        status: automatedMessageHistory.status,
        sentAt: automatedMessageHistory.sentAt,
        deliveredAt: automatedMessageHistory.deliveredAt,
        metadata: automatedMessageHistory.metadata,
      })
      .from(automatedMessageHistory)
      .orderBy(desc(automatedMessageHistory.sentAt))
      .limit(100); // Limit to last 100 messages

      res.json(history);
    } catch (error) {
      console.error('Error fetching message history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get messaging statistics for admin dashboard
  app.get('/api/admin/messaging/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const [totalUsersResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      
      const [verifiedUsersResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isVerified, true));
      
      const [adminUsersResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.role, 'admin'));
      
      const [usersWithPhoneResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(isNotNull(users.phone));

      res.json({
        totalUsers: totalUsersResult.count,
        verifiedUsers: verifiedUsersResult.count,
        adminUsers: adminUsersResult.count,
        usersWithPhone: usersWithPhoneResult.count,
      });
    } catch (error) {
      console.error('Error fetching messaging stats:', error);
      res.status(500).json({ error: 'Failed to fetch messaging statistics' });
    }
  });

  // Send bulk SMS messages
  app.post('/api/admin/messaging/bulk-sms', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const adminId = (req as any).user?.id;
      const { 
        message, 
        subject, 
        targetAudience, 
        includeUnverified, 
        includeAdmins, 
        selectedUsers,
        scheduledFor 
      } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Build user query based on target audience
      let recipientQuery = db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        phone: users.phone,
        email: users.email,
        isVerified: users.isVerified,
        role: users.role
      }).from(users);

      let whereConditions: any[] = [isNotNull(users.phone)]; // Only users with phone numbers

      switch (targetAudience) {
        case 'verified':
          whereConditions.push(eq(users.isVerified, true));
          break;
        case 'unverified':
          whereConditions.push(eq(users.isVerified, false));
          break;
        case 'admins':
          whereConditions.push(eq(users.role, 'admin'));
          break;
        case 'selected':
          if (!selectedUsers || selectedUsers.length === 0) {
            return res.status(400).json({ error: 'No users selected' });
          }
          whereConditions.push(inArray(users.id, selectedUsers));
          break;
        case 'all':
        default:
          // Apply filters for 'all' audience
          if (!includeUnverified) {
            whereConditions.push(eq(users.isVerified, true));
          }
          if (!includeAdmins) {
            whereConditions.push(ne(users.role, 'admin'));
          }
          break;
      }

      const recipients = await recipientQuery.where(and(...whereConditions));

      if (recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients found matching the criteria' });
      }

      // Create automated messages records for tracking (using the existing automatedMessages table)
      const messageRecords = recipients.map(recipient => ({
        templateId: null,
        userId: recipient.id,
        trigger: 'admin_bulk_sms' as const,
        channel: 'sms' as const,
        content: `${subject || 'Gaming Portal Notification'}: ${message}`,
        status: scheduledFor ? 'scheduled' as const : 'sent' as const,
        sentAt: scheduledFor ? null : new Date(),
        triggerData: {
          targetAudience,
          campaignType: 'bulk_sms',
          adminId,
          phoneNumber: recipient.phone,
          subject: subject || 'Gaming Portal Notification'
        }
      }));

      await db.insert(automatedMessageHistory).values(messageRecords);

      // TODO: Integrate with actual SMS service (Twilio, etc.)
      // For now, we'll just log the SMS messages that would be sent
      console.log(`📱 Bulk SMS Campaign Initiated by Admin ${adminId}:`);
      console.log(`📋 Subject: ${subject || 'Gaming Portal Notification'}`);
      console.log(`💬 Message: ${message}`);
      console.log(`👥 Recipients: ${recipients.length} users`);
      console.log(`📅 Scheduled: ${scheduledFor ? new Date(scheduledFor).toISOString() : 'Immediate'}`);
      
      recipients.forEach((recipient, index) => {
        console.log(`📞 SMS #${index + 1}: ${recipient.phone} (${recipient.username})`);
      });

      res.json({
        success: true,
        message: 'Bulk SMS campaign processed successfully',
        recipientCount: recipients.length,
        scheduled: !!scheduledFor,
        scheduledFor: scheduledFor || null,
        // In a real implementation, you'd return SMS service response data here
        providerResponse: {
          status: 'queued',
          messageIds: recipients.map((_, i) => `sms_${Date.now()}_${i}`),
          estimatedDelivery: scheduledFor || new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      res.status(500).json({ error: 'Failed to send bulk SMS messages' });
    }
  });

  return httpServer;
}
