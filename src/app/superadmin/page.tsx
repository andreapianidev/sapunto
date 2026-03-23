'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchTenants, fetchPiani, fetchStatsPiattaforma, fetchAbbonamenti, fetchTransazioniPiattaforma } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Building2, Users, DollarSign, TrendingUp, CreditCard, Plus, ArrowRight, FileText } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6'];

export default function SuperAdminDashboard() {
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([
      fetchTenants(),
      fetchPiani(),
      fetchStatsPiattaforma(),
      fetchAbbonamenti(),
      fetchTransazioniPiattaforma(),
    ]),
    [[], [], { tenantAttivi: 0, utentiTotali: 0, mrr: 0, mrrTrend: [], crescitaUtenti: [], churnRate: 0 }, [], []]
  );
  const tenants = allData[0];
  const piani = allData[1];
  const statsPiattaforma = allData[2];
  const abbonamenti = allData[3];
  const transazioni = allData[4];

  // Revenue per piano for pie chart
  const revenuePerPiano = useMemo(() => {
    return piani.map((p: any) => {
      const count = tenants.filter((t: any) => t.piano === p.id).length;
      return {
        name: p.nome,
        value: Math.round(p.prezzoMensile * count),
      };
    }).filter((p: any) => p.value > 0);
  }, [piani, tenants]);

  // Abbonamenti stats
  const abbonamentiAttivi = abbonamenti.filter((a: any) => a.stato === 'attivo').length;
  const abbonamentiMensili = abbonamenti.filter((a: any) => a.stato === 'attivo' && a.cicloPagamento === 'mensile').length;
  const abbonamentiAnnuali = abbonamenti.filter((a: any) => a.stato === 'attivo' && a.cicloPagamento === 'annuale').length;
  const arpu = tenants.length > 0 ? statsPiattaforma.mrr / tenants.filter((t: any) => t.stato === 'attivo').length : 0;

  // Recent transactions (last 5)
  const recentTransazioni = useMemo(() => {
    return transazioni.slice(0, 5).map((t: any) => {
      const tenant = tenants.find((ten: any) => ten.id === t.tenantId);
      return { ...t, tenantNome: tenant?.ragioneSociale || t.tenantId };
    });
  }, [transazioni, tenants]);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Dashboard Piattaforma"
      description="Panoramica globale Sapunto"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/superadmin/tenant">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Tenant
            </Button>
          </Link>
          <Link href="/superadmin/billing">
            <Button variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Transazioni
            </Button>
          </Link>
        </div>
      }
    >
      {/* KPI - 5 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tenant Attivi</p>
                <p className="text-3xl font-bold">{statsPiattaforma.tenantAttivi}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-3xl font-bold">{formatCurrency(statsPiattaforma.mrr)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utenti Totali</p>
                <p className="text-3xl font-bold">{statsPiattaforma.utentiTotali}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abbonamenti</p>
                <p className="text-3xl font-bold">{abbonamentiAttivi || statsPiattaforma.tenantAttivi}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-3xl font-bold">{statsPiattaforma.churnRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Andamento MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={statsPiattaforma.mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'MRR']} />
                <Line type="monotone" dataKey="mrr" stroke="#1a2332" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue per Piano</CardTitle>
          </CardHeader>
          <CardContent>
            {revenuePerPiano.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenuePerPiano}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {revenuePerPiano.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend formatter={(value: string) => <span className="text-sm">{value}</span>} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'MRR']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                Nessun dato disponibile
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Growth + Platform Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Crescita Utenti</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statsPiattaforma.crescitaUtenti}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="utenti" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stato Piattaforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{abbonamentiAttivi || statsPiattaforma.tenantAttivi}</p>
                <p className="text-xs text-muted-foreground mt-1">Abbonamenti Attivi</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(Math.round(arpu))}</p>
                <p className="text-xs text-muted-foreground mt-1">ARPU</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{abbonamentiMensili || '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">Mensili</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{abbonamentiAnnuali || '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">Annuali</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{formatCurrency(statsPiattaforma.mrr * 12)}</p>
              <p className="text-xs text-muted-foreground mt-1">ARR Stimato</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attività Recente + Tenant Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Attività Recente</CardTitle>
            <Link href="/superadmin/billing">
              <Button variant="ghost" size="sm" className="text-xs">
                Vedi tutto <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransazioni.length > 0 ? recentTransazioni.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    t.stato === 'completata' ? 'bg-green-100 text-green-700' :
                    t.stato === 'fallita' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {t.metodoPagamento === 'paypal' ? 'PP' : t.metodoPagamento === 'nexi' ? 'NX' : 'BN'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.tenantNome}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.data)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(t.importo)}</p>
                  <Badge variant="secondary" className={`text-[10px] ${
                    t.stato === 'completata' ? 'bg-green-100 text-green-800' :
                    t.stato === 'fallita' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t.stato === 'completata' ? 'Completato' : t.stato === 'fallita' ? 'Fallito' : 'In Attesa'}
                  </Badge>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Le transazioni appariranno qui quando i clienti effettueranno pagamenti.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Riepilogo Tenant</CardTitle>
            <Link href="/superadmin/tenant">
              <Button variant="ghost" size="sm" className="text-xs">
                Gestisci <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenants.map((t: any) => {
              const piano = piani.find((p: any) => p.id === t.piano);
              return (
                <div key={t.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a2332] text-white font-bold text-sm">
                      {t.ragioneSociale.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.ragioneSociale}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.citta} — {t.utentiAttivi} utenti
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{piano ? formatCurrency(piano.prezzoMensile) : '—'}/mese</p>
                    <p className="text-xs text-muted-foreground capitalize">Piano {t.piano}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
