import { db } from '../db';
import { apiKeys } from '@shared/schema';
import { eq } from 'drizzle-orm';

const defaultApiKeys = [
  // Existing Service API Keys (using current enum values only)
  {
    name: "TinyMCE Editor",
    type: "tinymce" as const,
    key: "example_tinymce_api_key_for_testing",
    description: "TinyMCE API key for rich text editor functionality",
    isActive: true
  },
  {
    name: "Game Monetize",
    type: "game-monetize" as const,
    key: "example_game_monetize_api_key",
    description: "Game Monetize API key for fetching external games",
    isActive: true
  },
  {
    name: "SendGrid Email",
    type: "sendgrid" as const,
    key: "SG.example_sendgrid_api_key_for_testing",
    description: "SendGrid API key for sending transactional emails",
    isActive: true
  },
  {
    name: "Google Analytics",
    type: "analytics" as const,
    key: "GA-example-tracking-id",
    description: "Google Analytics tracking ID for website analytics",
    isActive: true
  },
  
  // Payment Gateway API Keys (using 'custom' type for now)
  {
    name: "Stripe Test Key",
    type: "custom" as const,
    key: "sk_test_example_stripe_key_for_testing_purposes_only",
    description: "Stripe test environment API key for development and testing (Payment Gateway)",
    isActive: true
  },
  {
    name: "PayPal Sandbox Key",
    type: "custom" as const,
    key: "AXkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MRAOGCyMxXYvSPmHPW8vmLZGLjm8zUv2WKaGy7tL2",
    description: "PayPal sandbox environment client ID for development and testing (Payment Gateway)",
    isActive: true
  },
  {
    name: "Razorpay Test Key",
    type: "custom" as const,
    key: "rzp_test_example_key_for_testing_purposes",
    description: "Razorpay test environment API key for development and testing (Payment Gateway)",
    isActive: true
  }
];

export async function seedApiKeys() {
  console.log('🔑 Seeding API keys...');
  
  try {
    for (const apiKeyData of defaultApiKeys) {
      // Check if API key already exists by name and type
      const existingApiKey = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.name, apiKeyData.name))
        .limit(1);

      if (existingApiKey.length > 0) {
        console.log(`ℹ️  API key "${apiKeyData.name}" already exists, skipping`);
        continue;
      }

      // Insert the API key
      await db.insert(apiKeys).values({
        ...apiKeyData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Created API key: ${apiKeyData.name} (${apiKeyData.type})`);
    }

    console.log('🎉 API keys seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding API keys:', error);
    throw error;
  }
}