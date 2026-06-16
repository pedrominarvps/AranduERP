'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'arandu_session';
const PIN_KEY = 'arandu_pin';

function getStoredPin(): string {
  if (typeof window === 'undefined') return '1234';
  return localStorage.getItem(PIN_KEY) || '1234';
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  changePin: (oldPin: string, newPin: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  const login = useCallback((pin: string): boolean => {
    const valid = getStoredPin();
    if (pin === valid) {
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

  const changePin = useCallback((oldPin: string, newPin: string): boolean => {
    const current = getStoredPin();
    if (oldPin !== current) return false;
    if (typeof window !== 'undefined') localStorage.setItem(PIN_KEY, newPin);
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
