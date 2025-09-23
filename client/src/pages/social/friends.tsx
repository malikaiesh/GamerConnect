import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search,
  UserPlus,
  MessageCircle,
  Phone,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";

interface Friend {
  id: number;
  username: string;
  displayName: string;
  status: 'online' | 'offline' | 'in-game' | 'in-room';
  lastSeen: string;
  friendsSince: string;
  currentRoom?: {
    roomId: string;
    name: string;
  };
}

function FriendCard({ friend }: { friend: Friend }) {
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
      case 'in-room': return `In ${friend.currentRoom?.name}`;
      default: return 'Offline';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-[hsl(260,35%,12%)] border-[hsl(260,20%,18%)]" data-testid={`friend-card-${friend.username}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {friend.displayName?.charAt(0)?.toUpperCase() || friend.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <CardTitle className="text-lg text-[hsl(0,0%,98%)]">{friend.displayName || friend.username}</CardTitle>
              <p className="text-sm text-[hsl(210,10%,70%)]">
                {getStatusText(friend.status)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="text-xs text-[hsl(210,10%,70%)]">
            Friends since {new Date(friend.friendsSince).toLocaleDateString()}
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" data-testid={`button-message-${friend.username}`}>
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4" />
            </Button>
            {friend.status === 'in-room' && friend.currentRoom && (
              <Button size="sm" variant="outline">
                Join Room
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: friends, isLoading, error } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/friends/suggestions"],
  });

  const filteredFriends = friends?.filter((friend: Friend) =>
    friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[hsl(260,40%,8%)] flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-[hsl(260,35%,12%)] border-b border-[hsl(260,20%,18%)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(0,0%,98%)]">👥 Friends</h1>
                <p className="text-[hsl(210,10%,70%)]">Connect and chat with your friends</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(210,10%,70%)] w-4 h-4" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-[hsl(260,20%,20%)] border-[hsl(260,20%,18%)] text-[hsl(0,0%,98%)] placeholder:text-[hsl(210,10%,70%)]"
                  data-testid="input-search-friends"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[hsl(260,40%,8%)]">
          {/* Friend Suggestions */}
          <div>
            <h2 className="text-lg font-semibold text-[hsl(0,0%,98%)] mb-4">Suggested Friends</h2>
            {suggestionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-[hsl(260,35%,12%)] border-[hsl(260,20%,18%)]">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[hsl(260,20%,15%)] rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-[hsl(260,20%,15%)] rounded w-20"></div>
                          <div className="h-3 bg-[hsl(260,20%,18%)] rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions?.slice(0, 3).map((suggestion: any) => (
                  <Card key={suggestion.id} className="hover:shadow-lg transition-shadow bg-[hsl(260,35%,12%)] border-[hsl(260,20%,18%)]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {suggestion.displayName?.charAt(0)?.toUpperCase() || suggestion.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base text-[hsl(0,0%,98%)]">{suggestion.displayName || suggestion.username}</CardTitle>
                          <p className="text-sm text-[hsl(210,10%,70%)]">2 mutual friends</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="w-full" data-testid={`button-add-friend-${suggestion.username}`}>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add Friend
                      </Button>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="col-span-full text-center py-8">
                    <UserPlus className="w-8 h-8 text-[hsl(210,10%,70%)] mx-auto mb-2" />
                    <p className="text-[hsl(210,10%,70%)]">No friend suggestions available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Friends List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[hsl(0,0%,98%)]">
                Your Friends ({filteredFriends.length})
              </h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-[hsl(260,35%,12%)] border-[hsl(260,20%,18%)]">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[hsl(260,20%,15%)] rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-[hsl(260,20%,15%)] rounded w-24"></div>
                          <div className="h-3 bg-[hsl(260,20%,18%)] rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Failed to load friends. Please try again.</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-[hsl(262,83%,15%)] rounded-lg inline-block">
                  <Users className="w-8 h-8 text-[hsl(262,83%,58%)] mx-auto mb-2" />
                  <p className="text-[hsl(0,0%,98%)]">
                    {searchQuery ? 'No friends found matching your search.' : 'No friends yet.'}
                  </p>
                  <p className="text-sm text-[hsl(210,10%,70%)] mt-1">
                    {searchQuery ? 'Try a different search term.' : 'Start by adding some friends!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map((friend: Friend) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}