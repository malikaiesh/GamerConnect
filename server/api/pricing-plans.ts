import { Request, Response } from 'express';
import { db } from '../db';
import { pricingPlans, insertPricingPlanSchema, type InsertPricingPlan } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// Get all pricing plans
export const getPricingPlans = async (req: Request, res: Response) => {
  try {
    const plans = await db.select().from(pricingPlans).orderBy(desc(pricingPlans.sortOrder), desc(pricingPlans.id));
    res.json(plans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

// Get pricing plans by type
export const getPricingPlansByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const plans = await db.select()
      .from(pricingPlans)
      .where(and(
        eq(pricingPlans.planType, type as any),
        eq(pricingPlans.status, 'active')
      ))
      .orderBy(desc(pricingPlans.sortOrder), desc(pricingPlans.price));
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching pricing plans by type:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

// Get single pricing plan
export const getPricingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [plan] = await db.select()
      .from(pricingPlans)
      .where(eq(pricingPlans.id, parseInt(id)));

    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plan' });
  }
};

// Create pricing plan (Admin only)
export const createPricingPlan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const validatedData = insertPricingPlanSchema.parse({
      ...req.body,
      createdBy: user.id,
      updatedBy: user.id,
    });

    const [newPlan] = await db.insert(pricingPlans)
      .values(validatedData)
      .returning();

    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create pricing plan' });
  }
};

// Update pricing plan (Admin only)
export const updatePricingPlan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const validatedData = insertPricingPlanSchema.partial().parse({
      ...req.body,
      updatedBy: user.id,
    });

    const [updatedPlan] = await db.update(pricingPlans)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(pricingPlans.id, parseInt(id)))
      .returning();

    if (!updatedPlan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
};

// Delete pricing plan (Admin only)
export const deletePricingPlan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Check if plan has active subscriptions
    // Note: We'll implement this check once user subscriptions are in place
    
    const [deletedPlan] = await db.delete(pricingPlans)
      .where(eq(pricingPlans.id, parseInt(id)))
      .returning();

    if (!deletedPlan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    res.json({ message: 'Pricing plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
};

// Update plan status (Admin only)
export const updatePlanStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [updatedPlan] = await db.update(pricingPlans)
      .set({ 
        status: status as any,
        updatedBy: user.id,
        updatedAt: new Date()
      })
      .where(eq(pricingPlans.id, parseInt(id)))
      .returning();

    if (!updatedPlan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan status:', error);
    res.status(500).json({ error: 'Failed to update plan status' });
  }
};

// Bulk update pricing (Admin only) - Useful for adjusting all prices at once
export const bulkUpdatePricing = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { planType, priceMultiplier } = req.body;

    if (!priceMultiplier || priceMultiplier <= 0) {
      return res.status(400).json({ error: 'Invalid price multiplier' });
    }

    // Update all plans of the specified type
    const whereCondition = planType ? eq(pricingPlans.planType, planType) : undefined;
    
    const updatedPlans = await db.update(pricingPlans)
      .set({
        price: sql`ROUND(price * ${priceMultiplier})`,
        originalPrice: sql`CASE WHEN original_price IS NOT NULL THEN ROUND(original_price * ${priceMultiplier}) ELSE NULL END`,
        updatedBy: user.id,
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();

    res.json({
      message: `Updated ${updatedPlans.length} pricing plans`,
      updatedPlans
    });
  } catch (error) {
    console.error('Error bulk updating pricing:', error);
    res.status(500).json({ error: 'Failed to bulk update pricing' });
  }
};