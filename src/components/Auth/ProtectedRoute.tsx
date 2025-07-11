import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OptimizedImage from '../UI/OptimizedImage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Add debug logging
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'path:', location.pathname, 'user:', useAuth().user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <OptimizedImage
            src="/logo.png" 
            alt="Reel Wheels Experience" 
            size="thumbnail"
            className="h-16 w-auto mx-auto mb-6"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login from:', location.pathname);
    // Redirect to login page with return URL
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  console.log('Authenticated, rendering protected route:', location.pathname);
  return <>{children}</>;
}