import { useQuery } from "@tanstack/react-query";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle,
  Volume2,
  MessageCircle,
  Gift,
  Shield,
  Play
} from "lucide-react";

interface VerifiedRoom {
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
  isVerified: boolean;
  verifiedAt: string;
  createdAt: string;
  owner: {
    username: string;
    displayName: string;
    isVerified: boolean;
  };
  stats: {
    totalVisits: number;
    messagesCount: number;
    giftsReceived: number;
  };
}

function RoomCard({ room }: { room: VerifiedRoom }) {
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

  const handleEnterRoom = (roomId: string) => {
    window.open(`/room/${roomId}`, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-green-200 dark:border-green-800" data-testid={`room-card-${room.roomId}`}>
      {/* Theme Header */}
      <div className={`h-20 bg-gradient-to-r ${getThemeGradient(room.theme)} relative`}>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-green-600/90 text-white border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
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
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {room.name}
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              by {room.owner.displayName || room.owner.username}
              {room.owner.isVerified && (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
            </p>
          </div>
          <Shield className="w-5 h-5 text-green-500" />
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

        {/* Verification Info */}
        <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Verified {new Date(room.verifiedAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700" 
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

export default function AdminVerifiedRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["/api/rooms", { category: "verified" }],
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="page-title">
              <CheckCircle className="h-8 w-8 text-green-500" />
              Verified Rooms
            </h1>
            <p className="text-muted-foreground">
              Official verified rooms that have passed quality standards and security checks
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
                  Failed to load verified rooms. Please try again.
                </div>
              </CardContent>
            </Card>
          ) : !rooms?.length ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Shield className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <div className="text-xl font-medium">No verified rooms yet</div>
                    <div className="text-muted-foreground">
                      No rooms have been verified yet. Verified rooms will appear here after passing quality checks.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms?.map((room: VerifiedRoom) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}