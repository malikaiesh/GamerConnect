import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Smartphone, 
  Clock, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';

export interface SecurityLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function SecurityLayout({ children, title, description }: SecurityLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:gap-10">
        <aside className="md:w-52 lg:w-64 shrink-0 md:border-r pb-12 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-auto">
          <nav className="grid gap-2 p-2 md:p-4">
            <h3 className="mb-2 px-4 text-lg font-semibold">Security</h3>
            <Link href="/admin/security/two-factor">
              <Button 
                variant={location === "/admin/security/two-factor" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Two-Factor Auth
              </Button>
            </Link>
            <Link href="/admin/security/logs">
              <Button 
                variant={location === "/admin/security/logs" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Clock className="h-4 w-4 mr-2" />
                Security Logs
              </Button>
            </Link>
            <Link href="/admin/security/settings">
              <Button 
                variant={location === "/admin/security/settings" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-1 md:px-0">
          {children}
        </main>
      </div>
    </div>
  );
}