import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Rocket, 
  Calendar,
  GitBranch,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  RotateCcw,
  History
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Badge
} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WebsiteUpdate } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function WebsiteUpdatesPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<WebsiteUpdate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    changeType: 'feature' as 'feature' | 'bugfix' | 'security' | 'improvement',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    scheduledAt: ''
  });

  // Fetch website updates
  const { data: updatesData, isLoading } = useQuery({
    queryKey: ['/api/website-updates', { status: statusFilter }],
    queryFn: () => apiRequest('GET', `/api/website-updates?status=${statusFilter}`),
  });

  const updates = (updatesData as any)?.updates || [];

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/website-updates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website-updates'] });
      toast({
        title: "Update Created",
        description: "Website update has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create update.",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PUT', `/api/website-updates/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website-updates'] });
      toast({
        title: "Status Updated",
        description: "Update status has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/website-updates/${id}/deploy`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website-updates'] });
      toast({
        title: "Deployment Triggered",
        description: "Deployment has been started successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger deployment.",
        variant: "destructive",
      });
    },
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ updateId, historyId }: { updateId: number; historyId: number }) => {
      return apiRequest('POST', `/api/website-updates/${updateId}/rollback`, { historyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website-updates'] });
      toast({
        title: "Rollback Successful",
        description: "Update has been rolled back to the previous version.",
      });
      setHistoryDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to rollback update.",
        variant: "destructive",
      });
    },
  });

  // State for history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<number | null>(null);

  // Fetch update history when needed
  const { data: historyData } = useQuery({
    queryKey: ['/api/website-updates', selectedUpdateId, 'history'],
    queryFn: () => apiRequest('GET', `/api/website-updates/${selectedUpdateId}/history`),
    enabled: !!selectedUpdateId && historyDialogOpen,
  });

  const history = (historyData as any) || [];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      version: '',
      changeType: 'feature',
      priority: 'medium',
      scheduledAt: ''
    });
    setEditingUpdate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUpdateMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: <Edit className="w-3 h-3" /> },
      published: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      deploying: { variant: 'default' as const, icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      deployed: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      failed: { variant: 'destructive' as const, icon: <AlertTriangle className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getChangeTypeIcon = (type: string) => {
    const icons = {
      feature: <Plus className="w-4 h-4" />,
      bugfix: <AlertTriangle className="w-4 h-4" />,
      security: <CheckCircle className="w-4 h-4" />,
      improvement: <Info className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || icons.feature;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Website Updates</h1>
            <p className="text-muted-foreground">Manage and deploy website updates</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="deploying">Deploying</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-update">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Website Update</DialogTitle>
                  <DialogDescription>
                    Create a new website update with deployment information
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Update title"
                        required
                        data-testid="input-update-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="v1.2.3"
                        required
                        data-testid="input-update-version"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the changes in this update"
                      rows={3}
                      required
                      data-testid="textarea-update-description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="changeType">Change Type</Label>
                      <Select
                        value={formData.changeType}
                        onValueChange={(value: any) => setFormData({ ...formData, changeType: value })}
                      >
                        <SelectTrigger data-testid="select-change-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="bugfix">Bug Fix</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Schedule Deployment (Optional)</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      data-testid="input-scheduled-at"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUpdateMutation.isPending} data-testid="button-save-update">
                      {createUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Update'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* GitHub Integration Info Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <GitBranch className="w-5 h-5" />
              GitHub Integration Setup
            </CardTitle>
            <CardDescription>
              Connect your GitHub repository for automated deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To enable automated deployments, set up GitHub Actions with these steps:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Add your repository secrets (API keys, database URLs)</li>
                <li>Configure GitHub Actions workflow for deployment</li>
                <li>Set up webhook URL: <code className="bg-muted px-1 rounded">/api/webhooks/github</code></li>
                <li>Enable deployment status updates</li>
              </ol>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.open('https://docs.github.com/en/actions/quickstart', '_blank')}
                data-testid="button-setup-guide"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Setup Guide
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Updates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>
              Manage your website updates and deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-8">
                <GitBranch className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No updates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first website update to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Update
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Update</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map((update: WebsiteUpdate) => (
                    <TableRow key={update.id} data-testid={`row-update-${update.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-update-title-${update.id}`}>
                            {update.title}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {update.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChangeTypeIcon(update.changeType)}
                          <span className="capitalize">{update.changeType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(update.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(update.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{update.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(update.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {update.status === 'published' && (
                            <Button
                              size="sm"
                              onClick={() => deployMutation.mutate(update.id)}
                              disabled={deployMutation.isPending}
                              data-testid={`button-deploy-${update.id}`}
                            >
                              <Rocket className="w-3 h-3 mr-1" />
                              Deploy
                            </Button>
                          )}
                          
                          {update.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: update.id, status: 'published' })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-publish-${update.id}`}
                            >
                              Publish
                            </Button>
                          )}

                          {/* History button for all updates */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUpdateId(update.id);
                              setHistoryDialogOpen(true);
                            }}
                            data-testid={`button-history-${update.id}`}
                          >
                            <History className="w-3 h-3" />
                          </Button>
                          
                          {update.deploymentUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={update.deploymentUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* History & Rollback Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Update History & Rollback</DialogTitle>
              <DialogDescription>
                View version history and rollback to previous versions if needed
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No version history</h3>
                  <p className="text-muted-foreground">
                    This update doesn't have any saved versions yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium">Available Versions</h4>
                  {history.map((historyItem: any) => (
                    <div 
                      key={historyItem.id} 
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={historyItem.isActive ? "default" : "secondary"}>
                            {historyItem.isActive ? "Current" : "Previous"}
                          </Badge>
                          <span className="font-medium">{historyItem.version}</span>
                          <Badge variant="outline">{historyItem.changeType}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(historyItem.createdAt).toLocaleDateString()}
                          </span>
                          {!historyItem.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rollbackMutation.mutate({ 
                                updateId: selectedUpdateId!, 
                                historyId: historyItem.id 
                              })}
                              disabled={rollbackMutation.isPending}
                              data-testid={`button-rollback-${historyItem.id}`}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-1">{historyItem.title}</h5>
                        <p className="text-sm text-muted-foreground">{historyItem.description}</p>
                      </div>
                      
                      {historyItem.rollbackData && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {historyItem.rollbackData.rollbackFrom && (
                            <span>Rolled back from {historyItem.rollbackData.rollbackFrom} to {historyItem.rollbackData.rollbackTo}</span>
                          )}
                          {historyItem.rollbackData.savedAt && (
                            <span>Saved at {new Date(historyItem.rollbackData.savedAt).toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}