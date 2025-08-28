import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Settings, 
  Users, Crown, LogOut, Send, Smile, Heart, Star, Diamond,
  Phone, PhoneOff, Video, VideoOff, MoreVertical, UserPlus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

interface RoomUser {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
  role: string;
  seatNumber: number | null;
  isMuted: boolean;
  isMicOn: boolean;
  isActive: boolean;
}

interface ChatMessage {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string | null;
  };
  message: string;
  messageType: string;
  createdAt: string;
}

interface RoomData {
  room: {
    id: number;
    roomId: string;
    name: string;
    description: string | null;
    type: string;
    maxSeats: number;
    currentUsers: number;
    voiceChatEnabled: boolean;
    textChatEnabled: boolean;
    giftsEnabled: boolean;
    backgroundTheme: string;
    status: string;
    ownerId: number;
  };
  owner: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
  users: RoomUser[];
}

export default function RoomInterfacePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Room state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  // Fetch room data
  const { data: roomData, isLoading } = useQuery<RoomData>({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId
  });

  // Fetch chat messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: [`/api/rooms/${roomId}/messages`],
    enabled: !!roomId,
    refetchInterval: 2000 // Refresh every 2 seconds for real-time feel
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, messageType: 'text' })
      }).then(res => res.json()),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/messages`] });
    }
  });

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: (seatNumber?: number) =>
      fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatNumber })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}`] });
    }
  });

  // Leave room mutation
  const leaveRoomMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST'
      }).then(res => res.json()),
    onSuccess: () => {
      navigate('/rooms');
    }
  });

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim() && roomData?.room.textChatEnabled) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  // Handle mic toggle
  const handleMicToggle = () => {
    setIsMicOn(!isMicOn);
    // TODO: Implement actual audio controls
  };

  // Handle speaker toggle
  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement actual audio controls
  };

  // Get current user's room status
  const currentUserInRoom = roomData?.users.find(ru => ru.user.id === user?.id);
  const isOwner = roomData?.room.ownerId === user?.id;

  // Create seat grid (2x4 layout for 8 seats)
  const renderSeats = () => {
    if (!roomData) return null;

    const seats = Array.from({ length: roomData.room.maxSeats }, (_, index) => {
      const seatNumber = index + 1;
      const seatUser = roomData.users.find(u => u.seatNumber === seatNumber);
      
      return (
        <div key={seatNumber} className="relative">
          <Card 
            className={`w-24 h-24 flex items-center justify-center cursor-pointer transition-all ${
              seatUser 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => !seatUser && !currentUserInRoom && joinRoomMutation.mutate(seatNumber)}
          >
            <CardContent className="p-2">
              {seatUser ? (
                <div className="text-center">
                  <Avatar className="w-10 h-10 mx-auto mb-1">
                    <AvatarImage src={seatUser.user.profilePicture || undefined} />
                    <AvatarFallback className="text-xs">
                      {seatUser.user.displayName?.[0] || seatUser.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs font-medium truncate">
                    {seatUser.user.displayName || seatUser.user.username}
                  </div>
                  {seatUser.role === 'owner' && (
                    <Crown className="w-3 h-3 text-yellow-500 mx-auto" />
                  )}
                  {seatUser.isMicOn && (
                    <Mic className="w-3 h-3 text-green-500 mx-auto" />
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 mx-auto mb-1 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="text-xs">Seat {seatNumber}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mic indicator */}
          {seatUser && (
            <div className="absolute -top-1 -right-1">
              {seatUser.isMicOn ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-3 h-3 text-white" />
                </div>
              ) : seatUser.isMuted ? (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              ) : null}
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {seats}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Room Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The room you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/rooms')}>
              Browse Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Room Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {roomData.room.name[0]}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{roomData.room.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>ID: {roomData.room.roomId}</span>
                      <Badge variant="outline">{roomData.room.type}</Badge>
                      <Badge variant={roomData.room.status === 'active' ? 'default' : 'secondary'}>
                        {roomData.room.status}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {roomData.room.currentUsers}/{roomData.room.maxSeats} Users
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Owner: @{roomData.owner.displayName || roomData.owner.username}
                  </div>
                </div>
                {currentUserInRoom && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => leaveRoomMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Seats - Main Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Room Seats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8">
                  {renderSeats()}
                </div>

                {/* Room Controls */}
                {currentUserInRoom && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant={isMicOn ? "default" : "outline"}
                        size="lg"
                        className="rounded-full w-12 h-12 p-0"
                        onClick={handleMicToggle}
                        disabled={!roomData.room.voiceChatEnabled}
                      >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant={isSpeakerOn ? "default" : "outline"}
                        size="lg"
                        className="rounded-full w-12 h-12 p-0"
                        onClick={handleSpeakerToggle}
                        disabled={!roomData.room.voiceChatEnabled}
                      >
                        {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </Button>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full w-12 h-12 p-0"
                          onClick={() => navigate(`/my-rooms`)}
                        >
                          <Settings className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      {!roomData.room.voiceChatEnabled && "Voice chat disabled"}
                    </div>
                  </div>
                )}

                {/* Join Room Button */}
                {!currentUserInRoom && (
                  <div className="mt-6 pt-6 border-t text-center">
                    <Button 
                      onClick={() => joinRoomMutation.mutate()}
                      disabled={roomData.room.currentUsers >= roomData.room.maxSeats}
                      size="lg"
                    >
                      {roomData.room.currentUsers >= roomData.room.maxSeats ? 'Room Full' : 'Join Room'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat & Gifts Panel */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="gifts" className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Gifts
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Tabs value={activeTab} className="flex-1 flex flex-col">
                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[400px]">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Be the first to say something!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                                {message.user.displayName?.[0] || message.user.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {message.user.displayName || message.user.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(message.createdAt))} ago
                                </span>
                              </div>
                              <p className="text-sm break-words">{message.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    {currentUserInRoom && roomData.room.textChatEnabled && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={sendMessageMutation.isPending}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {!currentUserInRoom && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Join the room to participate in chat
                      </div>
                    )}

                    {!roomData.room.textChatEnabled && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Text chat is disabled in this room
                      </div>
                    )}
                  </TabsContent>

                  {/* Gifts Tab */}
                  <TabsContent value="gifts" className="flex-1 flex flex-col mt-0">
                    <div className="flex-1">
                      {roomData.room.giftsEnabled ? (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { icon: Heart, name: "Heart", price: 10, color: "text-red-500" },
                            { icon: Star, name: "Star", price: 25, color: "text-yellow-500" },
                            { icon: Diamond, name: "Diamond", price: 50, color: "text-blue-500" },
                            { icon: Gift, name: "Gift", price: 100, color: "text-purple-500" }
                          ].map((gift) => (
                            <Button
                              key={gift.name}
                              variant="outline"
                              className="h-16 flex-col gap-1"
                              disabled={!currentUserInRoom}
                            >
                              <gift.icon className={`w-6 h-6 ${gift.color}`} />
                              <div className="text-xs">
                                <div>{gift.name}</div>
                                <div className="text-muted-foreground">{gift.price} coins</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Gifts are disabled</p>
                          <p className="text-sm">in this room</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}