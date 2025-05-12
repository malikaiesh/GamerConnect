import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { PushCampaign } from "@shared/schema";
import AdminLayout from "@/components/admin/layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function PushNotificationCampaignsPage() {
  const { data: campaigns, isLoading } = useQuery<PushCampaign[]>({
    queryKey: ["/api/push-notifications/campaigns"],
  });

  const columns: ColumnDef<PushCampaign>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.title}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "draft"
                ? "outline"
                : status === "scheduled"
                ? "secondary"
                : "default"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "sentCount",
      accessorKey: "sentCount",
      header: "Sent",
      cell: ({ row }) => row.original.sentCount.toLocaleString(),
    },
    {
      id: "clickCount",
      accessorKey: "clickCount",
      header: "Clicks",
      cell: ({ row }) => row.original.clickCount.toLocaleString(),
    },
    {
      id: "ctr",
      header: "CTR",
      cell: ({ row }) => {
        const { sentCount, clickCount } = row.original;
        if (sentCount === 0) return "-";
        const ctr = (clickCount / sentCount) * 100;
        return `${ctr.toFixed(2)}%`;
      },
    },
    {
      id: "scheduleDate",
      accessorKey: "scheduleDate",
      header: "Schedule",
      cell: ({ row }) => {
        const scheduleDate = row.original.scheduleDate;
        return scheduleDate 
          ? format(new Date(scheduleDate), "MMM d, yyyy 'at' h:mm a") 
          : "Not scheduled";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/push-notifications/campaigns/${row.original.id}`}>
              Edit
            </Link>
          </Button>
          <Button asChild size="sm" variant={row.original.status === "draft" ? "default" : "secondary"} disabled={row.original.status !== "draft"}>
            <Link href={`/admin/push-notifications/campaigns/${row.original.id}/send`}>
              {row.original.status === "draft" ? "Send" : "Sent"}
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Push Notification Campaigns"
      description="Manage push notification campaigns for your users"
      actions={
        <Button asChild>
          <Link href="/admin/push-notifications/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
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
        <DataTable
          data={campaigns || []}
          columns={columns}
          searchField="name"
          pagination
        />
      )}
    </AdminLayout>
  );
}