import { Router } from "express";
import { db } from "@db";
import { 
  pushNotifications, 
  pushSubscribers, 
  pushCampaigns, 
  pushResponses,
  insertPushNotificationSchema,
  insertPushSubscriberSchema,
  insertPushCampaignSchema,
  insertPushResponseSchema
} from "@shared/schema";
import { eq, desc, count, sql, and, gte, lt } from "drizzle-orm";
import { isAuthenticated, isAdmin } from "../middleware";

const router = Router();

// Get all push notifications
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const notifications = await db.query.pushNotifications.findMany({
      orderBy: [desc(pushNotifications.createdAt)]
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching push notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get active push notifications
router.get("/active", async (req, res) => {
  try {
    const notifications = await db.query.pushNotifications.findMany({
      where: eq(pushNotifications.active, true),
      orderBy: [desc(pushNotifications.createdAt)]
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching active push notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single push notification
router.get("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);
    
    // Check if the ID is a valid number
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    
    const notification = await db.query.pushNotifications.findFirst({
      where: eq(pushNotifications.id, notificationId)
    });
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Error fetching push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new push notification
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertPushNotificationSchema.parse(req.body);
    const [notification] = await db.insert(pushNotifications).values(validatedData).returning();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a push notification
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPushNotificationSchema.parse(req.body);
    
    const [notification] = await db
      .update(pushNotifications)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(pushNotifications.id, parseInt(id)))
      .returning();
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Error updating push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Patch notification (partial update)
router.patch("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [notification] = await db
      .update(pushNotifications)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(pushNotifications.id, parseInt(id)))
      .returning();
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Error patching push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a push notification
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [notification] = await db
      .delete(pushNotifications)
      .where(eq(pushNotifications.id, parseInt(id)))
      .returning();
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record impression
router.post("/:id/impression", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db
      .update(pushNotifications)
      .set({
        impressionCount: sql`${pushNotifications.impressionCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(pushNotifications.id, parseInt(id)));
    
    res.status(200).json();
  } catch (error) {
    console.error("Error recording impression:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record click
router.post("/:id/click", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db
      .update(pushNotifications)
      .set({
        clickCount: sql`${pushNotifications.clickCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(pushNotifications.id, parseInt(id)));
    
    res.status(200).json();
  } catch (error) {
    console.error("Error recording click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === PUSH SUBSCRIBERS ENDPOINTS ===

// Get all subscribers
router.get("/subscribers", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const subscribers = await db.query.pushSubscribers.findMany({
      orderBy: [desc(pushSubscribers.createdAt)]
    });
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching push subscribers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get subscriber statistics
router.get("/subscribers/stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Count total subscribers
    const totalSubscribers = await db
      .select({ count: count() })
      .from(pushSubscribers);
    
    // Count active subscribers
    const activeSubscribers = await db
      .select({ count: count() })
      .from(pushSubscribers)
      .where(eq(pushSubscribers.status, 'active'));
    
    // Count by device type
    const deviceStats = await db
      .select({
        deviceType: pushSubscribers.deviceType,
        count: count()
      })
      .from(pushSubscribers)
      .groupBy(pushSubscribers.deviceType);
    
    // Count by browser
    const browserStats = await db
      .select({
        browser: pushSubscribers.browser,
        count: count()
      })
      .from(pushSubscribers)
      .groupBy(pushSubscribers.browser);
    
    // Count by country
    const countryStats = await db
      .select({
        country: pushSubscribers.country,
        count: count()
      })
      .from(pushSubscribers)
      .groupBy(pushSubscribers.country);
    
    // Format stats for frontend
    const stats = {
      total: totalSubscribers[0]?.count || 0,
      active: activeSubscribers[0]?.count || 0,
      desktop: deviceStats.find(s => s.deviceType === 'desktop')?.count || 0,
      mobile: deviceStats.find(s => s.deviceType === 'mobile')?.count || 0,
      tablet: deviceStats.find(s => s.deviceType === 'tablet')?.count || 0,
      browser: browserStats.reduce((acc, stat) => {
        acc[stat.browser || 'unknown'] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>),
      country: countryStats.reduce((acc, stat) => {
        acc[stat.country || 'unknown'] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>)
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching subscriber stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new push subscriber
router.post("/subscribers", async (req, res) => {
  try {
    const validatedData = insertPushSubscriberSchema.parse(req.body);
    
    // Check if subscriber already exists
    const existingSubscriber = await db.query.pushSubscribers.findFirst({
      where: eq(pushSubscribers.endpoint, validatedData.endpoint)
    });
    
    if (existingSubscriber) {
      // Update subscriber information
      const [subscriber] = await db
        .update(pushSubscribers)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(pushSubscribers.endpoint, validatedData.endpoint))
        .returning();
      
      return res.json(subscriber);
    }
    
    // Create new subscriber
    const [subscriber] = await db.insert(pushSubscribers).values(validatedData).returning();
    res.status(201).json(subscriber);
  } catch (error) {
    console.error("Error creating push subscriber:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bulk update web push preferences
router.post("/subscribers/web-push-preferences", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { ids, webPushEnabled } = req.body;
    
    if (!Array.isArray(ids) || typeof webPushEnabled !== 'boolean') {
      return res.status(400).json({ error: "Invalid request format. ids must be an array and webPushEnabled must be a boolean value" });
    }
    
    const numericIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (numericIds.length === 0) {
      return res.status(400).json({ error: "No valid subscriber IDs provided" });
    }
    
    const updatedSubscribers = await db
      .update(pushSubscribers)
      .set({ 
        webPushEnabled,
        lastInteracted: new Date(),
        updatedAt: new Date()
      })
      .where(sql`${pushSubscribers.id} IN (${numericIds.join(',')})`)
      .returning();
    
    res.json({ 
      message: `Web push preferences updated for ${updatedSubscribers.length} subscribers`,
      updatedCount: updatedSubscribers.length
    });
  } catch (error) {
    console.error("Error bulk updating web push preferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update subscriber web push preference
router.patch("/subscribers/:id/web-push-preference", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { webPushEnabled } = req.body;
    
    if (typeof webPushEnabled !== 'boolean') {
      return res.status(400).json({ error: "webPushEnabled must be a boolean value" });
    }
    
    const [updatedSubscriber] = await db
      .update(pushSubscribers)
      .set({ 
        webPushEnabled,
        // Also update the lastInteracted field to track when the preference was changed
        lastInteracted: new Date(),
        updatedAt: new Date()
      })
      .where(eq(pushSubscribers.id, parseInt(id)))
      .returning();
    
    if (!updatedSubscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }
    
    res.json({ message: "Web push preference updated successfully", subscriber: updatedSubscriber });
  } catch (error) {
    console.error("Error updating web push preference:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a push subscriber
router.delete("/subscribers/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [subscriber] = await db
      .delete(pushSubscribers)
      .where(eq(pushSubscribers.id, parseInt(id)))
      .returning();
    
    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }
    
    res.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Error deleting push subscriber:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === PUSH CAMPAIGNS ENDPOINTS ===

// Get all campaigns
router.get("/campaigns", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const campaigns = await db.query.pushCampaigns.findMany({
      orderBy: [desc(pushCampaigns.createdAt)]
    });
    res.json(campaigns || []);
  } catch (error) {
    console.error("Error fetching push campaigns:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single campaign
router.get("/campaigns/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignId = parseInt(id);
    
    // Check if the ID is a valid number
    if (isNaN(campaignId)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }
    
    const campaign = await db.query.pushCampaigns.findFirst({
      where: eq(pushCampaigns.id, campaignId)
    });
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error("Error fetching push campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new campaign
router.post("/campaigns", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertPushCampaignSchema.parse(req.body);
    const [campaign] = await db.insert(pushCampaigns).values(validatedData).returning();
    res.status(201).json(campaign);
  } catch (error) {
    console.error("Error creating push campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a campaign
router.put("/campaigns/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPushCampaignSchema.parse(req.body);
    
    const [campaign] = await db
      .update(pushCampaigns)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(pushCampaigns.id, parseInt(id)))
      .returning();
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error("Error updating push campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a campaign
router.delete("/campaigns/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [campaign] = await db
      .delete(pushCampaigns)
      .where(eq(pushCampaigns.id, parseInt(id)))
      .returning();
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting push campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === PUSH ANALYTICS ENDPOINTS ===

// Get analytics data
router.get("/analytics", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get subscriber stats
    const totalSubscribers = await db
      .select({ count: count() })
      .from(pushSubscribers);
    
    const activeSubscribers = await db
      .select({ count: count() })
      .from(pushSubscribers)
      .where(eq(pushSubscribers.status, 'active'));
    
    // Get new subscribers from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newTodaySubscribers = await db
      .select({ count: count() })
      .from(pushSubscribers)
      .where(gte(pushSubscribers.createdAt, today));
    
    // Get new subscribers from this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const newThisWeekSubscribers = await db
      .select({ count: count() })
      .from(pushSubscribers)
      .where(gte(pushSubscribers.createdAt, weekAgo));
    
    // Get device stats
    const deviceStats = await db
      .select({
        deviceType: pushSubscribers.deviceType,
        count: count()
      })
      .from(pushSubscribers)
      .groupBy(pushSubscribers.deviceType);
    
    // Get browser stats
    const browserStats = await db
      .select({
        browser: pushSubscribers.browser,
        count: count()
      })
      .from(pushSubscribers)
      .groupBy(pushSubscribers.browser);
    
    // Get country stats
    const countryStats = await db
      .select({
        country: pushSubscribers.country,
        count: count()
      })
      .from(pushSubscribers)
      .groupBy(pushSubscribers.country);
    
    // Get campaign stats
    const campaignStats = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN ${pushCampaigns.status} != 'draft' THEN 1 ELSE 0 END)`,
        sent: sql<number>`SUM(${pushCampaigns.sentCount})`,
        clicks: sql<number>`SUM(${pushCampaigns.clickCount})`
      })
      .from(pushCampaigns);
    
    // Format stats for frontend
    const analytics = {
      subscribers: {
        total: totalSubscribers[0]?.count || 0,
        active: activeSubscribers[0]?.count || 0,
        newToday: newTodaySubscribers[0]?.count || 0,
        newThisWeek: newThisWeekSubscribers[0]?.count || 0,
        byDevice: deviceStats.map(stat => ({
          name: stat.deviceType || 'Unknown',
          value: Number(stat.count)
        })),
        byBrowser: browserStats.map(stat => ({
          name: stat.browser || 'Unknown',
          value: Number(stat.count)
        })),
        byCountry: countryStats.map(stat => ({
          name: stat.country || 'Unknown',
          value: Number(stat.count)
        })),
        growth: [] // TODO: Add subscriber growth stats over time
      },
      campaigns: {
        total: campaignStats[0]?.total || 0,
        active: campaignStats[0]?.active || 0,
        sent: campaignStats[0]?.sent || 0,
        clicks: campaignStats[0]?.clicks || 0,
        ctr: campaignStats[0]?.sent ? (campaignStats[0].clicks / campaignStats[0].sent) * 100 : 0,
        performance: [], // TODO: Add campaign performance stats
        byDay: [] // TODO: Add campaign daily stats
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching push analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;