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

  const hasPermissions = userRole === 'owner' || userRole === 'manager' || userRole === 'moderator';

  const { data: micControls = [], isLoading: loadingMics } = useQuery({
    queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/mic-control`],
    enabled: isVisible && hasPermissions
  });

  const { data: bansData, isLoading: loadingBans } = useQuery({
    queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/bans`],
    enabled: isVisible && hasPermissions
  });

  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/events`],
    enabled: isVisible && hasPermissions
  });

  const inviteToMicMutation = useMutation({
    mutationFn: (data: { targetUserId: number; seatNumber: number }) => 
      apiRequest(`/api/room-moderation/rooms/${roomId}/moderation/invite-to-mic`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "User invited to mic" });
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/mic-control`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/mic-control`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/mic-control`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/mic-control`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/events`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/bans`] });
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/events`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/room-moderation/rooms/${roomId}/moderation/mic-control`] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to change mic", variant: "destructive" });
    }
  });

  if (!isVisible || !hasPermissions) {
    return null;
  }

  const getMicStatusColor = (mic: MicControl | undefined) => {
    if (!mic || mic.status === 'available') return 'from-gray-500 to-gray-700';
    if (mic.status === 'locked') return 'from-red-500 to-rose-700';
    if (mic.isMuted) return 'from-yellow-500 to-orange-600';
    if (mic.status === 'occupied') return 'from-emerald-500 to-green-600';
    return 'from-blue-500 to-indigo-600';
  };

  const getMicStatusIcon = (mic: MicControl) => {
    if (mic.status === 'locked') return <Lock className="h-5 w-5 text-white" />;
    if (mic.isMuted) return <VolumeX className="h-5 w-5 text-white" />;
    if (mic.status === 'occupied') return <Mic className="h-5 w-5 text-white" />;
    return <MicOff className="h-5 w-5 text-white" />;
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" data-testid="moderation-panel-overlay">
      <Card className="w-full max-w-6xl max-h-[95vh] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 overflow-hidden" data-testid="moderation-panel-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl" data-testid="moderation-panel-title">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Room Moderation</span>
            <span className="sm:hidden">Moderation</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20" data-testid="close-moderation-panel">
            <span className="text-2xl">×</span>
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto max-h-[calc(95vh-80px)] p-3 sm:p-6">
          <Tabs defaultValue="mic-control" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800 p-1 gap-1">
              <TabsTrigger 
                value="mic-control" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 text-xs sm:text-sm" 
                data-testid="tab-mic-control"
              >
                <Mic className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Mics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="user-management" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 text-xs sm:text-sm" 
                data-testid="tab-user-management"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bans" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 text-xs sm:text-sm" 
                data-testid="tab-bans"
              >
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Bans</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 text-xs sm:text-sm" 
                data-testid="tab-events"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mic-control" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }, (_, i) => {
                  const seatNumber = i + 1;
                  const mic = micControls.find((m: MicControl) => m.seatNumber === seatNumber);
                  const gradientColor = getMicStatusColor(mic);
                  
                  return (
                    <Card 
                      key={seatNumber} 
                      className={`relative overflow-hidden bg-gradient-to-br ${gradientColor} border-0 text-white shadow-lg hover:shadow-xl transition-all`}
                      data-testid={`mic-seat-${seatNumber}`}
                    >
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-sm sm:text-base">Mic {seatNumber}</span>
                          {getMicStatusIcon(mic || { seatNumber, status: 'available', isMuted: false } as MicControl)}
                        </div>
                        
                        <div className="mb-3">
                          <Badge 
                            variant="secondary" 
                            className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm"
                          >
                            {mic?.status || 'available'}
                          </Badge>
                        </div>
                        
                        {mic?.occupiedBy && (
                          <p className="text-xs sm:text-sm font-medium mb-3 truncate bg-black/20 px-2 py-1 rounded">
                            {mic.occupiedBy.displayName}
                          </p>
                        )}
                        
                        <div className="flex gap-1 justify-center">
                          {mic?.occupiedBy && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
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
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
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
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
                            onClick={() => muteMicMutation.mutate({ 
                              seatNumber, 
                              mute: !mic?.isMuted 
                            })}
                            data-testid={`mute-mic-${seatNumber}`}
                          >
                            {mic?.isMuted ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="user-management" className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" data-testid="kick-user-button">
                      <UserX className="h-4 w-4 mr-2" />
                      Kick User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/30" data-testid="kick-user-dialog">
                    <DialogHeader>
                      <DialogTitle className="text-white">Kick User</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Select a user to kick from the room.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="kick-user-id" className="text-white">User ID</Label>
                        <input
                          id="kick-user-id"
                          type="number"
                          className="w-full p-2 border rounded bg-slate-800 text-white border-purple-500/30"
                          value={selectedUser || ''}
                          onChange={(e) => setSelectedUser(Number(e.target.value))}
                          data-testid="kick-user-id-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kick-reason" className="text-white">Reason (optional)</Label>
                        <Textarea
                          id="kick-reason"
                          value={kickReason}
                          onChange={(e) => setKickReason(e.target.value)}
                          placeholder="Enter reason for kicking..."
                          className="bg-slate-800 text-white border-purple-500/30"
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
                        className="bg-gradient-to-r from-blue-600 to-cyan-600"
                        data-testid="confirm-kick-user"
                      >
                        Kick User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700" data-testid="ban-user-button">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/30" data-testid="ban-user-dialog">
                    <DialogHeader>
                      <DialogTitle className="text-white">Ban User</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Select a user to ban from the room and choose the ban duration.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ban-user-id" className="text-white">User ID</Label>
                        <input
                          id="ban-user-id"
                          type="number"
                          className="w-full p-2 border rounded bg-slate-800 text-white border-purple-500/30"
                          value={selectedUser || ''}
                          onChange={(e) => setSelectedUser(Number(e.target.value))}
                          data-testid="ban-user-id-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ban-duration" className="text-white">Duration</Label>
                        <Select value={banDuration} onValueChange={setBanDuration}>
                          <SelectTrigger className="bg-slate-800 text-white border-purple-500/30" data-testid="ban-duration-select">
                            <SelectValue placeholder="Select ban duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-purple-500/30">
                            <SelectItem value="1_day">1 Day</SelectItem>
                            <SelectItem value="7_days">7 Days</SelectItem>
                            <SelectItem value="30_days">30 Days</SelectItem>
                            <SelectItem value="1_year">1 Year</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ban-reason" className="text-white">Reason (optional)</Label>
                        <Textarea
                          id="ban-reason"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Enter reason for ban..."
                          className="bg-slate-800 text-white border-purple-500/30"
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
                        className="bg-gradient-to-r from-red-600 to-rose-600"
                        data-testid="confirm-ban-user"
                      >
                        Ban User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            <TabsContent value="bans" className="space-y-4 mt-4">
              <ScrollArea className="h-96">
                {loadingBans ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bansData?.bans?.map((ban: RoomBan) => (
                      <Card key={ban.id} className="p-4 bg-gradient-to-br from-red-900/30 to-rose-900/30 border-red-500/30 text-white" data-testid={`ban-${ban.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-base">{ban.user.displayName}</p>
                            <p className="text-sm text-gray-300">
                              Duration: {formatDuration(ban.duration)}
                            </p>
                            {ban.reason && (
                              <p className="text-sm text-gray-300">
                                Reason: {ban.reason}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Banned: {formatDate(ban.createdAt)} by {ban.bannedBy.displayName}
                            </p>
                            {ban.expiresAt && (
                              <p className="text-xs text-gray-400">
                                Expires: {formatDate(ban.expiresAt)}
                              </p>
                            )}
                          </div>
                          <Badge variant={ban.isActive ? "destructive" : "secondary"} className="ml-2">
                            {ban.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-4">
              <ScrollArea className="h-96">
                {loadingEvents ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventsData?.events?.map((event: ModerationEvent) => (
                      <Card key={event.id} className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 text-white" data-testid={`event-${event.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium capitalize text-base">
                              {event.action.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-300">
                              Moderator: {event.moderator.displayName}
                            </p>
                            {event.targetUser && (
                              <p className="text-sm text-gray-300">
                                Target: {event.targetUser.displayName}
                              </p>
                            )}
                            {event.reason && (
                              <p className="text-sm text-gray-300">
                                Reason: {event.reason}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(event.createdAt)}
                            </p>
                          </div>
                          <Badge variant={event.isActive ? "default" : "secondary"} className="ml-2">
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
