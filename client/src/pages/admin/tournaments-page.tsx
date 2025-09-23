import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Filter, Search, ChevronLeft, ChevronRight, Trophy, Users, Gift, BarChart3, Eye, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tournament {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  entryFee: number;
  minimumGiftValue: number;
  isPublic: boolean;
  totalParticipants: number;
  totalGiftsValue: number;
  totalGiftsCount: number;
  createdAt: string;
}

interface TournamentParticipant {
  id: number;
  userId: number;
  username: string;
  email: string;
  status: string;
  giftsReceived: number;
  giftsSent: number;
  totalGiftValueReceived: number;
  totalGiftValueSent: number;
  currentRank?: number;
  registeredAt: string;
}

interface TournamentStats {
  tournament: Tournament;
  participantStats: {
    totalParticipants: number;
    activeParticipants: number;
    completedParticipants: number;
  };
  giftStats: {
    totalGifts: number;
    totalValue: number;
    totalCoins: number;
  };
  badgeStats: {
    totalBadgesAwarded: number;
    totalMonthsAwarded: number;
  };
  topPerformers: Array<{
    userId: number;
    username: string;
    totalValueReceived: number;
    currentRank: number;
    hasEarnedVerificationBadge: boolean;
  }>;
}

export default function TournamentsAdminPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Query for tournaments list
  const { data: tournamentsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/tournaments", page, limit, search, status, type],
    queryFn: async () => {
      let url = `/api/admin/tournaments?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status && status !== "all") url += `&status=${encodeURIComponent(status)}`;
      if (type && type !== "all") url += `&type=${encodeURIComponent(type)}`;
      
      return await apiRequest("GET", url);
    },
  });

  // Query for tournament participants
  const { data: participants } = useQuery({
    queryKey: ["/api/admin/tournaments", selectedTournamentId, "participants"],
    queryFn: async () => {
      if (!selectedTournamentId) return [];
      return await apiRequest("GET", `/api/admin/tournaments/${selectedTournamentId}/participants`);
    },
    enabled: !!selectedTournamentId && participantsDialogOpen,
  });

  // Query for tournament stats
  const { data: tournamentStats } = useQuery({
    queryKey: ["/api/admin/tournaments", selectedTournamentId, "stats"],
    queryFn: async () => {
      if (!selectedTournamentId) return null;
      return await apiRequest("GET", `/api/admin/tournaments/${selectedTournamentId}/stats`);
    },
    enabled: !!selectedTournamentId && statsDialogOpen,
  });

  // Delete tournament mutation
  const deleteMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      return await apiRequest("DELETE", `/api/admin/tournaments/${tournamentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tournament deleted",
        description: "The tournament has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setSelectedTournament(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tournament",
        variant: "destructive",
      });
    },
  });

  // Update tournament status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ tournamentId, newStatus }: { tournamentId: number; newStatus: string }) => {
      return await apiRequest("PATCH", `/api/admin/tournaments/${tournamentId}/status`, { status: newStatus });
    },
    onSuccess: () => {
      toast({
        title: "Tournament status updated",
        description: "The tournament status has been updated successfully.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tournament status",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDeleteDialogOpen(true);
  };

  const handleViewParticipants = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setSelectedTournamentId(tournament.id);
    setParticipantsDialogOpen(true);
  };

  const handleViewStats = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setSelectedTournamentId(tournament.id);
    setStatsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTournament) {
      deleteMutation.mutate(selectedTournament.id);
    }
  };

  const handleStatusChange = (tournamentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ tournamentId, newStatus });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "outline",
      active: "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      gift_battle: "bg-purple-100 text-purple-800",
      room_competition: "bg-blue-100 text-blue-800",
      user_tournament: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[type] || "bg-gray-100 text-gray-800"}`}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tournament Management</h1>
            <p className="text-muted-foreground">Manage tournaments, participants, and view competition statistics</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tournament
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tournaments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="gift_battle">Gift Battle</SelectItem>
                  <SelectItem value="room_competition">Room Competition</SelectItem>
                  <SelectItem value="user_tournament">User Tournament</SelectItem>
                </SelectContent>
              </Select>
              <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tournaments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Gifts Value</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading tournaments...
                    </TableCell>
                  </TableRow>
                ) : tournamentsData?.tournaments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No tournaments found
                    </TableCell>
                  </TableRow>
                ) : (
                  tournamentsData?.tournaments?.map((tournament: Tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tournament.name}</div>
                          {tournament.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {tournament.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(tournament.type)}</TableCell>
                      <TableCell>
                        <Select
                          value={tournament.status}
                          onValueChange={(value) => handleStatusChange(tournament.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>{getStatusBadge(tournament.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {tournament.totalParticipants} / {tournament.maxParticipants}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          ${tournament.totalGiftsValue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tournament.totalGiftsCount} gifts
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(tournament.startDate), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewParticipants(tournament)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStats(tournament)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tournament)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {tournamentsData?.pagination && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, tournamentsData.pagination.total)} of {tournamentsData.pagination.total} tournaments
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => p + 1)}
                        className={!tournamentsData.pagination.hasMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants Dialog */}
        <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tournament Participants - {selectedTournament?.name}</DialogTitle>
              <DialogDescription>
                View and manage participants for this tournament
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Gifts Received</TableHead>
                    <TableHead>Gift Value</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No participants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    participants?.map((participant: TournamentParticipant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.username}</TableCell>
                        <TableCell>
                          <Badge variant={participant.status === "active" ? "default" : "secondary"}>
                            {participant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {participant.currentRank ? `#${participant.currentRank}` : "—"}
                        </TableCell>
                        <TableCell>{participant.giftsReceived}</TableCell>
                        <TableCell>${participant.totalGiftValueReceived.toLocaleString()}</TableCell>
                        <TableCell>
                          {format(new Date(participant.registeredAt), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Dialog */}
        <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tournament Statistics - {selectedTournament?.name}</DialogTitle>
              <DialogDescription>
                Detailed analytics and performance metrics
              </DialogDescription>
            </DialogHeader>
            {tournamentStats && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
                  <TabsTrigger value="winners">Top Performers</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Participants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{tournamentStats.participantStats.totalParticipants}</div>
                        <div className="text-xs text-muted-foreground">
                          {tournamentStats.participantStats.activeParticipants} active
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Gifts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{tournamentStats.giftStats.totalGifts}</div>
                        <div className="text-xs text-muted-foreground">
                          ${tournamentStats.giftStats.totalValue?.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Badges Awarded</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{tournamentStats.badgeStats.totalBadgesAwarded}</div>
                        <div className="text-xs text-muted-foreground">
                          {tournamentStats.badgeStats.totalMonthsAwarded} months total
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="winners" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Value Received</TableHead>
                            <TableHead>Verification Badge</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tournamentStats.topPerformers?.map((performer, index) => (
                            <TableRow key={performer.userId}>
                              <TableCell>#{performer.currentRank || index + 1}</TableCell>
                              <TableCell className="font-medium">{performer.username}</TableCell>
                              <TableCell>${performer.totalValueReceived.toLocaleString()}</TableCell>
                              <TableCell>
                                {performer.hasEarnedVerificationBadge ? (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Earned
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTournament?.name}"? This action cannot be undone and will remove all tournament data, participants, and statistics.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Tournament"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}