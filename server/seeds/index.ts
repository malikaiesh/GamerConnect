import { seedSignupOptions } from './signup-options';
import { seedGameCategories } from './game-categories';
import { seedBlogCategories } from './blog-categories';
import { seedBlogPosts } from './blog-posts';
import { seedStaticPages } from './static-pages';

// Main seeding function that runs all seeds
export async function runSeeds() {
  console.log('🌱 Running database seeds...');
  
  try {
    // Run all seeds in proper order
    await seedSignupOptions();
    await seedGameCategories();
    await seedBlogCategories();
    await seedStaticPages();
    await seedBlogPosts(); // Run this last since it depends on blog categories
    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
}