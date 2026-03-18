'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Building2, User } from 'lucide-react';

const roles: { value: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'superadmin', label: 'Super Admin', description: 'Gestione piattaforma globale', icon: Shield },
  { value: 'tenant_admin', label: 'Amministratore', description: 'Gestione azienda (Rossi Elettronica)', icon: Building2 },
  { value: 'utente', label: 'Operatore', description: 'Accesso operativo limitato', icon: User },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant_admin');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, 't-1');
    if (selectedRole === 'superadmin') {
      router.push('/superadmin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a2332] font-bold text-2xl mb-4">
            S
          </div>
          <h1 className="text-3xl font-bold text-white">Sapunto</h1>
          <p className="text-blue-200 mt-1">Gestionale SaaS per PMI</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Accedi alla piattaforma</CardTitle>
            <CardDescription>
              Seleziona un ruolo per la demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                        selectedRole === role.value
                          ? 'border-[#1a2332] bg-[#1a2332]/5'
                          : 'border-border hover:border-[#1a2332]/30'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          selectedRole === role.value
                            ? 'bg-[#1a2332] text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{role.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mock credentials */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={
                      selectedRole === 'superadmin'
                        ? 'admin@sapunto.cloud'
                        : selectedRole === 'tenant_admin'
                        ? 'luigi@rossielettonica.it'
                        : 'anna@rossielettonica.it'
                    }
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value="demo12345"
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                Accedi
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo — Le credenziali sono precompilate
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-blue-300 mt-6">
          sapunto.com — sapunto.cloud
        </p>
      </div>
    </div>
  );
}
