
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Teacher } from '@/lib/mock-data';

interface AuthContextType {
  user: Teacher | null;
  login: (user: Teacher) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('attendease-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('attendease-user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((loggedInUser: Teacher) => {
    localStorage.setItem('attendease-user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('attendease-user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
