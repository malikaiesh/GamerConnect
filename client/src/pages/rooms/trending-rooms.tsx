import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp,
  Volume2,
  MessageCircle,
  Gift,
  ArrowUp
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface TrendingRoom {
  id: number;
  roomId: string;
  name: string;
  description: string;
  theme: string;
  maxUsers: number;
  currentUsers: number;
  isPublic: boolean;
  hasVoice: boolean;
  hasText: boolean;
  hasGifts: boolean;
  trendingScore: number;
  growthRate: string;
  createdAt: string;
  owner: {
    username: string;
    displayName: string;
  };
}

function RoomCard({ room }: { room: TrendingRoom }) {
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
        return 'from-green-500 via-emerald-500 to-teal-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200" data-testid={`room-card-${room.roomId}`}>
      {/* Theme Header */}
      <div className={`h-20 bg-gradient-to-r ${getThemeGradient(room.theme)} relative`}>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-green-500/90 text-white border-0 text-xs">
            <ArrowUp className="w-3 h-3 mr-1" />
            {room.growthRate}
          </Badge>
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            {room.currentUsers}/{room.maxUsers}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              by {room.owner.displayName || room.owner.username}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              #{room.trendingScore}
            </div>
            <div className="text-xs text-gray-500">trending</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {room.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {room.hasVoice && (
            <Badge variant="outline" className="text-xs">
              <Volume2 className="w-3 h-3 mr-1" />
              Voice
            </Badge>
          )}
          {room.hasText && (
            <Badge variant="outline" className="text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Badge>
          )}
          {room.hasGifts && (
            <Badge variant="outline" className="text-xs">
              <Gift className="w-3 h-3 mr-1" />
              Gifts
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/rooms/${room.roomId}`} className="flex-1">
            <Button className="w-full" size="sm" data-testid={`button-enter-room-${room.roomId}`}>
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

export default function TrendingRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["/api/rooms", { category: "trending" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background gradient with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-background to-background/90"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-green-500 blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-emerald-500 blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 border border-green-500/30 rounded-full bg-green-500/10 text-green-600 text-sm font-medium tracking-wide">
              TRENDING ROOMS
            </div>
            <h1 className="heading-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 font-extrabold">
              📈 Trending Rooms
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed">
              Fastest growing and most popular rooms - ride the wave of trending conversations
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
              <p className="text-red-500">Failed to load trending rooms. Please try again.</p>
            </div>
          ) : !rooms?.length ? (
            <div className="text-center py-12">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg inline-block">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">No trending rooms right now.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a popular room to get trending!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms?.map((room: TrendingRoom) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}