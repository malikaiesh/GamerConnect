import { Express, Request, Response } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// Configure storage directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const GAME_FILES_DIR = path.join(UPLOAD_DIR, 'games');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images');

// Ensure upload directories exist
async function ensureDirectoriesExist() {
  try {
    await fs.mkdir(GAME_FILES_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log('Upload directories created successfully');
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}
ensureDirectoriesExist();

// Create custom storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file type
    let dest = IMAGES_DIR;
    if (req.path.includes('/upload/game')) {
      dest = GAME_FILES_DIR;
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${fileExtension}`);
  },
});

// Set up multer with file filtering
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Check if this is an image upload
    if (req.path.includes('/upload/image')) {
      // Allow only image files
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed for image uploads'));
      }
    } 
    // Game file uploads have specific requirements based on type
    else if (req.path.includes('/upload/game')) {
      const gameType = req.query.type || '';
      
      if (gameType === 'html5') {
        // For HTML5 games, only accept zip files
        if (file.mimetype !== 'application/zip' && 
            file.mimetype !== 'application/x-zip-compressed') {
          return cb(new Error('HTML5 games must be uploaded as ZIP files'));
        }
      } else if (gameType === 'apk') {
        // For APK games, only accept APK files
        if (file.mimetype !== 'application/vnd.android.package-archive' && 
            !file.originalname.endsWith('.apk')) {
          return cb(new Error('Android games must be uploaded as APK files'));
        }
      } else if (gameType === 'ios') {
        // For iOS games, only accept IPA files
        if (!file.originalname.endsWith('.ipa')) {
          return cb(new Error('iOS games must be uploaded as IPA files'));
        }
      } else if (gameType === 'unity') {
        // For Unity games, accept WebGL builds (zip)
        if (file.mimetype !== 'application/zip' && 
            file.mimetype !== 'application/x-zip-compressed') {
          return cb(new Error('Unity WebGL games must be uploaded as ZIP files'));
        }
      } else {
        return cb(new Error('Invalid game type specified'));
      }
    }
    // If all checks pass, accept the file
    cb(null, true);
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
});

// Helper function to get file path relative to uploads directory
function getRelativePath(absolutePath: string): string {
  return absolutePath.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
}

export function registerUploadRoutes(app: Express) {
  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
  };

  // Endpoint for uploading game files
  app.post('/api/upload/game', isAdmin, (req: Request, res: Response) => {
    const gameType = req.query.type as string;
    if (!gameType || !['html5', 'apk', 'ios', 'unity'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid game type. Must be one of: html5, apk, ios, unity' });
    }

    const uploadMiddleware = upload.single('file');
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: err.message || 'Error uploading file' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the path and file information
      const relativePath = getRelativePath(req.file.path);
      res.status(200).json({
        filePath: relativePath,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: gameType,
      });
    });
  });

  // Endpoint for uploading image files
  app.post('/api/upload/image', isAdmin, (req: Request, res: Response) => {
    const uploadMiddleware = upload.single('file');
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: err.message || 'Error uploading image' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Return the path and file information
      const relativePath = getRelativePath(req.file.path);
      res.status(200).json({
        imagePath: relativePath,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    });
  });

  // Serve uploaded files - this allows accessing them via URL
  app.use('/uploads', (req, res, next) => {
    // This middleware handles authentication for game files if needed
    // For now, we'll make all uploads publicly accessible
    next();
  }, express.static(UPLOAD_DIR));
}