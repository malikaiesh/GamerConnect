import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppHead } from "@/components/app-head";
import { GlobalSeoSchemaInjector } from "@/components/seo-schema-injector";
import { CookiePopup } from "@/components/cookie-popup";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { Providers } from "./lib/providers";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

// Core components - eagerly loaded for best performance
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
// Admin pages
const AdminResetPasswordPage = lazy(() => import("@/pages/admin/security/reset-password"));

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
const DevLogin = lazy(() => import("@/pages/dev-login"));
const CategoriesPage = lazy(() => import("@/pages/categories-page"));
const TopGamesPage = lazy(() => import("@/pages/top-games-page"));
const InstallPage = lazy(() => import("@/pages/install-page"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password-page"));
const GamesPage = lazy(() => import("@/pages/categories-page")); // Use categories page for games listing

// Static pages
const AboutPage = lazy(() => import("@/pages/about-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const PrivacyPage = lazy(() => import("@/pages/privacy-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const CookiePolicyPage = lazy(() => import("@/pages/cookie-policy-page"));
const FAQPage = lazy(() => import("@/pages/faq-page"));
const EventsPage = lazy(() => import("@/pages/events-page"));
const EventDetailPage = lazy(() => import("@/pages/event-detail-page"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminGames = lazy(() => import("@/pages/admin/games"));
const AdminBlog = lazy(() => import("@/pages/admin/blog"));
const AdminTeam = lazy(() => import("@/pages/admin/team"));
const AdminEvents = lazy(() => import("@/pages/admin/events-page"));
const AdminEventRegistrations = lazy(() => import("@/pages/admin/event-registrations"));
const AdminRoomsPage = lazy(() => import("@/pages/admin/rooms-page"));
const AdminGameCategories = lazy(() => import("@/pages/admin/game-categories-page"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminHomepageContent = lazy(() => import("@/pages/admin/homepage-content"));
const AdminPagesPage = lazy(() => import("@/pages/admin/pages-page"));
const AdminPageEditPage = lazy(() => import("@/pages/admin/page-edit-page"));
const AdminApiKeysPage = lazy(() => import("@/pages/admin/api-keys-page"));
const AdminHomeAdsPage = lazy(() => import("@/pages/admin/home-ads-page"));
const AdminGamesAdsPage = lazy(() => import("@/pages/admin/games-ads"));
const AdminSitemapsPage = lazy(() => import("@/pages/admin/sitemaps-page"));
const AdminBlogAdsPage = lazy(() => import("@/pages/admin/blog-ads-page"));
const AdminCustomCodePage = lazy(() => import("@/pages/admin/custom-code-page"));
const AdsTxtPage = lazy(() => import("@/pages/admin/ads-txt-page"));
const RobotsTxtPage = lazy(() => import("@/pages/admin/robots-txt"));
const WebsiteUpdatesPage = lazy(() => import("@/pages/admin/website-updates"));
const AdminGamesIntegrationPage = lazy(() => import("@/pages/admin/games-integration"));
// Push Notifications pages
const AdminPushNotificationsPage = lazy(() => import("@/pages/admin/push-notifications"));
const VerificationTool = lazy(() => import("@/pages/admin/verification-tool"));
const AdminPushNotificationsCampaignsPage = lazy(() => import("@/pages/admin/push-notifications/campaigns-page"));
const AdminPushNotificationsAnalyticsPage = lazy(() => import("@/pages/admin/push-notifications/analytics-page"));
const AdminPushNotificationsSubscribersPage = lazy(() => import("@/pages/admin/push-notifications/subscribers-page"));
// Admin settings pages
const AdminRedirectsPage = lazy(() => import("@/pages/admin/settings/redirects"));
const AdminGeneralSettingsPage = lazy(() => import("@/pages/admin/settings/general"));
// Admin SEO pages
const AdminSeoSchemasPage = lazy(() => import("@/pages/admin/seo/schemas"));
const AdminGoogleIndexingPage = lazy(() => import("@/pages/admin/google-indexing-page"));
const AdminBackupRestorePage = lazy(() => import("@/pages/admin/backup-restore-page"));
// Admin accounts pages
const AdminUsersPage = lazy(() => import("@/pages/admin/accounts/users"));
const AdminRolesPage = lazy(() => import("@/pages/admin/accounts/roles"));
const AdminSignupsPage = lazy(() => import("@/pages/admin/accounts/signups"));
const AdminSignupOptionsPage = lazy(() => import("@/pages/admin/signup-options"));
const AdminHeroImagesPage = lazy(() => import("@/pages/admin/hero-images"));
const AdminLocationsPage = lazy(() => import("@/pages/admin/accounts/locations"));
const AdminProfilePage = lazy(() => import("@/pages/admin/accounts/profile"));

// Admin payment pages
const AdminPaymentGatewaysPage = lazy(() => import("@/pages/admin/payment-gateways"));
const AdminPaymentTransactionsPage = lazy(() => import("@/pages/admin/payment-transactions"));
const AdminPricingPlansPage = lazy(() => import("@/pages/admin/pricing-plans"));
const AdminVerificationRequestsPage = lazy(() => import("@/pages/admin/verification-requests"));
const AdminWebmasterToolsPage = lazy(() => import("@/pages/admin/webmaster-tools"));
const AdminReferralsPage = lazy(() => import("@/pages/admin/referrals"));

// Admin image upload demo
const AdminImageUploadDemo = lazy(() => import("@/pages/admin/image-upload-demo"));

// Admin security pages
const AdminTwoFactorPage = lazy(() => import("@/pages/admin/security/two-factor"));
const AdminSecurityLogsPage = lazy(() => import("@/pages/admin/security/logs"));
const AdminSecuritySettingsPage = lazy(() => import("@/pages/admin/security/settings"));

// User Dashboard pages
const MyRoomsPage = lazy(() => import("@/pages/user-dashboard/my-rooms"));
const UserProfilePage = lazy(() => import("@/pages/user-profile"));

// Room pages
const RoomLobbyPage = lazy(() => import("@/pages/room-lobby"));
const RoomInterfacePage = lazy(() => import("@/pages/room-interface"));
const HotRoomsPage = lazy(() => import("@/pages/rooms/hot-rooms"));
const ExploreRoomsPage = lazy(() => import("@/pages/rooms/explore-rooms"));
const TrendingRoomsPage = lazy(() => import("@/pages/rooms/trending-rooms"));
const NewRoomsPage = lazy(() => import("@/pages/rooms/new-rooms"));

// Social pages
const FriendsPage = lazy(() => import("@/pages/social/friends"));
const FriendRequestsPage = lazy(() => import("@/pages/social/friend-requests"));

// Public pricing and verification pages
const PricingPlansPage = lazy(() => import("@/pages/pricing-plans"));
const VerificationPage = lazy(() => import("@/pages/verification"));
const ReferEarnPage = lazy(() => import("@/pages/refer-earn"));


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
      <Route path="/games">
        <Suspense fallback={<LoadingFallback />}><GamesPage /></Suspense>
      </Route>
      <Route path="/top-games">
        <Suspense fallback={<LoadingFallback />}><TopGamesPage /></Suspense>
      </Route>

      <Route path="/auth">
        <Suspense fallback={<LoadingFallback />}><AuthPage /></Suspense>
      </Route>
      <Route path="/dev-login">
        <Suspense fallback={<LoadingFallback />}><DevLogin /></Suspense>
      </Route>
      
      {/* Room pages */}
      <Route path="/rooms">
        <Suspense fallback={<LoadingFallback />}><RoomLobbyPage /></Suspense>
      </Route>
      <Route path="/room/:roomId">
        <Suspense fallback={<LoadingFallback />}><RoomInterfacePage /></Suspense>
      </Route>
      <Route path="/rooms/:roomId">
        <Suspense fallback={<LoadingFallback />}><RoomInterfacePage /></Suspense>
      </Route>
      <Route path="/rooms/hot">
        <Suspense fallback={<LoadingFallback />}><HotRoomsPage /></Suspense>
      </Route>
      <Route path="/rooms/explore">
        <Suspense fallback={<LoadingFallback />}><ExploreRoomsPage /></Suspense>
      </Route>
      <Route path="/rooms/trending">
        <Suspense fallback={<LoadingFallback />}><TrendingRoomsPage /></Suspense>
      </Route>
      <Route path="/rooms/new">
        <Suspense fallback={<LoadingFallback />}><NewRoomsPage /></Suspense>
      </Route>
      <Route path="/friends">
        <Suspense fallback={<LoadingFallback />}><FriendsPage /></Suspense>
      </Route>
      <Route path="/friends/requests">
        <Suspense fallback={<LoadingFallback />}><FriendRequestsPage /></Suspense>
      </Route>
      
      {/* User Dashboard pages */}
      <Route path="/user-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute>
            <MyRoomsPage />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path="/my-rooms">
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute>
            <MyRoomsPage />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path="/profile">
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        </Suspense>
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
      
      {/* Public pricing and verification pages */}
      <Route path="/pricing-plans">
        <Suspense fallback={<LoadingFallback />}><PricingPlansPage /></Suspense>
      </Route>
      <Route path="/verification">
        <Suspense fallback={<LoadingFallback />}><VerificationPage /></Suspense>
      </Route>
      <Route path="/refer-earn">
        <Suspense fallback={<LoadingFallback />}><ReferEarnPage /></Suspense>
      </Route>
      <Route path="/events">
        <Suspense fallback={<LoadingFallback />}><EventsPage /></Suspense>
      </Route>
      <Route path="/events/:slug">
        <Suspense fallback={<LoadingFallback />}><EventDetailPage /></Suspense>
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
      <Route path="/admin/game-categories">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminGameCategories /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/games-integration">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminGamesIntegrationPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blog">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminBlog /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/team">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminTeam /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/events">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminEvents /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/event-registrations">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminEventRegistrations /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/rooms">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminRoomsPage /></Suspense>
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
      <Route path="/admin/games-ads">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminGamesAdsPage /></Suspense>
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
      <Route path="/admin/robots-txt">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><RobotsTxtPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/website-updates">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><WebsiteUpdatesPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pages">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPagesPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pages/new">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPageEditPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/page/:id">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPageEditPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/verification">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><VerificationTool /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/verification-requests">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminVerificationRequestsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/webmaster-tools">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminWebmasterToolsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/referrals">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminReferralsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/payments/gateways">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPaymentGatewaysPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/payments/transactions">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPaymentTransactionsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pricing/plans">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPricingPlansPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pricing/subscriptions">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPricingPlansPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pricing/diamonds">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPricingPlansPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pricing/verification">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPricingPlansPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pricing/rooms">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPricingPlansPage /></Suspense>
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
      <Route path="/admin/settings/general">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminGeneralSettingsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/seo/schemas">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSeoSchemasPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/google-indexing">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminGoogleIndexingPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/backup-restore">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminBackupRestorePage /></Suspense>
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
      <Route path="/admin/signup-options">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSignupOptionsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/hero-images">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminHeroImagesPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/accounts/locations">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminLocationsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/accounts/profile">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminProfilePage /></Suspense>
        </ProtectedRoute>
      </Route>
      
      {/* Admin Security Routes */}
      <Route path="/admin/security/two-factor">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminTwoFactorPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/security/logs">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSecurityLogsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/security/settings">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminSecuritySettingsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/security/reset-password">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminResetPasswordPage /></Suspense>
        </ProtectedRoute>
      </Route>
      
      {/* Image Upload Demo Route */}
      <Route path="/admin/image-upload">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminImageUploadDemo /></Suspense>
        </ProtectedRoute>
      </Route>
      
      {/* Push Notifications Routes */}
      <Route path="/admin/push-notifications">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPushNotificationsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/push-notifications/campaigns">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPushNotificationsCampaignsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/push-notifications/analytics">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPushNotificationsAnalyticsPage /></Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/push-notifications/subscribers">
        <ProtectedRoute adminOnly={true}>
          <Suspense fallback={<LoadingFallback />}><AdminPushNotificationsSubscribersPage /></Suspense>
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
          <GlobalSeoSchemaInjector />
          <Router />
          <AdminHelperNav />
          <Toaster />
          <CookiePopup />
        </Providers>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;