import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/layout";
import { formatDistance } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Download,
  Upload,
  Settings,
  Trash2,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  MoreHorizontal,
  Database,
  Folder,
  HardDrive,
  Activity,
} from "lucide-react";

interface Backup {
  id: number;
  name: string;
  description?: string;
  backupType: 'full' | 'database_only' | 'files_only' | 'settings_only';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  fileSize?: number;
  checksumMd5?: string;
  checksumSha256?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  errorMessage?: string;
  createdAt: Date;
  triggeredBy: string;
}

interface Restore {
  id: number;
  backupId: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  completedSteps: number;
  totalSteps: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  errorMessage?: string;
  createdAt: Date;
}

interface BackupConfig {
  id: number;
  name: string;
  description?: string;
  backupType: 'full' | 'database_only' | 'files_only' | 'settings_only';
  storageLocation: 'local' | 'cloud' | 'both';
  schedule?: string;
  isScheduleEnabled: boolean;
  retentionDays: number;
  maxBackups: number;
  isActive: boolean;
  createdAt: Date;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'in_progress': return 'text-blue-600 bg-blue-100';
    case 'failed': return 'text-red-600 bg-red-100';
    case 'cancelled': return 'text-gray-600 bg-gray-100';
    default: return 'text-yellow-600 bg-yellow-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4" />;
    case 'in_progress': return <RefreshCw className="w-4 h-4 animate-spin" />;
    case 'failed': return <AlertTriangle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getBackupTypeIcon = (type: string) => {
  switch (type) {
    case 'full': return <Archive className="w-4 h-4" />;
    case 'database_only': return <Database className="w-4 h-4" />;
    case 'files_only': return <Folder className="w-4 h-4" />;
    case 'settings_only': return <Settings className="w-4 h-4" />;
    default: return <Archive className="w-4 h-4" />;
  }
};

export default function BackupRestorePage() {
  const [activeTab, setActiveTab] = useState("backups");
  const [createBackupDialogOpen, setCreateBackupDialogOpen] = useState(false);
  const [createRestoreDialogOpen, setCreateRestoreDialogOpen] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<Backup | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch backups
  const { data: backupsData, refetch: refetchBackups, isLoading: backupsLoading } = useQuery({
    queryKey: ['/api/backup-restore/backups'],
  });

  // Fetch restores
  const { data: restoresData, refetch: refetchRestores, isLoading: restoresLoading } = useQuery({
    queryKey: ['/api/backup-restore/restores'],
  });

  // Fetch backup configs
  const { data: configsData, refetch: refetchConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ['/api/backup-restore/backup-configs'],
  });

  // Auto-refresh for in-progress operations
  useEffect(() => {
    const interval = setInterval(() => {
      const hasInProgress = [
        ...(backupsData?.backups || []),
        ...(restoresData?.restores || [])
      ].some(item => item.status === 'in_progress');
      
      if (hasInProgress) {
        refetchBackups();
        refetchRestores();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [backupsData, restoresData, refetchBackups, refetchRestores]);

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/backup-restore/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Backup started successfully!" });
      setCreateBackupDialogOpen(false);
      refetchBackups();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start backup: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Create restore mutation
  const createRestoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/backup-restore/restores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create restore');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Restore started successfully!" });
      setCreateRestoreDialogOpen(false);
      setSelectedBackupForRestore(null);
      refetchRestores();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start restore: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: number) => {
      const response = await fetch(`/api/backup-restore/backups/${backupId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete backup');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Backup deleted successfully!" });
      refetchBackups();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete backup: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      backupType: formData.get('backupType'),
      includeUploads: formData.get('includeUploads') === 'on',
      includeAssets: formData.get('includeAssets') === 'on',
      includeSettings: formData.get('includeSettings') === 'on',
      includeLogs: formData.get('includeLogs') === 'on',
      compressionEnabled: formData.get('compressionEnabled') === 'on',
      compressionLevel: parseInt(formData.get('compressionLevel') as string) || 6,
    };

    createBackupMutation.mutate(data);
  };

  const handleCreateRestore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
      backupId: selectedBackupForRestore?.id,
      name: formData.get('name'),
      description: formData.get('description'),
      restoreDatabase: formData.get('restoreDatabase') === 'on',
      restoreFiles: formData.get('restoreFiles') === 'on',
      restoreSettings: formData.get('restoreSettings') === 'on',
      createBackupBeforeRestore: formData.get('createBackupBeforeRestore') === 'on',
    };

    createRestoreMutation.mutate(data);
  };

  const backups = backupsData?.backups || [];
  const restores = restoresData?.restores || [];
  const configs = configsData?.configs || [];

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="backup-restore-page">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">Backup & Restore</h2>
            <p className="text-muted-foreground">
              Manage your website backups and restore operations
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createBackupDialogOpen} onOpenChange={setCreateBackupDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="create-backup-button">
                  <Archive className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Backup</DialogTitle>
                  <DialogDescription>
                    Create a backup of your website data
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBackup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Backup Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="My Website Backup"
                      data-testid="backup-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupType">Backup Type</Label>
                    <Select name="backupType" defaultValue="full">
                      <SelectTrigger data-testid="backup-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="database_only">Database Only</SelectItem>
                        <SelectItem value="files_only">Files Only</SelectItem>
                        <SelectItem value="settings_only">Settings Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Include Options</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeUploads" name="includeUploads" defaultChecked />
                        <Label htmlFor="includeUploads" className="text-sm">Uploads</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeAssets" name="includeAssets" defaultChecked />
                        <Label htmlFor="includeAssets" className="text-sm">Assets</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeSettings" name="includeSettings" defaultChecked />
                        <Label htmlFor="includeSettings" className="text-sm">Settings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeLogs" name="includeLogs" />
                        <Label htmlFor="includeLogs" className="text-sm">Logs</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="compressionEnabled" name="compressionEnabled" defaultChecked />
                    <Label htmlFor="compressionEnabled" className="text-sm">Enable Compression</Label>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createBackupMutation.isPending}
                      data-testid="submit-backup-button"
                    >
                      {createBackupMutation.isPending ? 'Creating...' : 'Create Backup'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backups" data-testid="backups-tab">
              <Archive className="w-4 h-4 mr-2" />
              Backups
            </TabsTrigger>
            <TabsTrigger value="restores" data-testid="restores-tab">
              <Upload className="w-4 h-4 mr-2" />
              Restores
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  Backup History
                </CardTitle>
                <CardDescription>
                  View and manage your website backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No backups found</p>
                    <p className="text-sm text-muted-foreground">Create your first backup to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map((backup: Backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {getBackupTypeIcon(backup.backupType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" data-testid={`backup-name-${backup.id}`}>
                              {backup.name}
                            </p>
                            {backup.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {backup.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary" className={`${getStatusColor(backup.status)}`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(backup.status)}
                                  {backup.status.replace('_', ' ')}
                                </div>
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {backup.backupType.replace('_', ' ')}
                              </span>
                              {backup.fileSize && (
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(backup.fileSize)}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistance(new Date(backup.createdAt), new Date(), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {backup.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBackupForRestore(backup);
                                setCreateRestoreDialogOpen(true);
                              }}
                              data-testid={`restore-button-${backup.id}`}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Restore
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`backup-menu-${backup.id}`}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Shield className="w-4 h-4 mr-2" />
                                Validate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteBackupMutation.mutate(backup.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Restore History
                </CardTitle>
                <CardDescription>
                  View and manage restore operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {restoresLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : restores.length === 0 ? (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No restores found</p>
                    <p className="text-sm text-muted-foreground">Restore from a backup to see operations here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restores.map((restore: Restore) => (
                      <div key={restore.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-sm" data-testid={`restore-name-${restore.id}`}>
                              {restore.name}
                            </p>
                            {restore.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {restore.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className={`${getStatusColor(restore.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(restore.status)}
                              {restore.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </div>
                        
                        {restore.status === 'in_progress' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{restore.completedSteps}/{restore.totalSteps} steps</span>
                            </div>
                            <Progress 
                              value={restore.totalSteps ? (restore.completedSteps / restore.totalSteps) * 100 : 0} 
                              className="mb-2"
                            />
                            {restore.currentStep && (
                              <p className="text-xs text-muted-foreground">
                                Current: {restore.currentStep}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Backup ID: #{restore.backupId}</span>
                          <span>
                            {formatDistance(new Date(restore.createdAt), new Date(), { addSuffix: true })}
                          </span>
                          {restore.duration && (
                            <span>{restore.duration}s duration</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Backup Settings
                </CardTitle>
                <CardDescription>
                  Configure backup settings and automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Settings configuration coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Configure automated backups, retention policies, and storage options
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Restore Dialog */}
        <Dialog open={createRestoreDialogOpen} onOpenChange={setCreateRestoreDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Restore from Backup</DialogTitle>
              <DialogDescription>
                Restore your website from: {selectedBackupForRestore?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRestore} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restore-name">Restore Name</Label>
                <Input
                  id="restore-name"
                  name="name"
                  required
                  placeholder="Website Restore"
                  data-testid="restore-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restore-description">Description</Label>
                <Textarea
                  id="restore-description"
                  name="description"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <Label>Restore Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="restoreDatabase" name="restoreDatabase" defaultChecked />
                    <Label htmlFor="restoreDatabase" className="text-sm">Database</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="restoreFiles" name="restoreFiles" defaultChecked />
                    <Label htmlFor="restoreFiles" className="text-sm">Files</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="restoreSettings" name="restoreSettings" defaultChecked />
                    <Label htmlFor="restoreSettings" className="text-sm">Settings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="createBackupBeforeRestore" name="createBackupBeforeRestore" defaultChecked />
                    <Label htmlFor="createBackupBeforeRestore" className="text-sm">Create backup before restore</Label>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Important</p>
                    <p className="text-yellow-700">
                      This will replace your current website data. Make sure you have a recent backup.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createRestoreMutation.isPending}
                  data-testid="submit-restore-button"
                  variant="destructive"
                >
                  {createRestoreMutation.isPending ? 'Starting Restore...' : 'Start Restore'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}