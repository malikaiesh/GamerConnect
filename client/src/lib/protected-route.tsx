import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ReactNode } from "react";

// Support both component and children props
type ProtectedRouteProps = {
  adminOnly?: boolean;
} & (
  | {
      path: string;
      component: () => React.JSX.Element;
      children?: never;
    }
  | {
      path?: never;
      component?: never;
      children: ReactNode;
    }
);

export function ProtectedRoute(props: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { adminOnly = false } = props;

  // Check if we're using the path + component pattern or the children pattern
  const isComponentRoute = 'path' in props && 'component' in props;

  // Loading state
  if (isLoading) {
    if (isComponentRoute) {
      return (
        <Route path={props.path}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        </Route>
      );
    } else {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }
  }

  // Not authenticated
  if (!user) {
    if (isComponentRoute) {
      return (
        <Route path={props.path}>
          <Redirect to="/auth" />
        </Route>
      );
    } else {
      return <Redirect to="/auth" />;
    }
  }

  // Not admin
  if (adminOnly && !user.isAdmin) {
    if (isComponentRoute) {
      return (
        <Route path={props.path}>
          <Redirect to="/" />
        </Route>
      );
    } else {
      return <Redirect to="/" />;
    }
  }

  // All checks passed
  if (isComponentRoute) {
    const Component = props.component;
    return <Route path={props.path} component={Component} />;
  } else {
    return <>{props.children}</>;
  }
}