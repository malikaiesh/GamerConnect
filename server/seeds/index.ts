import { seedSignupOptions } from './signup-options';
import { seedGameCategories } from './game-categories';
import { seedBlogCategories } from './blog-categories';
import { seedBlogPosts } from './blog-posts';
import { seedStaticPages } from './static-pages';
import { seedTeamMembers } from './team-members';
import { seedEvents } from './events';
import { seedVerifiedUsers } from './verified-users';
import { seedVerifiedRooms } from './verified-rooms';
import { seedHeroImages } from './hero-images';

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
    await seedBlogPosts(); // Run this last since it depends on blog categories
    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
}