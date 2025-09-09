import { db } from '../db';
import { gameCategories } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_GAME_CATEGORIES = [
  // Core Action Categories
  {
    name: 'Action',
    slug: 'action',
    description: 'Fast-paced games with exciting combat and adventure',
    icon: 'ri-sword-line',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'Shooter',
    slug: 'shooter',
    description: 'First-person and third-person shooting games',
    icon: 'ri-target-line',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'Fighting',
    slug: 'fighting',
    description: 'Combat games with martial arts and fighting techniques',
    icon: 'ri-boxing-line',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'Platform',
    slug: 'platform',
    description: 'Jump and run through challenging obstacle courses',
    icon: 'ri-user-2-line',
    displayOrder: 4,
    isActive: true
  },
  
  // Adventure & RPG
  {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Explore vast worlds and uncover mysteries',
    icon: 'ri-compass-line',
    displayOrder: 5,
    isActive: true
  },
  {
    name: 'RPG',
    slug: 'rpg',
    description: 'Role-playing games with character development',
    icon: 'ri-user-star-line',
    displayOrder: 6,
    isActive: true
  },
  {
    name: 'Fantasy',
    slug: 'fantasy',
    description: 'Magical worlds with wizards, dragons, and mythical creatures',
    icon: 'ri-magic-line',
    displayOrder: 7,
    isActive: true
  },
  
  // Strategy & Puzzle
  {
    name: 'Strategy',
    slug: 'strategy',
    description: 'Plan your moves and outsmart your opponents',
    icon: 'ri-chess-line',
    displayOrder: 8,
    isActive: true
  },
  {
    name: 'Puzzle',
    slug: 'puzzle',
    description: 'Mind-bending challenges and brain teasers',
    icon: 'ri-puzzle-line',
    displayOrder: 9,
    isActive: true
  },
  {
    name: 'Tower Defense',
    slug: 'tower-defense',
    description: 'Defend your territory by building strategic towers',
    icon: 'ri-building-2-line',
    displayOrder: 10,
    isActive: true
  },
  {
    name: 'Card Games',
    slug: 'card-games',
    description: 'Strategic card battles and casino games',
    icon: 'ri-file-list-3-line',
    displayOrder: 11,
    isActive: true
  },
  
  // Sports & Racing
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Athletic competitions and sports simulations',
    icon: 'ri-football-line',
    displayOrder: 12,
    isActive: true
  },
  {
    name: 'Racing',
    slug: 'racing',
    description: 'High-speed racing and driving games',
    icon: 'ri-car-line',
    displayOrder: 13,
    isActive: true
  },
  {
    name: 'Football',
    slug: 'football',
    description: 'Soccer and American football games',
    icon: 'ri-football-fill',
    displayOrder: 14,
    isActive: true
  },
  {
    name: 'Basketball',
    slug: 'basketball',
    description: 'Basketball games and court competitions',
    icon: 'ri-basketball-line',
    displayOrder: 15,
    isActive: true
  },
  
  // Simulation & Building
  {
    name: 'Simulation',
    slug: 'simulation',
    description: 'Realistic simulations of real-world activities',
    icon: 'ri-building-line',
    displayOrder: 16,
    isActive: true
  },
  {
    name: 'Building',
    slug: 'building',
    description: 'Construction and city-building games',
    icon: 'ri-hammer-line',
    displayOrder: 17,
    isActive: true
  },
  {
    name: 'Management',
    slug: 'management',
    description: 'Business and resource management games',
    icon: 'ri-briefcase-line',
    displayOrder: 18,
    isActive: true
  },
  {
    name: 'Farming',
    slug: 'farming',
    description: 'Agricultural and farming simulation games',
    icon: 'ri-plant-line',
    displayOrder: 19,
    isActive: true
  },
  
  // Classic & Retro
  {
    name: 'Arcade',
    slug: 'arcade',
    description: 'Classic arcade-style games and retro fun',
    icon: 'ri-gamepad-line',
    displayOrder: 20,
    isActive: true
  },
  {
    name: 'Retro',
    slug: 'retro',
    description: 'Nostalgic games with vintage aesthetics',
    icon: 'ri-tv-line',
    displayOrder: 21,
    isActive: true
  },
  {
    name: 'Classic',
    slug: 'classic',
    description: 'Timeless games that never go out of style',
    icon: 'ri-time-line',
    displayOrder: 22,
    isActive: true
  },
  
  // Music & Art
  {
    name: 'Music',
    slug: 'music',
    description: 'Rhythm games and musical challenges',
    icon: 'ri-music-line',
    displayOrder: 23,
    isActive: true
  },
  {
    name: 'Art',
    slug: 'art',
    description: 'Creative drawing and artistic games',
    icon: 'ri-palette-line',
    displayOrder: 24,
    isActive: true
  },
  
  // Multiplayer & Social
  {
    name: 'Multiplayer',
    slug: 'multiplayer',
    description: 'Games to play with friends and other players',
    icon: 'ri-group-line',
    displayOrder: 25,
    isActive: true
  },
  {
    name: 'IO Games',
    slug: 'io-games',
    description: 'Competitive multiplayer browser games',
    icon: 'ri-global-line',
    displayOrder: 26,
    isActive: true
  },
  {
    name: 'MMO',
    slug: 'mmo',
    description: 'Massively multiplayer online games',
    icon: 'ri-earth-line',
    displayOrder: 27,
    isActive: true
  },
  
  // Specialized Categories
  {
    name: 'Horror',
    slug: 'horror',
    description: 'Scary and suspenseful horror games',
    icon: 'ri-ghost-line',
    displayOrder: 28,
    isActive: true
  },
  {
    name: 'Zombie',
    slug: 'zombie',
    description: 'Survive the zombie apocalypse',
    icon: 'ri-skull-line',
    displayOrder: 29,
    isActive: true
  },
  {
    name: 'War',
    slug: 'war',
    description: 'Military and war-themed games',
    icon: 'ri-shield-line',
    displayOrder: 30,
    isActive: true
  },
  {
    name: 'Ninja',
    slug: 'ninja',
    description: 'Stealth and ninja action games',
    icon: 'ri-spy-line',
    displayOrder: 31,
    isActive: true
  },
  {
    name: 'Space',
    slug: 'space',
    description: 'Explore the cosmos and fight alien invaders',
    icon: 'ri-rocket-line',
    displayOrder: 32,
    isActive: true
  },
  {
    name: 'Robot',
    slug: 'robot',
    description: 'Robotic battles and futuristic machines',
    icon: 'ri-robot-line',
    displayOrder: 33,
    isActive: true
  },
  {
    name: 'Superhero',
    slug: 'superhero',
    description: 'Save the world with superpowers',
    icon: 'ri-shield-star-line',
    displayOrder: 34,
    isActive: true
  },
  
  // Kids & Educational
  {
    name: 'Kids',
    slug: 'kids',
    description: 'Fun and safe games designed for children',
    icon: 'ri-bear-smile-line',
    displayOrder: 35,
    isActive: true
  },
  {
    name: 'Educational',
    slug: 'educational',
    description: 'Learn while you play with educational games',
    icon: 'ri-book-line',
    displayOrder: 36,
    isActive: true
  },
  {
    name: 'Math',
    slug: 'math',
    description: 'Mathematical puzzles and number games',
    icon: 'ri-calculator-line',
    displayOrder: 37,
    isActive: true
  },
  
  // Casual & Fun
  {
    name: 'Casual',
    slug: 'casual',
    description: 'Easy-to-play games for everyone',
    icon: 'ri-user-smile-line',
    displayOrder: 38,
    isActive: true
  },
  {
    name: 'Funny',
    slug: 'funny',
    description: 'Hilarious games that will make you laugh',
    icon: 'ri-emotion-laugh-line',
    displayOrder: 39,
    isActive: true
  },
  {
    name: 'Cooking',
    slug: 'cooking',
    description: 'Culinary adventures and restaurant management',
    icon: 'ri-restaurant-line',
    displayOrder: 40,
    isActive: true
  },
  {
    name: 'Dress Up',
    slug: 'dress-up',
    description: 'Fashion and styling games',
    icon: 'ri-shirt-line',
    displayOrder: 41,
    isActive: true
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Makeup and beauty transformation games',
    icon: 'ri-makeup-line',
    displayOrder: 42,
    isActive: true
  },
  
  // Adventure Themes
  {
    name: 'Escape',
    slug: 'escape',
    description: 'Escape rooms and break-out puzzles',
    icon: 'ri-door-line',
    displayOrder: 43,
    isActive: true
  },
  {
    name: 'Mystery',
    slug: 'mystery',
    description: 'Solve mysteries and uncover secrets',
    icon: 'ri-search-eye-line',
    displayOrder: 44,
    isActive: true
  },
  {
    name: 'Detective',
    slug: 'detective',
    description: 'Investigate crimes and solve cases',
    icon: 'ri-spy-line',
    displayOrder: 45,
    isActive: true
  },
  
  // Animals & Nature
  {
    name: 'Animal',
    slug: 'animal',
    description: 'Games featuring cute and wild animals',
    icon: 'ri-bear-smile-line',
    displayOrder: 46,
    isActive: true
  },
  {
    name: 'Pet',
    slug: 'pet',
    description: 'Take care of virtual pets and companions',
    icon: 'ri-heart-line',
    displayOrder: 47,
    isActive: true
  },
  {
    name: 'Fish',
    slug: 'fish',
    description: 'Underwater adventures and fishing games',
    icon: 'ri-fish-line',
    displayOrder: 48,
    isActive: true
  },
  
  // Additional Popular Categories
  {
    name: 'Truck',
    slug: 'truck',
    description: 'Heavy vehicle driving and parking games',
    icon: 'ri-truck-line',
    displayOrder: 49,
    isActive: true
  },
  {
    name: 'Bike',
    slug: 'bike',
    description: 'Motorcycle and bicycle racing games',
    icon: 'ri-bike-line',
    displayOrder: 50,
    isActive: true
  },
  {
    name: 'Plane',
    slug: 'plane',
    description: 'Aviation and flight simulation games',
    icon: 'ri-plane-line',
    displayOrder: 51,
    isActive: true
  },
  {
    name: 'Tank',
    slug: 'tank',
    description: 'Armored vehicle combat games',
    icon: 'ri-shield-cross-line',
    displayOrder: 52,
    isActive: true
  },
  {
    name: '3D',
    slug: '3d',
    description: 'Immersive three-dimensional gaming experiences',
    icon: 'ri-cube-line',
    displayOrder: 53,
    isActive: true
  },
  {
    name: 'Physics',
    slug: 'physics',
    description: 'Games with realistic physics mechanics',
    icon: 'ri-compasses-2-line',
    displayOrder: 54,
    isActive: true
  },
  {
    name: 'Stickman',
    slug: 'stickman',
    description: 'Simple stick figure action games',
    icon: 'ri-user-line',
    displayOrder: 55,
    isActive: true
  },
  {
    name: 'Pixel',
    slug: 'pixel',
    description: 'Retro pixel art style games',
    icon: 'ri-artboard-line',
    displayOrder: 56,
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