import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Shield, 
  Palette, 
  Users, 
  Mic, 
  MessageSquare, 
  Gift, 
  Music, 
  Lock, 
  Globe, 
  Eye, 
  EyeOff,
  Save,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Crown,
  UserX,
  UserPlus
} from "lucide-react";

interface RoomData {
  id: number;
  roomId: string;
  name: string;
  description: string | null;
  type: "public" | "private";
  password: string | null;
  maxSeats: number;
  category: string;
  country: string | null;
  language: string;
  status: "active" | "inactive" | "maintenance";
  isLocked: boolean;
  isFeatured: boolean;
  voiceChatEnabled: boolean;
  textChatEnabled: boolean;
  giftsEnabled: boolean;
  backgroundTheme: string;
  backgroundMusic: string | null;
  musicEnabled: boolean;
  bannerImage: string | null;
  tags: string[];
  ownerId: number;
  totalVisits: number;
  totalGiftsReceived: number;
  totalGiftValue: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoomSettingsFormData {
  name: string;
  description: string;
  type: "public" | "private";
  password: string;
  maxSeats: number;
  category: string;
  country: string;
  language: string;
  status: "active" | "inactive" | "maintenance";
  isLocked: boolean;
  voiceChatEnabled: boolean;
  textChatEnabled: boolean;
  giftsEnabled: boolean;
  backgroundTheme: string;
  backgroundMusic: string;
  musicEnabled: boolean;
  bannerImage: string;
  tags: string[];
}

interface RoomMember {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
  role: "owner" | "manager" | "member" | "guest";
  seatNumber: number | null;
  isActive: boolean;
  joinedAt: string;
}

// Admin Permissions Tab Component
function AdminPermissionsTab({ roomId }: { roomId: string | undefined }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMemberUsername, setNewMemberUsername] = useState("");

  // Fetch room members
  const { data: roomMembers, isLoading: isLoadingMembers } = useQuery<RoomMember[]>({
    queryKey: [`/api/rooms/${roomId}/members`],
    enabled: !!roomId
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: number; newRole: string }) =>
      apiRequest(`/api/rooms/${roomId}/members/${userId}/role`, { 
        method: "PATCH", 
        body: { role: newRole } 
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/members`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest(`/api/rooms/${roomId}/members/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/members`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (username: string) =>
      apiRequest(`/api/rooms/${roomId}/members`, { 
        method: "POST", 
        body: { username, role: "member" } 
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member added successfully",
      });
      setNewMemberUsername("");
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/members`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "member":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "guest":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4" />;
      case "manager":
        return <ShieldCheck className="w-4 h-4" />;
      case "member":
        return <Users className="w-4 h-4" />;
      case "guest":
        return <Eye className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const handleAddMember = () => {
    if (newMemberUsername.trim()) {
      addMemberMutation.mutate(newMemberUsername.trim());
    }
  };

  if (isLoadingMembers) {
    return (
      <Card data-testid="card-permissions-loading">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-admin-permissions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Admin Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Member */}
        <div className="space-y-2">
          <Label htmlFor="newMember">Add New Member</Label>
          <div className="flex gap-2">
            <Input
              id="newMember"
              value={newMemberUsername}
              onChange={(e) => setNewMemberUsername(e.target.value)}
              placeholder="Enter username"
              onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
              data-testid="input-new-member"
            />
            <Button 
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending || !newMemberUsername.trim()}
              data-testid="button-add-member"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <Separator />

        {/* Current Members */}
        <div className="space-y-4">
          <h3 className="font-semibold">Current Members ({roomMembers?.length || 0})</h3>
          
          {roomMembers && roomMembers.length > 0 ? (
            <div className="space-y-3">
              {roomMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`member-${member.user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {member.user.displayName?.[0] || member.user.username[0]}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.displayName || member.user.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{member.user.username}
                        {member.seatNumber && ` • Seat ${member.seatNumber}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role Badge */}
                    <Badge className={`${getRoleColor(member.role)} capitalize`} data-testid={`badge-role-${member.user.id}`}>
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>

                    {/* Role Change Dropdown (only for non-owners) */}
                    {member.role !== "owner" && (
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => updateMemberRoleMutation.mutate({ 
                          userId: member.user.id, 
                          newRole 
                        })}
                        disabled={updateMemberRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-role-${member.user.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" />
                              Manager
                            </div>
                          </SelectItem>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Member
                            </div>
                          </SelectItem>
                          <SelectItem value="guest">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Guest
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {/* Remove Member Button (only for non-owners) */}
                    {member.role !== "owner" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-remove-${member.user.id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.user.displayName || member.user.username} from this room?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMemberMutation.mutate(member.user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={removeMemberMutation.isPending}
                              data-testid={`button-confirm-remove-${member.user.id}`}
                            >
                              {removeMemberMutation.isPending ? "Removing..." : "Remove"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No members found</p>
            </div>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Role Descriptions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              <span className="font-medium">Owner:</span>
              <span className="text-muted-foreground">Full control over room</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Manager:</span>
              <span className="text-muted-foreground">Can moderate and manage users</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-medium">Member:</span>
              <span className="text-muted-foreground">Regular participant</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Guest:</span>
              <span className="text-muted-foreground">Limited access visitor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoomSettingsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("general");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Fetch room data
  const { data: roomData, isLoading } = useQuery<RoomData>({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId
  });

  // Form state
  const [formData, setFormData] = useState<RoomSettingsFormData>({
    name: "",
    description: "",
    type: "public",
    password: "",
    maxSeats: 8,
    category: "general",
    country: "",
    language: "en",
    status: "active",
    isLocked: false,
    voiceChatEnabled: true,
    textChatEnabled: true,
    giftsEnabled: true,
    backgroundTheme: "lunexa",
    backgroundMusic: "",
    musicEnabled: false,
    bannerImage: "",
    tags: []
  });

  // Update form data when room data loads
  useEffect(() => {
    if (roomData) {
      setFormData({
        name: roomData.name || "",
        description: roomData.description || "",
        type: roomData.type,
        password: roomData.password || "",
        maxSeats: roomData.maxSeats,
        category: roomData.category,
        country: roomData.country || "",
        language: roomData.language,
        status: roomData.status,
        isLocked: roomData.isLocked,
        voiceChatEnabled: roomData.voiceChatEnabled,
        textChatEnabled: roomData.textChatEnabled,
        giftsEnabled: roomData.giftsEnabled,
        backgroundTheme: roomData.backgroundTheme,
        backgroundMusic: roomData.backgroundMusic || "",
        musicEnabled: roomData.musicEnabled,
        bannerImage: roomData.bannerImage || "",
        tags: roomData.tags || []
      });
    }
  }, [roomData]);

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: (updates: Partial<RoomSettingsFormData>) =>
      apiRequest(`/api/rooms/${roomId}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: () => apiRequest(`/api/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      navigate("/my-rooms");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if user is room owner
  const isOwner = roomData?.ownerId === user?.id;

  if (!isOwner && !user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-4">
          You don't have permission to access these room settings.
        </p>
        <Button onClick={() => navigate(`/room/${roomId}`)} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Room
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSave = () => {
    const updates = { ...formData };
    updateRoomMutation.mutate(updates);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getThemePreview = (theme: string) => {
    switch (theme) {
      case 'ocean': return 'from-blue-500 to-cyan-600';
      case 'sunset': return 'from-orange-500 to-pink-600';
      case 'forest': return 'from-green-500 to-emerald-600';
      case 'purple': return 'from-purple-500 to-indigo-600';
      case 'galaxy': return 'from-indigo-600 to-pink-600';
      case 'lunexa': return 'from-purple-600 to-purple-800';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/room/${roomId}`)}
            data-testid="button-back-to-room"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Room
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Room Settings</h1>
            <p className="text-muted-foreground">{roomData?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave} 
            disabled={updateRoomMutation.isPending}
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateRoomMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general" data-testid="tab-general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="features" data-testid="tab-features">
            <Users className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Admin Permissions
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">
            <Settings className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card data-testid="card-general-settings">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter room name"
                    data-testid="input-room-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your room..."
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                    data-testid="input-country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    data-testid="input-tag"
                  />
                  <Button onClick={handleAddTag} variant="outline" data-testid="button-add-tag">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)} data-testid={`tag-${index}`}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Access Settings */}
        <TabsContent value="privacy">
          <Card data-testid="card-privacy-settings">
            <CardHeader>
              <CardTitle>Privacy & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={formData.type} onValueChange={(value: "public" | "private") => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger data-testid="select-room-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public - Anyone can join
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private - Password required
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSeats">Maximum Users</Label>
                  <Select value={formData.maxSeats.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, maxSeats: parseInt(value) }))}>
                    <SelectTrigger data-testid="select-max-seats">
                      <SelectValue placeholder="Select max users" />
                    </SelectTrigger>
                    <SelectContent>
                      {[4, 6, 8, 10, 12, 15, 20].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} users</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === "private" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Room Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter room password"
                      data-testid="input-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Lock Room</div>
                  <div className="text-sm text-muted-foreground">Prevent new users from joining</div>
                </div>
                <Switch
                  checked={formData.isLocked}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLocked: checked }))}
                  data-testid="switch-lock-room"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Permissions Settings */}
        <TabsContent value="permissions">
          <AdminPermissionsTab roomId={roomId} />
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features">
          <Card data-testid="card-features-settings">
            <CardHeader>
              <CardTitle>Room Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Voice Chat</div>
                      <div className="text-sm text-muted-foreground">Enable voice communication</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.voiceChatEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, voiceChatEnabled: checked }))}
                    data-testid="switch-voice-chat"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Text Chat</div>
                      <div className="text-sm text-muted-foreground">Enable text messaging</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.textChatEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, textChatEnabled: checked }))}
                    data-testid="switch-text-chat"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Gifts</div>
                      <div className="text-sm text-muted-foreground">Allow users to send virtual gifts</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.giftsEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, giftsEnabled: checked }))}
                    data-testid="switch-gifts"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-pink-500" />
                    <div>
                      <div className="font-medium">Background Music</div>
                      <div className="text-sm text-muted-foreground">Enable background music</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.musicEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, musicEnabled: checked }))}
                    data-testid="switch-music"
                  />
                </div>

                {formData.musicEnabled && (
                  <div className="space-y-2 ml-8">
                    <Label htmlFor="backgroundMusic">Music URL</Label>
                    <Input
                      id="backgroundMusic"
                      value={formData.backgroundMusic}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundMusic: e.target.value }))}
                      placeholder="Enter music URL or file path"
                      data-testid="input-background-music"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card data-testid="card-appearance-settings">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Background Theme</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['lunexa', 'ocean', 'sunset', 'forest', 'purple', 'galaxy'].map((theme) => (
                    <div
                      key={theme}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.backgroundTheme === theme ? 'border-primary' : 'border-border'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, backgroundTheme: theme }))}
                      data-testid={`theme-${theme}`}
                    >
                      <div className={`w-full h-12 rounded bg-gradient-to-r ${getThemePreview(theme)} mb-2`}></div>
                      <div className="text-sm font-medium capitalize text-center">{theme}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image URL</Label>
                <Input
                  id="bannerImage"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, bannerImage: e.target.value }))}
                  placeholder="Enter banner image URL"
                  data-testid="input-banner-image"
                />
                <p className="text-sm text-muted-foreground">
                  Optional banner image displayed at the top of your room
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card data-testid="card-advanced-settings">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Room Status</Label>
                <Select value={formData.status} onValueChange={(value: "active" | "inactive" | "maintenance") => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active - Normal operation</SelectItem>
                    <SelectItem value="inactive">Inactive - Temporarily disabled</SelectItem>
                    <SelectItem value="maintenance">Maintenance - Under maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" data-testid="button-delete-room">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Room
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Room</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this room? This action cannot be undone.
                        All messages, users, and room data will be permanently lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteRoomMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleteRoomMutation.isPending}
                        data-testid="button-confirm-delete"
                      >
                        {deleteRoomMutation.isPending ? "Deleting..." : "Delete Room"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}