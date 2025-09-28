// Level System Configuration and Utilities

export interface UserStats {
  gamesPlayed: number;
  roomsCreated: number;
  roomsJoined: number;
  messagesSent: number;
  friendsCount: number;
  dailyLoginStreak: number;
}

export interface LevelInfo {
  level: number;
  currentXp: number;
  requiredXp: number;
  progress: number; // 0-100
}

// XP Rewards for different activities
export const XP_REWARDS = {
  GAME_PLAYED: 10,
  ROOM_CREATED: 50,
  ROOM_JOINED: 5,
  MESSAGE_SENT: 1,
  FRIEND_ADDED: 20,
  DAILY_LOGIN: 25,
  DAILY_STREAK_BONUS: 10, // Additional bonus per day in streak
} as const;

// Calculate XP requirement for a level (levels 1-15 easier, then harder)
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Levels 1-15: Fast progression (100 XP base, +50 per level)
  if (level <= 15) {
    return (level - 1) * 100 + Math.pow(level - 1, 1.5) * 50;
  }
  
  // Levels 16+: Harder progression (exponential scaling)
  const baseXp = getXpForLevel(15);
  const additionalLevels = level - 15;
  return baseXp + (additionalLevels * 200) + Math.pow(additionalLevels, 2.2) * 100;
}

// Calculate level from total XP
export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (level <= 100 && getXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return Math.min(level, 100);
}

// Calculate ID level based on user stats
export function calculateIdLevel(stats: UserStats): LevelInfo {
  const totalXp = 
    stats.gamesPlayed * XP_REWARDS.GAME_PLAYED +
    stats.messagesSent * XP_REWARDS.MESSAGE_SENT +
    stats.friendsCount * XP_REWARDS.FRIEND_ADDED +
    stats.dailyLoginStreak * (XP_REWARDS.DAILY_LOGIN + XP_REWARDS.DAILY_STREAK_BONUS);
  
  const level = getLevelFromXp(totalXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const progress = level >= 100 ? 100 : ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  
  return {
    level,
    currentXp: totalXp,
    requiredXp: nextLevelXp,
    progress: Math.min(progress, 100)
  };
}

// Calculate Rooms level based on room activities
export function calculateRoomsLevel(stats: UserStats): LevelInfo {
  const roomsXp = 
    stats.roomsCreated * XP_REWARDS.ROOM_CREATED +
    stats.roomsJoined * XP_REWARDS.ROOM_JOINED +
    Math.floor(stats.messagesSent / 10) * 5; // Bonus for active messaging in rooms
  
  const level = getLevelFromXp(roomsXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const progress = level >= 100 ? 100 : ((roomsXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  
  return {
    level,
    currentXp: roomsXp,
    requiredXp: nextLevelXp,
    progress: Math.min(progress, 100)
  };
}

// Get level badge/title based on level
export function getLevelBadge(level: number): { title: string; color: string; icon: string } {
  if (level >= 90) return { title: "Legend", color: "from-purple-500 to-pink-500", icon: "👑" };
  if (level >= 80) return { title: "Master", color: "from-yellow-400 to-orange-500", icon: "🏆" };
  if (level >= 70) return { title: "Expert", color: "from-blue-500 to-purple-600", icon: "⭐" };
  if (level >= 60) return { title: "Advanced", color: "from-green-500 to-blue-500", icon: "🔥" };
  if (level >= 50) return { title: "Skilled", color: "from-indigo-500 to-purple-500", icon: "💎" };
  if (level >= 40) return { title: "Experienced", color: "from-teal-500 to-green-500", icon: "🚀" };
  if (level >= 30) return { title: "Veteran", color: "from-orange-500 to-red-500", icon: "⚡" };
  if (level >= 20) return { title: "Regular", color: "from-blue-400 to-indigo-500", icon: "🎯" };
  if (level >= 10) return { title: "Active", color: "from-green-400 to-blue-500", icon: "🌟" };
  return { title: "Newcomer", color: "from-gray-400 to-gray-600", icon: "🎮" };
}

// Activity tracking utilities
export function shouldAwardDailyBonus(lastActivityDate: string | null): boolean {
  if (!lastActivityDate) return true;
  
  const today = new Date().toISOString().split('T')[0];
  return lastActivityDate !== today;
}

export function calculateStreakBonus(dailyLoginStreak: number): number {
  // Bonus XP for maintaining streaks
  if (dailyLoginStreak >= 30) return 100; // 30 day streak
  if (dailyLoginStreak >= 14) return 50;  // 2 week streak
  if (dailyLoginStreak >= 7) return 25;   // 1 week streak
  if (dailyLoginStreak >= 3) return 10;   // 3 day streak
  return 0;
}