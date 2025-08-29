import { ReactNode } from "react";
import AdminNavigation from "./navigation";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 max-w-full overflow-auto">
        {title && (
          <div className="bg-card shadow-sm border-b border-border">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {title}
                  </h1>
                  {description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex space-x-3">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}