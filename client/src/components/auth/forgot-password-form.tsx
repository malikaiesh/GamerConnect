import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Loader2, ArrowLeft, Send, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  isAdmin?: boolean;
  onBack: () => void;
}

export function ForgotPasswordForm({ isAdmin = false, onBack }: ForgotPasswordFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  // Submit forgot password request
  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/reset/request-reset', {
        email: values.email,
        isAdmin
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast({
          title: 'Password reset email sent',
          description: 'If your email exists in our system, you will receive password reset instructions shortly.',
          variant: 'default'
        });
      } else {
        // We still show success even if the email doesn't exist for security reasons
        setIsSuccess(true);
        toast({
          title: 'Password reset email sent',
          description: 'If your email exists in our system, you will receive password reset instructions shortly.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast({
        title: 'Error',
        description: 'There was a problem sending the password reset email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email Sent</CardTitle>
          <CardDescription className="text-center">
            If your email exists in our system, you will receive password reset instructions shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div className="rounded-full bg-primary/10 p-6 text-primary">
            <Check className="h-12 w-12" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Please check your inbox and spam folder. The password reset link will expire in 30 minutes.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {isAdmin ? 'Reset Admin Password' : 'Reset Password'}
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      {...field} 
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Reset Link
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send Reset Link
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}