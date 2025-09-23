import { db } from "@db";
import { payoutMethods } from '@shared/schema';
import { eq } from 'drizzle-orm';

const defaultPayoutMethods = [
  {
    method: 'paypal' as const,
    name: 'PayPal',
    description: 'Send money to your PayPal account',
    icon: 'ri-paypal-fill',
    isEnabled: true,
    minimumAmount: 1000, // $10.00
    processingFee: 0,
    processingTime: '1-2 business days',
    displayOrder: 1,
    requiredFields: {
      fields: [
        {
          name: 'paypal_email',
          label: 'PayPal Email Address',
          type: 'email' as const,
          required: true,
          placeholder: 'your@email.com',
          validation: 'email'
        }
      ]
    },
    instructions: 'Make sure your PayPal account is verified and can receive payments.'
  },
  {
    method: 'binance' as const,
    name: 'Binance',
    description: 'Receive USDT to your Binance account',
    icon: 'ri-currency-fill',
    isEnabled: true,
    minimumAmount: 1000, // $10.00
    processingFee: 50, // $0.50
    processingTime: '30 minutes - 2 hours',
    displayOrder: 2,
    requiredFields: {
      fields: [
        {
          name: 'binance_email',
          label: 'Binance Email Address',
          type: 'email' as const,
          required: true,
          placeholder: 'your-binance@email.com'
        },
        {
          name: 'binance_uid',
          label: 'Binance UID (Optional)',
          type: 'text' as const,
          required: false,
          placeholder: '123456789'
        }
      ]
    },
    instructions: 'Ensure your Binance account can receive USDT transfers. Processing may take longer during high network congestion.'
  },
  {
    method: 'payoneer' as const,
    name: 'Payoneer',
    description: 'Transfer to your Payoneer account',
    icon: 'ri-bank-card-fill',
    isEnabled: true,
    minimumAmount: 2000, // $20.00
    processingFee: 0,
    processingTime: '2-3 business days',
    displayOrder: 3,
    requiredFields: {
      fields: [
        {
          name: 'payoneer_email',
          label: 'Payoneer Email Address',
          type: 'email' as const,
          required: true,
          placeholder: 'your-payoneer@email.com'
        }
      ]
    },
    instructions: 'Make sure your Payoneer account is active and verified for receiving payments.'
  },
  {
    method: 'wise' as const,
    name: 'Wise (TransferWise)',
    description: 'Transfer to your Wise account',
    icon: 'ri-exchange-fill',
    isEnabled: true,
    minimumAmount: 1500, // $15.00
    processingFee: 0,
    processingTime: '1-3 business days',
    displayOrder: 4,
    requiredFields: {
      fields: [
        {
          name: 'wise_email',
          label: 'Wise Email Address',
          type: 'email' as const,
          required: true,
          placeholder: 'your-wise@email.com'
        }
      ]
    },
    instructions: 'Ensure your Wise account is verified and ready to receive transfers.'
  },
  {
    method: 'bank_transfer' as const,
    name: 'Bank Transfer',
    description: 'Direct transfer to your bank account',
    icon: 'ri-bank-fill',
    isEnabled: true,
    minimumAmount: 5000, // $50.00
    processingFee: 100, // $1.00
    processingTime: '3-5 business days',
    displayOrder: 5,
    requiredFields: {
      fields: [
        {
          name: 'bank_account_number',
          label: 'Account Number',
          type: 'text' as const,
          required: true,
          placeholder: '1234567890'
        },
        {
          name: 'bank_routing_number',
          label: 'Routing Number',
          type: 'text' as const,
          required: true,
          placeholder: '021000021'
        },
        {
          name: 'bank_name',
          label: 'Bank Name',
          type: 'text' as const,
          required: true,
          placeholder: 'Bank of America'
        }
      ]
    },
    instructions: 'Double-check your bank details. Incorrect information may cause transfer delays or failures.'
  },
  {
    method: 'crypto' as const,
    name: 'Cryptocurrency',
    description: 'Receive USDT or other stablecoins',
    icon: 'ri-bit-coin-fill',
    isEnabled: false,
    minimumAmount: 1000, // $10.00
    processingFee: 200, // $2.00 network fee
    processingTime: '10-60 minutes',
    displayOrder: 6,
    requiredFields: {
      fields: [
        {
          name: 'crypto_address',
          label: 'Wallet Address',
          type: 'text' as const,
          required: true,
          placeholder: '0x...'
        },
        {
          name: 'crypto_network',
          label: 'Network',
          type: 'text' as const,
          required: true,
          placeholder: 'BSC, ETH, TRON'
        }
      ]
    },
    instructions: 'Ensure the wallet address and network are correct. We cannot recover funds sent to wrong addresses.'
  }
];

export async function seedPayoutMethods() {
  console.log('🌱 Seeding default payout methods...');
  
  try {
    for (const methodData of defaultPayoutMethods) {
      const existing = await db
        .select()
        .from(payoutMethods)
        .where(eq(payoutMethods.method, methodData.method))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(payoutMethods).values(methodData);
        console.log(`✅ Created payout method: ${methodData.name}`);
      } else {
        console.log(`ℹ️  Payout method ${methodData.name} already exists, skipping`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding payout methods:', error);
  }
}