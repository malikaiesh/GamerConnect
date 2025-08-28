import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Users, 
  Home, 
  Calendar,
  Shield,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

interface Room {
  id: number;
  roomId: string;
  name: string;
  description?: string;
  type: string;
  currentUsers: number;
  maxSeats: number;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

interface VerificationStats {
  users: {
    verified: number;
    total: number;
  };
  rooms: {
    verified: number;
    total: number;
  };
}

export default function VerificationTool() {
  const [userSearch, setUserSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searchedRoom, setSearchedRoom] = useState<Room | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get verification statistics
  const { data: stats } = useQuery<VerificationStats>({
    queryKey: ['/api/verification/stats'],
  });

  // Search user mutation
  const searchUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/verification/user/${encodeURIComponent(username)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to search user');
      }
      return response.json();
    },
    onSuccess: (user: User) => {
      setSearchedUser(user);
      setUserNotFound(false);
    },
    onError: (error: Error) => {
      setSearchedUser(null);
      if (error.message === 'User not found') {
        setUserNotFound(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to search for user",
          variant: "destructive",
        });
      }
    },
  });

  // Search room mutation
  const searchRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/verification/room/${encodeURIComponent(roomId)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Room not found');
        }
        throw new Error('Failed to search room');
      }
      return response.json();
    },
    onSuccess: (room: Room) => {
      setSearchedRoom(room);
      setRoomNotFound(false);
    },
    onError: (error: Error) => {
      setSearchedRoom(null);
      if (error.message === 'Room not found') {
        setRoomNotFound(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to search for room",
          variant: "destructive",
        });
      }
    },
  });

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: async ({ username, isVerified }: { username: string; isVerified: boolean }) => {
      return apiRequest(`/api/verification/user/${encodeURIComponent(username)}`, {
        method: 'POST',
        body: { isVerified },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setSearchedUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/verification/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user verification",
        variant: "destructive",
      });
    },
  });

  // Verify room mutation
  const verifyRoomMutation = useMutation({
    mutationFn: async ({ roomId, isVerified }: { roomId: string; isVerified: boolean }) => {
      return apiRequest(`/api/verification/room/${encodeURIComponent(roomId)}`, {
        method: 'POST',
        body: { isVerified },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setSearchedRoom(data.room);
      queryClient.invalidateQueries({ queryKey: ['/api/verification/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update room verification",
        variant: "destructive",
      });
    },
  });

  const handleUserSearch = () => {
    if (userSearch.trim()) {
      searchUserMutation.mutate(userSearch.trim());
    }
  };

  const handleRoomSearch = () => {
    if (roomSearch.trim()) {
      searchRoomMutation.mutate(roomSearch.trim());
    }
  };

  const handleVerifyUser = (isVerified: boolean) => {
    if (searchedUser) {
      verifyUserMutation.mutate({ username: searchedUser.username, isVerified });
    }
  };

  const handleVerifyRoom = (isVerified: boolean) => {
    if (searchedRoom) {
      verifyRoomMutation.mutate({ roomId: searchedRoom.roomId, isVerified });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Verification Tool</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Users</p>
                  <p className="text-lg font-semibold">{stats.users.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-lg font-semibold">{stats.users.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Rooms</p>
                  <p className="text-lg font-semibold">{stats.rooms.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</p>
                  <p className="text-lg font-semibold">{stats.rooms.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Verification</TabsTrigger>
          <TabsTrigger value="rooms">Room Verification</TabsTrigger>
        </TabsList>

        {/* User Verification Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Verification</CardTitle>
              <CardDescription>
                Search for users by username to manage their verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="user-search">Username</Label>
                  <Input
                    id="user-search"
                    placeholder="Enter username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                  />
                </div>
                <Button 
                  onClick={handleUserSearch} 
                  disabled={searchUserMutation.isPending}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searchUserMutation.isPending ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Results */}
              {userNotFound && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span>User not found with username: "{userSearch}"</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchedUser && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={searchedUser.profilePicture} />
                        <AvatarFallback>
                          {searchedUser.displayName?.[0]?.toUpperCase() || searchedUser.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            {searchedUser.displayName || searchedUser.username}
                          </h3>
                          {searchedUser.isVerified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">@{searchedUser.username}</p>
                        
                        {searchedUser.bio && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{searchedUser.bio}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {new Date(searchedUser.createdAt).toLocaleDateString()}</span>
                          </span>
                          {searchedUser.verifiedAt && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified {new Date(searchedUser.verifiedAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {searchedUser.isVerified ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyUser(false)}
                              disabled={verifyUserMutation.isPending}
                            >
                              <ShieldX className="w-4 h-4 mr-2" />
                              Remove Verification
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyUser(true)}
                              disabled={verifyUserMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Verify User
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Room Verification Tab */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Room Verification</CardTitle>
              <CardDescription>
                Search for rooms by Room ID to manage their verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="room-search">Room ID</Label>
                  <Input
                    id="room-search"
                    placeholder="Enter Room ID..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRoomSearch()}
                  />
                </div>
                <Button 
                  onClick={handleRoomSearch} 
                  disabled={searchRoomMutation.isPending}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searchRoomMutation.isPending ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Results */}
              {roomNotFound && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span>Room not found with ID: "{roomSearch}"</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchedRoom && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Home className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold">{searchedRoom.name}</h3>
                            {searchedRoom.isVerified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Room ID: {searchedRoom.roomId}</p>
                        </div>
                      </div>
                      
                      {searchedRoom.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{searchedRoom.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 py-3">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-lg font-semibold">{searchedRoom.currentUsers}/{searchedRoom.maxSeats}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Current Users</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-lg font-semibold capitalize">{searchedRoom.type}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Room Type</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {new Date(searchedRoom.createdAt).toLocaleDateString()}</span>
                        </span>
                        {searchedRoom.verifiedAt && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified {new Date(searchedRoom.verifiedAt).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        {searchedRoom.isVerified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyRoom(false)}
                            disabled={verifyRoomMutation.isPending}
                          >
                            <ShieldX className="w-4 h-4 mr-2" />
                            Remove Verification
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyRoom(true)}
                            disabled={verifyRoomMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Verify Room
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}