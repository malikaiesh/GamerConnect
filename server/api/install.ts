import { Express, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { z } from 'zod';
import { db, pool } from '../../db'; // Importing from our existing db config
import { siteSettings, users } from '@shared/schema';

const scryptAsync = promisify(scrypt);

// Define the schema for installation data
const installSchema = z.object({
  // Database configuration
  db_host: z.string().min(1),
  db_port: z.string(),
  db_name: z.string().min(1),
  db_user: z.string().min(1),
  db_password: z.string(),
  
  // Website configuration
  site_name: z.string().min(3),
  site_description: z.string().min(10),
  site_url: z.string().url(),
  
  // Admin account
  admin_username: z.string().min(3),
  admin_password: z.string().min(6),
  admin_email: z.string().email(),
  captcha: z.string().min(1)
});

// Function to check if application is already installed
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

// Function to create database config file
async function createDatabaseConfig(data: any): Promise<void> {
  try {
    // Ensure config directory exists
    const configDir = path.resolve('./config');
    try {
      await fs.access(configDir);
    } catch {
      await fs.mkdir(configDir, { recursive: true });
    }
    
    // Create database config file
    const dbConfig = {
      host: data.db_host,
      port: parseInt(data.db_port),
      database: data.db_name,
      user: data.db_user,
      password: data.db_password
    };
    
    await fs.writeFile(
      path.resolve('./config/database.json'),
      JSON.stringify(dbConfig, null, 2)
    );
  } catch (error) {
    throw new Error(`Failed to create database configuration: ${error}`);
  }
}

// Function to set up installation status
async function markAsInstalled(): Promise<void> {
  const installConfig = {
    installed: true,
    installedAt: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.resolve('./config/installed.json'),
    JSON.stringify(installConfig, null, 2)
  );
}

// Hash password utility
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Function to initialize database
async function initializeDatabase(dbConfig: any, adminData: any, siteData: any): Promise<void> {
  try {
    // We'll use the existing db connection
    // Create the admin user
    const hashedPassword = await hashPassword(adminData.password);
    
    // Insert admin user
    await db.insert(users).values({
      username: adminData.username,
      password: hashedPassword,
      email: adminData.email,
      isAdmin: true,
      createdAt: new Date()
    });
    
    // Insert site settings
    await db.insert(siteSettings).values({
      name: siteData.name,
      description: siteData.description,
      siteUrl: siteData.url,
      logoUrl: '/logo.png',
      favicon: '/favicon.ico',
      metaTitle: siteData.name,
      metaDescription: siteData.description,
      ogTitle: siteData.name,
      ogDescription: siteData.description,
      ogImage: '/og-image.jpg',
      twitterHandle: '',
      googleAnalyticsId: '',
      footerText: `© ${new Date().getFullYear()} ${siteData.name}. All rights reserved.`,
      theme: 'modern',
      colorScheme: 'light',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    throw new Error(`Failed to initialize database: ${error}`);
  }
}

// Function to validate database connection
async function validateDbConnection(dbConfig: any): Promise<boolean> {
  try {
    // We'll use the existing pg pool connection since we're just configuring
    // Note: In a real app with actual hosting, this would connect to the provided DB
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    throw new Error(`Failed to connect to database: ${error}`);
  }
}

// Function to handle installation
async function handleInstallation(data: z.infer<typeof installSchema>): Promise<void> {
  // Validate that the app isn't already installed
  const appInstalled = await isInstalled();
  if (appInstalled) {
    throw new Error('Application is already installed');
  }
  
  // Create database configuration
  const dbConfig = {
    host: data.db_host,
    port: parseInt(data.db_port),
    database: data.db_name,
    user: data.db_user,
    password: data.db_password
  };
  
  // Test database connection
  await validateDbConnection(dbConfig);
  
  // Create database config file
  await createDatabaseConfig(data);
  
  // Initialize the database (create tables and initial data)
  await initializeDatabase(
    dbConfig,
    {
      username: data.admin_username,
      password: data.admin_password,
      email: data.admin_email
    },
    {
      name: data.site_name,
      description: data.site_description,
      url: data.site_url
    }
  );
  
  // Mark as installed
  await markAsInstalled();
}

export function registerInstallRoutes(app: Express) {
  // Check installation status
  app.get('/api/install/status', async (_req: Request, res: Response) => {
    try {
      const installed = await isInstalled();
      res.json({ installed });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check installation status' });
    }
  });

  // Handle installation
  app.post('/api/install', async (req: Request, res: Response) => {
    try {
      // Check if already installed
      const appInstalled = await isInstalled();
      if (appInstalled) {
        return res.status(400).json({ error: 'Application is already installed' });
      }
      
      // Validate CAPTCHA (in a real implementation, this would verify against a CAPTCHA service)
      // For now, we'll just check if the field is filled
      if (!req.body.captcha) {
        return res.status(400).json({ error: 'CAPTCHA verification failed' });
      }
      
      // Validate form data
      const validatedData = installSchema.parse(req.body);
      
      // Process installation
      await handleInstallation(validatedData);
      
      res.status(200).json({ success: true, message: 'Installation completed successfully' });
    } catch (error) {
      console.error('Installation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid installation data', details: error.errors });
      }
      res.status(500).json({ error: 'Installation failed', message: error.message });
    }
  });
}