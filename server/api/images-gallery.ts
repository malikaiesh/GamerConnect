import type { Express } from "express";
import fs from "fs";
import path from "path";
import { isAuthenticated, isAdmin } from "../middleware/auth";

interface ImageInfo {
  id: string;
  filename: string;
  path: string;
  url: string;
  size: number;
  category: string;
  uploadedAt: Date;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * API endpoints for managing the images gallery
 */
export function registerImagesGalleryRoutes(app: Express) {
  
  // Get all uploaded images from the website
  app.get('/api/admin/images-gallery', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const images: ImageInfo[] = [];

      // Check if uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ images: [] });
      }

      // Recursively scan all subdirectories in uploads
      const scanDirectory = (dirPath: string, category: string = '') => {
        try {
          const items = fs.readdirSync(dirPath);
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              // Recursively scan subdirectories
              const subCategory = category ? `${category}/${item}` : item;
              scanDirectory(itemPath, subCategory);
            } else if (stats.isFile()) {
              // Check if file is an image
              const ext = path.extname(item).toLowerCase();
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
              
              if (imageExtensions.includes(ext)) {
                const relativePath = path.relative(uploadsDir, itemPath);
                const urlPath = relativePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URLs
                
                images.push({
                  id: `${category || 'root'}_${item}_${stats.mtime.getTime()}`,
                  filename: item,
                  path: relativePath,
                  url: `/uploads/${urlPath}`,
                  size: stats.size,
                  category: category || 'root',
                  uploadedAt: stats.mtime,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error scanning directory ${dirPath}:`, error);
        }
      };

      scanDirectory(uploadsDir);

      // Sort images by upload date (newest first)
      images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

      res.json({ 
        images,
        totalImages: images.length,
        categories: [...new Set(images.map(img => img.category))],
      });

    } catch (error) {
      console.error('Error fetching images gallery:', error);
      res.status(500).json({ 
        error: 'Failed to fetch images gallery',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Download a specific image
  app.get('/api/admin/images-gallery/download/:category/:filename', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { category, filename } = req.params;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Build the file path based on category
      const filePath = category === 'root' 
        ? path.join(uploadsDir, filename)
        : path.join(uploadsDir, category, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Verify it's actually an image file
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return res.status(400).json({ error: 'Invalid file' });
      }

      // Set proper headers for download
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
        case '.gif':
          mimeType = 'image/gif';
          break;
        case '.webp':
          mimeType = 'image/webp';
          break;
        case '.svg':
          mimeType = 'image/svg+xml';
          break;
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading image:', error);
      res.status(500).json({ 
        error: 'Failed to download image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get image statistics
  app.get('/api/admin/images-gallery/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        return res.json({
          totalImages: 0,
          totalSize: 0,
          categories: [],
          averageSize: 0,
        });
      }

      const images: { size: number; category: string }[] = [];
      
      // Recursively scan for images
      const scanDirectory = (dirPath: string, category: string = '') => {
        try {
          const items = fs.readdirSync(dirPath);
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              const subCategory = category ? `${category}/${item}` : item;
              scanDirectory(itemPath, subCategory);
            } else if (stats.isFile()) {
              const ext = path.extname(item).toLowerCase();
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
              
              if (imageExtensions.includes(ext)) {
                images.push({
                  size: stats.size,
                  category: category || 'root',
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error scanning directory ${dirPath}:`, error);
        }
      };

      scanDirectory(uploadsDir);

      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      const categories = [...new Set(images.map(img => img.category))];
      const averageSize = images.length > 0 ? Math.round(totalSize / images.length) : 0;

      res.json({
        totalImages: images.length,
        totalSize,
        categories: categories.sort(),
        averageSize,
        categoryStats: categories.map(cat => ({
          category: cat,
          count: images.filter(img => img.category === cat).length,
          totalSize: images.filter(img => img.category === cat).reduce((sum, img) => sum + img.size, 0),
        })),
      });

    } catch (error) {
      console.error('Error fetching images stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch images stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}