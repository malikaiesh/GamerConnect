import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Target, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Award, 
  Copy, 
  Download,
  Calendar,
  Wallet,
  BarChart3,
  Gift,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReferralsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedPayoutStatus, setSelectedPayoutStatus] = useState('all');
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');
  const [newSettingType, setNewSettingType] = useState('string');
  const [newSettingDescription, setNewSettingDescription] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch referral analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: [`/api/referrals/admin/analytics`, selectedTimeframe],
    queryFn: () => apiRequest(`/api/referrals/admin/analytics?timeframe=${selectedTimeframe}`)
  });

  // Fetch all referrals
  const { data: allReferrals, isLoading: referralsLoading } = useQuery({
    queryKey: [`/api/referrals/admin/all-referrals`],
    queryFn: () => apiRequest(`/api/referrals/admin/all-referrals`)
  });

  // Fetch payouts
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: [`/api/referrals/admin/payouts`, selectedPayoutStatus],
    queryFn: () => apiRequest(`/api/referrals/admin/payouts?status=${selectedPayoutStatus !== 'all' ? selectedPayoutStatus : ''}`)
  });

  // Fetch referral settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: [`/api/referrals/admin/settings`],
    queryFn: () => apiRequest(`/api/referrals/admin/settings`)
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async (settingData: any) => {
      return apiRequest('/api/referrals/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settingData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/referrals/admin/settings`] });
      toast({
        title: 'Success',
        description: 'Setting updated successfully'
      });
      setNewSettingKey('');
      setNewSettingValue('');
      setNewSettingDescription('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive'
      });
    }
  });

  // Process payout mutation
  const processPayoutMutation = useMutation({
    mutationFn: async ({ id, status, reason, notes }: any) => {
      return apiRequest(`/api/referrals/admin/payouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          failureReason: reason,
          adminNotes: notes,
          transactionId: status === 'completed' ? `TXN_${Date.now()}` : undefined
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/referrals/admin/payouts`] });
      toast({
        title: 'Success',
        description: 'Payout processed successfully'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to process payout',
        variant: 'destructive'
      });
    }
  });

  const handleUpdateSetting = () => {
    if (!newSettingKey || !newSettingValue) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    updateSettingMutation.mutate({
      settingKey: newSettingKey,
      settingValue: newSettingValue,
      settingType: newSettingType,
      description: newSettingDescription
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon size={12} />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral System</h1>
          <p className="text-muted-foreground">Manage referral codes, rewards, and analytics</p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">All Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? '...' : analytics?.overall?.totalReferrals || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.overall?.confirmedReferrals || 0} confirmed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? '...' : formatCurrency(analytics?.overall?.totalEarnings || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {selectedTimeframe}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? '...' : analytics?.overall?.pendingReferrals || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? '...' : analytics?.topPerformers?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active referrers
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Analytics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Referrals</CardTitle>
                <CardDescription>Sign-ups and earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="space-y-2">
                    {analytics?.daily?.map((day: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{format(new Date(day.date), 'MMM dd')}</span>
                        <div className="flex gap-4">
                          <span className="text-blue-600">{day.signups} signups</span>
                          <span className="text-green-600">{formatCurrency(day.earnings || 0)}</span>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No data available</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Users with highest referral earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topPerformers?.map((performer: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {performer.totalReferrals} referrals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(performer.totalEarnings || 0)}
                        </p>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground">No performers yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Referrals Tab */}
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>All Referrals</CardTitle>
              <CardDescription>Manage and monitor all referral relationships</CardDescription>
            </CardHeader>
            <CardContent>
              {referralsLoading ? (
                <div className="text-center py-8">Loading referrals...</div>
              ) : (
                <div className="space-y-4">
                  {allReferrals?.referrals?.map((referral: any) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">
                            {referral.referrer?.username} → {referral.referredUser?.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Code: {referral.referralCode?.code} • {format(new Date(referral.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {referral.tier.replace('_', ' ')}
                        </Badge>
                        {getStatusBadge(referral.status)}
                        <span className="font-medium text-green-600">
                          {formatCurrency(referral.totalEarnings)}
                        </span>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground text-center py-8">No referrals found</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payout Management</CardTitle>
                <CardDescription>Process and manage referral payouts</CardDescription>
              </div>
              <Select value={selectedPayoutStatus} onValueChange={setSelectedPayoutStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {payoutsLoading ? (
                <div className="text-center py-8">Loading payouts...</div>
              ) : (
                <div className="space-y-4">
                  {payoutsData?.payouts?.map((payout: any) => (
                    <div key={payout.payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Wallet className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{payout.user?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(payout.payout.amount)} via {payout.payout.method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payout.payout.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(payout.payout.status)}
                        {payout.payout.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => processPayoutMutation.mutate({
                                id: payout.payout.id,
                                status: 'completed',
                                notes: 'Approved by admin'
                              })}
                              disabled={processPayoutMutation.isPending}
                              data-testid={`button-approve-payout-${payout.payout.id}`}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processPayoutMutation.mutate({
                                id: payout.payout.id,
                                status: 'failed',
                                reason: 'Rejected by admin',
                                notes: 'Manual review failed'
                              })}
                              disabled={processPayoutMutation.isPending}
                              data-testid={`button-reject-payout-${payout.payout.id}`}
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground text-center py-8">No payouts found</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Settings</CardTitle>
                <CardDescription>Referral system configuration</CardDescription>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="text-center py-8">Loading settings...</div>
                ) : (
                  <div className="space-y-3">
                    {settings?.map((setting: any) => (
                      <div key={setting.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{setting.settingKey.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {setting.settingType === 'number' && setting.settingKey.includes('reward') 
                              ? formatCurrency(parseInt(setting.settingValue) || 0)
                              : setting.settingValue}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {setting.settingType}
                          </Badge>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No settings found</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Setting</CardTitle>
                <CardDescription>Modify referral system configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setting-key">Setting Key</Label>
                  <Input
                    id="setting-key"
                    placeholder="e.g., registration_reward"
                    value={newSettingKey}
                    onChange={(e) => setNewSettingKey(e.target.value)}
                    data-testid="input-setting-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-value">Value</Label>
                  <Input
                    id="setting-value"
                    placeholder="e.g., 500"
                    value={newSettingValue}
                    onChange={(e) => setNewSettingValue(e.target.value)}
                    data-testid="input-setting-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-type">Type</Label>
                  <Select value={newSettingType} onValueChange={setNewSettingType}>
                    <SelectTrigger data-testid="select-setting-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-description">Description</Label>
                  <Textarea
                    id="setting-description"
                    placeholder="Brief description of this setting"
                    value={newSettingDescription}
                    onChange={(e) => setNewSettingDescription(e.target.value)}
                    data-testid="textarea-setting-description"
                  />
                </div>
                <Button 
                  onClick={handleUpdateSetting} 
                  disabled={updateSettingMutation.isPending}
                  className="w-full"
                  data-testid="button-update-setting"
                >
                  {updateSettingMutation.isPending ? 'Updating...' : 'Update Setting'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Referral Leaderboard</CardTitle>
              <CardDescription>Top performing referrers and their statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topPerformers?.map((performer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {index < 3 ? (
                          <Crown className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                        ) : (
                          <span className="font-bold text-primary">#{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{performer.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.totalReferrals} total referrals
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">
                        {formatCurrency(performer.totalEarnings || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">total earnings</p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground text-center py-8">No performers yet</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}