import { useState } from "react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, Plus, Settings, Lock, Globe, Crown } from "lucide-react";

interface CreateRoomData {
  name: string;
  description: string;
  category: string;
  maxUsers: number;
  isPrivate: boolean;
  requiresVerification: boolean;
  allowGuests: boolean;
  moderationLevel: string;
}

export default function AdminCreateRoomsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<CreateRoomData>({
    name: "",
    description: "",
    category: "general",
    maxUsers: 50,
    isPrivate: false,
    requiresVerification: false,
    allowGuests: true,
    moderationLevel: "standard"
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: CreateRoomData) => {
      console.log('Sending room creation request:', data);
      try {
        const response = await fetch('/api/admin/rooms/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Success response:', result);
        return result;
      } catch (error) {
        console.error('Request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Room created successfully:', data);
      toast({
        title: "Success",
        description: "Room created successfully!",
      });
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "general",
        maxUsers: 50,
        isPrivate: false,
        requiresVerification: false,
        allowGuests: true,
        moderationLevel: "standard"
      });
      // Invalidate rooms query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rooms'] });
    },
    onError: (error: any) => {
      console.error('Room creation failed:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }

    createRoomMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateRoomData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <AdminLayout
      title="Create Room"
      description="Create new rooms for your gaming portal"
    >
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter room name..."
                    data-testid="input-room-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
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
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter room description..."
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>

              {/* Room Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.maxUsers}
                    onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 50)}
                    data-testid="input-max-users"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moderationLevel">Moderation Level</Label>
                  <Select value={formData.moderationLevel} onValueChange={(value) => handleInputChange('moderationLevel', value)}>
                    <SelectTrigger data-testid="select-moderation">
                      <SelectValue placeholder="Select moderation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minimal moderation</SelectItem>
                      <SelectItem value="standard">Standard - Auto + manual moderation</SelectItem>
                      <SelectItem value="high">High - Strict moderation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Privacy & Access Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Privacy & Access Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private Room
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only invited users can join
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                      data-testid="switch-private"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Require Verification
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only verified users can join
                      </p>
                    </div>
                    <Switch
                      checked={formData.requiresVerification}
                      onCheckedChange={(checked) => handleInputChange('requiresVerification', checked)}
                      data-testid="switch-verification"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Allow Guests
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow unregistered users
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowGuests}
                      onCheckedChange={(checked) => handleInputChange('allowGuests', checked)}
                      data-testid="switch-guests"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createRoomMutation.isPending}
                  className="min-w-32"
                  data-testid="button-create-room"
                >
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Room Creation Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Best Practices:</h4>
                <ul className="space-y-1">
                  <li>• Use clear, descriptive room names</li>
                  <li>• Set appropriate maximum user limits</li>
                  <li>• Enable verification for premium content</li>
                  <li>• Use moderation levels wisely</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Room Categories:</h4>
                <ul className="space-y-1">
                  <li>• <strong>General:</strong> Open discussions</li>
                  <li>• <strong>Gaming:</strong> Game-specific rooms</li>
                  <li>• <strong>Music:</strong> Music listening parties</li>
                  <li>• <strong>Education:</strong> Learning sessions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}