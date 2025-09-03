import React, { useState } from 'react';
import { Moon, Sun, Palette, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { cn } from '@/lib/utils';

export function AdminThemeSwitcher() {
  const { theme, setTheme, toggleTheme } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 px-0 relative",
            "hover:bg-primary/10 hover:text-primary",
            "transition-all duration-200"
          )}
          data-testid="admin-theme-switcher"
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle admin theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[160px] bg-card/95 backdrop-blur-sm border shadow-lg"
      >
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Admin Theme
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            "flex items-center gap-2 px-2 py-2 cursor-pointer",
            "hover:bg-primary/10 hover:text-primary",
            theme === 'light' && "bg-primary/15 text-primary"
          )}
          data-testid="theme-light"
        >
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
          {theme === 'light' && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            "flex items-center gap-2 px-2 py-2 cursor-pointer",
            "hover:bg-primary/10 hover:text-primary",
            theme === 'dark' && "bg-primary/15 text-primary"
          )}
          data-testid="theme-dark"
        >
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
          {theme === 'dark' && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={toggleTheme}
          className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-primary/10 hover:text-primary"
          data-testid="theme-toggle"
        >
          <Palette className="h-4 w-4" />
          <span>Quick Toggle</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}