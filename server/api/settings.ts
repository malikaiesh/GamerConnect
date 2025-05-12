import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertSiteSettingsSchema } from "@shared/schema";

export function registerSettingsRoutes(app: Express) {
  // Get site settings
  app.get('/api/settings', async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings) {
        return res.status(404).json({ message: 'Site settings not found' });
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ message: 'Failed to fetch site settings' });
    }
  });
  
  // Update general settings
  app.patch('/api/settings/general', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        currentTheme: z.string().min(1),
        pushNotificationsEnabled: z.boolean()
      });
      
      const settingsData = schema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid settings data', errors: error.errors });
      }
      console.error('Error updating general settings:', error);
      res.status(500).json({ message: 'Failed to update general settings' });
    }
  });
  
  // Update SEO settings
  app.patch('/api/settings/seo', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        siteTitle: z.string().min(3),
        metaDescription: z.string().min(10),
        keywords: z.string(),
        adsTxt: z.string().optional()
      });
      
      const settingsData = schema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid SEO settings data', errors: error.errors });
      }
      console.error('Error updating SEO settings:', error);
      res.status(500).json({ message: 'Failed to update SEO settings' });
    }
  });
  
  // Update blog ads settings
  app.patch('/api/settings/ads', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        headerAds: z.string().optional(),
        footerAds: z.string().optional(),
        sidebarAds: z.string().optional(),
        contentAds: z.string().optional(),
        floatingHeaderAds: z.string().optional(),
        floatingFooterAds: z.string().optional()
      });
      
      const settingsData = schema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid ad settings data', errors: error.errors });
      }
      console.error('Error updating ad settings:', error);
      res.status(500).json({ message: 'Failed to update ad settings' });
    }
  });
  
  // Update custom code settings
  app.patch('/api/settings/custom-code', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        customHeaderCode: z.string().optional(),
        customBodyCode: z.string().optional(),
        customFooterCode: z.string().optional()
      });
      
      const settingsData = schema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid custom code settings data', errors: error.errors });
      }
      console.error('Error updating custom code settings:', error);
      res.status(500).json({ message: 'Failed to update custom code settings' });
    }
  });
  
  // Update ads.txt content
  app.patch('/api/settings/ads-txt', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        adsTxt: z.string()
      });
      
      const settingsData = schema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid ads.txt content', errors: error.errors });
      }
      console.error('Error updating ads.txt content:', error);
      res.status(500).json({ message: 'Failed to update ads.txt content' });
    }
  });
  
  // Update all settings at once
  app.put('/api/settings', async (req: Request, res: Response) => {
    try {
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid settings data', errors: error.errors });
      }
      console.error('Error updating settings:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });
}
