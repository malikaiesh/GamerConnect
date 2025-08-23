import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import slugify from "../server/utils/slugify";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Add admin user
    console.log("Adding admin user...");
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.username, "admin")
    });
    
    if (!existingAdmin) {
      await db.insert(schema.users).values({
        username: "admin",
        password: "admin123", // In a real environment, this would be hashed
        isAdmin: true
      });
      console.log("Admin user created with username: 'admin' and password: 'admin123'");
    } else {
      console.log("Admin user already exists");
    }

    // Add sample games - Featured Games (10 total)
    const featuredGamesData = [
      {
        title: "Space Adventure",
        description: "Explore the vastness of space in this exciting adventure game.",
        thumbnail: "https://images.unsplash.com/photo-1581822261290-991b38693823?w=500&h=350&q=80",
        url: "https://example.com/games/space-adventure",
        category: "Adventure",
        tags: ["space", "adventure", "exploration"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1250,
        rating: 4.7,
      },
      {
        title: "Zombie Survival",
        description: "Survive in a post-apocalyptic world filled with zombies.",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&h=350&q=80",
        url: "https://example.com/games/zombie-survival",
        category: "Action",
        tags: ["zombie", "survival", "horror"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 980,
        rating: 4.5,
      },
      {
        title: "Puzzle Master",
        description: "Challenge your brain with increasingly difficult puzzles.",
        thumbnail: "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=500&h=350&q=80",
        url: "https://example.com/games/puzzle-master",
        category: "Puzzle",
        tags: ["puzzle", "brain", "challenge"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 850,
        rating: 4.8,
      },
      {
        title: "Mystical Quest",
        description: "Journey through an enchanted world solving ancient mysteries.",
        thumbnail: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?w=500&h=350&q=80",
        url: "https://example.com/games/mystical-quest",
        category: "Adventure",
        tags: ["magic", "mystery", "puzzle"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1320,
        rating: 4.6,
      },
      {
        title: "Dungeon Crawler",
        description: "Explore dark dungeons, defeat monsters, and collect treasure.",
        thumbnail: "https://images.unsplash.com/photo-1626750950189-eaa6226a9164?w=500&h=350&q=80",
        url: "https://example.com/games/dungeon-crawler",
        category: "RPG",
        tags: ["dungeon", "rpg", "fantasy"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1470,
        rating: 4.5,
      },
      {
        title: "Cyberpunk Racer",
        description: "High-speed racing in a futuristic cyberpunk city.",
        thumbnail: "https://images.unsplash.com/photo-1534370242648-8a3e87adebf8?w=500&h=350&q=80",
        url: "https://example.com/games/cyberpunk-racer",
        category: "Racing",
        tags: ["racing", "future", "cyberpunk"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1620,
        rating: 4.7,
      },
      {
        title: "Tactical Combat",
        description: "Lead your squad in tactical turn-based combat operations.",
        thumbnail: "https://images.unsplash.com/photo-1603570724750-88bf70227c9c?w=500&h=350&q=80",
        url: "https://example.com/games/tactical-combat",
        category: "Strategy",
        tags: ["strategy", "tactical", "turn-based"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1150,
        rating: 4.6,
      },
      {
        title: "Athletic Championship",
        description: "Compete in various athletic events to win gold medals.",
        thumbnail: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&h=350&q=80",
        url: "https://example.com/games/athletic-championship",
        category: "Sports",
        tags: ["sports", "athletics", "competition"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 940,
        rating: 4.4,
      },
      {
        title: "Word Master",
        description: "Show off your vocabulary and spelling skills.",
        thumbnail: "https://images.unsplash.com/photo-1632580209569-64da0153c5e5?w=500&h=350&q=80",
        url: "https://example.com/games/word-master",
        category: "Puzzle",
        tags: ["word", "language", "education"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1280,
        rating: 4.3,
      },
      {
        title: "Shadow Ninja",
        description: "Stealthily navigate through enemy territories as a master ninja.",
        thumbnail: "https://images.unsplash.com/photo-1578645561141-dcfabfbfd8b5?w=500&h=350&q=80",
        url: "https://example.com/games/shadow-ninja",
        category: "Action",
        tags: ["stealth", "ninja", "action"],
        source: "custom" as const,
        status: "featured" as const,
        plays: 1540,
        rating: 4.9,
      }
    ];

    // Popular Games (20 total)
    const popularGamesData = [
      {
        title: "Racing Champions",
        description: "Race against opponents on challenging tracks around the world.",
        thumbnail: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&h=350&q=80",
        url: "https://example.com/games/racing-champions",
        category: "Racing",
        tags: ["racing", "cars", "speed"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2750,
        rating: 4.3,
      },
      {
        title: "Fantasy Quest",
        description: "Embark on an epic quest in a magical fantasy world.",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=350&q=80",
        url: "https://example.com/games/fantasy-quest",
        category: "RPG",
        tags: ["fantasy", "rpg", "adventure"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2620,
        rating: 4.6,
      },
      {
        title: "Sports Legends",
        description: "Compete in various sports competitions to become a legend.",
        thumbnail: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=500&h=350&q=80",
        url: "https://example.com/games/sports-legends",
        category: "Sports",
        tags: ["sports", "competition", "multiplayer"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2580,
        rating: 4.2,
      },
      {
        title: "Strategy Empire",
        description: "Build and expand your empire with strategic decisions.",
        thumbnail: "https://images.unsplash.com/photo-1528155124528-06c125d81e89?w=500&h=350&q=80",
        url: "https://example.com/games/strategy-empire",
        category: "Strategy",
        tags: ["strategy", "empire", "building"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2490,
        rating: 4.4,
      },
      {
        title: "Platformer Pro",
        description: "Jump and run through challenging platform levels.",
        thumbnail: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500&h=350&q=80",
        url: "https://example.com/games/platformer-pro",
        category: "Platformer",
        tags: ["platformer", "jumping", "retro"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2420,
        rating: 4.5,
      },
      {
        title: "Cosmic Defenders",
        description: "Defend your space station against waves of alien invaders.",
        thumbnail: "https://images.unsplash.com/photo-1614032686163-bdc24c13d0b6?w=500&h=350&q=80",
        url: "https://example.com/games/cosmic-defenders",
        category: "Action",
        tags: ["space", "shooter", "arcade"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2360,
        rating: 4.1,
      },
      {
        title: "Treasure Hunter",
        description: "Search for hidden treasures in ancient temples and ruins.",
        thumbnail: "https://images.unsplash.com/photo-1531565637446-32307b194362?w=500&h=350&q=80",
        url: "https://example.com/games/treasure-hunter",
        category: "Adventure",
        tags: ["exploration", "treasure", "archaeology"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2280,
        rating: 4.7,
      },
      {
        title: "Sudoku Challenge",
        description: "Test your logic skills with various difficulty levels of Sudoku.",
        thumbnail: "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=500&h=350&q=80",
        url: "https://example.com/games/sudoku-challenge",
        category: "Puzzle",
        tags: ["sudoku", "numbers", "logic"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2150,
        rating: 4.3,
      },
      {
        title: "Football Manager",
        description: "Manage your own football team, train players, and win championships.",
        thumbnail: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&h=350&q=80",
        url: "https://example.com/games/football-manager",
        category: "Sports",
        tags: ["football", "management", "strategy"],
        source: "custom" as const,
        status: "active" as const,
        plays: 2090,
        rating: 4.4,
      },
      {
        title: "Monster Hunter",
        description: "Track and hunt legendary monsters in a vast open world.",
        thumbnail: "https://images.unsplash.com/photo-1564874954014-d67fda465332?w=500&h=350&q=80",
        url: "https://example.com/games/monster-hunter",
        category: "RPG",
        tags: ["hunting", "monsters", "adventure"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1980,
        rating: 4.8,
      },
      {
        title: "City Builder",
        description: "Design and build your dream city from the ground up.",
        thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=350&q=80",
        url: "https://example.com/games/city-builder",
        category: "Strategy",
        tags: ["building", "simulation", "management"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1940,
        rating: 4.5,
      },
      {
        title: "Drift King",
        description: "Master the art of drifting in various exotic locations.",
        thumbnail: "https://images.unsplash.com/photo-1526231761088-6d2847588660?w=500&h=350&q=80",
        url: "https://example.com/games/drift-king",
        category: "Racing",
        tags: ["drifting", "cars", "skills"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1870,
        rating: 4.2,
      },
      {
        title: "Rhythm Master",
        description: "Test your rhythm and timing with this music-based game.",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=350&q=80",
        url: "https://example.com/games/rhythm-master",
        category: "Music",
        tags: ["rhythm", "music", "timing"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1820,
        rating: 4.6,
      },
      {
        title: "Sniper Elite",
        description: "Take down targets with precision from long distances.",
        thumbnail: "https://images.unsplash.com/photo-1608408843758-5a2352902e3f?w=500&h=350&q=80",
        url: "https://example.com/games/sniper-elite",
        category: "Action",
        tags: ["shooter", "stealth", "precision"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1790,
        rating: 4.3,
      },
      {
        title: "Cooking Simulator",
        description: "Prepare delicious meals and manage your own virtual restaurant.",
        thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&h=350&q=80",
        url: "https://example.com/games/cooking-simulator",
        category: "Simulation",
        tags: ["cooking", "restaurant", "simulation"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1730,
        rating: 4.1,
      },
      {
        title: "Escape Room",
        description: "Solve puzzles to escape from challenging locked rooms.",
        thumbnail: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=500&h=350&q=80",
        url: "https://example.com/games/escape-room",
        category: "Puzzle",
        tags: ["escape", "mystery", "logic"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1680,
        rating: 4.7,
      },
      {
        title: "Space Colony",
        description: "Build and manage a colony on a distant planet.",
        thumbnail: "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=500&h=350&q=80",
        url: "https://example.com/games/space-colony",
        category: "Strategy",
        tags: ["space", "colony", "management"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1640,
        rating: 4.4,
      },
      {
        title: "Basketball Legends",
        description: "Compete in basketball tournaments with legendary players.",
        thumbnail: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&h=350&q=80",
        url: "https://example.com/games/basketball-legends",
        category: "Sports",
        tags: ["basketball", "sports", "legends"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1590,
        rating: 4.2,
      },
      {
        title: "Retro Pixel Adventure",
        description: "Explore a world of pixel art in this retro-styled adventure.",
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=350&q=80",
        url: "https://example.com/games/pixel-adventure",
        category: "Adventure",
        tags: ["pixel", "retro", "2D"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1540,
        rating: 4.5,
      },
      {
        title: "Medieval Kingdom",
        description: "Rule your medieval kingdom and expand your territory.",
        thumbnail: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500&h=350&q=80",
        url: "https://example.com/games/medieval-kingdom",
        category: "Strategy",
        tags: ["medieval", "kingdom", "strategy"],
        source: "custom" as const,
        status: "active" as const,
        plays: 1510,
        rating: 4.3,
      }
    ];
    
    // Combine featured and popular games
    const gamesData = [...featuredGamesData, ...popularGamesData];

    console.log("Adding sample games...");
    
    // Clear existing games to update with the new dataset
    try {
      await db.delete(schema.games);
      console.log("Cleared existing games to add new data");
    } catch (error) {
      console.error("Error clearing games:", error);
    }
    
    // Insert all games
    console.log(`Inserting ${gamesData.length} games (10 featured, 20 popular)...`);
    
    for (const game of gamesData) {
      // For ratings, we need to use rating_sum and rating_count instead of a decimal rating
      // Convert the decimal rating (e.g., 4.7) to an integer by multiplying by 10
      // so 4.7 becomes 47, and store the count as 10 (to represent a single rating with a weight of 10)
      const ratingSum = Math.round(game.rating * 10);
      
      try {
        await db.insert(schema.games).values({
          title: game.title,
          slug: slugify(game.title),
          description: game.description,
          thumbnail: game.thumbnail,
          url: game.url,
          category: game.category,
          tags: game.tags,
          source: game.source,
          status: game.status,
          plays: game.plays,
          rating: ratingSum,  // This is actually rating_sum in the schema
          ratingCount: 10,    // Default to 10 ratings
        });
      } catch (error) {
        console.error(`Error inserting game "${game.title}":`, error);
      }
    }
    console.log(`Added ${gamesData.length} sample games`);

    // Add sample blog categories
    const blogCategoriesData = [
      {
        name: "Game Reviews",
        slug: "game-reviews",
      },
      {
        name: "Gaming News",
        slug: "gaming-news",
      },
      {
        name: "Tips & Tricks",
        slug: "tips-tricks",
      },
      {
        name: "Development",
        slug: "development",
      }
    ];

    console.log("Adding blog categories...");
    
    // Check if blog categories exist before inserting to avoid duplicates
    const existingBlogCategories = await db.select().from(schema.blogCategories);
    
    if (existingBlogCategories.length === 0) {
      for (const category of blogCategoriesData) {
        await db.insert(schema.blogCategories).values({
          name: category.name,
          slug: category.slug,
        });
      }
      console.log(`Added ${blogCategoriesData.length} blog categories`);
    } else {
      console.log(`Found ${existingBlogCategories.length} existing blog categories, skipping insertion`);
    }

    // Add sample blog posts
    const blogPosts = [
      {
        title: "Top 10 Games of 2025",
        slug: "top-10-games-of-2025",
        content: "Here are our picks for the top 10 games released so far in 2025...",
        excerpt: "Discover the best games released in 2025 so far!",
        featuredImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=500&q=80",
        categoryId: 1, // Game Reviews
        status: "published" as const,
        author: "Admin",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80",
        tags: ["games", "top10", "2025"],
      },
      {
        title: "How to Master 'Zombie Survival'",
        slug: "how-to-master-zombie-survival",
        content: "Follow these expert tips to survive longer in Zombie Survival game...",
        excerpt: "Expert strategies to help you survive the zombie apocalypse longer.",
        featuredImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=500&q=80",
        categoryId: 3, // Tips & Tricks
        status: "published" as const,
        author: "GameMaster",
        authorAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&q=80",
        tags: ["zombie", "survival", "tips"],
      },
      {
        title: "Indie Game Development: Getting Started",
        slug: "indie-game-development-getting-started",
        content: "Learn how to start developing your own indie games with these beginner-friendly tools...",
        excerpt: "Your guide to beginning indie game development.",
        featuredImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&q=80",
        categoryId: 4, // Development
        status: "published" as const,
        author: "DevGuru",
        authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&q=80",
        tags: ["development", "indie", "gamedev"],
      }
    ];
    
    console.log("Adding sample blog posts...");
    
    // Check if blog posts exist before inserting to avoid duplicates
    const existingBlogPosts = await db.select().from(schema.blogPosts);
    
    if (existingBlogPosts.length === 0) {
      for (const post of blogPosts) {
        await db.insert(schema.blogPosts).values({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          categoryId: post.categoryId,
          status: post.status,
          author: post.author,
          authorAvatar: post.authorAvatar,
          tags: post.tags,
          publishedAt: new Date(), // Set to current date for published posts
        });
      }
      console.log(`Added ${blogPosts.length} sample blog posts`);
    } else {
      console.log(`Found ${existingBlogPosts.length} existing blog posts, skipping insertion`);
    }

    // Add sample push notifications
    const notifications = [
      {
        title: "Welcome to GameZone!",
        message: "Thanks for visiting our gaming website. Check out our featured games!",
        type: "toast" as const,
        link: "/games/featured",
        active: true,
      },
      {
        title: "New Games Added!",
        message: "Check out the latest games we've added to our platform.",
        type: "banner" as const,
        link: "/games/new",
        active: true,
      }
    ];
    
    console.log("Adding sample push notifications...");
    
    // Check if notifications exist before inserting to avoid duplicates
    const existingNotifications = await db.select().from(schema.pushNotifications);
    
    if (existingNotifications.length === 0) {
      for (const notification of notifications) {
        await db.insert(schema.pushNotifications).values({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.link,
          active: notification.active,
          clickCount: 0,
          impressionCount: 0,
        });
      }
      console.log(`Added ${notifications.length} sample push notifications`);
    } else {
      console.log(`Found ${existingNotifications.length} existing notifications, skipping insertion`);
    }

    console.log("✅ Seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();
