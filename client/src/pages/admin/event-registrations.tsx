import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, Mail, Phone, MapPin, Users } from "lucide-react";
import AdminNavigation from "@/components/admin/navigation";
import { AppHead } from "@/components/app-head";
// Using basic date formatting without date-fns
function formatDateBasic(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface EventRegistration {
  id: number;
  eventId: number;
  userId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  status: string;
  notes?: string;
  paymentStatus?: string;
  registeredAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    displayName?: string;
  };
  event?: {
    id: number;
    title: string;
    slug: string;
    startDate: string;
    endDate?: string;
    eventType: string;
    status: string;
  };
}

interface Event {
  id: number;
  title: string;
  slug: string;
  startDate: string;
  endDate?: string;
  eventType: string;
  status: string;
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'registered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'attended':
      return 'secondary';
    case 'no_show':
      return 'outline';
    default:
      return 'default';
  }
}

function getPaymentStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'default';
  }
}

function formatDate(date: string | Date) {
  return formatDateBasic(date);
}

export default function EventRegistrationsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all events for the filter dropdown
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"]
  });

  // Fetch registrations based on selected event
  const { data: registrations = [], isLoading } = useQuery<EventRegistration[]>({
    queryKey: ["/api/registrations", { eventId: selectedEventId !== 'all' ? selectedEventId : undefined }]
  });

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter(registration => {
    const searchLower = searchTerm.toLowerCase();
    const guestName = registration.guestName || '';
    const guestEmail = registration.guestEmail || '';
    const userName = registration.user?.username || '';
    const userEmail = registration.user?.email || '';
    const displayName = registration.user?.displayName || '';
    const eventTitle = registration.event?.title || '';
    
    return (
      guestName.toLowerCase().includes(searchLower) ||
      guestEmail.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      eventTitle.toLowerCase().includes(searchLower)
    );
  });

  const registrationStats = {
    total: registrations.length,
    registered: registrations.filter(r => r.status === 'registered').length,
    attended: registrations.filter(r => r.status === 'attended').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
    noShow: registrations.filter(r => r.status === 'no_show').length
  };

  return (
    <div className="flex h-screen bg-background">
      <AppHead title="Event Registrations - Admin" description="Manage and view all event registrations" />
      <AdminNavigation />
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="page-title">Event Registrations</h1>
        <p className="text-muted-foreground" data-testid="page-description">
          Manage and view all event registrations across your platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationStats.total}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-registered">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationStats.registered}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-attended">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attended</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationStats.attended}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-cancelled">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationStats.cancelled}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-no-show">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Show</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationStats.noShow}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter registrations by event or search for specific participants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Participants
              </label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="w-full sm:w-[300px]">
              <label htmlFor="event-filter" className="block text-sm font-medium mb-2">
                Filter by Event
              </label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger data-testid="select-event-filter">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
          <CardDescription>
            View and manage all event registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-state">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-state">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No registrations found</p>
              <p className="text-muted-foreground">
                {searchTerm || selectedEventId !== 'all' ? 
                  'Try adjusting your filters to see more results.' : 
                  'No one has registered for any events yet.'
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} data-testid={`registration-row-${registration.id}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium" data-testid={`participant-name-${registration.id}`}>
                            {registration.user ? 
                              (registration.user.displayName || registration.user.username) : 
                              registration.guestName || 'Unknown'
                            }
                          </div>
                          {registration.user && (
                            <div className="text-sm text-muted-foreground">
                              Registered User
                            </div>
                          )}
                          {!registration.user && (
                            <div className="text-sm text-muted-foreground">
                              Guest Registration
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium" data-testid={`event-title-${registration.id}`}>
                            {registration.event?.title || 'Unknown Event'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {registration.event?.startDate && formatDate(registration.event.startDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span data-testid={`participant-email-${registration.id}`}>
                              {registration.user?.email || registration.guestEmail || 'N/A'}
                            </span>
                          </div>
                          {registration.guestPhone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{registration.guestPhone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(registration.status)} 
                          data-testid={`status-badge-${registration.id}`}
                        >
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getPaymentStatusBadgeVariant(registration.paymentStatus || 'pending')}
                          data-testid={`payment-badge-${registration.id}`}
                        >
                          {registration.paymentStatus || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm" data-testid={`registration-date-${registration.id}`}>
                          {formatDate(registration.registeredAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-[200px] truncate" data-testid={`notes-${registration.id}`}>
                          {registration.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}