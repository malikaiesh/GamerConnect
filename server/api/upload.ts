import { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Ensure unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP image files are allowed.') as any);
    }
  }
}).single('file');

export function registerUploadRoutes(app: Express) {
  // Route to handle file uploads for TinyMCE
  app.post('/api/upload', (req: Request, res: Response) => {
    upload(req, res, function (err) {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          location: '',
          error: {
            message: err.message
          }
        });
      }
      
      // If file was uploaded successfully
      if (req.file) {
        // Generate URL for the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`;
        // Return response in format expected by TinyMCE
        return res.status(200).json({
          location: fileUrl
        });
      }
      
      // Handle case when no file was uploaded
      return res.status(400).json({
        location: '',
        error: {
          message: 'No file was uploaded'
        }
      });
    });
  });
}