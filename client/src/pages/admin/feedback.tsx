import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { type Feedback } from "@shared/schema";
import { 
  MessageSquare, 
  Send, 
  Bug, 
  Lightbulb, 
  MessageCircle, 
  AlertTriangle, 
  Star,
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Filter,
  Search,
  Reply,
  ChevronRight
} from "lucide-react";
import { z } from "zod";

const respondSchema = z.object({
  adminResponse: z.string().min(10, "Response must be at least 10 characters").max(2000, "Response must be less than 2000 characters"),
  status: z.enum(['pending', 'in_review', 'resolved', 'closed'])
});

type RespondFormData = z.infer<typeof respondSchema>;

interface FeedbackWithUser extends Feedback {
  user: {
    id: number;
    username: string;
    displayName: string | null;
    email: string | null;
  };
  respondedByUser?: {
    id: number;
    username: string;
    displayName: string | null;
  };
}

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);

  // Fetch all feedback
  const { data: allFeedback = [], isLoading, refetch } = useQuery<FeedbackWithUser[]>({
    queryKey: ["/api/admin/feedback"],
  });

  // Filter feedback based on filters
  const filteredFeedback = allFeedback.filter(feedback => {
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    const matchesType = typeFilter === "all" || feedback.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || feedback.priority === priorityFilter;
    const matchesSearch = searchQuery === "" || 
      feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  });

  // Group feedback by status for stats
  const stats = {
    total: allFeedback.length,
    pending: allFeedback.filter(f => f.status === 'pending').length,
    inReview: allFeedback.filter(f => f.status === 'in_review').length,
    resolved: allFeedback.filter(f => f.status === 'resolved').length,
    closed: allFeedback.filter(f => f.status === 'closed').length,
  };

  const form = useForm<RespondFormData>({
    resolver: zodResolver(respondSchema),
    defaultValues: {
      adminResponse: "",
      status: "in_review"
    },
  });

  // Respond to feedback mutation
  const respondMutation = useMutation({
    mutationFn: (data: { feedbackId: number; response: RespondFormData }) => 
      apiRequest(`/api/admin/feedback/${data.feedbackId}/respond`, { 
        method: "POST", 
        body: data.response 
      }),
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the user.",
      });
      setIsRespondDialogOpen(false);
      setSelectedFeedback(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send response",
        variant: "destructive",
      });
    }
  });

  const onSubmitResponse = (data: RespondFormData) => {
    if (!selectedFeedback) return;
    respondMutation.mutate({ feedbackId: selectedFeedback.id, response: data });
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug_report': return <Bug className="w-4 h-4" />;
      case 'feature_request': return <Lightbulb className="w-4 h-4" />;
      case 'complaint': return <AlertTriangle className="w-4 h-4" />;
      case 'suggestion': return <MessageCircle className="w-4 h-4" />;
      case 'praise': return <ThumbsUp className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_review': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug_report': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'feature_request': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'complaint': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'suggestion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'praise': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Feedback Management</h1>
            <p className="text-muted-foreground">Manage user feedback and support requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold">{stats.inReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold">{stats.closed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-feedback"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="general_feedback">General Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="select-priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback ({filteredFeedback.length})</CardTitle>
          <CardDescription>
            Click on any feedback to view details and respond
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading feedback...</p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No feedback found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((feedback) => (
                <Card 
                  key={feedback.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedFeedback(feedback);
                    form.setValue("status", feedback.status);
                    setIsRespondDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getFeedbackTypeIcon(feedback.type)}
                          <h3 className="font-medium">{feedback.subject}</h3>
                          <Badge 
                            variant="secondary" 
                            className={getTypeColor(feedback.type)}
                            data-testid={`badge-type-${feedback.id}`}
                          >
                            {feedback.type.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${getPriorityColor(feedback.priority)} text-white`}
                            data-testid={`badge-priority-${feedback.id}`}
                          >
                            {feedback.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {feedback.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {feedback.user.displayName || feedback.user.username}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </div>
                          {feedback.respondedAt && (
                            <div className="flex items-center gap-1">
                              <Reply className="w-4 h-4" />
                              Responded {new Date(feedback.respondedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(feedback.status)}
                        <Badge 
                          variant="outline"
                          data-testid={`badge-status-${feedback.id}`}
                        >
                          {feedback.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Provide a response to this user's feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6">
              {/* Feedback Details */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getFeedbackTypeIcon(selectedFeedback.type)}
                      <h3 className="font-medium">{selectedFeedback.subject}</h3>
                      <Badge className={getTypeColor(selectedFeedback.type)}>
                        {selectedFeedback.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm">{selectedFeedback.message}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>From: {selectedFeedback.user.displayName || selectedFeedback.user.username}</span>
                      <span>Priority: {selectedFeedback.priority}</span>
                      <span>Submitted: {new Date(selectedFeedback.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Form */}
              <form onSubmit={form.handleSubmit(onSubmitResponse)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Update Status</Label>
                  <Select 
                    value={form.watch("status")} 
                    onValueChange={(value) => form.setValue("status", value as any)}
                  >
                    <SelectTrigger data-testid="select-response-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminResponse">Your Response</Label>
                  <Textarea
                    id="adminResponse"
                    placeholder="Write your response to the user..."
                    rows={4}
                    {...form.register("adminResponse")}
                    data-testid="textarea-admin-response"
                  />
                  {form.formState.errors.adminResponse && (
                    <p className="text-sm text-destructive">{form.formState.errors.adminResponse.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsRespondDialogOpen(false)}
                    data-testid="button-cancel-response"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={respondMutation.isPending}
                    data-testid="button-send-response"
                  >
                    {respondMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}