import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { 
  Trophy, Users, Gift, Clock, Star, ArrowLeft, Calendar, DollarSign, 
  Target, Award, Crown, Medal, Zap, CheckCircle, XCircle, AlertCircle 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AppHead } from "@/components/app-head";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
} from "@/components/ui/alert-dialog";

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
  isUserRegistered?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  totalGiftsReceived: number;
  totalGiftValueReceived: number;
  hasEarnedVerificationBadge: boolean;
  verificationMonths?: number;
}

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [confirmJoinOpen, setConfirmJoinOpen] = useState(false);

  const { data: tournament, isLoading, error } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${id}`],
    enabled: !!id
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/tournaments/${id}/leaderboard`],
    enabled: !!id && tournament?.status !== 'upcoming'
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/tournaments/${id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${id}`] });
      toast({
        title: "Successfully Joined!",
        description: `You are now registered for ${tournament?.name}`,
      });
      setConfirmJoinOpen(false);
      setJoinDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join",
        description: error.message || "Failed to join tournament",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHead />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-background">
        <AppHead />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tournament Not Found</h1>
            <p className="text-muted-foreground mb-6">The tournament you're looking for doesn't exist or has been removed.</p>
            <Link href="/tournaments">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tournaments
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, text: string }> = {
      upcoming: { variant: "outline", icon: Clock, text: "Upcoming" },
      active: { variant: "default", icon: Zap, text: "Live" },
      completed: { variant: "secondary", icon: CheckCircle, text: "Completed" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Cancelled" },
    };
    const config = variants[status] || { variant: "outline", icon: AlertCircle, text: status };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      gift_battle: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      room_competition: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      user_tournament: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"}`}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const isRegistrationOpen = () => {
    if (tournament.status !== 'upcoming' && tournament.status !== 'active') return false;
    
    const now = new Date();
    const regDeadline = new Date(tournament.registrationDeadline);
    
    return now < regDeadline && tournament.totalParticipants < tournament.maxParticipants;
  };

  const getTimeUntilStart = () => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    
    const days = differenceInDays(start, now);
    const hours = differenceInHours(start, now) % 24;
    const minutes = differenceInMinutes(start, now) % 60;
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  const handleJoinClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to join tournaments",
        variant: "destructive",
      });
      return;
    }
    
    if (tournament.entryFee > 0) {
      setJoinDialogOpen(true);
    } else {
      setConfirmJoinOpen(true);
    }
  };

  const confirmJoin = () => {
    joinMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHead 
        title={tournament.name} 
        description={tournament.description || `Join the ${tournament.name} tournament and compete for glory!`}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          {tournament.featuredImageUrl ? (
            <div className="absolute inset-0">
              <img 
                src={tournament.featuredImageUrl} 
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
          )}
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <Link href="/tournaments">
                  <Button variant="outline" size="sm" className="bg-background/80 hover:bg-background">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tournaments
                  </Button>
                </Link>
              </div>
              
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {getTypeBadge(tournament.type)}
                      {getStatusBadge(tournament.status)}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{tournament.name}</h1>
                    
                    {tournament.description && (
                      <p className="text-lg text-muted-foreground mb-6">{tournament.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{tournament.totalParticipants}</div>
                        <div className="text-sm text-muted-foreground">Participants</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">${tournament.totalGiftsValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Gifts</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{tournament.totalGiftsCount}</div>
                        <div className="text-sm text-muted-foreground">Gifts Sent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">${tournament.minimumGiftValue}</div>
                        <div className="text-sm text-muted-foreground">Min Gift</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-80">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center">Tournament Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Start Date</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(tournament.startDate), "MMM dd, yyyy 'at' HH:mm")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div className="text-sm text-muted-foreground">
                              Until {format(new Date(tournament.endDate), "MMM dd, yyyy")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Capacity</div>
                            <div className="text-sm text-muted-foreground">
                              {tournament.totalParticipants} / {tournament.maxParticipants} players
                            </div>
                          </div>
                        </div>
                        
                        {tournament.entryFee > 0 && (
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Entry Fee</div>
                              <div className="text-sm text-muted-foreground">
                                ${tournament.entryFee}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {tournament.status === 'upcoming' && (
                          <div className="text-center p-3 bg-primary/10 rounded-lg">
                            <div className="font-medium">Starts in</div>
                            <div className="text-2xl font-bold text-primary">{getTimeUntilStart()}</div>
                          </div>
                        )}
                        
                        {isRegistrationOpen() && !tournament.isUserRegistered ? (
                          <Button 
                            onClick={handleJoinClick}
                            className="w-full" 
                            size="lg"
                            disabled={joinMutation.isPending}
                          >
                            {joinMutation.isPending ? "Joining..." : "Join Tournament"}
                          </Button>
                        ) : tournament.isUserRegistered ? (
                          <Button variant="outline" className="w-full" size="lg" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Already Registered
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" size="lg" disabled>
                            Registration Closed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                  <TabsTrigger value="rewards">Rewards</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-semibold mb-2">1. Join</h3>
                          <p className="text-sm text-muted-foreground">Register for the tournament before the deadline</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-semibold mb-2">2. Give Gifts</h3>
                          <p className="text-sm text-muted-foreground">Send gifts to other participants to show support</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-semibold mb-2">3. Win Rewards</h3>
                          <p className="text-sm text-muted-foreground">Earn verification badges based on gifts received</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tournament Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Minimum gift value: ${tournament.minimumGiftValue}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Winners are determined by total gift value received</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Verification badges awarded: $100 = 1 month, $200 = 2 months, $1200 = 1 year</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Registration closes on {format(new Date(tournament.registrationDeadline), "MMM dd, yyyy 'at' HH:mm")}</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="leaderboard" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Rankings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tournament.status === 'upcoming' ? (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Leaderboard will be available once the tournament starts</p>
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No participants yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {leaderboard.map((entry, index) => (
                            <div 
                              key={entry.userId} 
                              className={`flex items-center gap-4 p-3 rounded-lg ${
                                index < 3 ? 'bg-muted/50' : 'bg-background'
                              }`}
                            >
                              <div className="flex items-center justify-center w-8">
                                {getRankIcon(entry.rank)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium">{entry.username}</div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.totalGiftsReceived} gifts received
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-green-600">
                                  ${entry.totalGiftValueReceived.toLocaleString()}
                                </div>
                                {entry.hasEarnedVerificationBadge && (
                                  <Badge variant="default" className="mt-1">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="rewards" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Badge Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-2">$100</div>
                          <div className="font-semibold mb-2">1 Month Badge</div>
                          <p className="text-sm text-muted-foreground">Basic verification for 30 days</p>
                        </div>
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">$200</div>
                          <div className="font-semibold mb-2">2 Month Badge</div>
                          <p className="text-sm text-muted-foreground">Extended verification for 60 days</p>
                        </div>
                        <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                          <div className="text-3xl font-bold text-purple-600 mb-2">$1200</div>
                          <div className="font-semibold mb-2 flex items-center justify-center gap-1">
                            <Crown className="h-4 w-4" />
                            1 Year Blue Tick
                          </div>
                          <p className="text-sm text-muted-foreground">Premium verification for 365 days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      
      {/* Join Confirmation Dialog */}
      <AlertDialog open={confirmJoinOpen} onOpenChange={setConfirmJoinOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Join Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to join "{tournament.name}"? 
              {tournament.entryFee > 0 && ` There is an entry fee of $${tournament.entryFee}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmJoin} disabled={joinMutation.isPending}>
              {joinMutation.isPending ? "Joining..." : "Join Tournament"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
}