'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { contratti, clienti } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, FileSignature, AlertTriangle, CheckCircle, Clock, Save, MoreHorizontal, Pencil, Trash2, Copy, Download, RefreshCw } from 'lucide-react';

const statoBadge: Record<string, string> = {
  bozza: 'bg-gray-100 text-gray-800',
  attivo: 'bg-green-100 text-green-800',
  scaduto: 'bg-red-100 text-red-800',
  rinnovato: 'bg-blue-100 text-blue-800',
  rescisso: 'bg-orange-100 text-orange-800',
};

export default function ContrattiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');

  const filtered = useMemo(() => {
    return contratti.filter((c) => {
      const matchSearch = c.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || c.oggetto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || c.stato === filterStato;
      return matchSearch && matchStato;
    });
  }, [searchTerm, filterStato]);

  const valoreAttivi = contratti.filter((c) => c.stato === 'attivo').reduce((s, c) => s + c.valoreAnnuale, 0);
  const inScadenza = contratti.filter((c) => c.stato === 'attivo' && c.dataFine <= '2026-04-30').length;

  return (
    <PageContainer
      title="Contratti"
      description="Gestione contratti clienti"
      actions={
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Contratto
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Nuovo Contratto</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: contratto creato!'); }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Cliente *</Label>
                  <Select defaultValue="c-1">
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{clienti.slice(0, 10).map((c) => (<SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>Oggetto *</Label><Input placeholder="Descrizione contratto" className="mt-1" required /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select defaultValue="servizio">
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servizio">Servizio</SelectItem>
                      <SelectItem value="fornitura">Fornitura</SelectItem>
                      <SelectItem value="manutenzione">Manutenzione</SelectItem>
                      <SelectItem value="consulenza">Consulenza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valore Annuale</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" /></div>
                <div><Label>Data Inizio</Label><Input type="date" className="mt-1" /></div>
                <div><Label>Data Fine</Label><Input type="date" className="mt-1" /></div>
              </div>
              <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90"><Save className="mr-2 h-4 w-4" />Salva</Button></div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      }
    >
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileSignature className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{contratti.length}</p><p className="text-xs text-muted-foreground">Totale Contratti</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{contratti.filter((c) => c.stato === 'attivo').length}</p><p className="text-xs text-muted-foreground">Attivi</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><FileSignature className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(valoreAttivi)}</p><p className="text-xs text-muted-foreground">Valore Annuo Attivi</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700"><AlertTriangle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{inScadenza}</p><p className="text-xs text-muted-foreground">In Scadenza</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca contratto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div><Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Stato" /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti</SelectItem><SelectItem value="bozza">Bozza</SelectItem><SelectItem value="attivo">Attivo</SelectItem><SelectItem value="scaduto">Scaduto</SelectItem><SelectItem value="rescisso">Rescisso</SelectItem></SelectContent></Select></div></CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Numero</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Tipo</TableHead><TableHead>Stato</TableHead><TableHead className="hidden lg:table-cell">Periodo</TableHead><TableHead className="hidden md:table-cell">Rinnovo</TableHead><TableHead className="text-right">Valore/Anno</TableHead><TableHead className="w-[50px]">Azioni</TableHead>
          </TableRow></TableHeader>
          <TableBody>{filtered.map((c) => (
            <TableRow key={c.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-sm">{c.numero}</TableCell>
              <TableCell><p className="text-sm font-medium">{c.clienteNome}</p><p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.oggetto}</p></TableCell>
              <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs capitalize">{c.tipo}</Badge></TableCell>
              <TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[c.stato]}`}>{c.stato}</Badge></TableCell>
              <TableCell className="hidden lg:table-cell text-xs">{formatDate(c.dataInizio)} → {formatDate(c.dataFine)}</TableCell>
              <TableCell className="hidden md:table-cell text-sm capitalize">{c.rinnovo}</TableCell>
              <TableCell className="text-right font-semibold text-sm">{formatCurrency(c.valoreAnnuale)}</TableCell>
              <TableCell><DropdownMenu><DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem><DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><RefreshCw className="mr-2 h-4 w-4" />Rinnova</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </PageContainer>
  );
}
