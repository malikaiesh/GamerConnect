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
  Phone, PhoneOff, Video, VideoOff, MoreVertical, UserPlus, ShieldCheck, Shield
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { VerificationIcon } from "@/components/ui/verification-icon";
import { useAuth } from "@/hooks/use-auth";
import { voiceChatService } from "@/services/voiceChat";
import { formatDistanceToNow } from "date-fns";
import { isVerificationValid } from "@/lib/verification-utils";
import { RoomModerationButton } from "@/components/room-moderation-button";
import { AnimatedRoomBackground } from "@/components/animated-room-background";

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
    verificationExpiresAt?: string;
  };
  owner: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    isVerified: boolean;
    verifiedAt?: string;
    verificationExpiresAt?: string;
  };
  users: RoomUser[];
}

export default function RoomInterfacePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get current user's wallet
  const userWallet = useQuery({ 
    queryKey: ["/api/verification/my-wallet"],
    enabled: !!user?.id
  });

  // Room state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [micUsers, setMicUsers] = useState<{[key: number]: {isSpeaking: boolean, isPlayingMusic: boolean}}>({});
  const [emojiAnimations, setEmojiAnimations] = useState<{[key: number]: {emoji: string, timestamp: number}}>({});

  // Fetch room data
  const { data: roomData, isLoading } = useQuery<RoomData>({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId
  });

  // Fetch chat messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: [`/api/rooms/${roomId}/messages`],
    enabled: !!roomId && !!user,
    refetchInterval: 5000 // Refresh every 5 seconds to reduce rate limiting
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => {
      console.log('Sending message:', message); // Debug log
      return fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message, 
          messageType: message.startsWith('sent ') ? 'emoji' : 'text' 
        })
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      console.log('Message sent successfully:', data); // Debug log
      setNewMessage("");
      // Force immediate refetch instead of just invalidating
      queryClient.refetchQueries({ queryKey: [`/api/rooms/${roomId}/messages`] });
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
        if (response.status === 404) {
          // Auto-join endpoint doesn't exist, skip silently
          return { joined: false, message: "Auto-join not available" };
        }
        throw new Error('Failed to auto-join room');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/messages`] });
    },
    onError: (error) => {
      // Only log non-404 errors to avoid console spam
      if (!error.message.includes('404')) {
        console.error("Auto-join failed:", error);
      }
    },
  });

  // Switch seat mutation
  const switchSeatMutation = useMutation({
    mutationFn: (newSeatNumber: number) =>
      fetch(`/api/rooms/${roomId}/switch-seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatNumber: newSeatNumber })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}`] });
    }
  });

  // Auto-join room on mount
  useEffect(() => {
    if (roomId && user) {
      autoJoinMutation.mutate();
    }
  }, [roomId, user]);

  // Apply Lunexa theme when entering room and cleanup when leaving
  useEffect(() => {
    // Apply lunexa-theme class to document when entering room
    document.documentElement.classList.add('lunexa-theme');
    
    // Cleanup: Remove lunexa-theme class when leaving room
    return () => {
      document.documentElement.classList.remove('lunexa-theme');
    };
  }, []);

  // Initialize voice chat when room data is available
  useEffect(() => {
    const initializeVoiceChat = async () => {
      if (roomId && user && roomData?.room.voiceChatEnabled) {
        try {
          await voiceChatService.joinRoom(roomId, user.id.toString());
          
          // Set up voice chat event handlers
          voiceChatService.onMicrophoneToggle((enabled) => {
            setIsMicOn(enabled);
          });

          voiceChatService.onUserJoinedVoice((userId) => {
            console.log(`User ${userId} joined voice chat`);
          });

          voiceChatService.onUserLeftVoice((userId) => {
            console.log(`User ${userId} left voice chat`);
          });

          console.log('Voice chat initialized successfully');
        } catch (error) {
          console.error('Failed to initialize voice chat:', error);
          toast({
            title: "Voice Chat Error",
            description: error instanceof Error ? error.message : "Could not access microphone",
            variant: "destructive",
          });
        }
      }
    };

    initializeVoiceChat();

    // Cleanup when leaving the room
    return () => {
      voiceChatService.leaveRoom();
    };
  }, [roomId, user, roomData?.room?.voiceChatEnabled]);

  // Leave room mutation
  const leaveRoomMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST'
      }).then(res => res.json()),
    onSuccess: () => {
      // Redirect to admin dashboard if user is admin, otherwise to user dashboard
      if (user?.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  });

  // Toggle mic mutation
  const toggleMicMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/rooms/${roomId}/toggle-mic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()),
    onSuccess: (data) => {
      setIsMicOn(data.isMicOn);
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}`] });
    }
  });

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim() && roomData?.room?.textChatEnabled) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  // Handle send gift
  const handleSendGift = (gift: any) => {
    if (!currentUserInRoom || !roomData?.room?.giftsEnabled) return;
    
    setSelectedGift(gift);
    
    // Send gift as a special message
    const giftMessage = `sent a ${gift.name} ${gift.emoji}`;
    sendMessageMutation.mutate(giftMessage);
    
    // Reset selection after a short delay
    setTimeout(() => setSelectedGift(null), 1000);
  };

  // Handle mic toggle with real voice chat
  const handleMicToggle = async () => {
    try {
      if (roomData?.room.voiceChatEnabled && voiceChatService.hasAudioPermission()) {
        // Use real voice chat service
        const enabled = await voiceChatService.toggleMicrophone();
        setIsMicOn(enabled);
        
        // Also update server state for visual consistency
        toggleMicMutation.mutate();
        
        // Simulate speaking animation when mic is turned on
        if (enabled && currentUserInRoom?.seatNumber) {
          const seatNum = currentUserInRoom.seatNumber;
          setMicUsers(prev => ({
            ...prev,
            [seatNum]: { isSpeaking: true, isPlayingMusic: false }
          }));
          
          // Stop speaking animation after 3 seconds
          setTimeout(() => {
            setMicUsers(prev => ({
              ...prev,
              [seatNum]: { 
                ...prev[seatNum] || {},
                isSpeaking: false 
              }
            }));
          }, 3000);
        }
      } else {
        // Fallback to old behavior if voice chat is not enabled
        toggleMicMutation.mutate();
        
        // Simulate speaking when mic is turned on
        if (!isMicOn && currentUserInRoom?.seatNumber) {
          const seatNum = currentUserInRoom.seatNumber;
          setMicUsers(prev => ({
            ...prev,
            [seatNum]: {
              isSpeaking: true,
              isPlayingMusic: false
            }
          }));
          // Auto turn off speaking after 3 seconds
          setTimeout(() => {
            setMicUsers(prev => ({
              ...prev,
              [seatNum]: {
                ...prev[seatNum] || {},
                isSpeaking: false
              }
            }));
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Failed to toggle microphone",
        variant: "destructive",
      });
    }
  };

  // Handle speaker toggle
  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement actual audio controls
  };
  
  // Handle music toggle
  const handleMusicToggle = () => {
    setIsPlayingMusic(!isPlayingMusic);
    if (currentUserInRoom?.seatNumber) {
      const seatNum = currentUserInRoom.seatNumber;
      setMicUsers(prev => ({
        ...prev,
        [seatNum]: {
          isSpeaking: false,
          isPlayingMusic: !isPlayingMusic
        }
      }));
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string, emojiName: string) => {
    if (!currentUserInRoom?.seatNumber) return;
    
    const seatNum = currentUserInRoom.seatNumber;
    
    // Add emoji animation to the seat
    setEmojiAnimations(prev => ({
      ...prev,
      [seatNum]: {
        emoji,
        timestamp: Date.now()
      }
    }));
    
    // Remove animation after 3 seconds
    setTimeout(() => {
      setEmojiAnimations(prev => {
        const newState = { ...prev };
        delete newState[seatNum];
        return newState;
      });
    }, 3000);
    
    // Send emoji as message with proper format
    const emojiMessage = `${emojiName} ${emoji}`;
    console.log('Sending emoji message:', emojiMessage); // Debug log
    sendMessageMutation.mutate(emojiMessage);
  };

  // Get current user's room status
  const currentUserInRoom = roomData?.users.find(ru => ru.user.id === user?.id);
  const isOwner = roomData?.room.ownerId === user?.id;
  
  // Determine user role for moderation
  const getUserRole = () => {
    if (isOwner) return 'owner';
    if (currentUserInRoom?.role === 'manager') return 'manager';
    if (currentUserInRoom?.role === 'moderator') return 'moderator';
    return 'member';
  };

  // Define different gradient colors for each seat position
  const getSeatGradient = (seatNumber: number) => {
    const gradients = [
      'conic-gradient(from 0deg, #3b82f6 0deg, #8b5cf6 120deg, #10b981 240deg, #3b82f6 360deg)', // blue-purple-green
      'conic-gradient(from 0deg, #8b5cf6 0deg, #ec4899 120deg, #f59e0b 240deg, #8b5cf6 360deg)', // purple-pink-orange
      'conic-gradient(from 0deg, #10b981 0deg, #eab308 120deg, #3b82f6 240deg, #10b981 360deg)', // green-yellow-blue
      'conic-gradient(from 0deg, #eab308 0deg, #f59e0b 120deg, #ef4444 240deg, #eab308 360deg)', // yellow-orange-red
      'conic-gradient(from 0deg, #ef4444 0deg, #ec4899 120deg, #8b5cf6 240deg, #ef4444 360deg)', // red-pink-purple
      'conic-gradient(from 0deg, #6366f1 0deg, #8b5cf6 120deg, #ec4899 240deg, #6366f1 360deg)', // indigo-purple-pink
      'conic-gradient(from 0deg, #14b8a6 0deg, #06b6d4 120deg, #3b82f6 240deg, #14b8a6 360deg)', // teal-cyan-blue
      'conic-gradient(from 0deg, #ec4899 0deg, #d946ef 120deg, #a855f7 240deg, #ec4899 360deg)', // pink-fuchsia-purple
    ];
    
    return gradients[(seatNumber - 1) % gradients.length];
  };

  // Create seat grid with circular mic design
  const renderSeats = () => {
    if (!roomData) return null;

    const seats = Array.from({ length: roomData.room.maxSeats }, (_, index) => {
      const seatNumber = index + 1;
      const seatUser = roomData.users.find(u => u.seatNumber === seatNumber);
      
      return (
        <div key={seatNumber} className="flex flex-col items-center gap-2">
          {/* Animated Gradient Border Wrapper */}
          <div className="relative p-2">
            {/* Rotating gradient background with larger glow */}
            <div 
              className="absolute -inset-2 rounded-full animate-spin-slow pointer-events-none"
              style={{
                background: getSeatGradient(seatNumber),
                filter: 'blur(16px)',
                willChange: 'transform',
              }}
            />
            
            {/* Inner circle with mic */}
            <div
              className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 bg-black ${
                !seatUser && currentUserInRoom ? 'hover:scale-110' : ''
              }`}
              onClick={() => {
                if (!seatUser && !currentUserInRoom) {
                  // Join empty seat
                  joinRoomMutation.mutate(seatNumber);
                } else if (!seatUser && currentUserInRoom) {
                  // Switch to empty seat
                  switchSeatMutation.mutate(seatNumber);
                } else if (seatUser && seatUser.user.id === user?.id) {
                  // Toggle mic for current user
                  handleMicToggle();
                }
              }}
            >
            {seatUser ? (
              <>
                {/* Centered Mic Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ${
                    seatUser.isMicOn ? 'text-green-400' : 'text-gray-400'
                  }`} />
                </div>
                
                {/* Owner Crown */}
                {seatUser.role === 'owner' && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                
                {/* Emoji Animation Overlay */}
                {emojiAnimations[seatNumber] && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
                    <div className="text-3xl bg-white/90 rounded-full p-2 shadow-lg border-2 border-purple-400">
                      {emojiAnimations[seatNumber].emoji}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty Mic Icon */
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
            )}
            </div>
          </div>
          
          {/* User Name or Seat Number */}
          <div className="text-center max-w-20">
            {seatUser ? (
              <div className="space-y-1">
                {/* Username with verification badge */}
                <div className="bg-black/80 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  <span className="text-xs sm:text-sm font-medium text-white truncate max-w-full flex items-center gap-1">
                    {seatUser.user.username}
                    {seatUser.user.isVerified && (
                      <VerificationIcon className="flex-shrink-0 drop-shadow-md" size={16} />
                    )}
                  </span>
                </div>
                
                {/* Diamond balance for current user */}
                {seatUser.user.id === user?.id && userWallet.data?.wallet && (
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                    <span className="text-xs text-white flex items-center gap-1">
                      <Diamond className="w-3 h-3 text-yellow-300" />
                      {userWallet.data.wallet.diamonds}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <span className="text-sm sm:text-base md:text-lg font-bold text-white">
                  {seatNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    });

    // Separate first 2 seats from the rest
    const topSeats = seats.slice(0, 2);
    const bottomSeats = seats.slice(2);

    return (
      <div className="space-y-6">
        {/* Top Row - 2 Mics */}
        <div className="flex justify-center gap-8 sm:gap-12 lg:gap-16">
          {topSeats}
        </div>
        
        {/* Bottom Rows - Remaining Mics */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 justify-items-center max-w-4xl mx-auto">
          {bottomSeats}
        </div>
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

  const getThemeGradient = (theme: string) => {
    // Always return Lunexa theme gradient regardless of the theme parameter
    return 'from-purple-600 via-indigo-600 to-purple-800';
  };

  return (
    <AnimatedRoomBackground>
      <div className="container mx-auto px-4 py-6">
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
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                        {roomData.room.name}
                        {isVerificationValid(roomData.room) && (
                          <VerificationIcon className="flex-shrink-0 drop-shadow-md" size={28} />
                        )}
                      </h1>
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
                      <VerificationIcon size={12} />
                    )}
                  </div>
                </div>
                {currentUserInRoom && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => leaveRoomMutation.mutate()}
                    className="self-start sm:self-auto"
                    disabled={leaveRoomMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {leaveRoomMutation.isPending ? 'Leaving...' : 'Leave Room'}
                    </span>
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
                {/* Room seats grid - Top 2 mics, then rest below */}
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

                      {/* Music Button for Current User */}
                      {currentUserInRoom && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="lg"
                            className={`relative rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0 border-2 transition-all duration-200 shadow-lg hover:scale-105 ${
                              isPlayingMusic 
                                ? 'bg-gradient-to-r from-purple-400 to-pink-500 border-purple-300 text-white shadow-purple-200 hover:shadow-purple-300 animate-pulse' 
                                : 'bg-gradient-to-r from-gray-400 to-slate-500 border-gray-300 text-white shadow-gray-200 hover:shadow-gray-300'
                            }`}
                            onClick={handleMusicToggle}
                            disabled={!roomData.room.voiceChatEnabled}
                          >
                            <span className="text-lg">🎵</span>
                          </Button>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                              {isPlayingMusic ? 'MUSIC' : 'PLAY'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Leave Mic Button */}
                      {currentUserInRoom?.seatNumber && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0 border-2 transition-all duration-200 shadow-lg hover:scale-105 bg-gradient-to-r from-orange-400 to-red-500 border-orange-300 text-white shadow-orange-200 hover:shadow-orange-300"
                            onClick={() => switchSeatMutation.mutate(null)}
                            disabled={switchSeatMutation.isPending}
                          >
                            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                          </Button>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                              LEAVE
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Moderation Button for Moderators/Owners */}
                      {(isOwner || ['manager', 'moderator'].includes(currentUserInRoom?.role || '')) && (
                        <div className="relative">
                          <RoomModerationButton
                            roomId={roomId!}
                            userRole={getUserRole()}
                            className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0 border-2 bg-gradient-to-r from-blue-400 to-cyan-500 border-blue-300 text-white shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 shadow-lg hover:scale-105"
                          />
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                              MOD
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Settings Button for Owner */}
                      {isOwner && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0 border-2 bg-gradient-to-r from-purple-400 to-violet-500 border-purple-300 text-white shadow-purple-200 hover:shadow-purple-300 transition-all duration-200 shadow-lg hover:scale-105"
                            onClick={() => navigate(`/room/${roomId}/settings`)}
                            data-testid="button-room-settings"
                          >
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                          </Button>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-xs font-medium px-2 py-1 bg-black/80 text-white rounded-full">
                              SETTINGS
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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="emojis" className="flex items-center gap-2">
                      <Smile className="w-4 h-4" />
                      Emojis
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
                              onClick={() => setActiveTab("emojis")}
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

                  {/* Emojis Tab */}
                  <TabsContent value="emojis" className="flex-1 flex flex-col mt-0">
                    <div className="flex-1 overflow-y-auto max-h-[250px] sm:max-h-[300px] lg:max-h-[400px] p-4">
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: "Blowkiss", emoji: "😘" },
                          { name: "Kiss (Left)", emoji: "😗" },
                          { name: "Shocked", emoji: "😱" },
                          { name: "Cry", emoji: "😭" },
                          { name: "Like", emoji: "😍" },
                          { name: "Grin", emoji: "😀" },
                          { name: "Lol", emoji: "😂" },
                          { name: "Sleep", emoji: "😴" },
                          { name: "Clap", emoji: "👏" },
                          { name: "Gift Me", emoji: "🎁" },
                          { name: "Thinking", emoji: "🤔" },
                          { name: "Dizzy", emoji: "😵" },
                          { name: "Cool", emoji: "😎" },
                          { name: "Wink", emoji: "😉" },
                          { name: "Angry", emoji: "😠" },
                          { name: "Sad", emoji: "😢" },
                          { name: "Surprised", emoji: "😲" },
                          { name: "Confused", emoji: "😕" },
                          { name: "Happy", emoji: "😊" },
                          { name: "Thumbs Up", emoji: "👍" },
                          { name: "Thumbs Down", emoji: "👎" },
                          { name: "Heart", emoji: "❤️" },
                          { name: "Fire", emoji: "🔥" },
                          { name: "Party", emoji: "🎉" }
                        ].map((reaction) => (
                          <Button
                            key={reaction.name}
                            variant="ghost"
                            className="h-20 flex-col gap-2 p-2 hover:bg-purple-500/20 border border-purple-400/30 rounded-lg transition-all hover:scale-105"
                            disabled={!currentUserInRoom}
                            onClick={() => handleEmojiSelect(reaction.emoji, reaction.name)}
                          >
                            <div className="text-3xl">{reaction.emoji}</div>
                            <div className="text-xs font-medium text-white">{reaction.name}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
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
    </AnimatedRoomBackground>
  );
}