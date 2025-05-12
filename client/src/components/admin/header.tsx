import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Gamepad2, BookOpen, FileText, LayoutList, Home, Settings, ImageIcon, Key } from "lucide-react";

export function AdminHeader() {
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
          <span className="text-sm text-gray-300">Logged in as {user.username}</span>
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