import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminNavigation from "@/components/admin/navigation";
import { apiRequest } from "@/lib/queryClient";
import { formatDistance } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Upload,
  Diamond,
  Sparkles,
  Heart,
  Star,
  Search,
  Filter,
  Download,
  Settings,
  Activity,
} from "lucide-react";

interface GiftData {
  id: number;
  name: string;
  description?: string;
  type: 'basic' | 'premium' | 'exclusive' | 'special' | 'animated';
  image: string;
  animation: 'default' | 'bounce' | 'pulse' | 'glow' | 'float' | 'spin' | 'zoom';
  price: number;
  category: 'general' | 'love' | 'celebration' | 'friendship' | 'appreciation' | 'seasonal' | 'luxury';
  isActive: boolean;
  isLimited: boolean;
  limitedQuantity?: number;
  availableFrom?: string;
  availableUntil?: string;
  hasSound: boolean;
  soundFile?: string;
  hasAnimation: boolean;
  animationDuration: number;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const giftFormSchema = z.object({
  name: z.string().min(1, "Gift name is required").max(100, "Name too long"),
  description: z.string().optional(),
  type: z.enum(['basic', 'premium', 'exclusive', 'special', 'animated']),
  image: z.string().min(1, "Gift image is required"),
  animation: z.enum(['default', 'bounce', 'pulse', 'glow', 'float', 'spin', 'zoom']),
  price: z.number().min(1, "Price must be at least 1 diamond").max(1000000, "Price too high"),
  category: z.enum(['general', 'love', 'celebration', 'friendship', 'appreciation', 'seasonal', 'luxury']),
  isActive: z.boolean(),
  isLimited: z.boolean(),
  limitedQuantity: z.number().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  hasSound: z.boolean(),
  soundFile: z.string().optional(),
  hasAnimation: z.boolean(),
  animationDuration: z.number().min(1).max(10),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().min(0).max(999),
});

type GiftFormData = z.infer<typeof giftFormSchema>;

export default function GiftsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [animationFilter, setAnimationFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GiftFormData>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "basic",
      image: "",
      animation: "default",
      price: 10,
      category: "general",
      isActive: true,
      isLimited: false,
      hasSound: false,
      hasAnimation: true,
      animationDuration: 3,
      tags: [],
      sortOrder: 0,
    },
  });

  // Fetch gifts with admin filters
  const { data: giftsData, isLoading } = useQuery({
    queryKey: ['/api/gifts/admin', { 
      page, 
      search: searchTerm, 
      category: categoryFilter,
      type: typeFilter,
      status: statusFilter,
      animation: animationFilter
    }],
    queryFn: () => apiRequest('GET', `/api/gifts/admin?page=${page}&search=${searchTerm}&category=${categoryFilter}&type=${typeFilter}&status=${statusFilter}&animation=${animationFilter}`),
  });

  // Create gift mutation
  const createGiftMutation = useMutation({
    mutationFn: (giftData: GiftFormData) => apiRequest('POST', '/api/gifts', giftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifts/admin'] });
      setIsCreateDialogOpen(false);
      form.reset();
      setUploadedImageUrl("");
      toast({
        title: "Success",
        description: "Gift created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gift",
        variant: "destructive",
      });
    },
  });

  // Update gift mutation
  const updateGiftMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GiftFormData }) => 
      apiRequest('PUT', `/api/gifts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifts/admin'] });
      setIsEditDialogOpen(false);
      setSelectedGift(null);
      form.reset();
      setUploadedImageUrl("");
      toast({
        title: "Success",
        description: "Gift updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update gift",
        variant: "destructive",
      });
    },
  });

  // Delete gift mutation
  const deleteGiftMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/gifts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifts/admin'] });
      toast({
        title: "Success",
        description: "Gift deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete gift",
        variant: "destructive",
      });
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, giftIds }: { action: string; giftIds: number[] }) =>
      apiRequest('POST', '/api/gifts/bulk-action', { action, giftIds }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifts/admin'] });
      setSelectedGifts([]);
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform bulk action",
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/gifts/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadedImageUrl(result.imagePath);
      form.setValue('image', result.imagePath);
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = (data: GiftFormData) => {
    if (selectedGift) {
      updateGiftMutation.mutate({ id: selectedGift.id, data });
    } else {
      createGiftMutation.mutate(data);
    }
  };

  // Handle edit gift
  const handleEditGift = (gift: GiftData) => {
    setSelectedGift(gift);
    form.reset({
      name: gift.name,
      description: gift.description,
      type: gift.type,
      image: gift.image,
      animation: gift.animation,
      price: gift.price,
      category: gift.category,
      isActive: gift.isActive,
      isLimited: gift.isLimited,
      limitedQuantity: gift.limitedQuantity,
      availableFrom: gift.availableFrom,
      availableUntil: gift.availableUntil,
      hasSound: gift.hasSound,
      soundFile: gift.soundFile,
      hasAnimation: gift.hasAnimation,
      animationDuration: gift.animationDuration,
      tags: gift.tags,
      sortOrder: gift.sortOrder,
    });
    setUploadedImageUrl(gift.image);
    setIsEditDialogOpen(true);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedGifts.length === 0) return;
    
    const actionText = action === 'delete' ? 'delete' : `${action} selected`;
    const confirmMessage = `Are you sure you want to ${actionText} ${selectedGifts.length} gift(s)?`;
    
    if (confirm(confirmMessage)) {
      bulkActionMutation.mutate({ action, giftIds: selectedGifts });
    }
  };

  const gifts = giftsData?.gifts || [];
  const stats = giftsData?.stats || {};
  const pagination = giftsData?.pagination || {};

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Gifts Management</h1>
          <p className="text-muted-foreground">
            Manage virtual gifts, set diamond prices, and upload gift images for the room gifting system.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-total-gifts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-gifts">{stats.totalGifts || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-gifts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Gifts</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-gifts">{stats.activeGifts || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-limited-gifts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Limited Gifts</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-limited-gifts">{stats.limitedGifts || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-categories">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-categories">{stats.categoriesCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search gifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
              data-testid="input-search"
            />
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="love">Love</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="friendship">Friendship</SelectItem>
                <SelectItem value="appreciation">Appreciation</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
                <SelectItem value="special">Special</SelectItem>
                <SelectItem value="animated">Animated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:max-w-xs" data-testid="select-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {selectedGifts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-testid="button-bulk-actions">
                    Bulk Actions ({selectedGifts.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-gift">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Gift
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Gifts Table */}
        <Card data-testid="card-gifts-table">
          <CardHeader>
            <CardTitle>All Gifts</CardTitle>
            <CardDescription>
              Manage your virtual gifts, set prices, and configure availability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedGifts.length === gifts.length && gifts.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGifts(gifts.map((gift: GiftData) => gift.id));
                          } else {
                            setSelectedGifts([]);
                          }
                        }}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Gift</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gifts.map((gift: GiftData) => (
                    <TableRow key={gift.id} data-testid={`row-gift-${gift.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGifts.includes(gift.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGifts([...selectedGifts, gift.id]);
                            } else {
                              setSelectedGifts(selectedGifts.filter(id => id !== gift.id));
                            }
                          }}
                          data-testid={`checkbox-select-${gift.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {gift.image ? (
                              <img 
                                src={gift.image.startsWith('/') ? `/public-objects${gift.image}` : gift.image} 
                                alt={gift.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Gift className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium" data-testid={`text-gift-name-${gift.id}`}>
                              {gift.name}
                            </div>
                            {gift.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {gift.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={gift.type === 'premium' ? 'default' : 'secondary'}
                          data-testid={`badge-type-${gift.id}`}
                        >
                          {gift.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`badge-category-${gift.id}`}>
                          {gift.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Diamond className="h-4 w-4 text-blue-500" />
                          <span className="font-medium" data-testid={`text-price-${gift.id}`}>
                            {gift.price}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge 
                            variant={gift.isActive ? 'default' : 'secondary'}
                            data-testid={`badge-status-${gift.id}`}
                          >
                            {gift.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {gift.isLimited && (
                            <Badge variant="destructive" data-testid={`badge-limited-${gift.id}`}>
                              Limited
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-created-${gift.id}`}>
                        {formatDistance(new Date(gift.createdAt), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-actions-${gift.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditGift(gift)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteGiftMutation.mutate(gift.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {gifts.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No gifts found</h3>
                <p className="text-muted-foreground">Get started by creating your first virtual gift.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} gifts
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Gift Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedGift(null);
            form.reset();
            setUploadedImageUrl("");
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedGift ? 'Edit Gift' : 'Create New Gift'}
              </DialogTitle>
              <DialogDescription>
                {selectedGift ? 'Update gift details and settings.' : 'Add a new virtual gift to your collection.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Gift Name *</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="Enter gift name"
                      data-testid="input-gift-name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Enter gift description"
                      data-testid="textarea-gift-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as any)}>
                        <SelectTrigger data-testid="select-gift-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="exclusive">Exclusive</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                          <SelectItem value="animated">Animated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value as any)}>
                        <SelectTrigger data-testid="select-gift-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="love">Love</SelectItem>
                          <SelectItem value="celebration">Celebration</SelectItem>
                          <SelectItem value="friendship">Friendship</SelectItem>
                          <SelectItem value="appreciation">Appreciation</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Diamond Price *</Label>
                      <div className="flex items-center space-x-2">
                        <Diamond className="h-4 w-4 text-blue-500" />
                        <Input
                          id="price"
                          type="number"
                          {...form.register('price', { valueAsNumber: true })}
                          placeholder="10"
                          min="1"
                          max="1000000"
                          data-testid="input-gift-price"
                        />
                      </div>
                      {form.formState.errors.price && (
                        <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        {...form.register('sortOrder', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        max="999"
                        data-testid="input-sort-order"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload and Preview */}
                <div className="space-y-4">
                  <div>
                    <Label>Gift Image *</Label>
                    <div className="mt-2">
                      {uploadedImageUrl ? (
                        <div className="space-y-4">
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mx-auto">
                            <img 
                              src={uploadedImageUrl.startsWith('/') ? `/public-objects${uploadedImageUrl}` : uploadedImageUrl}
                              alt="Gift preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadedImageUrl("");
                              form.setValue('image', "");
                            }}
                            data-testid="button-remove-image"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "Error",
                                    description: "File size must be less than 5MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                handleImageUpload(file);
                              }
                            }}
                            className="hidden"
                            id="gift-image-upload"
                            data-testid="input-gift-image"
                          />
                          <label
                            htmlFor="gift-image-upload"
                            className="flex flex-col items-center space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-4 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm">Upload Gift Image</span>
                            <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                          </label>
                        </div>
                      )}
                    </div>
                    {form.formState.errors.image && (
                      <p className="text-sm text-red-600">{form.formState.errors.image.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={form.watch('isActive')}
                        onCheckedChange={(checked) => form.setValue('isActive', checked)}
                        data-testid="switch-is-active"
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isLimited"
                        checked={form.watch('isLimited')}
                        onCheckedChange={(checked) => form.setValue('isLimited', checked)}
                        data-testid="switch-is-limited"
                      />
                      <Label htmlFor="isLimited">Limited Quantity</Label>
                    </div>

                    {form.watch('isLimited') && (
                      <div>
                        <Label htmlFor="limitedQuantity">Available Quantity</Label>
                        <Input
                          id="limitedQuantity"
                          type="number"
                          {...form.register('limitedQuantity', { valueAsNumber: true })}
                          placeholder="100"
                          min="1"
                          data-testid="input-limited-quantity"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasAnimation"
                        checked={form.watch('hasAnimation')}
                        onCheckedChange={(checked) => form.setValue('hasAnimation', checked)}
                        data-testid="switch-has-animation"
                      />
                      <Label htmlFor="hasAnimation">Enable Animation</Label>
                    </div>

                    {form.watch('hasAnimation') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="animation">Animation Type</Label>
                          <Select value={form.watch('animation')} onValueChange={(value) => form.setValue('animation', value as any)}>
                            <SelectTrigger data-testid="select-animation">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="bounce">Bounce</SelectItem>
                              <SelectItem value="pulse">Pulse</SelectItem>
                              <SelectItem value="glow">Glow</SelectItem>
                              <SelectItem value="float">Float</SelectItem>
                              <SelectItem value="spin">Spin</SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="animationDuration">Duration (seconds)</Label>
                          <Input
                            id="animationDuration"
                            type="number"
                            {...form.register('animationDuration', { valueAsNumber: true })}
                            placeholder="3"
                            min="1"
                            max="10"
                            data-testid="input-animation-duration"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasSound"
                        checked={form.watch('hasSound')}
                        onCheckedChange={(checked) => form.setValue('hasSound', checked)}
                        data-testid="switch-has-sound"
                      />
                      <Label htmlFor="hasSound">Enable Sound</Label>
                    </div>

                    {form.watch('hasSound') && (
                      <div>
                        <Label htmlFor="soundFile">Sound File URL</Label>
                        <Input
                          id="soundFile"
                          {...form.register('soundFile')}
                          placeholder="https://example.com/sound.mp3"
                          data-testid="input-sound-file"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="availableFrom">Available From</Label>
                        <Input
                          id="availableFrom"
                          type="datetime-local"
                          {...form.register('availableFrom')}
                          data-testid="input-available-from"
                        />
                      </div>

                      <div>
                        <Label htmlFor="availableUntil">Available Until</Label>
                        <Input
                          id="availableUntil"
                          type="datetime-local"
                          {...form.register('availableUntil')}
                          data-testid="input-available-until"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedGift(null);
                    form.reset();
                    setUploadedImageUrl("");
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGiftMutation.isPending || updateGiftMutation.isPending}
                  data-testid="button-save-gift"
                >
                  {createGiftMutation.isPending || updateGiftMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    selectedGift ? 'Update Gift' : 'Create Gift'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}