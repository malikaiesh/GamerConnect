import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AdminTheme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('light');

  useEffect(() => {
    // Load saved admin theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme') as AdminTheme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to light theme for admin
      applyTheme('light');
    }
  }, []);

  const applyTheme = (newTheme: AdminTheme) => {
    const adminElement = document.querySelector('.admin-container');
    if (adminElement) {
      if (newTheme === 'dark') {
        adminElement.classList.add('admin-dark');
        adminElement.classList.remove('admin-light');
      } else {
        adminElement.classList.add('admin-light');
        adminElement.classList.remove('admin-dark');
      }
    }
    localStorage.setItem('admin-theme', newTheme);
  };

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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