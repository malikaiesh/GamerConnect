import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import GamePage from "@/pages/game-page";
import BlogPage from "@/pages/blog-page";
import BlogPostPage from "@/pages/blog-post-page";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminGames from "@/pages/admin/games";
import AdminBlog from "@/pages/admin/blog";
import AdminSettings from "@/pages/admin/settings";
import { Providers } from "./lib/providers";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/game/:id" component={GamePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/games" component={AdminGames} adminOnly={true} />
      <ProtectedRoute path="/admin/blog" component={AdminBlog} adminOnly={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} adminOnly={true} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Providers>
      <ThemeProvider defaultTheme="modern" defaultMode="light">
        <Router />
        <Toaster />
      </ThemeProvider>
    </Providers>
  );
}

export default App;
