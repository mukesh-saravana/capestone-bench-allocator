import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock auth — replace with real API call when backend is ready
const MOCK_USER: User = { id: 'user-001', name: 'Demo Manager', email: 'demo@company.com', role: 'resource_manager' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 800));
    if (password.length < 4) throw new Error('Invalid email or password');

    const fakeToken = `mock-jwt-${Date.now()}`;
    localStorage.setItem('auth_token', fakeToken);
    localStorage.setItem('auth_user', JSON.stringify({ ...MOCK_USER, email }));
    setToken(fakeToken);
    setUser({ ...MOCK_USER, email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

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
