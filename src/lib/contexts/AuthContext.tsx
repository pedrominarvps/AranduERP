'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { db } from '@/services/db';

const STORAGE_KEY = 'arandu_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000;
const LOCKOUT_KEY = 'arandu_lockout';

interface SessionData {
  token: string;
  expiresAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Array.from({ length: 16 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
}

function saveSession(): void {
  if (typeof window === 'undefined') return;
  const data: SessionData = {
    token: generateToken(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: SessionData = JSON.parse(raw);
    if (!data.token || !data.expiresAt) return null;
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function getRemainingLockout(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return 0;
    const until = parseInt(raw, 10);
    if (isNaN(until)) return 0;
    const remaining = until - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      return 0;
    }
    return remaining;
  } catch {
    return 0;
  }
}

function setLockout(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION_MS));
}

function incrementAttempts(): number {
  if (typeof window === 'undefined') return 1;
  const key = 'arandu_attempts';
  const raw = localStorage.getItem(key);
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  localStorage.setItem(key, String(count));
  return count;
}

function resetAttempts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('arandu_attempts');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setIsAuthenticated(true);
    }
    setIsAuthLoaded(true);
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    const lockout = getRemainingLockout();
    if (lockout > 0) {
      await new Promise(resolve => setTimeout(resolve, lockout));
      return false;
    }

    attemptsRef.current += 1;
    if (attemptsRef.current > MAX_ATTEMPTS) {
      setLockout();
      attemptsRef.current = 0;
      return false;
    }

    const valid = await db.verifyPin(pin);
    if (valid) {
      setIsAuthenticated(true);
      saveSession();
      attemptsRef.current = 0;
      resetAttempts();
      return true;
    }

    const failCount = incrementAttempts();
    if (failCount >= MAX_ATTEMPTS) {
      setLockout();
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    clearSession();
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    const result = await db.changePin(oldPin, newPin);
    if (result) saveSession();
    return result;
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
