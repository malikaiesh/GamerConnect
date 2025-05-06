import { createContext, useState, useEffect, ReactNode } from "react";
import { themes, getCurrentTheme, setTheme, isDarkMode, toggleDarkMode } from "@/lib/themes";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
  defaultMode?: 'light' | 'dark';
};

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "modern",
  setTheme: () => {},
  isDark: false,
  toggleDarkMode: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "modern",
  defaultMode = "light",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [isDark, setIsDark] = useState(defaultMode === "dark");
  const [mounted, setMounted] = useState(false);

  // Only run client-side
  useEffect(() => {
    setMounted(true);
    
    // Initialize from local storage if available
    const savedTheme = getCurrentTheme();
    const savedDarkMode = isDarkMode();
    
    setThemeState(savedTheme);
    setIsDark(savedDarkMode);
    
    // Apply theme and dark mode
    setTheme(savedTheme);
    toggleDarkMode(savedDarkMode);
  }, []);

  // Handle theme changes
  const handleSetTheme = (newTheme: string) => {
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  // Handle dark mode toggle
  const handleToggleDarkMode = () => {
    setIsDark(!isDark);
    toggleDarkMode(!isDark);
  };

  // Avoid hydration mismatch by not rendering anything on the server
  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        isDark,
        toggleDarkMode: handleToggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
