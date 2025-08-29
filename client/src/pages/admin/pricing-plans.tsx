import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Eye, EyeOff, Star, Gem, Crown, MapPin } from "lucide-react";
import { PricingPlan, InsertPricingPlan } from "@shared/schema";

const planFormSchema = z.object({
  name: z.string().min(3).max(100),
  displayName: z.string().min(3).max(150),
  planType: z.enum(['diamonds', 'verification', 'room_creation', 'premium_features']),
  duration: z.enum(['one_time', 'monthly', '6_months', 'yearly', 'lifetime']),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  originalPrice: z.number().optional(),
  diamondAmount: z.number().optional(),
  verificationDuration: z.number().optional(),
  roomCreationLimit: z.number().optional(),
  isPopular: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  sortOrder: z.number().min(0).default(0),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  features: z.string().optional().transform(val => val ? val.split('\n').filter(f => f.trim()) : []),
});

export default function AdminPricingPlans() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pricing plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/admin/pricing-plans'],
  });

  // Filtered plans based on selected type
  const filteredPlans = selectedPlanType === 'all' 
    ? plans 
    : plans.filter((plan: PricingPlan) => plan.planType === selectedPlanType);

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      displayName: '',
      planType: 'diamonds',
      duration: 'one_time',
      price: 0,
      currency: 'USD',
      originalPrice: undefined,
      diamondAmount: undefined,
      verificationDuration: undefined,
      roomCreationLimit: undefined,
      isPopular: false,
      status: 'active',
      sortOrder: 0,
      description: '',
      shortDescription: '',
      features: '',
    }
  });

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof planFormSchema>) => {
      const endpoint = editingPlan 
        ? `/api/admin/pricing-plans/${editingPlan.id}` 
        : '/api/admin/pricing-plans';
      
      return apiRequest(editingPlan ? 'PUT' : 'POST', endpoint, data);
    },
    onSuccess: () => {
      toast({ title: editingPlan ? "Plan updated successfully" : "Plan created successfully" });
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/pricing-plans/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Plan deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      displayName: plan.displayName,
      planType: plan.planType as any,
      duration: plan.duration as any,
      price: plan.price / 100, // Convert from cents
      currency: plan.currency,
      originalPrice: plan.originalPrice ? plan.originalPrice / 100 : undefined,
      diamondAmount: plan.diamondAmount || undefined,
      verificationDuration: plan.verificationDuration || undefined,
      roomCreationLimit: plan.roomCreationLimit || undefined,
      isPopular: plan.isPopular,
      status: plan.status as any,
      sortOrder: plan.sortOrder,
      description: plan.description || '',
      shortDescription: plan.shortDescription || '',
      features: plan.features ? plan.features.join('\n') : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this pricing plan?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: z.infer<typeof planFormSchema>) => {
    const processedData = {
      ...data,
      price: Math.round(data.price * 100), // Convert to cents
      originalPrice: data.originalPrice ? Math.round(data.originalPrice * 100) : null,
      createdBy: 1, // Admin user ID
      updatedBy: 1,
    };
    createUpdateMutation.mutate(processedData);
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'diamonds': return <Gem size={16} className="text-blue-500" />;
      case 'verification': return <Crown size={16} className="text-yellow-500" />;
      case 'room_creation': return <MapPin size={16} className="text-green-500" />;
      default: return <Star size={16} className="text-purple-500" />;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pricing Plans Management</h1>
          <p className="text-muted-foreground">Manage diamonds, verification, and room creation pricing plans</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}</DialogTitle>
              <DialogDescription>
                Configure the details for your pricing plan. Prices are entered in dollars and stored as cents.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100-diamonds" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100 Diamonds" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="diamonds">Diamonds</SelectItem>
                            <SelectItem value="verification">Verification</SelectItem>
                            <SelectItem value="room_creation">Room Creation</SelectItem>
                            <SelectItem value="premium_features">Premium Features</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one_time">One Time</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="6_months">6 Months</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="9.99" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="19.99" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>For showing discounts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Plan-specific fields */}
                {form.watch('planType') === 'diamonds' && (
                  <FormField
                    control={form.control}
                    name="diamondAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diamond Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('planType') === 'verification' && (
                  <FormField
                    control={form.control}
                    name="verificationDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Duration (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('planType') === 'room_creation' && (
                  <FormField
                    control={form.control}
                    name="roomCreationLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Creation Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the plan" {...field} />
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
                        <Textarea placeholder="Detailed description of the plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter each feature on a new line"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>One feature per line</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Popular Plan</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setEditingPlan(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUpdateMutation.isPending}>
                    {createUpdateMutation.isPending ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6">
        <Button 
          variant={selectedPlanType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedPlanType('all')}
        >
          All Plans
        </Button>
        <Button 
          variant={selectedPlanType === 'diamonds' ? 'default' : 'outline'}
          onClick={() => setSelectedPlanType('diamonds')}
        >
          <Gem className="w-4 h-4 mr-2" />
          Diamonds
        </Button>
        <Button 
          variant={selectedPlanType === 'verification' ? 'default' : 'outline'}
          onClick={() => setSelectedPlanType('verification')}
        >
          <Crown className="w-4 h-4 mr-2" />
          Verification
        </Button>
        <Button 
          variant={selectedPlanType === 'room_creation' ? 'default' : 'outline'}
          onClick={() => setSelectedPlanType('room_creation')}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Room Creation
        </Button>
      </div>

      {/* Plans table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans ({filteredPlans.length})</CardTitle>
          <CardDescription>Manage your pricing plans and adjust prices as needed</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading pricing plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pricing plans found. Create your first plan to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan: PricingPlan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(plan.planType)}
                        <div>
                          <div className="font-medium">{plan.displayName}</div>
                          <div className="text-sm text-muted-foreground">{plan.name}</div>
                          {plan.isPopular && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plan.planType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.duration.replace('_', ' ').toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        {formatPrice(plan.price, plan.currency)}
                        {plan.originalPrice && plan.originalPrice > plan.price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(plan.originalPrice, plan.currency)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={plan.status === 'active' ? 'default' : 
                               plan.status === 'inactive' ? 'secondary' : 'destructive'}
                      >
                        {plan.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}