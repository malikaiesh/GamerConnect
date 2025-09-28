import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign, 
  Download,
  Eye,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface PurchaseHistoryItem {
  id: number;
  transactionId: string;
  planName?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gatewayType: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export function PurchaseHistory() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: purchases = [], isLoading, refetch } = useQuery<PurchaseHistoryItem[]>({
    queryKey: ['/api/user/purchases'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const filteredPurchases = activeTab === "all" 
    ? purchases 
    : purchases.filter(purchase => purchase.status === activeTab);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Purchase History
          </CardTitle>
          <CardDescription>
            Loading your purchase history...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Purchase History
            </CardTitle>
            <CardDescription>
              View all your past purchases and their status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="refunded">Refunded</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No {activeTab === "all" ? "" : activeTab} purchases
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeTab === "all" 
                    ? "You haven't made any purchases yet." 
                    : `No ${activeTab} purchases found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(purchase.status)}
                          <h3 className="font-medium">
                            {purchase.planName || 'Purchase'}
                          </h3>
                          <Badge className={getStatusColor(purchase.status)}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Transaction ID: {purchase.transactionId}</p>
                          <p>Gateway: {purchase.gatewayType}</p>
                          <p>Date: {format(new Date(purchase.createdAt), 'PPP p')}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatPrice(purchase.amount, purchase.currency)}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {purchase.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}