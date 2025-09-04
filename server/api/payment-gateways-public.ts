import { Request, Response } from 'express';
import { db } from '../db';
import { paymentGateways } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Get all enabled payment gateways for public display (without sensitive information)
export const getPublicPaymentGateways = async (req: Request, res: Response) => {
  try {
    const gateways = await db
      .select({
        id: paymentGateways.id,
        name: paymentGateways.name,
        displayName: paymentGateways.displayName,
        gatewayType: paymentGateways.gatewayType,
        methodType: paymentGateways.methodType,
        status: paymentGateways.status,
        description: paymentGateways.description,
        logo: paymentGateways.logo,
        sortOrder: paymentGateways.sortOrder,
        supportedCurrencies: paymentGateways.supportedCurrencies,
        minimumAmount: paymentGateways.minimumAmount,
        maximumAmount: paymentGateways.maximumAmount,
        processingFee: paymentGateways.processingFee,
        paymentInstructions: paymentGateways.paymentInstructions,
        // Exclude sensitive information like API keys and account details
      })
      .from(paymentGateways)
      .where(eq(paymentGateways.status, 'enabled'))
      .orderBy(desc(paymentGateways.sortOrder), desc(paymentGateways.createdAt));

    res.json(gateways);
  } catch (error) {
    console.error('Error fetching public payment gateways:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateways' });
  }
};