import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { imageProcessingService, ProcessedImage } from '../services/image-processing';

// Extend Express Request type to include processed images
declare global {
  namespace Express {
    interface Request {
      processedImages?: ProcessedImage[];
    }
  }
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Middleware to automatically process uploaded images
 */
export const processUploadedImages = async (
  req: Request,
  res: any,
  next: any
) => {
  try {
    if (!req.files && !req.file) {
      return next();
    }

    // Handle both single and multiple file uploads
    const files = req.files ? 
      (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : 
      [req.file];

    const validFiles = files.filter(file => file != null) as Express.Multer.File[];

    if (validFiles.length === 0) {
      return next();
    }

    console.log(`Processing ${validFiles.length} uploaded images...`);

    // Process all uploaded images
    const processedImages: ProcessedImage[] = [];
    
    for (const file of validFiles) {
      try {
        const processed = await imageProcessingService.processImage(file.path, {
          quality: 85,
          maxWidth: 1920,
          maxHeight: 1080,
          generateAltText: true,
        });

        processedImages.push(processed);
        
        // Clean up temporary file
        await imageProcessingService.cleanupOriginalFile(file.path);
        
        console.log(`✓ Processed ${file.originalname}: ${processed.compressionRatio}% size reduction`);
        console.log(`✓ Generated alt text: "${processed.altText}"`);
      } catch (error) {
        console.error(`Failed to process ${file.originalname}:`, error);
      }
    }

    // Attach processed images to request for use in route handlers
    req.processedImages = processedImages;
    
    next();
  } catch (error) {
    console.error('Error in image processing middleware:', error);
    res.status(500).json({ 
      error: 'Failed to process uploaded images',
      details: (error as Error).message 
    });
  }
};

/**
 * Middleware to handle image upload errors
 */
export const handleImageUploadErrors = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image size must be less than 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum number of files exceeded'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
    });
  }

  next(error);
};