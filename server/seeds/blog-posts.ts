import { db } from '../db';
import { blogPosts, blogCategories } from '@shared/schema';
import { count, eq } from 'drizzle-orm';

export async function seedBlogPosts() {
  try {
    // Check if blog posts already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(blogPosts);

    // Only seed if no posts exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default blog posts...');
      
      // Get category IDs for reference
      const categories = await db.select().from(blogCategories);
      const gameDev = categories.find(c => c.slug === 'game-development');
      const tutorials = categories.find(c => c.slug === 'tutorials');
      const reviews = categories.find(c => c.slug === 'reviews');
      const industry = categories.find(c => c.slug === 'industry');

      const DEFAULT_BLOG_POSTS = [
        {
          title: 'Getting Started with Indie Game Development',
          slug: 'indie-game-development-getting-started',
          excerpt: 'A comprehensive guide for beginners who want to start their journey in indie game development. Learn about essential tools, skills, and mindset.',
          content: `
# Getting Started with Indie Game Development

Welcome to the exciting world of indie game development! Whether you're a complete beginner or someone looking to transition into game development, this guide will help you take your first steps.

## What is Indie Game Development?

Indie game development refers to creating games independently, typically without the financial support of a large game publisher. Indie developers have creative freedom but also face challenges like limited resources and the need to wear multiple hats.

## Essential Skills You'll Need

### Programming
- **Unity & C#**: Great for beginners with visual scripting options
- **Godot & GDScript**: Free, open-source, and beginner-friendly
- **GameMaker Studio & GML**: Excellent for 2D games

### Art and Design
- **Pixel Art**: Start with simple 16x16 or 32x32 sprites
- **3D Modeling**: Blender is free and powerful
- **UI/UX Design**: Learn about game interface design principles

### Sound and Music
- **Audio Tools**: Audacity (free) or FL Studio for music
- **Sound Effects**: Freesound.org for free SFX
- **Music**: Consider royalty-free music or learn basic composition

## Your First Game Project

Start small! Consider these beginner-friendly project ideas:

1. **Pong Clone**: Learn basic game mechanics
2. **Breakout**: Understand collision detection
3. **Snake Game**: Practice game loops and state management
4. **Platformer**: Explore character movement and level design

## Development Process

1. **Concept**: What's your game about?
2. **Prototype**: Build a minimal playable version
3. **Iterate**: Test, get feedback, improve
4. **Polish**: Add juice, sound, and visual effects
5. **Release**: Publish on itch.io, Steam, or mobile stores

## Resources to Get Started

- **Game Engines**: Unity, Godot, GameMaker Studio
- **Learning**: YouTube tutorials, Udemy courses, official documentation
- **Community**: Join game dev Discord servers and forums
- **Game Jams**: Participate in Ludum Dare or Global Game Jam

## Common Beginner Mistakes

1. **Scope Too Large**: Start with tiny projects
2. **Perfect Graphics First**: Focus on gameplay mechanics
3. **No Playtesting**: Get feedback early and often
4. **Feature Creep**: Stick to your original vision

## Conclusion

Game development is a journey of continuous learning. Don't be afraid to start small, make mistakes, and iterate. Every great game developer started with their first simple project.

Remember: the best game is a finished game!

Good luck on your indie game development journey!
          `,
          featuredImage: '/uploads/blog-indie-game-dev.jpg',
          categoryId: gameDev?.id || 1,
          tags: ['indie', 'beginner', 'tutorial', 'gamedev'],
          status: 'published' as const,
          author: 'Game Dev Team',
          authorAvatar: '/uploads/author-gamedev.jpg',
          publishedAt: new Date('2024-01-15')
        },
        {
          title: 'Top 10 Game Development Tools in 2024',
          slug: 'top-game-development-tools-2024',
          excerpt: 'Discover the most powerful and popular game development tools that are shaping the industry in 2024.',
          content: `
# Top 10 Game Development Tools in 2024

The game development landscape continues to evolve with new tools and technologies. Here are the top 10 tools that every game developer should know about in 2024.

## 1. Unity
**Best for**: Cross-platform development, 3D games, mobile games

Unity remains the most popular game engine with excellent documentation, asset store, and community support.

## 2. Unreal Engine 5
**Best for**: AAA-quality games, realistic graphics, Blueprint visual scripting

Epic's latest engine offers stunning visuals with Lumen global illumination and Nanite virtualized geometry.

## 3. Godot 4
**Best for**: Indie developers, 2D games, open-source projects

Free, lightweight, and increasingly powerful with GDScript and C# support.

## 4. GameMaker Studio 2
**Best for**: 2D games, rapid prototyping, pixel art games

Excellent for 2D game development with GML scripting language.

## 5. Construct 3
**Best for**: No-code development, beginners, web games

Browser-based game development without programming knowledge required.

## 6. Blender
**Best for**: 3D modeling, animation, texturing

Free 3D creation suite that's become industry standard.

## 7. Aseprite
**Best for**: Pixel art, 2D sprites, animations

The go-to tool for pixel art creation and sprite animation.

## 8. FMOD
**Best for**: Audio implementation, adaptive music, sound design

Professional audio middleware for interactive audio.

## 9. Photoshop/GIMP
**Best for**: Textures, concept art, UI design

Essential for 2D art creation and texture work.

## 10. Visual Studio Code
**Best for**: Code editing, debugging, version control

Lightweight code editor with excellent game development extensions.

## Conclusion

Choose tools based on your project needs, budget, and team size. Many successful games have been made with free tools!
          `,
          featuredImage: '/uploads/blog-game-tools.jpg',
          categoryId: tutorials?.id || 2,
          tags: ['tools', 'software', 'development', '2024'],
          status: 'published' as const,
          author: 'Tech Writer',
          authorAvatar: '/uploads/author-tech.jpg',
          publishedAt: new Date('2024-02-01')
        },
        {
          title: 'Game Review: The Art of Puzzle Design',
          slug: 'puzzle-game-design-review',
          excerpt: 'An in-depth analysis of what makes great puzzle games tick, from mechanics to player psychology.',
          content: `
# Game Review: The Art of Puzzle Design

Puzzle games have a unique place in gaming - they challenge our minds rather than our reflexes. But what separates a great puzzle game from a frustrating one?

## What Makes a Great Puzzle Game?

### Clear Rules
The best puzzle games establish clear, consistent rules that players can understand and rely on.

### Progressive Difficulty
Good puzzle games introduce concepts gradually, building complexity without overwhelming players.

### Fair Challenge
Every puzzle should have a logical solution that players can discover through thinking, not guessing.

## Case Studies

### Portal Series
Valve's Portal games are masterclasses in puzzle design:
- Simple mechanics (portals) with complex applications
- Environmental storytelling
- Perfect difficulty curve

### The Witness
Jonathan Blow's puzzle masterpiece demonstrates:
- Visual language over text tutorials
- Interconnected puzzle systems
- Player-driven discovery

### Tetris
The eternal puzzle game shows:
- Simple rules, infinite complexity
- Perfect game feel and feedback
- Universal appeal

## Design Principles

1. **Start Simple**: Begin with basic concepts
2. **Build Complexity**: Layer new elements gradually
3. **Provide Feedback**: Let players know when they're on track
4. **Respect Player Time**: Avoid artificial difficulty
5. **Multiple Solutions**: When possible, allow creativity

## Conclusion

Great puzzle games are about the "Aha!" moment - that satisfying click when the solution becomes clear. The best designers craft experiences that make players feel clever, not confused.
          `,
          featuredImage: '/uploads/blog-puzzle-review.jpg',
          categoryId: reviews?.id || 3,
          tags: ['puzzle', 'design', 'analysis', 'review'],
          status: 'published' as const,
          author: 'Game Critic',
          authorAvatar: '/uploads/author-critic.jpg',
          publishedAt: new Date('2024-02-15')
        },
        {
          title: 'The Future of Gaming: Trends to Watch in 2024',
          slug: 'gaming-trends-2024-future',
          excerpt: 'Explore the emerging trends that will shape the gaming industry in 2024 and beyond.',
          content: `
# The Future of Gaming: Trends to Watch in 2024

The gaming industry continues to evolve at breakneck speed. Here are the key trends shaping the future of gaming in 2024.

## 1. AI-Powered Game Development

Artificial Intelligence is revolutionizing game development:
- **Procedural Content Generation**: Infinite worlds and levels
- **Smart NPCs**: More believable character interactions
- **Automated Testing**: AI that can play-test games
- **Art Generation**: AI-assisted concept art and textures

## 2. Cloud Gaming Maturation

Cloud gaming platforms are becoming more viable:
- **Improved Latency**: Better infrastructure and edge computing
- **Cross-Platform Play**: Seamless gaming across devices
- **Subscription Models**: Gaming Netflix-style services
- **Hardware Independence**: High-end gaming on any device

## 3. Immersive Technologies

VR and AR continue to push boundaries:
- **Mixed Reality**: Blending virtual and real worlds
- **Haptic Feedback**: More realistic physical sensations
- **Eye Tracking**: Natural interaction methods
- **Spatial Computing**: Games that understand physical space

## 4. Sustainable Gaming

Environmental consciousness is growing:
- **Green Game Development**: Eco-friendly development practices
- **Digital-First Distribution**: Reducing physical media waste
- **Energy Efficient Gaming**: Optimized code and hardware
- **Carbon Neutral Studios**: Environmentally responsible companies

## 5. Accessibility Revolution

Games are becoming more inclusive:
- **Universal Design**: Games playable by everyone
- **Adaptive Controllers**: Hardware for all abilities
- **Audio Descriptions**: Support for visual impairments
- **Customizable UI**: Interfaces that adapt to needs

## 6. Social Gaming Evolution

Gaming as social platform continues:
- **Virtual Events**: Concerts and gatherings in games
- **User-Generated Content**: Players as creators
- **Live Service Games**: Ongoing content updates
- **Community-Driven Development**: Player feedback shaping games

## Challenges Ahead

- **Privacy Concerns**: Protecting player data
- **Market Saturation**: Standing out in crowded markets
- **Talent Shortage**: Need for skilled developers
- **Platform Fragmentation**: Multiple competing ecosystems

## Conclusion

2024 promises exciting developments in gaming technology and culture. The industry's future lies in more accessible, sustainable, and immersive experiences that bring people together.

Stay tuned for what promises to be an incredible year in gaming!
          `,
          featuredImage: '/uploads/blog-gaming-future.jpg',
          categoryId: industry?.id || 4,
          tags: ['trends', 'future', 'technology', 'industry'],
          status: 'published' as const,
          author: 'Industry Analyst',
          authorAvatar: '/uploads/author-analyst.jpg',
          publishedAt: new Date('2024-03-01')
        }
      ];
      
      await db.insert(blogPosts).values(DEFAULT_BLOG_POSTS);
      
      console.log(`✅ ${DEFAULT_BLOG_POSTS.length} blog posts seeded successfully`);
    } else {
      console.log('ℹ️  Blog posts already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error);
    throw error;
  }
}