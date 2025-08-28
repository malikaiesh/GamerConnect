import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Calendar, MapPin, Users, Edit2, Trash2, Eye, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicTextEditor } from "@/components/admin/basic-text-editor";
import type { Event, InsertEvent } from "@shared/schema";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.enum(['tournament', 'game_release', 'community', 'maintenance', 'seasonal', 'streaming', 'meetup', 'competition', 'other']),
  status: z.enum(['draft', 'published', 'ongoing', 'completed', 'cancelled']),
  startDate: z.string().min(1, "Start date is required").refine((val) => {
    if (isNaN(Date.parse(val))) return false;
    const startDate = new Date(val);
    const now = new Date();
    // Allow dates within the last 24 hours to account for timezone differences
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return startDate >= yesterday;
  }, "Start date must be today or in the future"),
  endDate: z.string().optional().refine((val) => {
    return !val || !isNaN(Date.parse(val));
  }, "Please enter a valid date").refine((val, ctx) => {
    if (!val) return true; // Optional field
    const formData = ctx.parent as EventFormValues;
    if (!formData.startDate) return true;
    const startDate = new Date(formData.startDate);
    const endDate = new Date(val);
    return endDate > startDate;
  }, "End date must be after start date"),
  timezone: z.string().default('UTC'),
  locationType: z.enum(['online', 'physical', 'hybrid']),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  onlineUrl: z.string().optional(),
  registrationEnabled: z.boolean().default(false),
  registrationStartDate: z.string().optional().refine((val) => {
    return !val || !isNaN(Date.parse(val));
  }, "Please enter a valid date"),
  registrationEndDate: z.string().optional().refine((val) => {
    return !val || !isNaN(Date.parse(val));
  }, "Please enter a valid date"),
  maxParticipants: z.string().optional(),
  registrationFee: z.string().optional(),
  bannerImage: z.string().optional(),
  rules: z.string().optional(),
  prizes: z.string().optional(),
  requirements: z.string().optional(),
  contactInfo: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featured: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

function EventForm({ event, onClose }: { event?: Event; onClose: () => void }) {
  const { toast } = useToast();
  const isEditing = !!event;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      slug: event?.slug || "",
      description: event?.description || "",
      eventType: event?.eventType || "community",
      status: event?.status || "draft",
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      timezone: event?.timezone || "UTC",
      locationType: event?.locationType || "online",
      locationName: event?.locationName || "",
      locationAddress: event?.locationAddress || "",
      onlineUrl: event?.onlineUrl || "",
      registrationEnabled: event?.registrationEnabled || false,
      registrationStartDate: event?.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : "",
      registrationEndDate: event?.registrationEndDate ? new Date(event.registrationEndDate).toISOString().slice(0, 16) : "",
      maxParticipants: event?.maxParticipants?.toString() || "",
      registrationFee: event?.registrationFee ? (event.registrationFee / 100).toString() : "",
      bannerImage: event?.bannerImage || "",
      rules: event?.rules || "",
      prizes: event?.prizes || "",
      requirements: event?.requirements || "",
      contactInfo: event?.contactInfo || "",
      metaTitle: event?.metaTitle || "",
      metaDescription: event?.metaDescription || "",
      featured: event?.featured || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        registrationStartDate: data.registrationStartDate ? new Date(data.registrationStartDate).toISOString() : null,
        registrationEndDate: data.registrationEndDate ? new Date(data.registrationEndDate).toISOString() : null,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
        registrationFee: data.registrationFee ? Math.round(parseFloat(data.registrationFee) * 100) : 0,
      };
      
      return isEditing 
        ? apiRequest(`/api/events/${event.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : apiRequest("/api/events", {
            method: "POST",
            body: JSON.stringify(payload),
          });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: `Event ${isEditing ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} event`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter event title" 
                        {...field}
                        data-testid="input-event-title"
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-generate slug from title
                          if (!isEditing && e.target.value) {
                            const slug = e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/[\s_-]+/g, '-')
                              .replace(/^-+|-+$/g, '');
                            form.setValue('slug', slug);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="event-slug" 
                        {...field}
                        data-testid="input-event-slug"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <BasicTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter event description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-event-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tournament">Tournament</SelectItem>
                        <SelectItem value="game_release">Game Release</SelectItem>
                        <SelectItem value="community">Community Event</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="seasonal">Seasonal Event</SelectItem>
                        <SelectItem value="streaming">Streaming Event</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-event-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="UTC" 
                        {...field}
                        data-testid="input-event-timezone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        data-testid="input-event-start-date"
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
                    <FormLabel>End Date & Time (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        data-testid="input-event-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Event</FormLabel>
                    <FormDescription>
                      Display this event prominently on the website
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-event-featured"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-location-type">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Discord Server, Convention Center" 
                      {...field}
                      data-testid="input-location-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Address (if applicable)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter physical address" 
                      {...field}
                      data-testid="textarea-location-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="onlineUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Online URL (if applicable)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://discord.gg/..." 
                      {...field}
                      data-testid="input-online-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="registration" className="space-y-4">
            <FormField
              control={form.control}
              name="registrationEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Registration</FormLabel>
                    <FormDescription>
                      Allow users to register for this event
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-registration-enabled"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registrationStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        data-testid="input-registration-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        data-testid="input-registration-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Participants (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Unlimited if empty" 
                        {...field}
                        data-testid="input-max-participants"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Fee (USD)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        data-testid="input-registration-fee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://..." 
                      {...field}
                      data-testid="input-banner-image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rules & Guidelines</FormLabel>
                  <FormControl>
                    <BasicTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter event rules and guidelines..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prizes & Rewards</FormLabel>
                  <FormControl>
                    <BasicTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter information about prizes..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <BasicTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter participation requirements..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Contact details for the event" 
                      {...field}
                      data-testid="textarea-contact-info"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Meta Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SEO title for search engines" 
                        {...field}
                        data-testid="input-meta-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Meta Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="SEO description for search engines" 
                        {...field}
                        data-testid="textarea-meta-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            data-testid="button-save-event"
          >
            {createMutation.isPending ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => apiRequest("/api/events?limit=50"),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: number) =>
      apiRequest(`/api/events/${eventId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingEvent(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (eventId: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(eventId);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events Management</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage gaming tournaments, community events, and more
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreate} data-testid="button-create-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEvent ? "Update event details" : "Create a new gaming event, tournament, or community gathering"}
                    </DialogDescription>
                  </DialogHeader>
                  <EventForm 
                    event={editingEvent} 
                    onClose={() => setIsDialogOpen(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No events yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Get started by creating your first gaming event or tournament.
                  </p>
                  <Button onClick={handleCreate} data-testid="button-create-first-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events?.map((event: Event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight mb-2" data-testid={`text-event-title-${event.id}`}>
                            {event.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadgeVariant(event.status)} data-testid={`badge-status-${event.id}`}>
                              {event.status}
                            </Badge>
                            <Badge variant="outline" data-testid={`badge-type-${event.id}`}>
                              {event.eventType.replace('_', ' ')}
                            </Badge>
                            {event.featured && (
                              <Badge variant="secondary" data-testid={`badge-featured-${event.id}`}>
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4 mr-2" />
                          <span data-testid={`text-start-date-${event.id}`}>
                            {formatDate(event.startDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span data-testid={`text-location-${event.id}`}>
                            {event.locationType === 'online' ? 'Online Event' : 
                             event.locationName || 'Physical Location'}
                          </span>
                        </div>

                        {event.registrationEnabled && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4 mr-2" />
                            <span data-testid={`text-participants-${event.id}`}>
                              {event.currentParticipants}
                              {event.maxParticipants ? `/${event.maxParticipants}` : ''} participants
                            </span>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2" data-testid={`text-description-${event.id}`}>
                          {event.description}
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                          data-testid={`button-view-${event.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          data-testid={`button-edit-${event.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${event.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}