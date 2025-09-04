import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Lock, Globe, Clock, Search, Plus, CheckCircle, Crown, Eye, Mic, MessageCircle, Gift, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface RoomListing {
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

export default function RoomLobbyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch public rooms
  const { data: roomsData, isLoading } = useQuery<{
    rooms: RoomListing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["/api/rooms", currentPage, searchTerm, categoryFilter, languageFilter, activeTab],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(categoryFilter && categoryFilter !== "all" && { category: categoryFilter }),
        ...(languageFilter && languageFilter !== "all" && { language: languageFilter }),
        category: activeTab === "all" ? "" : activeTab,
      });
      return fetch(`/api/rooms?${params}`).then(res => res.json());
    }
  });

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

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      en: "English",
      es: "Spanish", 
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ar: "Arabic",
      hi: "Hindi",
      ur: "Urdu"
    };
    return languages[code] || code;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-purple-500 blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-primary blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-purple-500/30 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium tracking-wide">
              ROOM LOBBY
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-primary font-extrabold" data-testid="page-title">
              Room Lobby
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed mb-8">
              Discover and join rooms to connect with people around the world
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/my-rooms" className="inline-block">
                <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-purple-500 to-primary hover:from-purple-500/90 hover:to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-my-rooms">
                  <Users className="h-5 w-5 mr-2" />
                  My Rooms
                </Button>
              </Link>
              <Link href="/my-rooms" className="inline-block">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-300" data-testid="button-create-room">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Room
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background flex-grow">
        <div className="container mx-auto px-4">

          {/* Filters */}
          <Card className="mb-6" data-testid="card-filters">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setLanguageFilter("all");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" data-testid="tab-all">All Rooms</TabsTrigger>
              <TabsTrigger value="popular" data-testid="tab-popular">Popular</TabsTrigger>
              <TabsTrigger value="featured" data-testid="tab-featured">Featured</TabsTrigger>
              <TabsTrigger value="recent" data-testid="tab-recent">Recently Active</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading rooms...</div>
                </div>
              ) : !roomsData?.rooms?.length ? (
                <Card data-testid="card-no-rooms">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No rooms found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchTerm || categoryFilter || languageFilter
                        ? "Try adjusting your filters or search terms."
                        : "Be the first to create a room in this category."}
                    </p>
                    <Link href="/my-rooms">
                      <Button data-testid="button-create-first-room">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Room
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Rooms Grid */}
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {roomsData.rooms.map((roomListing) => (
                      <Card key={roomListing.room.id} className="overflow-hidden group hover:shadow-lg transition-all duration-200" data-testid={`card-room-${roomListing.room.id}`}>
                        {/* Room Header with theme background */}
                        <div className="relative">
                          <div className={`h-20 bg-gradient-to-br ${getThemeGradient(roomListing.room.backgroundTheme)} flex items-center justify-center`}>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            {roomListing.room.isFeatured && (
                              <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <Badge className={`absolute top-2 right-2 ${getStatusColor(roomListing.room.status)}`}>
                            {roomListing.room.status.charAt(0).toUpperCase() + roomListing.room.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {roomListing.room.type === 'public' ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                              {roomListing.room.name}
                              {roomListing.room.isVerified && (
                                <div className="inline-flex items-center justify-center w-7 h-7 flex-shrink-0 ml-2 relative">
                                  <svg className="w-7 h-7 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L13.09 5.26L16 4L15.74 7.26L19 8.35L16.74 10.74L19 12.65L15.74 13.26L16 17L13.09 15.74L12 19L10.91 15.74L8 17L8.26 13.74L5 12.65L8.26 10.26L5 8.35L8.26 7.74L8 4L10.91 5.26L12 2Z" fill="url(#verifyGradientLobby)" stroke="#1565C0" strokeWidth="0.5"/>
                                    <path d="M9 11.5L11 13.5L15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <defs>
                                      <linearGradient id="verifyGradientLobby" x1="0%" y1="0%" x2="0%" y2="100%">
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
                            ID: {roomListing.room.roomId}
                          </div>
                          {roomListing.room.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{roomListing.room.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>by {roomListing.owner.displayName || roomListing.owner.username}</span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Room Stats */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <div>
                                <div className="font-medium">{roomListing.userCount}/{roomListing.room.maxSeats}</div>
                                <div className="text-xs text-muted-foreground">Users</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-primary" />
                              <div>
                                <div className="font-medium">{roomListing.room.totalVisits}</div>
                                <div className="text-xs text-muted-foreground">Visits</div>
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1">
                            {roomListing.room.voiceChatEnabled && (
                              <Badge variant="secondary" className="text-xs">
                                <Mic className="w-3 h-3 mr-1" />
                                Voice
                              </Badge>
                            )}
                            {roomListing.room.textChatEnabled && (
                              <Badge variant="secondary" className="text-xs">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Text
                              </Badge>
                            )}
                            {roomListing.room.giftsEnabled && (
                              <Badge variant="secondary" className="text-xs">
                                <Gift className="w-3 h-3 mr-1" />
                                Gifts
                              </Badge>
                            )}
                          </div>

                          {/* Tags */}
                          {roomListing.room.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {roomListing.room.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {roomListing.room.isVerified && (
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
                              {roomListing.room.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{roomListing.room.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Activity and Join Button */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <i className="ri-time-line text-xs"></i>
                              {formatDistanceToNow(new Date(roomListing.room.lastActivity))} ago
                            </div>
                            <Link href={`/room/${roomListing.room.roomId}`}>
                              <Button size="sm" className="text-xs" data-testid={`button-join-${roomListing.room.id}`}>
                                <Play className="h-3 w-3 mr-1" />
                                Join Room
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                  </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {roomsData.pagination && roomsData.pagination.pages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        data-testid="button-prev-page"
                      >
                        Previous
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Page {roomsData.pagination.page} of {roomsData.pagination.pages}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= roomsData.pagination.pages}
                        data-testid="button-next-page"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
}