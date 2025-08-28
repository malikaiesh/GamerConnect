import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Lock, Globe, Clock, Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

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
    tags: string[];
    totalVisits: number;
    createdAt: string;
    lastActivity: string;
  };
  owner: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
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
    queryKey: ["/api/rooms/public", currentPage, searchTerm, categoryFilter, languageFilter, activeTab],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        category: categoryFilter,
        language: languageFilter,
        filter: activeTab,
      });
      return fetch(`/api/rooms/public?${params}`).then(res => res.json());
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" data-testid="page-title">Room Lobby</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Discover and join rooms to connect with people around the world
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/my-rooms" className="inline-block">
            <Button data-testid="button-my-rooms">
              <Users className="h-4 w-4 mr-2" />
              My Rooms
            </Button>
          </Link>
          <Link href="/my-rooms" className="inline-block">
            <Button variant="outline" data-testid="button-create-room">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </Link>
        </div>
      </div>

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
                  <SelectItem value="">All Categories</SelectItem>
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
                  <SelectItem value="">All Languages</SelectItem>
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
                  setCategoryFilter("");
                  setLanguageFilter("");
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roomsData.rooms.map((roomListing) => (
                  <Card key={roomListing.room.id} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-room-${roomListing.room.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 text-lg truncate">
                            {roomListing.room.type === 'public' ? 
                              <Globe className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                              <Lock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            }
                            <span className="truncate">{roomListing.room.name}</span>
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            by @{roomListing.owner.displayName || roomListing.owner.username}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end flex-shrink-0">
                          <Badge className={getStatusColor(roomListing.room.status)}>
                            {roomListing.room.status}
                          </Badge>
                          {roomListing.room.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {roomListing.room.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {roomListing.room.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{roomListing.room.currentUsers}/{roomListing.room.maxSeats}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDistanceToNow(new Date(roomListing.room.lastActivity))} ago</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className="text-xs">
                            {roomListing.room.category}
                          </Badge>
                          <span className="text-muted-foreground">
                            {getLanguageName(roomListing.room.language)}
                          </span>
                        </div>

                        {roomListing.room.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {roomListing.room.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {roomListing.room.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{roomListing.room.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="pt-2">
                          <Button 
                            className="w-full" 
                            disabled={roomListing.room.currentUsers >= roomListing.room.maxSeats || roomListing.room.status !== 'active'}
                            data-testid={`button-join-${roomListing.room.id}`}
                          >
                            {roomListing.room.currentUsers >= roomListing.room.maxSeats ? (
                              "Room Full"
                            ) : roomListing.room.status !== 'active' ? (
                              "Unavailable"
                            ) : roomListing.room.isLocked ? (
                              "Join with Password"
                            ) : (
                              "Join Room"
                            )}
                          </Button>
                        </div>
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
  );
}