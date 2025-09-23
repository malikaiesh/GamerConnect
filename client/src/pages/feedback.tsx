import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertFeedbackSchema, type InsertFeedback, type Feedback } from "@shared/schema";
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
  Eye
} from "lucide-react";

type FeedbackFormData = InsertFeedback;

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("submit");

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      type: "general_feedback",
      subject: "",
      message: "",
      priority: "medium",
      userId: user?.id || 0
    },
  });

  // Fetch user's feedback history
  const { data: feedbackHistory = [], isLoading: isLoadingHistory } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback/my-feedback"],
    enabled: !!user?.id
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackFormData) => apiRequest("/api/feedback", { method: "POST", body: data }),
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and respond soon.",
      });
      form.reset();
      setActiveTab("history");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FeedbackFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback",
        variant: "destructive",
      });
      return;
    }
    submitFeedbackMutation.mutate({ ...data, userId: user.id });
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

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to submit feedback.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Feedback Center</h1>
              <p className="text-muted-foreground">Share your thoughts and help us improve</p>
            </div>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" data-testid="tab-submit-feedback">
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-feedback-history">
            <MessageSquare className="w-4 h-4 mr-2" />
            My Feedback ({feedbackHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Feedback</CardTitle>
              <CardDescription>
                We value your opinion! Let us know about bugs, feature requests, or general feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Feedback Type</Label>
                    <Select 
                      value={form.watch("type")} 
                      onValueChange={(value) => form.setValue("type", value as any)}
                    >
                      <SelectTrigger data-testid="select-feedback-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug_report">
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            Bug Report
                          </div>
                        </SelectItem>
                        <SelectItem value="feature_request">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Feature Request
                          </div>
                        </SelectItem>
                        <SelectItem value="general_feedback">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            General Feedback
                          </div>
                        </SelectItem>
                        <SelectItem value="complaint">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Complaint
                          </div>
                        </SelectItem>
                        <SelectItem value="suggestion">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Suggestion
                          </div>
                        </SelectItem>
                        <SelectItem value="praise">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4" />
                            Praise
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.type && (
                      <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={form.watch("priority")} 
                      onValueChange={(value) => form.setValue("priority", value as any)}
                    >
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.priority && (
                      <p className="text-sm text-destructive">{form.formState.errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your feedback"
                    {...form.register("subject")}
                    data-testid="input-subject"
                  />
                  {form.formState.errors.subject && (
                    <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide detailed information about your feedback..."
                    rows={6}
                    {...form.register("message")}
                    data-testid="textarea-message"
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={submitFeedbackMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-feedback"
                >
                  {submitFeedbackMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Feedback History</CardTitle>
              <CardDescription>
                Track the status of your submitted feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading your feedback...</p>
                </div>
              ) : feedbackHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback submitted yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("submit")}
                    className="mt-4"
                    data-testid="button-submit-first-feedback"
                  >
                    Submit Your First Feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackHistory.map((feedback) => (
                    <Card key={feedback.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getFeedbackTypeIcon(feedback.type)}
                              <h3 className="font-medium">{feedback.subject}</h3>
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
                            {feedback.adminResponse && (
                              <div className="bg-muted/50 p-3 rounded-md mb-3">
                                <p className="text-sm font-medium mb-1">Admin Response:</p>
                                <p className="text-sm">{feedback.adminResponse}</p>
                                {feedback.respondedAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Responded on {new Date(feedback.respondedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Submitted {new Date(feedback.createdAt).toLocaleDateString()}</span>
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}