import type { Express } from "express";
import { db } from "../db";
import { shortLinks } from "@shared/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { isAuthenticated, isAdmin } from "../middleware/auth";

/**
 * Generate a random short code
 */
function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Build the original URL based on target type and identifiers
 */
function buildOriginalUrl(targetType: string, targetId?: number, targetSlug?: string, baseUrl?: string): string {
  const base = baseUrl || '';
  
  switch (targetType) {
    case 'game':
      if (targetSlug) {
        return `${base}/g/${targetSlug}`;
      } else if (targetId) {
        return `${base}/game/${targetId}`;
      }
      break;
    case 'blog':
      if (targetSlug) {
        return `${base}/blog/${targetSlug}`;
      }
      break;
    case 'category':
      if (targetSlug) {
        return `${base}/games/category/${targetSlug}`;
      }
      break;
    case 'page':
      if (targetSlug) {
        return `${base}/${targetSlug}`;
      }
      break;
  }
  
  throw new Error('Invalid target type or missing required identifiers');
}

/**
 * API endpoints for managing short links
 */
export function registerShortLinksRoutes(app: Express) {
  
  // Generate a short link
  app.post('/api/short-links/generate', async (req, res) => {
    try {
      const { targetType, targetId, targetSlug, customCode } = req.body;

      if (!targetType) {
        return res.status(400).json({ error: 'Target type is required' });
      }

      if (!targetId && !targetSlug) {
        return res.status(400).json({ error: 'Either targetId or targetSlug is required' });
      }

      // Check if a short link already exists for this target
      const existingLink = await db
        .select()
        .from(shortLinks)
        .where(
          and(
            eq(shortLinks.targetType, targetType as any),
            targetId ? eq(shortLinks.targetId, targetId) : isNull(shortLinks.targetId),
            targetSlug ? eq(shortLinks.targetSlug, targetSlug) : isNull(shortLinks.targetSlug),
            eq(shortLinks.isActive, true)
          )
        )
        .limit(1);

      if (existingLink.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return res.json({
          success: true,
          shortLink: existingLink[0],
          shortUrl: `${baseUrl}/s/${existingLink[0].shortCode}`,
          originalUrl: existingLink[0].originalUrl
        });
      }

      // Build the original URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const originalUrl = buildOriginalUrl(targetType, targetId, targetSlug, baseUrl);

      // Generate or use custom short code
      let shortCode = customCode;
      if (!shortCode) {
        let attempts = 0;
        do {
          shortCode = generateShortCode(6);
          attempts++;
          
          // Check if code already exists
          const existing = await db
            .select()
            .from(shortLinks)
            .where(eq(shortLinks.shortCode, shortCode))
            .limit(1);

          if (existing.length === 0) break;
          
          if (attempts > 10) {
            throw new Error('Failed to generate unique short code');
          }
        } while (true);
      } else {
        // Check if custom code is available
        const existing = await db
          .select()
          .from(shortLinks)
          .where(eq(shortLinks.shortCode, customCode))
          .limit(1);

        if (existing.length > 0) {
          return res.status(400).json({ error: 'Custom short code is already taken' });
        }
      }

      // Create the short link
      const [newShortLink] = await db
        .insert(shortLinks)
        .values({
          shortCode,
          originalUrl,
          targetType: targetType as any,
          targetId: targetId || null,
          targetSlug: targetSlug || null,
          isActive: true,
        })
        .returning();

      res.json({
        success: true,
        shortLink: newShortLink,
        shortUrl: `${baseUrl}/s/${newShortLink.shortCode}`,
        originalUrl: newShortLink.originalUrl
      });

    } catch (error) {
      console.error('Error generating short link:', error);
      res.status(500).json({
        error: 'Failed to generate short link',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Resolve a short link (redirect endpoint)
  app.get('/s/:shortCode', async (req, res) => {
    try {
      const { shortCode } = req.params;

      if (!shortCode) {
        return res.status(400).json({ error: 'Short code is required' });
      }

      // Find the short link
      const [shortLink] = await db
        .select()
        .from(shortLinks)
        .where(
          and(
            eq(shortLinks.shortCode, shortCode),
            eq(shortLinks.isActive, true)
          )
        )
        .limit(1);

      if (!shortLink) {
        return res.status(404).json({ error: 'Short link not found' });
      }

      // Check if expired
      if (shortLink.expiresAt && new Date() > shortLink.expiresAt) {
        return res.status(410).json({ error: 'Short link has expired' });
      }

      // Update click count and last clicked timestamp
      await db
        .update(shortLinks)
        .set({
          clickCount: shortLink.clickCount + 1,
          lastClickedAt: new Date()
        })
        .where(eq(shortLinks.id, shortLink.id));

      // Redirect to the original URL
      res.redirect(301, shortLink.originalUrl);

    } catch (error) {
      console.error('Error resolving short link:', error);
      res.status(500).json({
        error: 'Failed to resolve short link',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get short link analytics (admin only)
  app.get('/api/admin/short-links', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20, search, targetType } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereConditions = [];
      
      if (search) {
        // Search is not implemented for short links in this basic version
      }
      
      if (targetType) {
        whereConditions.push(eq(shortLinks.targetType, targetType as any));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get short links with pagination
      const links = await db
        .select()
        .from(shortLinks)
        .where(whereClause)
        .orderBy(desc(shortLinks.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count
      const totalCount = await db
        .select({ count: shortLinks.id })
        .from(shortLinks)
        .where(whereClause);

      res.json({
        shortLinks: links,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching short links:', error);
      res.status(500).json({
        error: 'Failed to fetch short links',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get short link analytics/stats (admin only)
  app.get('/api/admin/short-links/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get total short links count
      const totalLinks = await db
        .select({ count: shortLinks.id })
        .from(shortLinks);

      // Get total clicks count
      const totalClicksResult = await db
        .select()
        .from(shortLinks);
      
      const totalClicks = totalClicksResult.reduce((sum, link) => sum + link.clickCount, 0);

      // Get active links count
      const activeLinks = await db
        .select({ count: shortLinks.id })
        .from(shortLinks)
        .where(eq(shortLinks.isActive, true));

      // Get links by type
      const linksByType = await db
        .select({
          targetType: shortLinks.targetType,
          count: shortLinks.id
        })
        .from(shortLinks);

      const typeStats = linksByType.reduce((acc: Record<string, number>, link) => {
        acc[link.targetType] = (acc[link.targetType] || 0) + 1;
        return acc;
      }, {});

      // Get top performing links
      const topLinks = await db
        .select()
        .from(shortLinks)
        .orderBy(desc(shortLinks.clickCount))
        .limit(10);

      res.json({
        totalLinks: totalLinks.length,
        totalClicks,
        activeLinks: activeLinks.length,
        typeStats,
        topLinks,
        averageClicksPerLink: totalLinks.length > 0 ? Math.round(totalClicks / totalLinks.length) : 0
      });

    } catch (error) {
      console.error('Error fetching short link stats:', error);
      res.status(500).json({
        error: 'Failed to fetch short link stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete/deactivate a short link (admin only)
  app.delete('/api/admin/short-links/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [updated] = await db
        .update(shortLinks)
        .set({ isActive: false })
        .where(eq(shortLinks.id, Number(id)))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Short link not found' });
      }

      res.json({ success: true, message: 'Short link deactivated' });

    } catch (error) {
      console.error('Error deactivating short link:', error);
      res.status(500).json({
        error: 'Failed to deactivate short link',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}