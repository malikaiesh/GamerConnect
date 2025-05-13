import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Gamepad2, Book, Settings, LayoutDashboard, FileText, LogOut, Home, FileSymlink, Key, ImageIcon, Map, Code, BarChart, Files, Bell, Users, Send, Activity, BarChart3 } from "lucide-react";
import { useState } from "react";
import { SiteSetting } from "@shared/schema";

export default function AdminNavigation() {
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({
    pushNotifications: false
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
    <div className="bg-gray-900 text-gray-100 min-h-screen w-64 flex flex-col">
      <div className="p-4 border-b border-gray-800">
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
                className="text-xl font-bold font-poppins ml-2"
                style={settings?.textLogoColor ? { color: settings.textLogoColor } : {}}
              >
                {settings?.siteTitle ? settings.siteTitle : 'Game'}
              </span>
            </>
          )}
        </Link>
      </div>

      <div className="p-4 text-sm text-gray-400">
        <p>Welcome, {user.username}</p>
        <p>Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/dashboard")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/games"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/games")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Gamepad2 size={18} />
              Games
            </Link>
          </li>
          <li>
            <Link
              href="/admin/blog"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/blog")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Book size={18} />
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/admin/pages"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/pages")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <FileSymlink size={18} />
              Pages
            </Link>
          </li>
          <li>
            <Link
              href="/admin/homepage-content"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/homepage-content")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <FileText size={18} />
              Homepage Content
            </Link>
          </li>
          <li>
            <a 
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                "text-gray-300 hover:bg-gray-800 bg-gray-800/50"
              )}
            >
              <Home size={18} />
              View Site
            </a>
          </li>
          <li>
            <Link
              href="/admin/home-ads"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/home-ads")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <ImageIcon size={18} />
              Home Ads
            </Link>
          </li>
          <li>
            <Link
              href="/admin/api-keys"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/api-keys")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Key size={18} />
              API Keys
            </Link>
          </li>
          <li>
            <Link
              href="/admin/sitemaps"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/sitemaps")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Map size={18} />
              Sitemaps
            </Link>
          </li>
          <li>
            <Link
              href="/admin/blog-ads"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/blog-ads")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <BarChart size={18} />
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
          <li>
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive("/admin/settings")
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Settings size={18} />
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
