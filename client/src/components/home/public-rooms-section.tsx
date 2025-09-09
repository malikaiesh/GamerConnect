import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Crown, Globe, Lock, Eye, Mic, MessageCircle, Gift, Play, CheckCircle, TrendingUp, Flame, Sparkles, Compass } from "lucide-react";
import { VerificationIcon } from "@/components/ui/verification-icon";
import { formatDistanceToNow } from "date-fns";

interface Room {
  room: {
    id: number;
    roomId: string;
    name: string;
    description: string | null;
    type: "public" | "private";
    status: "active" | "inactive" | "maintenance";
    maxSeats: number;
    currentUsers: number;
    category: string;
    country: string | null;
    language: string;
    isLocked: boolean;
    isFeatured: boolean;
    isVerified: boolean;
    voiceChatEnabled: boolean;
    textChatEnabled: boolean;
    giftsEnabled: boolean;
    backgroundTheme: string;
    tags: string[];
    totalVisits: number;
    totalGiftsReceived: number;
    totalGiftValue: number;
    createdAt: string;
    lastActivity: string;
  };
  userCount: number;
  owner: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    isVerified: boolean;
  };
}

interface RoomsResponse {
  rooms: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function PublicRoomsSection() {
  const [activeTab, setActiveTab] = useState("hot");
  
  // Fetch rooms based on active category
  const { data: roomsData, isLoading } = useQuery<RoomsResponse>({
    queryKey: ['/api/rooms', { page: 1, limit: 6, category: activeTab }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "6",
        category: activeTab,
      });
      return fetch(`/api/rooms?${params}`).then(res => res.json());
    }
  });

  const rooms = roomsData?.rooms || [];
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot':
        return <Flame className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'new':
        return <Sparkles className="h-4 w-4" />;
      case 'verified':
        return <VerificationIcon size={16} />;
      case 'explore':
        return <Compass className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border border-primary/20";
      case "inactive":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      case "maintenance":
        return "bg-muted text-muted-foreground border border-border";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'ocean':
        return 'from-primary/80 via-primary to-primary/60';
      case 'sunset':
        return 'from-primary/70 via-accent/80 to-primary/90';
      case 'forest':
        return 'from-primary/60 via-primary/80 to-primary';
      case 'purple':
        return 'from-primary via-primary/80 to-accent/70';
      case 'galaxy':
        return 'from-primary/90 via-accent/60 to-primary/70';
      default:
        return 'from-primary via-primary/80 to-accent/60';
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-md">Popular Rooms</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-20 bg-muted"></div>
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                  <div className="h-10 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!rooms.length) {
    return (
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-md">Popular Rooms</h2>
            <Link href="/rooms" className="text-primary hover:underline flex items-center">
              View All <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No rooms available</h3>
              <p className="text-muted-foreground text-center mb-4">
                Be the first to create a room and start connecting with others!
              </p>
              <Link href="/rooms/create">
                <Button>Create Room</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="heading-md">Popular Rooms</h2>
            <Link href="/rooms">
              <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
                <Eye className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 w-full bg-card/50 border border-border/50 rounded-lg p-1">
              <TabsTrigger 
                value="hot" 
                className="flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-3 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <Flame className="h-4 w-4" />
                Hot
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-3 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <TrendingUp className="h-4 w-4" />
                Trend
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-3 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <Sparkles className="h-4 w-4" />
                New
              </TabsTrigger>
              <TabsTrigger 
                value="verified" 
                className="flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-3 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <VerificationIcon size={16} />
                Verify
              </TabsTrigger>
              <TabsTrigger 
                value="explore" 
                className="flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-3 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <Compass className="h-4 w-4" />
                More
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h2 className="heading-md">Popular Rooms</h2>
          
          {/* Room Category Tabs on the right side */}
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 bg-card/50 border border-border/50 rounded-lg p-1">
                <TabsTrigger 
                  value="hot" 
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                >
                  <Flame className="h-4 w-4" />
                  Hot
                </TabsTrigger>
                <TabsTrigger 
                  value="trending" 
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="new" 
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                >
                  <Sparkles className="h-4 w-4" />
                  New
                </TabsTrigger>
                <TabsTrigger 
                  value="verified" 
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                >
                  <VerificationIcon size={16} />
                  Verified
                </TabsTrigger>
                <TabsTrigger 
                  value="explore" 
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 hover:bg-primary/15 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md"
                >
                  <Compass className="h-4 w-4" />
                  Explore
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Link href="/rooms">
              <Button variant="outline" className="bg-primary/5 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
                <Eye className="h-4 w-4 mr-2" />
                View All
                <i className="ri-arrow-right-line ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.room.id} className="overflow-hidden group hover:shadow-lg transition-all duration-200">
              {/* Room Header with theme background */}
              <div className="relative">
                <div className={`h-20 bg-gradient-to-br ${getThemeGradient(room.room.backgroundTheme)} flex items-center justify-center`}>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  {room.room.isFeatured && (
                    <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <Badge className={`absolute top-2 right-2 ${getStatusColor(room.room.status)}`}>
                  {room.room.status.charAt(0).toUpperCase() + room.room.status.slice(1)}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {room.room.type === 'public' ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    {room.room.name}
                    {room.room.isVerified && (
                      <div className="inline-flex items-center justify-center w-7 h-7 flex-shrink-0 ml-2 relative">
                        <svg className="w-7 h-7 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L13.09 5.26L16 4L15.74 7.26L19 8.35L16.74 10.74L19 12.65L15.74 13.26L16 17L13.09 15.74L12 19L10.91 15.74L8 17L8.26 13.74L5 12.65L8.26 10.26L5 8.35L8.26 7.74L8 4L10.91 5.26L12 2Z" fill="url(#verifyGradient)" stroke="#1565C0" strokeWidth="0.5"/>
                          <path d="M9 11.5L11 13.5L15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="verifyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#1877F2" />
                              <stop offset="100%" stopColor="#166FE5" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20 rounded-full"></div>
                      </div>
                    )}
                  </CardTitle>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  ID: {room.room.roomId}
                </div>
                {room.room.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{room.room.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>by {room.owner.displayName || room.owner.username}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Room Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{room.userCount}/{room.room.maxSeats}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{room.room.totalVisits}</div>
                      <div className="text-xs text-muted-foreground">Visits</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {room.room.voiceChatEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Mic className="w-3 h-3 mr-1" />
                      Voice
                    </Badge>
                  )}
                  {room.room.textChatEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Text
                    </Badge>
                  )}
                  {room.room.giftsEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Gift className="w-3 h-3 mr-1" />
                      Gifts
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {room.room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.room.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {room.room.isVerified && (
                      <Badge className="bg-blue-50 text-blue-600 border border-blue-200 text-xs flex items-center gap-1">
                        <div className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 relative">
                          <svg className="w-6 h-6 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.09 5.26L16 4L15.74 7.26L19 8.35L16.74 10.74L19 12.65L15.74 13.26L16 17L13.09 15.74L12 19L10.91 15.74L8 17L8.26 13.74L5 12.65L8.26 10.26L5 8.35L8.26 7.74L8 4L10.91 5.26L12 2Z" fill="url(#verifyGradientTag)" stroke="#1565C0" strokeWidth="0.5"/>
                            <path d="M9 11.5L11 13.5L15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                              <linearGradient id="verifyGradientTag" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1877F2" />
                                <stop offset="100%" stopColor="#166FE5" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20 rounded-full"></div>
                        </div>
                        Verified
                      </Badge>
                    )}
                    {room.room.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.room.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Activity and Join Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <i className="ri-time-line text-xs"></i>
                    {formatDistanceToNow(new Date(room.room.lastActivity))} ago
                  </div>
                  <Link href={`/room/${room.room.roomId}`}>
                    <Button size="sm" className="text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      Join Room
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
            
        
        {rooms.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/rooms">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary hover:to-accent hover:text-primary-foreground border-primary/30 hover:border-primary transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 px-8 py-3"
              >
                <Eye className="h-5 w-5 mr-2" />
                View All Rooms
                <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1"></i>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}