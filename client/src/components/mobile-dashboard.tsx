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
  gradient: string;
  iconColor: string;
}

const featureCards: FeatureCard[] = [
  {
    id: "lucky-challenge",
    title: "Lucky Number",
    subtitle: "Challenge",
    icon: Target,
    href: "/tournaments",
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    iconColor: "text-white"
  },
  {
    id: "free-rewards",
    title: "Free Rewards",
    subtitle: "Daily Bonus",
    icon: Gift,
    href: "/refer-earn",
    gradient: "bg-gradient-to-r from-green-400 to-blue-500",
    iconColor: "text-white"
  },
  {
    id: "coins-chest",
    title: "Coins Chest",
    subtitle: "Giveaway",
    icon: Coins,
    href: "/pricing-plans",
    gradient: "bg-gradient-to-r from-yellow-400 to-orange-500",
    iconColor: "text-white"
  },
  {
    id: "vip-subscription",
    title: "VIP Subscription",
    subtitle: "Premium Access",
    icon: Crown,
    href: "/pricing-plans",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
    iconColor: "text-white"
  },
  {
    id: "daily-tasks",
    title: "Daily Tasks",
    subtitle: "Complete & Earn",
    icon: Calendar,
    href: "/user-dashboard",
    gradient: "bg-gradient-to-r from-emerald-400 to-cyan-500",
    iconColor: "text-white"
  },
  {
    id: "tournaments",
    title: "Battle Arena",
    subtitle: "Join Tournaments",
    icon: Trophy,
    href: "/tournaments",
    gradient: "bg-gradient-to-r from-red-500 to-pink-500",
    iconColor: "text-white"
  },
  {
    id: "achievements",
    title: "Achievements",
    subtitle: "Unlock Badges",
    icon: Award,
    href: "/verification",
    gradient: "bg-gradient-to-r from-blue-500 to-teal-500",
    iconColor: "text-white"
  },
  {
    id: "power-ups",
    title: "Power-Ups",
    subtitle: "Boost Your Game",
    icon: Zap,
    href: "/games",
    gradient: "bg-gradient-to-r from-orange-400 to-red-500",
    iconColor: "text-white"
  },
  {
    id: "get-verified",
    title: "Get Verified",
    subtitle: "Verify Account",
    icon: CheckCircle,
    href: "/verification",
    gradient: "bg-gradient-to-r from-teal-400 to-blue-600",
    iconColor: "text-white"
  },
  {
    id: "feedback",
    title: "Feedback",
    subtitle: "Share Your Thoughts",
    icon: MessageSquare,
    href: "/feedback",
    gradient: "bg-gradient-to-r from-violet-500 to-purple-600",
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

  const getThemeColors = (themeId: string) => {
    switch (themeId) {
      case 'sports': return 'from-blue-500 to-orange-500';
      case 'girls': return 'from-pink-400 to-purple-500';
      case 'retro': return 'from-yellow-400 to-red-500';
      case 'futuristic': return 'from-blue-600 to-purple-600';
      case 'lunexa': return 'from-gray-800 to-purple-900';
      default: return 'from-blue-600 to-purple-600'; // modern
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header Section with User Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
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
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Choose Theme</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={cn(
                            "p-2 rounded-lg text-xs font-medium transition-all",
                            currentTheme === theme.id
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          )}
                          data-testid={`theme-option-${theme.id}`}
                        >
                          <div className={cn("w-full h-6 rounded mb-1 bg-gradient-to-r", getThemeColors(theme.id))}></div>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                      <button
                        onClick={handleThemeToggle}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          darkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                        )}
                        data-testid="dark-mode-toggle"
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          darkMode ? "translate-x-6" : "translate-x-1"
                        )}>
                          {darkMode ? (
                            <Moon className="w-3 h-3 text-gray-600 m-0.5" />
                          ) : (
                            <Sun className="w-3 h-3 text-yellow-500 m-0.5" />
                          )}
                        </span>
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
                className={cn(
                  "relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-200 active:scale-95 hover:shadow-xl",
                  card.gradient
                )}
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