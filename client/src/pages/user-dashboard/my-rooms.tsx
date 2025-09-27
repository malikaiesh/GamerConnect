import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Settings, Users, Lock, Globe, Edit, Trash2, Eye, Crown, Play, Clock, MapPin, MessageCircle, Mic, Gift, Upload, ImageIcon, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
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

interface Room {
  room: {
    id: number;
    roomId: string;
    name: string;
    description: string | null;
    type: "public" | "private";
    status: "active" | "inactive" | "maintenance";
    maxSeats: number;
    currentUsers: number;
    category: string;
    country: string | null;
    language: string;
    isLocked: boolean;
    isFeatured: boolean;
    voiceChatEnabled: boolean;
    textChatEnabled: boolean;
    giftsEnabled: boolean;
    backgroundTheme: string;
    bannerImage: string | null;
    tags: string[];
    totalVisits: number;
    totalGiftsReceived: number;
    totalGiftValue: number;
    createdAt: string;
    lastActivity: string;
  };
  userCount: number;
}

const roomFormSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters").max(50, "Room name must be less than 50 characters"),
  description: z.string().optional(),
  type: z.enum(["public", "private"]),
  password: z.string().optional(),
  maxSeats: z.number().min(2, "Minimum 2 seats").max(20, "Maximum 20 seats"),
  category: z.string().min(1, "Please select a category"),
  country: z.string().optional(),
  language: z.string().default("en"),
  voiceChatEnabled: z.boolean().default(true),
  textChatEnabled: z.boolean().default(true),
  giftsEnabled: z.boolean().default(true),
  backgroundTheme: z.string().default("lunexa"),
  bannerImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

export default function MyRoomsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "public",
      password: "",
      maxSeats: 5, // Default to 5 seats (free tier limit)
      category: "general",
      country: "",
      language: "en",
      voiceChatEnabled: true,
      textChatEnabled: true,
      giftsEnabled: true,
      backgroundTheme: "lunexa",
      bannerImage: "",
      tags: [],
    },
  });

  // Fetch user's rooms
  const { data: rooms, isLoading, error } = useQuery<Room[]>({
    queryKey: ["/api/rooms/my-rooms"],
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: (data: RoomFormData) => apiRequest("/api/rooms", { method: "POST", body: data }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room created successfully",
      });
      setIsCreateModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: (error: any) => {
      // Check for payment required error (402 status)
      if (error.status === 402 || error.message?.includes('Payment required')) {
        // Check if we have pricing information
        const pricing = error.pricing;
        
        if (pricing) {
          // Show detailed pricing breakdown
          const totalCost = (pricing.totalCost / 100).toFixed(2);
          const breakdown = pricing.costBreakdown.description.join(", ");
          
          toast({
            title: "Payment Required",
            description: `Total cost: $${totalCost} (${breakdown})`,
            variant: "destructive",
          });
          
          // Store payment data for checkout (we'll create checkout page later)
          const paymentData = {
            roomData: form.getValues(),
            pricing: pricing
          };
          localStorage.setItem('roomPaymentData', JSON.stringify(paymentData));
          
          // Redirect to checkout page
          setTimeout(() => {
            navigate('/checkout-room');
          }, 2000);
        } else {
          toast({
            title: "Upgrade Required",
            description: "You have used your free room. Upgrade to create more rooms.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/pricing-plans');
          }, 1500);
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create room",
          variant: "destructive",
        });
      }
    },
  });

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: ({ roomId, updates }: { roomId: string; updates: Partial<RoomFormData> }) => 
      apiRequest(`/api/rooms/${roomId}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedRoom(null);
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
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
    mutationFn: (roomId: string) => apiRequest(`/api/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateRoom = (data: RoomFormData) => {
    createRoomMutation.mutate(data);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    form.reset({
      name: room.room.name,
      description: room.room.description || "",
      type: room.room.type,
      maxSeats: room.room.maxSeats,
      category: room.room.category,
      country: room.room.country || "",
      language: room.room.language,
      voiceChatEnabled: room.room.voiceChatEnabled,
      textChatEnabled: room.room.textChatEnabled,
      giftsEnabled: room.room.giftsEnabled,
      backgroundTheme: room.room.backgroundTheme,
      bannerImage: room.room.bannerImage || "",
      tags: room.room.tags || [],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateRoom = (data: RoomFormData) => {
    if (!selectedRoom) return;
    updateRoomMutation.mutate({ roomId: selectedRoom.room.roomId, updates: data });
  };

  const handleDeleteRoom = (roomId: string) => {
    deleteRoomMutation.mutate(roomId);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.getValues().tags.includes(tagInput.trim())) {
      const currentTags = form.getValues().tags;
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
      
      // Keep focus on input after adding tag
      setTimeout(() => {
        const tagInput = document.querySelector('[data-testid="input-tags"]') as HTMLInputElement;
        if (tagInput) {
          tagInput.focus();
        }
      }, 50);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues().tags;
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border border-primary/20";
      case "inactive":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      case "maintenance":
        return "bg-muted text-muted-foreground border border-border";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'ocean':
        return 'from-primary/80 via-primary to-primary/60';
      case 'sunset':
        return 'from-primary/70 via-accent/80 to-primary/90';
      case 'forest':
        return 'from-primary/60 via-primary/80 to-primary';
      case 'purple':
        return 'from-primary via-primary/80 to-accent/70';
      case 'galaxy':
        return 'from-primary/90 via-accent/60 to-primary/70';
      case 'lunexa':
        return 'from-purple-600 via-indigo-600 to-purple-800';
      default:
        return 'from-primary via-primary/80 to-accent/60';
    }
  };

  // Image Upload Component
  const ImageUploadField = ({ value, onChange, ...props }: { 
    value: string; 
    onChange: (value: string) => void;
    [key: string]: any;
  }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error", 
          description: "Image size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        onChange(result.location);
        
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = () => {
      setDragActive(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    };

    const removeImage = () => {
      onChange("");
    };

    return (
      <div className="space-y-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Room banner"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
              data-testid="remove-image"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading..." : "Drop an image here or"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  disabled={isUploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  data-testid="upload-image-button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB. Recommended: 1920x1080
              </p>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    );
  };

  const RoomForm = ({ onSubmit, isPending }: { onSubmit: (data: RoomFormData) => void; isPending: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" style={{ position: 'relative' }}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter room name" {...field} data-testid="input-room-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea placeholder="Describe your room..." {...field} data-testid="textarea-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Room Banner Image Upload */}
        <FormField
          control={form.control}
          name="bannerImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Featured Image</FormLabel>
              <FormDescription>
                Upload an image to represent your room (recommended: 1920x1080 or 16:9 ratio)
              </FormDescription>
              <FormControl>
                <ImageUploadField
                  value={field.value || ""}
                  onChange={field.onChange}
                  data-testid="upload-banner-image"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Seats</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={2} 
                    max={20} 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    data-testid="input-max-seats" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("type") === "private" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter room password" {...field} data-testid="input-password" />
                </FormControl>
                <FormDescription>Required for private rooms</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <Label>Room Features</Label>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="voiceChatEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Voice Chat</FormLabel>
                    <FormDescription>Enable voice communication</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-voice-chat" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="textChatEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Text Chat</FormLabel>
                    <FormDescription>Enable text messaging</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-text-chat" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="giftsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Gifts</FormLabel>
                    <FormDescription>Allow gift sending</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-gifts" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              onInput={(e) => {
                // Don't prevent default for onInput - this breaks typing
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onFocus={(e) => {
                e.stopPropagation();
                // Prevent automatic scrolling
                const currentScrollTop = e.target.closest('[role="dialog"]')?.scrollTop;
                setTimeout(() => {
                  const dialog = e.target.closest('[role="dialog"]');
                  if (dialog && currentScrollTop !== undefined) {
                    dialog.scrollTop = currentScrollTop;
                  }
                }, 0);
              }}
              data-testid="input-tags"
            />
            <Button type="button" onClick={addTag} data-testid="button-add-tag">Add</Button>
          </div>
          {form.watch("tags").length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.watch("tags").map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-xs hover:text-red-500"
                    data-testid={`button-remove-tag-${tag}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isPending} data-testid="button-submit">
            {isPending ? "Creating..." : selectedRoom ? "Update Room" : "Create Room"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">My Rooms</h1>
          <p className="text-muted-foreground">
            Create and manage your rooms, customize settings, and monitor activity.
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-room">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ 
              scrollBehavior: 'auto',
              overscrollBehavior: 'contain',
              overflowAnchor: 'none'
            }}
            onScroll={(e) => {
              // Prevent unwanted scroll events from propagating
              e.stopPropagation();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>
                Set up your room with custom settings and features.
              </DialogDescription>
            </DialogHeader>
            <RoomForm onSubmit={handleCreateRoom} isPending={createRoomMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading your rooms...</div>
        </div>
      ) : error ? (
        <Card data-testid="card-error-state">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Lock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center mb-4">
              Please log in to view and manage your rooms.
            </p>
            <Button onClick={() => navigate('/auth')} data-testid="button-login">
              <Users className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </CardContent>
        </Card>
      ) : !rooms?.length ? (
        <Card data-testid="card-empty-state">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No rooms created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first room to start building your community and connecting with others.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-room">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.room.id} className="overflow-hidden group hover:shadow-lg transition-all duration-200" data-testid={`card-room-${room.room.id}`}>
              {/* Room Header with visual elements */}
              <div className="relative">
                <div className={`h-20 bg-gradient-to-br ${getThemeGradient(room.room.backgroundTheme)} flex items-center justify-center`}>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Badge className={`absolute top-2 right-2 ${getStatusColor(room.room.status)}`}>
                  {room.room.status}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {room.room.type === 'public' ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    {room.room.name}
                  </CardTitle>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  ID: {room.room.roomId}
                </div>
                {room.room.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{room.room.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Room Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{room.userCount}/{room.room.maxSeats}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{room.room.totalVisits}</div>
                      <div className="text-xs text-muted-foreground">Visits</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex gap-2">
                  {room.room.voiceChatEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Mic className="w-3 h-3 mr-1" />
                      Voice
                    </Badge>
                  )}
                  {room.room.textChatEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Text
                    </Badge>
                  )}
                  {room.room.giftsEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Gift className="w-3 h-3 mr-1" />
                      Gifts
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {room.room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.room.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {room.room.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.room.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Activity */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Active {formatDistanceToNow(new Date(room.room.lastActivity))} ago
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/room/${room.room.roomId}`)}
                    data-testid={`button-enter-${room.room.id}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Enter Room
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRoom(room)}
                    data-testid={`button-edit-${room.room.id}`}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-delete-${room.room.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Room</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{room.room.name}"? This action cannot be undone.
                          All room data and messages will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRoom(room.room.roomId)}
                          className="bg-destructive hover:bg-destructive/90"
                          data-testid={`button-confirm-delete-${room.room.id}`}
                        >
                          Delete Room
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Room Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update your room settings and features.
            </DialogDescription>
          </DialogHeader>
          <RoomForm onSubmit={handleUpdateRoom} isPending={updateRoomMutation.isPending} />
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}