import { Request, Response } from 'express';
import { db } from "@db";
import { webmasterTools, insertWebmasterToolSchema } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAdmin } from '../middleware/auth';

// Get all webmaster tools
export async function getWebmasterTools(req: Request, res: Response) {
  try {
    const { status, enabled } = req.query;
    
    let conditions = [];
    
    if (status) {
      conditions.push(eq(webmasterTools.status, status as string));
    }
    
    if (enabled !== undefined) {
      conditions.push(eq(webmasterTools.isEnabled, enabled === 'true'));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const tools = await db
      .select()
      .from(webmasterTools)
      .where(whereClause)
      .orderBy(webmasterTools.priority, desc(webmasterTools.createdAt));
    
    res.json(tools);
  } catch (error) {
    console.error('Error fetching webmaster tools:', error);
    res.status(500).json({ error: 'Failed to fetch webmaster tools' });
  }
}

// Get single webmaster tool by ID
export async function getWebmasterToolById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const tool = await db
      .select()
      .from(webmasterTools)
      .where(eq(webmasterTools.id, parseInt(id)))
      .limit(1);
    
    if (tool.length === 0) {
      return res.status(404).json({ error: 'Webmaster tool not found' });
    }
    
    res.json(tool[0]);
  } catch (error) {
    console.error('Error fetching webmaster tool:', error);
    res.status(500).json({ error: 'Failed to fetch webmaster tool' });
  }
}

// Create new webmaster tool (Admin only)
export async function createWebmasterTool(req: Request, res: Response) {
  try {
    if (!isAdmin(req, res)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const validatedData = insertWebmasterToolSchema.parse(req.body);
    
    const [tool] = await db
      .insert(webmasterTools)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(tool);
  } catch (error) {
    console.error('Error creating webmaster tool:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create webmaster tool' });
  }
}

// Update webmaster tool (Admin only)
export async function updateWebmasterTool(req: Request, res: Response) {
  try {
    if (!isAdmin(req, res)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const validatedData = insertWebmasterToolSchema.partial().parse(req.body);
    
    const [tool] = await db
      .update(webmasterTools)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(webmasterTools.id, parseInt(id)))
      .returning();
    
    if (!tool) {
      return res.status(404).json({ error: 'Webmaster tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    console.error('Error updating webmaster tool:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update webmaster tool' });
  }
}

// Update verification status (Admin only)
export async function updateVerificationStatus(req: Request, res: Response) {
  try {
    if (!isAdmin(req, res)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { verificationStatus, verificationCode, verificationError } = req.body;
    
    const updateData: any = {
      verificationStatus,
      updatedAt: new Date()
    };
    
    if (verificationStatus === 'verified') {
      updateData.lastVerified = new Date();
      updateData.verificationError = null;
    }
    
    if (verificationCode) {
      updateData.verificationCode = verificationCode;
    }
    
    if (verificationError) {
      updateData.verificationError = verificationError;
    }
    
    const [tool] = await db
      .update(webmasterTools)
      .set(updateData)
      .where(eq(webmasterTools.id, parseInt(id)))
      .returning();
    
    if (!tool) {
      return res.status(404).json({ error: 'Webmaster tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
}

// Toggle tool status (Admin only)
export async function toggleWebmasterToolStatus(req: Request, res: Response) {
  try {
    if (!isAdmin(req, res)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "active" or "inactive"' });
    }
    
    const [tool] = await db
      .update(webmasterTools)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(webmasterTools.id, parseInt(id)))
      .returning();
    
    if (!tool) {
      return res.status(404).json({ error: 'Webmaster tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    console.error('Error toggling webmaster tool status:', error);
    res.status(500).json({ error: 'Failed to toggle webmaster tool status' });
  }
}

// Delete webmaster tool (Admin only)
export async function deleteWebmasterTool(req: Request, res: Response) {
  try {
    if (!isAdmin(req, res)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    const [deleted] = await db
      .delete(webmasterTools)
      .where(eq(webmasterTools.id, parseInt(id)))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Webmaster tool not found' });
    }
    
    res.json({ message: 'Webmaster tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting webmaster tool:', error);
    res.status(500).json({ error: 'Failed to delete webmaster tool' });
  }
}

// Get webmaster tools statistics (Admin only)
export async function getWebmasterToolsStats(req: Request, res: Response) {
  try {
    if (!isAdmin(req, res)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const tools = await db.select().from(webmasterTools);
    
    const stats = {
      total: tools.length,
      verified: tools.filter(t => t.verificationStatus === 'verified').length,
      pending: tools.filter(t => t.verificationStatus === 'pending').length,
      failed: tools.filter(t => t.verificationStatus === 'failed').length,
      notVerified: tools.filter(t => t.verificationStatus === 'not_verified').length,
      active: tools.filter(t => t.status === 'active').length,
      inactive: tools.filter(t => t.status === 'inactive').length,
      enabled: tools.filter(t => t.isEnabled).length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching webmaster tools stats:', error);
    res.status(500).json({ error: 'Failed to fetch webmaster tools stats' });
  }
}