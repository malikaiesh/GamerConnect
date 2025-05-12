import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Send, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { PushCampaign } from "@shared/schema";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PushNotificationCampaignsPage() {
  const { toast } = useToast();
  const [confirmSend, setConfirmSend] = useState<PushCampaign | null>(null);
  
  const { data: campaigns, isLoading } = useQuery<PushCampaign[]>({
    queryKey: ["/api/push-notifications/campaigns"],
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/push-notifications/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error deleting the campaign.",
        variant: "destructive",
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/push-notifications/campaigns/${id}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications/campaigns"] });
      toast({
        title: "Campaign sent",
        description: "The campaign has been queued for sending.",
      });
      setConfirmSend(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error sending the campaign.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const handleSendCampaign = (campaign: PushCampaign) => {
    setConfirmSend(campaign);
  };

  const confirmSendCampaign = () => {
    if (confirmSend) {
      sendCampaignMutation.mutate(confirmSend.id);
    }
  };

  const columns: ColumnDef<PushCampaign>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Campaign & Content",
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium">{row.original.name}</div>
          <div className="flex flex-col text-sm">
            <span className="text-gray-500 dark:text-gray-400 truncate">{row.original.title}</span>
            <span className="text-gray-500 dark:text-gray-400 truncate">{row.original.message}</span>
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
                : status === "sent"
                ? "default"
                : "destructive"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "targeting",
      header: "Targeting",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.targetAll ? "All Subscribers" : "Filtered Audience"}
          {row.original.isSurvey && (
            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-900">
              Survey
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "schedule",
      header: "Scheduled For",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.scheduleDate 
            ? format(new Date(row.original.scheduleDate), "MMM d, yyyy 'at' h:mm a") 
            : row.original.status === "sent"
            ? "Sent"
            : "Not scheduled"}
        </div>
      ),
    },
    {
      id: "stats",
      header: "Statistics",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-sm">Sent: {row.original.sentCount.toLocaleString()}</div>
          <div className="text-sm">Clicks: {row.original.clickCount.toLocaleString()}</div>
          {row.original.sentCount > 0 && (
            <div className="text-xs text-gray-500">
              CTR: {((row.original.clickCount / row.original.sentCount) * 100).toFixed(2)}%
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.status === "draft" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleSendCampaign(row.original)}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/push-notifications/campaigns/${row.original.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          {row.original.status !== "sent" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Push Notification Campaigns"
      description="Create and manage push notification campaigns"
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/admin/push-notifications/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/push-notifications/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </>
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

      <Dialog open={!!confirmSend} onOpenChange={() => setConfirmSend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this campaign? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {confirmSend && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium">{confirmSend.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Title: {confirmSend.title}</p>
                <p className="text-sm text-muted-foreground">Message: {confirmSend.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Target Audience:</span>{" "}
                  {confirmSend.targetAll ? "All Subscribers" : "Filtered Audience"}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {confirmSend.isSurvey ? "Survey" : "Standard Notification"}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSend(null)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmSendCampaign} 
              disabled={sendCampaignMutation.isPending}
            >
              {sendCampaignMutation.isPending ? "Sending..." : "Send Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}