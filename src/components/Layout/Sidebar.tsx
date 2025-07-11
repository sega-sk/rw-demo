import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X,
  LogOut,
  LayoutDashboard, 
  Rocket,
  Star, 
  ShoppingBag, 
  List,
  User,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import OptimizedImage from '../UI/OptimizedImage';

// Navigation items with proper spacing - Product List moved after Dashboard
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Product List', href: '/admin/product-list', icon: List },
  { name: 'Product', href: '/admin/products', icon: Rocket },
  { name: 'Memorabilia', href: '/admin/memorabilia', icon: Star },
  { name: 'Merchandise', href: '/admin/merchandise', icon: ShoppingBag },
  { name: 'Profile', href: '/admin/profile', icon: User },
  { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
];

// Movie/Comics themed background elements
const backgroundElements = [
  { type: 'batman', icon: '🦇', color: 'text-yellow-400' },
  { type: 'superman', icon: '🚀', color: 'text-blue-400' },
  { type: 'spiderman', icon: '🕷️', color: 'text-red-400' },
  { type: 'car', icon: '🚗', color: 'text-green-400' },
  { type: 'film', icon: '🎬', color: 'text-purple-400' },
  { type: 'star', icon: '⭐', color: 'text-yellow-300' },
  { type: 'rocket', icon: '🚀', color: 'text-orange-400' },
  { type: 'mask', icon: '🎭', color: 'text-pink-400' },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ className = '', onClose }: SidebarProps) {
  const { logout, user } = useAuth();
  const [currentElements, setCurrentElements] = useState(backgroundElements.slice(0, 4));

  // Animate background elements every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentElements(prev => {
        const shuffled = [...backgroundElements].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 4);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });
  return (
    <div className={`flex h-full w-64 flex-col bg-white border-r border-gray-200 relative overflow-hidden ${className}`}>
      {/* Animated Background Elements */}
      
      {/* Mobile close button */}
      <div className="md:hidden absolute top-4 right-4 z-50">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {currentElements.map((element, index) => (
          <div
            key={`${element.type}-${index}`}
            className={`absolute text-4xl opacity-10 ${element.color} animate-pulse`}
            style={{
              bottom: `${30 + index * 25}px`,
              right: `${15 + index * 10}px`,
              animationDelay: `${index * 2}s`,
              animationDuration: '6s',
              transform: `rotate(${index * 15}deg)`,
            }}
          >
            {element.icon}
          </div>
        ))}
      </div>

      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 relative z-10">
        <div className="flex items-center space-x-3">
          <OptimizedImage
            src="/logo.png" 
            alt="Reel Wheels Experience" 
            size="thumbnail"
            className="h-10 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 relative z-10">
        {filteredNavigation.map((item, index) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
            {/* Add 140px gap after Merchandise and before Profile */}
            {item.name === 'Merchandise' && (
              <div className="h-36"></div>
            )}
            {/* Add logout button after Users (or Profile if not admin) */}
            {((item.name === 'Users' && user?.role === 'admin') || (item.name === 'Profile' && user?.role !== 'admin')) && (
              <button
                onClick={logout}
                className="group flex items-center px-3 py-2 mt-4 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                Logout
              </button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}