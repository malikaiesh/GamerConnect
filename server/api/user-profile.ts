import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { db } from "@db";
import { users, rooms, roomUsers, roomMessages } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { z } from "zod";

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Get user profile
router.get("/profile", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user statistics
    const [roomsCreated] = await db
      .select({ count: count() })
      .from(rooms)
      .where(eq(rooms.ownerId, userId));

    const [messagesCount] = await db
      .select({ count: count() })
      .from(roomMessages)
      .where(eq(roomMessages.userId, userId));

    const profile = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      location: typeof user.location === 'object' ? user.location?.city : user.location,
      website: null, // Add website field to schema later
      profileImage: user.profilePicture,
      joinedAt: user.createdAt,
      totalRooms: roomsCreated.count,
      totalMessages: messagesCount.count,
    };

    res.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.patch("/profile", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const validatedData = profileUpdateSchema.parse(req.body);

    const [updatedUser] = await db
      .update(users)
      .set({
        displayName: validatedData.displayName,
        bio: validatedData.bio || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Upload avatar
router.post("/avatar", isAuthenticated, upload.single('avatar'), async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate filename
    const filename = `avatar-${userId}-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Process and resize image
    await sharp(req.file.buffer)
      .resize(200, 200, { 
        fit: 'cover', 
        position: 'center' 
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user's profile image
    await db
      .update(users)
      .set({ 
        profilePicture: avatarUrl,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({ avatarUrl });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// Change password
router.post("/change-password", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const validatedData = passwordChangeSchema.parse(req.body);

    // Get current user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await db
      .update(users)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;