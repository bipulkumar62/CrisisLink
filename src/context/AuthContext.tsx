import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserRole } from '@/src/types/auth';
import { services } from '@/src/services';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginDemo: (role: UserRole) => Promise<void>;
  loginWithCredentials: (badgeOrEmail: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const current = await services.authService.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Failed to initialize operator session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const loginDemo = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    try {
      const loggedUser = await services.authService.loginDemo(role);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithCredentials = useCallback(async (badgeOrEmail: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await services.authService.loginWithCredentials(badgeOrEmail, pass);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await services.authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginDemo,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
