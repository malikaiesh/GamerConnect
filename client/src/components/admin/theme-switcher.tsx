import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "@/contexts/admin-theme-context";
import { Moon, Sun, Palette, Gamepad2, Heart, Zap, Rocket, Star, Monitor } from "lucide-react";

export function AdminThemeSwitcher() {
  const { currentTheme, darkMode, themes, setTheme, toggleDarkMode, getCurrentThemeObject } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'modern': return <Monitor className="h-4 w-4" />;
      case 'sports': return <Gamepad2 className="h-4 w-4" />;
      case 'girls': return <Heart className="h-4 w-4" />;
      case 'retro': return <Zap className="h-4 w-4" />;
      case 'futuristic': return <Rocket className="h-4 w-4" />;
      case 'lunexa': return <Star className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  const currentThemeObj = getCurrentThemeObject();

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
          {darkMode ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Change admin theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[200px] bg-card/95 backdrop-blur-sm border shadow-lg"
      >
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Admin Theme
        </div>
        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Color Themes
        </div>
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              "flex items-center gap-2 px-2 py-2 cursor-pointer",
              "hover:bg-primary/10 hover:text-primary",
              currentTheme === theme.id && "bg-primary/15 text-primary"
            )}
            data-testid={`theme-${theme.id}`}
          >
            {getThemeIcon(theme.id)}
            <span>{theme.name}</span>
            {currentTheme === theme.id && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Dark Mode Toggle */}
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Display Mode
        </div>
        <DropdownMenuItem
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-primary/10 hover:text-primary"
          data-testid="theme-toggle-dark"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{darkMode ? 'Switch to Light' : 'Switch to Dark'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Current Selection Info */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Current: <span className="text-primary font-medium">{currentThemeObj.name}</span>
          {darkMode && <span className="text-primary font-medium"> (Dark)</span>}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}