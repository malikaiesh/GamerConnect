import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Trophy, Users, Gift, Clock, Star, ArrowRight, Filter, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { AppHead } from "@/components/app-head";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  featuredImageUrl?: string;
  totalParticipants: number;
  totalGiftsValue: number;
  totalGiftsCount: number;
}

export default function TournamentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const { data: tournamentsData, isLoading } = useQuery({
    queryKey: ["/api/tournaments", page, search, status, type],
    queryFn: async () => {
      let url = `/api/tournaments?page=${page}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status && status !== "all") url += `&status=${encodeURIComponent(status)}`;
      if (type && type !== "all") url += `&type=${encodeURIComponent(type)}`;
      
      return await apiRequest("GET", url);
    },
  });

  const tournaments = tournamentsData?.tournaments || [];
  const featuredTournaments = tournaments.filter((t: Tournament) => t.status === 'active');
  const upcomingTournaments = tournaments.filter((t: Tournament) => t.status === 'upcoming');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      upcoming: { variant: "outline", text: "Upcoming" },
      active: { variant: "default", text: "Live" },
      completed: { variant: "secondary", text: "Completed" },
    };
    const config = variants[status] || { variant: "outline", text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      gift_battle: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      room_competition: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      user_tournament: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"}`}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const isRegistrationOpen = (tournament: Tournament) => {
    if (tournament.status !== 'upcoming' && tournament.status !== 'active') return false;
    
    const now = new Date();
    const regDeadline = new Date(tournament.registrationDeadline);
    
    return now < regDeadline && tournament.totalParticipants < tournament.maxParticipants;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHead 
        title="Gaming Tournaments" 
        description="Join exciting gaming tournaments and competitions. Battle for prizes and earn verification badges through our gift-based reward system."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden" style={{
          background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 45% 15%) 100%)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        }}>
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/2 right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-6">
                <Trophy className="h-12 w-12 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-lg">TOURNAMENTS</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                <span className="block">Compete for</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                  Victory & Glory
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto">
                Join epic tournaments, send gifts to support your favorites, and earn verification badges based on your generosity. 
                The more you give, the longer your verification lasts!
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-yellow-400 font-bold">$100 = 1 Month</div>
                  <div className="text-white/80 text-sm">Verification Badge</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-yellow-400 font-bold">$1200 = 1 Year</div>
                  <div className="text-white/80 text-sm">Blue Tick Verification</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tournaments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Live Now</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="gift_battle">Gift Battles</SelectItem>
                  <SelectItem value="room_competition">Room Competitions</SelectItem>
                  <SelectItem value="user_tournament">User Tournaments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Featured Tournaments */}
        {featuredTournaments.length > 0 && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-8">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="text-3xl font-bold">Live Tournaments</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTournaments.slice(0, 3).map((tournament: Tournament) => (
                  <Card key={tournament.id} className="relative overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
                    <div className="absolute top-4 right-4 z-10">
                      {getStatusBadge(tournament.status)}
                    </div>
                    
                    {tournament.featuredImageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={tournament.featuredImageUrl} 
                          alt={tournament.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Trophy className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 line-clamp-2">{tournament.name}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeBadge(tournament.type)}
                          </div>
                        </div>
                      </div>
                      {tournament.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tournament.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{tournament.totalParticipants}/{tournament.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Gift className="h-4 w-4 text-muted-foreground" />
                            <span>${tournament.totalGiftsValue.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Starts {format(new Date(tournament.startDate), "MMM dd, yyyy 'at' HH:mm")}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button asChild className="flex-1">
                            <Link href={`/tournaments/${tournament.id}`}>
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Tournaments */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">All Tournaments</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
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
            ) : tournaments.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-8 bg-background rounded-lg inline-block">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Tournaments Found</h3>
                  <p className="text-muted-foreground">
                    {search ? "Try adjusting your search or filters." : "Check back later for exciting tournaments!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tournaments.map((tournament: Tournament) => (
                  <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                    <div className="relative">
                      {tournament.featuredImageUrl ? (
                        <div className="h-32 overflow-hidden rounded-t-lg">
                          <img 
                            src={tournament.featuredImageUrl} 
                            alt={tournament.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-t-lg">
                          <Trophy className="h-8 w-8 text-primary/40" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(tournament.status)}
                      </div>
                      
                      <div className="absolute top-2 left-2">
                        {getTypeBadge(tournament.type)}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{tournament.name}</CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{tournament.totalParticipants}/{tournament.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Gift className="h-3 w-3 text-muted-foreground" />
                            <span>${tournament.totalGiftsValue.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {format(new Date(tournament.startDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                        
                        <Button asChild size="sm" className="w-full mt-3">
                          <Link href={`/tournaments/${tournament.id}`}>
                            {isRegistrationOpen(tournament) ? "Join Tournament" : "View Details"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {tournaments.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!tournamentsData?.pagination?.hasMore}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}