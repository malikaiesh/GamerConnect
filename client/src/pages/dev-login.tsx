import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function DevLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin-bypass', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin access granted! Redirecting to dashboard...",
      });
      setTimeout(() => {
        setLocation('/admin');
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to access admin panel",
        variant: "destructive",
      });
    },
  });

  const handleAdminAccess = () => {
    setIsLoading(true);
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Development Login</CardTitle>
          <CardDescription>
            Temporary admin access while database is unavailable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Since the database is currently unavailable, you can use this temporary login to access the admin dashboard.</p>
          </div>
          
          <Button 
            onClick={handleAdminAccess}
            className="w-full"
            disabled={isLoading || loginMutation.isPending}
          >
            {isLoading || loginMutation.isPending ? 'Accessing...' : 'Access Admin Dashboard'}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <p>This bypass is only available in development mode</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}