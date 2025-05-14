import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Reset password schema for admins
const adminResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type AdminResetPasswordValues = z.infer<typeof adminResetPasswordSchema>;

export default function AdminResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form with token from URL
  const form = useForm<AdminResetPasswordValues>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      token: new URLSearchParams(window.location.search).get('token') || '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: AdminResetPasswordValues) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/reset/reset-password', {
        token: values.token,
        password: values.password,
        isAdmin: true
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been reset. You can now log in with your new password.',
          variant: 'default'
        });
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          setLocation('/auth');
        }, 3000);
      } else {
        toast({
          title: 'Password Reset Failed',
          description: data.message || 'Failed to reset password. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while resetting your password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Admin Password Reset Successful</CardTitle>
            <CardDescription>Your password has been reset successfully.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>You will be redirected to the login page in a few seconds.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setLocation('/auth')}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Invalid or missing token
  if (!form.getValues().token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription>
              No reset token provided. Please use the link from your email.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setLocation('/auth')}>Return to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button 
            variant="ghost" 
            className="mb-4 p-0 h-auto" 
            onClick={() => setLocation('/auth')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <CardTitle>Reset Admin Password</CardTitle>
          <CardDescription>
            Enter a new password for your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your new password" {...field} />
                    </FormControl>
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
                      <Input type="password" placeholder="Confirm your new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}