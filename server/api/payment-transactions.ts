import { Request, Response } from 'express';
import { db } from '../db';
import { paymentTransactions, paymentGateways, users } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';

const VerifyTransactionSchema = z.object({
  status: z.enum(['completed', 'failed']),
  verificationNotes: z.string().optional()
});

const RefundTransactionSchema = z.object({
  amount: z.number().min(1)
});

export async function getPaymentTransactions(req: Request, res: Response) {
  try {
    const transactions = await db
      .select({
        id: paymentTransactions.id,
        transactionId: paymentTransactions.transactionId,
        gatewayId: paymentTransactions.gatewayId,
        userId: paymentTransactions.userId,
        amount: paymentTransactions.amount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        gatewayTransactionId: paymentTransactions.gatewayTransactionId,
        gatewayResponse: paymentTransactions.gatewayResponse,
        failureReason: paymentTransactions.failureReason,
        refundedAmount: paymentTransactions.refundedAmount,
        paymentProof: paymentTransactions.paymentProof,
        verificationNotes: paymentTransactions.verificationNotes,
        verifiedBy: paymentTransactions.verifiedBy,
        verifiedAt: paymentTransactions.verifiedAt,
        metadata: paymentTransactions.metadata,
        createdAt: paymentTransactions.createdAt,
        updatedAt: paymentTransactions.updatedAt,
        gateway: {
          id: paymentGateways.id,
          name: paymentGateways.name,
          displayName: paymentGateways.displayName,
          gatewayType: paymentGateways.gatewayType,
          methodType: paymentGateways.methodType
        },
        user: {
          id: users.id,
          username: users.username
        }
      })
      .from(paymentTransactions)
      .leftJoin(paymentGateways, eq(paymentTransactions.gatewayId, paymentGateways.id))
      .leftJoin(users, eq(paymentTransactions.userId, users.id))
      .orderBy(desc(paymentTransactions.createdAt));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
}

export async function getPaymentTransactionById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [transaction] = await db
      .select({
        id: paymentTransactions.id,
        transactionId: paymentTransactions.transactionId,
        gatewayId: paymentTransactions.gatewayId,
        userId: paymentTransactions.userId,
        amount: paymentTransactions.amount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        gatewayTransactionId: paymentTransactions.gatewayTransactionId,
        gatewayResponse: paymentTransactions.gatewayResponse,
        failureReason: paymentTransactions.failureReason,
        refundedAmount: paymentTransactions.refundedAmount,
        paymentProof: paymentTransactions.paymentProof,
        verificationNotes: paymentTransactions.verificationNotes,
        verifiedBy: paymentTransactions.verifiedBy,
        verifiedAt: paymentTransactions.verifiedAt,
        metadata: paymentTransactions.metadata,
        createdAt: paymentTransactions.createdAt,
        updatedAt: paymentTransactions.updatedAt,
        gateway: {
          id: paymentGateways.id,
          name: paymentGateways.name,
          displayName: paymentGateways.displayName,
          gatewayType: paymentGateways.gatewayType,
          methodType: paymentGateways.methodType
        },
        user: {
          id: users.id,
          username: users.username
        }
      })
      .from(paymentTransactions)
      .leftJoin(paymentGateways, eq(paymentTransactions.gatewayId, paymentGateways.id))
      .leftJoin(users, eq(paymentTransactions.userId, users.id))
      .where(eq(paymentTransactions.id, parseInt(id)));

    if (!transaction) {
      return res.status(404).json({ error: 'Payment transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching payment transaction:', error);
    res.status(500).json({ error: 'Failed to fetch payment transaction' });
  }
}

export async function verifyPaymentTransaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = VerifyTransactionSchema.parse(req.body);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [transaction] = await db
      .update(paymentTransactions)
      .set({
        status: validatedData.status,
        verificationNotes: validatedData.verificationNotes,
        verifiedBy: userId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(paymentTransactions.id, parseInt(id)))
      .returning();

    if (!transaction) {
      return res.status(404).json({ error: 'Payment transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error verifying payment transaction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to verify payment transaction' });
  }
}

export async function refundPaymentTransaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = RefundTransactionSchema.parse(req.body);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the current transaction to validate refund amount
    const [currentTransaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, parseInt(id)));

    if (!currentTransaction) {
      return res.status(404).json({ error: 'Payment transaction not found' });
    }

    if (currentTransaction.status !== 'completed') {
      return res.status(400).json({ error: 'Can only refund completed transactions' });
    }

    const totalRefundable = currentTransaction.amount - (currentTransaction.refundedAmount || 0);
    if (validatedData.amount > totalRefundable) {
      return res.status(400).json({ error: 'Refund amount exceeds available amount' });
    }

    const newRefundedAmount = (currentTransaction.refundedAmount || 0) + validatedData.amount;
    const newStatus = newRefundedAmount >= currentTransaction.amount ? 'refunded' : 'completed';

    const [transaction] = await db
      .update(paymentTransactions)
      .set({
        refundedAmount: newRefundedAmount,
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(paymentTransactions.id, parseInt(id)))
      .returning();

    // Here you would also call the actual payment gateway's refund API
    // For now, we're just updating our database

    res.json({
      ...transaction,
      message: `Refunded $${(validatedData.amount / 100).toFixed(2)} ${currentTransaction.currency}`
    });
  } catch (error) {
    console.error('Error refunding payment transaction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to refund payment transaction' });
  }
}

export async function getUserTransactions(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const transactions = await db
      .select({
        id: paymentTransactions.id,
        transactionId: paymentTransactions.transactionId,
        amount: paymentTransactions.amount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        createdAt: paymentTransactions.createdAt,
        gateway: {
          displayName: paymentGateways.displayName,
          gatewayType: paymentGateways.gatewayType
        }
      })
      .from(paymentTransactions)
      .leftJoin(paymentGateways, eq(paymentTransactions.gatewayId, paymentGateways.id))
      .where(eq(paymentTransactions.userId, parseInt(userId)))
      .orderBy(desc(paymentTransactions.createdAt));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
}

// Create a new transaction (for testing purposes or API integration)
export async function createPaymentTransaction(req: Request, res: Response) {
  try {
    const schema = z.object({
      transactionId: z.string().min(10),
      gatewayId: z.number(),
      userId: z.number(),
      amount: z.number().min(1),
      currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT']),
      gatewayTransactionId: z.string().optional(),
      metadata: z.record(z.any()).optional()
    });

    const validatedData = schema.parse(req.body);

    const [transaction] = await db
      .insert(paymentTransactions)
      .values({
        ...validatedData,
        status: 'pending'
      })
      .returning();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create payment transaction' });
  }
}