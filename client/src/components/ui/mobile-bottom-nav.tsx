import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Trophy, 
  GamepadIcon, 
  Users,
  MessageCircle,
  Swords
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const navItems: BottomNavItem[] = [
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    href: "/events",
    color: "text-blue-500"
  },
  {
    id: "battles",
    label: "Battles",
    icon: Swords,
    href: "/tournaments",
    color: "text-red-500"
  },
  {
    id: "games",
    label: "Games",
    icon: GamepadIcon,
    href: "/games",
    color: "text-green-500"
  },
  {
    id: "social",
    label: "Social",
    icon: Users,
    href: "/friends",
    color: "text-purple-500"
  }
];

export function MobileBottomNav() {
  const [location] = useLocation();

  const isActive = (href: string) => location === href || location.startsWith(href);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link key={item.id} href={item.href}>
              <div 
                className={cn(
                  "flex flex-col items-center justify-center min-h-[60px] px-3 py-1 rounded-lg transition-all duration-200",
                  active 
                    ? "bg-gray-100 dark:bg-gray-800" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
                data-testid={`bottom-nav-${item.id}`}
              >
                <Icon 
                  className={cn(
                    "w-6 h-6 mb-1 transition-colors",
                    active ? item.color : "text-gray-400 dark:text-gray-500"
                  )} 
                />
                <span 
                  className={cn(
                    "text-xs font-medium transition-colors",
                    active 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}