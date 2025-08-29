import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, User, Home, FileText, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
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
}).refine(
  (data) => {
    if (data.requestType === 'user' && !data.username) {
      return false;
    }
    if (data.requestType === 'room' && !data.roomIdText) {
      return false;
    }
    return true;
  },
  {
    message: "Username is required for user verification, Room ID is required for room verification",
    path: ["username"],
  }
);

type VerificationFormData = z.infer<typeof verificationFormSchema>;

export default function VerificationPage() {
  const [requestType, setRequestType] = useState<'user' | 'room'>('user');
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
    }
  });

  const submitVerificationRequest = useMutation({
    mutationFn: async (data: VerificationFormData) => {
      return apiRequest('POST', '/api/verification-requests', data);
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
    submitVerificationRequest.mutate(data);
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
                                      <SelectItem value="">Loading plans...</SelectItem>
                                    ) : verificationPlans.length === 0 ? (
                                      <SelectItem value="">No verification plans available</SelectItem>
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

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={submitVerificationRequest.isPending}
                          data-testid="submit-verification-request"
                        >
                          {submitVerificationRequest.isPending ? 'Submitting...' : 'Submit Verification Request'}
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
    </div>
  );
}