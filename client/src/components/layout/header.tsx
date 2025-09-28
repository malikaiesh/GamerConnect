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
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Mobile-Optimized Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center group">
              {settings?.siteLogo && !settings?.useTextLogo ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <img 
                    src={settings.siteLogo} 
                    alt={settings.siteTitle || 'Gaming Portal'} 
                    className="relative h-8 sm:h-10 lg:h-12 w-auto transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 sm:p-2 lg:p-2.5 rounded-lg">
                      <i className="ri-gamepad-line text-white text-lg sm:text-xl lg:text-2xl"></i>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent font-inter tracking-tight"
                      style={settings?.textLogoColor ? { color: settings.textLogoColor } : {}}
                    >
                      {settings?.siteTitle ? settings.siteTitle : 'Gaming Portal'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-wider hidden sm:block">Ultimate Gaming Hub</span>
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
          
          {/* Mobile-Optimized Right Side Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Search Toggle - Always visible */}
            <button 
              onClick={toggleSearch}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 group touch-manipulation" 
              aria-label="Search"
            >
              <i className="ri-search-line text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300"></i>
            </button>
            
            {/* Theme Controls - Compact on mobile */}
            <div className="hidden sm:flex items-center space-x-1 bg-white/5 rounded-lg p-1">
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
              <ThemeSwitcher />
            </div>
            
            {/* Mobile Theme Toggle - Simple on mobile */}
            <button 
              onClick={toggleMode}
              className="sm:hidden p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 touch-manipulation" 
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <i className="ri-sun-line text-lg"></i>
              ) : (
                <i className="ri-moon-line text-lg"></i>
              )}
            </button>
            
            {/* Enhanced Auth Section - Mobile Optimized */}
            {user ? (
              <div 
                className="relative dropdown-container"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button 
                  className="p-2 sm:p-2.5 text-slate-300 hover:text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 rounded-lg flex items-center dropdown-trigger transition-all duration-300 border border-white/10 touch-manipulation"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="hidden xl:inline-block mr-2 font-medium text-sm">{user.username}</span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
                    <i className="ri-user-line text-lg sm:text-xl relative"></i>
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
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 touch-manipulation"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="ri-dashboard-line mr-3 text-blue-400"></i>
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 touch-manipulation"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="ri-user-settings-line mr-3 text-green-400"></i>
                      Profile Settings
                    </Link>
                    {user.isAdmin && (
                      <Link 
                        href="/admin/dashboard" 
                        className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 touch-manipulation"
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
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 touch-manipulation"
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
                className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
              >
                <i className="ri-login-circle-line text-lg mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            
            {/* Enhanced Mobile Menu Toggle - Touch Optimized */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
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
        
        {/* Mobile-Optimized Search Bar */}
        {isSearchOpen && (
          <div className="py-3 sm:py-4 border-t border-slate-700/50">
            <form onSubmit={handleSearch} className="flex max-w-full sm:max-w-md mx-auto px-2 sm:px-0">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Search for games..." 
                  className="w-full pl-10 pr-4 py-3 sm:py-3 rounded-l-xl border-0 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 rounded-r-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl touch-manipulation text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Search</span>
                <i className="ri-search-line sm:hidden"></i>
              </button>
            </form>
          </div>
        )}
        
        {/* Mobile-Optimized Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-lg">
            {/* Mobile Theme Controls */}
            <div className="px-4 py-3 border-b border-slate-700/30 sm:hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Theme</span>
                <div className="flex items-center space-x-2">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
            
            {/* Mobile Navigation Links */}
            <nav className="py-2">
              {[
                { href: '/', label: 'Home', icon: 'ri-home-5-line', color: 'text-blue-400' },
                { href: '/categories', label: 'Categories', icon: 'ri-apps-2-line', color: 'text-green-400' },
                { href: '/top-games', label: 'Top Games', icon: 'ri-trophy-line', color: 'text-yellow-400' },
                { href: '/tournaments', label: 'Tournaments', icon: 'ri-sword-line', color: 'text-red-400' },
                { href: '/random', label: 'Random Game', icon: 'ri-shuffle-line', color: 'text-purple-400' },
                { href: '/blog', label: 'Blog', icon: 'ri-article-line', color: 'text-pink-400' }
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center space-x-4 px-4 py-4 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 touch-manipulation relative ${
                    location === item.href ? 'text-white bg-white/10' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${location === item.href ? 'bg-white/15' : ''}`}>
                    <i className={`${item.icon} text-lg ${item.color}`}></i>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-base">{item.label}</span>
                  </div>
                  {location === item.href && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  )}
                  <i className="ri-arrow-right-s-line text-slate-500"></i>
                </Link>
              ))}
            </nav>
            
            {/* Mobile Quick Actions */}
            <div className="px-4 py-3 border-t border-slate-700/30">
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/random" 
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 rounded-lg transition-all duration-300 touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-shuffle-line text-blue-400 mr-2"></i>
                  <span className="text-sm font-medium text-white">Random Play</span>
                </Link>
                <Link 
                  href="/tournaments" 
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 rounded-lg transition-all duration-300 touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-trophy-line text-red-400 mr-2"></i>
                  <span className="text-sm font-medium text-white">Compete</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
