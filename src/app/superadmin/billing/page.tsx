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
import { fetchTenants, fetchPiani, fetchTransazioniPiattaforma, fetchAbbonamenti } from '@/lib/actions/data';
import { confermaBonifico } from '@/lib/actions/payments';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, CheckCircle, AlertTriangle, Clock, Search, Download, Building2, Banknote } from 'lucide-react';

const statoBadge: Record<string, string> = {
  completata: 'bg-green-100 text-green-800',
  fallita: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  in_attesa_conferma: 'bg-orange-100 text-orange-800',
  rimborsata: 'bg-gray-100 text-gray-800',
};

const statoLabel: Record<string, string> = {
  completata: 'Completato',
  fallita: 'Fallito',
  pending: 'In Attesa',
  in_attesa_conferma: 'Da Confermare',
  rimborsata: 'Rimborsato',
};

const metodoIcon: Record<string, typeof CreditCard> = {
  nexi: CreditCard,
  paypal: CreditCard,
  bonifico: Building2,
};

const metodoLabel: Record<string, string> = {
  nexi: 'NexiPay',
  paypal: 'PayPal',
  bonifico: 'Bonifico',
};

export default function BillingPage() {
  const { user } = useAuth();
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchTenants(), fetchPiani(), fetchTransazioniPiattaforma(), fetchAbbonamenti()]),
    [[], [], [], []]
  );
  const tenants = allData[0];
  const piani = allData[1];
  const transazioni = allData[2];
  const abbonamenti = allData[3];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calcola MRR reale da abbonamenti attivi
  const mrrTotale = useMemo(() => {
    return abbonamenti
      .filter(a => a.stato === 'attivo')
      .reduce((sum, a) => {
        if (a.cicloPagamento === 'mensile') {
          return sum + a.importoTotale;
        } else {
          // Per abbonamenti annuali, calcola il MRR
          return sum + (a.importoTotale / 12);
        }
      }, 0);
  }, [abbonamenti]);

  // Fallback: se non ci sono abbonamenti, calcola dai piani
  const mrrCalcolato = mrrTotale > 0 ? mrrTotale : piani.reduce((sum, p) => {
    const count = tenants.filter((t) => t.piano === p.id).length;
    return sum + p.prezzoMensile * count;
  }, 0);

  // Arricchisci transazioni con nome tenant
  const transazioniArricchite = useMemo(() => {
    return transazioni.map(t => {
      const tenant = tenants.find(ten => ten.id === t.tenantId);
      return {
        ...t,
        tenantNome: tenant?.ragioneSociale || t.tenantId,
      };
    });
  }, [transazioni, tenants]);

  const filtered = useMemo(() => {
    return transazioniArricchite.filter((t) => {
      const matchSearch = t.tenantNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.descrizione.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || t.stato === filterStato;
      return matchSearch && matchStato;
    });
  }, [transazioniArricchite, searchTerm, filterStato]);

  const totaleFalliti = transazioni.filter(t => t.stato === 'fallita').length;
  const totaleInAttesa = transazioni.filter(t => t.stato === 'pending' || t.stato === 'in_attesa_conferma').length;
  const abbonamentiAttivi = abbonamenti.filter(a => a.stato === 'attivo').length;

  const handleConfermaBonifico = async (abbId: string) => {
    const result = await confermaBonifico(abbId);
    if (result.success) {
      window.location.reload();
    }
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Billing Globale" description="Panoramica pagamenti, abbonamenti e rinnovi" actions={
      <Button variant="outline" size="sm" onClick={() => alert('Esporta report in CSV — prossimamente')}>
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
              <p className="text-xl font-bold">{formatCurrency(mrrCalcolato)}</p>
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
              <p className="text-xl font-bold">{formatCurrency(mrrCalcolato * 12)}</p>
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
              <p className="text-xl font-bold">{totaleInAttesa}</p>
              <p className="text-xs text-muted-foreground">Pagamenti in Attesa</p>
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

      {/* Revenue per piano + Abbonamenti attivi */}
      <div className="grid gap-4 md:grid-cols-3">
        {piani.map((p) => {
          const countTenants = tenants.filter((t) => t.piano === p.id).length;
          const countAbb = abbonamenti.filter(a => a.pianoId === p.id && a.stato === 'attivo').length;
          const displayCount = countAbb > 0 ? countAbb : countTenants;
          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className={`text-xs ${
                    p.id === 'experience' ? 'bg-purple-100 text-purple-800' :
                    p.id === 'explore' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{p.nome}</Badge>
                  <span className="text-xs text-muted-foreground">{displayCount} abbonament{displayCount === 1 ? 'o' : 'i'}</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(p.prezzoMensile * displayCount)}</p>
                <p className="text-xs text-muted-foreground">Revenue mensile</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bonifici in attesa di conferma */}
      {abbonamenti.filter(a => a.stato === 'in_attesa_pagamento' && a.metodoPagamento === 'bonifico').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Banknote className="h-4 w-4 text-amber-600" />
              Bonifici in Attesa di Conferma
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Piano</TableHead>
                  <TableHead>Riferimento</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead className="text-right">Azione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abbonamenti
                  .filter(a => a.stato === 'in_attesa_pagamento' && a.metodoPagamento === 'bonifico')
                  .map(a => {
                    const tenant = tenants.find(t => t.id === a.tenantId);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium">{tenant?.ragioneSociale || a.tenantId}</TableCell>
                        <TableCell className="text-sm">{a.pianoId}</TableCell>
                        <TableCell className="text-sm font-mono">{a.riferimentoBonifico}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">{formatCurrency(a.importoTotale)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConfermaBonifico(a.id)}
                          >
                            Conferma
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Search/Filter */}
      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca pagamento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
        <Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti gli Stati</SelectItem><SelectItem value="completata">Completato</SelectItem><SelectItem value="fallita">Fallito</SelectItem><SelectItem value="pending">In Attesa</SelectItem><SelectItem value="in_attesa_conferma">Da Confermare</SelectItem></SelectContent></Select>
      </div></CardContent></Card>

      {/* Payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Storico Transazioni</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {transazioni.length === 0
                ? 'Nessuna transazione registrata. Le transazioni appariranno qui quando i clienti effettueranno pagamenti.'
                : 'Nessuna transazione trovata con i filtri selezionati.'
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((t) => {
                  const MetodoIcon = metodoIcon[t.metodoPagamento] || CreditCard;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{formatDate(t.data)}</TableCell>
                      <TableCell className="text-sm font-medium">{t.tenantNome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.descrizione}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5">
                          <MetodoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {metodoLabel[t.metodoPagamento] || t.metodoPagamento}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${statoBadge[t.stato] || 'bg-gray-100 text-gray-800'}`}>
                          {statoLabel[t.stato] || t.stato}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {formatCurrency(t.importo)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {filtered.length > 0 && (
            <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
