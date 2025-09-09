import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Check, UserPlus, Shield } from "lucide-react";

interface User {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  isVerified: boolean;
  bio?: string;
  country?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function FindFriends() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all users for discovery
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/friends/discover"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/friends/discover");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (targetUserId: number) => {
      const response = await apiRequest("POST", "/api/friends/request", {
        targetUserId,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send friend request");
      }
      
      return response.json();
    },
    onSuccess: (data, targetUserId) => {
      toast({
        title: "Success",
        description: "Friend request sent successfully!",
      });
      
      // Refresh the user discovery list
      queryClient.invalidateQueries({ queryKey: ["/api/friends/discover"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendFriendRequest = (targetUserId: number) => {
    sendFriendRequestMutation.mutate(targetUserId);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short" 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Find Friends
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover and connect with other players in our gaming community. 
            Send friend requests to start building your network!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by username, name, bio, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:border-blue-500"
              data-testid="input-search-users"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Finding amazing people to connect with...</p>
          </div>
        )}

        {/* Users Grid */}
        {!isLoading && (
          <>
            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => (
                <Card 
                  key={user.id} 
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                  data-testid={`card-user-${user.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Profile Picture or Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={user.displayName || user.username}
                              className="w-12 h-12 rounded-full object-cover"
                              data-testid={`img-avatar-${user.id}`}
                            />
                          ) : (
                            <span data-testid={`text-avatar-${user.id}`}>
                              {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold text-white truncate" data-testid={`text-displayname-${user.id}`}>
                              {user.displayName || user.username}
                            </h3>
                            {user.isVerified && (
                              <Shield className="h-4 w-4 text-blue-400" data-testid={`icon-verified-${user.id}`} />
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate" data-testid={`text-username-${user.id}`}>
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2" data-testid={`text-bio-${user.id}`}>
                        {user.bio}
                      </p>
                    )}

                    {/* Country and Join Date */}
                    <div className="space-y-2 mb-4">
                      {user.country && (
                        <Badge variant="secondary" className="bg-slate-700 text-gray-300 text-xs" data-testid={`badge-country-${user.id}`}>
                          📍 {user.country}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500" data-testid={`text-joindate-${user.id}`}>
                        Joined {formatJoinDate(user.createdAt)}
                      </p>
                    </div>

                    {/* Send Friend Request Button */}
                    <Button
                      onClick={() => handleSendFriendRequest(user.id)}
                      disabled={sendFriendRequestMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                      data-testid={`button-send-request-${user.id}`}
                    >
                      {sendFriendRequestMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          <span>Send Request</span>
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {searchTerm ? 'No users found' : 'No users available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms or browse all users.' 
                    : 'All available users have already been added to your friends list.'}
                </p>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm("")}
                    variant="outline"
                    className="mt-4 border-slate-600 text-gray-300 hover:bg-slate-700"
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}