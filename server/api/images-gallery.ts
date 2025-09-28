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
  
  // Get uploaded images from the website with pagination
  app.get('/api/admin/images-gallery', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const allImages: ImageInfo[] = [];
      
      // Pagination parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20)); // Between 1-50 items per page
      const category = req.query.category as string || '';

      // Check if uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ 
          images: [], 
          totalImages: 0,
          totalPages: 0,
          currentPage: page,
          categories: [],
          hasNextPage: false,
          hasPrevPage: false
        });
      }

      // Scan all images and collect categories
      const allCategories = new Set<string>();
      const filteredImages: ImageInfo[] = [];
      
      const scanDirectory = (dirPath: string, currentCategory: string = '') => {
        try {
          const items = fs.readdirSync(dirPath);
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              // Recursively scan subdirectories
              const subCategory = currentCategory ? `${currentCategory}/${item}` : item;
              scanDirectory(itemPath, subCategory);
            } else if (stats.isFile()) {
              // Check if file is an image
              const ext = path.extname(item).toLowerCase();
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
              
              if (imageExtensions.includes(ext)) {
                const relativePath = path.relative(uploadsDir, itemPath);
                const urlPath = relativePath.replace(/\\/g, '/');
                const imageCategory = currentCategory || 'root';
                
                // Always add to categories list for UI filter options
                allCategories.add(imageCategory);
                
                const imageInfo: ImageInfo = {
                  id: `${imageCategory}_${item}_${stats.mtime.getTime()}`,
                  filename: item,
                  path: relativePath,
                  url: `/uploads/${urlPath}`,
                  size: stats.size,
                  category: imageCategory,
                  uploadedAt: stats.mtime,
                };
                
                // Add all images first, then filter
                allImages.push(imageInfo);
                
                // Apply category filter for final results
                if (!category || imageCategory === category) {
                  filteredImages.push(imageInfo);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error scanning directory ${dirPath}:`, error);
        }
      };

      scanDirectory(uploadsDir);

      // Sort filtered images by upload date (newest first)
      filteredImages.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

      // Pagination calculations
      const totalImages = filteredImages.length;
      const totalPages = Math.ceil(totalImages / limit);
      const offset = (page - 1) * limit;
      const paginatedImages = filteredImages.slice(offset, offset + limit);

      res.json({ 
        images: paginatedImages,
        totalImages,
        totalPages,
        currentPage: page,
        limit,
        categories: Array.from(allCategories).sort(), // Always return all categories
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        activeFilter: category || null
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