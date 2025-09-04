import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CreditCard, Settings, Globe, DollarSign, Key, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { PaymentGateway, InsertPaymentGateway } from "@shared/schema";

const paymentGatewaySchema = z.object({
  name: z.string().min(3, "Gateway name must be at least 3 characters").max(50, "Gateway name must be less than 50 characters"),
  displayName: z.string().min(3, "Display name must be at least 3 characters").max(100, "Display name must be less than 100 characters"),
  gatewayType: z.enum(['stripe', 'paypal', 'razorpay', 'flutterwave', 'mollie', 'square', 'adyen', '2checkout', 'braintree', 'authorize_net', 'manual']),
  methodType: z.enum(['automated', 'manual']),
  status: z.enum(['enabled', 'disabled', 'maintenance']),
  description: z.string().optional(),
  logo: z.string().optional(),
  supportedCurrencies: z.array(z.enum(['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT'])).min(1, "At least one currency must be supported"),
  minimumAmount: z.number().min(1, "Minimum amount must be at least 1"),
  maximumAmount: z.number().optional(),
  processingFee: z.number().min(0, "Processing fee cannot be negative").max(10000, "Processing fee cannot exceed 100%"),
  isTestMode: z.boolean(),
  paymentInstructions: z.string().optional(),
  apiConfiguration: z.object({
    apiKey: z.string().optional(),
    secretKey: z.string().optional(),
    publicKey: z.string().optional(),
    merchantId: z.string().optional(),
    webhookSecret: z.string().optional(),
    sandboxApiKey: z.string().optional(),
    sandboxSecretKey: z.string().optional()
  }).optional(),
  accountDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    beneficiaryName: z.string().optional(),
    cryptoAddress: z.string().optional(),
    additionalInfo: z.string().optional()
  }).optional()
});

type PaymentGatewayForm = z.infer<typeof paymentGatewaySchema>;

export default function PaymentGatewaysPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gateways, isLoading } = useQuery<PaymentGateway[]>({
    queryKey: ["/api/admin/payment-gateways"]
  });

  const createGatewayMutation = useMutation({
    mutationFn: async (data: PaymentGatewayForm) => {
      return apiRequest("/api/admin/payment-gateways", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-gateways"] });
      setIsCreateModalOpen(false);
      toast({ title: "Success", description: "Payment gateway created successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PaymentGatewayForm }) => {
      return apiRequest(`/api/admin/payment-gateways/${id}`, { method: "PUT", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-gateways"] });
      setIsEditModalOpen(false);
      setEditingGateway(null);
      toast({ title: "Success", description: "Payment gateway updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const toggleGatewayMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      try {
        return await apiRequest(`/api/admin/payment-gateways/${id}/status`, { method: "PATCH", body: { status } });
      } catch (error: any) {
        // Handle authentication errors specifically
        if (error.message.includes('Not authenticated') || error.message.includes('401')) {
          throw new Error('Authentication required. Please log in as an administrator.');
        }
        // Handle HTML responses (like DOCTYPE errors)
        if (error.message.includes('DOCTYPE') || error.message.includes('Unexpected token')) {
          throw new Error('Server error: Please refresh the page and try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-gateways"] });
      toast({ title: "Success", description: "Gateway status updated successfully!" });
    },
    onError: (error: Error) => {
      console.error('Payment gateway toggle error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update gateway status. Please try again.", 
        variant: "destructive" 
      });
    }
  });

  const deleteGatewayMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/payment-gateways/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-gateways"] });
      toast({ title: "Success", description: "Payment gateway deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const createForm = useForm<PaymentGatewayForm>({
    resolver: zodResolver(paymentGatewaySchema),
    defaultValues: {
      status: 'disabled',
      methodType: 'automated',
      supportedCurrencies: ['USD'],
      minimumAmount: 100,
      processingFee: 0,
      isTestMode: true
    }
  });

  const editForm = useForm<PaymentGatewayForm>({
    resolver: zodResolver(paymentGatewaySchema)
  });

  const onCreateSubmit = (data: PaymentGatewayForm) => {
    createGatewayMutation.mutate(data);
  };

  const onEditSubmit = (data: PaymentGatewayForm) => {
    if (!editingGateway) return;
    updateGatewayMutation.mutate({ id: editingGateway.id, data });
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    editForm.reset({
      name: gateway.name,
      displayName: gateway.displayName,
      gatewayType: gateway.gatewayType,
      methodType: gateway.methodType,
      status: gateway.status,
      description: gateway.description || "",
      logo: gateway.logo || "",
      supportedCurrencies: gateway.supportedCurrencies,
      minimumAmount: gateway.minimumAmount || 100,
      maximumAmount: gateway.maximumAmount || undefined,
      processingFee: gateway.processingFee || 0,
      isTestMode: gateway.isTestMode,
      paymentInstructions: gateway.paymentInstructions || "",
      apiConfiguration: gateway.apiConfiguration || {},
      accountDetails: gateway.accountDetails || {}
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enabled':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Enabled</Badge>;
      case 'disabled':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Disabled</Badge>;
      case 'maintenance':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGatewayLogo = (gatewayType: string) => {
    const icons: Record<string, JSX.Element> = {
      stripe: <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">ST</div>,
      paypal: <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">PP</div>,
      razorpay: <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">RP</div>,
      flutterwave: <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">FW</div>,
      mollie: <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">ML</div>,
      manual: <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold"><CreditCard className="w-4 h-4" /></div>
    };
    return icons[gatewayType] || <CreditCard className="w-8 h-8 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Payment Gateways" description="Manage your payment processing methods">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Payment Gateways" description="Manage your payment processing methods">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div></div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
            <Button data-testid="button-create-gateway">
              <Plus className="w-4 h-4 mr-2" />
              Add Gateway
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Payment Gateway</DialogTitle>
              <DialogDescription>Configure a new payment processing method</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gateway Name</FormLabel>
                        <FormControl>
                          <Input placeholder="stripe-main" {...field} data-testid="input-gateway-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Stripe Payments" {...field} data-testid="input-display-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="gatewayType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gateway Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gateway-type">
                              <SelectValue placeholder="Select gateway" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="razorpay">Razorpay</SelectItem>
                            <SelectItem value="flutterwave">Flutterwave</SelectItem>
                            <SelectItem value="mollie">Mollie</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="adyen">Adyen</SelectItem>
                            <SelectItem value="2checkout">2Checkout</SelectItem>
                            <SelectItem value="braintree">Braintree</SelectItem>
                            <SelectItem value="authorize_net">Authorize.Net</SelectItem>
                            <SelectItem value="manual">Manual Payment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="methodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Method Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-method-type">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="automated">Automated</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Gateway description..." {...field} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="minimumAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Amount (cents)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-minimum-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="processingFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Processing Fee (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value) * 100)} data-testid="input-processing-fee" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={createForm.control}
                    name="isTestMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-test-mode" />
                        </FormControl>
                        <FormLabel>Test Mode</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* API Configuration Section */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-lg font-medium flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Configure API keys and credentials for automated payment processing.
                  </p>
                  
                  {/* Watch gateway type to show appropriate fields */}
                  {createForm.watch("gatewayType") === "stripe" && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg dark:bg-blue-950/20">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">ST</div>
                        <span className="font-medium">Stripe Configuration</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Get your API keys from: <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → API Keys</a>
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.publicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishable Key</FormLabel>
                              <FormControl>
                                <Input placeholder="pk_test_..." {...field} data-testid="input-stripe-public-key" />
                              </FormControl>
                              <FormDescription className="text-xs">Starts with pk_test_ or pk_live_</FormDescription>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="sk_test_..." {...field} data-testid="input-stripe-secret-key" />
                              </FormControl>
                              <FormDescription className="text-xs">Starts with sk_test_ or sk_live_</FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={createForm.control}
                        name="apiConfiguration.webhookSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Secret (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="whsec_..." {...field} data-testid="input-stripe-webhook-secret" />
                            </FormControl>
                            <FormDescription className="text-xs">For webhook verification (starts with whsec_)</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {createForm.watch("gatewayType") === "paypal" && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg dark:bg-blue-950/20">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <div className="w-6 h-6 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">PP</div>
                        <span className="font-medium">PayPal Configuration</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Get your credentials from: <a href="https://developer.paypal.com/developer/applications/" target="_blank" rel="noopener noreferrer" className="underline">PayPal Developer → My Apps & Credentials</a>
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Client ID" {...field} data-testid="input-paypal-client-id" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Client Secret" {...field} data-testid="input-paypal-secret" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {createForm.watch("gatewayType") === "razorpay" && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg dark:bg-blue-950/20">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">RP</div>
                        <span className="font-medium">Razorpay Configuration</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Get your keys from: <a href="https://dashboard.razorpay.com/#/app/keys" target="_blank" rel="noopener noreferrer" className="underline">Razorpay Dashboard → API Keys</a>
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key ID</FormLabel>
                              <FormControl>
                                <Input placeholder="rzp_test_..." {...field} data-testid="input-razorpay-key-id" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Key Secret" {...field} data-testid="input-razorpay-secret" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {createForm.watch("gatewayType") === "manual" && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg dark:bg-gray-900/20">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">Manual Payment Details</span>
                      </div>
                      <FormField
                        control={createForm.control}
                        name="accountDetails.bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First National Bank" {...field} data-testid="input-bank-name" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="accountDetails.accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890" {...field} data-testid="input-account-number" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="accountDetails.routingNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Routing Number</FormLabel>
                              <FormControl>
                                <Input placeholder="123456789" {...field} data-testid="input-routing-number" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {!["stripe", "paypal", "razorpay", "manual"].includes(createForm.watch("gatewayType")) && createForm.watch("gatewayType") && (
                    <div className="space-y-4 bg-orange-50 p-4 rounded-lg dark:bg-orange-950/20">
                      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Generic API Configuration</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input placeholder="API Key" {...field} data-testid="input-generic-api-key" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="apiConfiguration.secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Secret Key" {...field} data-testid="input-generic-secret" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGatewayMutation.isPending} data-testid="button-save-gateway">
                    {createGatewayMutation.isPending ? "Creating..." : "Create Gateway"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {gateways && gateways.length > 0 ? (
          gateways.map((gateway) => (
            <Card key={gateway.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getGatewayLogo(gateway.gatewayType)}
                  <div>
                    <h3 className="text-lg font-semibold">{gateway.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{gateway.description || gateway.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(gateway.status)}
                      <Badge variant="outline" className="text-xs">
                        {gateway.methodType}
                      </Badge>
                      {gateway.isTestMode && <Badge variant="outline" className="text-xs bg-yellow-50">Test</Badge>}
                      {gateway.methodType === 'automated' && gateway.apiConfiguration && 
                       Object.values(gateway.apiConfiguration).some((val: any) => val && val.trim && val.trim() !== '') && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          <Key className="w-3 h-3 mr-1" />
                          API Configured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <p className="font-medium">Min: ${(gateway.minimumAmount || 0) / 100}</p>
                    <p className="text-muted-foreground">Fee: {((gateway.processingFee || 0) / 100).toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {gateway.supportedCurrencies?.join(', ') || 'No currencies'}
                    </p>
                  </div>
                  <Switch
                    checked={gateway.status === 'enabled'}
                    onCheckedChange={(checked) =>
                      toggleGatewayMutation.mutate({
                        id: gateway.id,
                        status: checked ? 'enabled' : 'disabled'
                      })
                    }
                    data-testid={`switch-gateway-${gateway.id}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(gateway)}
                    data-testid={`button-edit-${gateway.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this gateway?')) {
                        deleteGatewayMutation.mutate(gateway.id);
                      }
                    }}
                    data-testid={`button-delete-${gateway.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Gateways</h3>
            <p className="text-muted-foreground mb-4">
              Set up your first payment gateway to start processing payments
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-first-gateway">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Gateway
            </Button>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment Gateway</DialogTitle>
            <DialogDescription>Update gateway configuration</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gateway Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., stripe-main" {...field} data-testid="input-edit-name" />
                      </FormControl>
                      <FormDescription>Unique identifier for this gateway</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Stripe" {...field} data-testid="input-edit-display-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="gatewayType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gateway Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-gateway-type">
                            <SelectValue placeholder="Select gateway" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="2checkout">2Checkout</SelectItem>
                          <SelectItem value="braintree">Braintree</SelectItem>
                          <SelectItem value="authorize_net">Authorize.Net</SelectItem>
                          <SelectItem value="manual">Manual Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="methodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-method-type">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="automated">Automated</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Gateway description..." {...field} data-testid="textarea-edit-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="minimumAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Amount (cents)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-edit-minimum-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="processingFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Fee (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value) * 100)} data-testid="input-edit-processing-fee" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <FormField
                  control={editForm.control}
                  name="isTestMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-edit-test-mode" />
                      </FormControl>
                      <FormLabel>Test Mode</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateGatewayMutation.isPending} data-testid="button-update-gateway">
                  {updateGatewayMutation.isPending ? "Updating..." : "Update Gateway"}
                </Button>
              </div>
            </form>
          </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}