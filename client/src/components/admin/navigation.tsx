import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Gamepad2, Book, Settings, LayoutDashboard, FileText, LogOut, Home, FileSymlink, Key, ImageIcon, Map, Code, BarChart, Files, Bell, Users, Send, Activity, BarChart3, UserRound, UserPlus, MapPin, Shield } from "lucide-react";
import { useState } from "react";
import { SiteSetting } from "@shared/schema";

export default function AdminNavigation() {
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({
    pushNotifications: false,
    accounts: false
  });
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();
  
  // Fetch site settings for logo configuration
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleSubMenu = (menuName: string) => {
    setExpandedSubMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="bg-card text-card-foreground min-h-screen w-64 flex flex-col border-r border-border">
      <div className="p-4 border-b border-border bg-primary/10">
        <Link href="/" className="flex items-center">
          {settings?.siteLogo && !settings?.useTextLogo ? (
            <img 
              src={settings.siteLogo} 
              alt={settings.siteTitle || 'Game Zone'} 
              className="h-8 w-auto" 
            />
          ) : (
            <>
              <i className="ri-gamepad-line text-primary text-3xl"></i>
              <span 
                className="text-xl font-bold font-poppins ml-2 text-primary"
                style={settings?.textLogoColor ? { color: settings.textLogoColor } : {}}
              >
                {settings?.siteTitle ? settings.siteTitle : 'Game'}
              </span>
            </>
          )}
        </Link>
      </div>

      <div className="p-4 text-sm text-muted-foreground bg-gradient-to-r from-primary/5 to-transparent">
        <p className="font-medium">Welcome, {user.username}</p>
        <p className="opacity-80">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/dashboard")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <LayoutDashboard size={18} className="text-primary opacity-80" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/games"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/games")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Gamepad2 size={18} className="text-primary opacity-80" />
              Games
            </Link>
          </li>
          <li>
            <Link
              href="/admin/blog"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/blog")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Book size={18} className="text-primary opacity-80" />
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/admin/pages"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/pages")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <FileSymlink size={18} className="text-primary opacity-80" />
              Pages
            </Link>
          </li>
          <li>
            <Link
              href="/admin/homepage-content"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/homepage-content")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <FileText size={18} className="text-primary opacity-80" />
              Homepage Content
            </Link>
          </li>
          <li>
            <a 
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                "text-card-foreground hover:bg-primary/10 hover:text-primary bg-primary/5"
              )}
            >
              <Home size={18} className="text-primary opacity-80" />
              View Site
            </a>
          </li>
          <li>
            <Link
              href="/admin/home-ads"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/home-ads")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <ImageIcon size={18} className="text-primary opacity-80" />
              Home Ads
            </Link>
          </li>
          <li>
            <Link
              href="/admin/api-keys"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/api-keys")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Key size={18} className="text-primary opacity-80" />
              API Keys
            </Link>
          </li>
          <li>
            <Link
              href="/admin/sitemaps"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/sitemaps")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Map size={18} className="text-primary opacity-80" />
              Sitemaps
            </Link>
          </li>
          <li>
            <Link
              href="/admin/blog-ads"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/blog-ads")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <BarChart size={18} className="text-primary opacity-80" />
              Blog Ads
            </Link>
          </li>
          <li className="space-y-1">
            <button
              onClick={() => toggleSubMenu('pushNotifications')}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/push-notifications")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell size={18} />
                <span>Push Notifications</span>
              </div>
              <span className={cn("transform transition-transform", expandedSubMenus.pushNotifications ? "rotate-180" : "")}>
                ▼
              </span>
            </button>
            {expandedSubMenus.pushNotifications && (
              <ul className="ml-6 space-y-1 border-l border-gray-800 pl-2">
                <li>
                  <Link
                    href="/admin/push-notifications"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/push-notifications"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Bell size={16} />
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/push-notifications/campaigns"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/push-notifications/campaigns"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Send size={16} />
                    Campaigns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/push-notifications/subscribers"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/push-notifications/subscribers"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Users size={16} />
                    Subscribers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/push-notifications/analytics"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/push-notifications/analytics"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Activity size={16} />
                    Analytics
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/admin/ads-txt"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/ads-txt")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Files size={18} />
              Ads.txt
            </Link>
          </li>
          <li>
            <Link
              href="/admin/custom-code"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/custom-code")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Code size={18} />
              Custom Code
            </Link>
          </li>
          <li className="space-y-1">
            <button
              onClick={() => toggleSubMenu('accounts')}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/accounts")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3">
                <UserRound size={18} />
                <span>Accounts</span>
              </div>
              <span className={cn("transform transition-transform", expandedSubMenus.accounts ? "rotate-180" : "")}>
                ▼
              </span>
            </button>
            {expandedSubMenus.accounts && (
              <ul className="ml-6 space-y-1 border-l border-gray-800 pl-2">
                <li>
                  <Link
                    href="/admin/accounts/users"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/accounts/users"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Users size={16} />
                    All Users
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/accounts/roles"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/accounts/roles"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Shield size={16} />
                    Roles & Permissions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/accounts/locations"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/accounts/locations"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <MapPin size={16} />
                    User Locations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/accounts/signups"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      location === "/admin/accounts/signups"
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <UserPlus size={16} />
                    Signup Stats
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/settings")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Settings size={18} className="text-primary opacity-80" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-card-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} className="text-destructive opacity-80" />
          Logout
        </button>
      </div>
    </div>
  );
}
