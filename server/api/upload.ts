import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { imageProcessingService } from '../services/image-processing';

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueId = nanoid(10);
    const fileExt = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9-_.]/g, '-')
      .toLowerCase()
      .substring(0, 20);
    
    cb(null, `${safeName}-${uniqueId}${fileExt}`);
  }
});

// Define allowed file types for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (JPEG, PNG, GIF, WEBP)'));
  }
};

// Define allowed file types for game files
const gameFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/vnd.android.package-archive', // APK
    'application/zip', // ZIP files (for HTML5 games, Unity builds)
    'text/html', // HTML files
    'application/octet-stream', // Generic binary (for iOS .ipa files, Unity builds)
    'application/x-zip-compressed', // Another ZIP variant
    'application/x-apple-diskimage' // For iOS files
  ];
  
  const allowedExtensions = ['.apk', '.zip', '.html', '.htm', '.ipa', '.unitypackage'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only game files are allowed (APK, ZIP, HTML, IPA, Unity packages)'));
  }
};

// Setup upload middleware for images
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Setup upload middleware for game files
const gameUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads", "games");
      
      // Create the games uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create a unique filename with original extension
      const uniqueId = nanoid(10);
      const fileExt = path.extname(file.originalname).toLowerCase();
      const safeName = file.originalname
        .replace(/[^a-zA-Z0-9-_.]/g, '-')
        .toLowerCase()
        .substring(0, 20);
      
      cb(null, `${safeName}-${uniqueId}${fileExt}`);
    }
  }),
  fileFilter: gameFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size for games
  }
});

export function registerUploadRoutes(app: Express) {
  // Handle image uploads for TinyMCE editor
  app.post('/api/upload-image', (req, res) => {
    // Check authentication
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: { message: "You must be an admin to upload images" } 
      });
    }
    
    // Use multer middleware for single file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: { message: "File is too large (max 5MB)" }
            });
          }
          return res.status(400).json({
            error: { message: err.message }
          });
        }
        
        // Other errors
        return res.status(400).json({
          error: { message: err.message }
        });
      }
      
      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: { message: "No file was uploaded" }
        });
      }
      
      // Process the uploaded image automatically
      try {
        console.log(`Processing uploaded image: ${req.file.filename}`);
        
        const processed = await imageProcessingService.processImage(req.file.path, {
          quality: 85,
          maxWidth: 1920,
          maxHeight: 1080,
          generateAltText: true,
        });
        
        // Clean up original file
        await imageProcessingService.cleanupOriginalFile(req.file.path);
        
        // Return the processed WebP image URL and alt text
        const webpUrl = imageProcessingService.getImageUrl(processed.webpPath);
        
        console.log(`✓ Image processed: ${processed.compressionRatio}% compression, alt text: "${processed.altText}"`);
        
        return res.status(200).json({
          location: webpUrl,
          altText: processed.altText,
          originalSize: processed.originalSize,
          compressedSize: processed.compressedSize,
          compressionRatio: processed.compressionRatio,
          width: processed.width,
          height: processed.height
        });
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original file if processing fails
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
          location: fileUrl,
          altText: 'Image',
          error: 'Image processing failed, using original file'
        });
      }
    });
  });

  // General file upload route for logo, favicon, etc.
  app.post('/api/upload', (req, res) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(403).json({ 
        error: { message: "You must be logged in to upload files" } 
      });
    }
    
    // Use multer middleware for single file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: { message: "File is too large (max 5MB)" }
            });
          }
          return res.status(400).json({
            error: { message: err.message }
          });
        }
        
        // Other errors
        return res.status(400).json({
          error: { message: err.message }
        });
      }
      
      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: { message: "No file was uploaded" }
        });
      }
      
      // Process the uploaded image automatically
      try {
        console.log(`Processing uploaded image: ${req.file.filename}`);
        
        const processed = await imageProcessingService.processImage(req.file.path, {
          quality: 85,
          maxWidth: 1920,
          maxHeight: 1080,
          generateAltText: true,
        });
        
        // Clean up original file
        await imageProcessingService.cleanupOriginalFile(req.file.path);
        
        // Return the processed WebP image URL and metadata
        const webpUrl = imageProcessingService.getImageUrl(processed.webpPath);
        
        console.log(`✓ Image processed: ${processed.compressionRatio}% compression, alt text: "${processed.altText}"`);
        
        return res.status(200).json({
          location: webpUrl,
          altText: processed.altText,
          originalSize: processed.originalSize,
          compressedSize: processed.compressedSize,
          compressionRatio: processed.compressionRatio,
          width: processed.width,
          height: processed.height
        });
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original file if processing fails
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
          location: fileUrl,
          altText: 'Image',
          error: 'Image processing failed, using original file'
        });
      }
    });
  });

  // Game file upload route for APK, HTML, iOS, Unity files
  app.post('/api/upload/game', (req, res) => {
    // Check authentication
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: { message: "You must be an admin to upload game files" } 
      });
    }
    
    // Get file type from query parameter
    const fileType = req.query.type as string;
    if (!fileType || !['html5', 'apk', 'ios', 'unity'].includes(fileType)) {
      return res.status(400).json({
        error: { message: "Invalid file type. Supported: html5, apk, ios, unity" }
      });
    }
    
    // Use multer middleware for single file upload
    gameUpload.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: "File is too large (max 100MB)"
            });
          }
          return res.status(400).json({
            error: err.message
          });
        }
        
        // Other errors
        return res.status(400).json({
          error: err.message
        });
      }
      
      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: "No file was uploaded"
        });
      }
      
      // Return the file information
      const fileUrl = `/uploads/games/${req.file.filename}`;
      
      console.log(`✓ Game file uploaded: ${req.file.filename} (${fileType}, ${req.file.size} bytes)`);
      
      return res.status(200).json({
        filePath: fileUrl,
        fileName: req.file.filename,
        fileSize: req.file.size,
        fileType: fileType,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname
      });
    });
  });
}