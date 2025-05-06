import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Add sample games
    const gamesData = [
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
        title: "Racing Champions",
        description: "Race against opponents on challenging tracks around the world.",
        thumbnail: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&h=350&q=80",
        url: "https://example.com/games/racing-champions",
        category: "Racing",
        tags: ["racing", "cars", "speed"],
        source: "custom" as const,
        status: "active" as const,
        plays: 750,
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
        plays: 620,
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
        plays: 580,
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
        plays: 490,
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
        plays: 420,
        rating: 4.5,
      }
    ];

    console.log("Adding sample games...");
    
    // Check if games exist before inserting to avoid duplicates
    const existingGames = await db.select().from(schema.games);
    
    if (existingGames.length === 0) {
      for (const game of gamesData) {
        // For ratings, we need to use rating_sum and rating_count instead of a decimal rating
        // Convert the decimal rating (e.g., 4.7) to an integer by multiplying by 10
        // so 4.7 becomes 47, and store the count as 10 (to represent a single rating with a weight of 10)
        const ratingSum = Math.round(game.rating * 10);
        
        await db.insert(schema.games).values({
          title: game.title,
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
      }
      console.log(`Added ${gamesData.length} sample games`);
    } else {
      console.log(`Found ${existingGames.length} existing games, skipping sample games insertion`);
    }

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
