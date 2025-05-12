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
import RandomGameRedirect from "@/pages/random-game-redirect";
import AuthPage from "@/pages/auth-page";
import CategoriesPage from "@/pages/categories-page";
import TopGamesPage from "@/pages/top-games-page";
import InstallPage from "@/pages/install-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import FAQPage from "@/pages/faq-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminGames from "@/pages/admin/games";
import AdminBlog from "@/pages/admin/blog";
import AdminSettings from "@/pages/admin/settings";
import AdminHomepageContent from "@/pages/admin/homepage-content";
import AdminPagesPage from "@/pages/admin/pages-page";
import AdminPageEditPage from "@/pages/admin/page-edit-page";
import AdminApiKeysPage from "@/pages/admin/api-keys-page";
import AdminHomeAdsPage from "@/pages/admin/home-ads-page";
import AdminSitemapsPage from "@/pages/admin/sitemaps-page";
import AdminBlogAdsPage from "@/pages/admin/blog-ads-page";
import AdminCustomCodePage from "@/pages/admin/custom-code-page";
import AdsTxtPage from "@/pages/admin/ads-txt-page";
import { Providers } from "./lib/providers";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/game/:id" component={GamePage} />
      <Route path="/g/:slug" component={GamePage} />
      <Route path="/random" component={RandomGameRedirect} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/top-games" component={TopGamesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/install" component={InstallPage} />
      
      {/* Static Pages */}
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookie-policy" component={CookiePolicyPage} />
      <Route path="/faq" component={FAQPage} />

      {/* Admin Routes */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/games" component={AdminGames} adminOnly={true} />
      <ProtectedRoute path="/admin/blog" component={AdminBlog} adminOnly={true} />
      <ProtectedRoute path="/admin/homepage-content" component={AdminHomepageContent} adminOnly={true} />
      <ProtectedRoute path="/admin/api-keys" component={AdminApiKeysPage} adminOnly={true} />
      <ProtectedRoute path="/admin/home-ads" component={AdminHomeAdsPage} adminOnly={true} />
      <ProtectedRoute path="/admin/blog-ads" component={AdminBlogAdsPage} adminOnly={true} />
      <ProtectedRoute path="/admin/custom-code" component={AdminCustomCodePage} adminOnly={true} />
      <ProtectedRoute path="/admin/sitemaps" component={AdminSitemapsPage} adminOnly={true} />
      <ProtectedRoute path="/admin/ads-txt" component={AdsTxtPage} adminOnly={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} adminOnly={true} />
      <ProtectedRoute path="/admin/pages" component={AdminPagesPage} adminOnly={true} />
      <ProtectedRoute path="/admin/pages/:id" component={AdminPageEditPage} adminOnly={true} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Admin Helper Navigation
const AdminHelperNav = () => {
  const { user } = useAuth();
  
  // Only show admin nav if user is logged in and is an admin
  if (!user || !user.isAdmin) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-3 px-4 shadow-md flex flex-wrap items-center justify-between">
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <div className="font-bold text-lg bg-white text-indigo-900 px-2 py-1 rounded">Admin</div>
        <div className="hidden sm:block text-white/70">Logged in as {user.username}</div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <a href="/admin/dashboard" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
        <a href="/admin/games" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Games
        </a>
        <a href="/admin/blog" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Blog
        </a>
        <a href="/admin/pages" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Pages
        </a>
        <a href="/admin/homepage-content" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Content
        </a>
        <a href="/admin/api-keys" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          API Keys
        </a>
        <a href="/admin/blog-ads" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Blog Ads
        </a>
        <a href="/admin/custom-code" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Custom Code
        </a>
        <a href="/admin/sitemaps" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Sitemaps
        </a>
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          View Site
        </a>
        <a href="/admin/settings" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="modern" defaultMode="light">
      <Providers>
        <AdminHelperNav />
        <Router />
      </Providers>
    </ThemeProvider>
  );
}

export default App;
