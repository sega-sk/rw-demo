import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const checkAuth = async () => {
      console.log('Checking authentication...');
      try {
        // Check for demo authentication first
        const demoAuth = localStorage.getItem('demo_auth');
        const demoUser = localStorage.getItem('demo_user');
        
        console.log('Demo auth:', demoAuth, 'Demo user:', demoUser);
        
        if (demoAuth === 'true' && demoUser) {
          console.log('Using demo authentication');
          setUser(JSON.parse(demoUser));
          setIsLoading(false);
          return;
        }
        
        // Check API authentication
        if (authService.isAuthenticated()) {
          console.log('API authentication found');
          // Validate the token or fetch user info here
          setUser({
            id: '1',
            email: 'sega@dealertower.com',
            role: 'admin'
          });
        }
        console.log('No authentication found');
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        localStorage.removeItem('demo_auth');
        localStorage.removeItem('demo_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try to login with the API
      try {
        await authService.login({ username: email, password });
        
        // Set user data after successful API login
        setUser({
          id: '1',
          email,
          role: 'admin'
        });
        
      } catch (apiError) {
        throw new Error('Invalid credentials. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('demo_auth');
    localStorage.removeItem('demo_user');
    console.log('Logged out, cleared localStorage');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}