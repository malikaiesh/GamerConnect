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
import CategoriesPage from "@/pages/categories-page";
import TopGamesPage from "@/pages/top-games-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminGames from "@/pages/admin/games";
import AdminBlog from "@/pages/admin/blog";
import AdminSettings from "@/pages/admin/settings";
import AdminHomepageContent from "@/pages/admin/homepage-content";
import { Providers } from "./lib/providers";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/game/:id" component={GamePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/top-games" component={TopGamesPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/games" component={AdminGames} adminOnly={true} />
      <ProtectedRoute path="/admin/blog" component={AdminBlog} adminOnly={true} />
      <ProtectedRoute path="/admin/homepage-content" component={AdminHomepageContent} adminOnly={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} adminOnly={true} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Admin Helper Navigation
const AdminHelperNav = () => {
  return (
    <div className="bg-gray-900 text-white p-2 flex gap-3 text-sm">
      <div>DevHelper:</div>
      <a href="/auth" className="underline hover:text-blue-300">Auth Page</a>
      <div>|</div>
      <a href="/admin/dashboard" className="underline hover:text-blue-300">Admin Dashboard</a>
      <a href="/admin/games" className="underline hover:text-blue-300">Admin Games</a>
      <a href="/admin/blog" className="underline hover:text-blue-300">Admin Blog</a>
      <a href="/admin/homepage-content" className="underline hover:text-blue-300">Admin Content</a>
      <a href="/admin/settings" className="underline hover:text-blue-300">Admin Settings</a>
    </div>
  );
}

function App() {
  return (
    <Providers>
      <ThemeProvider defaultTheme="modern" defaultMode="light">
        <AdminHelperNav />
        <Router />
        <Toaster />
      </ThemeProvider>
    </Providers>
  );
}

export default App;
