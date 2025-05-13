import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@shared/schema";
import { Loader2, Calendar } from "lucide-react";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersWithSocialLogin: number;
}

interface DailySignup {
  date: string;
  count: number;
}

interface AccountTypeData {
  name: string;
  value: number;
}

export default function AccountsSignupsPage() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  
  // Fetch user stats
  const { data: stats, isLoading: loadingStats } = useQuery<UserStats>({
    queryKey: ['/api/admin/user-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/user-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }
      return response.json();
    },
  });
  
  // Fetch new user signups over time
  const { data: newUsers, isLoading: loadingNewUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users/new', { days: timeRange }],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/new?days=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch new user data');
      }
      return response.json();
    },
  });
  
  // Process data for daily signup chart
  const getDailySignups = () => {
    if (!newUsers) return [];
    
    const dateMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize all dates in the range with 0 signups
    for (let i = 0; i < parseInt(timeRange); i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    
    // Count signups for each date
    newUsers.forEach(user => {
      const dateStr = new Date(user.createdAt).toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
      }
    });
    
    // Convert to array and sort by date
    const result: DailySignup[] = Array.from(dateMap).map(([date, count]) => ({ date, count }));
    return result.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Create data for account type distribution
  const getAccountTypeDistribution = () => {
    if (!newUsers) return [];
    
    const accountTypes = new Map<string, number>();
    
    newUsers.forEach(user => {
      const type = user.accountType || 'local';
      accountTypes.set(type, (accountTypes.get(type) || 0) + 1);
    });
    
    return Array.from(accountTypes).map(([name, value]) => ({ name, value }));
  };
  
  const accountTypeColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
  
  const dailySignups = getDailySignups();
  const accountTypeData = getAccountTypeDistribution();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Signup Statistics</h2>
          <div>
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as "7" | "30" | "90")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats?.newUsersToday || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats?.newUsersThisWeek || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Signups</CardTitle>
            <CardDescription>
              New user registrations over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingNewUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailySignups}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Types</CardTitle>
              <CardDescription>
                Distribution of user registration methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNewUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {accountTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={accountTypeColors[index % accountTypeColors.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Status</CardTitle>
              <CardDescription>
                Breakdown of active vs. blocked accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Active", value: stats?.activeUsers || 0 },
                        { name: "Blocked", value: stats?.blockedUsers || 0 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}