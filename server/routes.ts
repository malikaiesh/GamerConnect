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
import { storage } from "./storage";
import fs from "fs/promises";
import path from "path";

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
  // Add installation check middleware
  app.use(installationCheckMiddleware);
  
  // Register installation routes - must be before other routes
  registerInstallRoutes(app);
  
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
  
  // Serve uploaded files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Serve ads.txt file if configured
  app.get('/ads.txt', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (settings?.adsTxt) {
        res.type('text/plain');
        return res.send(settings.adsTxt);
      }
      return res.status(404).send('Not found');
    } catch (error) {
      console.error('Error serving ads.txt:', error);
      return res.status(500).send('Server error');
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
