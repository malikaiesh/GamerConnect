import { Request, Response } from 'express';
import { db } from "@db";
import { paymentTransactions, paymentGateways, pricingPlans } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getUserPurchases(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For now, return demo purchase data until database schema is properly set up
    const demoPurchases = [
      {
        id: 1,
        transactionId: 'txn_demo_001',
        amount: 999,
        currency: 'USD',
        status: 'completed',
        gatewayType: 'stripe',
        planName: '100 Diamonds Pack',
        metadata: { type: 'diamonds', quantity: 100 },
        createdAt: new Date('2025-09-27T10:30:00Z'),
        updatedAt: new Date('2025-09-27T10:30:00Z')
      },
      {
        id: 2,
        transactionId: 'txn_demo_002',
        amount: 1999,
        currency: 'USD',
        status: 'pending',
        gatewayType: 'paypal',
        planName: 'Premium Subscription',
        metadata: { type: 'subscription', duration: '1 month' },
        createdAt: new Date('2025-09-28T14:15:00Z'),
        updatedAt: new Date('2025-09-28T14:15:00Z')
      }
    ];

    res.json(demoPurchases);
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
}