import express from "express";
import { storage } from "../storage";
import { insertSitemapSchema } from "@shared/schema";
import { isAuthenticated, isAdmin } from "../middleware";

const router = express.Router();

// Get all sitemaps
router.get("/", async (req, res) => {
  try {
    const sitemaps = await storage.getSitemaps();
    res.json(sitemaps);
  } catch (error) {
    console.error("Error getting sitemaps:", error);
    res.status(500).json({ error: "Failed to get sitemaps" });
  }
});

// Get a sitemap by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid sitemap ID" });
    }
    
    const sitemap = await storage.getSitemapById(id);
    if (!sitemap) {
      return res.status(404).json({ error: "Sitemap not found" });
    }
    
    res.json(sitemap);
  } catch (error) {
    console.error(`Error getting sitemap with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to get sitemap" });
  }
});

// Get a sitemap by type
router.get("/type/:type", async (req, res) => {
  try {
    const type = req.params.type;
    if (!["main", "games", "blog", "pages"].includes(type)) {
      return res.status(400).json({ error: "Invalid sitemap type" });
    }
    
    const sitemap = await storage.getSitemapByType(type);
    if (!sitemap) {
      return res.status(404).json({ error: "Sitemap not found" });
    }
    
    res.json(sitemap);
  } catch (error) {
    console.error(`Error getting sitemap with type ${req.params.type}:`, error);
    res.status(500).json({ error: "Failed to get sitemap by type" });
  }
});

// Update a sitemap - requires admin auth
router.patch("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid sitemap ID" });
    }
    
    const sitemap = await storage.getSitemapById(id);
    if (!sitemap) {
      return res.status(404).json({ error: "Sitemap not found" });
    }
    
    const updatedSitemap = await storage.updateSitemap(id, req.body);
    res.json(updatedSitemap);
  } catch (error) {
    console.error(`Error updating sitemap with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update sitemap" });
  }
});

// Generate a sitemap by type - requires admin auth
router.post("/generate/:type", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    if (!["main", "games", "blog", "pages"].includes(type)) {
      return res.status(400).json({ error: "Invalid sitemap type" });
    }
    
    const sitemap = await storage.generateSitemap(type);
    if (!sitemap) {
      return res.status(404).json({ error: "Failed to generate sitemap" });
    }
    
    res.json(sitemap);
  } catch (error) {
    console.error(`Error generating sitemap with type ${req.params.type}:`, error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
});

// Generate all sitemaps - requires admin auth
router.post("/generate-all", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const sitemaps = await storage.generateAllSitemaps();
    res.json(sitemaps);
  } catch (error) {
    console.error("Error generating all sitemaps:", error);
    res.status(500).json({ error: "Failed to generate all sitemaps" });
  }
});

export default router;