'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Tenant, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  role: UserRole | null;
  login: (role: UserRole, tenantId?: string) => void;
  logout: () => void;
  switchTenant: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: Replace with Supabase Auth
const mockUsers: Record<string, User> = {
  superadmin: {
    id: 'u-super-1',
    tenantId: '',
    nome: 'Marco',
    cognome: 'Verdi',
    email: 'admin@sapunto.cloud',
    ruolo: 'superadmin',
    attivo: true,
  },
  tenant_admin: {
    id: 'u-admin-1',
    tenantId: 't-1',
    nome: 'Luigi',
    cognome: 'Rossi',
    email: 'luigi@rossielettonica.it',
    ruolo: 'tenant_admin',
    attivo: true,
  },
  utente: {
    id: 'u-op-1',
    tenantId: 't-1',
    nome: 'Anna',
    cognome: 'Bianchi',
    email: 'anna@rossielettonica.it',
    ruolo: 'utente',
    attivo: true,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = (selectedRole: UserRole, tenantId?: string) => {
    const mockUser = mockUsers[selectedRole];
    if (mockUser) {
      setUser(mockUser);
      setRole(selectedRole);
      // Tenant will be loaded from mockdata
      if (tenantId) {
        // Dynamic import to avoid circular dependency
        import('./mockdata').then((mod) => {
          const t = mod.tenants.find((t) => t.id === tenantId);
          if (t) setTenant(t);
        });
      } else if (selectedRole !== 'superadmin') {
        import('./mockdata').then((mod) => {
          const t = mod.tenants.find((t) => t.id === mockUser.tenantId);
          if (t) setTenant(t);
        });
      }
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setRole(null);
  };

  const switchTenant = (tenantId: string) => {
    import('./mockdata').then((mod) => {
      const t = mod.tenants.find((t) => t.id === tenantId);
      if (t) {
        setTenant(t);
        if (user) {
          setUser({ ...user, tenantId });
        }
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, tenant, role, login, logout, switchTenant }}>
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
