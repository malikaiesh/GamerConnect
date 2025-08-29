import { db } from '../db';
import { heroImages } from '@shared/schema';
import { count } from 'drizzle-orm';
// Use a direct path since this is a server-side file

const DEFAULT_HERO_IMAGES = [
  {
    title: 'High-Speed Gaming',
    description: 'Experience the thrill of fast-paced racing games',
    imagePath: '/uploads/hero/car.png',
    linkUrl: '/games?category=racing',
    linkText: 'Play Racing Games',
    isActive: true,
    sortOrder: 1,
    displayDuration: 5000
  },
  {
    title: 'Ultimate Gaming Experience', 
    description: 'Join thousands of gamers in our premium gaming portal',
    imagePath: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    linkUrl: '/games',
    linkText: 'Explore Games',
    isActive: true,
    sortOrder: 2,
    displayDuration: 4000
  },
  {
    title: 'Compete & Win',
    description: 'Challenge players worldwide and climb the leaderboards',
    imagePath: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    linkUrl: '/rooms',
    linkText: 'Join Tournament',
    isActive: true,
    sortOrder: 3,
    displayDuration: 6000
  }
];

export async function seedHeroImages() {
  try {
    // Check if hero images already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(heroImages);

    // Only seed if no images exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default hero images...');
      
      await db.insert(heroImages).values(DEFAULT_HERO_IMAGES);
      
      console.log(`✅ ${DEFAULT_HERO_IMAGES.length} hero images seeded successfully`);
    } else {
      console.log('ℹ️  Hero images already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding hero images:', error);
    throw error;
  }
}