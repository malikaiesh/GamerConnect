import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Users, Globe, Lock, Trash2, Settings2, Calendar, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function OwnRoomsPage() {
  const { toast } = useToast();

  // Fetch own rooms data
  const { data: ownRoomsData, isLoading, error } = useQuery({
    queryKey: ["/api/rooms/my-rooms"],
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => apiRequest(`/api/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/my-rooms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteRoom = (roomId: string) => {
    deleteRoomMutation.mutate(roomId);
  };

  const handleEnterRoom = (roomId: string) => {
    window.open(`/room/${roomId}`, '_blank');
  };

  const handleManageRoom = (roomId: string) => {
    // Navigate to room management/settings page
    window.location.href = `/room/${roomId}/settings`;
  };

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6 lg:p-10">
          <div className="text-center">Loading your rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="page-title">
              <User className="h-8 w-8" />
              My Rooms
            </h1>
            <p className="text-muted-foreground">
              Create and manage your rooms, customize settings, and monitor activity.
            </p>
          </div>

          {/* Create Room Button */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => window.location.href = '/admin/create-rooms'}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-create-room"
            >
              <Play className="h-4 w-4 mr-2" />
              Create Room
            </Button>
            {ownRoomsData && (
              <Badge variant="secondary" className="text-sm">
                {ownRoomsData.length} room{ownRoomsData.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Rooms Display */}
          {error ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-red-500">
                  Error: {(error as Error).message}
                </div>
              </CardContent>
            </Card>
          ) : !ownRoomsData?.length ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <User className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <div className="text-xl font-medium">No rooms created yet</div>
                    <div className="text-muted-foreground">
                      You haven't created any rooms yet. Create your first room to get started.
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/admin/create-rooms'}
                    className="mt-4"
                    data-testid="button-create-first-room"
                  >
                    Create Your First Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownRoomsData.map((roomData: any) => (
                <Card key={roomData.room.id} className="relative group hover:shadow-lg transition-shadow">
                  {/* Room Type Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    {roomData.room.type === 'private' ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Room Header with Gradient */}
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
                    <div className="absolute bottom-2 left-4 text-white">
                      <div className="text-sm opacity-90">ACTIVE</div>
                      {roomData.room.isFeatured && (
                        <Badge variant="secondary" className="absolute -top-1 -right-20 bg-white/20 text-white border-white/30">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-4 text-white text-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl">👑</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Room Title and ID */}
                    <div className="space-y-2 mb-4">
                      <h3 className="font-semibold text-lg truncate">{roomData.room.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        ID: {roomData.room.roomId}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {roomData.room.description || roomData.room.category}
                      </div>
                    </div>

                    {/* Room Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="text-muted-foreground">Users</div>
                          <div className="font-medium">{roomData.userCount || 0}/{roomData.room.maxSeats}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="text-muted-foreground">Visits</div>
                          <div className="font-medium">{roomData.room.totalVisits || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <Badge className={getStatusColor(roomData.room.status)}>
                        {roomData.room.status}
                      </Badge>
                    </div>

                    {/* Features Tags */}
                    <div className="flex flex-wrap gap-1 mb-4 text-xs">
                      {roomData.room.voiceChatEnabled && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Voice</span>
                      )}
                      {roomData.room.textChatEnabled && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Text</span>
                      )}
                      {roomData.room.giftsEnabled && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Gifts</span>
                      )}
                    </div>

                    {/* Last Activity */}
                    <div className="text-xs text-muted-foreground mb-4">
                      Active {formatDistanceToNow(new Date(roomData.room.createdAt), { addSuffix: true })}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleEnterRoom(roomData.room.roomId)}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        data-testid={`button-enter-${roomData.room.id}`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Enter Room
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageRoom(roomData.room.roomId)}
                          className="flex-1"
                          data-testid={`button-manage-${roomData.room.id}`}
                        >
                          <Settings2 className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive border-destructive hover:bg-destructive/10"
                              data-testid={`button-delete-${roomData.room.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Room</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{roomData.room.name}"? This action can be reversed from the Deleted Rooms section.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRoom(roomData.room.roomId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}