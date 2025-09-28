import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
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
  Sun,
  Home,
  Grid3X3,
  Settings
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
    id: "categories",
    title: "Categories",
    subtitle: "Browse Games",
    icon: Grid3X3,
    href: "/categories",
    iconColor: "text-white"
  },
  {
    id: "my-rooms",
    title: "My Rooms",
    subtitle: "Manage Rooms",
    icon: Home,
    href: "/rooms/my-rooms",
    iconColor: "text-white"
  },
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
  const [, navigate] = useLocation();
  const isMobile = useMobile();
  
  // Single aggregated API call for all dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ["/api/dashboard/mobile"],
  });

  // Extract data from aggregated response
  const userStats = dashboardData?.stats;
  const referralData = dashboardData?.referrals;
  const userLevel = dashboardData?.computed?.userLevel || 1;
  const coins = dashboardData?.computed?.coins || 0;

  // Show loading state while fetching dashboard data
  if (dashboardLoading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-b-3xl">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-white/20 rounded w-32"></div>
                <div className="h-4 bg-white/20 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state if dashboard data fetch fails
  if (dashboardError) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We're having trouble loading your dashboard data. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-retry-dashboard"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <button 
              onClick={() => navigate(isMobile ? '/mobile-settings' : '/profile')}
              className="transition-transform hover:scale-105 active:scale-95"
              data-testid="button-profile-avatar"
            >
              <Avatar className="w-16 h-16 border-2 border-white/30">
                <AvatarImage src={user?.profilePicture || undefined} alt={user?.username || 'Player'} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {(user?.displayName || user?.username || 'Player').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.displayName || user?.username || 'Player'}
              </h2>
              <div className="flex items-center flex-wrap gap-3 mt-1">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-medium" data-testid="text-id-level">ID {dashboardData?.user?.idLevel || 1}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Crown className="w-4 h-4 text-purple-300" />
                  <span className="text-xs font-medium" data-testid="text-rooms-level">Room {dashboardData?.user?.roomsLevel || 1}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-medium" data-testid="text-coins">{Math.floor(coins).toLocaleString()}</span>
                </div>
                {user?.isVerified && (
                  <Shield className="w-4 h-4 text-green-300" />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleThemeToggle}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                data-testid="button-dark-mode-toggle"
              >
                {darkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  data-testid="button-theme-selector"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </button>
              
              {showThemeSelector && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowThemeSelector(false)}
                  />
                  
                  {/* Theme Selector Modal - Mobile Optimized */}
                  <div className="absolute right-0 top-12 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[180px] overflow-hidden">
                      {/* Header */}
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Themes</h3>
                      </div>
                      
                      {/* Theme Options */}
                      <div className="py-1 max-h-60 overflow-y-auto">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={cn(
                              "w-full px-3 py-1.5 text-left text-xs transition-colors duration-150 flex items-center justify-between",
                              currentTheme === theme.id
                                ? "bg-blue-500 text-white"
                                : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                            data-testid={`theme-option-${theme.id}`}
                          >
                            <span>{theme.name}</span>
                            {currentTheme === theme.id && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-red-300" />
                <span className="text-xs">100</span>
              </div>
              <div className="flex items-center space-x-1">
                <Flame className="w-3 h-3 text-orange-300" />
                <span className="text-xs">{userStats?.gamesPlayed || 0}</span>
              </div>
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

      {/* Feature Cards Section - Mobile Optimized */}
      <div className="p-3 space-y-2">
        {featureCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={card.id} href={card.href}>
              <div 
                className="relative overflow-hidden rounded-xl shadow-md transform transition-all duration-200 active:scale-95 hover:shadow-lg"
                style={{
                  background: card.id === 'categories' ? `linear-gradient(to right, #10B981, #059669)` :
                             card.id === 'my-rooms' ? `linear-gradient(to right, #3B82F6, #1D4ED8)` :
                             card.id === 'lucky-challenge' ? `linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))` :
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
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Icon className={cn("w-5 h-5", card.iconColor)} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{card.title}</h3>
                      <p className="text-white/90 text-xs">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-white/80" />
                  </div>
                </div>
                
                {/* Decorative elements - smaller */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
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