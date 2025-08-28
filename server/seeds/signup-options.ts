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
  }
];

export async function seedSignupOptions() {
  try {
    // Check if signup options already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(signupOptions);

    // Only seed if no options exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default signup options...');
      
      await db.insert(signupOptions).values(DEFAULT_SIGNUP_OPTIONS);
      
      console.log('✅ Default signup options seeded successfully');
    } else {
      console.log('ℹ️  Signup options already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding signup options:', error);
    throw error;
  }
}