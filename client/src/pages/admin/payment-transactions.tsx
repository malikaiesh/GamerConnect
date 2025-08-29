import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  User, 
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Download
} from "lucide-react";
import type { PaymentTransaction, PaymentGateway } from "@shared/schema";

export default function PaymentTransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [verificationNotes, setVerificationNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery<(PaymentTransaction & { gateway: PaymentGateway; user: { username: string } })[]>({
    queryKey: ["/api/admin/payment-transactions"]
  });

  const { data: gateways } = useQuery<PaymentGateway[]>({
    queryKey: ["/api/admin/payment-gateways"]
  });

  const verifyTransactionMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: number; 
      status: 'completed' | 'failed'; 
      notes: string;
    }) => {
      return apiRequest("PATCH", `/api/admin/payment-transactions/${id}/verify`, {
        status,
        verificationNotes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-transactions"] });
      setIsVerifyModalOpen(false);
      setSelectedTransaction(null);
      setVerificationNotes("");
      toast({ title: "Success", description: "Transaction verified successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const refundTransactionMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      return apiRequest("POST", `/api/admin/payment-transactions/${id}/refund`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-transactions"] });
      toast({ title: "Success", description: "Refund processed successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-500"><RefreshCw className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'refunded':
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewDetails = (transaction: PaymentTransaction & { gateway: PaymentGateway; user: { username: string } }) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleVerify = (transaction: PaymentTransaction & { gateway: PaymentGateway; user: { username: string } }) => {
    setSelectedTransaction(transaction);
    setIsVerifyModalOpen(true);
  };

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.gateway.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesGateway = gatewayFilter === "all" || transaction.gatewayId.toString() === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  if (isLoading) {
    return (
      <AdminLayout title="Payment Transactions" description="Monitor and manage payment transactions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Payment Transactions" 
      description="Monitor and manage payment transactions"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-transactions"] })} data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions, users, or gateways..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
            <SelectTrigger className="w-48" data-testid="select-gateway-filter">
              <SelectValue placeholder="All Gateways" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              {gateways?.map((gateway) => (
                <SelectItem key={gateway.id} value={gateway.id.toString()}>
                  {gateway.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Transactions ({filteredTransactions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          {transaction.user.username}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.gateway.displayName}</TableCell>
                      <TableCell className="font-semibold">
                        ${(transaction.amount / 100).toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                            data-testid={`button-view-${transaction.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {transaction.status === 'pending' && transaction.gateway.methodType === 'manual' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(transaction)}
                              data-testid={`button-verify-${transaction.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {transaction.status === 'completed' && transaction.refundedAmount === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to refund this transaction?')) {
                                  refundTransactionMutation.mutate({
                                    id: transaction.id,
                                    amount: transaction.amount
                                  });
                                }
                              }}
                              data-testid={`button-refund-${transaction.id}`}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || gatewayFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Payment transactions will appear here once processed"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View complete transaction information</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <p className="font-mono text-sm mt-1">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="font-semibold mt-1">
                    ${(selectedTransaction.amount / 100).toFixed(2)} {selectedTransaction.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gateway</Label>
                  <p className="mt-1">{(selectedTransaction as any).gateway?.displayName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="mt-1">{(selectedTransaction as any).user?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedTransaction.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {selectedTransaction.gatewayTransactionId && (
                <div>
                  <Label className="text-sm font-medium">Gateway Transaction ID</Label>
                  <p className="font-mono text-sm mt-1">{selectedTransaction.gatewayTransactionId}</p>
                </div>
              )}

              {selectedTransaction.failureReason && (
                <div>
                  <Label className="text-sm font-medium">Failure Reason</Label>
                  <p className="text-sm mt-1 text-red-600">{selectedTransaction.failureReason}</p>
                </div>
              )}

              {selectedTransaction.verificationNotes && (
                <div>
                  <Label className="text-sm font-medium">Verification Notes</Label>
                  <p className="text-sm mt-1">{selectedTransaction.verificationNotes}</p>
                </div>
              )}

              {selectedTransaction.metadata && (
                <div>
                  <Label className="text-sm font-medium">Metadata</Label>
                  <pre className="text-xs mt-1 p-3 bg-muted rounded overflow-x-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Modal */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Transaction</DialogTitle>
            <DialogDescription>Confirm the payment status for this manual transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded">
                <p><strong>Transaction:</strong> {selectedTransaction.transactionId}</p>
                <p><strong>Amount:</strong> ${(selectedTransaction.amount / 100).toFixed(2)} {selectedTransaction.currency}</p>
                <p><strong>User:</strong> {(selectedTransaction as any).user?.username}</p>
              </div>
              
              <div>
                <Label htmlFor="verification-notes">Verification Notes</Label>
                <Textarea
                  id="verification-notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about payment verification..."
                  data-testid="textarea-verification-notes"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsVerifyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => verifyTransactionMutation.mutate({
                    id: selectedTransaction.id,
                    status: 'failed',
                    notes: verificationNotes
                  })}
                  disabled={verifyTransactionMutation.isPending}
                  data-testid="button-reject-transaction"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => verifyTransactionMutation.mutate({
                    id: selectedTransaction.id,
                    status: 'completed',
                    notes: verificationNotes
                  })}
                  disabled={verifyTransactionMutation.isPending}
                  data-testid="button-approve-transaction"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}