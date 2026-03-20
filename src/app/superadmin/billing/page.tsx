'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { fetchTenants, fetchPiani } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, CheckCircle, AlertTriangle, Clock, Search, Download } from 'lucide-react';

const pagamenti = [
  { id: 'pay-1', tenantId: 't-1', tenant: 'Rossi Elettronica S.r.l.', importo: 99, data: '2026-03-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-2', tenantId: 't-2', tenant: 'Studio Bianchi & Associati', importo: 29, data: '2026-03-01', stato: 'completato', metodo: 'Bonifico' },
  { id: 'pay-3', tenantId: 't-3', tenant: 'GreenFood Italia S.p.A.', importo: 59, data: '2026-03-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-4', tenantId: 't-1', tenant: 'Rossi Elettronica S.r.l.', importo: 99, data: '2026-02-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-5', tenantId: 't-2', tenant: 'Studio Bianchi & Associati', importo: 29, data: '2026-02-01', stato: 'completato', metodo: 'Bonifico' },
  { id: 'pay-6', tenantId: 't-3', tenant: 'GreenFood Italia S.p.A.', importo: 59, data: '2026-02-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-7', tenantId: 't-1', tenant: 'Rossi Elettronica S.r.l.', importo: 99, data: '2026-01-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-8', tenantId: 't-2', tenant: 'Studio Bianchi & Associati', importo: 29, data: '2026-01-01', stato: 'completato', metodo: 'Bonifico' },
  { id: 'pay-9', tenantId: 't-3', tenant: 'GreenFood Italia S.p.A.', importo: 59, data: '2026-01-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-10', tenantId: 't-1', tenant: 'Rossi Elettronica S.r.l.', importo: 99, data: '2025-12-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-11', tenantId: 't-2', tenant: 'Studio Bianchi & Associati', importo: 29, data: '2025-12-01', stato: 'fallito', metodo: 'Bonifico' },
  { id: 'pay-12', tenantId: 't-3', tenant: 'GreenFood Italia S.p.A.', importo: 59, data: '2025-12-01', stato: 'completato', metodo: 'Carta di Credito' },
];

const statoBadge: Record<string, string> = {
  completato: 'bg-green-100 text-green-800',
  fallito: 'bg-red-100 text-red-800',
  in_attesa: 'bg-yellow-100 text-yellow-800',
};

export default function BillingPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading] = useServerData(
    () => Promise.all([fetchTenants(), fetchPiani()]),
    [[], []]
  );
  const tenants = allData[0];
  const piani = allData[1];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const mrrTotale = piani.reduce((sum, p) => {
    const count = tenants.filter((t) => t.piano === p.id).length;
    return sum + p.prezzoMensile * count;
  }, 0);

  const filtered = useMemo(() => {
    return pagamenti.filter((p) => {
      const matchSearch = p.tenant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || p.stato === filterStato;
      return matchSearch && matchStato;
    });
  }, [searchTerm, filterStato]);

  const totaleFalliti = pagamenti.filter((p) => p.stato === 'fallito').length;

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Billing Globale" description="Panoramica pagamenti e rinnovi" actions={
      <Button variant="outline" size="sm" onClick={() => alert('Demo: esporta report billing!')}>
        <Download className="mr-2 h-4 w-4" />Report
      </Button>
    }>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(mrrTotale)}</p>
              <p className="text-xs text-muted-foreground">MRR Totale</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(mrrTotale * 12)}</p>
              <p className="text-xs text-muted-foreground">ARR Stimato</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">Rinnovi in Scadenza</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{totaleFalliti}</p>
              <p className="text-xs text-muted-foreground">Pagamenti Falliti</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue per piano */}
      <div className="grid gap-4 md:grid-cols-3">
        {piani.map((p) => {
          const count = tenants.filter((t) => t.piano === p.id).length;
          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className={`text-xs ${
                    p.id === 'experience' ? 'bg-purple-100 text-purple-800' :
                    p.id === 'explore' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{p.nome}</Badge>
                  <span className="text-xs text-muted-foreground">{count} tenant</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(p.prezzoMensile * count)}</p>
                <p className="text-xs text-muted-foreground">Revenue mensile</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search/Filter */}
      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca pagamento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
        <Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti gli Stati</SelectItem><SelectItem value="completato">Completato</SelectItem><SelectItem value="fallito">Fallito</SelectItem></SelectContent></Select>
      </div></CardContent></Card>

      {/* Payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Storico Pagamenti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="text-sm">{formatDate(pay.data)}</TableCell>
                  <TableCell className="text-sm font-medium">{pay.tenant}</TableCell>
                  <TableCell className="text-sm">{pay.metodo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${statoBadge[pay.stato]}`}>
                      {pay.stato.charAt(0).toUpperCase() + pay.stato.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(pay.importo)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
