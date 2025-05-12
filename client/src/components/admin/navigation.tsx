import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Gamepad2, Book, Settings, LayoutDashboard, FileText, LogOut, Home, FileSymlink } from "lucide-react";

export function AdminNavigation() {
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
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
          <i className="ri-gamepad-line text-primary text-3xl"></i>
          <span className="text-xl font-bold font-poppins ml-2">
            Game<span className="text-primary">Zone</span>
          </span>
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
