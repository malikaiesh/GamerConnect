import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { createSeoSchemaGenerator } from "../services/seoSchemaGenerator";
import { insertSeoSchemaSchema, insertSeoSchemaTemplateSchema } from "@shared/schema";
import { z } from "zod";

export function registerSeoSchemaRoutes(app: express.Express) {
  // Get all SEO schemas with pagination and filtering
  app.get("/api/admin/seo-schemas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const contentType = req.query.contentType as string;

      const result = await storage.getAllSeoSchemas({ page, limit, contentType });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching SEO schemas:", error);
      res.status(500).json({ error: "Failed to fetch SEO schemas" });
    }
  });

  // Get SEO schema by ID
  app.get("/api/admin/seo-schemas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = await storage.getSeoSchemaById(id);
      
      if (!schema) {
        return res.status(404).json({ error: "SEO schema not found" });
      }
      
      res.json(schema);
    } catch (error) {
      console.error("Error fetching SEO schema:", error);
      res.status(500).json({ error: "Failed to fetch SEO schema" });
    }
  });

  // Get SEO schemas for specific content
  app.get("/api/seo-schemas/content/:contentType/:contentId", async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const schemas = await storage.getSeoSchemasByContent(contentType, parseInt(contentId));
      
      res.json(schemas);
    } catch (error) {
      console.error("Error fetching content schemas:", error);
      res.status(500).json({ error: "Failed to fetch content schemas" });
    }
  });

  // Create new SEO schema
  app.post("/api/admin/seo-schemas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertSeoSchemaSchema.parse({
        ...req.body,
        createdBy: req.user?.id
      });

      const schema = await storage.createSeoSchema(validatedData);
      res.status(201).json(schema);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating SEO schema:", error);
      res.status(500).json({ error: "Failed to create SEO schema" });
    }
  });

  // Update SEO schema
  app.put("/api/admin/seo-schemas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        updatedBy: req.user?.id
      };

      const schema = await storage.updateSeoSchema(id, updateData);
      
      if (!schema) {
        return res.status(404).json({ error: "SEO schema not found" });
      }
      
      res.json(schema);
    } catch (error) {
      console.error("Error updating SEO schema:", error);
      res.status(500).json({ error: "Failed to update SEO schema" });
    }
  });

  // Delete SEO schema
  app.delete("/api/admin/seo-schemas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSeoSchema(id);
      
      if (!success) {
        return res.status(404).json({ error: "SEO schema not found" });
      }
      
      res.json({ message: "SEO schema deleted successfully" });
    } catch (error) {
      console.error("Error deleting SEO schema:", error);
      res.status(500).json({ error: "Failed to delete SEO schema" });
    }
  });

  // Auto-generate schema for content
  app.post("/api/admin/seo-schemas/auto-generate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { contentType, contentId } = req.body;
      
      if (!contentType || !contentId) {
        return res.status(400).json({ error: "contentType and contentId are required" });
      }

      const generator = await createSeoSchemaGenerator();
      const schema = await generator.autoGenerateAndSave(
        contentType,
        parseInt(contentId),
        req.user?.id || 1
      );

      res.status(201).json(schema);
    } catch (error) {
      console.error("Error auto-generating SEO schema:", error);
      res.status(500).json({ error: "Failed to auto-generate SEO schema" });
    }
  });

  // Regenerate schema for existing content
  app.post("/api/admin/seo-schemas/:id/regenerate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSchema = await storage.getSeoSchemaById(id);
      
      if (!existingSchema || !existingSchema.contentId) {
        return res.status(404).json({ error: "SEO schema not found or no content associated" });
      }

      const generator = await createSeoSchemaGenerator();
      const newSchemaData = await generator.generateSchema(
        existingSchema.contentType,
        existingSchema.contentId
      );

      const updatedSchema = await storage.updateSeoSchema(id, {
        schemaData: newSchemaData,
        updatedBy: req.user?.id,
        lastValidated: new Date()
      });

      res.json(updatedSchema);
    } catch (error) {
      console.error("Error regenerating SEO schema:", error);
      res.status(500).json({ error: "Failed to regenerate SEO schema" });
    }
  });

  // Get schemas by content type and ID (public endpoint for frontend)
  app.get("/api/seo-schemas/content/:contentType/:contentId", async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const id = parseInt(contentId);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid content ID" });
      }

      const schemas = await storage.getSeoSchemasByContent(
        contentType as any,
        id
      );

      // Only return active schemas for public consumption
      const activeSchemas = schemas.filter(schema => schema.isActive);
      
      res.json(activeSchemas);
    } catch (error) {
      console.error("Error fetching schemas by content:", error);
      res.status(500).json({ error: "Failed to fetch schemas" });
    }
  });

  // Get global schemas (organization, website, etc.)
  app.get("/api/seo-schemas/global", async (req, res) => {
    try {
      const schemas = await storage.getSeoSchemasByContent('global', null);
      
      // Only return active schemas for public consumption
      const activeSchemas = schemas.filter(schema => schema.isActive);
      
      res.json(activeSchemas);
    } catch (error) {
      console.error("Error fetching global schemas:", error);
      res.status(500).json({ error: "Failed to fetch global schemas" });
    }
  });

  // Bulk auto-generate schemas for all content of a type
  app.post("/api/admin/seo-schemas/bulk-generate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { contentType } = req.body;
      
      if (!contentType) {
        return res.status(400).json({ error: "contentType is required" });
      }

      const generator = await createSeoSchemaGenerator();
      const results: any[] = [];
      let contentIds: number[] = [];

      // Get all content IDs based on type
      switch (contentType) {
        case 'game':
          const games = await storage.getGames();
          contentIds = games.map((g: any) => g.id);
          break;
        case 'blog_post':
          const posts = await storage.getBlogPosts();
          contentIds = posts.map((p: any) => p.id);
          break;
        case 'page':
          const pages = await storage.getStaticPages();
          contentIds = pages.map((p: any) => p.id);
          break;
        case 'category':
          const categories = await storage.getBlogCategories();
          contentIds = categories.map((c: any) => c.id);
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }

      // Generate schemas for each content item
      for (const contentId of contentIds) {
        try {
          // Check if schema already exists
          const existing = await storage.getSeoSchemasByContent(contentType, contentId);
          if (existing.length === 0) {
            const schema = await generator.autoGenerateAndSave(
              contentType as any,
              contentId,
              req.user?.id || 1
            );
            results.push({ contentId, status: 'created', schema });
          } else {
            results.push({ contentId, status: 'exists', schema: existing[0] });
          }
        } catch (error) {
          console.error(`Error generating schema for ${contentType} ${contentId}:`, error);
          results.push({ contentId, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      res.json({
        message: `Bulk generation completed for ${contentType}`,
        results,
        summary: {
          total: contentIds.length,
          created: results.filter(r => r.status === 'created').length,
          existing: results.filter(r => r.status === 'exists').length,
          errors: results.filter(r => r.status === 'error').length
        }
      });
    } catch (error) {
      console.error("Error in bulk schema generation:", error);
      res.status(500).json({ error: "Failed to bulk generate schemas" });
    }
  });

  // Get schema templates
  app.get("/api/admin/seo-schema-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await storage.getSeoSchemaTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching SEO schema templates:", error);
      res.status(500).json({ error: "Failed to fetch SEO schema templates" });
    }
  });

  // Create schema template
  app.post("/api/admin/seo-schema-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertSeoSchemaTemplateSchema.parse({
        ...req.body,
        createdBy: req.user?.id
      });

      const template = await storage.createSeoSchemaTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating SEO schema template:", error);
      res.status(500).json({ error: "Failed to create SEO schema template" });
    }
  });

  // Validate schema markup
  app.post("/api/admin/seo-schemas/validate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { schemaData } = req.body;
      
      if (!schemaData) {
        return res.status(400).json({ error: "Schema data is required" });
      }

      // Basic JSON-LD validation
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check required fields
      if (!schemaData["@context"]) {
        errors.push("Missing @context property");
      }
      if (!schemaData["@type"]) {
        errors.push("Missing @type property");
      }

      // Check for common schema.org required properties
      const schemaType = schemaData["@type"];
      switch (schemaType) {
        case "VideoGame":
          if (!schemaData.name) errors.push("VideoGame schema missing 'name' property");
          break;
        case "BlogPosting":
        case "Article":
          if (!schemaData.headline) errors.push(`${schemaType} schema missing 'headline' property`);
          if (!schemaData.author) warnings.push(`${schemaType} schema missing 'author' property`);
          break;
        case "WebPage":
          if (!schemaData.name) errors.push("WebPage schema missing 'name' property");
          break;
      }

      res.json({
        isValid: errors.length === 0,
        errors,
        warnings,
        schemaType
      });
    } catch (error) {
      console.error("Error validating schema:", error);
      res.status(500).json({ error: "Failed to validate schema" });
    }
  });
}