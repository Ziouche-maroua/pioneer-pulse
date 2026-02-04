

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  
   // Check if user has valid token in localStorage
   
  async function checkAuth() {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        // Verify token is still valid
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
          },
        });

        if (response.ok) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          // Token expired or invalid
          clearAuth();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
      }
    }

    setIsLoading(false);
  }

  /**
   * Login user
   */
  async function login(email: string, password: string) {
    try {
      console.log(' Attempting login to:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(' Login response status:', response.status);

      const data = await response.json();
      console.log(' Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save to state and localStorage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      console.log('✅ Login successful, redirecting to dashboard');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async function register(username: string, email: string, password: string) {
    try {
      console.log(' Attempting registration to:', `${API_URL}/auth/register`);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log(' Register response status:', response.status);

      const data = await response.json();
      console.log(' Register response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log(' Registration successful, auto-logging in');

      // Auto-login after registration
      await login(email, password);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  function logout() {
    // Call backend logout (optional - JWT is stateless)
    if (token) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(console.error);
    }

    clearAuth();
    navigate('/login');
  }

  /**
   * Clear authentication data
   */
  function clearAuth() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}