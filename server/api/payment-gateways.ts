import { Request, Response } from 'express';
import { db } from "@db";
import { paymentGateways, paymentTransactions, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

// Schema for creating/updating payment gateways
const PaymentGatewaySchema = z.object({
  name: z.string().min(3, "Gateway name must be at least 3 characters").max(50),
  displayName: z.string().min(3, "Display name must be at least 3 characters").max(100),
  gatewayType: z.enum(['stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net', 'manual']),
  methodType: z.enum(['automated', 'manual']),
  status: z.enum(['enabled', 'disabled', 'maintenance']),
  description: z.string().optional(),
  logo: z.string().optional(),
  supportedCurrencies: z.array(z.enum(['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT'])).min(1),
  minimumAmount: z.number().min(1),
  maximumAmount: z.number().optional(),
  processingFee: z.number().min(0).max(10000),
  isTestMode: z.boolean(),
  paymentInstructions: z.string().optional(),
  apiConfiguration: z.object({
    apiKey: z.string().optional(),
    secretKey: z.string().optional(),
    publicKey: z.string().optional(),
    merchantId: z.string().optional(),
    webhookSecret: z.string().optional(),
    sandboxApiKey: z.string().optional(),
    sandboxSecretKey: z.string().optional(),
    customSettings: z.record(z.any()).optional()
  }).optional(),
  accountDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    beneficiaryName: z.string().optional(),
    cryptoAddress: z.string().optional(),
    qrCode: z.string().optional(),
    additionalInfo: z.string().optional()
  }).optional()
});

const StatusUpdateSchema = z.object({
  status: z.enum(['enabled', 'disabled', 'maintenance'])
});

export async function getPaymentGateways(req: Request, res: Response) {
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
        isTestMode: paymentGateways.isTestMode,
        supportedCurrencies: paymentGateways.supportedCurrencies,
        minimumAmount: paymentGateways.minimumAmount,
        maximumAmount: paymentGateways.maximumAmount,
        processingFee: paymentGateways.processingFee,
        paymentInstructions: paymentGateways.paymentInstructions,
        accountDetails: paymentGateways.accountDetails,
        createdAt: paymentGateways.createdAt,
        updatedAt: paymentGateways.updatedAt
      })
      .from(paymentGateways)
      .orderBy(desc(paymentGateways.sortOrder), desc(paymentGateways.createdAt));

    res.json(gateways);
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateways' });
  }
}

export async function createPaymentGateway(req: Request, res: Response) {
  try {
    const validatedData = PaymentGatewaySchema.parse(req.body);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [gateway] = await db
      .insert(paymentGateways)
      .values({
        ...validatedData,
        createdBy: userId,
        updatedBy: userId
      })
      .returning();

    res.status(201).json(gateway);
  } catch (error) {
    console.error('Error creating payment gateway:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create payment gateway' });
  }
}

export async function updatePaymentGateway(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = PaymentGatewaySchema.parse(req.body);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [gateway] = await db
      .update(paymentGateways)
      .set({
        ...validatedData,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(paymentGateways.id, parseInt(id)))
      .returning();

    if (!gateway) {
      return res.status(404).json({ error: 'Payment gateway not found' });
    }

    res.json(gateway);
  } catch (error) {
    console.error('Error updating payment gateway:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update payment gateway' });
  }
}

export async function updatePaymentGatewayStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = StatusUpdateSchema.parse(req.body);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [gateway] = await db
      .update(paymentGateways)
      .set({
        status: validatedData.status,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(paymentGateways.id, parseInt(id)))
      .returning();

    if (!gateway) {
      return res.status(404).json({ error: 'Payment gateway not found' });
    }

    res.json(gateway);
  } catch (error) {
    console.error('Error updating payment gateway status:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update payment gateway status' });
  }
}

export async function deletePaymentGateway(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if there are any transactions using this gateway
    const transactionCount = await db
      .select({ count: paymentTransactions.id })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.gatewayId, parseInt(id)));

    if (transactionCount.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete gateway with existing transactions. Disable it instead.' 
      });
    }

    const [deletedGateway] = await db
      .delete(paymentGateways)
      .where(eq(paymentGateways.id, parseInt(id)))
      .returning();

    if (!deletedGateway) {
      return res.status(404).json({ error: 'Payment gateway not found' });
    }

    res.json({ message: 'Payment gateway deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment gateway:', error);
    res.status(500).json({ error: 'Failed to delete payment gateway' });
  }
}

export async function getPaymentGatewayById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [gateway] = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.id, parseInt(id)));

    if (!gateway) {
      return res.status(404).json({ error: 'Payment gateway not found' });
    }

    res.json(gateway);
  } catch (error) {
    console.error('Error fetching payment gateway:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateway' });
  }
}