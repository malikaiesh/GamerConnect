import { db } from "@db";
import { gameCategories } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_GAME_CATEGORIES = [
  // Original 10 categories - keep these
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
  },

  // User's requested 20 categories
  {
    name: 'Fighting',
    slug: 'fighting',
    description: 'Combat games with martial arts and fighting techniques',
    icon: 'ri-boxing-line',
    displayOrder: 11,
    isActive: true
  },
  {
    name: 'Shooting',
    slug: 'shooting',
    description: 'First-person and third-person shooting games',
    icon: 'ri-target-line',
    displayOrder: 12,
    isActive: true
  },
  {
    name: 'Stealth',
    slug: 'stealth',
    description: 'Sneak and infiltrate with strategic stealth gameplay',
    icon: 'ri-spy-line',
    displayOrder: 13,
    isActive: true
  },
  {
    name: 'Survival',
    slug: 'survival',
    description: 'Survive in challenging environments with limited resources',
    icon: 'ri-tent-line',
    displayOrder: 14,
    isActive: true
  },
  {
    name: 'Horror',
    slug: 'horror',
    description: 'Scary and suspenseful horror games',
    icon: 'ri-ghost-line',
    displayOrder: 15,
    isActive: true
  },
  {
    name: 'Role-Playing (RPG)',
    slug: 'rpg',
    description: 'Role-playing games with character development and stories',
    icon: 'ri-user-star-line',
    displayOrder: 16,
    isActive: true
  },
  {
    name: 'Multiplayer Online Battle Arena (MOBA)',
    slug: 'moba',
    description: 'Competitive team-based strategy battles online',
    icon: 'ri-team-line',
    displayOrder: 17,
    isActive: true
  },
  {
    name: 'Battle Royale',
    slug: 'battle-royale',
    description: 'Last player standing in large-scale combat arenas',
    icon: 'ri-shield-cross-line',
    displayOrder: 18,
    isActive: true
  },
  {
    name: 'Roguelike / Roguelite',
    slug: 'roguelike',
    description: 'Procedurally generated dungeons with permadeath mechanics',
    icon: 'ri-skull-2-line',
    displayOrder: 19,
    isActive: true
  },
  {
    name: 'Sandbox',
    slug: 'sandbox',
    description: 'Open-world creative building and exploration games',
    icon: 'ri-hammer-line',
    displayOrder: 20,
    isActive: true
  },
  {
    name: 'Open World',
    slug: 'open-world',
    description: 'Vast explorable worlds with freedom of movement',
    icon: 'ri-earth-line',
    displayOrder: 21,
    isActive: true
  },
  {
    name: 'Card / Board Games',
    slug: 'card-board-games',
    description: 'Digital versions of classic card and board games',
    icon: 'ri-file-list-3-line',
    displayOrder: 22,
    isActive: true
  },
  {
    name: 'Trivia / Quiz',
    slug: 'trivia-quiz',
    description: 'Test your knowledge with trivia and quiz games',
    icon: 'ri-question-line',
    displayOrder: 23,
    isActive: true
  },
  {
    name: 'Educational',
    slug: 'educational',
    description: 'Learn while you play with educational games',
    icon: 'ri-book-line',
    displayOrder: 24,
    isActive: true
  },
  {
    name: 'Casual',
    slug: 'casual',
    description: 'Easy-to-play games for everyone',
    icon: 'ri-user-smile-line',
    displayOrder: 25,
    isActive: true
  },
  {
    name: 'Idle / Clicker',
    slug: 'idle-clicker',
    description: 'Simple clicking games that progress automatically',
    icon: 'ri-cursor-line',
    displayOrder: 26,
    isActive: true
  },
  {
    name: 'Party Games',
    slug: 'party-games',
    description: 'Fun multiplayer games for groups and parties',
    icon: 'ri-group-line',
    displayOrder: 27,
    isActive: true
  },
  {
    name: 'Virtual Reality (VR)',
    slug: 'vr',
    description: 'Immersive virtual reality gaming experiences',
    icon: 'ri-vr-box-line',
    displayOrder: 28,
    isActive: true
  },
  {
    name: 'Augmented Reality (AR)',
    slug: 'ar',
    description: 'Augmented reality games that blend digital and real worlds',
    icon: 'ri-smartphone-line',
    displayOrder: 29,
    isActive: true
  },
  {
    name: 'Two Player Games',
    slug: 'two-player',
    description: 'Games designed specifically for two players',
    icon: 'ri-user-2-line',
    displayOrder: 30,
    isActive: true
  }
];

export async function seedGameCategories() {
  try {
    console.log('🌱 Seeding game categories...');
    
    // Insert or update categories (using upsert logic)
    for (const category of DEFAULT_GAME_CATEGORIES) {
      try {
        // Try to insert, if it fails due to unique constraint, we'll handle it
        await db.insert(gameCategories).values(category);
      } catch (insertError: any) {
        // If category already exists (by slug), skip it
        if (insertError.code === '23505') { // Unique violation error code
          console.log(`ℹ️  Category "${category.name}" already exists, skipping`);
        } else {
          console.error(`❌ Error inserting category "${category.name}":`, insertError);
        }
      }
    }
    
    // Get final count
    const [finalCount] = await db
      .select({ count: count() })
      .from(gameCategories);
    
    console.log(`✅ Game categories seeding completed. Total categories: ${finalCount.count}`);
  } catch (error) {
    console.error('❌ Error seeding game categories:', error);
    throw error;
  }
}