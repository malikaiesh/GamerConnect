import { Router, type Express } from "express";
import { z } from "zod";
import { db } from "../db";
import { languages, translations, siteSettings, insertLanguageSchema, insertTranslationSchema } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { isAdmin } from "../middleware/auth";

const router = Router();

// ===== LANGUAGE MANAGEMENT ENDPOINTS =====

// Get all languages
router.get("/languages", async (req, res) => {
  try {
    const allLanguages = await db.select().from(languages).orderBy(languages.sortOrder, languages.name);
    res.json(allLanguages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

// Get active languages only
router.get("/languages/active", async (req, res) => {
  try {
    const activeLanguages = await db.select()
      .from(languages)
      .where(eq(languages.isActive, true))
      .orderBy(languages.sortOrder, languages.name);
    res.json(activeLanguages);
  } catch (error) {
    console.error("Error fetching active languages:", error);
    res.status(500).json({ error: "Failed to fetch active languages" });
  }
});

// Get language by code
router.get("/languages/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const [language] = await db.select()
      .from(languages)
      .where(eq(languages.code, code));
    
    if (!language) {
      return res.status(404).json({ error: "Language not found" });
    }
    
    res.json(language);
  } catch (error) {
    console.error("Error fetching language:", error);
    res.status(500).json({ error: "Failed to fetch language" });
  }
});

// Create new language (Admin only)
router.post("/languages", isAdmin, async (req, res) => {
  try {
    const validatedData = insertLanguageSchema.parse(req.body);
    
    // Check if language code already exists
    const [existingLanguage] = await db.select()
      .from(languages)
      .where(eq(languages.code, validatedData.code));
    
    if (existingLanguage) {
      return res.status(400).json({ error: "Language with this code already exists" });
    }
    
    const [newLanguage] = await db.insert(languages)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newLanguage);
  } catch (error: any) {
    console.error("Error creating language:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to create language" });
  }
});

// Update language (Admin only)
router.put("/languages/:code", isAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const updateData = insertLanguageSchema.partial().parse(req.body);
    
    const [updatedLanguage] = await db.update(languages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(languages.code, code))
      .returning();
    
    if (!updatedLanguage) {
      return res.status(404).json({ error: "Language not found" });
    }
    
    res.json(updatedLanguage);
  } catch (error: any) {
    console.error("Error updating language:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to update language" });
  }
});

// Delete language (Admin only)
router.delete("/languages/:code", isAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    
    // Check if language is being used in translations
    const [existingTranslation] = await db.select()
      .from(translations)
      .where(eq(translations.languageCode, code))
      .limit(1);
    
    if (existingTranslation) {
      return res.status(400).json({ 
        error: "Cannot delete language that has existing translations" 
      });
    }
    
    const [deletedLanguage] = await db.delete(languages)
      .where(eq(languages.code, code))
      .returning();
    
    if (!deletedLanguage) {
      return res.status(404).json({ error: "Language not found" });
    }
    
    res.json({ message: "Language deleted successfully" });
  } catch (error) {
    console.error("Error deleting language:", error);
    res.status(500).json({ error: "Failed to delete language" });
  }
});

// ===== TRANSLATION MANAGEMENT ENDPOINTS =====

// Get translations by language code
router.get("/translations/:languageCode", async (req, res) => {
  try {
    const { languageCode } = req.params;
    const { category } = req.query;
    
    let query = db.select()
      .from(translations)
      .where(and(
        eq(translations.languageCode, languageCode),
        eq(translations.isActive, true)
      ));
    
    // Filter by category if provided
    if (category && typeof category === 'string') {
      query = db.select()
        .from(translations)
        .where(and(
          eq(translations.languageCode, languageCode),
          eq(translations.category, category),
          eq(translations.isActive, true)
        ));
    }
    
    const languageTranslations = await query.orderBy(translations.category, translations.translationKey);
    
    // Convert to key-value format for easier frontend usage
    const translationMap = languageTranslations.reduce((acc, translation) => {
      acc[translation.translationKey] = translation.translatedText;
      return acc;
    }, {} as Record<string, string>);
    
    res.json(translationMap);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Failed to fetch translations" });
  }
});

// Get all translations for admin management
router.get("/admin/translations", isAdmin, async (req, res) => {
  try {
    const { languageCode, category, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    
    if (languageCode) {
      whereConditions.push(eq(translations.languageCode, languageCode as string));
    }
    
    if (category) {
      whereConditions.push(eq(translations.category, category as string));
    }
    
    if (search) {
      whereConditions.push(
        sql`(${translations.translationKey} ILIKE ${'%' + search + '%'} OR ${translations.translatedText} ILIKE ${'%' + search + '%'})`
      );
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    const [translationsResult, countResult] = await Promise.all([
      db.select({
        id: translations.id,
        translationKey: translations.translationKey,
        languageCode: translations.languageCode,
        translatedText: translations.translatedText,
        category: translations.category,
        isActive: translations.isActive,
        createdAt: translations.createdAt,
        updatedAt: translations.updatedAt,
        languageName: languages.name,
        languageNativeName: languages.nativeName
      })
        .from(translations)
        .innerJoin(languages, eq(translations.languageCode, languages.code))
        .where(whereClause)
        .orderBy(translations.category, translations.translationKey, translations.languageCode)
        .limit(limit)
        .offset(offset),
      
      db.select({ count: sql<number>`count(*)` })
        .from(translations)
        .where(whereClause)
    ]);
    
    const totalCount = countResult[0]?.count || 0;
    
    res.json({
      translations: translationsResult,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching admin translations:", error);
    res.status(500).json({ error: "Failed to fetch translations" });
  }
});

// Create or update translation (Admin only)
router.post("/translations", isAdmin, async (req, res) => {
  try {
    const validatedData = insertTranslationSchema.parse(req.body);
    
    // Check if translation already exists
    const [existingTranslation] = await db.select()
      .from(translations)
      .where(and(
        eq(translations.translationKey, validatedData.translationKey),
        eq(translations.languageCode, validatedData.languageCode)
      ));
    
    let result;
    
    if (existingTranslation) {
      // Update existing translation
      [result] = await db.update(translations)
        .set({ 
          translatedText: validatedData.translatedText,
          category: validatedData.category,
          isActive: validatedData.isActive,
          updatedAt: new Date()
        })
        .where(eq(translations.id, existingTranslation.id))
        .returning();
    } else {
      // Create new translation
      [result] = await db.insert(translations)
        .values(validatedData)
        .returning();
    }
    
    res.status(existingTranslation ? 200 : 201).json(result);
  } catch (error: any) {
    console.error("Error creating/updating translation:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to save translation" });
  }
});

// Update translation (Admin only)
router.put("/translations/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertTranslationSchema.partial().parse(req.body);
    
    const [updatedTranslation] = await db.update(translations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(translations.id, parseInt(id)))
      .returning();
    
    if (!updatedTranslation) {
      return res.status(404).json({ error: "Translation not found" });
    }
    
    res.json(updatedTranslation);
  } catch (error: any) {
    console.error("Error updating translation:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to update translation" });
  }
});

// Delete translation (Admin only)
router.delete("/translations/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedTranslation] = await db.delete(translations)
      .where(eq(translations.id, parseInt(id)))
      .returning();
    
    if (!deletedTranslation) {
      return res.status(404).json({ error: "Translation not found" });
    }
    
    res.json({ message: "Translation deleted successfully" });
  } catch (error) {
    console.error("Error deleting translation:", error);
    res.status(500).json({ error: "Failed to delete translation" });
  }
});

// Get translation categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.selectDistinct({ category: translations.category })
      .from(translations)
      .where(eq(translations.isActive, true))
      .orderBy(translations.category);
    
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error("Error fetching translation categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get translation statistics
router.get("/admin/stats", isAdmin, async (req, res) => {
  try {
    const [languageStats, categoryStats, totalTranslations] = await Promise.all([
      // Translations count by language
      db.select({
        languageCode: translations.languageCode,
        languageName: languages.name,
        translationCount: sql<number>`count(${translations.id})`
      })
        .from(translations)
        .innerJoin(languages, eq(translations.languageCode, languages.code))
        .where(eq(translations.isActive, true))
        .groupBy(translations.languageCode, languages.name)
        .orderBy(languages.name),
      
      // Translations count by category
      db.select({
        category: translations.category,
        translationCount: sql<number>`count(${translations.id})`
      })
        .from(translations)
        .where(eq(translations.isActive, true))
        .groupBy(translations.category)
        .orderBy(translations.category),
      
      // Total translations count
      db.select({ count: sql<number>`count(*)` })
        .from(translations)
        .where(eq(translations.isActive, true))
    ]);
    
    const totalLanguages = await db.select({ count: sql<number>`count(*)` })
      .from(languages)
      .where(eq(languages.isActive, true));
    
    res.json({
      totalTranslations: totalTranslations[0]?.count || 0,
      totalLanguages: totalLanguages[0]?.count || 0,
      languageStats,
      categoryStats
    });
  } catch (error) {
    console.error("Error fetching translation stats:", error);
    res.status(500).json({ error: "Failed to fetch translation statistics" });
  }
});

export function registerTranslationRoutes(app: Express) {
  app.use("/api/translations", router);
}