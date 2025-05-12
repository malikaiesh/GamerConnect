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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <AdminNavigation />
      <div className="flex-1 max-w-full overflow-auto">
        {title && (
          <div className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}