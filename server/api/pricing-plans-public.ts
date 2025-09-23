import { Request, Response } from 'express';
import { db } from "@db";
import { pricingPlans } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

// Get all active pricing plans (Public)
export const getPublicPricingPlans = async (req: Request, res: Response) => {
  try {
    const plans = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.status, 'active'))
      .orderBy(desc(pricingPlans.sortOrder), desc(pricingPlans.price));
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching public pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

// Get pricing plans by type (Public)
export const getPublicPricingPlansByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    const plans = await db
      .select()
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

// Get single pricing plan (Public)
export const getPublicPricingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [plan] = await db
      .select()
      .from(pricingPlans)
      .where(and(
        eq(pricingPlans.id, parseInt(id)),
        eq(pricingPlans.status, 'active')
      ))
      .limit(1);
    
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found or inactive' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plan' });
  }
};