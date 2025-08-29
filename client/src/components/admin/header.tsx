import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Gamepad2, BookOpen, FileText, LayoutList, Home, Settings, ImageIcon, Key, BarChart, Code, Map } from "lucide-react";
import NotificationBell from "@/components/admin/notification-bell";

export default function AdminHeader() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return null;
  }

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <div className="bg-gray-800 text-white shadow py-3 px-6">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center mr-6">
          <span className="font-semibold text-lg mr-2">Admin</span>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <span>Logged in as {user.username}</span>
            {user.isVerified && (
              <div className="inline-flex items-center justify-center w-4 h-4 flex-shrink-0 relative">
                <svg className="w-4 h-4 drop-shadow-sm" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 5.26L16 4L15.74 7.26L19 8.35L16.74 10.74L19 12.65L15.74 13.26L16 17L13.09 15.74L12 19L10.91 15.74L8 17L8.26 13.74L5 12.65L8.26 10.26L5 8.35L8.26 7.74L8 4L10.91 5.26L12 2Z" fill="url(#verifyGradientHeader)" stroke="#1565C0" strokeWidth="0.5"/>
                  <path d="M9 11.5L11 13.5L15 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="verifyGradientHeader" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1877F2" />
                      <stop offset="100%" stopColor="#166FE5" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex items-center space-x-1">
          <NavLink 
            href="/admin/dashboard" 
            isActive={isActive("/admin/dashboard")}
            icon={<LayoutDashboard size={18} />}
            label="Dashboard" 
          />
          
          <NavLink 
            href="/admin/games" 
            isActive={isActive("/admin/games")}
            icon={<Gamepad2 size={18} />}
            label="Games" 
          />
          
          <NavLink 
            href="/admin/blog" 
            isActive={isActive("/admin/blog")}
            icon={<BookOpen size={18} />}
            label="Blog" 
          />
          
          <NavLink 
            href="/admin/pages" 
            isActive={isActive("/admin/pages")}
            icon={<FileText size={18} />}
            label="Pages" 
          />
          
          <NavLink 
            href="/admin/homepage-content" 
            isActive={isActive("/admin/homepage-content")}
            icon={<LayoutList size={18} />}
            label="Content" 
          />
          
          <NavLink 
            href="/admin/home-ads" 
            isActive={isActive("/admin/home-ads")}
            icon={<ImageIcon size={18} />}
            label="Home Ads" 
          />
          
          <NavLink 
            href="/admin/api-keys" 
            isActive={isActive("/admin/api-keys")}
            icon={<Key size={18} />}
            label="API Keys" 
          />
          
          <NavLink 
            href="/admin/sitemaps" 
            isActive={isActive("/admin/sitemaps")}
            icon={<Map size={18} />}
            label="Sitemaps" 
          />
          
          <NavLink 
            href="/admin/blog-ads" 
            isActive={isActive("/admin/blog-ads")}
            icon={<BarChart size={18} />}
            label="Blog Ads" 
          />
          
          <NavLink 
            href="/admin/custom-code" 
            isActive={isActive("/admin/custom-code")}
            icon={<Code size={18} />}
            label="Custom Code" 
          />
          
          <NavLink 
            href="/" 
            isActive={false}
            icon={<Home size={18} />}
            label="View Site"
            variant="outline" 
          />
          
          <NavLink 
            href="/admin/settings" 
            isActive={isActive("/admin/settings")}
            icon={<Settings size={18} />}
            label="Settings" 
          />
        </nav>
        
        <div className="flex items-center gap-3 ml-4">
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "outline";
}

function NavLink({ href, isActive, icon, label, variant = "default" }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded transition-colors",
        variant === "outline" 
          ? "bg-white/10 hover:bg-white/20" 
          : isActive
            ? "bg-primary text-white"
            : "hover:bg-gray-700"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}