import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppHead } from "@/components/app-head";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { Providers } from "./lib/providers";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

// Core components - eagerly loaded for best performance
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AdminResetPasswordPage from "@/pages/admin/reset-password";

// Loading fallback for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

// Lazy loading route components
const GamePage = lazy(() => import("@/pages/game-page"));
const BlogPage = lazy(() => import("@/pages/blog-page"));
const BlogPostPage = lazy(() => import("@/pages/blog-post-page"));
const RandomGameRedirect = lazy(() => import("@/pages/random-game-redirect"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const CategoriesPage = lazy(() => import("@/pages/categories-page"));
const TopGamesPage = lazy(() => import("@/pages/top-games-page"));
const InstallPage = lazy(() => import("@/pages/install-page"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password-page"));

// Static pages
const AboutPage = lazy(() => import("@/pages/about-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const PrivacyPage = lazy(() => import("@/pages/privacy-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const CookiePolicyPage = lazy(() => import("@/pages/cookie-policy-page"));
const FAQPage = lazy(() => import("@/pages/faq-page"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminGames = lazy(() => import("@/pages/admin/games"));
const AdminBlog = lazy(() => import("@/pages/admin/blog"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminHomepageContent = lazy(() => import("@/pages/admin/homepage-content"));
const AdminPagesPage = lazy(() => import("@/pages/admin/pages-page"));
const AdminPageEditPage = lazy(() => import("@/pages/admin/page-edit-page"));
const AdminApiKeysPage = lazy(() => import("@/pages/admin/api-keys-page"));
const AdminHomeAdsPage = lazy(() => import("@/pages/admin/home-ads-page"));
const AdminSitemapsPage = lazy(() => import("@/pages/admin/sitemaps-page"));
const AdminBlogAdsPage = lazy(() => import("@/pages/admin/blog-ads-page"));
const AdminCustomCodePage = lazy(() => import("@/pages/admin/custom-code-page"));
const AdsTxtPage = lazy(() => import("@/pages/admin/ads-txt-page"));
// Admin settings pages
const AdminRedirectsPage = lazy(() => import("@/pages/admin/settings/redirects"));
// Admin accounts pages
const AdminUsersPage = lazy(() => import("@/pages/admin/accounts/users"));
const AdminRolesPage = lazy(() => import("@/pages/admin/accounts/roles"));
const AdminSignupsPage = lazy(() => import("@/pages/admin/accounts/signups"));
const AdminLocationsPage = lazy(() => import("@/pages/admin/accounts/locations"));

// Admin Helper Navigation
const AdminHelperNav = () => {
  const { user } = useAuth();
  
  // Only show admin nav if user is logged in and is an admin
  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background rounded-lg shadow-lg p-2 border border-border">
      <div className="text-xs text-muted-foreground mb-1">Admin Quick Links</div>
      <div className="flex gap-2">
        <a href="/admin/dashboard" className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20">
          Dashboard
        </a>
        <a href="/admin/games" className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20">
          Games
        </a>
        <a href="/admin/blog" className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20">
          Blog
        </a>
      </div>
    </div>
  );
};

function Router() {
  return (
    <Switch>
      {/* Core routes - eager loaded for best performance */}
      <Route path="/" component={HomePage} />
      
      {/* Lazy-loaded routes with suspense */}
      <Route path="/game/:id">
        <Suspense fallback={<LoadingFallback />}><GamePage /></Suspense>
      </Route>
      <Route path="/g/:slug">
        <Suspense fallback={<LoadingFallback />}><GamePage /></Suspense>
      </Route>
      <Route path="/random">
        <Suspense fallback={<LoadingFallback />}><RandomGameRedirect /></Suspense>
      </Route>
      <Route path="/blog">
        <Suspense fallback={<LoadingFallback />}><BlogPage /></Suspense>
      </Route>
      <Route path="/blog/:slug">
        <Suspense fallback={<LoadingFallback />}><BlogPostPage /></Suspense>
      </Route>
      <Route path="/categories">
        <Suspense fallback={<LoadingFallback />}><CategoriesPage /></Suspense>
      </Route>
      <Route path="/top-games">
        <Suspense fallback={<LoadingFallback />}><TopGamesPage /></Suspense>
      </Route>
      <Route path="/auth">
        <Suspense fallback={<LoadingFallback />}><AuthPage /></Suspense>
      </Route>
      <Route path="/reset-password">
        <Suspense fallback={<LoadingFallback />}><ResetPasswordPage /></Suspense>
      </Route>
      <Route path="/admin/reset-password" component={AdminResetPasswordPage} />
      <Route path="/install">
        <Suspense fallback={<LoadingFallback />}><InstallPage /></Suspense>
      </Route>
      
      {/* Static Pages */}
      <Route path="/about">
        <Suspense fallback={<LoadingFallback />}><AboutPage /></Suspense>
      </Route>
      <Route path="/contact">
        <Suspense fallback={<LoadingFallback />}><ContactPage /></Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<LoadingFallback />}><PrivacyPage /></Suspense>
      </Route>
      <Route path="/terms">
        <Suspense fallback={<LoadingFallback />}><TermsPage /></Suspense>
      </Route>
      <Route path="/cookie-policy">
        <Suspense fallback={<LoadingFallback />}><CookiePolicyPage /></Suspense>
      </Route>
      <Route path="/faq">
        <Suspense fallback={<LoadingFallback />}><FAQPage /></Suspense>
      </Route>

      {/* Admin Routes - using path + component pattern for route-based protected routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/games">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminGames /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blog">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminBlog /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/homepage-content">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminHomepageContent /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/api-keys">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminApiKeysPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/home-ads">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminHomeAdsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/sitemaps">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSitemapsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blog-ads">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminBlogAdsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/custom-code">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminCustomCodePage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/ads-txt">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdsTxtPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pages">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPagesPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/page/:id">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPageEditPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSettings /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings/redirects">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminRedirectsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      
      {/* Admin Accounts Routes */}
      <Route path="/admin/accounts/users">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminUsersPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/accounts/roles">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminRolesPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/accounts/signups">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSignupsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/accounts/locations">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminLocationsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Providers>
          <AppHead />
          <Router />
          <AdminHelperNav />
          <Toaster />
        </Providers>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;