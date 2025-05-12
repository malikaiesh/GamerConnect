import { useQuery } from "@tanstack/react-query";
import { PushSubscriber } from "@shared/schema";
import AdminLayout from "@/components/admin/layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, SendHorizontal } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PushNotificationSubscribersPage() {
  const { toast } = useToast();
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  
  const { data: subscribers, isLoading } = useQuery<PushSubscriber[]>({
    queryKey: ["/api/push-notifications/subscribers"],
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/push-notifications/subscribers/${id}`);
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/subscribers"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the subscriber.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<PushSubscriber>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="w-4 h-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="w-4 h-4"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "browser",
      accessorKey: "browser",
      header: "Browser",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.browser || "Unknown"}</span>
          <span className="text-xs text-gray-500">{row.original.os || "Unknown OS"}</span>
        </div>
      ),
    },
    {
      id: "deviceType",
      accessorKey: "deviceType",
      header: "Device",
      cell: ({ row }) => row.original.deviceType || "Unknown",
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = [row.original.city, row.original.region, row.original.country]
          .filter(Boolean)
          .join(", ");
        return location || "Unknown";
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === "active" ? "default" : "destructive"}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "lastSent",
      accessorKey: "lastSent",
      header: "Last Notification",
      cell: ({ row }) => {
        const lastSent = row.original.lastSent;
        return lastSent 
          ? format(new Date(lastSent), "MMM d, yyyy 'at' h:mm a") 
          : "Never";
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Subscribed On",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
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
      description="Manage push notification subscribers for your campaigns"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" disabled={selectedSubscribers.length === 0}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            Send Test
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <DataTable
          data={subscribers || []}
          columns={columns}
          searchField="browser"
          pagination
          onRowSelectionChange={setSelectedSubscribers}
        />
      )}
    </AdminLayout>
  );
}