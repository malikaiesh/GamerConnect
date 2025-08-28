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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Shield, Settings, Users, Database } from "lucide-react";
import { SiteSetting } from "@shared/schema";

// Form validation schema for admin login
const adminLoginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const { user, loginMutation, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Fetch site settings for logo configuration
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Admin login form
  const loginForm = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle admin login form submission
  const onLoginSubmit = (values: AdminLoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        // Redirect to admin dashboard
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      }
    });
  };

  // Quick admin login for development
  const quickAdminLogin = () => {
    loginMutation.mutate({
      username: "admin",
      password: "admin123"
    }, {
      onSuccess: () => {
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
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
              Platform Admin Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Secure access for system administrators
            </p>
          </div>

          {/* Admin Features Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-sm">User Management</div>
                  <div className="text-xs text-muted-foreground">Manage platform users</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-sm">Room Oversight</div>
                  <div className="text-xs text-muted-foreground">Monitor all rooms</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-sm">System Settings</div>
                  <div className="text-xs text-muted-foreground">Configure platform</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-semibold text-sm">Security</div>
                  <div className="text-xs text-muted-foreground">Access controls</div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card data-testid="card-admin-login">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Administrator Login</CardTitle>
              <CardDescription>
                Enter your admin credentials to access the platform control panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter admin username"
                            data-testid="input-admin-username"
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
                        <FormLabel>Admin Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter admin password"
                            data-testid="input-admin-password"
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
                    data-testid="button-admin-login"
                  >
                    {(isLoading || loginMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Access Admin Panel
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
                        onClick={quickAdminLogin}
                        disabled={isLoading || loginMutation.isPending}
                        data-testid="button-quick-admin-login"
                      >
                        Quick Admin Login
                      </Button>
                    </>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="text-center mt-6 space-y-2">
            <div>
              <button
                onClick={() => navigate('/user-login')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                User Dashboard Login →
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