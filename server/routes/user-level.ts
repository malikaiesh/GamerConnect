import { Router } from 'express';
import { db } from '@db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth.js';

const requireAuth = isAuthenticated;
import { calculateIdLevel, calculateRoomsLevel, shouldAwardDailyBonus, XP_REWARDS } from '../../client/src/lib/level-system.js';

const router = Router();

// Get user level info
router.get('/level', requireAuth, async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
      columns: {
        id: true,
        username: true,
        idLevel: true,
        roomsLevel: true,
        totalXp: true,
        roomsXp: true,
        gamesPlayed: true,
        roomsCreated: true,
        roomsJoined: true,
        messagesSent: true,
        friendsCount: true,
        dailyLoginStreak: true,
        lastActivityDate: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = {
      gamesPlayed: user.gamesPlayed,
      roomsCreated: user.roomsCreated,
      roomsJoined: user.roomsJoined,
      messagesSent: user.messagesSent,
      friendsCount: user.friendsCount,
      dailyLoginStreak: user.dailyLoginStreak
    };

    const idLevelInfo = calculateIdLevel(stats);
    const roomsLevelInfo = calculateRoomsLevel(stats);

    res.json({
      user: {
        id: user.id,
        username: user.username,
      },
      idLevel: idLevelInfo,
      roomsLevel: roomsLevelInfo,
      stats,
      lastActivityDate: user.lastActivityDate
    });
  } catch (error) {
    console.error('Error fetching user level:', error);
    res.status(500).json({ error: 'Failed to fetch user level' });
  }
});

// Update activity and award XP
router.post('/activity', requireAuth, async (req, res) => {
  try {
    const { type, amount = 1 } = req.body;
    
    if (!type || !['game_played', 'room_created', 'room_joined', 'message_sent', 'friend_added'].includes(type)) {
      return res.status(400).json({ error: 'Invalid activity type' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const shouldAwardDaily = shouldAwardDailyBonus(user.lastActivityDate);
    
    // Calculate new streak
    let newStreak = user.dailyLoginStreak;
    if (shouldAwardDaily) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (user.lastActivityDate === yesterdayStr) {
        // Continue streak
        newStreak += 1;
      } else if (user.lastActivityDate !== today) {
        // Reset streak (missed days)
        newStreak = 1;
      }
    }

    // Calculate XP gained
    let xpGained = 0;
    const updates: any = {
      lastActivityDate: today,
      dailyLoginStreak: newStreak
    };

    // Award daily login bonus
    if (shouldAwardDaily) {
      xpGained += XP_REWARDS.DAILY_LOGIN + (newStreak * XP_REWARDS.DAILY_STREAK_BONUS);
    }

    // Award activity XP
    switch (type) {
      case 'game_played':
        xpGained += XP_REWARDS.GAME_PLAYED * amount;
        updates.gamesPlayed = user.gamesPlayed + amount;
        break;
      case 'room_created':
        xpGained += XP_REWARDS.ROOM_CREATED * amount;
        updates.roomsCreated = user.roomsCreated + amount;
        updates.roomsXp = user.roomsXp + (XP_REWARDS.ROOM_CREATED * amount);
        break;
      case 'room_joined':
        xpGained += XP_REWARDS.ROOM_JOINED * amount;
        updates.roomsJoined = user.roomsJoined + amount;
        updates.roomsXp = user.roomsXp + (XP_REWARDS.ROOM_JOINED * amount);
        break;
      case 'message_sent':
        xpGained += XP_REWARDS.MESSAGE_SENT * amount;
        updates.messagesSent = user.messagesSent + amount;
        break;
      case 'friend_added':
        xpGained += XP_REWARDS.FRIEND_ADDED * amount;
        updates.friendsCount = user.friendsCount + amount;
        break;
    }

    // Update total XP
    updates.totalXp = user.totalXp + xpGained;

    // Calculate new levels
    const newStats = {
      gamesPlayed: updates.gamesPlayed || user.gamesPlayed,
      roomsCreated: updates.roomsCreated || user.roomsCreated,
      roomsJoined: updates.roomsJoined || user.roomsJoined,
      messagesSent: updates.messagesSent || user.messagesSent,
      friendsCount: updates.friendsCount || user.friendsCount,
      dailyLoginStreak: newStreak
    };

    const newIdLevel = calculateIdLevel(newStats);
    const newRoomsLevel = calculateRoomsLevel(newStats);

    updates.idLevel = newIdLevel.level;
    updates.roomsLevel = newRoomsLevel.level;

    // Update user in database
    await db.update(users)
      .set(updates)
      .where(eq(users.id, req.user!.id));

    // Check for level ups
    const levelUps = [];
    if (newIdLevel.level > user.idLevel) {
      levelUps.push({ type: 'id', oldLevel: user.idLevel, newLevel: newIdLevel.level });
    }
    if (newRoomsLevel.level > user.roomsLevel) {
      levelUps.push({ type: 'rooms', oldLevel: user.roomsLevel, newLevel: newRoomsLevel.level });
    }

    res.json({
      xpGained,
      levelUps,
      newIdLevel,
      newRoomsLevel,
      dailyBonus: shouldAwardDaily
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

export default router;