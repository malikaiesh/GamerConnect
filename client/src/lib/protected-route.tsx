import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false
}: {
  path: string;
  component: () => React.JSX.Element;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();

  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - isAdmin:", user?.isAdmin);
  console.log("ProtectedRoute - Path:", path);
  console.log("ProtectedRoute - adminOnly:", adminOnly);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to /auth");
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (adminOnly && !user.isAdmin) {
    console.log("ProtectedRoute - Not admin, redirecting to /");
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  console.log("ProtectedRoute - Access granted");
  return <Route path={path} component={Component} />;
}
