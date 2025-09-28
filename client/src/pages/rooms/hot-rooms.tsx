import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mic, 
  MessageCircle, 
  Gift,
  Zap,
  Crown,
  Volume2,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface HotRoom {
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

function RoomCard({ room }: { room: HotRoom }) {
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
        return 'from-red-500 via-orange-500 to-yellow-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200" data-testid={`room-card-${room.room.roomId}`}>
      {/* Theme Header */}
      <div className={`h-20 bg-gradient-to-r ${getThemeGradient(room.room.backgroundTheme)} relative`}>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            🔥 Hot
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
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
          <Crown className="w-5 h-5 text-yellow-500" />
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

        {/* Statistics */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{room.room.totalVisits} visits</span>
          <span>{room.userCount} users</span>
          <span>{room.room.totalGiftsReceived} gifts</span>
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

export default function HotRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["/api/rooms", { category: "hot" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-red-500 blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-orange-500 blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-red-500/30 rounded-full bg-red-500/10 text-red-600 text-sm font-medium tracking-wide">
              HOT ROOMS
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-extrabold">
              🔥 Hot Rooms
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed">
              Most active and popular rooms right now - join the hottest conversations
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
              <p className="text-red-500">Failed to load hot rooms. Please try again.</p>
            </div>
          ) : !rooms?.rooms?.length ? (
            <div className="text-center py-12">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg inline-block">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">No hot rooms right now.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Be the first to create one!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms?.rooms?.map((room: HotRoom) => (
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