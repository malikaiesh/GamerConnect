import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

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

// Define allowed file types
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (JPEG, PNG, GIF, WEBP)'));
  }
};

// Setup upload middleware
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
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
    upload.single('file')(req, res, (err) => {
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
      
      // File uploaded successfully, return location to TinyMCE
      const fileUrl = `/uploads/${req.file.filename}`;
      
      return res.status(200).json({
        location: fileUrl,
      });
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
    upload.single('file')(req, res, (err) => {
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
      
      // File uploaded successfully, return the URL
      const fileUrl = `/uploads/${req.file.filename}`;
      
      return res.status(200).json({
        location: fileUrl,
      });
    });
  });
}