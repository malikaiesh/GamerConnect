import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Calendar
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminNavigation from "@/components/admin/navigation";
import type { GameAd } from "@shared/schema";
import { insertGameAdSchema } from "@shared/schema";

const gameAdPositions = [
  { value: 'above_game', label: 'Above Game' },
  { value: 'below_game', label: 'Below Game' },
  { value: 'above_related', label: 'Above Related Games' },
  { value: 'below_related', label: 'Below Related Games' },
  { value: 'sidebar_top', label: 'Sidebar Top' },
  { value: 'sidebar_bottom', label: 'Sidebar Bottom' }
];

// Custom form schema that handles string dates for HTML inputs
const gameAdFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  position: z.enum(['above_game', 'below_game', 'above_related', 'below_related', 'sidebar_top', 'sidebar_bottom']),
  isGoogleAd: z.boolean().default(false),
  adCode: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  targetUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  adEnabled: z.boolean().default(true)
}).refine(
  (data) => {
    // If it's Google Ad, adCode is required
    if (data.isGoogleAd) {
      return !!(data.adCode && data.adCode.trim().length > 0);
    }
    // If not Google Ad, either imageUrl+targetUrl or adCode must be provided
    return (
      (!!data.imageUrl && !!data.targetUrl) || 
      (!!data.adCode && data.adCode.trim().length > 0)
    );
  },
  {
    message: "For Google Ads provide Ad Code. For custom ads provide either Ad Code or both Image URL and Target URL",
    path: ["adCode"]
  }
);

type GameAdFormData = z.infer<typeof gameAdFormSchema>;

export default function GameAdsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<GameAd | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const { toast } = useToast();

  const form = useForm<GameAdFormData>({
    resolver: zodResolver(gameAdFormSchema),
    defaultValues: {
      name: "",
      position: "above_game",
      isGoogleAd: false,
      adCode: "",
      imageUrl: null,
      targetUrl: null,
      startDate: null,
      endDate: null,
      status: "active",
      adEnabled: true
    }
  });

  const isGoogleAd = form.watch("isGoogleAd");

  // Fetch game ads
  const { data: gameAds = [], isLoading } = useQuery<GameAd[]>({
    queryKey: ['/api/game-ads']
  });

  // Create game ad mutation
  const createGameAdMutation = useMutation({
    mutationFn: async (data: GameAdFormData) => {
      return await apiRequest('/api/game-ads', {
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
        description: "Game ad created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game ad",
        variant: "destructive"
      });
    }
  });

  // Update game ad mutation
  const updateGameAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GameAdFormData }) => {
      return await apiRequest(`/api/game-ads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      setIsDialogOpen(false);
      form.reset();
      setEditingAd(null);
      toast({
        title: "Success",
        description: "Game ad updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update game ad",
        variant: "destructive"
      });
    }
  });

  // Delete game ad mutation
  const deleteGameAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/game-ads/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      toast({
        title: "Success",
        description: "Game ad deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete game ad",
        variant: "destructive"
      });
    }
  });

  // Toggle ad enabled mutation
  const toggleAdMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      return await apiRequest(`/api/game-ads/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-ads'] });
      toast({
        title: "Success",
        description: "Ad status updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ad status",
        variant: "destructive"
      });
    }
  });

  const handleCreateAd = () => {
    setIsCreateMode(true);
    setEditingAd(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEditAd = (ad: GameAd) => {
    setIsCreateMode(false);
    setEditingAd(ad);
    form.reset({
      name: ad.name,
      position: ad.position,
      isGoogleAd: ad.isGoogleAd,
      adCode: ad.adCode || "",
      imageUrl: ad.imageUrl || "",
      targetUrl: ad.targetUrl || "",
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : null,
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : null,
      status: ad.status,
      adEnabled: ad.adEnabled
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAd = (id: number) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteGameAdMutation.mutate(id);
    }
  };

  const handleToggleAd = (ad: GameAd) => {
    toggleAdMutation.mutate({
      id: ad.id,
      enabled: !ad.adEnabled
    });
  };

  const onSubmit = (data: GameAdFormData) => {
    // Transform data for backend API - convert string dates to Date objects or null
    const transformedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null
    };

    if (isCreateMode) {
      createGameAdMutation.mutate(transformedData);
    } else if (editingAd) {
      updateGameAdMutation.mutate({
        id: editingAd.id,
        data: transformedData
      });
    }
  };

  const getPositionLabel = (position: string) => {
    const pos = gameAdPositions.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Games Ads</h1>
          <p className="text-muted-foreground">
            Manage advertisement placements on game pages
          </p>
        </div>
        <Button 
          onClick={handleCreateAd} 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          data-testid="button-add-game-ad-header"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Ad
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads">Manage Ads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Total Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameAds.length}</div>
                <p className="text-xs text-muted-foreground">
                  {gameAds.filter(ad => ad.adEnabled && ad.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Total Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gameAds.reduce((sum, ad) => sum + ad.impressionCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gameAds.reduce((sum, ad) => sum + ad.clickCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Ad Position Distribution</CardTitle>
              <CardDescription>Number of ads by position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameAdPositions.map(position => {
                  const count = gameAds.filter(ad => ad.position === position.value).length;
                  return (
                    <div key={position.value} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{position.label}</span>
                      <Badge variant="secondary">{count} ads</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Manage Game Ads</h2>
            <Button 
              onClick={handleCreateAd} 
              variant="outline"
              data-testid="button-create-game-ad-tab"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {gameAds.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No game ads found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first game ad to start displaying advertisements on game pages.
                  </p>
                  <Button onClick={handleCreateAd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Ad
                  </Button>
                </CardContent>
              </Card>
            ) : (
              gameAds.map((ad) => (
                <Card key={ad.id} className={`${!ad.adEnabled || ad.status !== 'active' ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {ad.name}
                          <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                            {ad.status}
                          </Badge>
                          {ad.isGoogleAd && <Badge variant="outline">Google Ad</Badge>}
                          <Badge variant="outline">{getPositionLabel(ad.position)}</Badge>
                        </CardTitle>
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
                    <div className="space-y-2">
                      {ad.imageUrl && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Image: </span>
                          <span className="text-sm">{ad.imageUrl}</span>
                        </div>
                      )}
                      {ad.targetUrl && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Target URL: </span>
                          <span className="text-sm">{ad.targetUrl}</span>
                        </div>
                      )}
                      {ad.adCode && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {ad.isGoogleAd ? 'Google Ad Code' : 'Custom Code'}: 
                          </span>
                          <div className="mt-1 p-2 bg-muted rounded text-xs font-mono max-h-20 overflow-y-auto">
                            {ad.adCode}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{ad.impressionCount}</div>
                          <div className="text-xs text-muted-foreground">Impressions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{ad.clickCount}</div>
                          <div className="text-xs text-muted-foreground">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) : '0.00'}%
                          </div>
                          <div className="text-xs text-muted-foreground">CTR</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Total Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gameAds.reduce((total, ad) => total + ad.impressionCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All ads combined
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gameAds.reduce((total, ad) => total + ad.clickCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All ads combined
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Average CTR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const totalImpressions = gameAds.reduce((total, ad) => total + ad.impressionCount, 0);
                    const totalClicks = gameAds.reduce((total, ad) => total + ad.clickCount, 0);
                    return totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
                  })()}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Click-through rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Ad Performance</CardTitle>
              <CardDescription>
                Individual ad performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameAds.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No ads to analyze</p>
                  </div>
                ) : (
                  gameAds.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{ad.name}</h4>
                        <p className="text-sm text-muted-foreground">{getPositionLabel(ad.position)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-primary">{ad.impressionCount}</div>
                          <div className="text-xs text-muted-foreground">Impressions</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-primary">{ad.clickCount}</div>
                          <div className="text-xs text-muted-foreground">Clicks</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-primary">
                            {ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) : '0.00'}%
                          </div>
                          <div className="text-xs text-muted-foreground">CTR</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for creating/editing ads */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? 'Create Game Ad' : 'Edit Game Ad'}</DialogTitle>
            <DialogDescription>
              Configure a new advertisement for game pages. Choose from Google Ads, custom code, or image-based ads.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Enable if this is a Google AdSense ad
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-google-ad"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isGoogleAd ? (
                <FormField
                  control={form.control}
                  name="adCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Ad Code</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste your Google AdSense code here..."
                          className="h-32"
                          {...field}
                          data-testid="textarea-ad-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value || ""}
                              placeholder="https://example.com/ad-image.jpg" 
                              data-testid="input-image-url" 
                            />
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
                          <FormLabel>Target URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value || ""}
                              placeholder="https://example.com" 
                              data-testid="input-target-url" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="adCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Ad Code (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter custom HTML/JavaScript ad code (alternative to image+URL)..."
                            className="h-32"
                            {...field}
                            data-testid="textarea-custom-ad-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          data-testid="input-start-date" 
                        />
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
                        <Input 
                          type="date" 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          data-testid="input-end-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex justify-end space-x-2">
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
  );
}