'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Pagination } from '@/components/ui/pagination';
import { tickets } from '@/lib/mockdata';
import { formatDate, formatDateTime } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, Eye, LifeBuoy, AlertCircle, CheckCircle, Clock, MessageSquare, MoreHorizontal, Pencil, Trash2, Copy, Download, X } from 'lucide-react';
import type { Ticket } from '@/lib/types';

const statoBadge: Record<string, string> = {
  aperto: 'bg-blue-100 text-blue-800',
  in_lavorazione: 'bg-yellow-100 text-yellow-800',
  in_attesa: 'bg-orange-100 text-orange-800',
  risolto: 'bg-green-100 text-green-800',
  chiuso: 'bg-gray-100 text-gray-800',
};

const prioritaBadge: Record<string, string> = {
  bassa: 'bg-gray-100 text-gray-800',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

export default function TicketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [filterPriorita, setFilterPriorita] = useState<string>('tutte');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = t.oggetto.toLowerCase().includes(searchTerm.toLowerCase()) || t.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || t.stato === filterStato;
      const matchPriorita = filterPriorita === 'tutte' || t.priorita === filterPriorita;
      return matchSearch && matchStato && matchPriorita;
    });
  }, [searchTerm, filterStato, filterPriorita]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;
  const paginatedResults = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safeCurrentPage, pageSize]);

  // Selection helpers
  const allPageIds = useMemo(() => paginatedResults.map((t) => t.id), [paginatedResults]);
  const allPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
  const somePageSelected = allPageIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        allPageIds.forEach((id) => next.delete(id));
      } else {
        allPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [allPageIds, allPageSelected]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const stats = {
    aperti: tickets.filter((t) => t.stato === 'aperto' || t.stato === 'in_lavorazione').length,
    inAttesa: tickets.filter((t) => t.stato === 'in_attesa').length,
    risolti: tickets.filter((t) => t.stato === 'risolto' || t.stato === 'chiuso').length,
    critici: tickets.filter((t) => t.priorita === 'critica' && t.stato !== 'chiuso' && t.stato !== 'risolto').length,
  };

  return (
    <PageContainer
      title="Ticket Supporto"
      description="Gestione richieste di assistenza"
      actions={
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Ticket
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuovo Ticket</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: ticket aperto!'); }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Oggetto *</Label>
                  <Input placeholder="Descrivi brevemente il problema" className="mt-1" required />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select defaultValue="Assistenza Tecnica">
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assistenza Tecnica">Assistenza Tecnica</SelectItem>
                      <SelectItem value="Amministrazione">Amministrazione</SelectItem>
                      <SelectItem value="Garanzia/Resi">Garanzia/Resi</SelectItem>
                      <SelectItem value="Informazioni">Informazioni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priorità</Label>
                  <Select defaultValue="media">
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bassa">Bassa</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Critica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Descrizione *</Label>
                  <textarea className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={4} placeholder="Descrivi il problema in dettaglio..." required />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90">Apri Ticket</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      }
    >
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Aperti', value: stats.aperti, icon: AlertCircle, color: 'bg-blue-50 text-blue-700' },
          { label: 'In Attesa', value: stats.inAttesa, icon: Clock, color: 'bg-orange-50 text-orange-700' },
          { label: 'Risolti', value: stats.risolti, icon: CheckCircle, color: 'bg-green-50 text-green-700' },
          { label: 'Critici', value: stats.critici, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cerca ticket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStato} onValueChange={(v) => { if (v) { setFilterStato(v); setCurrentPage(1); } }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti</SelectItem>
                <SelectItem value="aperto">Aperto</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="in_attesa">In Attesa</SelectItem>
                <SelectItem value="risolto">Risolto</SelectItem>
                <SelectItem value="chiuso">Chiuso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriorita} onValueChange={(v) => { if (v) { setFilterPriorita(v); setCurrentPage(1); } }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Priorità" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutte">Tutte</SelectItem>
                <SelectItem value="bassa">Bassa</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Critica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedIds.size} selezionat{selectedIds.size === 1 ? 'o' : 'i'}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearSelection}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="default" className="bg-[#1a2332] hover:bg-[#1a2332]/90" onClick={() => alert('Demo: ticket chiusi!')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Chiudi selezionati
                </Button>
                <Button size="sm" variant="destructive" onClick={() => alert('Demo: ticket eliminati!')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina selezionati
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert('Demo: ticket esportati!')}>
                  <Download className="mr-2 h-4 w-4" />
                  Esporta selezionati
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={allPageSelected}
                      ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead className="hidden md:table-cell">Cliente</TableHead>
                  <TableHead>Priorità</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Risp.</TableHead>
                  <TableHead className="w-[50px]">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResults.map((t) => (
                  <TableRow key={t.id} className={`cursor-pointer hover:bg-muted/50 ${selectedTicket?.id === t.id ? 'bg-muted' : ''}`} onClick={() => setSelectedTicket(t)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{t.numero}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.oggetto}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{t.clienteNome || '—'}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-xs ${prioritaBadge[t.priorita]}`}>{t.priorita}</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[t.stato]}`}>{t.stato.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-center hidden md:table-cell text-sm">{t.risposte.length}</TableCell>
                    <TableCell><DropdownMenu><DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert('Demo: azione eseguita!'); }}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem><DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert('Demo: azione eseguita!'); }}><CheckCircle className="mr-2 h-4 w-4" />Chiudi Ticket</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert('Demo: azione eseguita!'); }} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={safeCurrentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{selectedTicket.numero}</CardTitle>
                  <Badge variant="secondary" className={`text-xs ${prioritaBadge[selectedTicket.priorita]}`}>{selectedTicket.priorita}</Badge>
                </div>
                <p className="font-semibold text-base mt-1">{selectedTicket.oggetto}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className={`text-xs ${statoBadge[selectedTicket.stato]}`}>{selectedTicket.stato.replace('_', ' ')}</Badge>
                  <Badge variant="outline" className="text-xs">{selectedTicket.categoria}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Cliente:</strong> {selectedTicket.clienteNome || '—'}</p>
                  <p><strong>Assegnato:</strong> {selectedTicket.assegnatoNome || 'Non assegnato'}</p>
                  <p><strong>Aperto il:</strong> {formatDate(selectedTicket.dataApertura)}</p>
                </div>
                <p className="text-sm">{selectedTicket.descrizione}</p>
                {selectedTicket.risposte.length > 0 && (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-3">
                      {selectedTicket.risposte.map((r) => (
                        <div key={r.id} className={`p-3 rounded-lg text-sm ${r.tipo === 'operatore' ? 'bg-blue-50 ml-4' : 'bg-muted mr-4'}`}>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span className="font-medium">{r.autore}</span>
                            <span>{formatDateTime(r.data)}</span>
                          </div>
                          <p>{r.messaggio}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                <div className="pt-2 border-t">
                  <Input placeholder="Scrivi una risposta..." className="mb-2" />
                  <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Rispondi
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
              <div className="text-center">
                <LifeBuoy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Seleziona un ticket</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
