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
      
      if (res.data.success && res.data.data?.user) {
        const apiUser = res.data.data.user;
        console.log('[Auth] Login successful -> User:', apiUser);
        
        const u: User = {
          id: apiUser._id || apiUser.id,
          email: apiUser.email,
          name: apiUser.name || '',
          role: apiUser.role,
          showroomId: apiUser.showroomId,
          phone: apiUser.phone || '',
          createdAt: apiUser.createdAt || new Date().toISOString(),
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

  // Initialize user from localStorage and verify with backend
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const stored = localStorage.getItem('workshop_user');
        if (stored) {
          const storedUser = JSON.parse(stored);
          setUser(storedUser);
          
          // Verify token is still valid
          try {
            await authAPI.me();
          } catch (error) {
            // Token expired or invalid, clear stored user
            console.log('[Auth] Token expired, clearing stored user');
            setUser(null);
            localStorage.removeItem('workshop_user');
          }
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