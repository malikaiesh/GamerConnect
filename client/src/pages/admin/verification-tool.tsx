import React, { useState } from "react";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ShieldX,
  Coins,
  Settings,
  Plus,
  Minus
} from "lucide-react";
import { VerificationIcon } from "@/components/ui/verification-icon";
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
  
  // Duration states for timed verification
  const [userVerificationDuration, setUserVerificationDuration] = useState<string>("1");
  const [roomVerificationDuration, setRoomVerificationDuration] = useState<string>("1");
  
  // New state for room seats management
  const [roomSeatsSearch, setRoomSeatsSearch] = useState("");
  const [searchedRoomForSeats, setSearchedRoomForSeats] = useState<Room | null>(null);
  const [roomSeatsNotFound, setRoomSeatsNotFound] = useState(false);
  const [newMaxSeats, setNewMaxSeats] = useState<number>(0);
  
  // New state for diamond management
  const [diamondUserSearch, setDiamondUserSearch] = useState("");
  const [searchedUserForDiamonds, setSearchedUserForDiamonds] = useState<any>(null);
  const [diamondUserNotFound, setDiamondUserNotFound] = useState(false);
  const [diamondAmount, setDiamondAmount] = useState<number>(0);
  
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
    mutationFn: async ({ username, isVerified, durationMonths }: { username: string; isVerified: boolean; durationMonths?: number }) => {
      return apiRequest(`/api/verification/user/${encodeURIComponent(username)}`, {
        method: 'POST',
        body: { isVerified, durationMonths },
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
    mutationFn: async ({ roomId, isVerified, durationMonths }: { roomId: string; isVerified: boolean; durationMonths?: number }) => {
      return apiRequest(`/api/verification/room/${encodeURIComponent(roomId)}`, {
        method: 'POST',
        body: { isVerified, durationMonths },
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
      const durationMonths = isVerified ? parseInt(userVerificationDuration) : undefined;
      verifyUserMutation.mutate({ username: searchedUser.username, isVerified, durationMonths });
    }
  };

  const handleVerifyRoom = (isVerified: boolean) => {
    if (searchedRoom) {
      const durationMonths = isVerified ? parseInt(roomVerificationDuration) : undefined;
      verifyRoomMutation.mutate({ roomId: searchedRoom.roomId, isVerified, durationMonths });
    }
  };

  // Search room for seats management
  const searchRoomForSeatsMutation = useMutation({
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
      setSearchedRoomForSeats(room);
      setRoomSeatsNotFound(false);
      setNewMaxSeats(room.maxSeats);
    },
    onError: (error: Error) => {
      setSearchedRoomForSeats(null);
      if (error.message === 'Room not found') {
        setRoomSeatsNotFound(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to search for room",
          variant: "destructive",
        });
      }
    },
  });

  // Update room seats mutation
  const updateRoomSeatsMutation = useMutation({
    mutationFn: async ({ roomId, maxSeats }: { roomId: string; maxSeats: number }) => {
      return apiRequest(`/api/verification/room/${encodeURIComponent(roomId)}/seats`, {
        method: 'POST',
        body: { maxSeats },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setSearchedRoomForSeats(data.room);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update room seats",
        variant: "destructive",
      });
    },
  });

  // Search user for diamonds management
  const searchUserForDiamondsMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/verification/user/${encodeURIComponent(username)}/wallet`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to search user');
      }
      return response.json();
    },
    onSuccess: (userWallet: any) => {
      setSearchedUserForDiamonds(userWallet);
      setDiamondUserNotFound(false);
    },
    onError: (error: Error) => {
      setSearchedUserForDiamonds(null);
      if (error.message === 'User not found') {
        setDiamondUserNotFound(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to search for user",
          variant: "destructive",
        });
      }
    },
  });

  // Update user diamonds mutation
  const updateUserDiamondsMutation = useMutation({
    mutationFn: async ({ username, amount, operation }: { username: string; amount: number; operation: 'add' | 'subtract' }) => {
      return apiRequest(`/api/verification/user/${encodeURIComponent(username)}/diamonds`, {
        method: 'POST',
        body: { amount, operation },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setSearchedUserForDiamonds(data.userWallet);
      setDiamondAmount(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user diamonds",
        variant: "destructive",
      });
    },
  });

  const handleRoomSeatsSearch = () => {
    if (roomSeatsSearch.trim()) {
      searchRoomForSeatsMutation.mutate(roomSeatsSearch.trim());
    }
  };

  const handleUpdateRoomSeats = () => {
    if (searchedRoomForSeats && newMaxSeats > 0) {
      updateRoomSeatsMutation.mutate({ roomId: searchedRoomForSeats.roomId, maxSeats: newMaxSeats });
    }
  };

  const handleDiamondUserSearch = () => {
    if (diamondUserSearch.trim()) {
      searchUserForDiamondsMutation.mutate(diamondUserSearch.trim());
    }
  };

  const handleUpdateDiamonds = (operation: 'add' | 'subtract') => {
    if (searchedUserForDiamonds && diamondAmount > 0) {
      updateUserDiamondsMutation.mutate({ 
        username: searchedUserForDiamonds.username, 
        amount: diamondAmount, 
        operation 
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Verification Tool</h1>
          </div>
        </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Verified Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.users.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.users.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Verified Rooms</p>
                  <p className="text-2xl font-bold text-foreground">{stats.rooms.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                  <p className="text-2xl font-bold text-foreground">{stats.rooms.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Verification</TabsTrigger>
          <TabsTrigger value="rooms">Room Verification</TabsTrigger>
          <TabsTrigger value="room-seats">Room Seats</TabsTrigger>
          <TabsTrigger value="diamonds">Diamonds</TabsTrigger>
        </TabsList>

        {/* User Verification Tab */}
        <TabsContent value="users">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">User Verification</CardTitle>
              <CardDescription className="text-muted-foreground">
                Search for users by username to manage their verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="user-search" className="text-foreground">Username</Label>
                  <Input
                    id="user-search"
                    placeholder="Enter username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                    className="bg-background border-border"
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
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span>User not found with username: "{userSearch}"</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchedUser && (
                <Card className="border-border bg-card">
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
                          <h3 className="text-lg font-semibold text-foreground">
                            {searchedUser.displayName || searchedUser.username}
                          </h3>
                          {searchedUser.isVerified && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <VerificationIcon className="mr-1" size={12} />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">@{searchedUser.username}</p>
                        
                        {searchedUser.bio && (
                          <p className="text-sm text-muted-foreground mb-3">{searchedUser.bio}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {new Date(searchedUser.createdAt).toLocaleDateString()}</span>
                          </span>
                          {searchedUser.verifiedAt && (
                            <span className="flex items-center space-x-1">
                              <VerificationIcon size={12} />
                              <span>Verified {new Date(searchedUser.verifiedAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-3">
                          {/* Duration Selection for New Verification */}
                          {!searchedUser.isVerified && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Verification Duration</Label>
                              <Select 
                                value={userVerificationDuration} 
                                onValueChange={setUserVerificationDuration}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 Month</SelectItem>
                                  <SelectItem value="2">2 Months</SelectItem>
                                  <SelectItem value="3">3 Months</SelectItem>
                                  <SelectItem value="4">4 Months</SelectItem>
                                  <SelectItem value="5">5 Months</SelectItem>
                                  <SelectItem value="6">6 Months</SelectItem>
                                  <SelectItem value="7">7 Months</SelectItem>
                                  <SelectItem value="8">8 Months</SelectItem>
                                  <SelectItem value="9">9 Months</SelectItem>
                                  <SelectItem value="10">10 Months</SelectItem>
                                  <SelectItem value="11">11 Months</SelectItem>
                                  <SelectItem value="12">12 Months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
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
                                className="bg-primary hover:bg-primary/90"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Verify User ({userVerificationDuration} month{userVerificationDuration !== "1" ? "s" : ""})
                              </Button>
                            )}
                          </div>
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
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Room Verification</CardTitle>
              <CardDescription className="text-muted-foreground">
                Search for rooms by Room ID to manage their verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="room-search" className="text-foreground">Room ID</Label>
                  <Input
                    id="room-search"
                    placeholder="Enter Room ID..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRoomSearch()}
                    className="bg-background border-border"
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
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span>Room not found with ID: "{roomSearch}"</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchedRoom && (
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Home className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{searchedRoom.name}</h3>
                            {searchedRoom.isVerified && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <VerificationIcon className="mr-1" size={12} />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Room ID: {searchedRoom.roomId}</p>
                        </div>
                      </div>
                      
                      {searchedRoom.description && (
                        <p className="text-sm text-muted-foreground">{searchedRoom.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 py-3">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-lg font-semibold text-foreground">{searchedRoom.currentUsers}/{searchedRoom.maxSeats}</p>
                          <p className="text-xs text-muted-foreground">Current Users</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-lg font-semibold capitalize text-foreground">{searchedRoom.type}</p>
                          <p className="text-xs text-muted-foreground">Room Type</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
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
                      <div className="space-y-3 pt-2">
                        {/* Duration Selection for New Verification */}
                        {!searchedRoom.isVerified && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Verification Duration</Label>
                            <Select 
                              value={roomVerificationDuration} 
                              onValueChange={setRoomVerificationDuration}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Month</SelectItem>
                                <SelectItem value="2">2 Months</SelectItem>
                                <SelectItem value="3">3 Months</SelectItem>
                                <SelectItem value="4">4 Months</SelectItem>
                                <SelectItem value="5">5 Months</SelectItem>
                                <SelectItem value="6">6 Months</SelectItem>
                                <SelectItem value="7">7 Months</SelectItem>
                                <SelectItem value="8">8 Months</SelectItem>
                                <SelectItem value="9">9 Months</SelectItem>
                                <SelectItem value="10">10 Months</SelectItem>
                                <SelectItem value="11">11 Months</SelectItem>
                                <SelectItem value="12">12 Months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
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
                              className="bg-primary hover:bg-primary/90"
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Verify Room ({roomVerificationDuration} month{roomVerificationDuration !== "1" ? "s" : ""})
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

        {/* Room Seats Management Tab */}
        <TabsContent value="room-seats">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Room Seats Management</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Search for rooms by Room ID to increase or decrease maximum seats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="room-seats-search" className="text-foreground">Room ID</Label>
                  <Input
                    id="room-seats-search"
                    placeholder="Enter Room ID..."
                    value={roomSeatsSearch}
                    onChange={(e) => setRoomSeatsSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRoomSeatsSearch()}
                    className="bg-background border-border"
                  />
                </div>
                <Button 
                  onClick={handleRoomSeatsSearch} 
                  disabled={searchRoomForSeatsMutation.isPending}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searchRoomForSeatsMutation.isPending ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Results */}
              {roomSeatsNotFound && (
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span>Room not found with ID: "{roomSeatsSearch}"</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchedRoomForSeats && (
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Home className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{searchedRoomForSeats.name}</h3>
                          <p className="text-sm text-muted-foreground">Room ID: {searchedRoomForSeats.roomId}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-3">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-lg font-semibold text-foreground">{searchedRoomForSeats.currentUsers}/{searchedRoomForSeats.maxSeats}</p>
                          <p className="text-xs text-muted-foreground">Current/Max Users</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-lg font-semibold capitalize text-foreground">{searchedRoomForSeats.type}</p>
                          <p className="text-xs text-muted-foreground">Room Type</p>
                        </div>
                      </div>
                      
                      {/* Seats Management */}
                      <div className="space-y-3">
                        <Label className="text-foreground">Update Maximum Seats</Label>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setNewMaxSeats(Math.max(1, newMaxSeats - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={newMaxSeats}
                            onChange={(e) => setNewMaxSeats(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 text-center bg-background border-border"
                            min="1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setNewMaxSeats(newMaxSeats + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={handleUpdateRoomSeats}
                            disabled={updateRoomSeatsMutation.isPending || newMaxSeats === searchedRoomForSeats.maxSeats}
                            className="ml-4"
                          >
                            {updateRoomSeatsMutation.isPending ? 'Updating...' : 'Update Seats'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diamond Management Tab */}
        <TabsContent value="diamonds">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Coins className="w-5 h-5" />
                <span>Diamond Management</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Search for users by username to add or remove diamonds from their account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="diamond-user-search" className="text-foreground">Username</Label>
                  <Input
                    id="diamond-user-search"
                    placeholder="Enter username..."
                    value={diamondUserSearch}
                    onChange={(e) => setDiamondUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDiamondUserSearch()}
                    className="bg-background border-border"
                  />
                </div>
                <Button 
                  onClick={handleDiamondUserSearch} 
                  disabled={searchUserForDiamondsMutation.isPending}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searchUserForDiamondsMutation.isPending ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Results */}
              {diamondUserNotFound && (
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span>User not found with username: "{diamondUserSearch}"</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {searchedUserForDiamonds && (
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {searchedUserForDiamonds.displayName || searchedUserForDiamonds.username}
                          </h3>
                          <p className="text-sm text-muted-foreground">@{searchedUserForDiamonds.username}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-3">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200/20">
                          <p className="text-2xl font-bold text-blue-600">{searchedUserForDiamonds.diamonds}</p>
                          <p className="text-xs text-muted-foreground">Current Diamonds</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-200/20">
                          <p className="text-2xl font-bold text-yellow-600">{searchedUserForDiamonds.coins}</p>
                          <p className="text-xs text-muted-foreground">Current Coins</p>
                        </div>
                      </div>
                      
                      {/* Diamond Management */}
                      <div className="space-y-3">
                        <Label className="text-foreground">Add/Remove Diamonds</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={diamondAmount || ''}
                            onChange={(e) => setDiamondAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="flex-1 bg-background border-border"
                            min="0"
                          />
                          <Button
                            onClick={() => handleUpdateDiamonds('add')}
                            disabled={updateUserDiamondsMutation.isPending || diamondAmount <= 0}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleUpdateDiamonds('subtract')}
                            disabled={updateUserDiamondsMutation.isPending || diamondAmount <= 0 || diamondAmount > searchedUserForDiamonds.diamonds}
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        {diamondAmount > searchedUserForDiamonds.diamonds && (
                          <p className="text-sm text-destructive">Cannot remove more diamonds than user currently has ({searchedUserForDiamonds.diamonds})</p>
                        )}
                      </div>

                      {/* Lifetime Statistics */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Diamonds Earned</p>
                          <p className="text-lg font-semibold text-foreground">{searchedUserForDiamonds.totalDiamondsEarned}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Diamonds Spent</p>
                          <p className="text-lg font-semibold text-foreground">{searchedUserForDiamonds.totalDiamondsSpent}</p>
                        </div>
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
    </div>
  );
}