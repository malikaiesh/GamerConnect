import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, MessageCircle, Gift, Home, Plus } from "lucide-react";
import { SiteSetting } from "@shared/schema";

// Form validation schemas
const userLoginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const userRegisterSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100),
  confirmPassword: z.string(),
  bio: z.string().max(500, { message: "Bio should be less than 500 characters" }).optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UserLoginValues = z.infer<typeof userLoginSchema>;
type UserRegisterValues = z.infer<typeof userRegisterSchema>;

export default function UserLoginPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Fetch site settings for logo configuration
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // User login form
  const loginForm = useForm<UserLoginValues>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // User register form
  const registerForm = useForm<UserRegisterValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      country: "",
    },
  });

  // Handle user login form submission
  const onLoginSubmit = (values: UserLoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        // Redirect to user dashboard
        setTimeout(() => navigate('/my-rooms'), 1000);
      }
    });
  };

  // Handle user registration form submission
  const onRegisterSubmit = (values: UserRegisterValues) => {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
      email: values.email || undefined,
      bio: values.bio || undefined,
      country: values.country || undefined,
    }, {
      onSuccess: () => {
        setTimeout(() => navigate('/my-rooms'), 1000);
      }
    });
  };

  // Quick user login for development
  const quickUserLogin = () => {
    loginMutation.mutate({
      username: "user",
      password: "user123"
    }, {
      onSuccess: () => {
        setTimeout(() => navigate('/my-rooms'), 1000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-teal-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Site Logo and Title */}
          <div className="text-center mb-8">
            {settings?.siteLogo && (
              <img
                src={settings.siteLogo}
                alt={settings.siteTitle}
                className="h-16 w-auto mx-auto mb-4"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              User Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your rooms, chat with friends, and connect with others
            </p>
          </div>

          {/* User Features Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-sm">My Rooms</div>
                  <div className="text-xs text-muted-foreground">Create & manage</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-sm">Chat & Voice</div>
                  <div className="text-xs text-muted-foreground">Connect with others</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-sm">Virtual Gifts</div>
                  <div className="text-xs text-muted-foreground">Send & receive</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-sm">Friends</div>
                  <div className="text-xs text-muted-foreground">Build connections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Login/Register Card */}
          <Card data-testid="card-user-auth">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Join the Community</CardTitle>
              <CardDescription>
                Sign in to access your personal room dashboard and connect with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4 mt-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your username"
                                data-testid="input-user-username"
                                disabled={isLoading || loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                data-testid="input-user-password"
                                disabled={isLoading || loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {loginMutation.error && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                          {loginMutation.error?.message || "Login failed. Please check your credentials."}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || loginMutation.isPending}
                        data-testid="button-user-login"
                      >
                        {(isLoading || loginMutation.isPending) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>

                      {/* Development Quick Login */}
                      {process.env.NODE_ENV === 'development' && (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                                Development Only
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={quickUserLogin}
                            disabled={isLoading || loginMutation.isPending}
                            data-testid="button-quick-user-login"
                          >
                            Quick User Login
                          </Button>
                        </>
                      )}
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4 mt-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Choose a username"
                                data-testid="input-register-username"
                                disabled={isLoading || registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Enter your email address"
                                data-testid="input-register-email"
                                disabled={isLoading || registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Create a password"
                                data-testid="input-register-password"
                                disabled={isLoading || registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Confirm your password"
                                data-testid="input-register-confirm-password"
                                disabled={isLoading || registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us about yourself..."
                                data-testid="input-register-bio"
                                disabled={isLoading || registerMutation.isPending}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {registerMutation.error && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                          {registerMutation.error?.message || "Registration failed. Please try again."}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || registerMutation.isPending}
                        data-testid="button-user-register"
                      >
                        {(isLoading || registerMutation.isPending) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="text-center mt-6 space-y-2">
            <div>
              <button
                onClick={() => navigate('/admin-login')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Platform Admin Login →
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                ← Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}