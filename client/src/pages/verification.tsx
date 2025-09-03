import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, User, Home, FileText, DollarSign, CheckCircle2, AlertCircle, CreditCard, Upload, FileImage } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { PricingPlan } from "@shared/schema";

const verificationFormSchema = z.object({
  requestType: z.enum(['user', 'room'], {
    required_error: "Please select a verification type",
  }),
  username: z.string().optional(),
  roomIdText: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must be less than 500 characters"),
  additionalInfo: z.string().optional(),
  pricingPlanId: z.number({
    required_error: "Please select a pricing plan",
  }),
  paymentMethod: z.enum(['international', 'local'], {
    required_error: "Please select a payment method",
  }),
  paymentScreenshot: z.string().optional(),
}).refine(
  (data) => {
    if (data.requestType === 'user' && !data.username) {
      return false;
    }
    if (data.requestType === 'room' && !data.roomIdText) {
      return false;
    }
    if (data.paymentMethod === 'local' && !data.paymentScreenshot) {
      return false;
    }
    return true;
  },
  {
    message: "Username is required for user verification, Room ID is required for room verification, Payment screenshot is required for local payment",
    path: ["username"],
  }
);

type VerificationFormData = z.infer<typeof verificationFormSchema>;

export default function VerificationPage() {
  const [requestType, setRequestType] = useState<'user' | 'room'>('user');
  const [paymentMethod, setPaymentMethod] = useState<'international' | 'local'>('international');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verification pricing plans
  const { data: verificationPlans = [], isLoading: loadingPlans } = useQuery<PricingPlan[]>({
    queryKey: ['/api/pricing-plans/type/verification'],
  });

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      requestType: 'user',
      reason: '',
      additionalInfo: '',
      paymentMethod: 'international',
    }
  });

  // File upload handler
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const result = await response.json();
      setUploadedImageUrl(result.url);
      form.setValue('paymentScreenshot', result.url);
      
      toast({
        title: "File Uploaded",
        description: "Payment screenshot uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload payment screenshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethodChange = (method: 'international' | 'local') => {
    setPaymentMethod(method);
    form.setValue('paymentMethod', method);
    if (method === 'international') {
      form.setValue('paymentScreenshot', '');
      setUploadedImageUrl('');
    }
  };

  const submitVerificationRequest = useMutation({
    mutationFn: async (data: VerificationFormData) => {
      return apiRequest('/api/verification-requests', { method: 'POST', body: data });
    },
    onSuccess: () => {
      toast({
        title: "Verification Request Submitted",
        description: "Your verification request has been submitted successfully. You will be notified once it's reviewed.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VerificationFormData) => {
    if (data.paymentMethod === 'international') {
      // For international payments, open payment dialog
      setPaymentDialogOpen(true);
    } else {
      // For local payments, submit directly (payment screenshot already uploaded)
      submitVerificationRequest.mutate(data);
    }
  };

  const handleInternationalPayment = async () => {
    // Process international payment here (Stripe/PayPal integration)
    // For now, we'll simulate payment completion
    const formData = form.getValues();
    submitVerificationRequest.mutate({
      ...formData,
      paymentScreenshot: 'international_payment_completed'
    });
    setPaymentDialogOpen(false);
  };

  const selectedPlan = verificationPlans.find(plan => plan.id === form.watch('pricingPlanId'));

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden" style={{
        background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 45% 15%) 100%)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
      }}>
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-20 w-80 h-80 rounded-full bg-green-500/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mx-auto mb-6 p-4 rounded-full bg-blue-500/10 w-fit">
              <Shield className="h-12 w-12 text-blue-400" />
            </div>
            <h1 className="heading-xl mb-4 text-white">
              Get <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Verified</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Stand out with a verified badge. Submit your verification request with required documents and payment.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Form Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Verification Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Verification Request Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* Request Type */}
                        <FormField
                          control={form.control}
                          name="requestType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Type *</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setRequestType(value as 'user' | 'room');
                                  }}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="user" id="user" />
                                    <label htmlFor="user" className="flex items-center gap-2 cursor-pointer">
                                      <User className="h-4 w-4" />
                                      User Account Verification
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="room" id="room" />
                                    <label htmlFor="room" className="flex items-center gap-2 cursor-pointer">
                                      <Home className="h-4 w-4" />
                                      Room Verification
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Username or Room ID */}
                        {requestType === 'user' ? (
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your username" 
                                    {...field}
                                    data-testid="input-username"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={form.control}
                            name="roomIdText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Room ID *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter room ID (e.g., SA1994181)" 
                                    {...field}
                                    data-testid="input-room-id"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Pricing Plan Selection */}
                        <FormField
                          control={form.control}
                          name="pricingPlanId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Plan *</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <SelectTrigger data-testid="select-pricing-plan">
                                    <SelectValue placeholder="Select a verification plan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loadingPlans ? (
                                      <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                                    ) : verificationPlans.length === 0 ? (
                                      <SelectItem value="no-plans" disabled>No verification plans available</SelectItem>
                                    ) : (
                                      verificationPlans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                          {plan.displayName} - {formatPrice(plan.price, plan.currency)}
                                          {plan.verificationDuration && ` (${plan.verificationDuration} days)`}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Reason */}
                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason for Verification *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Explain why you want to get verified (minimum 10 characters)"
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="textarea-reason"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Additional Information */}
                        <FormField
                          control={form.control}
                          name="additionalInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Information (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any additional information you'd like to provide"
                                  className="min-h-[80px]"
                                  {...field}
                                  data-testid="textarea-additional-info"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Payment Method Selection */}
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method *</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setPaymentMethod(value as 'international' | 'local');
                                  }}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                  data-testid="payment-method-selection"
                                >
                                  <div className="relative">
                                    <RadioGroupItem value="international" id="international" className="peer sr-only" />
                                    <label
                                      htmlFor="international"
                                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary cursor-pointer"
                                    >
                                      <CreditCard className="h-6 w-6 mb-2" />
                                      <div className="text-center">
                                        <div className="font-medium">International Payment</div>
                                        <div className="text-sm text-muted-foreground">Stripe/PayPal</div>
                                      </div>
                                    </label>
                                  </div>
                                  <div className="relative">
                                    <RadioGroupItem value="local" id="local" className="peer sr-only" />
                                    <label
                                      htmlFor="local"
                                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary cursor-pointer"
                                    >
                                      <FileImage className="h-6 w-6 mb-2" />
                                      <div className="text-center">
                                        <div className="font-medium">Local Payment</div>
                                        <div className="text-sm text-muted-foreground">Bank Transfer + Screenshot</div>
                                      </div>
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Payment Screenshot Upload for Local Payment */}
                        {paymentMethod === 'local' && (
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <h4 className="font-medium mb-2">Local Payment Instructions</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Please transfer the payment amount to our local account and upload the screenshot of your payment receipt below.
                              </p>
                              <div className="text-sm">
                                <strong>Bank Details:</strong><br />
                                Account Name: Gaming Platform<br />
                                Account Number: 1234567890<br />
                                Bank: Local Bank<br />
                                Reference: Your Username + "verification"
                              </div>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="paymentScreenshot"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Payment Screenshot *</FormLabel>
                                  <FormControl>
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-center w-full">
                                        <label
                                          htmlFor="payment-screenshot"
                                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                        >
                                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                              <span className="font-semibold">Click to upload</span> payment screenshot
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                          </div>
                                          <input
                                            id="payment-screenshot"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                setSelectedFile(file);
                                                // Simulate file upload - in real app this would upload to server
                                                const url = URL.createObjectURL(file);
                                                setUploadedImageUrl(url);
                                                field.onChange(url);
                                              }
                                            }}
                                            data-testid="payment-screenshot-upload"
                                          />
                                        </label>
                                      </div>
                                      {uploadedImageUrl && (
                                        <div className="mt-4">
                                          <p className="text-sm font-medium mb-2">Uploaded Screenshot:</p>
                                          <img 
                                            src={uploadedImageUrl} 
                                            alt="Payment Screenshot" 
                                            className="max-w-full h-auto max-h-48 rounded-lg border"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={submitVerificationRequest.isPending}
                          data-testid="submit-verification-request"
                        >
                          {submitVerificationRequest.isPending ? 'Submitting...' : 
                           paymentMethod === 'international' ? 'Proceed to Payment' : 'Submit Verification Request'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Plan Details & Info */}
              <div className="space-y-6">
                
                {/* Selected Plan Details */}
                {selectedPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Selected Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{selectedPlan.displayName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(selectedPlan.price, selectedPlan.currency)}
                          </span>
                          {selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(selectedPlan.originalPrice, selectedPlan.currency)}
                            </span>
                          )}
                        </div>
                        {selectedPlan.description && (
                          <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                        )}
                        {selectedPlan.features && selectedPlan.features.length > 0 && (
                          <div className="space-y-2">
                            {selectedPlan.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Verification Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      Verification Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>Submit your verification request with payment</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>Our team will review your request within 24-48 hours</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>You'll receive an email notification with the decision</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>Verified accounts get a blue checkmark badge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">For User Verification:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Active account for at least 30 days</li>
                        <li>Genuine gaming activity</li>
                        <li>Valid reason for verification</li>
                        <li>No recent violations</li>
                      </ul>
                      
                      <p className="font-medium mt-4">For Room Verification:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Room must be active and popular</li>
                        <li>Good community management</li>
                        <li>No inappropriate content</li>
                        <li>Regular activity and engagement</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Dialog for International Payments */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlan && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span>{selectedPlan.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{formatPrice(selectedPlan.price, selectedPlan.currency)}</span>
                  </div>
                  {selectedPlan.verificationDuration && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{selectedPlan.verificationDuration} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">Select Payment Method</h4>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                  onClick={() => {
                    toast({
                      title: "Payment Processing",
                      description: "Redirecting to payment processor...",
                    });
                    // In a real app, this would redirect to actual payment processor
                    setTimeout(() => {
                      const formData = form.getValues();
                      submitVerificationRequest.mutate({
                        ...formData,
                        paymentScreenshot: 'international_payment_completed'
                      });
                      setPaymentDialogOpen(false);
                    }, 2000);
                  }}
                  data-testid="pay-with-stripe"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay with Credit Card
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                  onClick={() => {
                    toast({
                      title: "Payment Processing",
                      description: "Redirecting to digital wallet...",
                    });
                    // In a real app, this would redirect to PayPal or other wallet
                    setTimeout(() => {
                      const formData = form.getValues();
                      submitVerificationRequest.mutate({
                        ...formData,
                        paymentScreenshot: 'digital_wallet_payment_completed'
                      });
                      setPaymentDialogOpen(false);
                    }, 2000);
                  }}
                  data-testid="pay-with-wallet"
                >
                  <DollarSign className="h-4 w-4" />
                  Pay with Digital Wallet
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}