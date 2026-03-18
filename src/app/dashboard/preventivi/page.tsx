'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { preventivi, clienti } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, ClipboardList, CheckCircle, Clock, XCircle, Save, Send } from 'lucide-react';

const statoBadge: Record<string, string> = { bozza: 'bg-gray-100 text-gray-800', inviato: 'bg-blue-100 text-blue-800', accettato: 'bg-green-100 text-green-800', rifiutato: 'bg-red-100 text-red-800', scaduto: 'bg-yellow-100 text-yellow-800' };

export default function PreventiviPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');

  const filtered = useMemo(() => preventivi.filter((p) => {
    const matchSearch = p.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || p.oggetto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStato = filterStato === 'tutti' || p.stato === filterStato;
    return matchSearch && matchStato;
  }), [searchTerm, filterStato]);

  const valoreInviati = preventivi.filter((p) => p.stato === 'inviato').reduce((s, p) => s + p.totale, 0);

  return (
    <PageContainer title="Preventivi" description="Gestione offerte e preventivi" actions={
      <Dialog>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90"><Plus className="mr-2 h-4 w-4" />Nuovo Preventivo</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nuovo Preventivo</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: preventivo creato!'); }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Cliente *</Label><Select defaultValue="c-1"><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent>{clienti.slice(0, 10).map((c) => (<SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>))}</SelectContent></Select></div>
              <div className="sm:col-span-2"><Label>Oggetto *</Label><Input placeholder="Es. Fornitura sistema domotica" className="mt-1" required /></div>
              <div><Label>Data</Label><Input type="date" defaultValue="2026-03-18" className="mt-1" /></div>
              <div><Label>Validità fino al</Label><Input type="date" defaultValue="2026-04-18" className="mt-1" /></div>
              <div className="sm:col-span-2"><Label>Note</Label><Input placeholder="Note aggiuntive..." className="mt-1" /></div>
            </div>
            <div className="flex justify-end gap-2"><Button type="submit" variant="outline">Salva Bozza</Button><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90"><Send className="mr-2 h-4 w-4" />Invia al Cliente</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    }>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><ClipboardList className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{preventivi.length}</p><p className="text-xs text-muted-foreground">Totale</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{preventivi.filter((p) => p.stato === 'accettato').length}</p><p className="text-xs text-muted-foreground">Accettati</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{preventivi.filter((p) => p.stato === 'inviato').length}</p><p className="text-xs text-muted-foreground">In Attesa</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><ClipboardList className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(valoreInviati)}</p><p className="text-xs text-muted-foreground">Valore In Attesa</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca preventivo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div><Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti</SelectItem><SelectItem value="bozza">Bozza</SelectItem><SelectItem value="inviato">Inviato</SelectItem><SelectItem value="accettato">Accettato</SelectItem><SelectItem value="rifiutato">Rifiutato</SelectItem><SelectItem value="scaduto">Scaduto</SelectItem></SelectContent></Select></div></CardContent></Card>

      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Numero</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Oggetto</TableHead><TableHead>Data</TableHead><TableHead className="hidden lg:table-cell">Scadenza</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Totale</TableHead></TableRow></TableHeader><TableBody>{filtered.map((p) => (
        <TableRow key={p.id} className="hover:bg-muted/50"><TableCell className="font-medium text-sm">{p.numero}</TableCell><TableCell className="text-sm">{p.clienteNome}</TableCell><TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{p.oggetto}</TableCell><TableCell className="text-sm">{formatDate(p.data)}</TableCell><TableCell className="hidden lg:table-cell text-sm">{formatDate(p.dataScadenza)}</TableCell><TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[p.stato]}`}>{p.stato}</Badge></TableCell><TableCell className="text-right font-semibold text-sm">{formatCurrency(p.totale)}</TableCell></TableRow>
      ))}</TableBody></Table></CardContent></Card>
    </PageContainer>
  );
}
