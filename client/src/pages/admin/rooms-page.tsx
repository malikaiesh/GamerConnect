import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Lock, Globe, Clock, Settings, Trash2, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import AdminNavigation from "@/components/admin/navigation";

interface Room {
  room: {
    id: number;
    roomId: string;
    name: string;
    description: string | null;
    type: "public" | "private";
    status: "active" | "inactive" | "maintenance";
    maxSeats: number;
    currentUsers: number;
    category: string;
    country: string | null;
    language: string;
    isLocked: boolean;
    isFeatured: boolean;
    totalVisits: number;
    totalGiftsReceived: number;
    totalGiftValue: number;
    createdAt: string;
    lastActivity: string;
  };
  owner: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
}

interface RoomStats {
  totalRooms: number;
  activeRooms: number;
  publicRooms: number;
  privateRooms: number;
  verifiedRooms: number;
  newRooms: number;
  recentRooms: Array<{
    room: {
      id: number;
      roomId: string;
      name: string;
      createdAt: string;
    };
    owner: {
      username: string;
      displayName: string | null;
    };
  }>;
}

export default function RoomsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [newRoomsFilter, setNewRoomsFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch room statistics
  const { data: stats } = useQuery<RoomStats>({
    queryKey: ["/api/rooms/stats/overview"],
  });

  // Fetch rooms with filters
  const { data: roomsData, isLoading } = useQuery<{
    rooms: Room[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["/api/rooms/admin", currentPage, searchTerm, statusFilter, typeFilter, verifiedFilter, newRoomsFilter],
    queryFn: () => {
      const status = statusFilter === "all" ? "" : statusFilter;
      const type = typeFilter === "all" ? "" : typeFilter;
      const verified = verifiedFilter === "all" ? "" : (verifiedFilter === "verified" ? "true" : "false");
      const newRooms = newRoomsFilter === "all" ? "" : (newRoomsFilter === "new" ? "true" : "false");
      return apiRequest(`/api/rooms/admin?page=${currentPage}&search=${searchTerm}&status=${status}&type=${type}&verified=${verified}&newRooms=${newRooms}`);
    }
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => apiRequest(`/api/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update room status mutation
  const updateRoomMutation = useMutation({
    mutationFn: ({ roomId, updates }: { roomId: string; updates: any }) => 
      apiRequest(`/api/rooms/${roomId}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
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
          <div className="text-center">Loading...</div>
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
        <h1 className="text-3xl font-bold" data-testid="page-title">Room Management</h1>
        <p className="text-muted-foreground">
          Manage and monitor all user rooms, view statistics, and moderate content.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card data-testid="card-total-rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-rooms">{stats.totalRooms}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-rooms">{stats.activeRooms}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-public-rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Rooms</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-public-rooms">{stats.publicRooms}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-private-rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private Rooms</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-private-rooms">{stats.privateRooms}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-verified-rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Rooms</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-verified-rooms">{stats.verifiedRooms}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-new-rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Created Rooms</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-new-rooms">{stats.newRooms}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Filters */}
      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle>Filter Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
              data-testid="input-search"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-verified">
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRoomsFilter} onValueChange={setNewRoomsFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-new-rooms">
                <SelectValue placeholder="Filter by creation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="new">New Rooms (24h)</SelectItem>
                <SelectItem value="older">Older Rooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card data-testid="card-rooms-table">
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading rooms...</div>
            </div>
          ) : !roomsData?.rooms?.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No rooms found</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomsData.rooms.map((room) => (
                    <TableRow key={room.room.id} data-testid={`row-room-${room.room.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {room.room.name}
                            {room.room.isFeatured && (
                              <Badge variant="secondary" data-testid={`badge-featured-${room.room.id}`}>
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {room.room.roomId} • {room.room.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {room.owner.displayName || room.owner.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{room.owner.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.room.type === 'public' ? 'default' : 'secondary'}>
                          {room.room.type === 'public' ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                          {room.room.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(room.room.status)}>
                          {room.room.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {room.room.currentUsers}/{room.room.maxSeats}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDistanceToNow(new Date(room.room.lastActivity))} ago
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(room.room.roomId, room.room.status)}
                            disabled={updateRoomMutation.isPending}
                            data-testid={`button-toggle-status-${room.room.id}`}
                          >
                            {room.room.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(room.room.roomId, room.room.isFeatured)}
                            disabled={updateRoomMutation.isPending}
                            data-testid={`button-toggle-featured-${room.room.id}`}
                          >
                            {room.room.isFeatured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-delete-${room.room.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Room</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{room.room.name}"? This action cannot be undone.
                                  All room data, messages, and user connections will be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRoom(room.room.roomId)}
                                  className="bg-red-600 hover:bg-red-700"
                                  data-testid={`button-confirm-delete-${room.room.id}`}
                                >
                                  Delete Room
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

              {/* Pagination */}
              {roomsData.pagination && roomsData.pagination.pages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(roomsData.pagination.page - 1) * roomsData.pagination.limit + 1} to{" "}
                    {Math.min(roomsData.pagination.page * roomsData.pagination.limit, roomsData.pagination.total)} of{" "}
                    {roomsData.pagination.total} rooms
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {roomsData.pagination.page} of {roomsData.pagination.pages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= roomsData.pagination.pages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recently Created Rooms - Moved to bottom */}
      {stats?.recentRooms && stats.recentRooms.length > 0 && (
        <Card data-testid="card-recent-rooms">
          <CardHeader>
            <CardTitle>Recently Created Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentRooms.map((room) => (
                <div key={room.room.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium" data-testid={`text-room-name-${room.room.id}`}>
                      {room.room.name} <span className="text-muted-foreground">({room.room.roomId})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      by {room.owner.displayName || room.owner.username} • {formatDistanceToNow(new Date(room.room.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

        </div>
      </div>
    </div>
  );
}