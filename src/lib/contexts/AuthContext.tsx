'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { db } from '@/services/db';

const STORAGE_KEY = 'arandu_session';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuthenticated(localStorage.getItem(STORAGE_KEY) === 'true');
    }
    setIsAuthLoaded(true);
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    const valid = await db.verifyPin(pin);
    if (valid) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    return await db.changePin(oldPin, newPin);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoaded, login, logout, changePin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
