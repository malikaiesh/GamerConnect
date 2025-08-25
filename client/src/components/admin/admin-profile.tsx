import { useState } from "react";
import { User, LogOut, Settings, Shield, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function AdminProfile() {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user?.isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative p-2 h-auto"
          data-testid="button-admin-profile"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-medium text-foreground">{user.username}</span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64"
        data-testid="dropdown-admin-profile"
      >
        <DropdownMenuLabel>
          <div className="flex items-center gap-3 py-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.username}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/admin/accounts/profile" className="flex items-center gap-2 w-full">
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/admin/security/settings" className="flex items-center gap-2 w-full">
            <Shield className="w-4 h-4" />
            <span>Security Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/admin/security/logs" className="flex items-center gap-2 w-full">
            <Activity className="w-4 h-4" />
            <span>Activity Logs</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/admin/settings/general" className="flex items-center gap-2 w-full">
            <Settings className="w-4 h-4" />
            <span>Admin Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}