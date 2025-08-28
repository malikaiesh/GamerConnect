import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Cloud,
  Upload,
  Send,
  History,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw,
  Info,
  Trash2,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentUrl {
  id: number;
  title: string;
  url: string;
  contentType: 'game' | 'blog_post' | 'page' | 'category';
  contentId: number;
}

interface IndexingRequest {
  id: number;
  url: string;
  contentType: string;
  contentId: number;
  status: string;
  requestType: string;
  submitDate: string;
  indexedDate?: string;
  errorMessage?: string;
  retryCount: number;
}

interface IndexingStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  pendingRequests: number;
  quotaUsedToday: number;
  dailyQuotaLimit: number;
}

interface IndexingSettings {
  id: number;
  autoIndexing: boolean;
  batchSize: number;
  dailyQuotaLimit: number;
  quotaUsedToday: number;
  retryFailedAfterHours: number;
  enableNotifications: boolean;
}

export default function GoogleIndexingPage() {
  const [selectedUrls, setSelectedUrls] = useState<ContentUrl[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch content URLs
  const { data: contentUrls, isLoading: urlsLoading } = useQuery<{contentUrls: ContentUrl[], summary: any}>({
    queryKey: ['/api/google-indexing/content-urls'],
  });

  // Fetch indexing history
  const { data: historyData, isLoading: historyLoading } = useQuery<{history: IndexingRequest[]}>({
    queryKey: ['/api/google-indexing/history'],
  });

  // Fetch indexing stats
  const { data: stats, isLoading: statsLoading } = useQuery<IndexingStats>({
    queryKey: ['/api/google-indexing/stats'],
  });

  // Fetch indexing settings
  const { data: settings } = useQuery<IndexingSettings>({
    queryKey: ['/api/google-indexing/settings'],
  });

  // Upload credentials mutation
  const uploadCredentialsMutation = useMutation({
    mutationFn: (formData: FormData) => 
      fetch('/api/google-indexing/upload-credentials', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Google service account credentials uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/google-indexing'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload credentials",
        variant: "destructive",
      });
    }
  });

  // Submit URLs mutation
  const submitUrlsMutation = useMutation({
    mutationFn: (urls: {url: string, contentType: string, contentId: number}[]) =>
      apiRequest('/api/google-indexing/submit-bulk', {
        method: 'POST',
        body: { urls }
      }),
    onSuccess: (data: any) => {
      toast({
        title: "Submission Complete",
        description: `${data.summary.successful} URLs submitted successfully, ${data.summary.failed} failed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/google-indexing'] });
      setSelectedUrls([]);
      setManualUrl("");
      setBulkUrls("");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit URLs",
        variant: "destructive",
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<IndexingSettings>) =>
      apiRequest('/api/google-indexing/settings', {
        method: 'PUT',
        body: settings
      }),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Google Indexing settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/google-indexing/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: () =>
      fetch('/api/google-indexing/test-connection', {
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File",
        description: "Please upload a JSON file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('credentials', file);
    
    uploadCredentialsMutation.mutate(formData);
  };

  const handleSelectUrl = (url: ContentUrl, checked: boolean) => {
    if (checked) {
      setSelectedUrls(prev => [...prev, url]);
    } else {
      setSelectedUrls(prev => prev.filter(u => u.id !== url.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && contentUrls) {
      setSelectedUrls(contentUrls.contentUrls);
    } else {
      setSelectedUrls([]);
    }
  };

  const submitSelectedUrls = () => {
    if (selectedUrls.length === 0) {
      toast({
        title: "No URLs Selected",
        description: "Please select at least one URL to submit",
        variant: "destructive",
      });
      return;
    }

    const urlsToSubmit = selectedUrls.map(url => ({
      url: url.url,
      contentType: url.contentType,
      contentId: url.contentId
    }));

    submitUrlsMutation.mutate(urlsToSubmit);
  };

  const submitManualUrl = () => {
    if (!manualUrl.trim()) return;

    const urlsToSubmit = [{
      url: manualUrl.trim(),
      contentType: 'page' as const,
      contentId: 0
    }];

    submitUrlsMutation.mutate(urlsToSubmit);
  };

  const submitBulkUrls = () => {
    if (!bulkUrls.trim()) return;

    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'))
      .map((url, index) => ({
        url,
        contentType: 'page' as const,
        contentId: index
      }));

    if (urls.length === 0) {
      toast({
        title: "No Valid URLs",
        description: "Please enter valid HTTP/HTTPS URLs, one per line",
        variant: "destructive",
      });
      return;
    }

    submitUrlsMutation.mutate(urls);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      submitted: { variant: "default", icon: CheckCircle },
      indexed: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
      rate_limited: { variant: "secondary", icon: AlertCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Google Indexing" description="Submit your content to Google for faster indexing">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Google Indexing</h1>
            <p className="text-muted-foreground">Submit your content to Google for faster indexing</p>
          </div>
          <Button
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${testConnectionMutation.isPending ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quota Used</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotaUsedToday}/{stats.dailyQuotaLimit}</div>
              <Progress 
                value={(stats.quotaUsedToday / stats.dailyQuotaLimit) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>
          </div>
        )}

        <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Upload size={16} />
            Setup
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Send size={16} />
            Submit URLs
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Google Service Account Setup
              </CardTitle>
              <CardDescription>
                Upload your Google Search Console API service account JSON file to enable indexing functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Setup Instructions</AlertTitle>
                <AlertDescription>
                  1. Go to Google Cloud Console → APIs & Services → Credentials<br/>
                  2. Create a service account with Search Console API access<br/>
                  3. Download the JSON key file and upload it here<br/>
                  4. Add the service account email to your Search Console property
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="credentials-file">Service Account JSON File</Label>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadCredentialsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} />
                    {uploadCredentialsMutation.isPending ? 'Uploading...' : 'Upload Credentials'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {uploadCredentialsMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading and validating credentials...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit URLs Tab */}
        <TabsContent value="submit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content URLs Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Select Content URLs
                </CardTitle>
                <CardDescription>
                  Select existing content to submit for indexing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentUrls && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedUrls.length === contentUrls.contentUrls.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all" className="text-sm font-medium">
                        Select All ({contentUrls.contentUrls.length})
                      </Label>
                    </div>
                    <Badge variant="outline">
                      {selectedUrls.length} selected
                    </Badge>
                  </div>
                )}
                
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {urlsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading content URLs...
                    </div>
                  ) : contentUrls?.contentUrls.length ? (
                    <div className="p-4 space-y-2">
                      {contentUrls.contentUrls.map((url) => (
                        <div key={`${url.contentType}-${url.id}`} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded">
                          <Checkbox
                            id={`url-${url.contentType}-${url.id}`}
                            checked={selectedUrls.some(s => s.id === url.id && s.contentType === url.contentType)}
                            onCheckedChange={(checked) => handleSelectUrl(url, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{url.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{url.url}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {url.contentType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No content URLs found
                    </div>
                  )}
                </div>

                <Button 
                  onClick={submitSelectedUrls}
                  disabled={selectedUrls.length === 0 || submitUrlsMutation.isPending}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Selected URLs ({selectedUrls.length})
                </Button>
              </CardContent>
            </Card>

            {/* Manual URL Submission */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Single URL</CardTitle>
                  <CardDescription>
                    Manually enter a URL to submit for indexing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-url">URL</Label>
                    <Input
                      id="manual-url"
                      type="url"
                      placeholder="https://example.com/page"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={submitManualUrl}
                    disabled={!manualUrl.trim() || submitUrlsMutation.isPending}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit URL
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bulk URL Submission</CardTitle>
                  <CardDescription>
                    Submit multiple URLs at once (one per line)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-urls">URLs (one per line)</Label>
                    <Textarea
                      id="bulk-urls"
                      placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                      rows={6}
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={submitBulkUrls}
                    disabled={!bulkUrls.trim() || submitUrlsMutation.isPending}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Bulk URLs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Indexing History
              </CardTitle>
              <CardDescription>
                View all indexing requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Loading history...</p>
                </div>
              ) : historyData?.history.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.history.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="max-w-md">
                              <a 
                                href={request.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                              >
                                <span className="truncate">{request.url}</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.contentType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(request.submitDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.status === 'failed' && (
                              <Button size="sm" variant="outline">
                                <RefreshCw size={12} className="mr-1" />
                                Retry
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No indexing history found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Indexing Settings
              </CardTitle>
              <CardDescription>
                Configure Google Indexing behavior and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Indexing</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically submit new content for indexing
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoIndexing}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({ autoIndexing: checked })
                      }
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      min="1"
                      max="200"
                      defaultValue={settings.batchSize}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= 200) {
                          updateSettingsMutation.mutate({ batchSize: value });
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of URLs to process in each batch (1-200)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily-limit">Daily Quota Limit</Label>
                    <Input
                      id="daily-limit"
                      type="number"
                      min="1"
                      max="1000"
                      defaultValue={settings.dailyQuotaLimit}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= 1000) {
                          updateSettingsMutation.mutate({ dailyQuotaLimit: value });
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum API calls per day (1-1000)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about indexing status changes
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({ enableNotifications: checked })
                      }
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}