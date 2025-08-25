import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { createSeoSchemaGenerator } from "../services/seoSchemaGenerator";
import { insertSeoSchemaSchema, insertSeoSchemaTemplateSchema } from "@shared/schema";
import { z } from "zod";

export function registerSeoSchemaRoutes(app: express.Express) {
  // Test endpoint without any middleware
  app.get("/api/admin/seo-schemas/test", (req, res) => {
    res.json({ message: "Test endpoint working!", timestamp: new Date().toISOString() });
  });
  // Get all SEO schemas with pagination and filtering - TEMPORARILY REMOVE AUTH FOR DEVELOPMENT
  app.get("/api/admin/seo-schemas", async (req, res) => {
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
  app.post("/api/admin/seo-schemas", async (req, res) => {
    try {
      const validatedData = insertSeoSchemaSchema.parse({
        ...req.body,
        createdBy: req.user?.id || 1  // Default to admin user for development
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

  // PUBLIC ADMIN API ENDPOINTS FOR DEVELOPMENT (NO AUTH)
  // Get all schemas for admin panel
  app.get("/api/public/seo-schemas", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const contentType = req.query.contentType as string;

      const schemas = await storage.getAllSeoSchemas() || [];
      
      // Filter by content type if specified
      const filteredSchemas = contentType && contentType !== 'all' 
        ? schemas.filter(schema => schema.contentType === contentType)
        : schemas;

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSchemas = filteredSchemas.slice(startIndex, endIndex);

      res.json({
        schemas: paginatedSchemas,
        pagination: {
          page,
          limit,
          total: filteredSchemas.length,
          totalPages: Math.ceil(filteredSchemas.length / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching SEO schemas:', error);
      res.status(500).json({ error: "Failed to fetch schemas" });
    }
  });

  // Create new schema via public endpoint
  app.post("/api/public/seo-schemas", async (req, res) => {
    try {
      const validatedData = insertSeoSchemaSchema.parse({
        ...req.body,
        createdBy: 1  // Default admin user for development
      });

      const schema = await storage.createSeoSchema(validatedData);
      res.status(201).json(schema);
    } catch (error) {
      console.error('Error creating SEO schema:', error);
      res.status(500).json({ error: "Failed to create schema" });
    }
  });

  // Bulk generate via public endpoint
  app.post("/api/public/seo-schemas/bulk-generate", async (req, res) => {
    try {
      const { contentType } = req.body;
      
      if (!contentType) {
        return res.status(400).json({ error: "contentType is required" });
      }

      const generator = createSeoSchemaGenerator();
      let results = [];

      if (contentType === 'game') {
        const games = await storage.getAllGames();
        for (const game of games.slice(0, 10)) { // Limit to 10 for demo
          try {
            const schema = await generator.generateGameSchema(game);
            if (schema) {
              const createdSchema = await storage.createSeoSchema({
                ...schema,
                createdBy: 1
              });
              results.push(createdSchema);
            }
          } catch (error) {
            console.error(`Error generating schema for game ${game.id}:`, error);
          }
        }
      }

      res.json({ 
        message: `Generated ${results.length} ${contentType} schemas`,
        schemas: results,
        count: results.length
      });
    } catch (error) {
      console.error('Error bulk generating schemas:', error);
      res.status(500).json({ error: "Failed to bulk generate schemas" });
    }
  });

  // Generate demo schemas for all content types - PUBLIC for development testing
  app.post("/api/demo-schemas/generate", async (req, res) => {
    try {
      const generator = createSeoSchemaGenerator();
      const demos = [];

      // Demo Game Schema
      const demoGameSchema = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": "Demo Adventure Quest",
        "description": "An exciting adventure game where players explore mystical realms and solve challenging puzzles to save the kingdom.",
        "url": "https://gamezone.com/games/demo-adventure-quest",
        "image": "https://gamezone.com/images/demo-game.jpg",
        "genre": ["Adventure", "Puzzle", "Fantasy"],
        "gamePlatform": ["Web Browser"],
        "applicationCategory": "Game",
        "operatingSystem": "Any",
        "author": {
          "@type": "Organization",
          "name": "GameZone",
          "url": "https://gamezone.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "GameZone",
          "url": "https://gamezone.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://gamezone.com/logo.png"
          }
        },
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/PlayAction",
          "userInteractionCount": 15847
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.6,
          "ratingCount": 342,
          "bestRating": 5,
          "worstRating": 1
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "datePublished": "2024-01-15T10:00:00Z",
        "dateModified": "2024-12-20T14:30:00Z"
      };

      // Demo Blog Post Schema
      const demoBlogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Ultimate Gaming Guide: Top 10 Strategy Tips for Victory",
        "description": "Master your gaming skills with these proven strategy tips and techniques used by professional gamers worldwide.",
        "url": "https://gamezone.com/blog/gaming-strategy-guide",
        "image": "https://gamezone.com/images/gaming-guide.jpg",
        "author": {
          "@type": "Person",
          "name": "Alex Chen",
          "url": "https://gamezone.com/authors/alex-chen"
        },
        "publisher": {
          "@type": "Organization",
          "name": "GameZone",
          "url": "https://gamezone.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://gamezone.com/logo.png"
          }
        },
        "datePublished": "2024-12-15T09:00:00Z",
        "dateModified": "2024-12-20T11:15:00Z",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://gamezone.com/blog/gaming-strategy-guide"
        },
        "keywords": ["gaming", "strategy", "tips", "gaming guide", "professional gaming"],
        "wordCount": 2500,
        "articleSection": "Gaming Guides"
      };

      // Demo Category Schema
      const demoCategorySchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Action Games",
        "description": "Discover the best action games featuring intense gameplay, epic battles, and thrilling adventures.",
        "url": "https://gamezone.com/categories/action",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": 45,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "VideoGame",
                "name": "Shadow Warrior",
                "url": "https://gamezone.com/games/shadow-warrior"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "VideoGame",
                "name": "Combat Arena",
                "url": "https://gamezone.com/games/combat-arena"
              }
            }
          ]
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://gamezone.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Categories",
              "item": "https://gamezone.com/categories"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Action Games"
            }
          ]
        }
      };

      // Demo Page Schema
      const demoPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "About GameZone - Your Ultimate Gaming Destination",
        "description": "Learn about GameZone's mission to provide the best free online games and gaming community for players worldwide.",
        "url": "https://gamezone.com/about",
        "mainEntity": {
          "@type": "Organization",
          "name": "GameZone",
          "url": "https://gamezone.com",
          "logo": "https://gamezone.com/logo.png",
          "description": "Leading online gaming platform offering thousands of free games across all genres.",
          "foundingDate": "2020-01-15",
          "numberOfEmployees": 25,
          "slogan": "Play. Compete. Conquer."
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://gamezone.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About"
            }
          ]
        },
        "lastReviewed": "2024-12-20T10:00:00Z",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://gamezone.com#website"
        }
      };

      // Demo Organization Schema
      const demoOrganizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://gamezone.com#organization",
        "name": "GameZone",
        "url": "https://gamezone.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://gamezone.com/logo.png",
          "width": 600,
          "height": 200
        },
        "description": "GameZone is the ultimate destination for free online games, featuring thousands of games across all genres with a thriving gaming community.",
        "foundingDate": "2020-01-15",
        "slogan": "Play. Compete. Conquer.",
        "numberOfEmployees": 25,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US",
          "addressRegion": "CA",
          "addressLocality": "San Francisco"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@gamezone.com",
          "url": "https://gamezone.com/contact"
        },
        "sameAs": [
          "https://twitter.com/gamezone",
          "https://facebook.com/gamezone",
          "https://instagram.com/gamezone",
          "https://youtube.com/gamezone"
        ],
        "knowsAbout": ["Gaming", "Video Games", "Online Entertainment", "Game Development"],
        "areaServed": "Worldwide"
      };

      // Create demo schemas in database
      const demoSchemas = [
        {
          schemaType: 'VideoGame',
          contentType: 'game',
          contentId: null,
          name: '🎮 Demo: Adventure Game Schema',
          schemaData: demoGameSchema,
          isActive: true,
          isAutoGenerated: false,
          priority: 1,
          createdBy: 1
        },
        {
          schemaType: 'BlogPosting',
          contentType: 'blog_post',
          contentId: null,
          name: '📝 Demo: Blog Post Schema',
          schemaData: demoBlogSchema,
          isActive: true,
          isAutoGenerated: false,
          priority: 1,
          createdBy: 1
        },
        {
          schemaType: 'CollectionPage',
          contentType: 'category',
          contentId: null,
          name: '📂 Demo: Game Category Schema',
          schemaData: demoCategorySchema,
          isActive: true,
          isAutoGenerated: false,
          priority: 1,
          createdBy: 1
        },
        {
          schemaType: 'WebPage',
          contentType: 'page',
          contentId: null,
          name: '📄 Demo: Static Page Schema',
          schemaData: demoPageSchema,
          isActive: true,
          isAutoGenerated: false,
          priority: 1,
          createdBy: 1
        },
        {
          schemaType: 'Organization',
          contentType: 'organization',
          contentId: null,
          name: '🏢 Demo: Organization Schema',
          schemaData: demoOrganizationSchema,
          isActive: true,
          isAutoGenerated: false,
          priority: 1,
          createdBy: 1
        }
      ];

      // Save all demo schemas
      for (const schemaData of demoSchemas) {
        const schema = await storage.createSeoSchema(schemaData);
        demos.push(schema);
      }

      res.json({ 
        message: "Demo schemas generated successfully", 
        schemas: demos,
        count: demos.length 
      });
    } catch (error) {
      console.error("Error generating demo schemas:", error);
      res.status(500).json({ error: "Failed to generate demo schemas" });
    }
  });

  // Bulk auto-generate schemas for all content of a type
  app.post("/api/admin/seo-schemas/bulk-generate", async (req, res) => {
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