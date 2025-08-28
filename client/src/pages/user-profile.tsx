import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Camera, 
  Save, 
  Lock, 
  Mail, 
  Calendar,
  MapPin,
  Globe,
  Users,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Sidebar } from "@/components/layout/sidebar";

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImage?: string;
  joinedAt: string;
  totalRooms: number;
  totalMessages: number;
}

export default function UserProfile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      return apiRequest('/api/user/change-password', {
        method: 'POST',
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed.",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAvatarUpload = () => {
    if (selectedFile) {
      uploadAvatarMutation.mutate(selectedFile);
    }
  };

  const handleProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-64 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold" data-testid="page-title">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{profile?.totalRooms || 0}</div>
                      <div className="text-sm text-muted-foreground">Rooms Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{profile?.totalMessages || 0}</div>
                      <div className="text-sm text-muted-foreground">Messages Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {profile?.joinedAt ? new Date(profile.joinedAt).getFullYear() : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Member Since</div>
                    </div>
                  </div>

                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your display name" {...field} data-testid="input-display-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Your location" {...field} data-testid="input-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://your-website.com" {...field} data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself..." 
                                className="resize-none" 
                                rows={4}
                                {...field} 
                                data-testid="textarea-bio" 
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile (max 500 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avatar Tab */}
            <TabsContent value="avatar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage 
                        src={previewUrl || profile?.profileImage} 
                        alt={profile?.displayName} 
                      />
                      <AvatarFallback className="text-2xl">
                        {profile?.displayName?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="max-w-xs"
                        data-testid="input-avatar-file"
                      />
                      <p className="text-sm text-muted-foreground text-center">
                        Upload a profile picture (max 5MB)
                      </p>
                      
                      {selectedFile && (
                        <Button 
                          onClick={handleAvatarUpload}
                          disabled={uploadAvatarMutation.isPending}
                          data-testid="button-upload-avatar"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Avatar"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="Enter your current password" 
                                  {...field} 
                                  data-testid="input-current-password" 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter your new password" 
                                  {...field} 
                                  data-testid="input-new-password" 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your new password" 
                                  {...field} 
                                  data-testid="input-confirm-password" 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={changePasswordMutation.isPending}
                        data-testid="button-change-password"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}