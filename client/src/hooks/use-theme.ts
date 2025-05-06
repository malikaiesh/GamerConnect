import { useEffect, useState } from 'react';
import { getCurrentTheme, setTheme, isDarkMode, toggleDarkMode, themes, Theme } from '@/lib/themes';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(getCurrentTheme());
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Initialize theme and dark mode on component mount
  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
    setDarkMode(isDarkMode());
    
    // Apply theme and dark mode
    setTheme(getCurrentTheme());
    toggleDarkMode(isDarkMode());
  }, []);
  
  // Update theme whenever it changes
  const changeTheme = (themeId: string) => {
    setTheme(themeId);
    setCurrentTheme(themeId);
  };
  
  // Toggle dark mode
  const toggleMode = () => {
    const newMode = !darkMode;
    toggleDarkMode(newMode);
    setDarkMode(newMode);
  };
  
  // Get current theme object
  const getCurrentThemeObject = (): Theme => {
    return themes.find(t => t.id === currentTheme) || themes[0];
  };
  
  return {
    currentTheme,
    darkMode,
    themes,
    changeTheme,
    toggleMode,
    getCurrentThemeObject
  };
}
