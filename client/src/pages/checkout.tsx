import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  DollarSign,
  Globe,
  Smartphone,
  Lock
} from "lucide-react";
import type { PricingPlan, PaymentGateway } from "@shared/schema";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get plan ID and type from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  const checkoutType = urlParams.get('type'); // 'verification' or null

  // Fetch the selected pricing plan
  const { data: plan, isLoading: planLoading } = useQuery<PricingPlan>({
    queryKey: [`/api/pricing-plans/public/${planId}`],
    enabled: !!planId,
  });

  // Fetch available payment gateways
  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery<PaymentGateway[]>({
    queryKey: ['/api/payment-gateways/public'],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: {
      planId: number;
      gatewayId: number;
      amount: number;
      currency: string;
    }) => {
      return apiRequest("POST", "/api/payment-transactions", data);
    },
    onSuccess: (transaction) => {
      toast({
        title: "Transaction Initiated",
        description: `Transaction ${transaction.transactionId} has been created successfully.`,
      });
      
      // If this is a verification checkout, also create the verification request
      if (checkoutType === 'verification') {
        createVerificationRequestAfterPayment(transaction);
      }
      
      // Redirect to appropriate payment flow based on gateway type
      if (selectedGateway?.methodType === 'automated') {
        handleAutomatedPayment(transaction);
      } else {
        handleManualPayment(transaction);
      }
    },
    onError: (error: any) => {
      if (error.message?.includes('401') || error.message?.includes('Authentication required')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to complete your purchase.",
          variant: "destructive",
        });
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        }, 2000);
      } else {
        toast({
          title: "Transaction Failed",
          description: error.message || "Failed to create transaction. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleAutomatedPayment = async (transaction: any) => {
    try {
      // Use generic payment processing endpoint for all gateways
      const response = await apiRequest('POST', '/api/payment/process', {
        transactionId: transaction.id,
        gatewayType: selectedGateway?.gatewayType
      });

      // Show payment instructions to user
      toast({
        title: "Payment Processing",
        description: response.message || `Payment initiated via ${selectedGateway?.displayName}`,
      });

      // For demo purposes, simulate payment processing
      // In a real implementation, you would redirect to the gateway's payment page
      setTimeout(() => {
        toast({
          title: "Payment Demo",
          description: `This is a demo. In production, you would be redirected to ${selectedGateway?.displayName} to complete payment.`,
          variant: "default",
        });
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Payment Processing Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManualPayment = (transaction: any) => {
    // For manual payments, show payment instructions
    setPaymentDialogOpen(true);
    toast({
      title: "Manual Payment Required",
      description: "Please follow the payment instructions and upload your payment proof.",
    });
  };

  const createVerificationRequestAfterPayment = async (transaction: any) => {
    try {
      // Get saved verification form data from localStorage
      const savedData = localStorage.getItem('pendingVerificationRequest');
      if (!savedData) {
        console.error('No pending verification request data found');
        return;
      }

      const verificationData = JSON.parse(savedData);
      
      // Create verification request with payment information
      const verificationRequest = {
        ...verificationData,
        paymentTransactionId: transaction.id,
        paymentScreenshot: `transaction_${transaction.transactionId}`,
        paymentMethod: 'international'
      };

      // Submit verification request
      const response = await apiRequest('POST', '/api/verification-requests', verificationRequest);
      
      toast({
        title: "Verification Request Submitted",
        description: "Your verification request has been submitted and will be reviewed after payment confirmation.",
      });

      // Clear saved data
      localStorage.removeItem('pendingVerificationRequest');
      
    } catch (error) {
      console.error('Error creating verification request:', error);
      toast({
        title: "Request Submission Failed",
        description: "Payment was initiated but verification request could not be submitted. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleProceedToPayment = () => {
    if (!plan || !selectedGateway) {
      toast({
        title: "Selection Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    createTransactionMutation.mutate({
      planId: plan.id,
      gatewayId: selectedGateway.id,
      amount: plan.price,
      currency: plan.currency,
    });

    setTimeout(() => setIsProcessing(false), 2000);
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const getGatewayIcon = (gatewayType: string) => {
    switch (gatewayType) {
      case 'stripe':
      case 'paypal':
      case 'razorpay':
        return <CreditCard className="h-4 w-4" />;
      case 'manual':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (!planId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Invalid Request</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                No pricing plan selected. Please go back and select a plan.
              </p>
              <Button 
                onClick={() => setLocation('/pricing-plans')} 
                className="w-full"
                data-testid="button-back-to-plans"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing Plans
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (planLoading || gatewaysLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Plan Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                The requested pricing plan could not be found.
              </p>
              <Button 
                onClick={() => setLocation('/pricing-plans')} 
                className="w-full"
                data-testid="button-back-to-plans"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing Plans
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const enabledGateways = gateways.filter(g => g.status === 'enabled');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Checkout Content */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/pricing-plans')}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Checkout
            </h1>
            <p className="text-muted-foreground mt-2">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{plan.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{plan.shortDescription}</p>
                      {plan.planType === 'diamonds' && plan.diamondAmount && (
                        <Badge variant="secondary" className="mt-1">
                          {plan.diamondAmount} Diamonds
                        </Badge>
                      )}
                      {plan.planType === 'verification' && plan.verificationDuration && (
                        <Badge variant="secondary" className="mt-1">
                          {plan.verificationDuration} days
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      {plan.originalPrice && plan.originalPrice > plan.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(plan.originalPrice, plan.currency)}
                        </div>
                      )}
                      <div className="font-bold text-lg">
                        {formatPrice(plan.price, plan.currency)}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(plan.price, plan.currency)}</span>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Included Features:</h4>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enabledGateways.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No payment methods available at the moment.</p>
                      <p className="text-sm text-muted-foreground mt-2">Please contact support for assistance.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3">
                        {enabledGateways.map((gateway) => (
                          <label key={gateway.id} className="cursor-pointer">
                            <Card className={`transition-all ${
                              selectedGateway?.id === gateway.id 
                                ? 'ring-2 ring-primary border-primary' 
                                : 'hover:shadow-md'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="gateway"
                                    value={gateway.id}
                                    checked={selectedGateway?.id === gateway.id}
                                    onChange={() => setSelectedGateway(gateway)}
                                    className="h-4 w-4"
                                    data-testid={`radio-gateway-${gateway.gatewayType}`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      {getGatewayIcon(gateway.gatewayType)}
                                      <span className="font-medium">{gateway.displayName}</span>
                                      {gateway.methodType === 'automated' && (
                                        <Badge variant="secondary">
                                          <Globe className="h-3 w-3 mr-1" />
                                          International
                                        </Badge>
                                      )}
                                      {gateway.methodType === 'manual' && (
                                        <Badge variant="outline">
                                          <Smartphone className="h-3 w-3 mr-1" />
                                          Local
                                        </Badge>
                                      )}
                                    </div>
                                    {gateway.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {gateway.description}
                                      </p>
                                    )}
                                    {gateway.processingFee > 0 && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Processing fee: {(gateway.processingFee / 100).toFixed(2)}%
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </label>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>

                      <Button 
                        onClick={handleProceedToPayment}
                        disabled={!selectedGateway || isProcessing || createTransactionMutation.isPending}
                        className="w-full"
                        size="lg"
                        data-testid="button-proceed-payment"
                      >
                        {isProcessing || createTransactionMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Payment ({formatPrice(plan.price, plan.currency)})
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Payment Instructions Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Payment Instructions</DialogTitle>
            <DialogDescription>
              Complete your payment using the selected method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedGateway?.paymentInstructions && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{selectedGateway.paymentInstructions}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                After completing the payment, you will receive a confirmation email with further instructions.
              </p>
            </div>
            <Button 
              onClick={() => {
                setPaymentDialogOpen(false);
                setLocation('/pricing-plans');
              }}
              className="w-full"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}