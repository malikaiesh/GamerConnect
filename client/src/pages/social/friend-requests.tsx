import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Check,
  X,
  Clock,
  Users
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender: {
    id: number;
    username: string;
    displayName: string;
    status: 'online' | 'offline' | 'in-game' | 'in-room';
  };
}

function FriendRequestCard({ request, type }: { request: FriendRequest; type: 'incoming' | 'outgoing' }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/friends/requests/${request.id}/accept`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend request accepted!",
        description: `You are now friends with ${request.sender.displayName || request.sender.username}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/friends/requests/${request.id}/reject`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request rejected",
        description: "The friend request has been declined.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'in-game': return 'bg-blue-500';
      case 'in-room': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'in-game': return 'Playing Game';
      case 'in-room': return 'In Room';
      default: return 'Offline';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200" data-testid={`friend-request-${request.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {request.sender.displayName?.charAt(0)?.toUpperCase() || request.sender.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(request.sender.status)} rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <CardTitle className="text-lg">{request.sender.displayName || request.sender.username}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getStatusText(request.sender.status)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {type === 'incoming' ? 'Wants to be friends' : 'Friend request sent'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={type === 'incoming' ? 'default' : 'secondary'} className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(request.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {type === 'incoming' && request.status === 'pending' ? (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              data-testid={`button-accept-${request.id}`}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              data-testid={`button-reject-${request.id}`}
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <Badge variant="secondary" className="text-xs">
              {request.status === 'pending' ? 'Pending Response' : 
               request.status === 'accepted' ? 'Accepted' : 'Declined'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FriendRequestsPage() {
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const incomingRequests = requests?.filter((req: FriendRequest) => req.status === 'pending') || [];
  const outgoingRequests = requests?.filter((req: FriendRequest) => req.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Friend Requests</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your incoming and outgoing friend requests</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Incoming Requests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Incoming Requests
              </h2>
              {incomingRequests.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {incomingRequests.length}
                </Badge>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">No pending friend requests</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When someone sends you a friend request, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomingRequests.map((request: FriendRequest) => (
                  <FriendRequestCard key={request.id} request={request} type="incoming" />
                ))}
              </div>
            )}
          </div>

          {/* Outgoing/History */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            
            {outgoingRequests.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300">No recent activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your sent requests and responses will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outgoingRequests.map((request: FriendRequest) => (
                  <FriendRequestCard key={request.id} request={request} type="outgoing" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}