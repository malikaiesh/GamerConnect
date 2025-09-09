import { seedSignupOptions } from './signup-options';
import { seedSiteSettings } from './site-settings';
import { seedDefaultUsers } from './default-users';
import { seedGameCategories } from './game-categories';
import { seedBlogCategories } from './blog-categories';
import { seedBlogPosts } from './blog-posts';
import { seedPaymentGateways } from './payment-gateways';
import { seedPricingPlans } from './pricing-plans';
import { seedStaticPages } from './static-pages';
import { seedTeamMembers } from './team-members';
import { seedEvents } from './events';
import { seedVerifiedUsers } from './verified-users';
import { seedVerifiedRooms } from './verified-rooms';
import { seedHeroImages } from './hero-images';
import { seedWebmasterTools } from './webmaster-tools';
import { seedReferralSettings } from './referral-settings';
import { seedPayoutMethods } from './payout-methods';
import { seedTranslations } from './translations';
import { seedApiKeys } from './api-keys';
import { seedVerificationAssets } from './verification-assets';
import { seedAutomatedMessageTemplates } from './automated-messaging-templates';

// Main seeding function that runs all seeds
export async function runSeeds() {
  console.log('🌱 Running database seeds...');
  
  try {
    // Run all seeds in proper order
    await seedSignupOptions();
    await seedSiteSettings(); // Add site settings seeding early since other features depend on it
    await seedDefaultUsers(); // Add default admin and user accounts
    await seedGameCategories();
    await seedBlogCategories();
    await seedStaticPages();
    await seedTeamMembers();
    await seedVerifiedUsers(); // Run before events and rooms
    await seedEvents(); // Run events since it depends on users table
    await seedVerifiedRooms(); // Run after verified users are created
    await seedHeroImages(); // Add hero images seeding
    await seedWebmasterTools(); // Add webmaster tools seeding
    await seedReferralSettings(); // Add referral settings seeding
    await seedPayoutMethods(); // Add payout methods seeding
    await seedPaymentGateways();
    await seedPricingPlans(); // Add payment gateways seeding
    await seedApiKeys(); // Add API keys seeding
    await seedTranslations(); // Add translations and languages seeding
    await seedVerificationAssets(); // Ensure verification icons are available
    // await seedAutomatedMessageTemplates(); // Add automated message templates - temporarily disabled
    await seedBlogPosts(); // Run this last since it depends on blog categories
    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
}