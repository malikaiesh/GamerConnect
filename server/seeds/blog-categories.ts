import { db } from '../db';
import { blogCategories } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_BLOG_CATEGORIES = [
  {
    name: 'Game Development',
    slug: 'game-development'
  },
  {
    name: 'Gaming News',
    slug: 'gaming-news'
  },
  {
    name: 'Reviews',
    slug: 'reviews'
  },
  {
    name: 'Tutorials',
    slug: 'tutorials'
  },
  {
    name: 'Industry',
    slug: 'industry'
  },
  {
    name: 'Community',
    slug: 'community'
  }
];

export async function seedBlogCategories() {
  try {
    // Check if blog categories already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(blogCategories);

    // Only seed if no categories exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default blog categories...');
      
      await db.insert(blogCategories).values(DEFAULT_BLOG_CATEGORIES);
      
      console.log(`✅ ${DEFAULT_BLOG_CATEGORIES.length} blog categories seeded successfully`);
    } else {
      console.log('ℹ️  Blog categories already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding blog categories:', error);
    throw error;
  }
}