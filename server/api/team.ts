import express, { type Express } from 'express';
import { db } from "@db";
import { teamMembers, insertTeamMemberSchema, type TeamMember, type InsertTeamMember } from '@shared/schema';
import { eq, asc } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

const router = express.Router();

// Configure multer for team member image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "team");
    
    // Create the team uploads directory if it doesn't exist
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
    
    cb(null, `team-${safeName}-${uniqueId}${fileExt}`);
  }
});

// Define allowed file types for team member images
const imageFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (JPEG, PNG, GIF, WEBP)'));
  }
};

// Setup upload middleware for team member images
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

export function registerTeamRoutes(app: Express) {
  app.use('/api/team', router);
}

// Get all active team members (public endpoint)
router.get('/', async (req, res) => {
  try {
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.status, 'active'))
      .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.createdAt));

    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get all team members (admin only)
router.get('/all', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const members = await db
      .select()
      .from(teamMembers)
      .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.createdAt));

    res.json(members);
  } catch (error) {
    console.error('Error fetching all team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get single team member by ID (admin only)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid team member ID' });
    }

    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// Create new team member (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertTeamMemberSchema.parse(req.body);

    const [newMember] = await db
      .insert(teamMembers)
      .values(validatedData)
      .returning();

    res.status(201).json(newMember);
  } catch (error: any) {
    console.error('Error creating team member:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid team member ID' });
    }

    const validatedData = insertTeamMemberSchema.partial().parse(req.body);

    const [updatedMember] = await db
      .update(teamMembers)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(teamMembers.id, id))
      .returning();

    if (!updatedMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(updatedMember);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Update team member order (admin only)
router.patch('/reorder', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { teamMemberIds } = req.body;
    
    if (!Array.isArray(teamMemberIds)) {
      return res.status(400).json({ error: 'teamMemberIds must be an array' });
    }

    // Update display order for each team member
    const updatePromises = teamMemberIds.map((id, index) => 
      db
        .update(teamMembers)
        .set({ displayOrder: index })
        .where(eq(teamMembers.id, id))
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Team member order updated successfully' });
  } catch (error) {
    console.error('Error reordering team members:', error);
    res.status(500).json({ error: 'Failed to update team member order' });
  }
});

// Delete team member (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid team member ID' });
    }

    const [deletedMember] = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning();

    if (!deletedMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// Upload team member image (admin only)
router.post("/upload-image", isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Return the path to the uploaded file
    const imagePath = `/uploads/team/${req.file.filename}`;
    
    res.json({
      message: "Image uploaded successfully",
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Error uploading team member image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;