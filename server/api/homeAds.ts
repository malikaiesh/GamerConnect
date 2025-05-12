import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ZodError } from 'zod';
import { insertHomeAdSchema } from '@shared/schema';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'ads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, 'ad-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images Only!'));
    }
  }
});

// Register home ads routes
export function registerHomeAdsRoutes(app: Express) {
  // Get all home ads
  app.get('/api/home-ads', async (req: Request, res: Response) => {
    try {
      const homeAds = await storage.getHomeAds();
      res.json(homeAds);
    } catch (error) {
      console.error('Error fetching home ads:', error);
      res.status(500).json({ error: 'Failed to fetch home ads' });
    }
  });

  // Get active home ads
  app.get('/api/home-ads/active', async (req: Request, res: Response) => {
    try {
      const homeAds = await storage.getActiveHomeAds();
      res.json(homeAds);
    } catch (error) {
      console.error('Error fetching active home ads:', error);
      res.status(500).json({ error: 'Failed to fetch active home ads' });
    }
  });

  // Get a home ad by ID
  app.get('/api/home-ads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid home ad ID' });
      }

      const homeAd = await storage.getHomeAdById(id);
      if (!homeAd) {
        return res.status(404).json({ error: 'Home ad not found' });
      }

      res.json(homeAd);
    } catch (error) {
      console.error(`Error fetching home ad with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch home ad' });
    }
  });

  // Get a home ad by position
  app.get('/api/home-ads/position/:position', async (req: Request, res: Response) => {
    try {
      const position = req.params.position;
      const homeAd = await storage.getHomeAdByPosition(position);
      if (!homeAd) {
        return res.status(404).json({ error: 'Home ad not found for this position' });
      }

      res.json(homeAd);
    } catch (error) {
      console.error(`Error fetching home ad for position ${req.params.position}:`, error);
      res.status(500).json({ error: 'Failed to fetch home ad by position' });
    }
  });

  // Create a new home ad (supports both code-only and image uploads)
  app.post('/api/home-ads', async (req: Request, res: Response) => {
    try {
      // For code-only ads, we don't require an image
      const homeAdData = {
        ...req.body,
        clickCount: 0,
        impressionCount: 0
      };
      
      // Validate with zod schema
      const validatedData = insertHomeAdSchema.parse(homeAdData);
      
      // Create the home ad
      const newHomeAd = await storage.createHomeAd(validatedData);
      res.status(201).json(newHomeAd);
    } catch (error) {
      console.error('Error creating home ad:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to create home ad' });
    }
  });

  // Update a home ad (PUT method - full update with image support)
  app.put('/api/home-ads/:id', upload.single('image'), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid home ad ID' });
      }

      // Check if home ad exists
      const existingHomeAd = await storage.getHomeAdById(id);
      if (!existingHomeAd) {
        return res.status(404).json({ error: 'Home ad not found' });
      }

      // Prepare update data
      let homeAdData: any = { ...req.body };
      
      // Handle image upload if provided
      if (req.file) {
        homeAdData.imageUrl = `/uploads/ads/${req.file.filename}`;
        
        // Delete old image if it exists
        if (existingHomeAd.imageUrl) {
          const oldImagePath = path.join(process.cwd(), existingHomeAd.imageUrl.replace(/^\//, ''));
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (unlinkError) {
            console.error('Error deleting old image:', unlinkError);
          }
        }
      }
      
      // Handle date fields
      if (homeAdData.startDate === '') homeAdData.startDate = null;
      if (homeAdData.endDate === '') homeAdData.endDate = null;
      
      // Update the home ad
      const updatedHomeAd = await storage.updateHomeAd(id, homeAdData);
      res.json(updatedHomeAd);
    } catch (error) {
      console.error(`Error updating home ad with ID ${req.params.id}:`, error);
      
      // Clean up uploaded file if update failed
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file after update failure:', unlinkError);
        }
      }
      
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to update home ad' });
    }
  });

  // Update a home ad (PATCH method - partial update, no image support)
  app.patch('/api/home-ads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid home ad ID' });
      }

      // Check if home ad exists
      const existingHomeAd = await storage.getHomeAdById(id);
      if (!existingHomeAd) {
        return res.status(404).json({ error: 'Home ad not found' });
      }

      // Prepare update data
      const homeAdData = { ...req.body };
      
      // Update the home ad
      const updatedHomeAd = await storage.updateHomeAd(id, homeAdData);
      res.json(updatedHomeAd);
    } catch (error) {
      console.error(`Error updating home ad with ID ${req.params.id}:`, error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to update home ad' });
    }
  });

  // Delete a home ad
  app.delete('/api/home-ads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid home ad ID' });
      }

      // Get the home ad to delete its image
      const homeAd = await storage.getHomeAdById(id);
      if (!homeAd) {
        return res.status(404).json({ error: 'Home ad not found' });
      }

      // Delete the image file if it exists
      if (homeAd.imageUrl) {
        const imagePath = path.join(process.cwd(), homeAd.imageUrl.replace(/^\//, ''));
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (unlinkError) {
          console.error('Error deleting image:', unlinkError);
        }
      }

      // Delete the home ad from the database
      const result = await storage.deleteHomeAd(id);
      if (result) {
        res.status(200).json({ message: 'Home ad deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete home ad' });
      }
    } catch (error) {
      console.error(`Error deleting home ad with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete home ad' });
    }
  });

  // Increment ad impression count
  app.post('/api/home-ads/:id/impression', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid home ad ID' });
      }

      await storage.incrementAdImpressionCount(id);
      res.status(200).json({ message: 'Impression recorded' });
    } catch (error) {
      console.error(`Error recording impression for home ad with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to record impression' });
    }
  });

  // Increment ad click count
  app.post('/api/home-ads/:id/click', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid home ad ID' });
      }

      await storage.incrementAdClickCount(id);
      res.status(200).json({ message: 'Click recorded' });
    } catch (error) {
      console.error(`Error recording click for home ad with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to record click' });
    }
  });
  
  // Toggle all ads at once
  app.post('/api/home-ads/toggle-all', async (req: Request, res: Response) => {
    try {
      const { adEnabled } = req.body;
      
      if (typeof adEnabled !== 'boolean') {
        return res.status(400).json({ error: 'The adEnabled property must be a boolean' });
      }
      
      // Get all home ads
      const homeAds = await storage.getHomeAds();
      
      // Update each ad with the new enabled status
      const updatePromises = homeAds.map(ad => 
        storage.updateHomeAd(ad.id, { adEnabled })
      );
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      res.status(200).json({ 
        message: `All ads have been ${adEnabled ? 'enabled' : 'disabled'} successfully`,
        count: homeAds.length
      });
    } catch (error) {
      console.error('Error toggling all home ads:', error);
      res.status(500).json({ error: 'Failed to toggle all home ads' });
    }
  });
}