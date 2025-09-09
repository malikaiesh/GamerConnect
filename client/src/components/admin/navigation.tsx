import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Gamepad2, Book, Settings, LayoutDashboard, FileText, LogOut, Home, FileSymlink, Key, ImageIcon, Map, Code, BarChart, Files, Bell, Users, Send, Activity, BarChart3, UserRound, UserPlus, MapPin, Shield, Lock, KeyRound, AlertTriangle, FileDigit, Clock, ExternalLink, Bot, Rocket, ChevronDown, ChevronRight, Target, Ban as Advertisement, Calendar, Cloud, Archive, CreditCard, Wallet, Receipt, Gem, Star, Crown, DollarSign, PenTool, Zap, BrainCircuit, Gift } from "lucide-react";
import { useState } from "react";
import { SiteSetting } from "@shared/schema";
import { AdminThemeSwitcher } from "./theme-switcher";

export default function AdminNavigation() {
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({
    pushNotifications: false,
    messaging: false,
    accounts: false,
    adminUsers: false,
    settings: false,
    adManager: false,
    manageGames: false,
    payments: false,
    pricing: false,
    verification: false,
    seoOptimizations: false,
    allRooms: false
  });
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Fetch site settings for logo configuration
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const toggleSubMenu = (menuName: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Welcome, {user.username}</p>
            <p className="opacity-80">Admin Panel</p>
          </div>
          <AdminThemeSwitcher />
        </div>
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
          {/* Manage Games Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('manageGames', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/games") || isActive("/admin/game-categories") || isActive("/admin/games-integration")) || expandedSubMenus.manageGames
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Gamepad2 size={18} className="text-primary opacity-80" />
                <span>Manage Games</span>
              </div>
              {expandedSubMenus.manageGames ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.manageGames && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/games"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/games")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Gamepad2 size={16} className="text-primary opacity-60" />
                    Games
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/game-categories"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/game-categories")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Files size={16} className="text-primary opacity-60" />
                    Game Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/games-integration"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/games-integration")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <ExternalLink size={16} className="text-primary opacity-60" />
                    Games Integration
                  </Link>
                </li>
              </ul>
            )}
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
              href="/admin/content-writing"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/content-writing")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <BrainCircuit size={18} className="text-primary opacity-80" />
              <span>Content Writing</span>
              <span className="ml-auto px-1.5 py-0.5 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded font-medium">AI</span>
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
              href="/admin/team"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/team")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Users size={18} className="text-primary opacity-80" />
              Team
            </Link>
          </li>
          <li>
            <Link
              href="/admin/rooms"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/rooms")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Users size={18} className="text-primary opacity-80" />
              Rooms
            </Link>
          </li>
          <li>
            <Link
              href="/admin/gifts"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/gifts")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Gift size={18} className="text-primary opacity-80" />
              Gifts
            </Link>
          </li>
          {/* Verification Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('verification', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/verification")) || expandedSubMenus.verification
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-primary opacity-80" />
                <span>Verification</span>
              </div>
              {expandedSubMenus.verification ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.verification && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/verification"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/verification")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Shield size={16} className="text-primary opacity-60" />
                    Verification Tool
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/verification-requests"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/verification-requests")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <FileDigit size={16} className="text-primary opacity-60" />
                    Verification Requests
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Payments Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('payments', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/payments")) || expandedSubMenus.payments
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-primary opacity-80" />
                <span>Payments</span>
              </div>
              {expandedSubMenus.payments ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.payments && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/payments/gateways"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/payments/gateways")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Wallet size={16} className="text-primary opacity-60" />
                    Payment Gateways
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/payments/transactions"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/payments/transactions")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Receipt size={16} className="text-primary opacity-60" />
                    Transactions
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Pricing Plans Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('pricing', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/pricing")) || expandedSubMenus.pricing
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Gem size={18} className="text-primary opacity-80" />
                <span>Pricing Plans</span>
              </div>
              {expandedSubMenus.pricing ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.pricing && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/pricing/plans"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/pricing/plans")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Settings size={16} className="text-primary opacity-60" />
                    Manage Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pricing/subscriptions"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/pricing/subscriptions")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Users size={16} className="text-primary opacity-60" />
                    User Subscriptions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pricing/diamonds"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/pricing/diamonds")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Gem size={16} className="text-primary opacity-60" />
                    Diamond Packs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pricing/verification"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/pricing/verification")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Crown size={16} className="text-primary opacity-60" />
                    Verification Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pricing/rooms"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/pricing/rooms")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <MapPin size={16} className="text-primary opacity-60" />
                    Room Creation
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Ad Manager Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('adManager', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/home-ads") || isActive("/admin/blog-ads") || isActive("/admin/games-ads")) || expandedSubMenus.adManager
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Advertisement size={18} className="text-primary opacity-80" />
                <span>Ad Manager</span>
              </div>
              {expandedSubMenus.adManager ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.adManager && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/home-ads"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/home-ads")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Advertisement size={16} className="text-primary opacity-60" />
                    Home Ads
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/games-ads"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/games-ads")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Target size={16} className="text-primary opacity-60" />
                    Games Ads
                    <span className="ml-auto px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">New</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/blog-ads"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/blog-ads")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Book size={16} className="text-primary opacity-60" />
                    Blog Ads
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Push Notifications Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('pushNotifications', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/push-notifications") || expandedSubMenus.pushNotifications
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-primary opacity-80" />
                <span>Push Notifications</span>
              </div>
              {expandedSubMenus.pushNotifications ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.pushNotifications && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/push-notifications"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/push-notifications")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Bell size={16} className="text-primary opacity-80" />
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/push-notifications/campaigns"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/push-notifications/campaigns")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Send size={16} className="text-primary opacity-80" />
                    Campaigns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/push-notifications/subscribers"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/push-notifications/subscribers")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Users size={16} className="text-primary opacity-80" />
                    Subscribers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/push-notifications/analytics"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/push-notifications/analytics")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Activity size={16} className="text-primary opacity-80" />
                    Analytics
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Messages/Communications Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('messaging', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/messaging")) || expandedSubMenus.messaging
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Send size={18} className="text-primary opacity-80" />
                <span>Communications</span>
              </div>
              {expandedSubMenus.messaging ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.messaging && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/messaging/automated"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/messaging/automated")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Bot size={16} className="text-primary opacity-60" />
                    Automated Messages
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/messaging/templates"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/messaging/templates")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <FileText size={16} className="text-primary opacity-60" />
                    Message Templates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/messaging/bulk-sms"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/messaging/bulk-sms")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Send size={16} className="text-primary opacity-60" />
                    Bulk Messaging
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/messaging/history"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/messaging/history")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Clock size={16} className="text-primary opacity-60" />
                    Message History
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Accounts Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('accounts', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/accounts") || expandedSubMenus.accounts
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <UserRound size={18} className="text-primary opacity-80" />
                <span>Accounts</span>
              </div>
              {expandedSubMenus.accounts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.accounts && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/accounts/users"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/accounts/users")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Users size={16} className="text-primary opacity-80" />
                    All Users
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/accounts/locations"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/accounts/locations")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <MapPin size={16} className="text-primary opacity-80" />
                    User Locations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/accounts/signups"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/accounts/signups")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <UserPlus size={16} className="text-primary opacity-80" />
                    Signup Stats
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/admin/events"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/events") && !isActive("/admin/event-registrations")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Calendar size={18} className="text-primary opacity-80" />
              Events
            </Link>
          </li>
          <li>
            <Link
              href="/admin/event-registrations"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/event-registrations")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Users size={18} className="text-primary opacity-80" />
              Event Registrations
            </Link>
          </li>

          {/* SEO Optimizations Section */}
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('seoOptimizations', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                (isActive("/admin/seo") || isActive("/admin/webmaster-tools") || isActive("/admin/google-indexing") || isActive("/admin/sitemaps") || isActive("/admin/robots-txt")) || expandedSubMenus.seoOptimizations
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <BarChart size={18} className="text-primary opacity-80" />
                <span>SEO Optimizations</span>
              </div>
              {expandedSubMenus.seoOptimizations ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.seoOptimizations && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/seo/schemas"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/seo/schemas")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Code size={16} className="text-primary opacity-60" />
                    SEO Schemas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/webmaster-tools"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/webmaster-tools")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Settings size={16} className="text-primary opacity-60" />
                    Webmaster Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/google-indexing"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/google-indexing")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Cloud size={16} className="text-primary opacity-60" />
                    Google Indexing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/sitemaps"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/sitemaps")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Map size={16} className="text-primary opacity-60" />
                    Sitemaps
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/robots-txt"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/robots-txt")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Bot size={16} className="text-primary opacity-60" />
                    Robots.txt
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/admin/backup-restore"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/backup-restore")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Archive size={18} className="text-primary opacity-80" />
              Backup & Restore
            </Link>
          </li>
          <li>
            <Link
              href="/admin/referrals"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/referrals")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Target size={18} className="text-primary opacity-80" />
              Referral System
            </Link>
          </li>
          <li>
            <Link
              href="/admin/revenue"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/revenue")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <DollarSign size={18} className="text-primary opacity-80" />
              Revenue Tracking
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
            <Link
              href="/admin/hero-images"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/hero-images")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <ImageIcon size={18} className="text-primary opacity-80" />
              Hero Images
            </Link>
          </li>
          <li>
            <Link
              href="/admin/images-gallery"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/images-gallery")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Files size={18} className="text-primary opacity-80" />
              Images Gallery
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
              href="/admin/signup-options"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/signup-options")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <UserPlus size={18} className="text-primary opacity-80" />
              Signup Options
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
              href="/admin/ads-txt"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/ads-txt")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Files size={18} className="text-primary opacity-80" />
              Ads.txt
            </Link>
          </li>
          <li>
            <Link
              href="/admin/custom-code"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/custom-code")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Code size={18} className="text-primary opacity-80" />
              Custom Code
            </Link>
          </li>
          <li>
            <Link
              href="/admin/website-updates"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/website-updates")
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Rocket size={18} className="text-primary opacity-80" />
              Website Updates
            </Link>
          </li>

          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('adminUsers', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/security") || expandedSubMenus.adminUsers
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <UserRound size={18} className="text-primary opacity-80" />
                <span>Admin Users</span>
              </div>
              {expandedSubMenus.adminUsers ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.adminUsers && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/accounts/roles"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/accounts/roles")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Shield size={16} className="text-primary opacity-80" />
                    Roles & Permissions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/security/two-factor"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/security/two-factor")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <KeyRound size={16} className="text-primary opacity-80" />
                    Two-Factor Auth
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/security/logs"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/security/logs")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <FileDigit size={16} className="text-primary opacity-80" />
                    Security Logs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/security/settings"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/security/settings")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Shield size={16} className="text-primary opacity-80" />
                    Security Settings
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="space-y-1">
            <button
              onClick={(e) => toggleSubMenu('settings', e)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive("/admin/settings") || expandedSubMenus.settings
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-card-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-primary opacity-80" />
                <span>Settings</span>
              </div>
              {expandedSubMenus.settings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSubMenus.settings && (
              <ul className="ml-6 space-y-1">
                <li>
                  <Link
                    href="/admin/settings/general"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/settings/general")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Settings size={16} className="text-primary opacity-80" />
                    General Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/settings/redirects"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      isActive("/admin/settings/redirects")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-card-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <ExternalLink size={16} className="text-primary opacity-80" />
                    URL Redirects
                  </Link>
                </li>
              </ul>
            )}
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
