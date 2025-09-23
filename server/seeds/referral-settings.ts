import { db } from "@db";
import { referralSettings } from '@shared/schema';

export async function seedReferralSettings() {
  console.log('🌱 Seeding referral settings...');
  
  try {
    const existingSettings = await db.select().from(referralSettings).limit(1);
    
    if (existingSettings.length > 0) {
      console.log('ℹ️  Referral settings already exist, skipping seeding');
      return;
    }

    const defaultSettings = [
      // Reward amounts (in cents)
      {
        settingKey: 'registration_reward',
        settingValue: '500', // $5.00
        settingType: 'number',
        description: 'Reward amount for successful registration referral'
      },
      {
        settingKey: 'first_game_reward',
        settingValue: '300', // $3.00
        settingType: 'number',
        description: 'Reward when referred user plays their first game'
      },
      {
        settingKey: 'profile_complete_reward',
        settingValue: '200', // $2.00
        settingType: 'number',
        description: 'Reward when referred user completes their profile'
      },
      {
        settingKey: 'subscription_commission_rate',
        settingValue: '0.30', // 30%
        settingType: 'number',
        description: 'Commission rate for subscription referrals'
      },
      
      // Tier multipliers
      {
        settingKey: 'tier_1_multiplier',
        settingValue: '1.0', // 100%
        settingType: 'number',
        description: 'Reward multiplier for tier 1 referrals'
      },
      {
        settingKey: 'tier_2_multiplier',
        settingValue: '0.5', // 50%
        settingType: 'number',
        description: 'Reward multiplier for tier 2 referrals'
      },
      {
        settingKey: 'tier_3_multiplier',
        settingValue: '0.25', // 25%
        settingType: 'number',
        description: 'Reward multiplier for tier 3 referrals'
      },
      
      // System settings
      {
        settingKey: 'max_codes_per_user',
        settingValue: '5',
        settingType: 'number',
        description: 'Maximum number of referral codes per user'
      },
      {
        settingKey: 'min_payout_amount',
        settingValue: '1000', // $10.00
        settingType: 'number',
        description: 'Minimum payout amount in cents'
      },
      {
        settingKey: 'referral_code_expiry_days',
        settingValue: '365', // 1 year
        settingType: 'number',
        description: 'Default expiry period for referral codes in days'
      },
      {
        settingKey: 'enable_multi_tier',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable multi-tier referral system'
      },
      {
        settingKey: 'enable_fraud_detection',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable fraud detection and prevention'
      },
      
      // Milestone rewards
      {
        settingKey: 'milestone_10_reward',
        settingValue: '1000', // $10.00
        settingType: 'number',
        description: 'Milestone reward for 10 successful referrals'
      },
      {
        settingKey: 'milestone_50_reward',
        settingValue: '7500', // $75.00
        settingType: 'number',
        description: 'Milestone reward for 50 successful referrals'
      },
      {
        settingKey: 'milestone_100_reward',
        settingValue: '20000', // $200.00
        settingType: 'number',
        description: 'Milestone reward for 100 successful referrals'
      },
      
      // Activity bonuses
      {
        settingKey: 'monthly_activity_bonus',
        settingValue: '500', // $5.00
        settingType: 'number',
        description: 'Monthly bonus for active referred users'
      },
      {
        settingKey: 'loyalty_bonus_threshold',
        settingValue: '30', // 30 days
        settingType: 'number',
        description: 'Days of activity required for loyalty bonus'
      },
      
      // Social sharing incentives
      {
        settingKey: 'social_share_bonus',
        settingValue: '50', // $0.50
        settingType: 'number',
        description: 'Bonus for sharing referral link on social media'
      }
    ];

    await db.insert(referralSettings).values(defaultSettings);
    console.log(`✅ Seeded ${defaultSettings.length} referral settings`);
    
  } catch (error) {
    console.error('❌ Error seeding referral settings:', error);
    throw error;
  }
}