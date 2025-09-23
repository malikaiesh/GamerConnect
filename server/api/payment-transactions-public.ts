import { Request, Response } from 'express';
import { db } from "@db";
import { paymentTransactions } from '@shared/schema';
import { z } from 'zod';

// Public transaction creation schema (for checkout)
const checkoutTransactionSchema = z.object({
  planId: z.number(),
  gatewayId: z.number(),
  amount: z.number().min(1),
  currency: z.string().min(3).max(3)
});

// Create a new transaction from checkout
export async function createCheckoutTransaction(req: Request, res: Response) {
  try {
    const validatedData = checkoutTransactionSchema.parse(req.body);
    
    // Generate a unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user ID from session (user must be authenticated for checkout)
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required for checkout' });
    }
    
    const [transaction] = await db
      .insert(paymentTransactions)
      .values({
        transactionId: transactionId,
        gatewayId: validatedData.gatewayId,
        userId: userId,
        amount: validatedData.amount,
        currency: validatedData.currency as any,
        status: 'pending',
        metadata: {
          planId: validatedData.planId,
          createdVia: 'checkout'
        }
      })
      .returning();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating checkout transaction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create payment transaction' });
  }
}