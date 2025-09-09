import { db } from '../db';
import { pushNotifications } from '@shared/schema';
import { count } from 'drizzle-orm';

export async function seedPushNotifications() {
  try {
    // Check if push notifications already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(pushNotifications);

    // Only seed if no notifications exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🔔 Seeding sample push notifications...');
      
      const SAMPLE_NOTIFICATIONS = [
        {
          title: 'Welcome to Gaming Portal!',
          message: 'Discover amazing games and join our growing community of gamers. Start playing now!',
          image: '/uploads/notifications/welcome-banner.jpg',
          link: '/games',
          type: 'banner' as const,
          active: true,
          clickCount: 0,
          impressionCount: 0
        },
        {
          title: 'New Featured Game Available',
          message: 'Check out "Space Explorer" - our latest featured game with stunning graphics and exciting gameplay!',
          image: '/uploads/notifications/new-game-alert.jpg',
          link: '/games/space-explorer',
          type: 'toast' as const,
          active: true,
          clickCount: 0,
          impressionCount: 0
        },
        {
          title: 'Weekly Tournament Starting Soon',
          message: 'Join our weekly gaming tournament and compete for amazing prizes. Registration closes in 2 days!',
          image: '/uploads/notifications/tournament-banner.jpg',
          link: '/events',
          type: 'modal' as const,
          active: true,
          clickCount: 0,
          impressionCount: 0
        },
        {
          title: 'Achievement Unlocked!',
          message: 'Congratulations! You\'ve unlocked the "Game Explorer" achievement for trying 10 different games.',
          image: '/uploads/notifications/achievement-unlock.jpg',
          link: '/profile',
          type: 'slide-in' as const,
          active: false,
          clickCount: 0,
          impressionCount: 0
        },
        {
          title: 'Friend Request Received',
          message: 'You have a new friend request from @gamingpro. Accept to start gaming together!',
          image: '/uploads/notifications/friend-request.jpg',
          link: '/friends/requests',
          type: 'alert' as const,
          active: true,
          clickCount: 0,
          impressionCount: 0
        },
        {
          title: 'Daily Challenges Available',
          message: 'Complete today\'s daily challenges to earn bonus points and unlock exclusive rewards!',
          image: '/uploads/notifications/daily-challenge.jpg',
          link: '/challenges',
          type: 'web-push' as const,
          active: true,
          clickCount: 0,
          impressionCount: 0
        }
      ];

      await db.insert(pushNotifications).values(SAMPLE_NOTIFICATIONS);
      
      console.log(`✅ ${SAMPLE_NOTIFICATIONS.length} sample push notifications seeded successfully`);
    } else {
      console.log('ℹ️  Push notifications already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding push notifications:', error);
    throw error;
  }
}