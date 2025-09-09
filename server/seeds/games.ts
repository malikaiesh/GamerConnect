import { db } from '../db';
import { games, gameCategories } from '@shared/schema';
import { count, eq } from 'drizzle-orm';

export async function seedGames() {
  try {
    // Check if games already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(games);

    // Only seed if no games exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🎮 Seeding sample games...');
      
      // Get categories for reference
      const categories = await db.select().from(gameCategories);
      const actionCategory = categories.find(c => c.slug === 'action');
      const puzzleCategory = categories.find(c => c.slug === 'puzzle');
      const arcadeCategory = categories.find(c => c.slug === 'arcade');
      const adventureCategory = categories.find(c => c.slug === 'adventure');
      const strategyCategory = categories.find(c => c.slug === 'strategy');
      const racingCategory = categories.find(c => c.slug === 'racing');

      const SAMPLE_GAMES = [
        {
          title: 'Space Explorer',
          slug: 'space-explorer',
          description: 'An exciting space adventure game where you explore galaxies and fight alien enemies. Collect power-ups and upgrade your spacecraft to survive in the vast universe.',
          thumbnail: '/uploads/games/space-explorer-thumb.jpg',
          url: '/games/space-explorer',
          category: 'Action',
          categoryId: actionCategory?.id || 1,
          tags: ['space', 'adventure', 'shooting', 'sci-fi'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 1245,
          rating: 89,
          ratingCount: 23,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use arrow keys to move, spacebar to shoot. Collect power-ups to upgrade your weapons!'
        },
        {
          title: 'Puzzle Master',
          slug: 'puzzle-master',
          description: 'Challenge your mind with this addictive puzzle game featuring over 100 levels of brain-teasing fun. Match colors, solve patterns, and unlock new challenges.',
          thumbnail: '/uploads/games/puzzle-master-thumb.jpg',
          url: '/games/puzzle-master',
          category: 'Puzzle',
          categoryId: puzzleCategory?.id || 3,
          tags: ['puzzle', 'brain', 'logic', 'matching'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 892,
          rating: 92,
          ratingCount: 18,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Drag and drop pieces to solve puzzles. Complete levels to unlock new challenges!'
        },
        {
          title: 'Racing Thunder',
          slug: 'racing-thunder',
          description: 'High-speed racing action with stunning graphics and realistic physics. Choose your car, customize it, and race against AI opponents on various tracks.',
          thumbnail: '/uploads/games/racing-thunder-thumb.jpg',
          url: '/games/racing-thunder',
          category: 'Racing',
          categoryId: racingCategory?.id || 6,
          tags: ['racing', 'cars', 'speed', 'competition'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 2156,
          rating: 87,
          ratingCount: 41,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use WASD or arrow keys to control your car. Avoid obstacles and reach the finish line!'
        },
        {
          title: 'Retro Arcade',
          slug: 'retro-arcade',
          description: 'Classic arcade-style gameplay that brings back the golden age of gaming. Simple controls, addictive gameplay, and endless fun for all ages.',
          thumbnail: '/uploads/games/retro-arcade-thumb.jpg',
          url: '/games/retro-arcade',
          category: 'Arcade',
          categoryId: arcadeCategory?.id || 7,
          tags: ['retro', 'classic', 'arcade', 'nostalgic'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 756,
          rating: 85,
          ratingCount: 15,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Simple controls: tap to play, avoid obstacles, collect coins!'
        },
        {
          title: 'Mystery Island',
          slug: 'mystery-island',
          description: 'Explore a mysterious island filled with secrets, puzzles, and hidden treasures. Uncover the island\'s dark past and find your way home.',
          thumbnail: '/uploads/games/mystery-island-thumb.jpg',
          url: '/games/mystery-island',
          category: 'Adventure',
          categoryId: adventureCategory?.id || 2,
          tags: ['adventure', 'mystery', 'exploration', 'story'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 634,
          rating: 91,
          ratingCount: 12,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to interact with objects, solve puzzles to progress through the story.'
        },
        {
          title: 'Strategy Wars',
          slug: 'strategy-wars',
          description: 'Build your empire, manage resources, and lead your army to victory in this turn-based strategy game. Plan your moves carefully to outsmart your enemies.',
          thumbnail: '/uploads/games/strategy-wars-thumb.jpg',
          url: '/games/strategy-wars',
          category: 'Strategy',
          categoryId: strategyCategory?.id || 4,
          tags: ['strategy', 'war', 'tactics', 'building'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 1089,
          rating: 88,
          ratingCount: 27,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to select units, drag to move them. Plan your strategy and conquer territories!'
        },
        {
          title: 'Ninja Runner',
          slug: 'ninja-runner',
          description: 'Fast-paced endless runner game featuring a skilled ninja. Jump, slide, and use special abilities to overcome obstacles and collect coins.',
          thumbnail: '/uploads/games/ninja-runner-thumb.jpg',
          url: '/games/ninja-runner',
          category: 'Action',
          categoryId: actionCategory?.id || 1,
          tags: ['ninja', 'runner', 'action', 'endless'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1456,
          rating: 86,
          ratingCount: 32,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use up arrow to jump, down arrow to slide. Collect coins and power-ups!'
        },
        {
          title: 'Color Match',
          slug: 'color-match',
          description: 'Simple yet addictive color matching puzzle game. Match 3 or more colors to clear them and achieve high scores. Perfect for quick gaming sessions.',
          thumbnail: '/uploads/games/color-match-thumb.jpg',
          url: '/games/color-match',
          category: 'Puzzle',
          categoryId: puzzleCategory?.id || 3,
          tags: ['color', 'match', 'casual', 'relaxing'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 2234,
          rating: 83,
          ratingCount: 45,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Tap to select colors, match 3 or more of the same color to clear them!'
        }
      ];

      await db.insert(games).values(SAMPLE_GAMES);
      
      console.log(`✅ ${SAMPLE_GAMES.length} sample games seeded successfully`);
    } else {
      console.log('ℹ️  Games already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding games:', error);
    throw error;
  }
}