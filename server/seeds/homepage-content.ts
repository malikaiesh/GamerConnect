import { db } from '../db';
import { homePageContent } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_HOMEPAGE_CONTENT = [
  {
    title: 'Welcome to GamerConnect',
    content: `
# Your Ultimate Gaming Destination 🎮

Welcome to **GamerConnect**, the premier online gaming platform where endless entertainment meets community! Whether you're a casual player looking for quick fun or a hardcore gamer seeking your next challenge, we've got something amazing waiting for you.

## 🚀 What Makes Us Special

### 🎯 **Instant Play**
No downloads, no waiting! Jump straight into hundreds of games right from your browser. Our HTML5 games load instantly and run smoothly on any device.

### 🌟 **Diverse Game Library**
From heart-pounding action adventures to mind-bending puzzles, strategic warfare to relaxing casual games - explore every genre imaginable with new titles added weekly.

### 🏆 **Community & Competition**
Connect with fellow gamers, share achievements, and participate in exciting tournaments with amazing prizes. Build friendships and rivalries that last!

### 📱 **Mobile-Ready**
Play anywhere, anytime! Our games are optimized for desktop, tablet, and mobile devices so you never miss a gaming moment.

---

**Ready to start your adventure?** Browse our featured games below or explore categories to find your perfect match. The fun starts now!
    `,
    position: 1,
    status: 'active' as const
  },
  {
    title: 'Featured Gaming Events',
    content: `
# Join the Action! 🎉

Don't miss out on our **exclusive gaming events** happening throughout the year! From competitive tournaments with cash prizes to fun community gatherings, there's always something exciting on the horizon.

## 🏆 Current Highlights

### **Global Gaming Championship 2024**
- **Prize Pool**: $25,000+ in cash and prizes
- **Date**: June 15-17, 2024
- **Registration**: Now open!
- Multiple game categories and skill levels

### **Indie Game Development Workshop**
- **Free Online Workshop**: Learn game development basics
- **Date**: May 20, 2024
- **Perfect for**: Beginners and aspiring developers
- **Bonus**: Certificate of completion included

### **Retro Gaming Night**
- **Classic Arcade Experience**: Nostalgic gaming fun
- **Date**: April 25, 2024
- **Location**: In-person gaming lounge
- **Tickets**: Only $10 - includes food & drinks!

---

[**View All Events →**](/events) | [**Register Now →**](/events)

*Stay connected on social media for event announcements and exclusive early-bird pricing!*
    `,
    position: 2,
    status: 'active' as const
  },
  {
    title: 'Gaming Community Hub',
    content: `
# Connect, Share & Grow Together 🤝

Gaming is better when shared! Join our vibrant community of passionate gamers from around the world. Whether you're looking for teammates, want to share your achievements, or need tips from pros, you'll find your tribe here.

## 🌟 Community Features

### 💬 **Discussion Forums**
- Game strategies and tips
- Technical support from experts  
- General gaming chat and news
- Developer Q&A sessions

### 🎮 **Player Profiles**
- Track your gaming achievements
- Showcase your favorite games
- Connect with friends and rivals
- Join gaming groups and clubs

### 📺 **Live Streams & Content**
- Watch live gameplay sessions
- Learn from expert players
- Participate in chat discussions
- Access exclusive streamer content

### 🏅 **Leaderboards & Achievements**
- Compete for top spots
- Unlock special badges and titles
- Seasonal competitions with prizes
- Recognition for community contributions

---

**New to our community?** [**Create Your Profile →**](/register) and start connecting with amazing gamers today!

*Join thousands of players who've already made GamerConnect their gaming home!*
    `,
    position: 3,
    status: 'active' as const
  }
];

export async function seedHomepageContent() {
  try {
    // Check if homepage content already exists
    const [existingCount] = await db
      .select({ count: count() })
      .from(homePageContent);

    // Only seed if no content exists (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default homepage content...');
      
      await db.insert(homePageContent).values(DEFAULT_HOMEPAGE_CONTENT);
      
      console.log(`✅ ${DEFAULT_HOMEPAGE_CONTENT.length} homepage content items seeded successfully`);
    } else {
      console.log('ℹ️  Homepage content already exists, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding homepage content:', error);
    throw error;
  }
}