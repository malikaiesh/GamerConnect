import { useQuery } from "@tanstack/react-query";
import AdminNavigation from "@/components/admin/navigation";
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
  Play
} from "lucide-react";

interface NewRoom {
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

  const handleEnterRoom = (roomId: string) => {
    window.open(`/room/${roomId}`, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200" data-testid={`room-card-${room.roomId}`}>
      {/* Theme Header */}
      <div className={`h-20 bg-gradient-to-r ${getThemeGradient(room.theme)} relative`}>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/20 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            New
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-yellow-500/90 text-white border-0 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo(room.createdAt)}
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
          <Button 
            className="flex-1" 
            size="sm" 
            onClick={() => handleEnterRoom(room.roomId)}
            data-testid={`button-enter-room-${room.roomId}`}
          >
            <Play className="w-4 h-4 mr-1" />
            Enter Room
          </Button>
          <Button variant="outline" size="sm">
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminNewRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["/api/rooms", { category: "new" }],
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="page-title">
              ⭐ New Rooms
            </h1>
            <p className="text-muted-foreground">
              Recently created rooms and fresh communities - monitor new room activity
            </p>
          </div>

          {/* Rooms Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-red-500">
                  Failed to load new rooms. Please try again.
                </div>
              </CardContent>
            </Card>
          ) : !rooms?.length ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Star className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <div className="text-xl font-medium">No new rooms recently</div>
                    <div className="text-muted-foreground">
                      No rooms have been created recently. New rooms will appear here when users create them.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms?.map((room: NewRoom) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}