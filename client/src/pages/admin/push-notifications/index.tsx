import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Bell } from "lucide-react";
import { Link } from "wouter";
import { PushNotification } from "@shared/schema";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PushNotificationsPage() {
  const { toast } = useToast();
  const [previewNotification, setPreviewNotification] = useState<PushNotification | null>(null);
  
  const { data: notifications, isLoading } = useQuery<PushNotification[]>({
    queryKey: ["/api/push-notifications"],
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await apiRequest("PATCH", `/api/push-notifications/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications"] });
      toast({
        title: "Notification updated",
        description: "The notification status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the notification.",
        variant: "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/push-notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications"] });
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error deleting the notification.",
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (id: number, active: boolean) => {
    toggleActiveMutation.mutate({ id, active });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const columns: ColumnDef<PushNotification>[] = [
    {
      id: "title",
      accessorKey: "title",
      header: "Title & Message",
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {row.original.message}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.type === "toast"
              ? "default"
              : row.original.type === "banner"
              ? "secondary"
              : row.original.type === "modal"
              ? "destructive"
              : "outline"
          }
        >
          {row.original.type.charAt(0).toUpperCase() + row.original.type.slice(1)}
        </Badge>
      ),
    },
    {
      id: "active",
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          onCheckedChange={(checked) => handleToggleActive(row.original.id, checked)}
        />
      ),
    },
    {
      id: "stats",
      header: "Statistics",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-sm">Impressions: {row.original.impressionCount.toLocaleString()}</div>
          <div className="text-sm">Clicks: {row.original.clickCount.toLocaleString()}</div>
          {row.original.impressionCount > 0 && (
            <div className="text-xs text-gray-500">
              CTR: {((row.original.clickCount / row.original.impressionCount) * 100).toFixed(2)}%
            </div>
          )}
        </div>
      ),
    },
    {
      id: "created",
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPreviewNotification(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/push-notifications/${row.original.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
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
      title="Push Notifications"
      description="Manage in-app notifications for your users"
      actions={
        <Button asChild>
          <Link href="/admin/push-notifications/new">
            <Plus className="mr-2 h-4 w-4" />
            New Notification
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <DataTable
            data={notifications || []}
            columns={columns}
            searchField="title"
            pagination
          />

          <Dialog open={!!previewNotification} onOpenChange={() => setPreviewNotification(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preview
                </DialogTitle>
                <DialogDescription>Preview how the notification will appear to users.</DialogDescription>
              </DialogHeader>

              {previewNotification && (
                <div className="mt-4">
                  <div className={`p-4 rounded-lg border ${
                    previewNotification.type === "toast" 
                      ? "bg-white dark:bg-gray-800" 
                      : previewNotification.type === "banner"
                      ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800"
                      : previewNotification.type === "modal"
                      ? "bg-white dark:bg-gray-800 shadow-lg"
                      : ""
                  }`}>
                    <h3 className="font-medium text-lg">{previewNotification.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{previewNotification.message}</p>
                    
                    {previewNotification.image && (
                      <img 
                        src={previewNotification.image} 
                        alt="Notification image" 
                        className="mt-3 rounded-md w-full max-h-48 object-cover"
                      />
                    )}
                    
                    {previewNotification.link && (
                      <div className="mt-3">
                        <span className="text-sm text-blue-500">Link: {previewNotification.link}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4 gap-2">
                      <Button variant="outline" size="sm">Dismiss</Button>
                      {previewNotification.link && (
                        <Button size="sm">View Details</Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Type: <span className="font-medium">{previewNotification.type}</span></p>
                    <p>Created: <span className="font-medium">{format(new Date(previewNotification.createdAt), "MMM d, yyyy")}</span></p>
                    <p>Status: <span className={`font-medium ${previewNotification.active ? "text-green-500" : "text-red-500"}`}>
                      {previewNotification.active ? "Active" : "Inactive"}
                    </span></p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </AdminLayout>
  );
}