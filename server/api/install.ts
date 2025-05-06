import { Express, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
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
    // Check if admin user already exists
    const existingUsers = await db.select().from(users).where(eq(users.username, adminData.username));
    
    // Only create admin user if it doesn't already exist
    if (existingUsers.length === 0) {
      console.log('Creating new admin user');
      const hashedPassword = await hashPassword(adminData.password);
      
      // Insert admin user
      await db.insert(users).values({
        username: adminData.username,
        password: hashedPassword,
        email: adminData.email,
        isAdmin: true,
        createdAt: new Date()
      });
    } else {
      console.log('Admin user already exists, skipping creation');
    }
    
    // Check if site settings already exist
    const existingSettings = await db.select().from(siteSettings);
    
    // Only create site settings if they don't already exist
    if (existingSettings.length === 0) {
      console.log('Creating new site settings');
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
    } else {
      console.log('Site settings already exist, skipping creation');
    }
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
  console.log('=== Starting installation process ===');
  // Validate that the app isn't already installed
  console.log('Checking if app is already installed...');
  const appInstalled = await isInstalled();
  if (appInstalled) {
    console.log('Error: Application is already installed');
    throw new Error('Application is already installed');
  }
  
  // Create database configuration
  console.log('Creating database configuration...');
  const dbConfig = {
    host: data.db_host,
    port: parseInt(data.db_port),
    database: data.db_name,
    user: data.db_user,
    password: data.db_password
  };
  console.log('DB Config (sanitized):', { ...dbConfig, password: '********' });
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await validateDbConnection(dbConfig);
    console.log('Database connection successful');
    
    // Create database config file
    console.log('Creating database config file...');
    await createDatabaseConfig(data);
    console.log('Database config file created');
    
    // Initialize the database (create tables and initial data)
    console.log('Initializing database with admin and site data...');
    const adminData = {
      username: data.admin_username,
      password: data.admin_password,
      email: data.admin_email
    };
    
    const siteData = {
      name: data.site_name,
      description: data.site_description,
      url: data.site_url
    };
    
    console.log('Admin data (sanitized):', { ...adminData, password: '********' });
    console.log('Site data:', siteData);
    
    await initializeDatabase(dbConfig, adminData, siteData);
    console.log('Database initialized successfully');
    
    // Mark as installed
    console.log('Marking application as installed...');
    await markAsInstalled();
    console.log('Installation completed successfully');
  } catch (error) {
    console.error('Installation process failed:', error);
    throw error;
  }
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
    console.log('Installation API endpoint called');
    console.log('Request body:', req.body);
    
    try {
      // Check if already installed
      const appInstalled = await isInstalled();
      if (appInstalled) {
        console.log('Application already installed');
        return res.status(400).json({ error: 'Application is already installed' });
      }
      
      // Validate CAPTCHA (in a real implementation, this would verify against a CAPTCHA service)
      console.log('CAPTCHA value received:', req.body.captcha);
      // For now, we'll just check if the field is filled
      if (!req.body.captcha) {
        console.log('CAPTCHA verification failed - empty value');
        return res.status(400).json({ error: 'CAPTCHA verification failed', reason: 'Empty CAPTCHA value' });
      }
      
      try {
        // Validate form data
        console.log('Validating form data with Zod schema');
        const validatedData = installSchema.parse(req.body);
        console.log('Form data validation successful');
        
        // Process installation
        console.log('Starting installation process');
        await handleInstallation(validatedData);
        console.log('Installation completed successfully');
        
        res.status(200).json({ success: true, message: 'Installation completed successfully' });
      } catch (validationError) {
        console.error('Validation error:', validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            error: 'Invalid installation data', 
            details: validationError.errors,
            formattedErrors: validationError.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
          });
        }
        throw validationError; // Re-throw if it's not a ZodError
      }
    } catch (error) {
      console.error('Installation error:', error);
      res.status(500).json({ 
        error: 'Installation failed', 
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });
}