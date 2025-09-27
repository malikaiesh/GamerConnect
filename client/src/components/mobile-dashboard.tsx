import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Crown,
  Gift,
  Calendar,
  Star,
  Coins,
  Trophy,
  Zap,
  Target,
  Users,
  GamepadIcon,
  Heart,
  Shield,
  DollarSign,
  TrendingUp,
  Sparkles,
  Award,
  Flame,
  CheckCircle,
  MessageSquare,
  Moon,
  Sun
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { toggleDarkMode, isDarkMode, themes, setTheme, getCurrentTheme } from "@/lib/themes";
import { useState, useEffect } from "react";

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  iconColor: string;
}

const featureCards: FeatureCard[] = [
  {
    id: "lucky-challenge",
    title: "Lucky Number",
    subtitle: "Challenge",
    icon: Target,
    href: "/tournaments",
    iconColor: "text-white"
  },
  {
    id: "free-rewards",
    title: "Free Rewards",
    subtitle: "Daily Bonus",
    icon: Gift,
    href: "/refer-earn",
    iconColor: "text-white"
  },
  {
    id: "coins-chest",
    title: "Coins Chest",
    subtitle: "Giveaway",
    icon: Coins,
    href: "/pricing-plans",
    iconColor: "text-white"
  },
  {
    id: "vip-subscription",
    title: "VIP Subscription",
    subtitle: "Premium Access",
    icon: Crown,
    href: "/pricing-plans",
    iconColor: "text-white"
  },
  {
    id: "daily-tasks",
    title: "Daily Tasks",
    subtitle: "Complete & Earn",
    icon: Calendar,
    href: "/user-dashboard",
    iconColor: "text-white"
  },
  {
    id: "tournaments",
    title: "Battle Arena",
    subtitle: "Join Tournaments",
    icon: Trophy,
    href: "/tournaments",
    iconColor: "text-white"
  },
  {
    id: "achievements",
    title: "Achievements",
    subtitle: "Unlock Badges",
    icon: Award,
    href: "/verification",
    iconColor: "text-white"
  },
  {
    id: "power-ups",
    title: "Power-Ups",
    subtitle: "Boost Your Game",
    icon: Zap,
    href: "/games",
    iconColor: "text-white"
  },
  {
    id: "get-verified",
    title: "Get Verified",
    subtitle: "Verify Account",
    icon: CheckCircle,
    href: "/verification",
    iconColor: "text-white"
  },
  {
    id: "feedback",
    title: "Feedback",
    subtitle: "Share Your Thoughts",
    icon: MessageSquare,
    href: "/feedback",
    iconColor: "text-white"
  }
];

export function MobileDashboard() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(isDarkMode());
  const [currentTheme, setCurrentThemeState] = useState(getCurrentTheme());
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const { data: referralData } = useQuery({
    queryKey: ["/api/user/referrals"],
  });

  // Calculate user level based on games played (simple logic)
  const userLevel = Math.floor((userStats?.gamesPlayed || 0) / 10) + 1;
  const coins = (referralData?.totalEarnings || 0) / 100;

  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    toggleDarkMode(newDarkMode);
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setCurrentThemeState(themeId);
    setShowThemeSelector(false);
  };


  return (
    <div className="min-h-screen pb-20" style={{
      background: darkMode 
        ? 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--muted)))'
        : `linear-gradient(to bottom right, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))`
    }}>
      {/* Header Section with User Profile */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-b-3xl shadow-lg" style={{
        background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))`
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-white/30">
              <AvatarImage src={user?.profilePicture || undefined} alt={user?.username || 'Player'} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {(user?.displayName || user?.username || 'Player').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.displayName || user?.username || 'Player'}
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">Level {userLevel}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">{coins.toFixed(0)}</span>
                </div>
                {user?.isVerified && (
                  <Shield className="w-4 h-4 text-green-300" />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                data-testid="button-theme-selector"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </button>
              
              {showThemeSelector && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3 z-50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">Select Theme</h3>
                  <div className="space-y-1">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          currentTheme === theme.id
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        data-testid={`theme-option-${theme.id}`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                      <button
                        onClick={handleThemeToggle}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          darkMode ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                        )}
                        data-testid="dark-mode-toggle"
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform",
                          darkMode ? "translate-x-5" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-red-300" />
              <span className="text-sm">100</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm">{userStats?.gamesPlayed || 0}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Level {userLevel}</span>
            <span>Level {userLevel + 1}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-orange-300 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((userStats?.gamesPlayed || 0) % 10) * 10}%` 
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold">{userStats?.totalFriends || 0}</div>
            <div className="text-xs opacity-80">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{userStats?.totalRooms || 0}</div>
            <div className="text-xs opacity-80">Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{userStats?.activeTournaments || 0}</div>
            <div className="text-xs opacity-80">Tournaments</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{referralData?.totalReferrals || 0}</div>
            <div className="text-xs opacity-80">Referrals</div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="p-4 space-y-4">
        {featureCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={card.id} href={card.href}>
              <div 
                className="relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-200 active:scale-95 hover:shadow-xl"
                style={{
                  background: card.id === 'lucky-challenge' ? `linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))` :
                             card.id === 'free-rewards' ? `linear-gradient(to right, hsl(var(--accent)), hsl(var(--primary)))` :
                             card.id === 'coins-chest' ? `linear-gradient(to right, hsl(var(--secondary)), hsl(var(--accent)))` :
                             card.id === 'vip-subscription' ? `linear-gradient(to right, hsl(var(--accent)), hsl(var(--primary)))` :
                             card.id === 'daily-tasks' ? `linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))` :
                             card.id === 'tournaments' ? `linear-gradient(to right, hsl(var(--secondary)), hsl(var(--accent)))` :
                             card.id === 'achievements' ? `linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))` :
                             card.id === 'power-ups' ? `linear-gradient(to right, hsl(var(--accent)), hsl(var(--secondary)))` :
                             card.id === 'get-verified' ? `linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))` :
                             card.id === 'feedback' ? `linear-gradient(to right, hsl(var(--accent)), hsl(var(--primary)))` :
                             `linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))`
                }}
                data-testid={`feature-card-${card.id}`}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Icon className={cn("w-8 h-8", card.iconColor)} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{card.title}</h3>
                      <p className="text-white/90 text-sm">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-white/80" />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}