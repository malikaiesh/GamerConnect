import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { ShoppingCartProvider } from '@/context/shopping-cart-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShoppingCartProvider>
          {children}
          <Toaster />
        </ShoppingCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
