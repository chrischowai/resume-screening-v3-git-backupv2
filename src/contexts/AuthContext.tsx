import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginName: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = async (loginName: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-login', {
        body: { loginName, password }
      });

      if (error) {
        console.error('Login validation error:', error);
        setIsLoading(false);
        return { success: false, message: 'Login validation failed' };
      }

      if (data.valid) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};