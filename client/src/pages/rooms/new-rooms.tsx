import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Star,
  Volume2,
  MessageCircle,
  Gift,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface NewRoom {
  room: {
    id: number;
    roomId: string;
    name: string;
    description: string;
    backgroundTheme: string;
    maxSeats: number;
    currentUsers: number;
    type: string;
    voiceChatEnabled: boolean;
    textChatEnabled: boolean;
    giftsEnabled: boolean;
    createdAt: string;
    totalVisits: number;
    totalGiftsReceived: number;
    isVerified: boolean;
  };
  userCount: string;
  owner: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string | null;
    isVerified: boolean;
  };
}

function RoomCard({ room }: { room: NewRoom }) {
  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'ocean':
        return 'from-blue-500 via-blue-600 to-cyan-600';
      case 'sunset':
        return 'from-orange-500 via-red-500 to-pink-600';
      case 'forest':
        return 'from-green-500 via-green-600 to-emerald-600';
      case 'purple':
        return 'from-purple-500 via-indigo-500 to-blue-600';
      case 'galaxy':
        return 'from-indigo-600 via-purple-600 to-pink-600';
      case 'lunexa':
        return 'from-purple-600 via-indigo-600 to-purple-800';
      default:
        return 'from-yellow-500 via-orange-500 to-red-500';
    }
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200" data-testid={`room-card-${room.room.roomId}`}>
      {/* Theme Header */}
      <div className={`h-20 bg-gradient-to-r ${getThemeGradient(room.room.backgroundTheme)} relative`}>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            New
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-yellow-500/90 text-white border-0 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo(room.room.createdAt)}
          </Badge>
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            {room.userCount}/{room.room.maxSeats}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">{room.room.name}</CardTitle>
              {room.room.isVerified && (
                <CheckCircle className="w-5 h-5 text-blue-400" data-testid="room-verification-badge" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                by {room.owner.displayName || room.owner.username}
              </p>
              {room.owner.isVerified && (
                <CheckCircle className="w-3 h-3 text-blue-400" data-testid="owner-verification-badge" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {room.room.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {room.room.voiceChatEnabled && (
            <Badge variant="outline" className="text-xs">
              <Volume2 className="w-3 h-3 mr-1" />
              Voice
            </Badge>
          )}
          {room.room.textChatEnabled && (
            <Badge variant="outline" className="text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Badge>
          )}
          {room.room.giftsEnabled && (
            <Badge variant="outline" className="text-xs">
              <Gift className="w-3 h-3 mr-1" />
              Gifts
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/rooms/${room.room.roomId}`} className="flex-1">
            <Button className="w-full" size="sm" data-testid={`button-enter-room-${room.room.roomId}`}>
              Enter Room
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["/api/rooms", { category: "new" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-yellow-500 blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-orange-500 blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-yellow-500/30 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium tracking-wide">
              NEW ROOMS
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 font-extrabold">
              ⭐ New Rooms
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed">
              Recently created rooms and fresh communities - be among the first to explore
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background flex-grow">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-300 dark:bg-gray-700"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load new rooms. Please try again.</p>
            </div>
          ) : !rooms?.rooms?.length ? (
            <div className="text-center py-12">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg inline-block">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">No new rooms right now.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Be the first to create a fresh community!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms?.rooms?.map((room: NewRoom) => (
                <RoomCard key={room.room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}