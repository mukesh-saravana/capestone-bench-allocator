import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import type { User } from '../types';
import { login as loginApi, logout as logoutApi, me as meApi } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginApi(email, password);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.detail === 'string') {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Invalid email or password. Please try again.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    if (!token || user) {
      return;
    }
    let active = true;
    meApi()
      .then((meUser) => {
        if (!active) {
          return;
        }
        localStorage.setItem('auth_user', JSON.stringify(meUser));
        setUser(meUser);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        clearAuth();
      });
    return () => {
      active = false;
    };
  }, [token, user, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
