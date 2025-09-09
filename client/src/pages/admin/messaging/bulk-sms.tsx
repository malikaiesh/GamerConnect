import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Crown, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MessageSquare,
  Phone
} from "lucide-react";

interface User {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
}

interface MessageStats {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  usersWithPhone: number;
}

export default function BulkSMSPage() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [scheduledFor, setScheduledFor] = useState("");
  const [sendImmediately, setSendImmediately] = useState(true);
  const [includeUnverified, setIncludeUnverified] = useState(true);
  const [includeAdmins, setIncludeAdmins] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch users for selection
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: targetAudience === 'selected'
  });

  // Fetch message statistics
  const { data: stats } = useQuery<MessageStats>({
    queryKey: ['/api/admin/messaging/stats'],
  });

  // Send bulk SMS mutation
  const sendBulkSMSMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/messaging/bulk-sms', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS Campaign Sent",
        description: "Your bulk SMS message has been successfully sent to all selected recipients.",
        variant: "default",
      });
      setMessage("");
      setSubject("");
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send SMS",
        description: error.message || "There was an error sending your bulk SMS message.",
        variant: "destructive",
      });
    },
  });

  const handleSendSMS = () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    const smsData = {
      message: message.trim(),
      subject: subject.trim() || "Gaming Portal Notification",
      targetAudience,
      includeUnverified,
      includeAdmins,
      selectedUsers: targetAudience === 'selected' ? selectedUsers : undefined,
      scheduledFor: !sendImmediately && scheduledFor ? new Date(scheduledFor).toISOString() : null,
    };

    sendBulkSMSMutation.mutate(smsData);
  };

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((user: User) => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const getRecipientCount = () => {
    if (targetAudience === 'selected') {
      return selectedUsers.length;
    }
    if (!stats) return 0;
    
    let count = stats.usersWithPhone;
    if (!includeUnverified) {
      count = stats.verifiedUsers;
    }
    if (!includeAdmins) {
      count -= stats.adminUsers;
    }
    return count;
  };

  const estimatedCost = getRecipientCount() * 0.05; // $0.05 per SMS

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk SMS Messaging</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Send SMS messages to multiple users at once
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            SMS Campaign
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Users</p>
                  <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Users with Phone</p>
                  <p className="text-2xl font-bold">{stats.usersWithPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Admin Users</p>
                  <p className="text-2xl font-bold">{stats.adminUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Compose SMS Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="SMS Campaign Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-testid="input-sms-subject"
              />
            </div>

            <div>
              <Label htmlFor="message">SMS Message *</Label>
              <Textarea
                id="message"
                placeholder="Type your SMS message here... (160 characters recommended)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                data-testid="textarea-sms-message"
              />
              <p className="text-sm text-gray-500 mt-1">
                {message.length}/160 characters {message.length > 160 && "(May be split into multiple SMS)"}
              </p>
            </div>

            <div>
              <Label>Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger data-testid="select-target-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified Users Only</SelectItem>
                  <SelectItem value="unverified">Unverified Users Only</SelectItem>
                  <SelectItem value="admins">Admin Users Only</SelectItem>
                  <SelectItem value="selected">Selected Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetAudience === 'all' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-unverified"
                    checked={includeUnverified}
                    onCheckedChange={setIncludeUnverified}
                    data-testid="checkbox-include-unverified"
                  />
                  <Label htmlFor="include-unverified">Include unverified users</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-admins"
                    checked={includeAdmins}
                    onCheckedChange={setIncludeAdmins}
                    data-testid="checkbox-include-admins"
                  />
                  <Label htmlFor="include-admins">Include admin users</Label>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="send-immediately">Send Immediately</Label>
                <Switch
                  id="send-immediately"
                  checked={sendImmediately}
                  onCheckedChange={setSendImmediately}
                  data-testid="switch-send-immediately"
                />
              </div>

              {!sendImmediately && (
                <div>
                  <Label htmlFor="scheduled-for">Schedule For</Label>
                  <Input
                    id="scheduled-for"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    data-testid="input-scheduled-for"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Selection & Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients & Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Summary */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{getRecipientCount()} recipients</strong> will receive this SMS message.
                <br />
                Estimated cost: <strong>${estimatedCost.toFixed(2)}</strong>
              </AlertDescription>
            </Alert>

            {targetAudience === 'selected' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Users</Label>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllUsers}
                      data-testid="button-select-all"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      data-testid="button-clear-selection"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                  {usersLoading ? (
                    <p className="text-sm text-gray-500">Loading users...</p>
                  ) : users.length === 0 ? (
                    <p className="text-sm text-gray-500">No users found.</p>
                  ) : (
                    users.map((user: User) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                          data-testid={`checkbox-user-${user.id}`}
                        />
                        <Label htmlFor={`user-${user.id}`} className="flex items-center gap-2 flex-1">
                          <span>{user.displayName || user.username}</span>
                          {user.isVerified && <Crown className="h-3 w-3 text-yellow-500" />}
                          {user.role === 'admin' && <Shield className="h-3 w-3 text-purple-500" />}
                          {user.phone && <Phone className="h-3 w-3 text-green-500" />}
                        </Label>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {selectedUsers.length} users selected
                </p>
              </div>
            )}

            {/* Message Preview */}
            {message && (
              <div className="space-y-2">
                <Label>Message Preview</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">SMS Message</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            )}

            <Separator />

            <Button
              onClick={handleSendSMS}
              disabled={!message.trim() || sendBulkSMSMutation.isPending || getRecipientCount() === 0}
              className="w-full"
              data-testid="button-send-sms"
            >
              {sendBulkSMSMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Sending SMS...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send SMS to {getRecipientCount()} Recipients
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Warning Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> SMS messages will be sent to users' registered phone numbers. 
          Make sure your message content complies with SMS regulations and your terms of service. 
          Message delivery depends on users having valid phone numbers in their profiles.
        </AlertDescription>
      </Alert>
    </div>
  );
}