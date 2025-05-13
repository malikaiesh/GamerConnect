import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnSite: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topGames: Array<{
    name: string;
    plays: number;
  }>;
  dailyVisitors: Array<{
    date: string;
    visitors: number;
  }>;
  userDevices: Array<{
    device: string;
    count: number;
  }>;
}

const defaultTimeframe = '7days';

export function Analytics() {
  const [timeframe, setTimeframe] = useState<string>(defaultTimeframe);
  
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', timeframe],
    refetchInterval: 60000, // Refresh every minute
  });

  // Format chart data
  const formatTopGamesData = (data?: Array<{ name: string; plays: number }>) => {
    if (!data) return [];
    return data.map(game => ({
      name: game.name.length > 15 ? `${game.name.substring(0, 15)}...` : game.name,
      value: game.plays,
      fullName: game.name,
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const formatTopPagesData = (data?: Array<{ path: string; views: number }>) => {
    if (!data) return [];
    return data.map(page => ({
      name: page.path.length > 20 ? `${page.path.substring(0, 20)}...` : page.path,
      value: page.views,
      fullPath: page.path,
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const formatDailyData = (data?: Array<{ date: string; visitors: number }>) => {
    if (!data) return [];
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: item.visitors
    }));
  };

  // Chart colors
  const COLORS = ['#7e57c2', '#ff5722', '#4caf50', '#2196f3', '#ff9800'];

  const topGamesData = formatTopGamesData(data?.topGames);
  const topPagesData = formatTopPagesData(data?.topPages);
  const dailyData = formatDailyData(data?.dailyVisitors);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading analytics data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pageViews.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total page views in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.uniqueVisitors.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total unique visitors in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.topGames?.reduce((sum, game) => sum + game.plays, 0).toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total game plays in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.averageSessionDuration
                ? `${Math.floor(data.averageSessionDuration / 60)}m ${data.averageSessionDuration % 60}s`
                : '0m 0s'}
            </div>
            <p className="text-xs text-muted-foreground">Average session duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Games</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topGamesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {topGamesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Most Visited Pages</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topPagesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value, name, props) => [value, props.payload.fullPath]} />
                <Bar dataKey="value" fill="#7e57c2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pageViews" stroke="#7e57c2" activeDot={{ r: 8 }} name="Page Views" />
              <Line type="monotone" dataKey="uniqueVisitors" stroke="#ff5722" name="Unique Visitors" />
              <Line type="monotone" dataKey="gamePlayCount" stroke="#4caf50" name="Game Plays" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
