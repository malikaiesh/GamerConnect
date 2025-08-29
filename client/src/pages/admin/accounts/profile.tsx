import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { User, Settings, Shield, Mail, Calendar, MapPin, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    displayName: user?.displayName || ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (profilePictureURL: string) => {
      return apiRequest('PUT', '/api/user/profile-picture', { profilePictureURL });
    },
    onSuccess: () => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      window.location.reload(); // Refresh to show new profile picture
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (username: string) => {
    return username?.charAt(0).toUpperCase() || 'A';
  };

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin account settings and information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Overview
              </CardTitle>
              <CardDescription>
                Your admin account information and role details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5 * 1024 * 1024} // 5MB
                      onGetUploadParameters={async () => {
                        const response: any = await apiRequest('POST', '/api/objects/upload');
                        return {
                          method: 'PUT' as const,
                          url: response.uploadURL,
                        };
                      }}
                      onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                        if (result.successful && result.successful.length > 0) {
                          const uploadURL = result.successful[0].uploadURL as string;
                          if (uploadURL) {
                            uploadProfilePictureMutation.mutate(uploadURL);
                          }
                        }
                      }}
                      buttonClassName="h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                    </ObjectUploader>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg" data-testid="text-username">
                      {user.displayName || user.username}
                    </h3>
                    {user.isVerified && (
                      <div className="inline-flex items-center justify-center bg-blue-500 text-white rounded-sm w-5 h-5 flex-shrink-0 shadow-sm border border-blue-600">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Administrator
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Login</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-display-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself"
                    data-testid="input-bio"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  {!isEditing ? (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)}
                      data-testid="button-edit-profile"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            username: user?.username || '',
                            email: user?.email || '',
                            bio: user?.bio || '',
                            displayName: ''
                          });
                        }}
                        data-testid="button-cancel-edit"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access commonly used admin features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <a href="/admin/security/settings">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/security/logs">
                  <Settings className="w-4 h-4 mr-2" />
                  Activity Logs
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/settings/general">
                  <Settings className="w-4 h-4 mr-2" />
                  Site Settings
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/accounts/users">
                  <User className="w-4 h-4 mr-2" />
                  Manage Users
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}