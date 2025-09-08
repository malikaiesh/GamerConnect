import { db } from '../db';
import { signupOptions } from '@shared/schema';
import { eq, count } from 'drizzle-orm';

// Default signup options that should be available in every deployment
const DEFAULT_SIGNUP_OPTIONS = [
  {
    provider: 'email' as const,
    displayName: 'Email Registration',
    isEnabled: true,
    icon: 'lucide:mail',
    color: '#4f46e5',
    sortOrder: 1,
    description: 'Sign up with your email address and password'
  },
  {
    provider: 'google' as const,
    displayName: 'Google',
    isEnabled: true,
    icon: 'lucide:chrome',
    color: '#db4437',
    sortOrder: 2,
    description: 'Sign up with your Google account'
  },
  {
    provider: 'facebook' as const,
    displayName: 'Facebook',
    isEnabled: true,
    icon: 'lucide:facebook',
    color: '#4267b2',
    sortOrder: 3,
    description: 'Sign up with your Facebook account'
  },
  {
    provider: 'github' as const,
    displayName: 'GitHub',
    isEnabled: false,
    icon: 'lucide:github',
    color: '#333333',
    sortOrder: 4,
    description: 'Sign up with your GitHub account'
  },
  {
    provider: 'discord' as const,
    displayName: 'Discord',
    isEnabled: false,
    icon: 'lucide:gamepad-2',
    color: '#5865f2',
    sortOrder: 5,
    description: 'Sign up with your Discord account'
  },
  {
    provider: 'twitter' as const,
    displayName: 'Twitter',
    isEnabled: false,
    icon: 'lucide:twitter',
    color: '#1da1f2',
    sortOrder: 6,
    description: 'Sign up with your Twitter account'
  },
  {
    provider: 'apple' as const,
    displayName: 'Apple',
    isEnabled: false,
    icon: 'lucide:apple',
    color: '#000000',
    sortOrder: 7,
    description: 'Sign up with your Apple ID'
  },
  {
    provider: 'microsoft' as const,
    displayName: 'Microsoft',
    isEnabled: false,
    icon: 'lucide:window',
    color: '#00a1f1',
    sortOrder: 8,
    description: 'Sign up with your Microsoft account'
  },
  {
    provider: 'recaptcha' as const,
    displayName: 'Google reCAPTCHA',
    isEnabled: false,
    icon: 'lucide:shield-check',
    color: '#4285f4',
    sortOrder: 9,
    description: 'Enable Google reCAPTCHA verification for signup forms',
    configuration: {
      siteKey: '',
      secretKey: '',
      version: 'v2',
      theme: 'light',
      size: 'normal'
    }
  },
  {
    provider: 'livechat' as const,
    displayName: 'Live Chat Support',
    isEnabled: false,
    icon: 'lucide:message-circle',
    color: '#00d4aa',
    sortOrder: 10,
    description: 'Enable live chat support widget on website',
    configuration: {
      chatProvider: 'tawk',
      widgetId: '',
      apiKey: '',
      position: 'bottom-right',
      theme: 'default',
      autoShow: true,
      offlineForm: true
    }
  }
];

export async function seedSignupOptions() {
  try {
    // Check if signup options already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(signupOptions);

    if (existingCount.count === 0) {
      // Fresh deployment - insert all options
      console.log('🌱 Seeding default signup options...');
      
      await db.insert(signupOptions).values(DEFAULT_SIGNUP_OPTIONS);
      
      console.log('✅ Default signup options seeded successfully');
    } else {
      // Existing deployment - check for new options and add them
      console.log('🌱 Checking for new signup options...');
      
      // Get existing providers
      const existingOptions = await db.select().from(signupOptions);
      const existingProviders = existingOptions.map(option => option.provider);
      
      // Find new options that don't exist yet
      const newOptions = DEFAULT_SIGNUP_OPTIONS.filter(
        option => !existingProviders.includes(option.provider)
      );
      
      if (newOptions.length > 0) {
        console.log(`🌱 Adding ${newOptions.length} new signup options...`);
        console.log('New options:', newOptions.map(opt => opt.displayName).join(', '));
        
        await db.insert(signupOptions).values(newOptions);
        
        console.log('✅ New signup options added successfully');
      } else {
        console.log('ℹ️  No new signup options to add');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding signup options:', error);
    throw error;
  }
}