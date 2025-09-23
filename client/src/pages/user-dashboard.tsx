import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Gamepad2, 
  Users, 
  MessageSquare, 
  Trophy,
  Plus,
  Settings,
  Star,
  Zap,
  Compass,
  TrendingUp,
  Shield,
  Crown,
  Gift
} from "lucide-react";

interface DashboardSection {
  id: string;
  name: string;
  icon: any;
  href?: string;
  component?: React.ComponentType;
}

interface Tournament {
  id: number;
  name: string;
  type: 'gift_receiver' | 'gift_sender' | 'room_gifts' | 'combined';
  status: 'upcoming' | 'active' | 'completed';
  totalParticipants: number;
  totalGiftsValue: number;
  prizePool: string;
  startDate: string;
  endDate?: string;
}

interface Room {
  id: number;
  roomId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  userCount: number;
  maxSeats: number;
  category: string;
  isVerified?: boolean;
  backgroundTheme?: string;
}

// Dashboard sections configuration
const dashboardSections: DashboardSection[] = [
  { id: "rooms", name: "My Rooms", icon: Home },
  { id: "hot-rooms", name: "Hot Rooms", icon: Zap },
  { id: "explore-rooms", name: "Explore Rooms", icon: Compass },
  { id: "trending-rooms", name: "Trending Rooms", icon: TrendingUp },
  { id: "new-rooms", name: "New Rooms", icon: Star },
  { id: "tournaments", name: "Tournaments", icon: Trophy },
  { id: "games", name: "Games", icon: Gamepad2 },
  { id: "friends", name: "Friends", icon: Users },
  { id: "messages", name: "Messages", icon: MessageSquare },
];

// My Rooms Section Component
function MyRoomsSection() {
  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms/my-rooms"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-my-rooms-title">My Rooms</h2>
          <p className="text-muted-foreground">
            Create and manage your rooms, customize settings, and monitor activity
          </p>
        </div>
        <Link href="/my-rooms">
          <Button data-testid="button-create-room">
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </Link>
      </div>

      {!rooms?.length ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Home className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <div className="text-xl font-medium">No rooms yet</div>
                <div className="text-muted-foreground">
                  Create your first room to start building your community
                </div>
              </div>
              <Link href="/my-rooms">
                <Button data-testid="button-get-started-rooms">
                  <Plus className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.slice(0, 6).map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow" data-testid={`room-card-${room.roomId}`}>
              <div 
                className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg relative"
                style={{
                  background: room.backgroundTheme !== 'default' 
                    ? `var(--room-theme-${room.backgroundTheme})` 
                    : undefined
                }}
              >
                {room.isVerified && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-5 h-5 text-yellow-300" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {room.isPrivate && <Shield className="w-4 h-4 text-amber-500" />}
                      {room.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {room.roomId}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {room.description || "Competitive gaming room for tournament players"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span data-testid={`text-user-count-${room.roomId}`}>
                          {room.userCount}/{room.maxSeats}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {room.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/room/${room.roomId}`} className="flex-1">
                      <Button size="sm" className="w-full" data-testid={`button-enter-room-${room.roomId}`}>
                        Enter Room
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" data-testid={`button-settings-${room.roomId}`}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rooms && rooms.length > 6 && (
        <div className="text-center">
          <Link href="/my-rooms">
            <Button variant="outline" data-testid="button-view-all-rooms">
              View All Rooms ({rooms.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Tournaments Section Component
function TournamentsSection() {
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gift_receiver': return <Gift className="w-4 h-4" />;
      case 'gift_sender': return <Gift className="w-4 h-4" />;
      case 'room_gifts': return <Home className="w-4 h-4" />;
      case 'combined': return <Trophy className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-tournaments-title">Tournaments</h2>
          <p className="text-muted-foreground">
            Join tournaments, compete with other players, and win verification badges
          </p>
        </div>
        <Link href="/tournaments">
          <Button data-testid="button-view-all-tournaments">
            View All Tournaments
          </Button>
        </Link>
      </div>

      {!tournaments?.length ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Trophy className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <div className="text-xl font-medium">No tournaments available</div>
                <div className="text-muted-foreground">
                  Check back later for exciting tournaments and competitions
                </div>
              </div>
              <Link href="/tournaments">
                <Button data-testid="button-explore-tournaments">
                  Explore Tournaments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.slice(0, 6).map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow" data-testid={`tournament-card-${tournament.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(tournament.type)}
                      {tournament.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(tournament.status)}`}></div>
                      <span className="text-sm text-muted-foreground capitalize">
                        {tournament.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span data-testid={`text-participants-${tournament.id}`}>
                        {tournament.totalParticipants} participants
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tournament.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prize Pool:</span>
                      <span className="font-medium">{tournament.prizePool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gifts Value:</span>
                      <span className="font-medium">${tournament.totalGiftsValue}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                      <Button size="sm" className="w-full" data-testid={`button-join-tournament-${tournament.id}`}>
                        {tournament.status === 'upcoming' ? 'Join Tournament' : 
                         tournament.status === 'active' ? 'View Tournament' : 'View Results'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tournaments && tournaments.length > 6 && (
        <div className="text-center">
          <Link href="/tournaments">
            <Button variant="outline" data-testid="button-view-all-tournaments-bottom">
              View All Tournaments ({tournaments.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Games Section Component
function GamesSection() {
  const { data: gamesData, isLoading } = useQuery({
    queryKey: ["/api/games/featured"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-300 dark:bg-gray-700"></div>
            <CardHeader>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-games-title">Featured Games</h2>
          <p className="text-muted-foreground">
            Play the most popular games and discover new favorites
          </p>
        </div>
        <Link href="/games">
          <Button data-testid="button-view-all-games">
            View All Games
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gamesData?.slice(0, 8).map((game: any) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow group" data-testid={`game-card-${game.id}`}>
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src={game.thumbnail || '/api/placeholder/300/200'} 
                alt={game.title}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button size="sm" variant="secondary" data-testid={`button-play-${game.id}`}>
                  Play Game
                </Button>
              </div>
            </div>
            <CardHeader className="p-3">
              <CardTitle className="text-sm leading-tight">{game.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Social Section Component
function SocialSection() {
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: friendRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-social-title">Social</h2>
          <p className="text-muted-foreground">
            Connect with friends and manage your social interactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Friends */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-2xl font-bold" data-testid="text-friends-count">
                {friendsLoading ? "..." : friends?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total friends</p>
              <Link href="/friends">
                <Button size="sm" className="w-full" data-testid="button-manage-friends">
                  Manage Friends
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Friend Requests */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Friend Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-2xl font-bold" data-testid="text-friend-requests-count">
                {requestsLoading ? "..." : friendRequests?.incoming?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Pending requests</p>
              <Link href="/friends/requests">
                <Button size="sm" className="w-full" data-testid="button-view-requests">
                  View Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-2xl font-bold" data-testid="text-messages-count">0</p>
              <p className="text-sm text-muted-foreground">Unread messages</p>
              <Link href="/messages">
                <Button size="sm" className="w-full" data-testid="button-view-messages">
                  View Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Find Friends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Friends</CardTitle>
            <p className="text-sm text-muted-foreground">
              Discover and connect with new people
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/find-friends">
              <Button className="w-full" data-testid="button-find-friends">
                Find Friends
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Common social activities
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/friends/requests">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-send-friend-request">
                  Send Friend Request
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-start-conversation">
                  Start Conversation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState("rooms");
  const { user } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "rooms":
        return <MyRoomsSection />;
      case "hot-rooms":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Hot Rooms</h2>
              <p className="text-muted-foreground">Most active and popular rooms right now</p>
            </div>
            <div className="text-center py-8">
              <Link href="/rooms/hot">
                <Button data-testid="button-explore-hot-rooms">Explore Hot Rooms</Button>
              </Link>
            </div>
          </div>
        );
      case "explore-rooms":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Explore Rooms</h2>
              <p className="text-muted-foreground">Discover new rooms and communities</p>
            </div>
            <div className="text-center py-8">
              <Link href="/rooms/explore">
                <Button data-testid="button-explore-rooms">Explore Rooms</Button>
              </Link>
            </div>
          </div>
        );
      case "trending-rooms":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Trending Rooms</h2>
              <p className="text-muted-foreground">Rooms that are gaining popularity</p>
            </div>
            <div className="text-center py-8">
              <Link href="/rooms/trending">
                <Button data-testid="button-explore-trending-rooms">Explore Trending Rooms</Button>
              </Link>
            </div>
          </div>
        );
      case "new-rooms":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">New Rooms</h2>
              <p className="text-muted-foreground">Recently created rooms and fresh communities</p>
            </div>
            <div className="text-center py-8">
              <Link href="/rooms/new">
                <Button data-testid="button-explore-new-rooms">Explore New Rooms</Button>
              </Link>
            </div>
          </div>
        );
      case "tournaments":
        return <TournamentsSection />;
      case "games":
        return <GamesSection />;
      case "friends":
      case "messages":
        return <SocialSection />;
      default:
        return <MyRoomsSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="bg-card text-card-foreground min-h-screen w-64 flex flex-col border-r border-border">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Gaming Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {dashboardSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(section.id)}
                data-testid={`nav-${section.id}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {section.name}
              </Button>
            );
          })}
        </nav>

        {/* Theme & User Section */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Theme switcher placeholder */}
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <span className="text-xs bg-secondary px-2 py-1 rounded">Modern</span>
            </div>
          </div>
          
          <Separator />
          
          {/* User Profile */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm truncate">
                      {user.displayName || user.username}
                    </span>
                    {user.isVerified && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-view-profile">
                  View Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}