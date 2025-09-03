import { Link, useLocation } from "wouter";
import { 
  Home, 
  Gamepad2, 
  BookOpen, 
  Users, 
  Settings, 
  BarChart3, 
  Bell, 
  FileText, 
  Key, 
  Ban as Advertisement,
  Map as Sitemap,
  Grid3X3,
  Code,
  ExternalLink,
  Megaphone,
  Shield,
  Globe,
  Target,
  Image,
  UserCheck,
  Database,
  CopyX,
  ChevronRight,
  ChevronDown,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface AdminNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    section: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    ]
  },
  {
    section: "Content Management", 
    items: [
      { name: "Games", href: "/admin/games", icon: Gamepad2 },
      { name: "Game Categories", href: "/admin/game-categories", icon: Grid3X3 },
      { name: "Games Integration", href: "/admin/games-integration", icon: ExternalLink },
      { name: "Blog", href: "/admin/blog", icon: BookOpen },
      { name: "Team", href: "/admin/team", icon: Users },
      { name: "Homepage Content", href: "/admin/homepage-content", icon: FileText },
      { name: "Static Pages", href: "/admin/pages", icon: FileText },
    ]
  },
  {
    section: "Ad Manager",
    expandable: true,
    icon: Advertisement,
    items: [
      { name: "Home Ads", href: "/admin/home-ads", icon: Advertisement },
      { name: "Games Ads", href: "/admin/games-ads", icon: Target },
      { name: "Blog Ads", href: "/admin/blog-ads", icon: BookOpen },
    ]
  },
  {
    section: "User Engagement",
    items: [
      { name: "Push Notifications", href: "/admin/push-notifications", icon: Bell },
      { name: "Website Updates", href: "/admin/website-updates", icon: Megaphone },
      { name: "Admin Notifications", href: "/admin/admin-notifications", icon: Bell },
    ]
  },
  {
    section: "Settings & Security",
    items: [
      { name: "General Settings", href: "/admin/settings", icon: Settings },
      { name: "API Keys", href: "/admin/api-keys", icon: Key },
      { name: "User Management", href: "/admin/users", icon: UserCheck },
      { name: "SEO Schemas", href: "/admin/seo-schemas", icon: Database },
      { name: "Webmaster Tools", href: "/admin/webmaster-tools", icon: Search },
      { name: "Hero Images", href: "/admin/hero-images", icon: Image },
      { name: "Signup Options", href: "/admin/signup-options", icon: Users },
      { name: "Sitemaps", href: "/admin/sitemaps", icon: Sitemap },
      { name: "URL Redirects", href: "/admin/redirects", icon: ExternalLink },
      { name: "Custom Code", href: "/admin/custom-code", icon: Code },
      { name: "Ads.txt", href: "/admin/ads-txt", icon: FileText },
      { name: "Robots.txt", href: "/admin/robots-txt", icon: Shield },
      { name: "Security", href: "/admin/security", icon: Shield },
    ]
  },
  {
    section: "Analytics",
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ]
  }
];

export function AdminNavigation({ className }: AdminNavigationProps) {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Ad Manager']));

  const isActiveRoute = (href: string) => {
    return location === href || location.startsWith(href + "/");
  };

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const isSectionActive = (section: any) => {
    return section.items?.some((item: any) => isActiveRoute(item.href));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="w-full justify-start p-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
          </Button>
        </Link>
      </div>
      
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="px-3 pb-6">
          {navigationItems.map((section) => (
            <div key={section.section} className="mb-6">
              {section.expandable ? (
                // Expandable section (like Ad Manager)
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSection(section.section)}
                    className={`w-full justify-start text-left h-9 mb-2 ${
                      isSectionActive(section)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    data-testid={`nav-section-${section.section.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <section.icon className={`mr-3 h-4 w-4 ${isSectionActive(section) ? "text-blue-600 dark:text-blue-400" : ""}`} />
                    {section.section}
                    {expandedSections.has(section.section) ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                  
                  {expandedSections.has(section.section) && (
                    <div className="space-y-1 ml-6">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveRoute(item.href);
                        
                        return (
                          <Link key={item.name} href={item.href}>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className={`w-full justify-start text-left h-8 text-sm ${
                                active 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                              }`}
                              data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <Icon className={`mr-3 h-4 w-4 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
                              {item.name}
                              {item.name === "Games Ads" && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  New
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Regular section
                <div>
                  <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActiveRoute(item.href);
                      
                      return (
                        <Link key={item.name} href={item.href}>
                          <Button
                            variant={active ? "secondary" : "ghost"}
                            className={`w-full justify-start text-left h-9 ${
                              active 
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            }`}
                            data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Icon className={`mr-3 h-4 w-4 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              {section.section !== "Analytics" && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}