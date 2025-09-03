import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Settings, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Code, 
  FileText, 
  Eye,
  EyeOff,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface WebmasterTool {
  id: number;
  name: string;
  displayName: string;
  description: string;
  verificationUrl?: string;
  verificationCode?: string;
  htmlTag?: string;
  metaTag?: string;
  verificationFile?: string;
  verificationFileName?: string;
  status: 'active' | 'inactive';
  verificationStatus: 'pending' | 'verified' | 'failed' | 'not_verified';
  lastVerified?: string;
  verificationError?: string;
  priority: number;
  icon?: string;
  helpUrl?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WebmasterToolsStats {
  total: number;
  verified: number;
  pending: number;
  failed: number;
  notVerified: number;
  active: number;
  inactive: number;
  enabled: number;
}

export default function WebmasterToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<WebmasterTool | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState<Record<number, boolean>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch webmaster tools
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['/api/webmaster-tools'],
    queryFn: () => apiRequest('/api/webmaster-tools')
  });

  // Fetch stats
  const { data: stats } = useQuery<WebmasterToolsStats>({
    queryKey: ['/api/admin/webmaster-tools/stats'],
    queryFn: () => apiRequest('/api/admin/webmaster-tools/stats')
  });

  // Update tool mutation
  const updateToolMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/webmaster-tools/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webmaster-tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webmaster-tools/stats'] });
      toast({
        title: 'Success',
        description: 'Webmaster tool updated successfully'
      });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update webmaster tool',
        variant: 'destructive'
      });
    }
  });

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/webmaster-tools/${id}/verification`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webmaster-tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webmaster-tools/stats'] });
      toast({
        title: 'Success',
        description: 'Verification status updated successfully'
      });
      setIsVerificationDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest(`/api/admin/webmaster-tools/${id}/status`, { method: 'PUT', body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webmaster-tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webmaster-tools/stats'] });
      toast({
        title: 'Success',
        description: 'Tool status updated successfully'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update tool status',
        variant: 'destructive'
      });
    }
  });

  // Filter tools
  const filteredTools = tools.filter((tool: WebmasterTool) => {
    const matchesSearch = tool.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || tool.verificationStatus === verificationFilter;
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      verified: 'default',
      failed: 'destructive',
      pending: 'secondary',
      not_verified: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleUpdateVerification = (tool: WebmasterTool, verificationStatus: string, verificationCode?: string, verificationError?: string) => {
    updateVerificationMutation.mutate({
      id: tool.id,
      data: { verificationStatus, verificationCode, verificationError }
    });
  };

  const toggleVerificationCodeVisibility = (toolId: number) => {
    setShowVerificationCode(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Webmaster Tools" description="Manage website verification for search engines and webmaster tools">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading webmaster tools...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Webmaster Tools" 
      description="Manage website verification for search engines and webmaster tools"
    >
      <div className="p-6 space-y-6">
        
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search webmaster tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
                data-testid="search-webmaster-tools"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="not_verified">Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: WebmasterTool) => (
            <Card key={tool.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.displayName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getVerificationStatusBadge(tool.verificationStatus)}
                        <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                          {tool.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {getVerificationStatusIcon(tool.verificationStatus)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                
                {tool.verificationCode && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-medium">Verification Code</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVerificationCodeVisibility(tool.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showVerificationCode[tool.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block break-all">
                      {showVerificationCode[tool.id] ? tool.verificationCode : '••••••••••••••••'}
                    </code>
                  </div>
                )}

                {tool.lastVerified && (
                  <div className="text-xs text-muted-foreground">
                    Last verified: {new Date(tool.lastVerified).toLocaleDateString()}
                  </div>
                )}

                {tool.verificationError && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400">{tool.verificationError}</p>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTool(tool);
                      setIsEditDialogOpen(true);
                    }}
                    data-testid={`edit-tool-${tool.id}`}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTool(tool);
                      setIsVerificationDialogOpen(true);
                    }}
                    data-testid={`verify-tool-${tool.id}`}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Verify
                  </Button>

                  <Button
                    variant={tool.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => toggleStatusMutation.mutate({ 
                      id: tool.id, 
                      status: tool.status === 'active' ? 'inactive' : 'active' 
                    })}
                    data-testid={`toggle-status-${tool.id}`}
                  >
                    {tool.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>

                  {tool.helpUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tool.helpUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No webmaster tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Edit Tool Dialog */}
        {selectedTool && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit {selectedTool.displayName}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Display Name</Label>
                      <Input 
                        defaultValue={selectedTool.displayName}
                        onChange={(e) => setSelectedTool({...selectedTool, displayName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input 
                        type="number"
                        defaultValue={selectedTool.priority}
                        onChange={(e) => setSelectedTool({...selectedTool, priority: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      defaultValue={selectedTool.description}
                      onChange={(e) => setSelectedTool({...selectedTool, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Help URL</Label>
                    <Input 
                      defaultValue={selectedTool.helpUrl || ''}
                      onChange={(e) => setSelectedTool({...selectedTool, helpUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={selectedTool.isEnabled}
                      onCheckedChange={(checked) => setSelectedTool({...selectedTool, isEnabled: checked})}
                    />
                    <Label>Enabled</Label>
                  </div>
                </TabsContent>
                
                <TabsContent value="verification" className="space-y-4">
                  <div>
                    <Label>Verification URL</Label>
                    <Input 
                      defaultValue={selectedTool.verificationUrl || ''}
                      onChange={(e) => setSelectedTool({...selectedTool, verificationUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label>HTML Tag</Label>
                    <Textarea 
                      defaultValue={selectedTool.htmlTag || ''}
                      onChange={(e) => setSelectedTool({...selectedTool, htmlTag: e.target.value})}
                      placeholder="<meta name='...' content='...' />"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Meta Tag</Label>
                    <Textarea 
                      defaultValue={selectedTool.metaTag || ''}
                      onChange={(e) => setSelectedTool({...selectedTool, metaTag: e.target.value})}
                      placeholder="<meta name='...' content='...' />"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Verification File</Label>
                      <Input 
                        defaultValue={selectedTool.verificationFile || ''}
                        onChange={(e) => setSelectedTool({...selectedTool, verificationFile: e.target.value})}
                        placeholder="verification-file.html"
                      />
                    </div>
                    <div>
                      <Label>File Name</Label>
                      <Input 
                        defaultValue={selectedTool.verificationFileName || ''}
                        onChange={(e) => setSelectedTool({...selectedTool, verificationFileName: e.target.value})}
                        placeholder="filename.html"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateToolMutation.mutate({ id: selectedTool.id, data: selectedTool })}
                  disabled={updateToolMutation.isPending}
                >
                  {updateToolMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Verification Dialog */}
        {selectedTool && (
          <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Verification Status</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Tool: {selectedTool.displayName}</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleUpdateVerification(selectedTool, 'verified')}
                    disabled={updateVerificationMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Verified
                  </Button>
                  
                  <Button
                    onClick={() => handleUpdateVerification(selectedTool, 'failed', undefined, 'Manual verification failed')}
                    disabled={updateVerificationMutation.isPending}
                    variant="destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Mark as Failed
                  </Button>
                </div>

                <Button
                  onClick={() => handleUpdateVerification(selectedTool, 'pending')}
                  disabled={updateVerificationMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Pending
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}