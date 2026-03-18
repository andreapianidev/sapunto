'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatoOrdineColor, getStatoOrdineLabel } from '@/lib/utils';
import { venditeMensili, topClienti, ordiniPerCanale, ordini, appuntamenti, fatture } from '@/lib/mockdata';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#1a2332', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

// TODO: Replace with Supabase query
const kpis = [
  {
    title: 'Fatturato Mese',
    value: formatCurrency(32100),
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Ordini Mese',
    value: '14',
    change: '+16.7%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    title: 'Nuovi Clienti',
    value: '3',
    change: '+50%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Appuntamenti Oggi',
    value: String(appuntamenti.filter((a) => a.data === '2026-03-18').length),
    change: '',
    trend: 'neutral',
    icon: Calendar,
  },
];

export default function DashboardPage() {
  const ordiniRecenti = ordini.slice(-5).reverse();
  const fattureInScadenza = fatture.filter((f) => f.stato === 'non_pagata').slice(0, 5);
  const appuntamentiOggi = appuntamenti.filter((a) => a.data === '2026-03-18');

  return (
    <PageContainer title="Dashboard" description="Panoramica delle attivit&agrave;">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a2332]/10">
                    <Icon className="h-6 w-6 text-[#1a2332]" />
                  </div>
                </div>
                {kpi.change && (
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {kpi.change}
                    </span>
                    <span className="text-muted-foreground">vs mese prec.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Andamento Vendite */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Andamento Vendite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={venditeMensili}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Fatturato']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="fatturato" fill="#1a2332" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ordini per Canale */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ordini per Canale</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={ordiniPerCanale}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="valore"
                  nameKey="canale"
                >
                  {ordiniPerCanale.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Quota']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {ordiniPerCanale.map((item, i) => (
                <div key={item.canale} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.canale}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ordini Recenti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ordini Recenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordiniRecenti.map((ordine) => (
              <div key={ordine.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{ordine.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">{ordine.numero} — {formatDate(ordine.data)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(ordine.totale)}</p>
                  <Badge variant="secondary" className={`text-xs ${getStatoOrdineColor(ordine.stato)}`}>
                    {getStatoOrdineLabel(ordine.stato)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Clienti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Clienti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClienti.map((cliente, i) => (
              <div key={cliente.nome} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2332] text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium">{cliente.nome}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(cliente.fatturato)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appuntamenti Oggi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Appuntamenti Oggi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appuntamentiOggi.length > 0 ? (
              appuntamentiOggi.map((app) => (
                <div key={app.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <span className="text-xs font-bold">{app.oraInizio}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{app.titolo}</p>
                    {app.clienteNome && (
                      <p className="text-xs text-muted-foreground">{app.clienteNome}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {app.oraInizio} - {app.oraFine} | {app.operatoreNome}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nessun appuntamento oggi</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
