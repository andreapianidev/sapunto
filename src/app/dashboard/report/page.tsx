'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { fetchVenditeMensili, fetchTopClienti, fetchOrdiniPerCanale, fetchOrdini, fetchFatture, fetchClienti, fetchProdotti, fetchSpese, fetchLeads } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';

const COLORS = ['#1a2332', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

export default function ReportPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([
      fetchVenditeMensili(tenantId),
      fetchTopClienti(tenantId),
      fetchOrdiniPerCanale(tenantId),
      fetchOrdini(tenantId),
      fetchFatture(tenantId),
      fetchClienti(tenantId),
      fetchProdotti(tenantId),
      fetchSpese(tenantId),
      fetchLeads(tenantId),
    ]),
    [[], [], [], [], [], [], [], [], []]
  );
  const venditeMensili = allData[0];
  const topClienti = allData[1];
  const ordiniPerCanale = allData[2];
  const ordini = allData[3];
  const fatture = allData[4];
  const clienti = allData[5];
  const prodotti = allData[6];
  const spese = allData[7];
  const leads = allData[8];

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  const fatturatoTotale = ordini.filter((o: any) => o.stato === 'completato').reduce((s: number, o: any) => s + o.totale, 0);
  const margineStimato = fatturatoTotale * 0.35;
  const speseTotali = spese.reduce((s: number, sp: any) => s + sp.importo, 0);
  const valPipeline = leads.filter((l: any) => l.fase !== 'vinto' && l.fase !== 'perso').reduce((s: number, l: any) => s + l.valore * (l.probabilita / 100), 0);

  const categorieVendita = prodotti.reduce((acc: Record<string, number>, p: any) => {
    if (!acc[p.categoria]) acc[p.categoria] = 0;
    acc[p.categoria] += p.prezzo * (p.giacenza > 50 ? 10 : 3);
    return acc;
  }, {} as Record<string, number>);
  const categoriePie = Object.entries(categorieVendita).slice(0, 7).map(([name, value]) => ({ name, value: Math.round(value as number) }));

  const statoFatture = [
    { nome: 'Pagate', valore: fatture.filter((f: any) => f.stato === 'pagata').length },
    { nome: 'Non Pagate', valore: fatture.filter((f: any) => f.stato === 'non_pagata').length },
    { nome: 'Scadute', valore: fatture.filter((f: any) => f.stato === 'scaduta').length },
  ];

  const clientiPerTipo = [
    { tipo: 'Azienda', valore: clienti.filter((c: any) => c.tipo === 'azienda').length },
    { tipo: 'Privato', valore: clienti.filter((c: any) => c.tipo === 'privato').length },
  ];

  return (
    <PageContainer title="Report" description="Analisi e statistiche avanzate">
      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><DollarSign className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(fatturatoTotale)}</p><p className="text-xs text-muted-foreground">Fatturato Totale</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><TrendingUp className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(margineStimato)}</p><p className="text-xs text-muted-foreground">Margine Stimato (35%)</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700"><BarChart3 className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(speseTotali)}</p><p className="text-xs text-muted-foreground">Spese Totali</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><PieChartIcon className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(valPipeline)}</p><p className="text-xs text-muted-foreground">Pipeline Pesata</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="vendite">
        <TabsList>
          <TabsTrigger value="vendite">Vendite</TabsTrigger>
          <TabsTrigger value="clienti">Clienti</TabsTrigger>
          <TabsTrigger value="prodotti">Prodotti</TabsTrigger>
          <TabsTrigger value="finanziario">Finanziario</TabsTrigger>
        </TabsList>

        <TabsContent value="vendite" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Andamento Fatturato</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={venditeMensili}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Fatturato']} />
                    <Area type="monotone" dataKey="fatturato" fill="#1a2332" fillOpacity={0.1} stroke="#1a2332" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Ordini per Canale</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={ordiniPerCanale} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="valore" nameKey="canale">
                      {ordiniPerCanale.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i]} />))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Quota']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {ordiniPerCanale.map((item: any, i: number) => (
                    <div key={item.canale} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-muted-foreground">{item.canale} ({item.valore}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Top 5 Clienti per Fatturato</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topClienti} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="nome" width={160} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Fatturato']} />
                  <Bar dataKey="fatturato" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clienti" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Clienti per Tipo</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={clientiPerTipo} cx="50%" cy="50%" outerRadius={90} dataKey="valore" nameKey="tipo" label>
                      <Cell fill="#1a2332" /><Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Nuovi Clienti per Mese</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { mese: 'Ott', nuovi: 3 }, { mese: 'Nov', nuovi: 2 }, { mese: 'Dic', nuovi: 1 },
                    { mese: 'Gen', nuovi: 2 }, { mese: 'Feb', nuovi: 3 }, { mese: 'Mar', nuovi: 1 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="nuovi" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prodotti" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Vendite per Categoria Prodotto</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoriePie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valore']} />
                  <Bar dataKey="value" fill="#1a2332" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finanziario" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Stato Fatture</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statoFatture} cx="50%" cy="50%" outerRadius={90} dataKey="valore" nameKey="nome" label>
                      <Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {statoFatture.map((s, i) => (
                    <div key={s.nome} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#ef4444'][i] }} />
                      <span>{s.nome} ({s.valore})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Spese per Categoria</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(spese.reduce((acc: Record<string, number>, s: any) => { acc[s.categoria] = (acc[s.categoria] || 0) + s.importo; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">{cat}</Badge>
                      </div>
                      <span className="font-semibold text-sm">{formatCurrency(val)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
