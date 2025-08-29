import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, Edit, Trash2, Eye, EyeOff, GripVertical, Link as LinkIcon, Clock } from "lucide-react";
import AdminNavigation from "@/components/admin/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { HeroImage } from "@shared/schema";

const heroImageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imagePath: z.string().min(1, "Image is required"),
  linkUrl: z.string().url().optional().or(z.literal("")),
  linkText: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  displayDuration: z.number().min(1000).max(30000).default(5000)
});

type HeroImageFormData = z.infer<typeof heroImageSchema>;

export default function AdminHeroImages() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [draggedItem, setDraggedItem] = useState<HeroImage | null>(null);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch hero images
  const { data: heroImages = [], isLoading } = useQuery<HeroImage[]>({
    queryKey: ['/api/hero-images/admin'],
    retry: false
  });

  // Form setup
  const form = useForm<HeroImageFormData>({
    resolver: zodResolver(heroImageSchema),
    defaultValues: {
      title: "",
      description: "",
      imagePath: "",
      linkUrl: "",
      linkText: "",
      isActive: true,
      sortOrder: 0,
      displayDuration: 5000
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: HeroImageFormData) => {
      return await apiRequest('/api/hero-images', { method: 'POST', body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Hero image created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hero image",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HeroImageFormData> }) => {
      return await apiRequest(`/api/hero-images/${id}`, { method: 'PUT', body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      setIsDialogOpen(false);
      setEditingImage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Hero image updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hero image",
        variant: "destructive",
      });
    }
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/hero-images/${id}/toggle`, { method: 'PATCH', body: {} });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      toast({
        title: "Success",
        description: "Hero image status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/hero-images/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      toast({
        title: "Success",
        description: "Hero image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete hero image",
        variant: "destructive",
      });
    }
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (imageIds: number[]) => {
      return await apiRequest('/api/hero-images/reorder', { method: 'POST', body: { imageIds } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      toast({
        title: "Success",
        description: "Hero images reordered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder images",
        variant: "destructive",
      });
    }
  });

  // Set form values when editing
  useEffect(() => {
    if (editingImage) {
      form.reset({
        title: editingImage.title,
        description: editingImage.description || "",
        imagePath: editingImage.imagePath,
        linkUrl: editingImage.linkUrl || "",
        linkText: editingImage.linkText || "",
        isActive: editingImage.isActive,
        sortOrder: editingImage.sortOrder,
        displayDuration: editingImage.displayDuration
      });
    } else {
      form.reset({
        title: "",
        description: "",
        imagePath: "",
        linkUrl: "",
        linkText: "",
        isActive: true,
        sortOrder: heroImages.length,
        displayDuration: 5000
      });
    }
  }, [editingImage, form, heroImages.length]);

  const onSubmit = (data: HeroImageFormData) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (image: HeroImage) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this hero image?")) {
      deleteMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setEditingImage(null);
    setIsDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, image: HeroImage) => {
    setDraggedItem(image);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOver(index);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDraggedOver(null);
    
    if (!draggedItem) return;
    
    const currentIndex = heroImages.findIndex(img => img.id === draggedItem.id);
    if (currentIndex === targetIndex) return;
    
    const reorderedImages = [...heroImages];
    const [movedItem] = reorderedImages.splice(currentIndex, 1);
    reorderedImages.splice(targetIndex, 0, movedItem);
    
    const imageIds = reorderedImages.map(img => img.id);
    reorderMutation.mutate(imageIds);
    
    setDraggedItem(null);
  };

  // File upload handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      toast({
        title: "Error", 
        description: "Image must be smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get upload parameters
      const response = await apiRequest("/api/objects/upload", { method: "POST" });
      
      // Upload file directly
      const uploadResponse = await fetch(response.uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        // Set the uploaded image URL to the form
        form.setValue('imagePath', response.uploadURL);
        toast({
          title: "Success",
          description: "Hero image uploaded successfully"
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading hero images...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-8">
        <div className="space-y-6" data-testid="admin-hero-images">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hero Images</h1>
              <p className="text-muted-foreground mt-2">
                Manage slider images for the hero section to create an engaging homepage experience.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openDialog} data-testid="button-add-hero-image">
              <Plus className="mr-2 h-4 w-4" />
              Add Hero Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Hero Image" : "Add New Hero Image"}
              </DialogTitle>
              <DialogDescription>
                {editingImage 
                  ? "Update the hero image details and settings."
                  : "Add a new image to the hero section slider."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter image title" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter image description" data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imagePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {/* Upload Button */}
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="hero-image-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => document.getElementById('hero-image-upload')?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Hero Image
                            </Button>
                          </div>
                          
                          {/* Image Preview */}
                          {field.value && (
                            <div className="relative">
                              <img 
                                src={field.value} 
                                alt="Hero image preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => form.setValue('imagePath', '')}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                          
                          {/* Manual URL Input */}
                          <Input 
                            placeholder="Or paste image URL here" 
                            {...field} 
                            data-testid="input-image-path"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." data-testid="input-link-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Learn More" data-testid="input-link-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="displayDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Duration (ms)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            min={1000}
                            max={30000}
                            data-testid="input-display-duration"
                          />
                        </FormControl>
                        <FormDescription>
                          Time in milliseconds to show this image (1000-30000)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Show this image in the hero slider
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-is-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-hero-image"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editingImage ? "Update Image" : "Create Image"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {heroImages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 text-muted-foreground">
                  📷
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No hero images yet</h3>
                  <p className="text-muted-foreground">
                    Get started by adding your first hero image to create an engaging homepage slider.
                  </p>
                </div>
                <Button onClick={openDialog} data-testid="button-add-first-hero-image">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Hero Image
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          heroImages.map((image, index) => (
            <Card
              key={image.id}
              className={`transition-all duration-200 ${
                draggedOver === index ? 'border-primary shadow-md' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, image)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              data-testid={`card-hero-image-${image.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="cursor-move">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {image.imagePath ? (
                      <img
                        src={image.imagePath}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        📷
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{image.title}</h3>
                      <Badge variant={image.isActive ? "default" : "secondary"}>
                        {image.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {image.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {image.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {image.linkUrl && (
                        <div className="flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          <span>Has Link</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{image.displayDuration / 1000}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate(image.id)}
                      disabled={toggleMutation.isPending}
                      data-testid={`button-toggle-${image.id}`}
                    >
                      {image.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(image)}
                      data-testid={`button-edit-${image.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${image.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      </div>
        </div>
    </div>
  );
}