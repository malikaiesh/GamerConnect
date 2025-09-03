import { seedSignupOptions } from './signup-options';
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

// Main seeding function that runs all seeds
export async function runSeeds() {
  console.log('🌱 Running database seeds...');
  
  try {
    // Run all seeds in proper order
    await seedSignupOptions();
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
    await seedBlogPosts(); // Run this last since it depends on blog categories
    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
}