import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authAPI.login(email, password);
      
      if (res.data.success && res.data.data) {
        const apiUser = res.data.data;
        console.log('[Auth] Login successful -> User:', apiUser);
        
        const u: User = {
          _id: apiUser._id,
          id: apiUser._id, // For compatibility
          email: apiUser.email,
          name: apiUser.name,
          mobile: apiUser.mobile,
          role: apiUser.role,
          isBlock: apiUser.isBlock || false,
          createdAt: apiUser.createdAt || new Date().toISOString(),
          updatedAt: apiUser.updatedAt || new Date().toISOString(),
        };
        
        setUser(u);
        localStorage.setItem('workshop_user', JSON.stringify(u));
        return true;
      }
      
      console.error('[Auth] Login failed:', res.data.message);
      return false;
    } catch (error: any) {
      console.error('[Auth] Login error:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('workshop_user');
  };

  // Initialize user from localStorage - server uses HTTP-only cookies for auth
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const stored = localStorage.getItem('workshop_user');
        if (stored) {
          const storedUser = JSON.parse(stored);
          setUser(storedUser);
          
          // Note: Server uses HTTP-only cookies, so we rely on stored user data
          // Token validation happens automatically via cookies on API calls
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        localStorage.removeItem('workshop_user');
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};