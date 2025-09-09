import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminNavigation } from "@/components/admin/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Users, Globe, Lock, Trash2, Settings, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function OwnRoomsPage() {
  const { toast } = useToast();

  // Fetch own rooms data
  const { data: ownRoomsData, isLoading } = useQuery({
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

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: ({ roomId, updates }: { roomId: string; updates: any }) => 
      apiRequest(`/api/rooms/${roomId}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room updated successfully",
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

  const handleToggleStatus = (roomId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateRoomMutation.mutate({ roomId, updates: { status: newStatus } });
  };

  const handleToggleFeatured = (roomId: string, isFeatured: boolean) => {
    updateRoomMutation.mutate({ roomId, updates: { isFeatured: !isFeatured } });
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
              Own Rooms
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all rooms you've created. Create, edit, and moderate your own content.
            </p>
          </div>

          {/* Own Rooms Table */}
          <Card data-testid="card-own-rooms-table">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Created Rooms
                {ownRoomsData && (
                  <Badge variant="secondary" className="ml-2">
                    {ownRoomsData.length} room{ownRoomsData.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading your rooms...</div>
                </div>
              ) : !ownRoomsData?.length ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <User className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <div className="text-lg font-medium">No rooms created yet</div>
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
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ownRoomsData.map((roomData) => (
                        <TableRow key={roomData.room.id} data-testid={`row-own-room-${roomData.room.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {roomData.room.name}
                                {roomData.room.isFeatured && (
                                  <Badge variant="secondary" data-testid={`badge-featured-${roomData.room.id}`}>
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {roomData.room.roomId} • {roomData.room.category}
                              </div>
                              {roomData.room.description && (
                                <div className="text-sm text-muted-foreground mt-1 max-w-md truncate">
                                  {roomData.room.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {roomData.room.type === 'private' ? (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="capitalize">{roomData.room.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(roomData.room.status)}
                              data-testid={`badge-status-${roomData.room.id}`}
                            >
                              {roomData.room.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{roomData.userCount || 0}/{roomData.room.maxSeats}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDistanceToNow(new Date(roomData.room.createdAt), { addSuffix: true })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(roomData.room.roomId, roomData.room.status)}
                                disabled={updateRoomMutation.isPending}
                                data-testid={`button-toggle-status-${roomData.room.id}`}
                              >
                                {roomData.room.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFeatured(roomData.room.roomId, roomData.room.isFeatured)}
                                disabled={updateRoomMutation.isPending}
                                data-testid={`button-toggle-featured-${roomData.room.id}`}
                              >
                                {roomData.room.isFeatured ? 'Unfeature' : 'Feature'}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}