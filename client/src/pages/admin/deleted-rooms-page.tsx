import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Archive, Users, Globe, Lock, RotateCcw, Trash2, Calendar, User, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function DeletedRoomsPage() {
  const { toast } = useToast();
  const [searchRoomId, setSearchRoomId] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  // Fetch deleted rooms data
  const { data: deletedRoomsData, isLoading, error } = useQuery({
    queryKey: ["/api/rooms/deleted"],
  });

  // Recovery mutation
  const recoveryMutation = useMutation({
    mutationFn: (roomId: string) => apiRequest(`/api/rooms/${roomId}/recover`, { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room recovered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/deleted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
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

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: (roomId: string) => apiRequest(`/api/rooms/${roomId}/permanent-delete`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room permanently deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/deleted"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRecoverRoom = (roomId: string) => {
    recoveryMutation.mutate(roomId);
  };

  const handlePermanentDelete = (roomId: string) => {
    permanentDeleteMutation.mutate(roomId);
  };

  const handleSearchChange = (value: string) => {
    setSearchRoomId(value);
    if (!deletedRoomsData) return;

    if (!value.trim()) {
      setFilteredRooms(deletedRoomsData);
    } else {
      const filtered = deletedRoomsData.filter((roomData: any) => 
        roomData.room.roomId.toLowerCase().includes(value.toLowerCase()) ||
        roomData.room.name.toLowerCase().includes(value.toLowerCase()) ||
        roomData.owner?.username.toLowerCase().includes(value.toLowerCase()) ||
        roomData.owner?.id.toString().includes(value)
      );
      setFilteredRooms(filtered);
    }
  };

  // Initialize filtered rooms when data loads
  useEffect(() => {
    if (deletedRoomsData) {
      setFilteredRooms(deletedRoomsData);
    }
  }, [deletedRoomsData]);

  const getTimeSinceDeleted = (deletedAt: string) => {
    return formatDistanceToNow(new Date(deletedAt), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6 lg:p-10">
          <div className="text-center">Loading deleted rooms...</div>
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
              <Archive className="h-8 w-8" />
              Deleted Rooms Recovery
            </h1>
            <p className="text-muted-foreground">
              Recover deleted user rooms by their ID. Restore rooms that were accidentally deleted or need to be brought back.
            </p>
          </div>

          {/* Search Section */}
          <Card data-testid="card-search">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Deleted Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="room-search" className="block text-sm font-medium mb-2">
                    Search by Room ID, Room Name, or Owner Username/ID
                  </label>
                  <Input
                    id="room-search"
                    placeholder="Enter room ID (e.g., ABC123456), room name, or owner username..."
                    value={searchRoomId}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="max-w-md"
                    data-testid="input-search-room"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredRooms?.length || 0} room{(filteredRooms?.length || 0) !== 1 ? 's' : ''} found
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-red-500">
                  Error: {(error as Error).message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deleted Rooms Table */}
          <Card data-testid="card-deleted-rooms-table">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Deleted Rooms
                {deletedRoomsData && (
                  <Badge variant="destructive" className="ml-2">
                    {deletedRoomsData.length} deleted room{deletedRoomsData.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading deleted rooms...</div>
                </div>
              ) : !filteredRooms?.length ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Archive className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <div className="text-lg font-medium">
                      {searchRoomId ? 'No matching deleted rooms found' : 'No deleted rooms found'}
                    </div>
                    <div className="text-muted-foreground">
                      {searchRoomId 
                        ? 'Try searching with a different room ID, name, or owner username.'
                        : 'No rooms have been deleted yet, or all deleted rooms have been recovered.'
                      }
                    </div>
                  </div>
                  {searchRoomId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchRoomId("");
                        handleSearchChange("");
                      }}
                      data-testid="button-clear-search"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Details</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Deleted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRooms.map((roomData) => (
                        <TableRow key={roomData.room.id} data-testid={`row-deleted-room-${roomData.room.id}`}>
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
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{roomData.owner?.displayName || roomData.owner?.username}</div>
                                <div className="text-sm text-muted-foreground">ID: {roomData.owner?.id}</div>
                              </div>
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
                            <div className="text-sm flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {getTimeSinceDeleted(roomData.room.deletedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRecoverRoom(roomData.room.roomId)}
                                disabled={recoveryMutation.isPending}
                                data-testid={`button-recover-${roomData.room.id}`}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Recover
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    data-testid={`button-permanent-delete-${roomData.room.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Permanently Delete Room</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to permanently delete "{roomData.room.name}"? This action cannot be undone and all room data will be lost forever.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handlePermanentDelete(roomData.room.roomId)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Permanently Delete
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