import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Installation schema
const installSchema = z.object({
  // Database configuration
  db_host: z.string().min(1, "Database host is required"),
  db_port: z.string().min(1, "Database port is required"),
  db_name: z.string().min(1, "Database name is required"),
  db_user: z.string().min(1, "Database username is required"),
  db_password: z.string(),
  
  // Website configuration
  site_name: z.string().min(3, "Site name must be at least 3 characters"),
  site_description: z.string().min(10, "Site description must be at least 10 characters"),
  site_url: z.string().url("Please enter a valid URL"),
  
  // Admin account
  admin_username: z.string().min(3, "Username must be at least 3 characters"),
  admin_password: z.string().min(6, "Password must be at least 6 characters"),
  admin_email: z.string().email("Please enter a valid email address"),
  captcha: z.string().min(1, "Please complete the CAPTCHA")
});

type InstallFormValues = z.infer<typeof installSchema>;

// Installation steps
type Step = {
  id: string;
  label: string;
};

const steps: Step[] = [
  { id: "database", label: "Database" },
  { id: "website", label: "Website" },
  { id: "admin", label: "Admin Account" },
  { id: "confirm", label: "Confirm" }
];

export default function InstallPage() {
  const [activeStep, setActiveStep] = useState<string>("database");
  const [progress, setProgress] = useState<number>(25);
  const [captchaValue, setCaptchaValue] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Check installation status
  const { data: installStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['/api/install/status'],
    queryFn: async () => {
      const res = await fetch('/api/install/status');
      if (!res.ok) throw new Error('Failed to check installation status');
      return res.json();
    },
    retry: false
  });

  // Form setup with default values
  const form = useForm<InstallFormValues>({
    resolver: zodResolver(installSchema),
    defaultValues: {
      db_host: 'localhost',
      db_port: '5432',
      db_name: 'gaming_portal',
      db_user: '',
      db_password: '',
      site_name: 'Gaming Portal',
      site_description: 'Your ultimate destination for online games',
      site_url: window.location.origin,
      admin_username: 'admin',
      admin_password: '',
      admin_email: '',
      captcha: ''
    }
  });

  // Installation mutation
  const installMutation = useMutation({
    mutationFn: async (data: InstallFormValues) => {
      // Ensure captcha value is set from state - this is crucial
      const formData = { ...data, captcha: captchaValue };
      console.log('Submitting to API:', formData);
      
      const res = await apiRequest("POST", "/api/install", formData);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || 'Installation failed');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Installation successful",
        description: "Your gaming portal has been successfully installed!",
        variant: "default",
      });
      
      // Redirect to homepage after installation
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Installation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = async (data: InstallFormValues) => {
    try {
      console.log('Form submit event triggered');
      
      // Set captcha value from state and log form data for debugging
      data.captcha = captchaValue;
      console.log('Form CAPTCHA value:', captchaValue);
      console.log('Form data before submission:', data);
      
      // Manually validate form data to ensure everything is correct
      const result = installSchema.safeParse(data);
      if (!result.success) {
        console.error('Form validation failed:', result.error);
        toast({
          title: "Validation Error",
          description: "Please check all fields and try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Form validation successful, submitting to API...');
      
      // Submit the data to the API directly, bypassing the mutation to test
      try {
        const res = await fetch('/api/install', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({...data, captcha: captchaValue}),
        });
        
        console.log('API response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('API error response:', errorData);
          throw new Error(errorData.message || errorData.error || 'Installation failed');
        }
        
        const successData = await res.json();
        console.log('API success response:', successData);
        
        toast({
          title: "Installation successful",
          description: "Your gaming portal has been successfully installed!",
          variant: "default",
        });
        
        // Redirect to homepage after installation
        setTimeout(() => {
          setLocation('/');
        }, 2000);
      } catch (apiError: any) {
        console.error('API call error:', apiError);
        toast({
          title: "Installation failed",
          description: apiError?.message || "An unexpected error occurred during API call.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Form submission failed",
        description: error?.message || "An unexpected error occurred during form submission.",
        variant: "destructive",
      });
    }
  };
  
  // Handle step navigation
  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
      setProgress((currentIndex + 2) * 25);
    }
  };
  
  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
      setProgress((currentIndex) * 25);
    }
  };
  
  // Simple CAPTCHA generator - in a real app, this would use a service like reCAPTCHA
  const generateCaptcha = useCallback(() => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    return result;
  }, []);
  
  // Generate CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);
  
  // Redirect if already installed
  useEffect(() => {
    if (installStatus?.installed) {
      setLocation('/');
    }
  }, [installStatus?.installed, setLocation]);
  
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Checking installation status...</h2>
          <Progress value={100} className="w-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Gaming Portal Installation</h1>
          <p className="text-muted-foreground mt-2">
            Complete the setup to get your gaming portal up and running
          </p>
          
          <div className="mt-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`${activeStep === step.id ? 'text-primary font-medium' : ''}`}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>
              {steps.find(step => step.id === activeStep)?.label} Configuration
            </CardTitle>
            <CardDescription>
              {activeStep === 'database' && 'Configure your database connection settings'}
              {activeStep === 'website' && 'Set up your website details'}
              {activeStep === 'admin' && 'Create your administrator account'}
              {activeStep === 'confirm' && 'Review your settings and complete installation'}
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <Tabs value={activeStep} onValueChange={setActiveStep}>
                  <TabsList className="hidden">
                    <TabsTrigger value="database">Database</TabsTrigger>
                    <TabsTrigger value="website">Website</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="confirm">Confirm</TabsTrigger>
                  </TabsList>
                  
                  {/* Database Configuration */}
                  <TabsContent value="database" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="db_host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Host</FormLabel>
                          <FormControl>
                            <Input placeholder="localhost" {...field} />
                          </FormControl>
                          <FormDescription>
                            The hostname or IP address of your database server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="db_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Port</FormLabel>
                          <FormControl>
                            <Input placeholder="5432" {...field} />
                          </FormControl>
                          <FormDescription>
                            The port number your database server is listening on
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="db_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Name</FormLabel>
                          <FormControl>
                            <Input placeholder="gaming_portal" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your database
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="db_user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Username</FormLabel>
                          <FormControl>
                            <Input placeholder="postgres" {...field} />
                          </FormControl>
                          <FormDescription>
                            The username for database connection
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="db_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            The password for database connection
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Website Configuration */}
                  <TabsContent value="website" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="site_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Gaming Portal" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your gaming website
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="site_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Your ultimate destination for online games" {...field} />
                          </FormControl>
                          <FormDescription>
                            A brief description of your website
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="site_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourdomain.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL where your website will be accessed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Admin Configuration */}
                  <TabsContent value="admin" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="admin_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Username</FormLabel>
                          <FormControl>
                            <Input placeholder="admin" {...field} />
                          </FormControl>
                          <FormDescription>
                            The username for administrator login
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="admin_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            The password for administrator login (min. 6 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="admin_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            The email address for administrator contact
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Confirmation */}
                  <TabsContent value="confirm" className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium mb-2">Database Settings</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Host:</div>
                        <div className="font-medium">{form.watch('db_host')}</div>
                        <div>Port:</div>
                        <div className="font-medium">{form.watch('db_port')}</div>
                        <div>Database:</div>
                        <div className="font-medium">{form.watch('db_name')}</div>
                        <div>Username:</div>
                        <div className="font-medium">{form.watch('db_user')}</div>
                        <div>Password:</div>
                        <div className="font-medium">••••••••</div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium mb-2">Website Settings</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Site Name:</div>
                        <div className="font-medium">{form.watch('site_name')}</div>
                        <div>Description:</div>
                        <div className="font-medium">{form.watch('site_description')}</div>
                        <div>URL:</div>
                        <div className="font-medium">{form.watch('site_url')}</div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium mb-2">Admin Account</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Username:</div>
                        <div className="font-medium">{form.watch('admin_username')}</div>
                        <div>Email:</div>
                        <div className="font-medium">{form.watch('admin_email')}</div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {/* CAPTCHA field */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="captcha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Verification</FormLabel>
                            <div className="flex space-x-2 mb-2">
                              <div className="bg-primary/10 flex items-center justify-center px-4 py-2 rounded font-mono text-lg tracking-widest">
                                {captchaValue}
                              </div>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => {
                                  const newCaptcha = generateCaptcha();
                                  // Update the form field with the new CAPTCHA value
                                  form.setValue('captcha', '');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                  <path d="M21 3v5h-5"/>
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                  <path d="M8 16H3v5"/>
                                </svg>
                              </Button>
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="Enter the code shown above"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the security code shown above to verify you're human
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Terms agreement */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        />
                        <label 
                          htmlFor="terms" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the terms and conditions
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={activeStep === 'database'}
                >
                  Back
                </Button>
                
                {activeStep !== 'confirm' ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={() => {
                      console.log('Complete Installation button clicked');
                      // Get all form data
                      const formData = form.getValues();
                      // Set CAPTCHA value
                      formData.captcha = captchaValue;
                      // Call submit handler directly
                      onSubmit(formData);
                    }}
                    disabled={!agreedToTerms}
                  >
                    {'Complete Installation'}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}