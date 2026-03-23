'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { fetchTenants, fetchTransazioniPiattaforma, fetchAbbonamenti } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Search, Activity, Building2, CreditCard, UserPlus, RefreshCw, LogIn, Settings } from 'lucide-react';

type EventType = 'pagamento' | 'abbonamento' | 'tenant' | 'sistema' | 'login';

interface ActivityEvent {
  id: string;
  data: string;
  tipo: EventType;
  descrizione: string;
  attore: string;
  dettagli?: string;
}

const tipoBadge: Record<EventType, { label: string; color: string; icon: React.ElementType }> = {
  pagamento: { label: 'Pagamento', color: 'bg-green-100 text-green-800', icon: CreditCard },
  abbonamento: { label: 'Abbonamento', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  tenant: { label: 'Tenant', color: 'bg-purple-100 text-purple-800', icon: Building2 },
  sistema: { label: 'Sistema', color: 'bg-gray-100 text-gray-800', icon: Settings },
  login: { label: 'Accesso', color: 'bg-orange-100 text-orange-800', icon: LogIn },
};

export default function AttivitaPage() {
  const [allData, loading] = useServerData(
    () => Promise.all([fetchTenants(), fetchTransazioniPiattaforma(), fetchAbbonamenti()]),
    [[], [], []]
  );
  const tenants = allData[0];
  const transazioni = allData[1];
  const abbonamenti = allData[2];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('tutti');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Synthesize events from existing data
  const events = useMemo(() => {
    const all: ActivityEvent[] = [];

    // Transaction events
    for (const t of transazioni) {
      const tenant = tenants.find((ten: any) => ten.id === t.tenantId);
      const statoLabel = t.stato === 'completata' ? 'completato' : t.stato === 'fallita' ? 'fallito' : 'in attesa';
      all.push({
        id: `tr-${t.id}`,
        data: t.data,
        tipo: 'pagamento',
        descrizione: `Pagamento ${statoLabel}: ${t.descrizione}`,
        attore: tenant?.ragioneSociale || t.tenantId,
        dettagli: formatCurrency(t.importo),
      });
    }

    // Subscription events
    for (const a of abbonamenti) {
      const tenant = tenants.find((ten: any) => ten.id === a.tenantId);
      all.push({
        id: `ab-${a.id}`,
        data: a.dataCreazione,
        tipo: 'abbonamento',
        descrizione: `Abbonamento ${a.pianoId} ${a.stato === 'attivo' ? 'attivato' : a.stato}`,
        attore: tenant?.ragioneSociale || a.tenantId,
        dettagli: `${formatCurrency(a.importoTotale)} / ${a.cicloPagamento}`,
      });
    }

    // Tenant creation events
    for (const t of tenants) {
      all.push({
        id: `tn-${t.id}`,
        data: t.dataCreazione,
        tipo: 'tenant',
        descrizione: `Nuovo tenant registrato: ${t.ragioneSociale}`,
        attore: 'Sistema',
        dettagli: `Piano ${t.piano}`,
      });
    }

    // System events (static demo data)
    const systemEvents: ActivityEvent[] = [
      { id: 'sys-1', data: '2026-03-23', tipo: 'sistema', descrizione: 'Deploy v2.1.0 completato', attore: 'CI/CD Pipeline', dettagli: 'Production' },
      { id: 'sys-2', data: '2026-03-22', tipo: 'sistema', descrizione: 'Backup database completato', attore: 'Sistema', dettagli: '2.1 GB' },
      { id: 'sys-3', data: '2026-03-21', tipo: 'sistema', descrizione: 'Certificato SSL rinnovato', attore: 'Sistema', dettagli: 'Valido fino 2027' },
      { id: 'sys-4', data: '2026-03-20', tipo: 'login', descrizione: 'Accesso Super Admin', attore: 'Marco Verdi', dettagli: 'IP 93.44.xxx.xxx' },
      { id: 'sys-5', data: '2026-03-19', tipo: 'login', descrizione: 'Accesso Super Admin', attore: 'Marco Verdi', dettagli: 'IP 93.44.xxx.xxx' },
      { id: 'sys-6', data: '2026-03-18', tipo: 'sistema', descrizione: 'Aggiornamento dipendenze completato', attore: 'CI/CD Pipeline', dettagli: '12 pacchetti' },
    ];
    all.push(...systemEvents);

    // Sort by date descending
    all.sort((a, b) => b.data.localeCompare(a.data));
    return all;
  }, [transazioni, abbonamenti, tenants]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = e.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.attore.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filterTipo === 'tutti' || e.tipo === filterTipo;
      return matchSearch && matchTipo;
    });
  }, [events, searchTerm, filterTipo]);

  // Stats
  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.tipo] = (counts[e.tipo] || 0) + 1;
    }
    return counts;
  }, [events]);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Log Attività" description="Registro eventi e operazioni della piattaforma">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {(Object.entries(tipoBadge) as [EventType, typeof tipoBadge[EventType]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card key={key}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{countByType[key] || 0}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cerca evento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterTipo} onValueChange={(v) => v && setFilterTipo(v)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i Tipi</SelectItem>
                <SelectItem value="pagamento">Pagamenti</SelectItem>
                <SelectItem value="abbonamento">Abbonamenti</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
                <SelectItem value="login">Accessi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Attore</TableHead>
                <TableHead className="text-right">Dettagli</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e) => {
                const cfg = tipoBadge[e.tipo];
                const Icon = cfg.icon;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(e.data)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${cfg.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{e.descrizione}</TableCell>
                    <TableCell className="text-sm font-medium">{e.attore}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{e.dettagli || '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
