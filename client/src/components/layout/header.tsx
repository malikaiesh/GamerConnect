import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { useQuery } from '@tanstack/react-query';
import { SiteSetting } from '@shared/schema';
import { useTranslations } from '@/components/language-selector';

export function Header() {
  const { t } = useTranslations();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
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

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-black/10 transition-all duration-300">
      {/* Decorative top line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center group">
              {settings?.siteLogo && !settings?.useTextLogo ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <img 
                    src={settings.siteLogo} 
                    alt={settings.siteTitle || 'Gaming Portal'} 
                    className="relative h-12 w-auto transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-lg">
                      <i className="ri-gamepad-line text-white text-2xl"></i>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent font-inter tracking-tight"
                      style={settings?.textLogoColor ? { color: settings.textLogoColor } : {}}
                    >
                      {settings?.siteTitle ? settings.siteTitle : 'Gaming Portal'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-wider">Ultimate Gaming Hub</span>
                  </div>
                </div>
              )}
            </Link>
          </div>
          
          {/* Enhanced Main Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: '/', label: t('nav.home', 'Home'), icon: 'ri-home-5-line' },
              { href: '/categories', label: t('nav.categories', 'Categories'), icon: 'ri-apps-2-line' },
              { href: '/top-games', label: t('nav.top_games', 'Top Games'), icon: 'ri-trophy-line' },
              { href: '/tournaments', label: t('nav.tournaments', 'Tournaments'), icon: 'ri-sword-line' },
              { href: '/random', label: t('nav.random_game', 'Random'), icon: 'ri-shuffle-line' },
              { href: '/blog', label: t('nav.blog', 'Blog'), icon: 'ri-article-line' }
            ].map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`relative px-4 py-2.5 mx-1 text-sm font-medium text-slate-300 hover:text-white transition-all duration-300 group rounded-lg hover:bg-white/5 ${location === item.href ? 'text-white bg-white/10' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`${item.icon} text-base transition-transform duration-300 group-hover:scale-110`}></i>
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {/* Active indicator */}
                {location === item.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                )}
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 rounded-lg transition-all duration-300"></div>
              </Link>
            ))}
          </nav>
          
          {/* Enhanced Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Enhanced Search Toggle */}
            <div className="relative">
              <button 
                onClick={toggleSearch}
                className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 group" 
                aria-label="Search"
              >
                <i className="ri-search-line text-lg group-hover:scale-110 transition-transform duration-300"></i>
              </button>
            </div>
            
            {/* Enhanced Theme Controls */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleMode}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-all duration-300 group" 
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <i className="ri-sun-line text-lg group-hover:scale-110 transition-transform duration-300"></i>
                ) : (
                  <i className="ri-moon-line text-lg group-hover:scale-110 transition-transform duration-300"></i>
                )}
              </button>
              
              {/* Theme Selector */}
              <ThemeSwitcher />
            </div>
            
            {/* Enhanced Auth Section */}
            {user ? (
              <div 
                className="relative dropdown-container"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button 
                  className="p-2.5 text-slate-300 hover:text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 rounded-lg flex items-center dropdown-trigger transition-all duration-300 border border-white/10"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="hidden lg:inline-block mr-2 font-medium text-sm">{user.username}</span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
                    <i className="ri-user-line text-lg relative"></i>
                  </div>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl py-2 z-50 dropdown-menu border border-slate-600/50">
                    <div className="px-4 py-3 border-b border-slate-600/50">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-slate-400">Welcome back!</p>
                    </div>
                    <Link 
                      href="/user-dashboard" 
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="ri-dashboard-line mr-3 text-blue-400"></i>
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="ri-user-settings-line mr-3 text-green-400"></i>
                      Profile Settings
                    </Link>
                    {user.isAdmin && (
                      <Link 
                        href="/admin/dashboard" 
                        className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-admin-line mr-3 text-purple-400"></i>
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-slate-600/50 my-2"></div>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <i className="ri-logout-circle-line mr-3"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <i className="ri-login-circle-line text-lg mr-2"></i>
                <span>Login</span>
              </Link>
            )}
            
            {/* Enhanced Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300" 
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <i className="ri-close-line text-xl"></i>
              ) : (
                <i className="ri-menu-line text-xl"></i>
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-slate-700/50">
            <form onSubmit={handleSearch} className="flex max-w-md mx-auto">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Search for amazing games..." 
                  className="w-full pl-10 pr-4 py-3 rounded-l-xl border-0 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-r-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Search
              </button>
            </form>
          </div>
        )}
        
        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-700/50">
            <nav className="flex flex-col space-y-1">
              {[
                { href: '/', label: 'Home', icon: 'ri-home-5-line' },
                { href: '/categories', label: 'Categories', icon: 'ri-apps-2-line' },
                { href: '/top-games', label: 'Top Games', icon: 'ri-trophy-line' },
                { href: '/tournaments', label: 'Tournaments', icon: 'ri-sword-line' },
                { href: '/random', label: 'Random Game', icon: 'ri-shuffle-line' },
                { href: '/blog', label: 'Blog', icon: 'ri-article-line' }
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 ${location === item.href ? 'text-white bg-white/10 border-l-4 border-blue-500' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  <span className="font-medium">{item.label}</span>
                  {location === item.href && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
