import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home,
  GamepadIcon, 
  Users, 
  UserPlus, 
  MessageCircle,
  Search,
  TrendingUp,
  Star,
  Zap,
  PlusCircle,
  Settings,
  Palette,
  Trophy,
  Shield,
  CreditCard,
  Calendar,
  Gift,
  MessageSquare,
  Phone,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";

export function Sidebar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { currentTheme, themes, changeTheme } = useTheme();

  const isActive = (path: string) => location === path;
  const isPathActive = (basePath: string) => location.startsWith(basePath);

  if (!isAuthenticated) return null;

  return (
    <div className="w-64 bg-card text-card-foreground border-r border-border h-screen fixed left-0 top-0 z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link href="/user-dashboard">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <GamepadIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Gaming Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <Link href="/user-dashboard">
          <Button 
            variant={isActive("/user-dashboard") ? "default" : "ghost"} 
            className="w-full justify-start"
            data-testid="nav-dashboard"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>

        {/* Games Section */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Games</h3>
          <div className="space-y-1">
            <Link href="/games">
              <Button 
                variant={isPathActive("/games") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-games"
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                Website Games
              </Button>
            </Link>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Rooms</h3>
          <div className="space-y-1">
            <Link href="/rooms/my-rooms">
              <Button 
                variant={isActive("/rooms/my-rooms") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-my-rooms"
              >
                <Home className="w-4 h-4 mr-2" />
                My Rooms
              </Button>
            </Link>
            
            <Link href="/rooms/hot">
              <Button 
                variant={isActive("/rooms/hot") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-hot-rooms"
              >
                <Zap className="w-4 h-4 mr-2 text-destructive" />
                Hot Rooms
                <Badge variant="destructive" className="ml-auto text-xs">🔥</Badge>
              </Button>
            </Link>
            
            <Link href="/rooms/explore">
              <Button 
                variant={isActive("/rooms/explore") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-explore-rooms"
              >
                <Search className="w-4 h-4 mr-2 text-primary" />
                Explore Rooms
              </Button>
            </Link>
            
            <Link href="/rooms/trending">
              <Button 
                variant={isActive("/rooms/trending") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-trending-rooms"
              >
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Trending Rooms
              </Button>
            </Link>
            
            <Link href="/rooms/new">
              <Button 
                variant={isActive("/rooms/new") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-new-rooms"
              >
                <Star className="w-4 h-4 mr-2 text-accent" />
                New Rooms
              </Button>
            </Link>
            
            <Link href="/tournaments">
              <Button 
                variant={isActive("/tournaments") || isPathActive("/tournaments") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-tournaments"
              >
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                Tournaments
              </Button>
            </Link>
          </div>
        </div>

        {/* Social Section */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Social</h3>
          <div className="space-y-1">
            <Link href="/friends">
              <Button 
                variant={isActive("/friends") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-friends"
              >
                <Users className="w-4 h-4 mr-2" />
                Find Friends
              </Button>
            </Link>
            
            <Link href="/friends/requests">
              <Button 
                variant={isActive("/friends/requests") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-friend-requests"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Friend Requests
                <Badge variant="secondary" className="ml-auto text-xs">2</Badge>
              </Button>
            </Link>
            
            <Link href="/messages">
              <Button 
                variant={isActive("/messages") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-messages"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </Link>
            
            <Link href="/friends/calls">
              <Button 
                variant={isActive("/friends/calls") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-calls"
              >
                <Phone className="w-4 h-4 mr-2" />
                Calls
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Section */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Services</h3>
          <div className="space-y-1">
            <Link href="/verification">
              <Button 
                variant={isActive("/verification") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-get-verified"
              >
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                Get Verified
              </Button>
            </Link>
            
            <Link href="/pricing-plans">
              <Button 
                variant={isActive("/pricing-plans") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-pricing-plans"
              >
                <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                Pricing Plans
              </Button>
            </Link>
            
            <Link href="/events">
              <Button 
                variant={isActive("/events") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-gaming-events"
              >
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                Gaming Events
              </Button>
            </Link>
            
            <Link href="/refer-earn">
              <Button 
                variant={isActive("/refer-earn") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-refer-earn"
              >
                <Gift className="w-4 h-4 mr-2 text-emerald-500" />
                Refer & Earn
              </Button>
            </Link>
            
            <Link href="/feedback">
              <Button 
                variant={isActive("/feedback") ? "default" : "ghost"} 
                className="w-full justify-start"
                data-testid="nav-feedback"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-orange-500" />
                Feedback
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Theme Section - Icon Only */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              data-testid="theme-selector"
            >
              <Palette className="w-4 h-4" />
            </Button>
            {/* Theme Dropdown on Hover */}
            <div className="absolute bottom-full mb-2 right-0 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
              <div className="p-2 space-y-1">
                {themes.map((theme) => (
                  <Button
                    key={theme.id}
                    variant={currentTheme === theme.id ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => changeTheme(theme.id)}
                    data-testid={`theme-${theme.id}`}
                  >
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Button */}
      <div className="p-4 border-t border-border">
        <Link href="/rooms/create">
          <Button className="w-full" data-testid="button-create-room">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <Link href="/profile">
          <Button 
            variant="ghost" 
            className="w-full p-2 h-auto justify-start hover:bg-muted/50"
            data-testid="nav-profile"
          >
            <div className="flex items-center space-x-2 w-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profilePicture || undefined} alt={user?.username || 'User'} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.displayName || user?.username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  View Profile
                </p>
              </div>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}