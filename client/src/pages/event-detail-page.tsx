import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, Users, Trophy, DollarSign, Info, UserPlus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AppHead } from "@/components/app-head";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate?: string;
  timezone: string;
  locationType: string;
  locationName?: string;
  locationAddress?: string;
  onlineUrl?: string;
  registrationEnabled: boolean;
  registrationStartDate?: string;
  registrationEndDate?: string;
  maxParticipants?: number;
  currentParticipants: number;
  registrationFee?: number;
  bannerImage?: string;
  rules?: string;
  prizes?: string;
  requirements?: string;
  contactInfo?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const registrationSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z.string().optional(),
  notes: z.string().optional()
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
  switch (status.toLowerCase()) {
    case 'published':
      return 'default';
    case 'ongoing':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    case 'draft':
      return 'outline';
    default:
      return 'default';
  }
}

function getEventTypeBadgeVariant(eventType: string) {
  switch (eventType.toLowerCase()) {
    case 'tournament':
      return 'default';
    case 'community':
      return 'secondary';
    case 'streaming':
      return 'outline';
    case 'meetup':
      return 'secondary';
    case 'competition':
      return 'default';
    default:
      return 'outline';
  }
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/public/${slug}`],
    enabled: !!slug
  });

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      notes: ""
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormValues) => {
      return apiRequest(`/api/events/${event?.id}/register`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/public/${slug}`] });
      toast({
        title: "Registration Successful!",
        description: `You have successfully registered for ${event?.title}`,
      });
      setShowRegistrationDialog(false);
      form.reset();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHead />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <AppHead />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = event.registrationEnabled && 
    (!event.registrationEndDate || new Date() < new Date(event.registrationEndDate)) &&
    (!event.maxParticipants || event.currentParticipants < event.maxParticipants);

  const registrationSpacesLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null;

  return (
    <div className="min-h-screen bg-background">
      <AppHead 
        title={event.metaTitle || `${event.title} | Events`}
        description={event.metaDescription || event.description}
      />
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="mb-4" data-testid="back-to-events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Event Header */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Image */}
            {event.bannerImage && (
              <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden">
                <img 
                  src={event.bannerImage} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                  data-testid="event-banner"
                />
              </div>
            )}

            {/* Event Title and Meta */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={getStatusBadgeVariant(event.status)} data-testid="event-status">
                  {event.status}
                </Badge>
                <Badge variant={getEventTypeBadgeVariant(event.eventType)} data-testid="event-type">
                  {event.eventType}
                </Badge>
                {event.featured && (
                  <Badge variant="secondary" data-testid="featured-badge">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="event-title">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="event-date">{formatDate(event.startDate)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="event-location">
                    {event.locationType === 'online' ? 'Online Event' : 
                     event.locationType === 'physical' ? (event.locationName || 'Physical Location') :
                     'Hybrid Event'}
                  </span>
                </div>

                {event.registrationEnabled && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span data-testid="participant-count">
                      {event.currentParticipants} / {event.maxParticipants || '∞'} participants
                    </span>
                  </div>
                )}

                {event.registrationFee && event.registrationFee > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span data-testid="registration-fee">${event.registrationFee}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Event Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground dark:prose-headings:text-white dark:prose-p:text-white"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                  data-testid="event-description"
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(event.rules || event.prizes || event.requirements) && (
              <div className="grid md:grid-cols-3 gap-6">
                {event.rules && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 dark:prose-headings:text-white dark:prose-p:text-gray-100"
                        dangerouslySetInnerHTML={{ __html: event.rules }}
                        data-testid="event-rules"
                      />
                    </CardContent>
                  </Card>
                )}

                {event.prizes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Prizes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 dark:prose-headings:text-white dark:prose-p:text-gray-100"
                        dangerouslySetInnerHTML={{ __html: event.prizes }}
                        data-testid="event-prizes"
                      />
                    </CardContent>
                  </Card>
                )}

                {event.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 dark:prose-headings:text-white dark:prose-p:text-gray-100"
                        dangerouslySetInnerHTML={{ __html: event.requirements }}
                        data-testid="event-requirements"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Registration Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Registration
                </CardTitle>
                <CardDescription>
                  {isRegistrationOpen ? 
                    "Join this exciting event" : 
                    "Registration is currently closed"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.registrationEnabled ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participants:</span>
                        <span className="font-medium">
                          {event.currentParticipants} / {event.maxParticipants || '∞'}
                        </span>
                      </div>
                      
                      {registrationSpacesLeft !== null && (
                        <div className="flex justify-between text-sm">
                          <span>Spaces left:</span>
                          <span className="font-medium text-primary">
                            {registrationSpacesLeft}
                          </span>
                        </div>
                      )}

                      {event.registrationFee && event.registrationFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Registration fee:</span>
                          <span className="font-medium">${event.registrationFee}</span>
                        </div>
                      )}

                      {event.registrationEndDate && (
                        <div className="flex justify-between text-sm">
                          <span>Registration ends:</span>
                          <span className="font-medium">
                            {formatDate(event.registrationEndDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {isRegistrationOpen ? (
                      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full" data-testid="register-button">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Register for {event.title}</DialogTitle>
                            <DialogDescription>
                              Fill out the form below to register for this event.
                            </DialogDescription>
                          </DialogHeader>

                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                        data-testid="input-name"
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
                                        data-testid="input-email"
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
                                        data-testid="input-phone"
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
                                        placeholder="Any additional information or questions..." 
                                        {...field}
                                        data-testid="input-notes"
                                        rows={3}
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
                                  onClick={() => setShowRegistrationDialog(false)}
                                  data-testid="cancel-registration"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={registerMutation.isPending}
                                  data-testid="submit-registration"
                                >
                                  {registerMutation.isPending ? "Registering..." : "Register"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="text-center">
                        <Button disabled className="w-full" data-testid="registration-closed">
                          Registration Closed
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {!event.maxParticipants || event.currentParticipants < event.maxParticipants ? 
                            "Registration period has ended" : 
                            "Event is fully booked"
                          }
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <Button disabled className="w-full" data-testid="registration-disabled">
                      Registration Not Available
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Registration is not enabled for this event
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {event.contactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground dark:prose-headings:text-white dark:prose-p:text-white"
                    dangerouslySetInnerHTML={{ __html: event.contactInfo }}
                    data-testid="contact-info"
                  />
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Start Date:</span>
                  <span className="font-medium" data-testid="start-date">
                    {formatDate(event.startDate)}
                  </span>
                </div>
                
                {event.endDate && (
                  <div className="flex justify-between text-sm">
                    <span>End Date:</span>
                    <span className="font-medium" data-testid="end-date">
                      {formatDate(event.endDate)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Timezone:</span>
                  <span className="font-medium" data-testid="timezone">
                    {event.timezone}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Type:</span>
                  <span className="font-medium" data-testid="event-type-detail">
                    {event.eventType}
                  </span>
                </div>

                {event.locationAddress && event.locationType !== 'online' && (
                  <div className="text-sm">
                    <span className="block mb-1">Location:</span>
                    <span className="font-medium text-xs" data-testid="location-address">
                      {event.locationAddress}
                    </span>
                  </div>
                )}

                {event.onlineUrl && event.locationType !== 'physical' && (
                  <div className="text-sm">
                    <span className="block mb-1">Online Link:</span>
                    <a 
                      href={event.onlineUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline text-xs break-all"
                      data-testid="online-url"
                    >
                      {event.onlineUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}