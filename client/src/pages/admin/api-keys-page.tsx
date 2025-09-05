import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ApiKey } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import AdminNavigation from '@/components/admin/navigation';

export default function ApiKeysPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentApiKey, setCurrentApiKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tinymce',
    key: '',
    description: '',
    isActive: true
  });

  // Fetch all API keys
  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['/api/api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error('Failed to fetch API keys');
      return res.json();
    }
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/api-keys', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: 'API Key Created',
        description: 'The API key has been created successfully.',
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating API Key',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      return await apiRequest('PUT', `/api/api-keys/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: 'API Key Updated',
        description: 'The API key has been updated successfully.',
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating API Key',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting API Key',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle API key active status
  const toggleApiKeyStatus = (apiKey: ApiKey) => {
    updateApiKeyMutation.mutate({
      id: apiKey.id,
      data: { isActive: !apiKey.isActive }
    });
  };

  // Handle opening dialog for creating new API key
  const handleCreateApiKey = () => {
    setDialogMode('create');
    setCurrentApiKey(null);
    setFormData({
      name: '',
      type: 'tinymce',
      key: '',
      description: '',
      isActive: true
    });
    setOpenDialog(true);
  };

  // Handle opening dialog for editing an API key
  const handleEditApiKey = (apiKey: ApiKey) => {
    setDialogMode('edit');
    setCurrentApiKey(apiKey);
    setFormData({
      name: apiKey.name,
      type: apiKey.type,
      key: apiKey.key,
      description: apiKey.description || '',
      isActive: apiKey.isActive
    });
    setOpenDialog(true);
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentApiKey(null);
    setFormData({
      name: '',
      type: 'tinymce',
      key: '',
      description: '',
      isActive: true
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dialogMode === 'create') {
      createApiKeyMutation.mutate(formData);
    } else if (dialogMode === 'edit' && currentApiKey) {
      updateApiKeyMutation.mutate({
        id: currentApiKey.id,
        data: formData
      });
    }
  };

  // Handle deleting an API key
  const handleDeleteApiKey = (id: number) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Categorize API keys
  const paymentGatewayTypes = ['stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net'];
  
  const paymentGatewayKeys = apiKeys.filter((key: ApiKey) => paymentGatewayTypes.includes(key.type));
  const otherApiKeys = apiKeys.filter((key: ApiKey) => !paymentGatewayTypes.includes(key.type));

  // Render API Keys Table
  const renderApiKeysTable = (keys: ApiKey[]) => {
    if (keys.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No API keys found in this category.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Type</TableHead>
            <TableHead className="text-foreground">Key</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Created At</TableHead>
            <TableHead className="text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((apiKey: ApiKey) => (
            <TableRow key={apiKey.id}>
              <TableCell className="font-medium text-foreground">{apiKey.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {apiKey.type}
                </Badge>
              </TableCell>
              <TableCell>
                <code className="bg-muted px-1 py-0.5 rounded text-sm text-foreground">
                  {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={apiKey.isActive}
                    onCheckedChange={() => toggleApiKeyStatus(apiKey)}
                  />
                  <span className="text-foreground">{apiKey.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </TableCell>
              <TableCell className="text-foreground">{formatDate(apiKey.createdAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditApiKey(apiKey)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground">Manage external service API keys and integrations</p>
        </div>
        {/* Payment Gateway API Keys Section */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Payment Gateway API Keys</CardTitle>
              <CardDescription>
                Manage API keys for payment processing services
              </CardDescription>
            </div>
            <Button onClick={handleCreateApiKey}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Gateway Key
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              renderApiKeysTable(paymentGatewayKeys)
            )}
          </CardContent>
        </Card>

        {/* Other API Keys Section */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Other API Keys</CardTitle>
              <CardDescription>
                Manage API keys for external services and integrations
              </CardDescription>
            </div>
            <Button onClick={handleCreateApiKey}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service API Key
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              renderApiKeysTable(otherApiKeys)
            )}
          </CardContent>
        </Card>

      {/* Create/Edit API Key Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {dialogMode === 'create' ? 'Add New API Key' : 'Edit API Key'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Add a new API key for an external service.'
                : 'Edit the details of this API key.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right text-foreground">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tinymce">TinyMCE</SelectItem>
                    <SelectItem value="game-monetize">Game Monetize</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                    <SelectItem value="mollie">Mollie</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="adyen">Adyen</SelectItem>
                    <SelectItem value="2checkout">2Checkout</SelectItem>
                    <SelectItem value="braintree">Braintree</SelectItem>
                    <SelectItem value="authorize_net">Authorize.Net</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="key" className="text-right text-foreground">
                  API Key
                </Label>
                <Input
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right text-foreground">
                  Active
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                  <span className="text-foreground">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createApiKeyMutation.isPending || updateApiKeyMutation.isPending}
              >
                {createApiKeyMutation.isPending || updateApiKeyMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : dialogMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}