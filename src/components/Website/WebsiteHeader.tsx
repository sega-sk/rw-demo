import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Heart } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import OptimizedImage from '../UI/OptimizedImage';

interface WebsiteHeaderProps {
  onSearchClick: () => void;
  variant?: 'light' | 'dark';
  className?: string;
}

export default function WebsiteHeader({ onSearchClick, variant = 'light', className = '' }: WebsiteHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/catalog' },
    /*
    { name: 'Memorabilia', href: '/memorabilia' },
    { name: 'Merchandise', href: '/merchandise' },
    */
    { name: 'About', href: '/about' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Promo Bar */}
      <div className="bg-yellow-600 text-black py-2 text-center text-sm font-medium font-inter">
        <p>🎬 Bring Hollywood Magic to Your <a href="/catalog"><b>Event</b></a>!</p>
      </div>

      {/* Main Header */}
      <header className={`website-header bg-white shadow-sm relative z-40 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex items-center">
                <OptimizedImage
                  src="/logo black and white.webp" 
                  alt="Reel Wheels Experience" 
                  size="small"
                  className="h-8 md:h-12 w-auto"
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`text-lg font-medium transition-colors font-inter ${
                    isActive(item.href)
                      ? 'text-yellow-600 border-b-2 border-yellow-600 pb-1'
                      : 'text-gray-700 hover:text-yellow-600'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={onSearchClick}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={onSearchClick}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors font-inter ${
                    isActive(item.href)
                      ? 'text-yellow-600 bg-yellow-50'
                      : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}