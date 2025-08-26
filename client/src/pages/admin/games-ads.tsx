import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AdminNavigation } from '@/components/admin/admin-navigation';
import { GameAd, InsertGameAd } from '@shared/schema';
import { Trash2, Edit, Plus, BarChart3, FileText, Eye, MousePointer, Calendar, Target } from 'lucide-react';

const gameAdPositions = [
  { value: 'above_game', label: 'Above Game' },
  { value: 'below_game', label: 'Below Game' },
  { value: 'sidebar_top', label: 'Sidebar Top' },
  { value: 'sidebar_bottom', label: 'Sidebar Bottom' },
  { value: 'between_related', label: 'Between Related Games' },
  { value: 'header_banner', label: 'Header Banner' },
  { value: 'footer_banner', label: 'Footer Banner' }
];

const gameAdSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  position: z.string().min(1, 'Position is required'),
  adCode: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  targetUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isGoogleAd: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  adEnabled: z.boolean().optional()
}).refine(
  (data) => {
    if (data.isGoogleAd) {
      return !!data.adCode;
    }
    return (data.imageUrl && data.targetUrl) || data.adCode;
  },
  {
    message: "For Google ads, ad code is required. For regular ads, either provide image URL + target URL or ad code.",
    path: ["adCode"]
  }
);

type GameAdFormData = z.infer<typeof gameAdSchema>;

export default function GamesAdsPage() {
  const [selectedAd, setSelectedAd] = useState<GameAd | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GameAdFormData>({
    resolver: zodResolver(gameAdSchema),
    defaultValues: {
      name: '',
      position: '',
      adCode: '',
      imageUrl: '',
      targetUrl: '',
      startDate: '',
      endDate: '',
      isGoogleAd: false,
      status: 'active',
      adEnabled: true
    }
  });

  const { data: gameAds = [], isLoading } = useQuery({
    queryKey: ['/api/game-ads'],
  });

  const createGameAdMutation = useMutation({
    mutationFn: async (data: GameAdFormData) => {
      return apiRequest('/api/game-ads', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Game ad created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create game ad: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateGameAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GameAdFormData> }) => {
      return apiRequest(`/api/game-ads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      setIsDialogOpen(false);
      setSelectedAd(null);
      form.reset();
      toast({
        title: "Success",
        description: "Game ad updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update game ad: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteGameAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/game-ads/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      toast({
        title: "Success",
        description: "Game ad deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete game ad: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const toggleGameAdMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      return apiRequest(`/api/game-ads/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      toast({
        title: "Success",
        description: "Game ad status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update game ad status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCreateAd = () => {
    setIsCreateMode(true);
    setSelectedAd(null);
    form.reset({
      name: '',
      position: '',
      adCode: '',
      imageUrl: '',
      targetUrl: '',
      startDate: '',
      endDate: '',
      isGoogleAd: false,
      status: 'active',
      adEnabled: true
    });
    setIsDialogOpen(true);
  };

  const handleEditAd = (ad: GameAd) => {
    setIsCreateMode(false);
    setSelectedAd(ad);
    form.reset({
      name: ad.name,
      position: ad.position,
      adCode: ad.adCode || '',
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl || '',
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      isGoogleAd: ad.isGoogleAd,
      status: ad.status,
      adEnabled: ad.adEnabled
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: GameAdFormData) => {
    const submitData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    };

    if (isCreateMode) {
      createGameAdMutation.mutate(submitData);
    } else if (selectedAd) {
      updateGameAdMutation.mutate({ id: selectedAd.id, data: submitData });
    }
  };

  const handleDeleteAd = (id: number) => {
    if (confirm('Are you sure you want to delete this game ad?')) {
      deleteGameAdMutation.mutate(id);
    }
  };

  const handleToggleAd = (ad: GameAd) => {
    toggleGameAdMutation.mutate({ id: ad.id, enabled: !ad.adEnabled });
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getPositionLabel = (position: string) => {
    const pos = gameAdPositions.find(p => p.value === position);
    return pos?.label || position;
  };

  const isGoogleAd = form.watch('isGoogleAd');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading game ads...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-testid="games-ads-page">
      <AdminNavigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Games Ads Management</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage advertisements displayed on game pages with strategic placement options
              </p>
            </div>
            <Button onClick={handleCreateAd} data-testid="button-create-game-ad">
              <Plus className="w-4 h-4 mr-2" />
              Create Game Ad
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white dark:bg-gray-800">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                All Ads
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6">
                {gameAds.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No game ads yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create your first game ad to start displaying advertisements on game pages.
                      </p>
                      <Button onClick={handleCreateAd} data-testid="button-create-first-game-ad">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Game Ad
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  gameAds.map((ad: GameAd) => (
                    <Card key={ad.id} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl" data-testid={`text-ad-name-${ad.id}`}>
                                {ad.name}
                              </CardTitle>
                              <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                                {ad.status}
                              </Badge>
                              <Badge variant={ad.adEnabled ? 'default' : 'destructive'}>
                                {ad.adEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                              {ad.isGoogleAd && (
                                <Badge variant="outline">Google Ad</Badge>
                              )}
                            </div>
                            <CardDescription>
                              Position: {getPositionLabel(ad.position)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={ad.adEnabled}
                              onCheckedChange={() => handleToggleAd(ad)}
                              data-testid={`switch-enable-ad-${ad.id}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAd(ad)}
                              data-testid={`button-edit-ad-${ad.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAd(ad.id)}
                              data-testid={`button-delete-ad-${ad.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Eye className="w-4 h-4" />
                              <span>Impressions: {ad.impressionCount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MousePointer className="w-4 h-4" />
                              <span>Clicks: {ad.clickCount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {formatDate(ad.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>End: {formatDate(ad.endDate)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {ad.imageUrl && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span>Image URL: </span>
                                <a href={ad.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Image
                                </a>
                              </div>
                            )}
                            {ad.targetUrl && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span>Target URL: </span>
                                <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {ad.targetUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        {ad.adCode && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Code:</p>
                            <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
                              {ad.adCode.length > 100 ? `${ad.adCode.substring(0, 100)}...` : ad.adCode}
                            </code>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gameAds.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {gameAds.filter((ad: GameAd) => ad.adEnabled && ad.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {gameAds.reduce((total: number, ad: GameAd) => total + ad.impressionCount, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {gameAds.reduce((total: number, ad: GameAd) => total + ad.clickCount, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isCreateMode ? 'Create New Game Ad' : 'Edit Game Ad'}
                </DialogTitle>
                <DialogDescription>
                  {isCreateMode 
                    ? 'Create a new advertisement to display on game pages.' 
                    : 'Update the advertisement details.'
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ad name" {...field} data-testid="input-ad-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ad-position">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gameAdPositions.map((position) => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isGoogleAd"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Google Ad</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable if this is a Google AdSense advertisement
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-is-google-ad"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isGoogleAd ? 'Google Ad Code (Required)' : 'Ad Code (Optional)'}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter ad code/script"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-ad-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isGoogleAd && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-image-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} data-testid="input-target-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-end-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ad-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="adEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enabled</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Show this ad on the website
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-ad-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createGameAdMutation.isPending || updateGameAdMutation.isPending}
                      data-testid="button-save-game-ad"
                    >
                      {createGameAdMutation.isPending || updateGameAdMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}