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