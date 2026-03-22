'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Tenant, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setRole(data.user.ruolo);
        setTenant(data.tenant);
      } else {
        setUser(null);
        setRole(null);
        setTenant(null);
      }
    } catch {
      setUser(null);
      setRole(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Errore di login' };
      }
      // Refresh session to get full user + tenant data
      await refreshSession();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Errore di connessione' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setTenant(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, role, loading, login, logout, refreshSession }}>
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
