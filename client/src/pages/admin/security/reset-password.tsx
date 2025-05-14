import { useState } from 'react';
import { useLocation } from 'wouter';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/layout';

// Forgot password schema
const adminResetPasswordSchema = z.object({
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  userType: z.enum(['admin', 'user'], {
    required_error: "Please select a user type",
  })
});

type AdminResetPasswordValues = z.infer<typeof adminResetPasswordSchema>;

export default function SecurityResetPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize form
  const form = useForm<AdminResetPasswordValues>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      email: '',
      userType: 'user'
    }
  });

  // Fetch user data for dropdown
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users/emails'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users/emails');
      return await response.json();
    }
  });

  // Submit handler
  const onSubmit = async (values: AdminResetPasswordValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/reset/request-reset', {
        email: values.email,
        isAdmin: values.userType === 'admin'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        toast({
          title: 'Password reset email sent',
          description: `A password reset email has been sent to ${values.email}.`,
          variant: 'default'
        });
        
        // Reset form
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send password reset email. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while sending the reset email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout 
      title="Password Reset" 
      description="Send password reset emails to users or admin accounts"
    >
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Send Password Reset</CardTitle>
              <CardDescription>
                Send a password reset email to a user or admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="user">Regular User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="user@example.com" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              
              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                  Password reset email sent successfully.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}