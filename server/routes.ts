import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
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
import pushNotificationsRoutes from "./api/push-notifications";
import { registerRoleRoutes } from "./api/roles";
import { registerPermissionRoutes } from "./api/permissions";
import { registerSecurityRoutes } from "./routes/security";
import authResetRoutes from "./routes/auth-reset";
import { storage } from "./storage";
import { db } from "../db";
import { games, blogPosts, staticPages } from "@shared/schema";
import { eq } from "drizzle-orm";
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
  
  // Register push-notifications API routes
  app.use('/api/push-notifications', pushNotificationsRoutes);
  
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
