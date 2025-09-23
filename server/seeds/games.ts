import { db } from "@db";
import { games, gameCategories } from '@shared/schema';
import { count, eq } from 'drizzle-orm';

export async function seedGames() {
  try {
    // Check if we need to add the additional 30 games
    const [existingCount] = await db
      .select({ count: count() })
      .from(games);

    // Add additional games if we have less than 38 total games
    if (existingCount.count < 38) {
      console.log(`🎮 Adding ${38 - existingCount.count} more games...`);
      
      // Get categories for reference
      const categories = await db.select().from(gameCategories);
      const actionCategory = categories.find(c => c.slug === 'action');
      const puzzleCategory = categories.find(c => c.slug === 'puzzle');
      const arcadeCategory = categories.find(c => c.slug === 'arcade');
      const adventureCategory = categories.find(c => c.slug === 'adventure');
      const strategyCategory = categories.find(c => c.slug === 'strategy');
      const racingCategory = categories.find(c => c.slug === 'racing');
      const sportsCategory = categories.find(c => c.slug === 'sports');
      const fightingCategory = categories.find(c => c.slug === 'fighting');
      const shootingCategory = categories.find(c => c.slug === 'shooting');
      const simulationCategory = categories.find(c => c.slug === 'simulation');
      const platformCategory = categories.find(c => c.slug === 'platform');
      const musicCategory = categories.find(c => c.slug === 'music');
      const casualCategory = categories.find(c => c.slug === 'casual');
      const horrorCategory = categories.find(c => c.slug === 'horror');

      const SAMPLE_GAMES = [
        {
          title: 'Space Explorer',
          slug: 'space-explorer',
          description: 'An exciting space adventure game where you explore galaxies and fight alien enemies. Collect power-ups and upgrade your spacecraft to survive in the vast universe.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwYWNlIEV4cGxvcmVyPC90ZXh0Pjwvc3ZnPg==',
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOUI1OUI2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlB1enpsZSBNYXN0ZXI8L3RleHQ+PC9zdmc+'
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTc0QzNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJhY2luZyBUaHVuZGVyPC90ZXh0Pjwvc3ZnPg=='
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjM5QzEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJldHJvIEFyY2FkZTwvdGV4dD48L3N2Zz4='
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjdBRTYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk15c3RlcnkgSXNsYW5kPC90ZXh0Pjwvc3ZnPg=='
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEU0NEFEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0cmF0ZWd5IFdhcnM8L3RleHQ+PC9zdmc+'
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzQ0OTVFIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5pbmphIFJ1bm5lcjwvdGV4dD48L3N2Zz4='
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
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTY3RTIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbG9yIE1hdGNoPC90ZXh0Pjwvc3ZnPg=='
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
        },
        // Adding 30 more games for a total of 38 games
        {
          title: 'Soccer Championship',
          slug: 'soccer-championship',
          description: 'Lead your team to victory in this exciting soccer simulation. Master tactics, train players, and compete in international tournaments.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkVDQzcxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNvY2NlciBDaGFtcGlvbnNoaXA8L3RleHQ+PC9zdmc+'
          url: '/games/soccer-championship',
          category: 'Sports',
          categoryId: sportsCategory?.id || 5,
          tags: ['soccer', 'football', 'sports', 'tournament'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1876,
          rating: 88,
          ratingCount: 34,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use mouse to control players, click to pass and shoot!'
        },
        {
          title: 'Street Fighter Arena',
          slug: 'street-fighter-arena',
          description: 'Master martial arts in this intense fighting game. Learn combos, special moves, and defeat opponents in epic battles.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQzAzOTJCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0cmVldCBGaWdodGVyPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/street-fighter-arena',
          category: 'Fighting',
          categoryId: fightingCategory?.id || 11,
          tags: ['fighting', 'martial arts', 'combat', 'arena'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 1543,
          rating: 90,
          ratingCount: 28,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use arrow keys to move, A/S/D for punch/kick/block!'
        },
        {
          title: 'Zombie Shooter',
          slug: 'zombie-shooter',
          description: 'Survive the zombie apocalypse in this action-packed shooter. Collect weapons, build defenses, and fight waves of undead.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEI0NTEzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlovbWJpZSBTaG9vdGVyPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/zombie-shooter',
          category: 'Shooting',
          categoryId: shootingCategory?.id || 12,
          tags: ['zombie', 'shooting', 'survival', 'action'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 2987,
          rating: 89,
          ratingCount: 67,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'WASD to move, mouse to aim and shoot, R to reload!'
        },
        {
          title: 'City Builder',
          slug: 'city-builder',
          description: 'Build and manage your dream city. Plan infrastructure, manage resources, and keep citizens happy in this simulation game.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzQ5OERCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNpdHkgQnVpbGRlcjwvdGV4dD48L3N2Zz4='
          url: '/games/city-builder',
          category: 'Simulation',
          categoryId: simulationCategory?.id || 8,
          tags: ['city', 'building', 'simulation', 'management'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 1234,
          rating: 92,
          ratingCount: 21,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to build structures, manage resources and citizens!'
        },
        {
          title: 'Jump Master',
          slug: 'jump-master',
          description: 'Navigate through challenging platformer levels. Jump, climb, and solve puzzles to reach the end of each stage.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTZBMDg1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkp1bXAgTWFzdGVyPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/jump-master',
          category: 'Platform',
          categoryId: platformCategory?.id || 9,
          tags: ['platform', 'jumping', 'adventure', 'puzzle'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 876,
          rating: 85,
          ratingCount: 19,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Arrow keys to move, spacebar to jump, collect all coins!'
        },
        {
          title: 'Rhythm Beat',
          slug: 'rhythm-beat',
          description: 'Hit the notes to the beat in this musical rhythm game. Perfect your timing and unlock new songs and challenges.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOUI1OUI2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJoeXRobSBCZWF0PC90ZXh0Pjwvc3ZnPg=='
          url: '/games/rhythm-beat',
          category: 'Music',
          categoryId: musicCategory?.id || 10,
          tags: ['music', 'rhythm', 'beat', 'timing'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1765,
          rating: 91,
          ratingCount: 29,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Tap the notes when they reach the line to the beat!'
        },
        {
          title: 'Bubble Pop',
          slug: 'bubble-pop',
          description: 'Pop colorful bubbles in this relaxing casual game. Match colors, create combos, and clear all bubbles to advance.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjM5QzEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJ1YmJsZSBQb3A8L3RleHQ+PC9zdmc+'
          url: '/games/bubble-pop',
          category: 'Casual',
          categoryId: casualCategory?.id || 25,
          tags: ['bubble', 'casual', 'relaxing', 'matching'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 3456,
          rating: 87,
          ratingCount: 78,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Aim and shoot bubbles to match 3 or more of the same color!'
        },
        {
          title: 'Horror Mansion',
          slug: 'horror-mansion',
          description: 'Explore a haunted mansion filled with dark secrets. Solve puzzles, avoid dangers, and uncover the truth behind the horror.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkMzRTUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhvcnJvciBNYW5zaW9uPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/horror-mansion',
          category: 'Horror',
          categoryId: horrorCategory?.id || 15,
          tags: ['horror', 'scary', 'mystery', 'exploration'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 987,
          rating: 88,
          ratingCount: 16,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to interact, find clues and escape the mansion!'
        },
        {
          title: 'Tank Battle',
          slug: 'tank-battle',
          description: 'Command powerful tanks in epic battlefield combat. Destroy enemy vehicles and capture strategic points.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOTVBNUE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRhbmsgQmF0dGxlPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/tank-battle',
          category: 'Action',
          categoryId: actionCategory?.id || 1,
          tags: ['tanks', 'war', 'strategy', 'combat'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 2134,
          rating: 86,
          ratingCount: 45,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'WASD to move tank, mouse to aim and shoot!'
        },
        {
          title: 'Word Quest',
          slug: 'word-quest',
          description: 'Challenge your vocabulary in this word puzzle adventure. Find hidden words, solve anagrams, and unlock new levels.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTc0QzNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFvcmQgUXVlc3Q8L3RleHQ+PC9zdmc+'
          url: '/games/word-quest',
          category: 'Puzzle',
          categoryId: puzzleCategory?.id || 3,
          tags: ['word', 'vocabulary', 'puzzle', 'education'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1456,
          rating: 89,
          ratingCount: 31,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Swipe letters to form words, find all hidden words!'
        },
        {
          title: 'Drift King',
          slug: 'drift-king',
          description: 'Master the art of drifting in this high-speed racing game. Perfect your techniques on mountain roads and city streets.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzQ0OTVFIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRyaWZ0IEtpbmc8L3RleHQ+PC9zdmc+'
          url: '/games/drift-king',
          category: 'Racing',
          categoryId: racingCategory?.id || 6,
          tags: ['drift', 'racing', 'cars', 'skill'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1789,
          rating: 90,
          ratingCount: 38,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Arrow keys to steer, space to handbrake for drifting!'
        },
        {
          title: 'Magic Tower Defense',
          slug: 'magic-tower-defense',
          description: 'Defend your kingdom with magical towers. Use spells, upgrade defenses, and stop enemy waves from reaching your castle.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEU0NEFEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRvd2VyIERlZmVuc2U8L3RleHQ+PC9zdmc+'
          url: '/games/magic-tower-defense',
          category: 'Strategy',
          categoryId: strategyCategory?.id || 4,
          tags: ['tower defense', 'magic', 'strategy', 'fantasy'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 2876,
          rating: 93,
          ratingCount: 52,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to place towers, upgrade them to stop enemies!'
        },
        {
          title: 'Flying Adventure',
          slug: 'flying-adventure',
          description: 'Soar through the skies in this adventure game. Navigate obstacles, collect items, and explore beautiful landscapes.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNTJDOUNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZseWluZyBBZHZlbnR1cmU8L3RleHQ+PC9zdmc+'
          url: '/games/flying-adventure',
          category: 'Adventure',
          categoryId: adventureCategory?.id || 2,
          tags: ['flying', 'adventure', 'exploration', 'sky'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1234,
          rating: 86,
          ratingCount: 22,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Mouse to control flight, avoid obstacles and collect stars!'
        },
        {
          title: 'Pinball Classic',
          slug: 'pinball-classic',
          description: 'Experience classic pinball action with modern graphics. Hit targets, activate bonuses, and achieve high scores.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDM1NDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBpbmJhbGwgQ2xhc3NpYzwvdGV4dD48L3N2Zz4='
          url: '/games/pinball-classic',
          category: 'Arcade',
          categoryId: arcadeCategory?.id || 7,
          tags: ['pinball', 'arcade', 'classic', 'score'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1567,
          rating: 84,
          ratingCount: 26,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Left/Right arrow keys or A/D to control flippers!'
        },
        {
          title: 'Basketball Pro',
          slug: 'basketball-pro',
          description: 'Shoot hoops like a pro in this basketball game. Perfect your aim, make trick shots, and dominate the court.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTY3RTIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhc2tldGJhbGwgUHJvPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/basketball-pro',
          category: 'Sports',
          categoryId: sportsCategory?.id || 5,
          tags: ['basketball', 'sports', 'shooting', 'skill'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 2345,
          rating: 87,
          ratingCount: 43,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Drag to aim, release to shoot the ball into the hoop!'
        },
        {
          title: 'Martial Arts Master',
          slug: 'martial-arts-master',
          description: 'Train in various martial arts disciplines. Learn techniques, compete in tournaments, and become the ultimate fighter.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQTU2OUJEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hcnRpYWwgQXJ0czwvdGV4dD48L3N2Zz4='
          url: '/games/martial-arts-master',
          category: 'Fighting',
          categoryId: fightingCategory?.id || 11,
          tags: ['martial arts', 'fighting', 'training', 'tournament'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1456,
          rating: 91,
          ratingCount: 25,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use combination keys for different fighting moves!'
        },
        {
          title: 'Sniper Elite',
          slug: 'sniper-elite',
          description: 'Take on the role of an elite sniper. Complete stealth missions, take precise shots, and eliminate targets.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNUQ0MDM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNuaXBlciBFbGl0ZTwvdGV4dD48L3N2Zz4='
          url: '/games/sniper-elite',
          category: 'Shooting',
          categoryId: shootingCategory?.id || 12,
          tags: ['sniper', 'stealth', 'precision', 'missions'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 3421,
          rating: 92,
          ratingCount: 76,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Mouse to aim, click to shoot, hold breath for precision!'
        },
        {
          title: 'Farm Simulator',
          slug: 'farm-simulator',
          description: 'Build and manage your own farm. Grow crops, raise animals, and expand your agricultural empire.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjdBRTYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZhcm0gU2ltdWxhdG9yPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/farm-simulator',
          category: 'Simulation',
          categoryId: simulationCategory?.id || 8,
          tags: ['farming', 'simulation', 'crops', 'animals'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1987,
          rating: 88,
          ratingCount: 35,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to plant crops, tend animals, and harvest produce!'
        },
        {
          title: 'Super Jumper',
          slug: 'super-jumper',
          description: 'Jump your way through challenging platforms. Time your jumps perfectly and collect power-ups to reach new heights.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjFDNDBGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN1cGVyIEp1bXBlcjwvdGV4dD48L3N2Zz4='
          url: '/games/super-jumper',
          category: 'Platform',
          categoryId: platformCategory?.id || 9,
          tags: ['jumping', 'platform', 'timing', 'power-ups'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1678,
          rating: 85,
          ratingCount: 29,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Tap to jump, hold for higher jumps, avoid obstacles!'
        },
        {
          title: 'DJ Mixer',
          slug: 'dj-mixer',
          description: 'Create amazing music mixes in this DJ simulation. Mix tracks, add effects, and become the ultimate party DJ.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOUMyN0IwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRKIE1peGVyPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/dj-mixer',
          category: 'Music',
          categoryId: musicCategory?.id || 10,
          tags: ['dj', 'music', 'mixing', 'party'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1543,
          rating: 89,
          ratingCount: 27,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Use sliders and buttons to mix music tracks!'
        },
        {
          title: 'Candy Crush',
          slug: 'candy-crush',
          description: 'Match delicious candies in this sweet puzzle game. Create combos, clear obstacles, and progress through hundreds of levels.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTkxRTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhbmR5IENydXNoPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/candy-crush',
          category: 'Casual',
          categoryId: casualCategory?.id || 25,
          tags: ['candy', 'match', 'sweet', 'puzzle'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 4567,
          rating: 86,
          ratingCount: 89,
          fileType: 'html5' as const,
          orientation: 'portrait',
          instructions: 'Swap candies to match 3 or more of the same type!'
        },
        {
          title: 'Haunted House',
          slug: 'haunted-house',
          description: 'Explore a terrifying haunted house. Collect clues, solve mysteries, and survive the supernatural encounters.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDI0MjQyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhhbnRlZCBIb3VzZTwvdGV4dD48L3N2Zz4='
          url: '/games/haunted-house',
          category: 'Horror',
          categoryId: horrorCategory?.id || 15,
          tags: ['haunted', 'scary', 'supernatural', 'mystery'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1234,
          rating: 87,
          ratingCount: 18,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to explore rooms, find clues to escape!'
        },
        {
          title: 'Mech Warrior',
          slug: 'mech-warrior',
          description: 'Pilot giant mechs in futuristic battles. Customize your mech, engage in combat, and dominate the battlefield.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjA3RDhCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lY2ggV2FycmlvcjwvdGV4dD48L3N2Zz4='
          url: '/games/mech-warrior',
          category: 'Action',
          categoryId: actionCategory?.id || 1,
          tags: ['mech', 'robot', 'futuristic', 'combat'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1876,
          rating: 90,
          ratingCount: 33,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'WASD to move mech, mouse to aim and fire weapons!'
        },
        {
          title: 'Crossword Champion',
          slug: 'crossword-champion',
          description: 'Solve challenging crossword puzzles. Test your knowledge across various topics and become a word master.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNzk1NTQ4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNyb3Nzd29yZCBDaGFtcGlvbjwvdGV4dD48L3N2Zz4='
          url: '/games/crossword-champion',
          category: 'Puzzle',
          categoryId: puzzleCategory?.id || 3,
          tags: ['crossword', 'words', 'knowledge', 'brain'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1345,
          rating: 91,
          ratingCount: 24,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click on clues and type answers to fill the crossword!'
        },
        {
          title: 'Motorcycle Racing',
          slug: 'motorcycle-racing',
          description: 'Race high-speed motorcycles on dangerous tracks. Lean into turns, avoid crashes, and cross the finish line first.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY1NzIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vdG9yY3ljbGUgUmFjaW5nPC90ZXh0Pjwvc3ZnPg=='
          url: '/games/motorcycle-racing',
          category: 'Racing',
          categoryId: racingCategory?.id || 6,
          tags: ['motorcycle', 'racing', 'speed', 'danger'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 2456,
          rating: 88,
          ratingCount: 47,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Arrow keys to steer, lean into turns for better control!'
        },
        {
          title: 'Chess Master',
          slug: 'chess-master',
          description: 'Play the classic game of chess against AI opponents of varying difficulty. Improve your strategy and become a grandmaster.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDU1QTY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoZXNzIE1hc3RlcjwvdGV4dD48L3N2Zz4='
          url: '/games/chess-master',
          category: 'Strategy',
          categoryId: strategyCategory?.id || 4,
          tags: ['chess', 'strategy', 'thinking', 'classic'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1765,
          rating: 94,
          ratingCount: 41,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to select and move pieces, plan your strategy!'
        },
        {
          title: 'Treasure Hunt',
          slug: 'treasure-hunt',
          description: 'Embark on an epic treasure hunting adventure. Solve puzzles, find clues, and discover hidden riches.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY5ODAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRyZWFzdXJlIEh1bnQ8L3RleHQ+PC9zdmc+'
          url: '/games/treasure-hunt',
          category: 'Adventure',
          categoryId: adventureCategory?.id || 2,
          tags: ['treasure', 'adventure', 'exploration', 'mystery'],
          source: 'custom' as const,
          status: 'active' as const,
          plays: 1567,
          rating: 87,
          ratingCount: 28,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Click to interact with objects, find treasure clues!'
        },
        {
          title: 'Pac-Man Classic',
          slug: 'pac-man-classic',
          description: 'Relive the classic arcade experience. Navigate mazes, collect dots, and avoid ghosts in this timeless game.',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZFQjNCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBhYy1NYW4gQ2xhc3NpYzwvdGV4dD48L3N2Zz4='
          url: '/games/pac-man-classic',
          category: 'Arcade',
          categoryId: arcadeCategory?.id || 7,
          tags: ['pac-man', 'classic', 'arcade', 'retro'],
          source: 'custom' as const,
          status: 'featured' as const,
          plays: 3876,
          rating: 92,
          ratingCount: 68,
          fileType: 'html5' as const,
          orientation: 'landscape',
          instructions: 'Arrow keys to move, eat dots and avoid ghosts!'
        }
      ];
      
      // Only insert games that don't already exist
      const existingGames = await db.select({ slug: games.slug }).from(games);
      const existingSlugs = new Set(existingGames.map(g => g.slug));
      
      const newGames = SAMPLE_GAMES.filter(game => !existingSlugs.has(game.slug));
      
      if (newGames.length > 0) {
        await db.insert(games).values(newGames);
        console.log(`✅ ${newGames.length} new games added successfully`);
      } else {
        console.log('ℹ️  All games already exist');
      }
    } else {
      console.log('ℹ️  Already have 38 games, skipping additional seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding games:', error);
    throw error;
  }
}