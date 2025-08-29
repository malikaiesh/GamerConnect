import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  User, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  DollarSign
} from "lucide-react";

interface VerificationRequest {
  id: number;
  requestType: 'user' | 'room';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  username?: string;
  roomIdText?: string;
  reason: string;
  additionalInfo?: string;
  paymentStatus: string;
  reviewNotes?: string;
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  pricingPlan?: {
    id: number;
    displayName: string;
    price: number;
    currency: string;
  };
  reviewedByUser?: {
    id: number;
    username: string;
    displayName?: string;
  };
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  under_review: "bg-blue-500/10 text-blue-600 border-blue-500/20"
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  under_review: AlertCircle
};

const typeIcons = {
  user: User,
  room: Home
};

export default function VerificationRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verification requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['/api/admin/verification-requests', { status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/admin/verification-requests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    }
  });

  // Fetch verification statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/verification-requests/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/verification-requests/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Update verification request status
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/admin/verification-requests/${id}/status`, data);
    },
    onSuccess: () => {
      toast({
        title: "Request Updated",
        description: "Verification request has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests/stats'] });
      setReviewDialogOpen(false);
      resetReviewForm();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update verification request.",
        variant: "destructive",
      });
    },
  });

  const resetReviewForm = () => {
    setSelectedRequest(null);
    setNewStatus("");
    setReviewNotes("");
    setAdminFeedback("");
  };

  const handleReview = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setReviewNotes(request.reviewNotes || "");
    setAdminFeedback(request.adminFeedback || "");
    setReviewDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedRequest || !newStatus) return;
    
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      data: {
        status: newStatus,
        reviewNotes,
        adminFeedback
      }
    });
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const requests = requestsData?.requests || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="heading-lg mb-2">Verification Requests</h1>
          <p className="text-muted-foreground">Manage user and room verification requests from the community.</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.byStatus.approved}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.byStatus.rejected}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading verification requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No verification requests found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request: VerificationRequest) => {
                    const StatusIcon = statusIcons[request.status];
                    const TypeIcon = typeIcons[request.requestType];
                    
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            <span className="capitalize">{request.requestType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {request.requestType === 'user' ? request.username : request.roomIdText}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[request.status]} variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.pricingPlan && (
                            <div className="text-sm">
                              <div className="font-medium">{request.pricingPlan.displayName}</div>
                              <div className="text-muted-foreground">
                                {formatPrice(request.pricingPlan.price, request.pricingPlan.currency)}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            request.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                            request.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                          }>
                            {request.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(request)}
                            data-testid={`review-request-${request.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="capitalize">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Target</label>
                  <p>{selectedRequest.requestType === 'user' ? selectedRequest.username : selectedRequest.roomIdText}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Submitted</label>
                  <p>{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Status</label>
                  <Badge variant="outline">{selectedRequest.paymentStatus}</Badge>
                </div>
              </div>

              {/* Pricing Plan */}
              {selectedRequest.pricingPlan && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Pricing Plan</h3>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>{selectedRequest.pricingPlan.displayName}</span>
                    <span className="text-primary font-medium">
                      {formatPrice(selectedRequest.pricingPlan.price, selectedRequest.pricingPlan.currency)}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-sm font-medium">Reason for Verification</label>
                <div className="mt-1 p-3 border rounded-lg bg-muted/50">
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              </div>

              {/* Additional Info */}
              {selectedRequest.additionalInfo && (
                <div>
                  <label className="text-sm font-medium">Additional Information</label>
                  <div className="mt-1 p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm">{selectedRequest.additionalInfo}</p>
                  </div>
                </div>
              )}

              {/* Review Form */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Admin Review</h3>
                
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Review Notes (Internal)</label>
                  <Textarea
                    placeholder="Internal notes for this review..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Admin Feedback (Visible to User)</label>
                  <Textarea
                    placeholder="Feedback that will be visible to the user..."
                    value={adminFeedback}
                    onChange={(e) => setAdminFeedback(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleUpdateStatus}
                    disabled={updateRequestMutation.isPending || !newStatus}
                    data-testid="update-request-status"
                  >
                    {updateRequestMutation.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}