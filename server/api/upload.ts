import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directories if they don't exist
const uploadDir = path.join(process.cwd(), "uploads");
const gameDir = path.join(uploadDir, "games");
const imageDir = path.join(uploadDir, "images");

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Created uploads directory");
  }
  
  if (!fs.existsSync(gameDir)) {
    fs.mkdirSync(gameDir);
    console.log("Created games upload directory");
  }
  
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
    console.log("Created images upload directory");
  }
  
  console.log("Upload directories created successfully");
} catch (error) {
  console.error("Error creating upload directories:", error);
}

// Configure storage for game files
const gameStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const gameType = req.query.type as string || "html5"; // Default to html5 if not specified
    const typeDir = path.join(gameDir, gameType);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp and original extension
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

// Configure storage for image files
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp and original extension
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

// Set file size limits and create upload middleware
const gameUpload = multer({
  storage: gameStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max game file size
  },
  fileFilter: (req, file, cb) => {
    const gameType = req.query.type as string || "html5";
    
    // Check for allowed file types based on game type
    if (gameType === "html5" || gameType === "unity") {
      // Allow zip, rar, 7z files for HTML5 and Unity games
      if (file.mimetype === "application/zip" || 
          file.mimetype === "application/x-rar-compressed" || 
          file.mimetype === "application/x-7z-compressed" ||
          path.extname(file.originalname).toLowerCase() === ".zip" || 
          path.extname(file.originalname).toLowerCase() === ".rar" || 
          path.extname(file.originalname).toLowerCase() === ".7z") {
        cb(null, true);
      } else {
        cb(new Error("Only zip, rar, or 7z files are allowed for HTML5 and Unity games"), false);
      }
    } else if (gameType === "apk") {
      // Allow APK files for Android games
      if (file.mimetype === "application/vnd.android.package-archive" || 
          path.extname(file.originalname).toLowerCase() === ".apk") {
        cb(null, true);
      } else {
        cb(new Error("Only APK files are allowed for Android games"), false);
      }
    } else if (gameType === "ios") {
      // Allow IPA files for iOS games
      if (path.extname(file.originalname).toLowerCase() === ".ipa") {
        cb(null, true);
      } else {
        cb(new Error("Only IPA files are allowed for iOS games"), false);
      }
    } else {
      cb(new Error("Invalid game type specified"), false);
    }
  }
});

// Image upload middleware
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max image file size
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

// Register upload routes
export function registerUploadRoutes(app: Express) {
  // Game file upload route
  app.post("/api/upload/game", isAuthenticated, isAdmin, (req: Request, res: Response) => {
    const upload = gameUpload.single("file");
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const gameType = req.query.type as string || "html5";
      
      // Generate file path relative to uploads directory
      const filePath = `/games/${gameType}/${req.file.filename}`;
      const fileSize = req.file.size;
      
      return res.status(200).json({
        success: true,
        message: "Game file uploaded successfully",
        filePath: filePath,
        fileSize: fileSize,
        originalName: req.file.originalname,
        fileType: gameType
      });
    });
  });
  
  // Image upload route
  app.post("/api/upload/image", isAuthenticated, isAdmin, (req: Request, res: Response) => {
    const upload = imageUpload.single("file");
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Generate file path relative to uploads directory
      const imagePath = `/images/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imagePath: imagePath,
        originalName: req.file.originalname
      });
    });
  });
  
  // Health check route for uploads
  app.get("/api/upload/healthcheck", (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: "Upload system is healthy",
      uploadDirectories: {
        main: fs.existsSync(uploadDir),
        games: fs.existsSync(gameDir),
        images: fs.existsSync(imageDir)
      }
    });
  });
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ error: "Admin access required" });
}