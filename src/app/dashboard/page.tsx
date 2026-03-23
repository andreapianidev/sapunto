'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatoOrdineColor, getStatoOrdineLabel } from '@/lib/utils';
import { fetchVenditeMensili, fetchTopClienti, fetchOrdiniPerCanale, fetchOrdini, fetchAppuntamenti, fetchFatture, fetchTickets, fetchLeads, fetchContratti, fetchProdotti } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Activity,
  Bell,
  FileText,
  Ticket,
  UserPlus,
  Package,
  RefreshCw,
  ClipboardCheck,
  CircleDot,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#1a2332', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

// Build activity feed from real data
function buildAttivitaRecenti(ordini: any[], tickets: any[], leads: any[], fatture: any[]) {
  const items: { id: string; icona: string; testo: string; data: string; colore: string }[] = [];

  ordini.slice(-5).forEach((o: any) => {
    items.push({ id: `ord-${o.id}`, icona: 'ordine', testo: `Ordine ${o.numero} da ${o.clienteNome || 'cliente'}`, data: o.data, colore: 'text-blue-600' });
  });
  tickets.slice(-5).forEach((t: any) => {
    items.push({ id: `tkt-${t.id}`, icona: 'ticket', testo: `Ticket ${t.numero} — ${t.oggetto || t.titolo || ''}`, data: t.dataApertura || t.data, colore: 'text-red-600' });
  });
  leads.slice(-5).forEach((l: any) => {
    items.push({ id: `lead-${l.id}`, icona: 'lead', testo: `Lead ${l.azienda || l.nome || ''} — ${l.stato || ''}`, data: l.dataCreazione || l.data, colore: 'text-purple-600' });
  });
  fatture.slice(-5).forEach((f: any) => {
    items.push({ id: `fat-${f.id}`, icona: 'fattura', testo: `Fattura ${f.numero} per ${f.clienteNome || 'cliente'}`, data: f.dataEmissione || f.data, colore: 'text-green-600' });
  });

  // Sort by date descending
  items.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  return items.slice(0, 8);
}

const activityIconMap: Record<string, typeof ShoppingCart> = {
  ordine: ShoppingCart,
  ticket: Ticket,
  lead: UserPlus,
  fattura: FileText,
  contratto: RefreshCw,
  cliente: Users,
};

const notificaStyles: Record<string, { bg: string; text: string; border: string }> = {
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-500' },
  danger: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([
      fetchVenditeMensili(tenantId),
      fetchTopClienti(tenantId),
      fetchOrdiniPerCanale(tenantId),
      fetchOrdini(tenantId),
      fetchAppuntamenti(tenantId),
      fetchFatture(tenantId),
      fetchTickets(tenantId),
      fetchLeads(tenantId),
      fetchContratti(tenantId),
      fetchProdotti(tenantId),
    ]),
    [[], [], [], [], [], [], [], [], [], []]
  );
  const venditeMensili = allData[0];
  const topClienti = allData[1];
  const ordiniPerCanale = allData[2];
  const ordini = allData[3];
  const appuntamenti = allData[4];
  const fatture = allData[5];
  const tickets = allData[6];
  const leads = allData[7];
  const contratti = allData[8];
  const prodotti = allData[9];

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  // Compute real KPIs from fetched data
  const oggi = new Date().toISOString().split('T')[0];
  const meseCorrente = oggi.slice(0, 7); // YYYY-MM
  const fattureDelMese = fatture.filter((f: any) => (f.dataEmissione || f.data || '').startsWith(meseCorrente));
  const fatturato = fattureDelMese.reduce((sum: number, f: any) => sum + (Number(f.totale) || 0), 0);
  const ordiniDelMese = ordini.filter((o: any) => (o.data || '').startsWith(meseCorrente));

  const kpis: { title: string; value: string; change: string; trend: 'up' | 'down' | 'neutral'; icon: typeof DollarSign }[] = [
    {
      title: 'Fatturato Mese',
      value: formatCurrency(fatturato),
      change: '',
      trend: 'neutral',
      icon: DollarSign,
    },
    {
      title: 'Ordini Mese',
      value: String(ordiniDelMese.length),
      change: '',
      trend: 'neutral',
      icon: ShoppingCart,
    },
    {
      title: 'Lead Attivi',
      value: String(leads.length),
      change: '',
      trend: 'neutral',
      icon: Users,
    },
    {
      title: 'Appuntamenti Oggi',
      value: String(appuntamenti.filter((a: any) => a.data === oggi).length),
      change: '',
      trend: 'neutral',
      icon: Calendar,
    },
  ];

  // Build notifications from real data
  const notifiche: { id: string; tipo: 'warning' | 'info' | 'danger'; titolo: string; descrizione: string }[] = [];

  const prodottiSottoScorta = prodotti.filter((p: any) => p.giacenza != null && p.scorteMinime != null && p.giacenza <= p.scorteMinime);
  if (prodottiSottoScorta.length > 0) {
    notifiche.push({ id: 'not-scorte', tipo: 'danger', titolo: 'Scorte in esaurimento', descrizione: `${prodottiSottoScorta.length} prodotti sotto la soglia minima di scorta` });
  }

  const ticketCritici = tickets.filter((t: any) => t.priorita === 'critica' && t.stato !== 'chiuso' && t.stato !== 'risolto');
  if (ticketCritici.length > 0) {
    notifiche.push({ id: 'not-ticket', tipo: 'info', titolo: 'Ticket critici aperti', descrizione: `${ticketCritici.length} ticket con priorità critica in lavorazione` });
  }

  const fattureNonPagate = fatture.filter((f: any) => f.stato === 'non_pagata');
  if (fattureNonPagate.length > 0) {
    notifiche.push({ id: 'not-fatture', tipo: 'warning', titolo: 'Fatture non pagate', descrizione: `${fattureNonPagate.length} fatture in attesa di pagamento` });
  }

  const leadInNegoziazione = leads.filter((l: any) => l.stato === 'negoziazione');
  if (leadInNegoziazione.length > 0) {
    notifiche.push({ id: 'not-lead', tipo: 'info', titolo: 'Lead in negoziazione', descrizione: `${leadInNegoziazione.length} lead in fase di negoziazione` });
  }

  const attivitaRecenti = buildAttivitaRecenti(ordini, tickets, leads, fatture);
  const ordiniRecenti = ordini.slice(-5).reverse();
  const fattureInScadenza = fatture.filter((f: any) => f.stato === 'non_pagata').slice(0, 5);
  const appuntamentiOggi = appuntamenti.filter((a: any) => a.data === oggi);

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
                  {ordiniPerCanale.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Quota']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {ordiniPerCanale.map((item: any, i: number) => (
                <div key={item.canale} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.canale}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed + Fatture in Scadenza Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Attività Recenti */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {attivitaRecenti.length > 0 ? attivitaRecenti.map((att) => {
                const IconComp = activityIconMap[att.icona] || CircleDot;
                return (
                  <div key={att.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a2332]/5`}>
                        <IconComp className={`h-4 w-4 ${att.colore}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{att.testo}</p>
                      {att.data && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(att.data)}</p>}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground py-4">Nessuna attività recente. Inizia aggiungendo clienti, ordini o lead.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fatture in Scadenza */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Fatture in Scadenza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fattureInScadenza.length > 0 ? (
              fattureInScadenza.map((fattura: any) => (
                <div key={fattura.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{fattura.clienteNome}</p>
                    <p className="text-xs text-muted-foreground">
                      {fattura.numero} — Scad. {formatDate(fattura.dataScadenza)}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold">{formatCurrency(fattura.totale)}</p>
                    <Badge variant="destructive" className="text-xs">
                      Non pagata
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nessuna fattura in scadenza</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifiche Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {notifiche.length > 0 ? notifiche.map((notifica) => {
              const styles = notificaStyles[notifica.tipo];
              return (
                <div
                  key={notifica.id}
                  className={`rounded-lg border-l-4 p-3 ${styles.bg} ${styles.border}`}
                >
                  <p className={`text-sm font-medium ${styles.text}`}>{notifica.titolo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notifica.descrizione}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground">Nessuna notifica</p>
            )}
          </CardContent>
        </Card>

        {/* Placeholder right column to maintain grid alignment — can be used for future cards */}
        <div className="lg:col-span-3" />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ordini Recenti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ordini Recenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordiniRecenti.length > 0 ? ordiniRecenti.map((ordine: any) => (
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
            )) : (
              <p className="text-sm text-muted-foreground">Nessun ordine</p>
            )}
          </CardContent>
        </Card>

        {/* Top Clienti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Clienti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClienti.length > 0 ? topClienti.map((cliente: any, i: number) => (
              <div key={cliente.nome} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2332] text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium">{cliente.nome}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(cliente.fatturato)}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Nessun cliente</p>
            )}
          </CardContent>
        </Card>

        {/* Appuntamenti Oggi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Appuntamenti Oggi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appuntamentiOggi.length > 0 ? (
              appuntamentiOggi.map((app: any) => (
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
