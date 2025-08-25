import { useMemo, memo } from "react";
import AdminNavigation from "@/components/admin/navigation";
import { Analytics } from "@/components/admin/dashboard/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Game, BlogPost } from "@shared/schema";
import { Circle, ArrowUpRight, TrendingUp, BarChart, Users, Gamepad2, Newspaper, Bell } from "lucide-react";
import NotificationBell from "@/components/admin/notification-bell";
import AdminProfile from "@/components/admin/admin-profile";
import { Skeleton } from "@/components/ui/skeleton";

// Memoized summary card component for better performance
const SummaryCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  percentChange, 
  isLoading,
  secondaryValue,
  secondaryLabel
}: { 
  title: string;
  value: string | number;
  icon: React.ElementType;
  percentChange?: number;
  isLoading: boolean;
  secondaryValue?: string | number;
  secondaryLabel?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          typeof value === 'number' && !isNaN(value) ? value.toLocaleString() : value
        )}
      </div>
      
      {percentChange !== undefined ? (
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <span className="text-green-500 flex items-center mr-1">
            <ArrowUpRight className="h-3 w-3" />
            {isLoading ? (
              <Skeleton className="h-4 w-8 ml-1" />
            ) : (
              `${percentChange}%`
            )}
          </span>
          from last month
        </p>
      ) : null}
      
      {secondaryValue !== undefined && secondaryLabel ? (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Circle className="mr-1 h-3 w-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{secondaryLabel}</span>
          </div>
          <span className="text-sm font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              typeof secondaryValue === 'number' ? secondaryValue.toLocaleString() : secondaryValue
            )}
          </span>
        </div>
      ) : null}
    </CardContent>
  </Card>
));

// Lazy-loaded dashboard content
const DashboardContent = memo(() => {
  // Fetch summary data with optimized caching
  const { data: gameStats, isLoading: loadingGames } = useQuery({
    queryKey: ['/api/games/stats'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });

  const { data: blogStats, isLoading: loadingBlog } = useQuery({
    queryKey: ['/api/blog/stats'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });

  const { data: userStats, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users/stats'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });

  // Memoized values
  const totalGames = useMemo(() => gameStats?.totalGames || 0, [gameStats]);
  const totalPosts = useMemo(() => blogStats?.totalPosts || 0, [blogStats]);
  const totalUsers = useMemo(() => userStats?.totalUsers || 0, [userStats]);
  const totalPlays = useMemo(() => gameStats?.totalPlays || 0, [gameStats]);
  const playsThisWeek = useMemo(() => gameStats?.playsThisWeek || 0, [gameStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to GameZone Admin Panel</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Games"
          value={totalGames}
          icon={Gamepad2}
          percentChange={gameStats?.newGamesPercent}
          isLoading={loadingGames}
        />
        
        <SummaryCard
          title="Total Blog Posts"
          value={totalPosts}
          icon={Newspaper}
          percentChange={blogStats?.newPostsPercent}
          isLoading={loadingBlog}
        />
        
        <SummaryCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          percentChange={userStats?.newUsersPercent}
          isLoading={loadingUsers}
        />
        
        <SummaryCard
          title="Total Plays"
          value={totalPlays}
          icon={TrendingUp}
          isLoading={loadingGames}
          secondaryValue={playsThisWeek}
          secondaryLabel="This week"
        />
      </div>
      
      {/* Analytics Section */}
      <Analytics />
    </div>
  );
});

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1">
        {/* Dashboard Header with Notification Bell */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor your website's performance and manage content</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <AdminProfile />
            </div>
          </div>
        </div>
        
        <div className="p-6 lg:p-10">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}
