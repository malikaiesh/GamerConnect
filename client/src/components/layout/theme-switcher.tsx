import { useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, themes, changeTheme } = useTheme();
  
  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-muted-foreground hover:text-primary" 
        aria-label="Select Theme"
      >
        <i className="ri-palette-line text-xl"></i>
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`block px-4 py-2 text-sm w-full text-left ${
                currentTheme === theme.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
