import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BarChart3, Bell, Download, HardDrive, Trash2, Users, BellOff } from "lucide-react";
import { Link } from "wouter";
import { PushSubscriber } from "@shared/schema";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SubscribersStats = {
  total: number;
  active: number;
  desktop: number;
  mobile: number;
  tablet: number;
  browser: { [key: string]: number };
  country: { [key: string]: number };
};

export default function PushNotificationSubscribersPage() {
  const { toast } = useToast();
  
  const { data: subscribers, isLoading } = useQuery<PushSubscriber[]>({
    queryKey: ["/api/push-notifications/subscribers"],
  });

  const { data: stats } = useQuery<SubscribersStats>({
    queryKey: ["/api/push-notifications/subscribers/stats"],
  });
  
  const toggleWebPushMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      return await apiRequest(
        "PATCH", 
        `/api/push-notifications/subscribers/${id}/web-push-preference`,
        { webPushEnabled: enabled }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/subscribers"] });
      toast({
        title: "Preference updated",
        description: "Web push notification preference has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the web push preference.",
        variant: "destructive",
      });
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/push-notifications/subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/subscribers/stats"] });
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error deleting the subscriber.",
        variant: "destructive",
      });
    },
  });
  
  const bulkUpdateWebPushMutation = useMutation({
    mutationFn: async ({ ids, enabled }: { ids: number[]; enabled: boolean }) => {
      return await apiRequest(
        "POST", 
        "/api/push-notifications/subscribers/web-push-preferences", 
        { ids, webPushEnabled: enabled }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/subscribers"] });
      toast({
        title: "Preferences updated",
        description: `Web push notifications ${variables.enabled ? 'enabled' : 'disabled'} for ${variables.ids.length} subscribers.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating web push preferences.",
        variant: "destructive",
      });
    },
  });

  const downloadSubscribersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/push-notifications/subscribers/export");
      const json = await response.json();
      return json.url;
    },
    onSuccess: (url) => {
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "subscribers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export complete",
        description: "Subscribers data has been downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "There was an error exporting subscribers data.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      deleteSubscriberMutation.mutate(id);
    }
  };

  const handleExport = () => {
    downloadSubscribersMutation.mutate();
  };

  const columns: ColumnDef<PushSubscriber>[] = [
    {
      id: "endpoint",
      accessorKey: "endpoint",
      header: "Endpoint & Details",
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium truncate" title={row.original.endpoint}>
            {row.original.endpoint.substring(0, 40)}...
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.deviceType || "Unknown"} / {row.original.browser || "Unknown"}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "active"
              ? "default"
              : row.original.status === "inactive"
              ? "secondary"
              : "outline"
          }
        >
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-sm">{row.original.country || "Unknown"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.city ? `${row.original.city}` : ""}
          </div>
        </div>
      ),
    },
    {
      id: "lastInteracted",
      accessorKey: "lastInteracted",
      header: "Last Activity",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.lastInteracted
            ? format(new Date(row.original.lastInteracted), "MMM d, yyyy")
            : "Never"}
        </div>
      ),
    },
    {
      id: "created",
      accessorKey: "createdAt",
      header: "Subscribed",
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      id: "webPush",
      header: "Web Push",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Switch 
            checked={row.original.webPushEnabled}
            onCheckedChange={(checked) => 
              toggleWebPushMutation.mutate({ id: row.original.id, enabled: checked })
            }
          />
          <span className="ml-2 text-xs">
            {row.original.webPushEnabled ? (
              <Badge variant="default">Allowed</Badge>
            ) : (
              <Badge variant="outline">Not Allowed</Badge>
            )}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Push Notification Subscribers"
      description="Manage and analyze your push notification subscribers"
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/admin/push-notifications/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="default" onClick={handleExport} disabled={downloadSubscribersMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {downloadSubscribersMutation.isPending ? "Exporting..." : "Export Subscribers"}
          </Button>
        </>
      }
    >
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.active.toLocaleString()} active ({Math.round((stats.active / stats.total) * 100)}%)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Desktop Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.desktop.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.desktop / stats.total) * 100)}% of subscribers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mobile Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mobile.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.mobile / stats.total) * 100)}% of subscribers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Browser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {Object.entries(stats.browser).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.keys(stats.browser).length} different browsers
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Web Push Notification Settings</CardTitle>
          <CardDescription>
            Manage subscribers' web push notification preferences and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 pb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Web Push Allowed</span>
            </div>
            <div className="flex items-center space-x-2">
              <BellOff className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Web Push Not Allowed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Subscribers</TabsTrigger>
          <TabsTrigger value="webpush-allowed">Web Push Allowed</TabsTrigger>
          <TabsTrigger value="webpush-denied">Web Push Denied</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : subscribers && subscribers.length > 0 ? (
            <DataTable
              data={subscribers}
              columns={columns}
              searchField="endpoint"
              pagination
            />
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No subscribers yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Users will appear here when they subscribe to push notifications on your site.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="webpush-allowed" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : subscribers && subscribers.filter(s => s.webPushEnabled).length > 0 ? (
            <DataTable
              data={subscribers.filter(s => s.webPushEnabled)}
              columns={columns}
              searchField="endpoint"
              pagination
            />
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No subscribers with web push allowed</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Subscribers who have allowed web push notifications will appear here.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="webpush-denied" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : subscribers && subscribers.filter(s => !s.webPushEnabled).length > 0 ? (
            <DataTable
              data={subscribers.filter(s => !s.webPushEnabled)}
              columns={columns}
              searchField="endpoint"
              pagination
            />
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No subscribers with web push denied</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Subscribers who have denied web push notifications will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}