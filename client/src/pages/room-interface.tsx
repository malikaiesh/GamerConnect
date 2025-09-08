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
  Phone, PhoneOff, Video, VideoOff, MoreVertical, UserPlus, ShieldCheck
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
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
    isVerified: boolean;
    verifiedAt?: string;
  };
  owner: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    isVerified: boolean;
    verifiedAt?: string;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);

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

  // Auto-join room when component mounts
  const autoJoinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}/auto-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to auto-join room');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/messages`] });
    },
    onError: (error) => {
      console.error("Auto-join failed:", error);
    },
  });

  // Auto-join room on mount
  useEffect(() => {
    if (roomId && user) {
      autoJoinMutation.mutate();
    }
  }, [roomId, user]);

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
      setShowEmojiPicker(false);
    }
  };

  // Handle send gift
  const handleSendGift = (gift: any) => {
    if (!currentUserInRoom || !roomData?.room.giftsEnabled) return;
    
    setSelectedGift(gift);
    
    // Send gift as a special message
    const giftMessage = `sent a ${gift.name} ${gift.emoji}`;
    sendMessageMutation.mutate(giftMessage);
    
    // Reset selection after a short delay
    setTimeout(() => setSelectedGift(null), 1000);
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
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center cursor-pointer transition-all ${
              seatUser 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => !seatUser && !currentUserInRoom && joinRoomMutation.mutate(seatNumber)}
          >
            <CardContent className="p-2">
              {seatUser ? (
                <div className="text-center">
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1">
                    <AvatarImage src={seatUser.user.profilePicture || undefined} />
                    <AvatarFallback className="text-xs">
                      {seatUser.user.displayName?.[0] || seatUser.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs sm:text-xs md:text-sm font-medium truncate">
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
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-600 mx-auto mb-1 flex items-center justify-center">
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-xs sm:text-xs md:text-sm">Seat {seatNumber}</div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-lg mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Lunexa-style animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Room Header */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {roomData.room.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">{roomData.room.name}</h1>
                      {roomData.room.isVerified && (
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span>ID: {roomData.room.roomId}</span>
                      <Badge variant="outline" className="text-xs">{roomData.room.type}</Badge>
                      <Badge variant={roomData.room.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {roomData.room.status}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium">
                    {roomData.room.currentUsers}/{roomData.room.maxSeats} Users
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Owner: @{roomData.owner.displayName || roomData.owner.username}</span>
                    {roomData.owner.isVerified && (
                      <ShieldCheck className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                </div>
                {currentUserInRoom && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => leaveRoomMutation.mutate()}
                    className="self-start sm:self-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Leave</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4 lg:space-y-6">
          {/* Room Seats - Main Area */}
          <div className="w-full">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    Gaming Arena
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    {/* People Count */}
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{roomData.room.currentUsers}</span>
                    </div>
                    {/* Gift Summary */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-3 py-1 rounded-full border border-yellow-200/20">
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium text-yellow-600">0</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {/* Main Microphone Area */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Main microphone with current speaker */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
                      {currentUserInRoom ? (
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                          <AvatarImage src={currentUserInRoom.user.profilePicture || undefined} />
                          <AvatarFallback className="text-lg font-bold">
                            {currentUserInRoom.user.displayName?.[0] || currentUserInRoom.user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      )}
                      
                      {/* Mic status indicator */}
                      {currentUserInRoom && (
                        <div className="absolute -bottom-2 -right-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${
                            isMicOn ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isMicOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Speaking animation */}
                    {currentUserInRoom && isMicOn && (
                      <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-50"></div>
                    )}
                  </div>
                </div>
                
                {/* Room seats grid */}
                <div className="py-4">
                  {renderSeats()}
                </div>

                {/* Room Controls */}
                {currentUserInRoom && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 flex-wrap">
                      {/* Mic Toggle */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="lg"
                          className={`relative rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0 border-2 transition-all duration-200 shadow-lg hover:scale-105 ${
                            isMicOn 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-white shadow-green-200 hover:shadow-green-300' 
                              : 'bg-gradient-to-r from-red-400 to-rose-500 border-red-300 text-white shadow-red-200 hover:shadow-red-300'
                          }`}
                          onClick={handleMicToggle}
                          disabled={!roomData.room.voiceChatEnabled}
                        >
                          {isMicOn ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </Button>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                            {isMicOn ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>

                      {/* Speaker Toggle */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="lg"
                          className={`relative rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0 border-2 transition-all duration-200 shadow-lg hover:scale-105 ${
                            isSpeakerOn 
                              ? 'bg-gradient-to-r from-blue-400 to-cyan-500 border-blue-300 text-white shadow-blue-200 hover:shadow-blue-300' 
                              : 'bg-gradient-to-r from-gray-400 to-slate-500 border-gray-300 text-white shadow-gray-200 hover:shadow-gray-300'
                          }`}
                          onClick={handleSpeakerToggle}
                          disabled={!roomData.room.voiceChatEnabled}
                        >
                          {isSpeakerOn ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </Button>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                            {isSpeakerOn ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>

                      {/* Settings Button for Owner */}
                      {isOwner && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="relative rounded-full w-16 h-16 p-0 border-2 bg-gradient-to-r from-purple-400 to-violet-500 border-purple-300 text-white shadow-purple-200 hover:shadow-purple-300 transition-all duration-200 shadow-lg hover:scale-105"
                            onClick={() => navigate(`/my-rooms`)}
                          >
                            <Settings className="w-6 h-6" />
                          </Button>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                              ADMIN
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      {!roomData.room.voiceChatEnabled && "Voice chat disabled"}
                    </div>
                  </div>
                )}

                {/* Join Room Button */}
                {!currentUserInRoom && (
                  <div className="mt-6 pt-6 border-t text-center">
                    <Button 
                      onClick={() => joinRoomMutation.mutate(undefined)}
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
          <div className="w-full">
            <Card className="h-[400px] sm:h-[450px] flex flex-col">
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
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[250px] sm:max-h-[300px] lg:max-h-[400px]">
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
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              disabled={sendMessageMutation.isPending}
                              className="pr-12"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <Smile className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            size="icon"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
                            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-full max-h-full overflow-hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 p-0"
                                onClick={() => setShowEmojiPicker(false)}
                              >
                                ×
                              </Button>
                              <div className="emoji-picker-container">
                                <EmojiPicker
                                  onEmojiClick={(emojiData) => {
                                    setNewMessage(prev => prev + emojiData.emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  width={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(320, window.innerWidth - 40) : 320}
                                  height={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(400, window.innerHeight - 120) : 400}
                                />
                              </div>
                            </div>
                          </div>
                        )}
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
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {[
                            { icon: Heart, name: "Heart", price: 10, color: "text-red-500", emoji: "❤️" },
                            { icon: Star, name: "Star", price: 25, color: "text-yellow-500", emoji: "⭐" },
                            { icon: Diamond, name: "Diamond", price: 50, color: "text-blue-500", emoji: "💎" },
                            { icon: Gift, name: "Gift", price: 100, color: "text-purple-500", emoji: "🎁" }
                          ].map((gift) => (
                            <Button
                              key={gift.name}
                              variant={selectedGift?.name === gift.name ? "default" : "outline"}
                              className="h-14 sm:h-16 flex-col gap-1 transition-all hover:scale-105"
                              disabled={!currentUserInRoom}
                              onClick={() => handleSendGift(gift)}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-lg">{gift.emoji}</span>
                                <gift.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${gift.color}`} />
                              </div>
                              <div className="text-xs">
                                <div className="font-medium">{gift.name}</div>
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