import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Phone, 
  Mail,
  Bell,
  Bot,
  Users,
  Activity,
  Eye,
  Settings,
  Wand2,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface AutomatedMessageTemplate {
  id: number;
  trigger: string;
  channel: string;
  title: string;
  content: string;
  isActive: boolean;
  variables: string[] | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  createdByUser?: {
    username: string;
  };
}

interface MessageHistory {
  id: number;
  templateId: number;
  userId: number;
  trigger: string;
  channel: string;
  content: string;
  status: string;
  sentAt: string;
  triggerData: any;
  user?: {
    username: string;
  };
}

const triggerOptions = [
  { value: 'purchase_confirmation', label: '🎉 Purchase Confirmation', description: 'Sent when user completes a purchase' },
  { value: 'verification_processing', label: '⏳ Verification Processing', description: 'Sent when verification request is submitted' },
  { value: 'verification_approved', label: '✅ Verification Approved', description: 'Sent when profile/room is verified with blue badge' },
  { value: 'verification_rejected', label: '❌ Verification Rejected', description: 'Sent when verification is denied' },
  { value: 'room_verification_processing', label: '🏠 Room Verification Processing', description: 'Sent when room verification is submitted' },
  { value: 'room_verification_approved', label: '🎊 Room Verification Approved', description: 'Sent when room gets verified' },
  { value: 'room_verification_rejected', label: '🚫 Room Verification Rejected', description: 'Sent when room verification is denied' },
  { value: 'welcome_message', label: '👋 Welcome Message', description: 'Sent to new users upon registration' },
  { value: 'subscription_renewal', label: '🔄 Subscription Renewal', description: 'Sent when subscription renews' },
  { value: 'diamond_purchase', label: '💎 Diamond Purchase', description: 'Sent when user buys diamonds' },
];

const channelOptions = [
  { value: 'in_app', label: 'In-App Message', icon: MessageSquare, color: 'bg-blue-500' },
  { value: 'sms', label: 'SMS', icon: Phone, color: 'bg-green-500' },
  { value: 'email', label: 'Email', icon: Mail, color: 'bg-purple-500' },
  { value: 'push_notification', label: 'Push Notification', icon: Bell, color: 'bg-orange-500' },
];

export default function AutomatedMessagesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AutomatedMessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    trigger: '',
    channel: 'in_app',
    title: '',
    content: '',
    isActive: true,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch automated message templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<AutomatedMessageTemplate[]>({
    queryKey: ['/api/admin/messaging/templates'],
  });

  // Fetch message history
  const { data: history = [], isLoading: historyLoading } = useQuery<MessageHistory[]>({
    queryKey: ['/api/admin/messaging/history'],
  });

  // Create/Update template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingTemplate 
        ? `/api/admin/messaging/templates/${editingTemplate.id}`
        : '/api/admin/messaging/templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messaging/templates'] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        trigger: '',
        channel: 'in_app',
        title: '',
        content: '',
        isActive: true,
      });
      toast({
        title: "Success",
        description: editingTemplate 
          ? "Template updated successfully"
          : "Template created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/messaging/templates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messaging/templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  });

  // Toggle template status mutation
  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest('PUT', `/api/admin/messaging/templates/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messaging/templates'] });
      toast({
        title: "Success",
        description: "Template status updated",
      });
    }
  });

  const handleEdit = (template: AutomatedMessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      trigger: template.trigger,
      channel: template.channel,
      title: template.title,
      content: template.content,
      isActive: template.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.trigger || !formData.channel || !formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    saveTemplateMutation.mutate(formData);
  };

  const getChannelIcon = (channel: string) => {
    const channelOption = channelOptions.find(c => c.value === channel);
    if (channelOption) {
      const Icon = channelOption.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <MessageSquare className="w-4 h-4" />;
  };

  const getTriggerLabel = (trigger: string) => {
    const triggerOption = triggerOptions.find(t => t.value === trigger);
    return triggerOption?.label || trigger;
  };

  const getChannelLabel = (channel: string) => {
    const channelOption = channelOptions.find(c => c.value === channel);
    return channelOption?.label || channel;
  };

  const insertVariable = (variable: string) => {
    const newContent = formData.content + `{${variable}}`;
    setFormData({ ...formData, content: newContent });
  };

  const commonVariables = [
    'username', 'email', 'amount', 'badge_type', 'room_name', 
    'verification_type', 'purchase_item', 'diamond_amount', 'plan_name'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automated Messages</h2>
          <p className="text-muted-foreground">
            Manage automated message templates for purchases, verifications, and user engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild data-testid="button-bulk-sms">
            <Link to="/admin/messaging/bulk-sms">
              <Phone className="h-4 w-4 mr-2" />
              Bulk SMS
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTemplate(null)} data-testid="create-template">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Event</Label>
                  <Select
                    value={formData.trigger}
                    onValueChange={(value) => setFormData({ ...formData, trigger: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div>
                            <div className="font-medium">{trigger.label}</div>
                            <div className="text-xs text-muted-foreground">{trigger.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Channel</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value) => setFormData({ ...formData, channel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelOptions.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          <div className="flex items-center gap-2">
                            <channel.icon className="w-4 h-4" />
                            {channel.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Message Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Congratulations on your purchase!"
                  data-testid="template-title"
                />
              </div>

              <div>
                <Label>Message Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your message here. Use {variable} for personalization."
                  rows={6}
                  data-testid="template-content"
                />
                <div className="mt-2">
                  <Label className="text-sm text-muted-foreground">Quick Variables:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {commonVariables.map((variable) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="text-xs"
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="template-active"
                />
                <Label>Active Template</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveTemplateMutation.isPending}
                  data-testid="save-template"
                >
                  {saveTemplateMutation.isPending
                    ? "Saving..."
                    : editingTemplate
                    ? "Update Template"
                    : "Create Template"
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">
            <Bot className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history">
            <Activity className="w-4 h-4 mr-2" />
            Message History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <Bot className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  No automated message templates yet.<br />
                  Create your first template to start engaging with users automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(template.channel)}
                          <span className="text-sm text-muted-foreground">
                            {getChannelLabel(template.channel)}
                          </span>
                        </div>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={(checked) => 
                            toggleTemplateMutation.mutate({ id: template.id, isActive: checked })
                          }
                          data-testid={`toggle-template-${template.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          data-testid={`edit-template-${template.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`delete-template-${template.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this template? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTemplateMutation.mutate(template.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Trigger: </span>
                        <span className="text-sm">{getTriggerLabel(template.trigger)}</span>
                      </div>
                      <h3 className="font-medium">{template.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(template.createdAt).toLocaleDateString()}
                        {template.createdByUser && ` by ${template.createdByUser.username}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <Activity className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No messages sent yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          {message.user?.username || 'Unknown User'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTriggerLabel(message.trigger)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(message.channel)}
                            <span className="text-sm">{getChannelLabel(message.channel)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={message.status === 'sent' ? 'default' : 'destructive'}>
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(message.sentAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}