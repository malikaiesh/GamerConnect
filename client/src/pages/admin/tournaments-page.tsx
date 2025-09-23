import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Pencil, Trash2, Filter, Search, ChevronLeft, ChevronRight, Trophy, Users, Gift, BarChart3, Eye, Settings, CalendarDays, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

// Form validation schema
const createTournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  type: z.enum(["gift_sender", "gift_receiver", "room_gifts", "combined"]),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid start date"),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid end date"),
  registrationDeadline: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid registration deadline"),
  maxParticipants: z.number().min(1).max(10000).default(100),
  entryFee: z.number().min(0).default(0),
  minimumGiftValue: z.number().min(1).default(100),
  isPublic: z.boolean().default(true),
  allowRoomGifts: z.boolean().default(true),
  allowDirectGifts: z.boolean().default(false),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine(data => new Date(data.registrationDeadline) <= new Date(data.startDate), {
  message: "Registration deadline must be before or equal to start date",
  path: ["registrationDeadline"]
});

type CreateTournamentForm = z.infer<typeof createTournamentSchema>;

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Create tournament form
  const form = useForm<CreateTournamentForm>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "gift_receiver",
      maxParticipants: 100,
      entryFee: 0,
      minimumGiftValue: 100,
      isPublic: true,
      allowRoomGifts: true,
      allowDirectGifts: false,
      featuredImageUrl: "",
    },
  });

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

  // Create tournament mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateTournamentForm) => {
      return await apiRequest("POST", "/api/admin/tournaments", data);
    },
    onSuccess: () => {
      toast({
        title: "Tournament created",
        description: "The tournament has been created successfully.",
      });
      setCreateDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
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

  const onSubmit = (data: CreateTournamentForm) => {
    createMutation.mutate(data);
  };

  const getTypeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      gift_sender: "Gift Sender Competition",
      gift_receiver: "Gift Receiver Competition", 
      room_gifts: "Room Gift Battle",
      combined: "Combined Tournament"
    };
    return names[type] || type;
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
          <Button onClick={() => setCreateDialogOpen(true)}>
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

        {/* Tournament Winners Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Tournament Winners & Verification Rewards
            </CardTitle>
            <p className="text-sm text-muted-foreground">Recent tournament winners and their verification badge rewards</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Top Winners Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-amber-900">🥇 Latest Winner</h3>
                        <p className="text-sm text-amber-700">Summer Gift Battle 2024</p>
                        <p className="text-xs text-muted-foreground">Ended 2 days ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-900">@PlayerPro</p>
                        <Badge className="bg-blue-500 text-white">
                          ✓ 3mo Verified
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <div className="flex justify-between text-xs text-amber-700">
                        <span>Gifts Received: $1,250</span>
                        <span>Rank: #1 / 150</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">🥈 Runner-up</h3>
                        <p className="text-sm text-gray-700">Gift Sender Championship</p>
                        <p className="text-xs text-muted-foreground">Ended 5 days ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">@GiftMaster</p>
                        <Badge className="bg-blue-500 text-white">
                          ✓ 2mo Verified
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-700">
                        <span>Gifts Sent: $950</span>
                        <span>Rank: #1 / 89</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-orange-900">🥉 Top Performer</h3>
                        <p className="text-sm text-orange-700">Room Battle Royale</p>
                        <p className="text-xs text-muted-foreground">Ended 1 week ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-900">@RoomKing</p>
                        <Badge className="bg-blue-500 text-white">
                          ✓ 1mo Verified
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="flex justify-between text-xs text-orange-700">
                        <span>Room Gifts: $450</span>
                        <span>Rank: #3 / 67</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Rewards Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">23</div>
                    <div className="text-sm text-blue-600">1-Month Badges</div>
                    <div className="text-xs text-muted-foreground">$100+ winners</div>
                  </CardContent>
                </Card>
                <Card className="border-indigo-200 bg-indigo-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-700">12</div>
                    <div className="text-sm text-indigo-600">2-Month Badges</div>
                    <div className="text-xs text-muted-foreground">$200+ winners</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">8</div>
                    <div className="text-sm text-purple-600">3-Month Badges</div>
                    <div className="text-xs text-muted-foreground">$300+ winners</div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-700">3</div>
                    <div className="text-sm text-emerald-600">1-Year Badges</div>
                    <div className="text-xs text-muted-foreground">$1200+ winners</div>
                  </CardContent>
                </Card>
              </div>

              {/* All-Time Leaders */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  All-Time Tournament Leaders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Top Gift Receivers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                          <div>
                            <p className="font-medium">@PlayerPro</p>
                            <p className="text-xs text-muted-foreground">5 tournaments won</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$3,450</p>
                          <Badge className="bg-blue-500 text-white text-xs">Active ✓</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm">2</div>
                          <div>
                            <p className="font-medium">@GiftQueen</p>
                            <p className="text-xs text-muted-foreground">3 tournaments won</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$2,180</p>
                          <Badge className="bg-blue-500 text-white text-xs">Active ✓</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                          <div>
                            <p className="font-medium">@StarPlayer</p>
                            <p className="text-xs text-muted-foreground">2 tournaments won</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$1,890</p>
                          <Badge variant="outline" className="text-xs">Expired</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Top Gift Senders</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                          <div>
                            <p className="font-medium">@GiftMaster</p>
                            <p className="text-xs text-muted-foreground">4 tournaments won</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$2,750</p>
                          <Badge className="bg-blue-500 text-white text-xs">Active ✓</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm">2</div>
                          <div>
                            <p className="font-medium">@GenerousOne</p>
                            <p className="text-xs text-muted-foreground">3 tournaments won</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$1,950</p>
                          <Badge className="bg-blue-500 text-white text-xs">Active ✓</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                          <div>
                            <p className="font-medium">@BigSpender</p>
                            <p className="text-xs text-muted-foreground">2 tournaments won</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$1,420</p>
                          <Badge variant="outline" className="text-xs">Expired</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournaments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tournaments</CardTitle>
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

        {/* Create Tournament Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription>
                Set up a new tournament with custom rules and settings
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tournament Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Summer Gift Battle 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the tournament rules and objectives..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Type *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gift_receiver">Gift Receiver Competition</SelectItem>
                              <SelectItem value="gift_sender">Gift Sender Competition</SelectItem>
                              <SelectItem value="room_gifts">Room Gift Battle</SelectItem>
                              <SelectItem value="combined">Combined Tournament</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Choose how participants compete in this tournament
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Participants *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10000"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date & Time *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Deadline *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Must be before or equal to start date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Fee ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Set to 0 for free tournaments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minimumGiftValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Gift Value ($) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum dollar value for gifts to count
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="featuredImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              placeholder="https://example.com/tournament-banner.jpg"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Optional banner image for the tournament
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tournament Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Public Tournament</FormLabel>
                            <FormDescription className="text-xs">
                              Visible to all users
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowRoomGifts"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Allow Room Gifts</FormLabel>
                            <FormDescription className="text-xs">
                              Enable gifting in rooms
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowDirectGifts"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Allow Direct Gifts</FormLabel>
                            <FormDescription className="text-xs">
                              Enable direct user-to-user gifts
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Tournament"}
                  </Button>
                </div>
              </form>
            </Form>
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