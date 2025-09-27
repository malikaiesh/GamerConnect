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
  Mail,
  Phone,
  Video,
  MapPin,
  Circle
} from "lucide-react";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { usePresence } from "@/hooks/use-presence";

type ActiveSection = "find-friends" | "friend-requests" | "messages" | "friends" | "calls";

interface TabItem {
  id: ActiveSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export function MobileSocial() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("find-friends");
  const queryClient = useQueryClient();

  // Get current user for presence tracking
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });

  // Initialize real-time presence tracking
  const { isConnected, updatePresence, friendsPresence } = usePresence(currentUser?.id?.toString() || null);

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

  // Accepted friends with presence tracking
  const { data: acceptedFriends, isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends/accepted"],
  });

  // Call history
  const { data: callHistory, isLoading: callsLoading } = useQuery({
    queryKey: ["/api/friends/calls/history"],
  });

  // Dynamic tabs with real data counts
  const tabs: TabItem[] = [
    {
      id: "find-friends",
      label: "Find",
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
      id: "friends",
      label: "Friends", 
      icon: UserCheck,
      count: acceptedFriends?.length || 0
    },
    {
      id: "calls",
      label: "Calls", 
      icon: Phone,
      count: callHistory?.calls?.length || 0
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
      queryClient.invalidateQueries({ queryKey: ["/api/friends/accepted"] });
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

  const handleJoinRoom = (roomId: string, friendName: string) => {
    // Navigate to the room where the friend is located
    window.location.href = `/rooms/${roomId}?join=friend&from=${encodeURIComponent(friendName)}`;
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

  const renderFriends = () => {
    if (friendsLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Friends</h3>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading friends...</p>
          </div>
        </div>
      );
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'online': return 'bg-green-500';
        case 'away': return 'bg-yellow-500';
        case 'busy': return 'bg-red-500';
        case 'offline': return 'bg-gray-400';
        default: return 'bg-gray-400';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'online': return 'Online';
        case 'away': return 'Away';
        case 'busy': return 'Busy';
        case 'offline': return 'Offline';
        default: return 'Unknown';
      }
    };

    // Merge real-time presence data with friends list
    const friendsWithRealTimePresence = acceptedFriends?.map((friend: any) => {
      const realtimePresence = friendsPresence.get(friend.id.toString());
      if (realtimePresence) {
        return {
          ...friend,
          status: realtimePresence.status,
          currentRoom: realtimePresence.currentRoomId ? {
            id: realtimePresence.currentRoomId,
            canJoin: true
          } : null
        };
      }
      return friend;
    }) || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Friends</h3>
          {isConnected && (
            <div className="flex items-center text-xs text-green-500">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              Live updates
            </div>
          )}
        </div>
        
        {friendsWithRealTimePresence.length > 0 ? (
          friendsWithRealTimePresence.map((friend: any) => (
            <div key={friend.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {friend.username?.[0]?.toUpperCase() || 'F'}
                      </span>
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                      getStatusColor(friend.status)
                    )}></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-white flex items-center">
                      {friend.displayName || friend.username}
                      {friend.isVerified && <span className="ml-1 text-blue-500">✓</span>}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Circle className={cn("w-2 h-2 mr-1", getStatusColor(friend.status))} />
                      {getStatusLabel(friend.status)}
                      {friend.currentRoom && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="text-xs">In room</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Friends since {new Date(friend.friendsSince).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {friend.currentRoom && (
                    <button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                      data-testid={`button-join-room-${friend.id}`}
                      onClick={() => handleJoinRoom(friend.currentRoom.id, friend.displayName || friend.username)}
                    >
                      Join Room
                    </button>
                  )}
                  <Link href={`/messages?user=${friend.id}`}>
                    <button 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                      data-testid={`button-message-friend-${friend.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No friends yet</p>
            <p className="text-sm mt-1">Start by finding friends in the Find tab!</p>
          </div>
        )}
      </div>
    );
  };

  const renderCalls = () => {
    if (callsLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Call History</h3>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading call history...</p>
          </div>
        </div>
      );
    }

    const getCallIcon = (type: string) => {
      switch (type) {
        case 'video': return Video;
        case 'voice': return Phone;
        case 'room_call': return Users;
        default: return Phone;
      }
    };

    const getCallStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return 'text-green-500';
        case 'missed': return 'text-red-500';
        case 'rejected': return 'text-gray-500';
        case 'failed': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    const formatDuration = (seconds: number) => {
      if (seconds === 0) return '0s';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (minutes === 0) return `${remainingSeconds}s`;
      return `${minutes}m ${remainingSeconds}s`;
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Call History</h3>
        
        {callHistory?.calls && callHistory.calls.length > 0 ? (
          callHistory.calls.map((call: any) => {
            const CallIcon = getCallIcon(call.type);
            return (
              <div key={call.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {call.contact?.username?.[0]?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-white flex items-center">
                        {call.contact?.displayName || call.contact?.username}
                        <CallIcon className="w-4 h-4 ml-2 text-gray-500" />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <span className={cn("capitalize", getCallStatusColor(call.status))}>
                          {call.status}
                        </span>
                        {call.isOutgoing ? " • Outgoing" : " • Incoming"}
                        {call.duration > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{formatDuration(call.duration)}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(call.timestamp).toLocaleDateString()} at {new Date(call.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                      data-testid={`button-call-${call.contact.id}`}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <Link href={`/messages?user=${call.contact.id}`}>
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                        data-testid={`button-message-caller-${call.contact.id}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No call history</p>
            <p className="text-sm mt-1">Your calls with friends will appear here</p>
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
          <div className="flex items-center justify-center mt-2">
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              isConnected ? "bg-green-400" : "bg-red-400"
            )}></div>
            <span className="text-xs text-white/70">
              {isConnected ? "Real-time updates active" : "Connecting..."}
            </span>
            {/* Quick status test buttons - only show when connected */}
            {isConnected && currentUser && (
              <div className="ml-4 flex space-x-1">
                <button 
                  onClick={() => updatePresence('online')}
                  className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded"
                  data-testid="button-status-online"
                >
                  Online
                </button>
                <button 
                  onClick={() => updatePresence('away')}
                  className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded"
                  data-testid="button-status-away"
                >
                  Away
                </button>
                <button 
                  onClick={() => updatePresence('busy')}
                  className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded"
                  data-testid="button-status-busy"
                >
                  Busy
                </button>
              </div>
            )}
          </div>
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
                {tab.count !== undefined && tab.count !== null && Number(tab.count) > 0 && (
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
        {activeSection === "friends" && renderFriends()}
        {activeSection === "calls" && renderCalls()}
        {activeSection === "messages" && renderMessages()}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}