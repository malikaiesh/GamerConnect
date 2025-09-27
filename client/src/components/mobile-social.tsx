import { Link } from "wouter";
import { useState } from "react";
import { 
  UserPlus, 
  Users, 
  MessageCircle,
  ArrowLeft,
  Bell,
  Search,
  Send,
  UserCheck,
  Clock,
  Mail
} from "lucide-react";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type ActiveSection = "find-friends" | "friend-requests" | "messages";

interface TabItem {
  id: ActiveSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export function MobileSocial() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("find-friends");
  const queryClient = useQueryClient();

  // Fetch real data from APIs - ALL HOOKS MUST BE AT COMPONENT BODY LEVEL
  const { data: friendsData } = useQuery({
    queryKey: ["/api/friends"],
  });

  // Re-enabled after API fix - WITH LOADING STATES
  const { data: friendRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  // Friend suggestions query (moved from renderFindFriends to fix hook rules)
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/friends/suggestions"],
  });

  // Dynamic tabs with real data counts
  const tabs: TabItem[] = [
    {
      id: "find-friends",
      label: "Find Friends",
      icon: UserPlus,
      count: suggestions?.length || 0
    },
    {
      id: "friend-requests", 
      label: "Requests",
      icon: Users,
      count: friendRequests?.length || 0
    },
    {
      id: "messages",
      label: "Messages", 
      icon: MessageCircle,
      count: messages?.length || 0
    }
  ];

  // Mutations for social actions
  const addFriendMutation = useMutation({
    mutationFn: (userId: number) => apiRequest("/api/friends/request", {
      method: "POST",
      body: JSON.stringify({ targetUserId: userId }),
      headers: {
        "Content-Type": "application/json"
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    }
  });

  const acceptFriendMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest(`/api/friends/requests/${requestId}/accept`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    }
  });

  const declineFriendMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest(`/api/friends/requests/${requestId}/reject`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    }
  });

  // Handler functions
  const handleAddFriend = (userId: number) => {
    addFriendMutation.mutate(userId);
  };

  const handleAcceptRequest = (requestId: number) => {
    acceptFriendMutation.mutate(requestId);
  };

  const handleDeclineRequest = (requestId: number) => {
    declineFriendMutation.mutate(requestId);
  };

  const renderFindFriends = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for players..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white"
              data-testid="input-search-friends"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Suggested Friends</h3>
          {suggestionsLoading ? (
            <div className="text-center py-4">Loading suggestions...</div>
          ) : suggestions && suggestions.length > 0 ? (
            suggestions.map((user: any) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{user.username?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{user.displayName || user.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.isVerified && "✓ "} Online
                      </div>
                    </div>
                  </div>
                  <button 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                    data-testid={`button-add-friend-${user.id}`}
                    onClick={() => handleAddFriend(user.id)}
                  >
                    Add Friend
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No friend suggestions available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFriendRequests = () => {
    const requestCount = friendRequests?.length || 0;
    
    if (requestsLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Friend Requests</h3>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading friend requests...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Friend Requests</h3>
          {requestCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{requestCount} new</span>
          )}
        </div>
        
        {friendRequests && friendRequests.length > 0 ? (
          friendRequests.map((request: any) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {request.senderUsername?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {request.senderDisplayName || request.senderUsername}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-full text-sm font-medium flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                  data-testid={`button-accept-${request.id}`}
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={acceptFriendMutation.isPending}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Accept
                </button>
                <button 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  data-testid={`button-decline-${request.id}`}
                  onClick={() => handleDeclineRequest(request.id)}
                  disabled={declineFriendMutation.isPending}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pending friend requests</p>
          </div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    if (messagesLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Messages</h3>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Messages</h3>
        
        {messages && messages.length > 0 ? (
          messages.map((message: any) => (
            <div key={message.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative">
                    <span className="text-white font-bold">
                      {message.senderUsername?.[0]?.toUpperCase() || 'U'}
                    </span>
                    {message.isRead === false && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {message.senderDisplayName || message.senderUsername}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {message.content || "No preview available"}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-1" />
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Link href={`/messages?user=${message.senderId}`}>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                    data-testid={`button-message-${message.id}`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent messages</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Link href="/user-dashboard">
            <button 
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Social</h1>
          <button 
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            data-testid="button-notifications"
          >
            <Bell className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-white/90 text-sm">
            Connect with friends and grow your gaming community
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">24</div>
            <div className="text-xs opacity-80">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs opacity-80">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs opacity-80">Messages</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl shadow-md p-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.count && tab.count > 0 && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-white text-purple-500" : "bg-red-500 text-white"
                  )}>
                    {tab.count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {activeSection === "find-friends" && renderFindFriends()}
        {activeSection === "friend-requests" && renderFriendRequests()}
        {activeSection === "messages" && renderMessages()}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}