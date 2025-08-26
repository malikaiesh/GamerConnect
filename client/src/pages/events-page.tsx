import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Calendar, MapPin, Users, Clock, ExternalLink, Trophy, Heart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Event } from "@shared/schema";

const registrationSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().optional(),
  notes: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'published': return 'default';
    case 'ongoing': return 'secondary';
    case 'completed': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
}

function getEventTypeBadgeVariant(eventType: string) {
  switch (eventType) {
    case 'tournament': return 'default';
    case 'game_release': return 'secondary';
    case 'community': return 'outline';
    case 'streaming': return 'default';
    case 'competition': return 'secondary';
    default: return 'outline';
  }
}

function EventRegistrationModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      notes: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormValues) => {
      return apiRequest(`/api/events/${event.id}/register`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Registration Successful!",
        description: `You have successfully registered for ${event.title}`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Register for: {event.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(event.startDate)} • {event.locationType}
          </p>
        </div>

        <FormField
          control={form.control}
          name="guestName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your full name" 
                  {...field}
                  data-testid="input-registration-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guestEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter your email address" 
                  {...field}
                  data-testid="input-registration-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guestPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="tel"
                  placeholder="Enter your phone number" 
                  {...field}
                  data-testid="input-registration-phone"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requirements or comments..." 
                  {...field}
                  data-testid="textarea-registration-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-registration"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={registerMutation.isPending}
            data-testid="button-submit-registration"
          >
            {registerMutation.isPending ? "Registering..." : "Register for Event"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { user } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events/public"],
    queryFn: () => apiRequest("/api/events/public"),
  });

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setIsRegistrationOpen(true);
  };

  const isRegistrationAvailable = (event: Event) => {
    if (!event.registrationEnabled) return false;
    if (event.status !== 'published') return false;
    
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : eventStart;
    
    return now < regEnd && (!event.maxParticipants || event.currentParticipants < event.maxParticipants);
  };

  const isEventFull = (event: Event) => {
    return event.maxParticipants && event.currentParticipants >= event.maxParticipants;
  };

  const featuredEvents = events.filter((event: Event) => event.featured);
  const upcomingEvents = events.filter((event: Event) => !event.featured && event.status === 'published');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden" style={{
          background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 45% 15%) 100%)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        }}>
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/2 right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Gaming Events</span> 
                & Tournaments
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-3xl mx-auto">
                Join exciting gaming tournaments, community events, and exclusive releases. Connect with fellow gamers and compete for amazing prizes!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="#featured" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                  data-testid="button-view-featured"
                >
                  View Featured Events
                </a>
                <a 
                  href="#upcoming" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                  data-testid="button-browse-all"
                >
                  Browse All Events
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <section id="featured" className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Featured Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map((event: Event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow relative overflow-hidden">
                    {event.bannerImage && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={event.bannerImage} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                          data-testid={`featured-event-image-${event.id}`}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(event.status)} data-testid={`featured-event-status-${event.id}`}>
                            {event.status}
                          </Badge>
                          <Badge variant={getEventTypeBadgeVariant(event.eventType)} data-testid={`featured-event-type-${event.id}`}>
                            {event.eventType.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl" data-testid={`featured-event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span data-testid={`featured-event-date-${event.id}`}>
                            {formatDate(event.startDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span data-testid={`featured-event-location-${event.id}`}>
                            {event.locationType === 'online' ? 'Online Event' : 
                             event.locationName || 'Physical Location'}
                          </span>
                        </div>

                        {event.registrationEnabled && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span data-testid={`featured-event-participants-${event.id}`}>
                              {event.currentParticipants}
                              {event.maxParticipants ? `/${event.maxParticipants}` : ''} participants
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`featured-event-description-${event.id}`}>
                        {event.description}
                      </p>

                      <div className="flex gap-2">
                        <Link href={`/events/${event.slug}`} className="flex-1">
                          <Button variant="outline" className="w-full" data-testid={`featured-event-view-${event.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {isRegistrationAvailable(event) && (
                          <Button 
                            onClick={() => handleRegisterClick(event)}
                            className="flex-1"
                            data-testid={`featured-event-register-${event.id}`}
                          >
                            Register Now
                          </Button>
                        )}
                        {isEventFull(event) && (
                          <Button variant="secondary" disabled className="flex-1">
                            Event Full
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Events Section */}
        <section id="upcoming" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">All Events</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events available</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back soon for exciting gaming events and tournaments.
                  </p>
                  <Link href="/games">
                    <Button>Explore Games</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event: Event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(event.status)} data-testid={`event-status-${event.id}`}>
                            {event.status}
                          </Badge>
                          <Badge variant={getEventTypeBadgeVariant(event.eventType)} data-testid={`event-type-${event.id}`}>
                            {event.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg" data-testid={`event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span data-testid={`event-date-${event.id}`}>
                            {formatDate(event.startDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span data-testid={`event-location-${event.id}`}>
                            {event.locationType === 'online' ? 'Online Event' : 
                             event.locationName || 'Physical Location'}
                          </span>
                        </div>

                        {event.registrationEnabled && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span data-testid={`event-participants-${event.id}`}>
                              {event.currentParticipants}
                              {event.maxParticipants ? `/${event.maxParticipants}` : ''} participants
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`event-description-${event.id}`}>
                        {event.description}
                      </p>

                      <div className="flex gap-2">
                        <Link href={`/events/${event.slug}`} className="flex-1">
                          <Button variant="outline" className="w-full" data-testid={`event-view-${event.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {isRegistrationAvailable(event) && (
                          <Button 
                            onClick={() => handleRegisterClick(event)}
                            className="flex-1"
                            data-testid={`event-register-${event.id}`}
                          >
                            Register
                          </Button>
                        )}
                        {isEventFull(event) && (
                          <Button variant="secondary" disabled className="flex-1">
                            Full
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Registration Modal */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Registration</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for this event.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventRegistrationModal 
              event={selectedEvent} 
              onClose={() => setIsRegistrationOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}