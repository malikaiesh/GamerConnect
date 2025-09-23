import { Router, Request, Response } from "express";
import { eq, desc, and, ilike, count, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@db";
import { gifts, insertGiftSchema, type InsertGift, type Gift } from "@shared/schema";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { ObjectStorageService } from "../objectStorage";

const router = Router();

// Get all gifts (public endpoint for room interfaces)
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    const isActive = req.query.active;
    const offset = (page - 1) * limit;

    let query = db.select().from(gifts);
    const conditions = [];

    if (category && category !== 'all') {
      conditions.push(eq(gifts.category, category as any));
    }

    if (isActive !== undefined) {
      conditions.push(eq(gifts.isActive, isActive === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const giftsData = await query
      .orderBy(gifts.sortOrder, desc(gifts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(gifts);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalCount = await countQuery;

    res.json({
      gifts: giftsData,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching gifts:", error);
    res.status(500).json({ error: "Failed to fetch gifts" });
  }
});

// Admin endpoints - Get all gifts with advanced filtering
router.get("/admin", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const animation = req.query.animation as string;
    const offset = (page - 1) * limit;

    let query = db.select().from(gifts);
    const conditions = [];

    if (search) {
      conditions.push(
        sql`${gifts.name} ILIKE ${`%${search}%`} OR ${gifts.description} ILIKE ${`%${search}%`}`
      );
    }

    if (category && category !== 'all') {
      conditions.push(eq(gifts.category, category as any));
    }

    if (type && type !== 'all') {
      conditions.push(eq(gifts.type, type as any));
    }

    if (animation && animation !== 'all') {
      conditions.push(eq(gifts.animation, animation as any));
    }

    if (status) {
      if (status === 'active') {
        conditions.push(eq(gifts.isActive, true));
      } else if (status === 'inactive') {
        conditions.push(eq(gifts.isActive, false));
      } else if (status === 'limited') {
        conditions.push(eq(gifts.isLimited, true));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const giftsData = await query
      .orderBy(desc(gifts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(gifts);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalCount = await countQuery;

    // Get statistics
    const stats = await db.select({
      totalGifts: count(),
      activeGifts: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)`,
      limitedGifts: sql<number>`COUNT(CASE WHEN is_limited = true THEN 1 END)`,
      categoriesCount: sql<number>`COUNT(DISTINCT category)`
    }).from(gifts);

    res.json({
      gifts: giftsData,
      stats: stats[0],
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching admin gifts:", error);
    res.status(500).json({ error: "Failed to fetch gifts for admin" });
  }
});

// Get single gift by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid gift ID" });
    }

    const gift = await db.select().from(gifts).where(eq(gifts.id, id)).limit(1);
    if (gift.length === 0) {
      return res.status(404).json({ error: "Gift not found" });
    }

    res.json(gift[0]);
  } catch (error) {
    console.error("Error fetching gift:", error);
    res.status(500).json({ error: "Failed to fetch gift" });
  }
});

// Create new gift (admin only)
router.post("/", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const giftData = insertGiftSchema.parse(req.body);
    
    // Set default sort order if not provided
    if (!giftData.sortOrder) {
      const maxOrder = await db.select({ maxOrder: sql<number>`MAX(sort_order)` }).from(gifts);
      giftData.sortOrder = (maxOrder[0].maxOrder || 0) + 1;
    }

    const [newGift] = await db.insert(gifts).values(giftData).returning();

    res.status(201).json({
      message: "Gift created successfully",
      gift: newGift
    });
  } catch (error) {
    console.error("Error creating gift:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create gift" });
  }
});

// Update gift (admin only)
router.put("/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid gift ID" });
    }

    // Check if gift exists
    const existingGift = await db.select().from(gifts).where(eq(gifts.id, id)).limit(1);
    if (existingGift.length === 0) {
      return res.status(404).json({ error: "Gift not found" });
    }

    const updateData = insertGiftSchema.partial().parse(req.body);
    
    const [updatedGift] = await db
      .update(gifts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(gifts.id, id))
      .returning();

    res.json({
      message: "Gift updated successfully",
      gift: updatedGift
    });
  } catch (error) {
    console.error("Error updating gift:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update gift" });
  }
});

// Delete gift (admin only)
router.delete("/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid gift ID" });
    }

    // Check if gift exists
    const existingGift = await db.select().from(gifts).where(eq(gifts.id, id)).limit(1);
    if (existingGift.length === 0) {
      return res.status(404).json({ error: "Gift not found" });
    }

    await db.delete(gifts).where(eq(gifts.id, id));

    res.json({ message: "Gift deleted successfully" });
  } catch (error) {
    console.error("Error deleting gift:", error);
    res.status(500).json({ error: "Failed to delete gift" });
  }
});

// Upload gift image (admin only)
router.post("/upload-image", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error getting upload URL:", error);
    res.status(500).json({ error: "Failed to get upload URL" });
  }
});

// Process uploaded image (admin only)
router.post("/process-image", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { imageURL } = req.body;
    
    if (!imageURL) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = objectStorageService.normalizeObjectEntityPath(imageURL);

    res.json({
      message: "Image processed successfully",
      imagePath: objectPath
    });
  } catch (error) {
    console.error("Error processing uploaded image:", error);
    res.status(500).json({ error: "Failed to process uploaded image" });
  }
});

// Bulk actions (admin only)
router.post("/bulk-action", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { action, giftIds } = req.body;
    
    if (!action || !Array.isArray(giftIds) || giftIds.length === 0) {
      return res.status(400).json({ error: "Action and gift IDs are required" });
    }

    switch (action) {
      case 'activate':
        await db.update(gifts)
          .set({ isActive: true, updatedAt: new Date() })
          .where(sql`${gifts.id} = ANY(${giftIds})`);
        break;
        
      case 'deactivate':
        await db.update(gifts)
          .set({ isActive: false, updatedAt: new Date() })
          .where(sql`${gifts.id} = ANY(${giftIds})`);
        break;
        
      case 'delete':
        await db.delete(gifts).where(sql`${gifts.id} = ANY(${giftIds})`);
        break;
        
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    res.json({ 
      message: `Bulk ${action} completed successfully`,
      affectedCount: giftIds.length 
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

export default router;