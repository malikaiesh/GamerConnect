import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Lock, 
  Unlock, 
  Users, 
  UserX, 
  Shield, 
  AlertTriangle,
  Clock,
  Eye,
  MoreHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ModerationPanelProps {
  roomId: string;
  userRole: 'owner' | 'manager' | 'moderator' | 'member';
  isVisible: boolean;
  onClose: () => void;
}

interface MicControl {
  id: number;
  seatNumber: number;
  status: 'available' | 'occupied' | 'locked' | 'invited_only';
  isMuted: boolean;
  occupiedBy?: {
    id: number;
    username: string;
    displayName: string;
  };
  lockedBy?: {
    id: number;
    username: string;
    displayName: string;
  };
  mutedBy?: {
    id: number;
    username: string;
    displayName: string;
  };
  invitedUsers: number[];
}

interface RoomBan {
  id: number;
  duration: '1_day' | '7_days' | '30_days' | '1_year' | 'permanent';
  reason?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
  bannedBy: {
    id: number;
    username: string;
    displayName: string;
  };
}

interface ModerationEvent {
  id: number;
  action: string;
  reason?: string;
  metadata?: any;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  moderator: {
    id: number;
    username: string;
    displayName: string;
  };
  targetUser?: {
    id: number;
    username: string;
    displayName: string;
  };
}

export function RoomModerationPanel({ roomId, userRole, isVisible, onClose }: ModerationPanelProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [kickReason, setKickReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<string>('1_day');
  const [selectedSeat, setSelectedSeat] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has moderation permissions
  const hasPermissions = userRole === 'owner' || userRole === 'manager' || userRole === 'moderator';

  if (!isVisible || !hasPermissions) {
    return null;
  }

  // Fetch mic control status
  const { data: micControls = [], isLoading: loadingMics } = useQuery({
    queryKey: ['/api/room-moderation/rooms', roomId, 'moderation/mic-control'],
    enabled: isVisible
  });

  // Fetch room bans
  const { data: bansData, isLoading: loadingBans } = useQuery({
    queryKey: ['/api/room-moderation/rooms', roomId, 'moderation/bans'],
    enabled: isVisible
  });

  // Fetch moderation events
  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ['/api/room-moderation/rooms', roomId, 'moderation/events'],
    enabled: isVisible
  });

  // Moderation mutations
  const inviteToMicMutation = useMutation({
    mutationFn: (data: { targetUserId: number; seatNumber: number }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/invite-to-mic`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "User invited to mic" });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to invite user to mic", variant: "destructive" });
    }
  });

  const removeFromMicMutation = useMutation({
    mutationFn: (data: { targetUserId: number; seatNumber: number }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/remove-from-mic`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "User removed from mic" });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to remove user from mic", variant: "destructive" });
    }
  });

  const lockMicMutation = useMutation({
    mutationFn: (data: { seatNumber: number; lock: boolean }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/lock-mic`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: `Mic ${variables.lock ? 'locked' : 'unlocked'}` });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to lock/unlock mic", variant: "destructive" });
    }
  });

  const muteMicMutation = useMutation({
    mutationFn: (data: { seatNumber: number; mute: boolean }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/mute-mic`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: `Mic ${variables.mute ? 'muted' : 'unmuted'}` });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to mute/unmute mic", variant: "destructive" });
    }
  });

  const kickUserMutation = useMutation({
    mutationFn: (data: { targetUserId: number; reason?: string }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/kick-user`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "User kicked from room" });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
      setKickReason('');
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to kick user", variant: "destructive" });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: (data: { targetUserId: number; duration: string; reason?: string }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/ban-user`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "User banned from room" });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
      setBanReason('');
      setBanDuration('1_day');
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to ban user", variant: "destructive" });
    }
  });

  const changeMicMutation = useMutation({
    mutationFn: (data: { targetUserId: number; fromSeat: number; toSeat: number }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/change-mic`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Mic changed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/room-moderation/rooms', roomId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to change mic", variant: "destructive" });
    }
  });

  const getMicStatusIcon = (mic: MicControl) => {
    if (mic.status === 'locked') return <Lock className="h-4 w-4 text-red-500" />;
    if (mic.isMuted) return <VolumeX className="h-4 w-4 text-yellow-500" />;
    if (mic.status === 'occupied') return <Mic className="h-4 w-4 text-green-500" />;
    return <MicOff className="h-4 w-4 text-gray-500" />;
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'occupied': return 'default';
      case 'locked': return 'destructive';
      case 'invited_only': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDuration = (duration: string) => {
    switch (duration) {
      case '1_day': return '1 Day';
      case '7_days': return '7 Days';
      case '30_days': return '30 Days';
      case '1_year': return '1 Year';
      case 'permanent': return 'Permanent';
      default: return duration;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" data-testid="moderation-panel-overlay">
      <Card className="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900" data-testid="moderation-panel-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2" data-testid="moderation-panel-title">
            <Shield className="h-5 w-5" />
            Room Moderation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-moderation-panel">
            ×
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="mic-control" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mic-control" data-testid="tab-mic-control">Mic Control</TabsTrigger>
              <TabsTrigger value="user-management" data-testid="tab-user-management">Users</TabsTrigger>
              <TabsTrigger value="bans" data-testid="tab-bans">Bans</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="mic-control" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, i) => {
                  const seatNumber = i + 1;
                  const mic = micControls.find((m: MicControl) => m.seatNumber === seatNumber);
                  
                  return (
                    <Card key={seatNumber} className="p-4" data-testid={`mic-seat-${seatNumber}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Mic {seatNumber}</span>
                        {getMicStatusIcon(mic || { seatNumber, status: 'available', isMuted: false })}
                      </div>
                      
                      <Badge variant={getBadgeVariant(mic?.status || 'available')} className="mb-2">
                        {mic?.status || 'available'}
                      </Badge>
                      
                      {mic?.occupiedBy && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {mic.occupiedBy.displayName}
                        </p>
                      )}
                      
                      <div className="flex gap-1">
                        {mic?.occupiedBy && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromMicMutation.mutate({ 
                              targetUserId: mic.occupiedBy!.id, 
                              seatNumber 
                            })}
                            data-testid={`remove-from-mic-${seatNumber}`}
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => lockMicMutation.mutate({ 
                            seatNumber, 
                            lock: mic?.status !== 'locked' 
                          })}
                          data-testid={`lock-mic-${seatNumber}`}
                        >
                          {mic?.status === 'locked' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => muteMicMutation.mutate({ 
                            seatNumber, 
                            mute: !mic?.isMuted 
                          })}
                          data-testid={`mute-mic-${seatNumber}`}
                        >
                          {mic?.isMuted ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="user-management" className="space-y-4">
              <div className="flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="kick-user-button">
                      <UserX className="h-4 w-4 mr-2" />
                      Kick User
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="kick-user-dialog">
                    <DialogHeader>
                      <DialogTitle>Kick User</DialogTitle>
                      <DialogDescription>
                        Select a user to kick from the room.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="kick-user-id">User ID</Label>
                        <input
                          id="kick-user-id"
                          type="number"
                          className="w-full p-2 border rounded"
                          value={selectedUser || ''}
                          onChange={(e) => setSelectedUser(Number(e.target.value))}
                          data-testid="kick-user-id-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kick-reason">Reason (optional)</Label>
                        <Textarea
                          id="kick-reason"
                          value={kickReason}
                          onChange={(e) => setKickReason(e.target.value)}
                          placeholder="Enter reason for kicking..."
                          data-testid="kick-reason-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => selectedUser && kickUserMutation.mutate({ 
                          targetUserId: selectedUser, 
                          reason: kickReason || undefined 
                        })}
                        disabled={!selectedUser || kickUserMutation.isPending}
                        data-testid="confirm-kick-user"
                      >
                        Kick User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" data-testid="ban-user-button">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="ban-user-dialog">
                    <DialogHeader>
                      <DialogTitle>Ban User</DialogTitle>
                      <DialogDescription>
                        Select a user to ban from the room and choose the ban duration.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ban-user-id">User ID</Label>
                        <input
                          id="ban-user-id"
                          type="number"
                          className="w-full p-2 border rounded"
                          value={selectedUser || ''}
                          onChange={(e) => setSelectedUser(Number(e.target.value))}
                          data-testid="ban-user-id-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ban-duration">Duration</Label>
                        <Select value={banDuration} onValueChange={setBanDuration}>
                          <SelectTrigger data-testid="ban-duration-select">
                            <SelectValue placeholder="Select ban duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1_day">1 Day</SelectItem>
                            <SelectItem value="7_days">7 Days</SelectItem>
                            <SelectItem value="30_days">30 Days</SelectItem>
                            <SelectItem value="1_year">1 Year</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ban-reason">Reason (optional)</Label>
                        <Textarea
                          id="ban-reason"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Enter reason for ban..."
                          data-testid="ban-reason-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => selectedUser && banUserMutation.mutate({ 
                          targetUserId: selectedUser, 
                          duration: banDuration,
                          reason: banReason || undefined 
                        })}
                        disabled={!selectedUser || banUserMutation.isPending}
                        variant="destructive"
                        data-testid="confirm-ban-user"
                      >
                        Ban User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            <TabsContent value="bans" className="space-y-4">
              <ScrollArea className="h-96">
                {loadingBans ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bansData?.bans?.map((ban: RoomBan) => (
                      <Card key={ban.id} className="p-4" data-testid={`ban-${ban.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{ban.user.displayName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Duration: {formatDuration(ban.duration)}
                            </p>
                            {ban.reason && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reason: {ban.reason}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Banned: {formatDate(ban.createdAt)} by {ban.bannedBy.displayName}
                            </p>
                            {ban.expiresAt && (
                              <p className="text-xs text-gray-500">
                                Expires: {formatDate(ban.expiresAt)}
                              </p>
                            )}
                          </div>
                          <Badge variant={ban.isActive ? "destructive" : "secondary"}>
                            {ban.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <ScrollArea className="h-96">
                {loadingEvents ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventsData?.events?.map((event: ModerationEvent) => (
                      <Card key={event.id} className="p-4" data-testid={`event-${event.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">
                              {event.action.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Moderator: {event.moderator.displayName}
                            </p>
                            {event.targetUser && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Target: {event.targetUser.displayName}
                              </p>
                            )}
                            {event.reason && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reason: {event.reason}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatDate(event.createdAt)}
                            </p>
                          </div>
                          <Badge variant={event.isActive ? "default" : "secondary"}>
                            {event.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}