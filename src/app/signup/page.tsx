'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pianoParam = searchParams.get('piano') || 'explore';
  const { refreshSession } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    ragioneSociale: '',
    partitaIva: '',
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confermaPassword) {
      setError('Le password non coincidono');
      return;
    }
    if (form.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ragioneSociale: form.ragioneSociale,
          partitaIva: form.partitaIva,
          nome: form.nome,
          cognome: form.cognome,
          email: form.email,
          password: form.password,
          piano: pianoParam,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante la registrazione');
        setSubmitting(false);
        return;
      }

      // Aggiorna il contesto auth con la nuova sessione prima di navigare
      await refreshSession();
      router.push('/dashboard');
    } catch {
      setError('Errore di connessione');
      setSubmitting(false);
    }
  };

  const benefits = [
    'Prova gratuita 30 giorni',
    'Nessuna carta di credito richiesta',
    'Supporto incluso nel trial',
    'Cancella quando vuoi',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332] p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a2332] font-bold text-2xl mb-4">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Inizia con Sapunto</h1>
          <p className="text-blue-200 mt-1">
            Piano <span className="font-semibold capitalize">{pianoParam}</span> — Prova gratuita 30 giorni
          </p>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-sm text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {b}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Registrazione</CardTitle>
            <CardDescription>
              Inserisci i dati della tua azienda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="ragioneSociale">Ragione Sociale *</Label>
                  <Input
                    id="ragioneSociale"
                    value={form.ragioneSociale}
                    onChange={(e) => updateField('ragioneSociale', e.target.value)}
                    placeholder="La Mia Azienda S.r.l."
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="partitaIva">Partita IVA *</Label>
                  <Input
                    id="partitaIva"
                    value={form.partitaIva}
                    onChange={(e) => updateField('partitaIva', e.target.value)}
                    placeholder="01234567890"
                    required
                    className="mt-1"
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email aziendale *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="nome@azienda.it"
                    required
                    className="mt-1"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => updateField('nome', e.target.value)}
                    placeholder="Mario"
                    required
                    className="mt-1"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="cognome">Cognome *</Label>
                  <Input
                    id="cognome"
                    value={form.cognome}
                    onChange={(e) => updateField('cognome', e.target.value)}
                    placeholder="Rossi"
                    required
                    className="mt-1"
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Almeno 8 caratteri"
                    required
                    className="mt-1"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confermaPassword">Conferma Password *</Label>
                  <Input
                    id="confermaPassword"
                    type="password"
                    value={form.confermaPassword}
                    onChange={(e) => updateField('confermaPassword', e.target.value)}
                    placeholder="Ripeti la password"
                    required
                    className="mt-1"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  'Crea Account Gratuito'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Creando un account accetti i{' '}
                <span className="text-primary hover:underline cursor-pointer">Termini di Servizio</span>
                {' '}e la{' '}
                <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                Hai già un account? Accedi
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
