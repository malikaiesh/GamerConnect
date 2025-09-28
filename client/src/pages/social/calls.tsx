import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  PhoneCall,
  Video,
  VideoOff,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Search,
  Filter,
  Calendar
  ArrowLeft
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";

interface CallRecord {
  id: number;
  callerId: number;
  receiverId: number;
  callType: 'voice' | 'video';
  status: 'completed' | 'missed' | 'declined' | 'no_answer';
  duration: number; // in seconds
  startedAt: string;
  endedAt?: string;
  caller: {
    id: number;
    username: string;
    displayName: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  receiver: {
    id: number;
    username: string;
    displayName: string;
    profilePicture?: string;
    isVerified: boolean;
  };
}

function CallCard({ call, isOutgoing }: { call: CallRecord; isOutgoing: boolean }) {
  const { toast } = useToast();
  
  const otherUser = isOutgoing ? call.receiver : call.caller;
  
  const getCallIcon = () => {
    if (call.status === 'missed') {
      return <PhoneMissed className="w-4 h-4 text-destructive" />;
    }
    if (isOutgoing) {
      return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
    }
    return <PhoneIncoming className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'missed': return 'bg-destructive';
      case 'declined': return 'bg-yellow-500';
      case 'no_answer': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const makeCall = async (callType: 'voice' | 'video') => {
    try {
      await apiRequest("/api/friends/calls/initiate", {
        method: "POST",
        body: JSON.stringify({
          receiverId: otherUser.id,
          callType
        })
      });
      toast({
        title: "Call initiated",
        description: `${callType === 'voice' ? 'Voice' : 'Video'} call started with ${otherUser.displayName || otherUser.username}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getCallIcon()}
              {call.callType === 'video' && <Video className="w-3 h-3 text-muted-foreground" />}
            </div>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.profilePicture} />
              <AvatarFallback>
                {(otherUser.displayName || otherUser.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-foreground">
                  {otherUser.displayName || otherUser.username}
                </p>
                {otherUser.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(call.status)}`}></span>
                <span className="capitalize">{call.status.replace('_', ' ')}</span>
                {call.duration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(call.duration)}</span>
                  </>
                )}
                <span>•</span>
                <span>{formatDistanceToNow(new Date(call.startedAt))} ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => makeCall('voice')}
              data-testid={`call-voice-${otherUser.id}`}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => makeCall('video')}
              data-testid={`call-video-${otherUser.id}`}
            >
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CallsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const [, navigate] = useLocation();

  // Fetch call history
  const { data: callHistory = [], isLoading } = useQuery<CallRecord[]>({
    queryKey: ["/api/friends/calls/history"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter calls based on search term and tab
  const filteredCalls = callHistory.filter(call => {
    const otherUser = call.caller.id !== call.receiverId ? call.caller : call.receiver;
    const matchesSearch = otherUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (otherUser.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'missed':
        return call.status === 'missed';
      case 'outgoing':
        return call.caller.id === call.callerId; // Current user is caller
      case 'incoming':
        return call.receiver.id === call.receiverId; // Current user is receiver
      default:
        return true;
    }
  });

  const getMissedCallsCount = () => {
    return callHistory.filter(call => call.status === 'missed').length;
  };

  if (isLoading) {
    return (
      <div className="flex">
        {!isMobile && <Sidebar />}
        <div className={`flex-1 ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {!isMobile && <Sidebar />}
      <div className={`flex-1 ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/user-dashboard')}
                className="flex items-center gap-2"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
              <h1 className="text-xl font-bold">Calls</h1>
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground ${isMobile ? 'sr-only' : ''}`} data-testid="page-title">
                  Calls
                </h1>
                <p className="text-muted-foreground">Your call history and quick dial contacts</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search call history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-calls"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" data-testid="tab-all-calls">
                All Calls
              </TabsTrigger>
              <TabsTrigger value="missed" data-testid="tab-missed-calls">
                Missed {getMissedCallsCount() > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {getMissedCallsCount()}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing" data-testid="tab-outgoing-calls">
                Outgoing
              </TabsTrigger>
              <TabsTrigger value="incoming" data-testid="tab-incoming-calls">
                Incoming
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredCalls.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchTerm ? 'No matching calls' : 'No call history'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? `No calls found matching "${searchTerm}"`
                        : 'Start making voice and video calls to see your history here'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredCalls.map((call) => (
                    <CallCard 
                      key={call.id} 
                      call={call} 
                      isOutgoing={call.caller.id === call.callerId}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}