import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { useQuery } from '@tanstack/react-query';
import { SiteSetting } from '@shared/schema';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logoutMutation } = useAuth();
  const { darkMode, toggleMode } = useTheme();
  const [location, setLocation] = useLocation();
  
  // Fetch site settings for logo configuration
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        throw new Error('Failed to fetch site settings');
      }
      return res.json();
    }
  });

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              {settings?.siteLogo && !settings?.useTextLogo ? (
                <img 
                  src={settings.siteLogo} 
                  alt={settings.siteTitle || 'Game Zone'} 
                  className="h-10 w-auto" 
                />
              ) : (
                <>
                  <i className="ri-gamepad-line text-primary text-3xl"></i>
                  <span 
                    className="text-2xl font-bold font-poppins ml-2 text-foreground"
                    style={settings?.textLogoColor ? { color: settings.textLogoColor } : {}}
                  >
                    {settings?.siteTitle ? settings.siteTitle : 'Game'}
                  </span>
                </>
              )}
            </Link>
          </div>
          
          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/categories" className="font-medium text-foreground hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/top-games" className="font-medium text-foreground hover:text-primary transition-colors">
              Top Games
            </Link>
            <Link href="/random" className="font-medium text-foreground hover:text-primary transition-colors">
              Random Game
            </Link>
            <Link href="/blog" className="font-medium text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>
          
          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <button 
              onClick={toggleSearch}
              className="p-2 text-muted-foreground hover:text-primary" 
              aria-label="Search"
            >
              <i className="ri-search-line text-xl"></i>
            </button>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleMode}
              className="p-2 text-muted-foreground hover:text-primary" 
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <i className="ri-sun-line text-xl"></i>
              ) : (
                <i className="ri-moon-line text-xl"></i>
              )}
            </button>
            
            {/* Theme Selector */}
            <ThemeSwitcher />
            
            {/* Auth Links */}
            {user ? (
              <div className="relative group">
                <button className="p-2 text-muted-foreground hover:text-primary flex items-center">
                  <span className="hidden md:inline-block mr-2">{user.username}</span>
                  <i className="ri-user-line text-xl"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  {user.isAdmin && (
                    <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth" className="p-2 text-muted-foreground hover:text-primary">
                <i className="ri-login-circle-line text-xl"></i>
                <span className="hidden md:inline-block ml-1">Login</span>
              </Link>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-primary" 
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <i className="ri-close-line text-2xl"></i>
              ) : (
                <i className="ri-menu-line text-2xl"></i>
              )}
            </button>
          </div>
        </div>
        
        {/* Search Bar (Expandable) */}
        {isSearchOpen && (
          <div className="py-3 border-t border-border">
            <form onSubmit={handleSearch} className="flex">
              <input 
                type="text" 
                placeholder="Search for games..." 
                className="w-full p-2 rounded-l-md border-0 focus:ring-2 focus:ring-primary bg-muted text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-primary text-primary-foreground px-4 rounded-r-md hover:bg-primary/90 transition-colors"
              >
                <i className="ri-search-line"></i>
              </button>
            </form>
          </div>
        )}
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/categories" className="font-medium text-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/top-games" className="font-medium text-foreground hover:text-primary transition-colors">
                Top Games
              </Link>
              <Link href="/random" className="font-medium text-foreground hover:text-primary transition-colors">
                Random Game
              </Link>
              <Link href="/blog" className="font-medium text-foreground hover:text-primary transition-colors">
                Blog
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
