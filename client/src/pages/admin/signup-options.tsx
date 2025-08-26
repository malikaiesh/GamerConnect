import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AdminNavigation from '@/components/admin/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Save, Eye, EyeOff, GripVertical } from 'lucide-react';
import type { SignupOption } from '@shared/schema';

interface SignupOptionFormData {
  displayName: string;
  description: string;
  color: string;
  sortOrder: number;
  configuration: Record<string, any>;
}

export default function SignupOptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingOption, setEditingOption] = useState<SignupOption | null>(null);
  const [formData, setFormData] = useState<SignupOptionFormData>({
    displayName: '',
    description: '',
    color: '#000000',
    sortOrder: 0,
    configuration: {}
  });

  // Fetch all signup options
  const { data: signupOptions = [], isLoading } = useQuery<SignupOption[]>({
    queryKey: ['/api/signup-options'],
    retry: false
  });

  // Toggle provider enabled/disabled
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('PATCH', `/api/signup-options/${id}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/signup-options'] });
      toast({
        title: 'Success',
        description: 'Signup option updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update signup option',
        variant: 'destructive',
      });
    }
  });

  // Update provider configuration
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SignupOption> }) => {
      return await apiRequest('PUT', `/api/signup-options/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/signup-options'] });
      setEditingOption(null);
      toast({
        title: 'Success',
        description: 'Signup option configuration updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update signup option configuration',
        variant: 'destructive',
      });
    }
  });

  const handleEditOption = (option: SignupOption) => {
    setEditingOption(option);
    setFormData({
      displayName: option.displayName,
      description: option.description || '',
      color: option.color,
      sortOrder: option.sortOrder,
      configuration: option.configuration || {}
    });
  };

  const handleSaveConfiguration = () => {
    if (!editingOption) return;
    
    updateMutation.mutate({
      id: editingOption.id,
      data: {
        displayName: formData.displayName,
        description: formData.description,
        color: formData.color,
        sortOrder: formData.sortOrder,
        configuration: formData.configuration
      }
    });
  };

  const getProviderIcon = (provider: string, icon: string) => {
    const iconMap: Record<string, string> = {
      'email': '📧',
      'google': '🟦',
      'facebook': '🟦',
      'github': '⚫',
      'discord': '🟣',
      'twitter': '⚫',
      'apple': '⚫',
      'microsoft': '🟦',
      'phone': '📱'
    };
    return iconMap[provider] || '🔗';
  };

  const renderConfigurationFields = (option: SignupOption) => {
    const config = option.configuration || {};
    
    switch (option.provider) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <Switch
                id="requireEmailVerification"
                checked={config.requireEmailVerification || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, requireEmailVerification: checked }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={config.passwordMinLength || 8}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, passwordMinLength: parseInt(e.target.value) }
                  }))
                }
              />
            </div>
          </div>
        );
      
      case 'google':
      case 'facebook':
      case 'github':
      case 'discord':
      case 'microsoft':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="password"
                placeholder="Enter client ID"
                value={config.clientId || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, clientId: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter client secret"
                value={config.clientSecret || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, clientSecret: e.target.value }
                  }))
                }
              />
            </div>
          </div>
        );
      
      case 'twitter':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key"
                value={config.apiKey || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, apiKey: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="Enter API secret"
                value={config.apiSecret || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, apiSecret: e.target.value }
                  }))
                }
              />
            </div>
          </div>
        );
      
      case 'apple':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="password"
                placeholder="Enter client ID"
                value={config.clientId || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, clientId: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                type="password"
                placeholder="Enter team ID"
                value={config.teamId || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, teamId: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="keyId">Key ID</Label>
              <Input
                id="keyId"
                type="password"
                placeholder="Enter key ID"
                value={config.keyId || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, keyId: e.target.value }
                  }))
                }
              />
            </div>
          </div>
        );
      
      case 'phone':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
              <Input
                id="twilioAccountSid"
                type="password"
                placeholder="Enter Twilio Account SID"
                value={config.twilioAccountSid || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, twilioAccountSid: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
              <Input
                id="twilioAuthToken"
                type="password"
                placeholder="Enter Twilio Auth Token"
                value={config.twilioAuthToken || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, twilioAuthToken: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
              <Input
                id="twilioPhoneNumber"
                placeholder="Enter Twilio Phone Number"
                value={config.twilioPhoneNumber || ''}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, twilioPhoneNumber: e.target.value }
                  }))
                }
              />
            </div>
          </div>
        );
      
      default:
        return <p className="text-sm text-muted-foreground">No configuration options available for this provider.</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-8">
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Signup Options</h1>
          <p className="text-muted-foreground">
            Manage authentication providers and signup methods for your gaming website.
          </p>
        </div>

        <div className="grid gap-6">
          {signupOptions.map((option: SignupOption) => (
          <Card key={option.id} className="border-l-4" style={{ borderLeftColor: option.color }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl">{getProviderIcon(option.provider, option.icon)}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.displayName}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={option.isEnabled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {option.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={option.isEnabled}
                    onCheckedChange={() => toggleMutation.mutate(option.id)}
                    disabled={toggleMutation.isPending}
                    data-testid={`toggle-${option.provider}`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Provider: {option.provider}</span>
                  <span>Sort Order: {option.sortOrder}</span>
                  <span>Updated: {new Date(option.updatedAt).toLocaleDateString()}</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditOption(option)}
                      data-testid={`config-${option.provider}`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-xl">{getProviderIcon(option.provider, option.icon)}</span>
                        Configure {option.displayName}
                      </DialogTitle>
                      <DialogDescription>
                        Configure settings and credentials for the {option.displayName} authentication provider.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="color">Brand Color</Label>
                          <Input
                            id="color"
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of this signup method"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sortOrder">Sort Order</Label>
                        <Input
                          id="sortOrder"
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label>Provider Configuration</Label>
                        <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                          {editingOption && renderConfigurationFields(editingOption)}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSaveConfiguration}
                        disabled={updateMutation.isPending}
                        data-testid="save-configuration"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Configuration
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>

        {signupOptions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Signup Options Found</h3>
            <p className="text-muted-foreground">
              Signup options will be automatically created when the system initializes.
            </p>
          </CardContent>
        </Card>
        )}
        </div>
      </div>
    </div>
  );
}