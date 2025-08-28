import { db } from '../db';
import { gameCategories } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_GAME_CATEGORIES = [
  {
    name: 'Action',
    slug: 'action',
    description: 'Fast-paced games with exciting combat and adventure',
    icon: 'ri-sword-line',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Explore vast worlds and uncover mysteries',
    icon: 'ri-compass-line',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'Puzzle',
    slug: 'puzzle',
    description: 'Mind-bending challenges and brain teasers',
    icon: 'ri-puzzle-line',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'Strategy',
    slug: 'strategy',
    description: 'Plan your moves and outsmart your opponents',
    icon: 'ri-chess-line',
    displayOrder: 4,
    isActive: true
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Athletic competitions and sports simulations',
    icon: 'ri-football-line',
    displayOrder: 5,
    isActive: true
  },
  {
    name: 'Racing',
    slug: 'racing',
    description: 'High-speed racing and driving games',
    icon: 'ri-car-line',
    displayOrder: 6,
    isActive: true
  },
  {
    name: 'Arcade',
    slug: 'arcade',
    description: 'Classic arcade-style games and retro fun',
    icon: 'ri-gamepad-line',
    displayOrder: 7,
    isActive: true
  },
  {
    name: 'Simulation',
    slug: 'simulation',
    description: 'Realistic simulations of real-world activities',
    icon: 'ri-building-line',
    displayOrder: 8,
    isActive: true
  },
  {
    name: 'Platform',
    slug: 'platform',
    description: 'Jump and run through challenging obstacle courses',
    icon: 'ri-user-2-line',
    displayOrder: 9,
    isActive: true
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Rhythm games and musical challenges',
    icon: 'ri-music-line',
    displayOrder: 10,
    isActive: true
  }
];

export async function seedGameCategories() {
  try {
    // Check if game categories already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(gameCategories);

    // Only seed if no categories exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default game categories...');
      
      await db.insert(gameCategories).values(DEFAULT_GAME_CATEGORIES);
      
      console.log(`✅ ${DEFAULT_GAME_CATEGORIES.length} game categories seeded successfully`);
    } else {
      console.log('ℹ️  Game categories already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding game categories:', error);
    throw error;
  }
}