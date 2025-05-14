import { ReactNode } from "react";
import AdminLayout from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

interface SecurityLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function SecurityLayout({ children, title, description }: SecurityLayoutProps) {
  const [location] = useLocation();
  
  // Determine which tab is active based on the current location
  const getActiveTab = () => {
    if (location.includes("/two-factor")) return "two-factor";
    if (location.includes("/logs")) return "logs";
    return "settings";
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <CardTitle className="text-foreground">Security Center</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage security settings and features for your gaming website
            </CardDescription>
            
            <div className="mt-4">
              <nav className="flex space-x-2 overflow-x-auto">
                <Link href="/admin/security/two-factor">
                  <a className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.includes("/two-factor") 
                      ? "bg-primary/15 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  )}>
                    Two-Factor Authentication
                  </a>
                </Link>
                <Link href="/admin/security/logs">
                  <a className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.includes("/logs") 
                      ? "bg-primary/15 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  )}>
                    Security Logs
                  </a>
                </Link>
                <Link href="/admin/security/settings">
                  <a className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.includes("/settings") 
                      ? "bg-primary/15 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  )}>
                    Security Settings
                  </a>
                </Link>
              </nav>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 bg-background">
            {children}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}