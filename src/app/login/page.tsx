'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    if (result.ok) {
      // Redirect based on session — fetch session to determine role
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session.user?.ruolo === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Errore di login');
      setSubmitting(false);
    }
  };

  // Quick demo login helper
  const demoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo12345');
    setError('');
    setSubmitting(true);
    const result = await login(demoEmail, 'demo12345');
    if (result.ok) {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session.user?.ruolo === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Errore di login');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a2332] font-bold text-2xl mb-4">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Sapunto</h1>
          <p className="text-blue-200 mt-1">Gestionale SaaS per PMI</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Accedi alla piattaforma</CardTitle>
            <CardDescription>
              Inserisci le tue credenziali
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@azienda.it"
                  required
                  className="mt-1"
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="La tua password"
                  required
                  className="mt-1"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/signup" className="text-sm text-primary hover:underline">
                Non hai un account? Registrati gratis
              </Link>
            </div>

            {/* Demo quick access */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground mb-3">Accesso rapido demo</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={submitting}
                  onClick={() => demoLogin('admin@sapunto.cloud')}
                >
                  Super Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={submitting}
                  onClick={() => demoLogin('luigi@rossielettonica.it')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={submitting}
                  onClick={() => demoLogin('anna@rossielettonica.it')}
                >
                  Operatore
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-blue-300 mt-6">
          sapunto.com — sapunto.cloud
        </p>
      </div>
    </div>
  );
}
