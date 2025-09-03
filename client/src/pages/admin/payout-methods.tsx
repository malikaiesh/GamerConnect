import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminNavigation from "@/components/admin/navigation";
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Clock, CreditCard } from "lucide-react";
import type { PayoutMethod } from "@shared/schema";

interface PayoutMethodsData {
  methods: PayoutMethod[];
}

export default function AdminPayoutMethodsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | null>(null);

  const { data: payoutMethods, isLoading } = useQuery<PayoutMethod[]>({
    queryKey: ['/api/referrals/admin/payout-methods'],
  });

  const toggleMethodMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number; isEnabled: boolean }) => {
      await apiRequest(`/api/referrals/admin/payout-methods/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isEnabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/admin/payout-methods'] });
      toast({
        title: "Success",
        description: "Payout method updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/referrals/admin/payout-methods/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/admin/payout-methods'] });
      toast({
        title: "Success",
        description: "Payout method deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleEnabled = async (method: PayoutMethod) => {
    toggleMethodMutation.mutate({
      id: method.id,
      isEnabled: !method.isEnabled,
    });
  };

  const handleDelete = async (method: PayoutMethod) => {
    if (window.confirm(`Are you sure you want to delete the ${method.name} payout method?`)) {
      deleteMethodMutation.mutate(method.id);
    }
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminNavigation />
        <div className="flex-1 p-6 lg:p-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/referrals">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Referrals
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Payout Methods Management
                </h1>
                <p className="text-muted-foreground">
                  Configure available payout methods for referral earnings
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/referrals">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Referrals
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Payout Methods Management
                </h1>
                <p className="text-muted-foreground">
                  Configure available payout methods for referral earnings
                </p>
              </div>
            </div>

            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Method
            </Button>
          </div>

          {/* Payout Methods Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payoutMethods?.map((method) => (
              <Card key={method.id} className="relative group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{method.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={method.isEnabled ? "default" : "secondary"}
                            className={method.isEnabled ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""}
                          >
                            {method.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" data-testid={`button-edit-${method.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(method)}
                        data-testid={`button-delete-${method.id}`}
                        disabled={deleteMethodMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {method.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Method Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Min Amount</div>
                        <div className="text-muted-foreground">{formatAmount(method.minimumAmount)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Processing</div>
                        <div className="text-muted-foreground">{method.processingTime}</div>
                      </div>
                    </div>
                  </div>

                  {method.processingFee > 0 && (
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Processing Fee: {formatAmount(method.processingFee)}
                      </div>
                    </div>
                  )}

                  {/* Required Fields */}
                  <div>
                    <div className="text-sm font-medium mb-2">Required Fields:</div>
                    <div className="flex flex-wrap gap-1">
                      {method.requiredFields?.fields?.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-medium">Available to Users</span>
                    <Switch
                      checked={method.isEnabled}
                      onCheckedChange={() => handleToggleEnabled(method)}
                      disabled={toggleMethodMutation.isPending}
                      data-testid={`switch-enabled-${method.id}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {payoutMethods && payoutMethods.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payout Methods</h3>
                <p className="text-muted-foreground mb-6">
                  Set up payout methods to allow users to receive their referral earnings.
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Method
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}