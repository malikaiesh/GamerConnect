import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, Theme, getCurrentTheme, setTheme as setWebsiteTheme, isDarkMode as getIsDarkMode, toggleDarkMode as setWebsiteDarkMode } from '@/lib/themes';

interface AdminThemeContextType {
  currentTheme: string;
  darkMode: boolean;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  getCurrentThemeObject: () => Theme;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>(getCurrentTheme());
  const [darkMode, setDarkModeState] = useState<boolean>(getIsDarkMode());

  useEffect(() => {
    // Load saved admin theme from localStorage (or use website theme)
    const adminTheme = localStorage.getItem('admin-theme') || getCurrentTheme();
    const adminDarkMode = localStorage.getItem('admin-darkMode') === 'dark' || getIsDarkMode();
    
    setCurrentTheme(adminTheme);
    setDarkModeState(adminDarkMode);
    applyTheme(adminTheme, adminDarkMode);
  }, []);

  const applyTheme = (themeId: string, isDark: boolean) => {
    // Apply to admin dashboard main container (if it exists)
    const adminDashboard = document.querySelector('[class*="min-h-screen bg-background"]');
    if (adminDashboard) {
      adminDashboard.classList.add('admin-container');
      
      // Remove all theme classes
      themes.forEach(theme => {
        if (theme.class) {
          adminDashboard.classList.remove(theme.class);
        }
      });
      adminDashboard.classList.remove('dark', 'admin-light', 'admin-dark');
      
      // Add current theme class
      const theme = themes.find(t => t.id === themeId);
      if (theme && theme.class) {
        adminDashboard.classList.add(theme.class);
      }
      
      // Add dark mode class
      if (isDark) {
        adminDashboard.classList.add('dark');
      }
      
      // Keep admin-specific classes for backwards compatibility
      adminDashboard.classList.add(isDark ? 'admin-dark' : 'admin-light');
    }
    
    // Save admin preferences
    localStorage.setItem('admin-theme', themeId);
    localStorage.setItem('admin-darkMode', isDark ? 'dark' : 'light');
  };

  const setTheme = (themeId: string) => {
    // Apply to website theme system directly
    setWebsiteTheme(themeId);
    setCurrentTheme(themeId);
    applyTheme(themeId, darkMode);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    // Apply to website theme system directly using the imported function
    setWebsiteDarkMode(newDarkMode);
    setDarkModeState(newDarkMode);
    applyTheme(currentTheme, newDarkMode);
  };

  const getCurrentThemeObject = (): Theme => {
    return themes.find(t => t.id === currentTheme) || themes[0];
  };

  return (
    <AdminThemeContext.Provider value={{ 
      currentTheme, 
      darkMode, 
      themes, 
      setTheme, 
      toggleDarkMode, 
      getCurrentThemeObject 
    }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}