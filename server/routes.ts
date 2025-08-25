import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
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
import { registerSitemapRoutes } from "./api/sitemapRoutes";
import { registerUserRoutes } from "./api/users";
import { registerUrlRedirectRoutes } from "./api/redirects";
import { registerCategoryRoutes } from "./api/categories";
import pushNotificationsRoutes from "./api/push-notifications";
import { registerRoleRoutes } from "./api/roles";
import { registerPermissionRoutes } from "./api/permissions";
import { registerSecurityRoutes } from "./routes/security";
import authResetRoutes from "./routes/auth-reset";
import { storage } from "./storage";
import { db } from "../db";
import { games, blogPosts, staticPages, pushSubscribers, pushCampaigns } from "@shared/schema";
import { eq, count, gte, sql } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { initializeSendGrid } from "./services/email-service";
import { handleUrlRedirects } from "./middleware/redirects";

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
  registerAnalyticsRoutes(app);
  registerNotificationsRoutes(app);
  registerHomePageContentRoutes(app);
  registerUploadRoutes(app);
  registerPagesRoutes(app);
  registerApiKeyRoutes(app);
  registerHomeAdsRoutes(app);
  registerSitemapRoutes(app);
  registerUserRoutes(app);
  registerCategoryRoutes(app);
  
  // Register image upload API routes
  const imageUploadRoutes = await import('./api/image-upload');
  app.use('/api/images', imageUploadRoutes.default);
  
  // Register push-notifications API routes
  app.use('/api/push-notifications', pushNotificationsRoutes);
  
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

  const httpServer = createServer(app);

  return httpServer;
}
