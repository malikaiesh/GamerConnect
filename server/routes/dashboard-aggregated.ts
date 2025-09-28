import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';

const requireAuth = isAuthenticated;
import { storage } from '../storage.js';

const router = Router();

// Aggregated mobile dashboard data endpoint
router.get('/mobile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Fetch all dashboard data in parallel
    const [user] = await Promise.all([
      storage.getUserById(userId)
    ]);
    
    // Note: Need to implement getUserStats and getUserReferrals for individual users
    const userStats = {
      gamesPlayed: user?.gamesPlayed || 0,
      roomsCreated: user?.roomsCreated || 0,
      roomsJoined: user?.roomsJoined || 0,
      messagesSent: user?.messagesSent || 0,
      friendsCount: user?.friendsCount || 0,
      dailyLoginStreak: user?.dailyLoginStreak || 0
    };
    
    const referralData = {
      totalEarnings: 0, // Placeholder - need to implement referral system
      referralCount: 0,
      pendingEarnings: 0
    };

    // Aggregate response
    res.json({
      user: {
        id: user?.id,
        username: user?.username,
        displayName: user?.displayName,
        profilePicture: user?.profilePicture,
        isVerified: user?.isVerified,
        idLevel: user?.idLevel || 1,
        roomsLevel: user?.roomsLevel || 1
      },
      stats: userStats || {
        gamesPlayed: 0,
        roomsCreated: 0,
        roomsJoined: 0,
        messagesSent: 0,
        friendsCount: 0,
        dailyLoginStreak: 0
      },
      referrals: {
        totalEarnings: referralData?.totalEarnings || 0,
        referralCount: referralData?.referralCount || 0,
        pendingEarnings: referralData?.pendingEarnings || 0
      },
      computed: {
        userLevel: Math.floor((userStats?.gamesPlayed || 0) / 10) + 1,
        coins: (referralData?.totalEarnings || 0) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching mobile dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Aggregated admin dashboard data endpoint
router.get('/admin', requireAuth, async (req, res) => {
  try {
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Fetch all admin dashboard data in parallel
    const [
      analytics,
      userStats,
      gameStats,
      blogStats
    ] = await Promise.all([
      storage.getAnalytics('7days'), // Default timeframe
      storage.getUserStats(),
      storage.getGameStats(),
      storage.getBlogStats()
    ]);
    
    // Mock notifications for now
    const notifications = {
      notifications: [],
      unreadCount: 0
    };

    res.json({
      analytics: analytics || {
        pageViews: 0,
        uniqueVisitors: 0,
        avgSessionDuration: 0,
        bounceRate: 0
      },
      users: userStats || {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0
      },
      games: gameStats || {
        totalGames: 0,
        apiGames: 0,
        customGames: 0,
        featuredGames: 0
      },
      blog: blogStats || {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        categoriesCount: 0
      },
      notifications: notifications || {
        notifications: [],
        unreadCount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
});

// Aggregated room interface data endpoint
router.get('/room/:roomId', requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;

    // Fetch room data (simplified for now)
    const roomData = null; // TODO: Implement room methods in storage
    const messages = []; // TODO: Implement room message methods
    const userWallet = { balance: 0, diamonds: 0, pendingEarnings: 0 }; // TODO: Implement wallet methods

    res.json({
      room: roomData,
      messages: messages || [],
      wallet: userWallet || {
        balance: 0,
        diamonds: 0,
        pendingEarnings: 0
      }
    });
  } catch (error) {
    console.error('Error fetching room interface data:', error);
    res.status(500).json({ error: 'Failed to fetch room interface data' });
  }
});

// Aggregated tournament page data endpoint
router.get('/tournaments', requireAuth, async (req, res) => {
  try {
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const type = req.query.type as string;

    // Fetch tournaments and any other needed data in parallel
    const [tournamentsData] = await Promise.all([
      storage.getTournaments({ page, limit, search, status, type })
    ]);

    res.json({
      tournaments: tournamentsData || {
        tournaments: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Error fetching tournament dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch tournament dashboard data' });
  }
});

export default router;