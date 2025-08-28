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
  Volume2
} from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";

interface HotRoom {
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
  createdAt: string;
  owner: {
    username: string;
    displayName: string;
  };
  stats: {
    totalVisits: number;
    messagesCount: number;
    giftsReceived: number;
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
      default:
        return 'from-red-500 via-orange-500 to-yellow-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200" data-testid={`room-card-${room.roomId}`}>
      {/* Theme Header */}
      <div className={`h-20 bg-gradient-to-r ${getThemeGradient(room.theme)} relative`}>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            🔥 Hot
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
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
          <Crown className="w-5 h-5 text-yellow-500" />
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

        {/* Statistics */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{room.stats.totalVisits} visits</span>
          <span>{room.stats.messagesCount} messages</span>
          <span>{room.stats.giftsReceived} gifts</span>
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

export default function HotRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["/api/rooms", { category: "hot" }],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Hot Rooms</h1>
              <p className="text-gray-500 dark:text-gray-400">Most active and popular rooms right now</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
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
          ) : !rooms?.length ? (
            <div className="text-center py-12">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg inline-block">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">No hot rooms right now.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Be the first to create one!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms?.map((room: HotRoom) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}