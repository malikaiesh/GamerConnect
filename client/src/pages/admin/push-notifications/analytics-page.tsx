import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AnalyticsData = {
  subscribers: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    byDevice: { name: string; value: number }[];
    byBrowser: { name: string; value: number }[];
    byCountry: { name: string; value: number }[];
    growth: { date: string; value: number }[];
  };
  campaigns: {
    total: number;
    active: number;
    sent: number;
    clicks: number;
    ctr: number;
    performance: { 
      name: string; 
      sent: number;
      delivered: number;
      clicks: number;
      ctr: number;
    }[];
    byDay: { date: string; sent: number; clicks: number }[];
  };
};

export default function PushNotificationAnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/push-notifications-analytics"],
  });

  return (
    <AdminLayout
      title="Push Notification Analytics"
      description="Track and analyze push notification performance"
    >
      {isLoading || !data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="overflow-hidden border-border bg-card shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-indigo-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.subscribers.total.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <span className="font-medium text-emerald-500 mr-1">
                    +{data.subscribers.newToday}
                  </span>{" "}
                  <span>new today</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-border bg-card shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-blue-500"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.subscribers.active.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  {data.subscribers.total > 0 ? (
                    <><span className="font-medium text-blue-500 mr-1">
                      {Math.round((data.subscribers.active / data.subscribers.total) * 100)}%
                    </span> of total subscribers</>
                  ) : (
                    <span>No active subscribers yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-border bg-card shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-purple-500"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.campaigns.sent.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <span className="font-medium text-purple-500 mr-1">{data.campaigns.total}</span>{" "}
                  <span>total campaigns</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-border bg-card shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-emerald-500"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.campaigns.ctr.toFixed(2)}%</div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <span className="font-medium text-emerald-500 mr-1">{data.campaigns.clicks.toLocaleString()}</span>{" "}
                  <span>total clicks</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>New subscribers over time</CardDescription>
              </CardHeader>
              <CardContent>
                {data.subscribers.growth.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-primary/10 p-3 text-primary mb-4">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No subscriber data yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      When users subscribe to push notifications, their growth data will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.subscribers.growth}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1b2c', borderColor: '#2d2b3b', color: '#fff' }} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorSubscribers)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Notification engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {data.campaigns.byDay.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-primary/10 p-3 text-primary mb-4">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No campaign data yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Campaign performance metrics will be displayed here once you've sent push notifications.
                    </p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.campaigns.byDay}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1b2c', borderColor: '#2d2b3b', color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="sent" fill="#6366f1" name="Sent" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="clicks" fill="#10b981" name="Clicks" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Subscriber Breakdown</CardTitle>
                <CardDescription>Distribution by devices, browsers, and location</CardDescription>
              </CardHeader>
              <CardContent>
                {data.subscribers.byDevice.length === 0 && 
                 data.subscribers.byBrowser.length === 0 && 
                 data.subscribers.byCountry.length === 0 ? (
                  <Alert className="bg-primary/5 border-primary/10">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Subscriber breakdown data will appear here once users start subscribing to push notifications.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Tabs defaultValue="device">
                    <TabsList className="mb-4">
                      <TabsTrigger value="device">Devices</TabsTrigger>
                      <TabsTrigger value="browser">Browsers</TabsTrigger>
                      <TabsTrigger value="country">Countries</TabsTrigger>
                    </TabsList>
                    <TabsContent value="device">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.subscribers.byDevice}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1b2c', borderColor: '#2d2b3b', color: '#fff' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="browser">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.subscribers.byBrowser}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1b2c', borderColor: '#2d2b3b', color: '#fff' }} />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="country">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.subscribers.byCountry}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1b2c', borderColor: '#2d2b3b', color: '#fff' }} />
                            <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
}