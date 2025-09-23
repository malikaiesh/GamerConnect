import { db } from "@db";
import { apiKeys } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * IMPORTANT: These are EXAMPLE keys for development seeding only.
 * In production, API keys should be stored as environment variables.
 * Never replace these examples with real API keys in this file.
 */
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
  
  // Payment Gateway API Keys
  {
    name: "Stripe Test Key",
    type: "stripe" as const,
    key: "sk_test_example_stripe_key_for_testing_purposes_only",
    description: "Stripe test environment API key for development and testing",
    isActive: true
  },
  {
    name: "PayPal Sandbox Key",
    type: "paypal" as const,
    key: "AX_example_paypal_sandbox_client_id_for_testing_purposes_only",
    description: "PayPal sandbox environment client ID for development and testing",
    isActive: true
  },
  {
    name: "Razorpay Test Key",
    type: "razorpay" as const,
    key: "rzp_test_example_key_for_testing_purposes",
    description: "Razorpay test environment API key for development and testing",
    isActive: true
  },

  // AI Tools API Keys
  {
    name: "OpenAI API Key",
    type: "chatgpt" as const,
    key: "EXAMPLE_OPENAI_KEY_REPLACE_WITH_ENV_VAR",
    description: "OpenAI API key for ChatGPT and AI content generation",
    isActive: true
  },
  {
    name: "Claude API Key",
    type: "claude" as const,
    key: "sk-ant-example_claude_api_key_for_testing",
    description: "Anthropic Claude API key for AI assistance",
    isActive: true
  },
  {
    name: "DeepSeek API Key",
    type: "deepseek" as const,
    key: "sk-example_deepseek_api_key_for_testing",
    description: "DeepSeek API key for AI development tools",
    isActive: true
  },
  {
    name: "Google Gemini API Key",
    type: "google_gemini" as const,
    key: "AIzaSy_example_gemini_api_key_for_testing",
    description: "Google Gemini API key for multimodal AI",
    isActive: true
  },
  {
    name: "Grok API Key",
    type: "grok" as const,
    key: "xai-example_grok_api_key_for_testing",
    description: "xAI Grok API key for conversational AI",
    isActive: true
  },
  {
    name: "Perplexity API Key",
    type: "perplexity" as const,
    key: "pplx-example_perplexity_api_key_for_testing",
    description: "Perplexity API key for search-powered AI",
    isActive: true
  },
  {
    name: "Character.ai API Key",
    type: "character_ai" as const,
    key: "char-example_character_ai_api_key_for_testing",
    description: "Character.ai API key for character-based AI interactions",
    isActive: true
  },
  {
    name: "Midjourney API Key",
    type: "midjourney" as const,
    key: "mj-example_midjourney_api_key_for_testing",
    description: "Midjourney API key for AI image generation",
    isActive: true
  },
  {
    name: "DALL·E 3 API Key",
    type: "dalle3" as const,
    key: "dalle-example_dalle3_api_key_for_testing",
    description: "OpenAI DALL·E 3 API key for advanced AI image generation",
    isActive: true
  },
  {
    name: "Leonardo AI API Key",
    type: "leonardo_ai" as const,
    key: "leo-example_leonardo_ai_api_key_for_testing",
    description: "Leonardo AI API key for creative AI image generation",
    isActive: true
  },
  {
    name: "HeyGen API Key",
    type: "heygen" as const,
    key: "hg-example_heygen_api_key_for_testing",
    description: "HeyGen API key for AI video generation",
    isActive: true
  },
  {
    name: "ElevenLabs API Key",
    type: "elevenlabs" as const,
    key: "el-example_elevenlabs_api_key_for_testing",
    description: "ElevenLabs API key for AI voice synthesis",
    isActive: true
  },
  {
    name: "Luma AI API Key",
    type: "luma_ai" as const,
    key: "luma-example_luma_ai_api_key_for_testing",
    description: "Luma AI API key for 3D and video generation",
    isActive: true
  },
  {
    name: "Notion AI API Key",
    type: "notion_ai" as const,
    key: "notion-example_notion_ai_api_key_for_testing",
    description: "Notion AI API key for productivity AI features",
    isActive: true
  },
  {
    name: "Taskade AI API Key",
    type: "taskade_ai" as const,
    key: "task-example_taskade_ai_api_key_for_testing",
    description: "Taskade AI API key for project management AI",
    isActive: true
  },
  {
    name: "Lumio AI API Key",
    type: "lumio_ai" as const,
    key: "lumio-example_lumio_ai_api_key_for_testing",
    description: "Lumio AI API key for educational AI tools",
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