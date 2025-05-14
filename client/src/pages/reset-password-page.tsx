import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft, KeyRound, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Password reset schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  // Extract token from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      toast({
        title: 'Missing reset token',
        description: 'The password reset link is invalid or has expired.',
        variant: 'destructive'
      });
      setIsValidating(false);
      return;
    }

    setToken(tokenParam);
    validateToken(tokenParam);
  }, []);

  // Validate token
  const validateToken = async (token: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/reset/validate-token', {
        token,
        isAdmin: false
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsTokenValid(true);
      } else {
        toast({
          title: 'Invalid token',
          description: 'The password reset link is invalid or has expired.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error validating token:', error);
      toast({
        title: 'Error',
        description: 'There was a problem validating your reset token. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Submit password reset
  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/reset/reset-password', {
        token,
        password: values.password,
        isAdmin: false
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast({
          title: 'Password reset successful',
          description: 'Your password has been reset successfully. You can now log in with your new password.',
          variant: 'default'
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      } else {
        toast({
          title: 'Reset failed',
          description: data.message || 'Failed to reset password. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'There was a problem resetting your password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle go back to login
  const handleGoBack = () => {
    setLocation('/login');
  };

  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">Validating your reset token...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid && !isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Invalid Token</CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Password Reset Successful</CardTitle>
            <CardDescription className="text-center">
              Your password has been reset successfully. You will be redirected to the login page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Check className="h-16 w-16 text-green-500" />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            Create a new password for your account
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
                      <Input type="password" placeholder="••••••••" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting Password
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
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}