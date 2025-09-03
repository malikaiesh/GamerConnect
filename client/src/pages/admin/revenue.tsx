import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart3,
  Calendar,
  Filter,
  Download,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import AdminNavigation from '@/components/admin/navigation';

// Schema for forms
const revenueSourceSchema = z.object({
  name: z.string().min(1, 'Revenue source name is required'),
  category: z.enum([
    'subscriptions', 'advertising', 'games', 'in_app_purchases', 'referrals', 
    'partnerships', 'premium_features', 'virtual_currency', 'merchandise', 
    'verification_fees', 'room_hosting', 'tournaments', 'donations', 'other'
  ]),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  trackingEnabled: z.boolean().default(true),
  automaticTracking: z.boolean().default(false),
  displayOrder: z.number().default(0)
});

const revenueGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  targetAmount: z.number().min(100, 'Target amount must be at least $1.00'),
  revenueSourceId: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  frequency: z.enum(['one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
});

type RevenueSourceFormData = z.infer<typeof revenueSourceSchema>;
type RevenueGoalFormData = z.infer<typeof revenueGoalSchema>;

export default function AdminRevenuePage() {
  const [location, setLocation] = useLocation();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const queryClient = useQueryClient();

  // Fetch revenue overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/revenue/admin/overview', selectedTimeframe],
    queryFn: () => apiRequest(`/api/revenue/admin/overview?timeframe=${selectedTimeframe}`),
  });

  // Fetch revenue sources
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/revenue/admin/sources'],
  });

  // Fetch revenue goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/revenue/admin/goals'],
  });

  // Fetch recent transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/revenue/admin/transactions'],
    queryFn: () => apiRequest('/api/revenue/admin/transactions?limit=10'),
  });

  // Forms
  const sourceForm = useForm<RevenueSourceFormData>({
    resolver: zodResolver(revenueSourceSchema),
    defaultValues: {
      name: '',
      category: 'other',
      description: '',
      isActive: true,
      trackingEnabled: true,
      automaticTracking: false,
      displayOrder: 0
    }
  });

  const goalForm = useForm<RevenueGoalFormData>({
    resolver: zodResolver(revenueGoalSchema),
    defaultValues: {
      name: '',
      description: '',
      targetAmount: 0,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  // Mutations
  const createSourceMutation = useMutation({
    mutationFn: (data: RevenueSourceFormData) => 
      apiRequest('/api/revenue/admin/sources', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/admin/sources'] });
      setIsSourceDialogOpen(false);
      sourceForm.reset();
    }
  });

  const updateSourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<RevenueSourceFormData> }) => 
      apiRequest(`/api/revenue/admin/sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/admin/sources'] });
      setEditingSource(null);
      sourceForm.reset();
    }
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/revenue/admin/sources/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/admin/sources'] });
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: RevenueGoalFormData) => 
      apiRequest('/api/revenue/admin/goals', { method: 'POST', body: JSON.stringify({
        ...data,
        targetAmount: Math.round(data.targetAmount * 100) // Convert to cents
      }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/admin/goals'] });
      setIsGoalDialogOpen(false);
      goalForm.reset();
    }
  });

  // Helper functions
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format((cents || 0) / 100);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      subscriptions: 'bg-blue-100 text-blue-800',
      advertising: 'bg-green-100 text-green-800',
      games: 'bg-purple-100 text-purple-800',
      in_app_purchases: 'bg-yellow-100 text-yellow-800',
      referrals: 'bg-pink-100 text-pink-800',
      partnerships: 'bg-indigo-100 text-indigo-800',
      premium_features: 'bg-orange-100 text-orange-800',
      verification_fees: 'bg-red-100 text-red-800',
      room_hosting: 'bg-cyan-100 text-cyan-800',
      tournaments: 'bg-emerald-100 text-emerald-800',
      donations: 'bg-rose-100 text-rose-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const onSourceSubmit = (data: RevenueSourceFormData) => {
    if (editingSource) {
      updateSourceMutation.mutate({ id: editingSource.id, data });
    } else {
      createSourceMutation.mutate(data);
    }
  };

  const onGoalSubmit = (data: RevenueGoalFormData) => {
    createGoalMutation.mutate(data);
  };

  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revenue Analytics</h1>
            <p className="text-muted-foreground">Track and manage all revenue streams</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32" data-testid="select-timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-export-report">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                {formatCurrency(overviewData?.overview?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-transactions">
                {overviewData?.overview?.totalTransactions?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-transaction">
                {formatCurrency(overviewData?.overview?.averageTransaction || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +5% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-goals">
                {overviewData?.activeGoals?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {overviewData?.activeGoals?.filter(g => g.goal.isAchieved).length || 0} achieved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="sources" data-testid="tab-sources">Revenue Sources</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="goals" data-testid="tab-goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Breakdown of revenue streams by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData?.revenueByCategory?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.transactions} transactions
                        </span>
                      </div>
                      <div className="text-lg font-semibold" data-testid={`text-category-revenue-${item.category}`}>
                        {formatCurrency(item.total || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Revenue Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Sources</CardTitle>
                <CardDescription>Your highest performing revenue streams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData?.topSources?.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`text-source-name-${index}`}>
                            {item.source?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.transactions} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold" data-testid={`text-source-revenue-${index}`}>
                        {formatCurrency(item.total || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Revenue Sources</h3>
                <p className="text-sm text-muted-foreground">Manage your revenue tracking sources</p>
              </div>
              <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-source">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSource ? 'Edit Revenue Source' : 'Add Revenue Source'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure a new revenue tracking source for your platform.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...sourceForm}>
                    <form onSubmit={sourceForm.handleSubmit(onSourceSubmit)} className="space-y-4">
                      <FormField
                        control={sourceForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Premium Subscriptions" {...field} data-testid="input-source-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={sourceForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-source-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="subscriptions">Subscriptions</SelectItem>
                                <SelectItem value="advertising">Advertising</SelectItem>
                                <SelectItem value="games">Games</SelectItem>
                                <SelectItem value="in_app_purchases">In-App Purchases</SelectItem>
                                <SelectItem value="referrals">Referrals</SelectItem>
                                <SelectItem value="partnerships">Partnerships</SelectItem>
                                <SelectItem value="premium_features">Premium Features</SelectItem>
                                <SelectItem value="verification_fees">Verification Fees</SelectItem>
                                <SelectItem value="room_hosting">Room Hosting</SelectItem>
                                <SelectItem value="tournaments">Tournaments</SelectItem>
                                <SelectItem value="donations">Donations</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={sourceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of this revenue source"
                                className="resize-none"
                                {...field}
                                data-testid="textarea-source-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={sourceForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                  Enable tracking for this revenue source
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-source-active"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sourceForm.control}
                          name="trackingEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Tracking Enabled</FormLabel>
                                <FormDescription>
                                  Allow transactions to be recorded for this source
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-source-tracking"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSourceDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createSourceMutation.isPending || updateSourceMutation.isPending}
                          data-testid="button-save-source"
                        >
                          {editingSource ? 'Update' : 'Create'} Source
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources?.map((source) => (
                <Card key={source.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-source-${source.id}-name`}>
                          {source.name}
                        </CardTitle>
                        <Badge className={`${getCategoryColor(source.category)} mt-1`}>
                          {source.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {source.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {source.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Tracking: {source.trackingEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingSource(source);
                            sourceForm.reset({
                              name: source.name,
                              category: source.category as any,
                              description: source.description || '',
                              isActive: source.isActive,
                              trackingEnabled: source.trackingEnabled,
                              automaticTracking: source.automaticTracking,
                              displayOrder: source.displayOrder
                            });
                            setIsSourceDialogOpen(true);
                          }}
                          data-testid={`button-edit-source-${source.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this revenue source?')) {
                              deleteSourceMutation.mutate(source.id);
                            }
                          }}
                          data-testid={`button-delete-source-${source.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest revenue transactions across all sources</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactionsData?.transactions?.length > 0 ? (
                      transactionsData.transactions.map((item, index) => (
                        <div key={item.transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium" data-testid={`text-transaction-${index}-description`}>
                                {item.transaction.description}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.revenueSource?.name} • {new Date(item.transaction.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold" data-testid={`text-transaction-${index}-amount`}>
                              {formatCurrency(item.transaction.netAmount || item.transaction.amount)}
                            </div>
                            <Badge 
                              variant={item.transaction.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Revenue Goals</h3>
                <p className="text-sm text-muted-foreground">Set and track revenue targets</p>
              </div>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-goal">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Revenue Goal</DialogTitle>
                    <DialogDescription>
                      Set a target for your revenue performance.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...goalForm}>
                    <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                      <FormField
                        control={goalForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Monthly Subscription Target" {...field} data-testid="input-goal-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={goalForm.control}
                        name="targetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 10000"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-goal-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={goalForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-goal-start-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={goalForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-goal-end-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={goalForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-goal-frequency">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="one_time">One Time</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createGoalMutation.isPending}
                          data-testid="button-save-goal"
                        >
                          Create Goal
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals?.map((item) => {
                const goal = item.goal;
                const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-goal-${goal.id}-name`}>
                            {goal.name}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge 
                          variant={goal.isAchieved ? 'default' : goal.isActive ? 'secondary' : 'outline'}
                          className={goal.isAchieved ? 'bg-green-100 text-green-800' : ''}
                        >
                          {goal.isAchieved ? 'Achieved' : goal.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span data-testid={`text-goal-${goal.id}-progress`}>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold" data-testid={`text-goal-${goal.id}-current`}>
                            {formatCurrency(goal.currentAmount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            of {formatCurrency(goal.targetAmount)} goal
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {goal.frequency.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed revenue performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Advanced analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}