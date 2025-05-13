import AdminNavigation from "@/components/admin/navigation";
import { Analytics } from "@/components/admin/dashboard/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Game, BlogPost } from "@shared/schema";
import { Circle, ArrowUpRight, TrendingUp, BarChart, Users, Gamepad2, Newspaper } from "lucide-react";

export default function AdminDashboard() {
  // Fetch summary data
  const { data: gameStats, isLoading: loadingGames } = useQuery({
    queryKey: ['/api/games/stats'],
  });

  const { data: blogStats, isLoading: loadingBlog } = useQuery({
    queryKey: ['/api/blog/stats'],
  });

  const { data: userStats, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users/stats'],
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to GameZone Admin Panel</p>
          </div>
          
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingGames ? "Loading..." : gameStats?.totalGames || 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-green-500 flex items-center mr-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {gameStats?.newGamesPercent || 0}%
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Blog Posts</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingBlog ? "Loading..." : blogStats?.totalPosts || 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-green-500 flex items-center mr-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {blogStats?.newPostsPercent || 0}%
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingUsers ? "Loading..." : userStats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-green-500 flex items-center mr-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {userStats?.newUsersPercent || 0}%
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingGames ? "Loading..." : gameStats?.totalPlays?.toLocaleString() || 0}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <Circle className="mr-1 h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs text-muted-foreground">This week</span>
                  </div>
                  <span className="text-sm font-medium">
                    {gameStats?.playsThisWeek?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Analytics Section */}
          <Analytics />
        </div>
      </div>
    </div>
  );
}
