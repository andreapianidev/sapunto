'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { noteDiCredito } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, FileX, Save, MoreHorizontal, Pencil, Trash2, Copy, Download, Search, Eye } from 'lucide-react';
import type { NotaDiCredito } from '@/lib/types';

const statoBadge: Record<string, string> = {
  emessa: 'bg-blue-100 text-blue-800',
  inviata_sdi: 'bg-yellow-100 text-yellow-800',
  accettata: 'bg-green-100 text-green-800',
};

const statoLabel: Record<string, string> = {
  emessa: 'Emessa',
  inviata_sdi: 'Inviata SDI',
  accettata: 'Accettata',
};

export default function NoteCreditoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedNota, setSelectedNota] = useState<NotaDiCredito | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Filtering ---
  const filtered = useMemo(() => {
    return noteDiCredito.filter((n) => {
      const matchSearch =
        n.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || n.stato === filterStato;
      return matchSearch && matchStato;
    });
  }, [searchTerm, filterStato]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStato]);

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // --- Bulk selection ---
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((n) => n.id)));
    }
  };

  // --- CSV Export ---
  const exportCSV = (rows: typeof noteDiCredito) => {
    const header = 'Numero,Fattura Rif.,Cliente,Data,Motivo,Importo,IVA,Totale,Stato';
    const csv = [
      header,
      ...rows.map((n) =>
        `${n.numero},${n.fatturaNumero},${n.clienteNome},${n.data},"${n.motivo}",${n.importo},${n.iva},${n.totale},${n.stato}`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'note-credito.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // --- Stats ---
  const totale = noteDiCredito.reduce((s, n) => s + n.totale, 0);

  return (
    <PageContainer
      title="Note di Credito"
      description="Gestione note di credito emesse"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)}>
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Nota di Credito
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Nuova Nota di Credito</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: nota di credito emessa!'); }}>
              <div className="grid gap-3">
                <div><Label>Fattura di Riferimento *</Label><Input placeholder="Es. FE-2026-0025" className="mt-1" required /></div>
                <div><Label>Motivo *</Label><Input placeholder="Motivo della nota di credito" className="mt-1" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Importo (netto)</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" /></div>
                  <div><Label>IVA</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" /></div>
                </div>
              </div>
              <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90"><Save className="mr-2 h-4 w-4" />Emetti</Button></div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileX className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{noteDiCredito.length}</p><p className="text-xs text-muted-foreground">Totale NDC</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700"><FileX className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(totale)}</p><p className="text-xs text-muted-foreground">Valore Totale</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><FileX className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{noteDiCredito.filter((n) => n.stato === 'accettata').length}</p><p className="text-xs text-muted-foreground">Accettate SDI</p></div></CardContent></Card>
      </div>

      {/* Search / Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per numero o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli stati</SelectItem>
                <SelectItem value="emessa">Emessa</SelectItem>
                <SelectItem value="inviata_sdi">Inviata SDI</SelectItem>
                <SelectItem value="accettata">Accettata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selezionati</span>
            <Button variant="destructive" size="sm" onClick={() => alert('Demo: azione eseguita!')}>
              <Trash2 className="mr-2 h-4 w-4" />Elimina selezionati
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.filter((n) => selectedIds.has(n.id)))}>
              <Download className="mr-2 h-4 w-4" />Esporta selezionati
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Numero</TableHead>
                <TableHead>Fattura Rif.</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden lg:table-cell">Motivo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((n) => (
                <TableRow key={n.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedIds.has(n.id)}
                      onChange={() => toggleSelect(n.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-sm">{n.numero}</TableCell>
                  <TableCell className="text-sm font-mono">{n.fatturaNumero}</TableCell>
                  <TableCell className="text-sm">{n.clienteNome}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{formatDate(n.data)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{n.motivo}</TableCell>
                  <TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[n.stato]}`}>{statoLabel[n.stato] ?? n.stato.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-right font-semibold text-sm">{formatCurrency(n.totale)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Detail view button */}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        onClick={() => { setSelectedNota(n); setDetailOpen(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Row actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}>
                            <Pencil className="mr-2 h-4 w-4" />Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}>
                            <Copy className="mr-2 h-4 w-4" />Duplica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Detail view dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nota di Credito {selectedNota?.numero}</DialogTitle>
          </DialogHeader>
          {selectedNota && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Numero</p>
                  <p className="font-medium">{selectedNota.numero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fattura di Riferimento</p>
                  <p className="font-medium font-mono">{selectedNota.fatturaNumero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedNota.clienteNome}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedNota.data)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Motivo</p>
                  <p className="font-medium">{selectedNota.motivo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stato</p>
                  <Badge variant="secondary" className={`text-xs ${statoBadge[selectedNota.stato]}`}>
                    {statoLabel[selectedNota.stato] ?? selectedNota.stato.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importo Netto</span>
                  <span>{formatCurrency(selectedNota.importo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA</span>
                  <span>{formatCurrency(selectedNota.iva)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Totale</span>
                  <span>{formatCurrency(selectedNota.totale)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
