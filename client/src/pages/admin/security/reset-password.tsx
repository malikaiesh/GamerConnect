import React, { useState } from 'react';
import SecurityLayout from '@/components/admin/security/security-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { KeyRound, AlertTriangle, Shield, Lock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const resetPasswordSchema = z.object({
  userId: z.string({
    required_error: "Please select a user",
  }),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string()
    .min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function AdminResetPasswordPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch users with email for the select dropdown
  const { data: apiUsers = [], isLoading: isLoadingUsers, error: usersError } = useQuery<any[]>({
    queryKey: ['/api/admin/users/emails'],
    retry: false,
  });
  
  console.log('API users:', apiUsers);
  console.log('Users error:', usersError);
  
  // Hardcoded users list as fallback in case the API fails
  const hardcodedUsers = [
    { id: 1, username: 'malik', email: null },
    { id: 3, username: 'admin', email: null }
  ];
  
  // Use hardcoded users if API returns empty array
  const users = apiUsers.length > 0 ? apiUsers : hardcodedUsers;
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      userId: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormValues) => {
      const res = await apiRequest('POST', '/api/security/reset-password', {
        userId: data.userId,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "User password was reset successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reset password",
        description: error.message || "An error occurred while resetting the password",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: ResetPasswordFormValues) {
    resetPasswordMutation.mutate(data);
  }
  
  return (
    <SecurityLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Password Management</h1>
          <p className="text-muted-foreground">
            Reset passwords and manage user account access
          </p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 dark:bg-yellow-950/20 dark:border-yellow-900">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 dark:text-yellow-400" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Administrative Action</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Password resets should only be performed when necessary. All actions are logged for security auditing purposes.
              Users will need to change their temporary password upon first login.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle>Reset User Password</CardTitle>
            </div>
            <CardDescription>
              Set a new password for a user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
                      <Select
                        disabled={isLoadingUsers}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* User data debugging */}
                          {Array.isArray(users) && users.length > 0 ? (
                            users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.username} {user.email ? `(${user.email})` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-users">No users available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a user account to reset the password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter new password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 8 characters, should follow your password policy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm new password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Re-enter the new password to confirm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Password Policies</CardTitle>
            </div>
            <CardDescription>
              Current password requirements for user accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="font-medium">Password Requirements</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li className="text-sm">Minimum 8 characters in length</li>
                <li className="text-sm">Must include at least one uppercase letter</li>
                <li className="text-sm">Must include at least one lowercase letter</li>
                <li className="text-sm">Must include at least one number</li>
                <li className="text-sm">Must include at least one special character</li>
              </ul>
            </div>
            
            <div className="rounded-md border p-4">
              <div className="font-medium">Account Security</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li className="text-sm">Passwords expire after 90 days</li>
                <li className="text-sm">Cannot reuse previous 5 passwords</li>
                <li className="text-sm">Account locks after 5 failed login attempts</li>
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/admin/security/settings'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Manage Password Policies
            </Button>
          </CardContent>
        </Card>
      </div>
    </SecurityLayout>
  );
}