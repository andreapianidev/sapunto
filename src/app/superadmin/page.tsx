'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTenants, fetchPiani, fetchStatsPiattaforma } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatCurrency } from '@/lib/utils';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

export default function SuperAdminDashboard() {
  const [allData, loading] = useServerData(
    () => Promise.all([
      fetchTenants(),
      fetchPiani(),
      fetchStatsPiattaforma(),
    ]),
    [[], [], { tenantAttivi: 0, utentiTotali: 0, mrr: 0, mrrTrend: [], crescitaUtenti: [], churnRate: 0 }]
  );
  const tenants = allData[0];
  const piani = allData[1];
  const statsPiattaforma = allData[2];

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Dashboard Piattaforma" description="Panoramica globale Sapunto">
      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
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
      </div>

      {/* Tenant Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Riepilogo Tenant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenants.map((t: any) => {
            const piano = piani.find((p: any) => p.id === t.piano);
            return (
              <div key={t.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a2332] text-white font-bold text-sm">
                    {t.ragioneSociale.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{t.ragioneSociale}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.citta} — {t.utentiAttivi} utenti
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{piano ? formatCurrency(piano.prezzoMensile) : '—'}/mese</p>
                  <p className="text-xs text-muted-foreground capitalize">Piano {t.piano}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
