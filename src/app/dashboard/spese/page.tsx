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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { fetchSpese, createSpesa, updateSpesa, deleteSpesa } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, exportCSV } from '@/lib/utils';
import { Search, Plus, Receipt, CheckCircle, Clock, XCircle, Save, MoreHorizontal, Pencil, Trash2, Copy, Download, Eye } from 'lucide-react';

const statoBadge: Record<string, string> = {
  da_approvare: 'bg-yellow-100 text-yellow-800',
  approvata: 'bg-green-100 text-green-800',
  rifiutata: 'bg-red-100 text-red-800',
  rimborsata: 'bg-blue-100 text-blue-800',
};

const categoriaBadge: Record<string, string> = {
  trasporti: 'bg-blue-100 text-blue-800',
  pasti: 'bg-orange-100 text-orange-800',
  alloggio: 'bg-purple-100 text-purple-800',
  materiali: 'bg-green-100 text-green-800',
  servizi: 'bg-cyan-100 text-cyan-800',
  utenze: 'bg-yellow-100 text-yellow-800',
  altro: 'bg-gray-100 text-gray-800',
};

export default function SpesePage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [spese, loading, refresh] = useServerData(() => fetchSpese(tenantId), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('tutte');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<typeof spese[number] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create form state
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formDescrizione, setFormDescrizione] = useState('');
  const [formCategoria, setFormCategoria] = useState<string>('trasporti');
  const [formImporto, setFormImporto] = useState('');
  const [formData, setFormData] = useState(new Date().toISOString().split('T')[0]);

  // Edit form state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof spese[number] | null>(null);
  const [editDescrizione, setEditDescrizione] = useState('');
  const [editCategoria, setEditCategoria] = useState<string>('trasporti');
  const [editImporto, setEditImporto] = useState('');
  const [editData, setEditData] = useState('');

  const resetCreateForm = () => {
    setFormDescrizione('');
    setFormCategoria('trasporti');
    setFormImporto('');
    setFormData(new Date().toISOString().split('T')[0]);
  };

  const openEdit = (s: typeof spese[number]) => {
    setEditItem(s);
    setEditDescrizione(s.descrizione);
    setEditCategoria(s.categoria);
    setEditImporto(String(s.importo));
    setEditData(s.data);
    setEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createSpesa({
      tenantId,
      descrizione: formDescrizione,
      categoria: formCategoria as 'trasporti' | 'pasti' | 'alloggio' | 'materiali' | 'servizi' | 'utenze' | 'altro',
      importo: formImporto,
      data: formData,
      stato: 'da_approvare',
    });
    setSubmitting(false);
    if (res.ok) {
      resetCreateForm();
      setCreateOpen(false);
      refresh();
    } else {
      alert(res.error || 'Errore durante la creazione');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSubmitting(true);
    const res = await updateSpesa(editItem.id, {
      descrizione: editDescrizione,
      categoria: editCategoria,
      importo: editImporto,
      data: editData,
    });
    setSubmitting(false);
    if (res.ok) {
      setEditOpen(false);
      setEditItem(null);
      refresh();
    } else {
      alert(res.error || 'Errore durante la modifica');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa spesa?')) return;
    setSubmitting(true);
    const res = await deleteSpesa(id);
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore durante l\'eliminazione');
    }
  };

  const handleApprove = async (id: string) => {
    setSubmitting(true);
    const res = await updateSpesa(id, { stato: 'approvata' });
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore durante l\'approvazione');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} spese selezionate?`)) return;
    setSubmitting(true);
    for (const id of selectedIds) {
      await deleteSpesa(id);
    }
    setSubmitting(false);
    setSelectedIds(new Set());
    refresh();
  };

  const filtered = useMemo(() => {
    return spese.filter((s) => {
      const matchSearch = s.descrizione.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategoria === 'tutte' || s.categoria === filterCategoria;
      const matchStato = filterStato === 'tutti' || s.stato === filterStato;
      return matchSearch && matchCat && matchStato;
    });
  }, [searchTerm, filterCategoria, filterStato, spese]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const totaleMese = spese.reduce((s, sp) => s + sp.importo, 0);
  const daApprovare = spese.filter((s) => s.stato === 'da_approvare');

  // Bulk select helpers
  const allPageIds = paginatedItems.map((s) => s.id);
  const allSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
  const someSelected = allPageIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allPageIds.forEach((id) => next.delete(id));
      } else {
        allPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Spese"
      description="Gestione note spese aziendali"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered, [
            { key: 'data', label: 'Data' },
            { key: 'descrizione', label: 'Descrizione' },
            { key: 'categoria', label: 'Categoria' },
            { key: 'importo', label: 'Importo' },
            { key: 'stato', label: 'Stato' },
            { key: 'dipendenteNome', label: 'Fornitore' },
          ], 'spese')}>
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Spesa
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Nuova Nota Spese</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-3">
                <div><Label>Descrizione *</Label><Input placeholder="Descrizione spesa" className="mt-1" required value={formDescrizione} onChange={(e) => setFormDescrizione(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={formCategoria} onValueChange={(v) => setFormCategoria(v ?? 'trasporti')}>
                      <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trasporti">Trasporti</SelectItem>
                        <SelectItem value="pasti">Pasti</SelectItem>
                        <SelectItem value="materiali">Materiali</SelectItem>
                        <SelectItem value="servizi">Servizi</SelectItem>
                        <SelectItem value="utenze">Utenze</SelectItem>
                        <SelectItem value="altro">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Importo *</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" required value={formImporto} onChange={(e) => setFormImporto(e.target.value)} /></div>
                </div>
                <div><Label>Data</Label><Input type="date" value={formData} onChange={(e) => setFormData(e.target.value)} className="mt-1" /></div>
              </div>
              <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Registra'}</Button></div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Receipt className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(totaleMese)}</p><p className="text-xs text-muted-foreground">Totale Spese</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{spese.filter((s) => s.stato === 'approvata').length}</p><p className="text-xs text-muted-foreground">Approvate</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{daApprovare.length}</p><p className="text-xs text-muted-foreground">Da Approvare</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><Receipt className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{spese.length}</p><p className="text-xs text-muted-foreground">Totale Registrazioni</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca spesa..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-9" /></div>
          <Select value={filterCategoria} onValueChange={(v) => { if (v) { setFilterCategoria(v); setCurrentPage(1); } }}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutte">Tutte</SelectItem><SelectItem value="trasporti">Trasporti</SelectItem><SelectItem value="pasti">Pasti</SelectItem><SelectItem value="materiali">Materiali</SelectItem><SelectItem value="servizi">Servizi</SelectItem><SelectItem value="utenze">Utenze</SelectItem><SelectItem value="altro">Altro</SelectItem></SelectContent></Select>
          <Select value={filterStato} onValueChange={(v) => { if (v) { setFilterStato(v); setCurrentPage(1); } }}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti</SelectItem><SelectItem value="da_approvare">Da Approvare</SelectItem><SelectItem value="approvata">Approvata</SelectItem><SelectItem value="rimborsata">Rimborsata</SelectItem></SelectContent></Select>
        </div>
      </CardContent></Card>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <p className="text-sm font-medium">{selectedIds.size} element{selectedIds.size > 1 ? 'i' : 'o'} selezionat{selectedIds.size > 1 ? 'i' : 'o'}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCSV(
                spese.filter((s) => selectedIds.has(s.id)),
                [
                  { key: 'data', label: 'Data' },
                  { key: 'descrizione', label: 'Descrizione' },
                  { key: 'categoria', label: 'Categoria' },
                  { key: 'importo', label: 'Importo' },
                  { key: 'stato', label: 'Stato' },
                  { key: 'dipendenteNome', label: 'Fornitore' },
                ],
                'spese-selezionate'
              )}>
                <Download className="mr-2 h-4 w-4" />Esporta selezionati
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={submitting}>
                <Trash2 className="mr-2 h-4 w-4" />{submitting ? 'Eliminazione...' : 'Elimina selezionati'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-[40px]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Data</TableHead><TableHead>Descrizione</TableHead><TableHead className="hidden md:table-cell">Categoria</TableHead><TableHead className="hidden lg:table-cell">Dipendente</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Importo</TableHead><TableHead className="w-[80px]">Azioni</TableHead>
          </TableRow></TableHeader>
          <TableBody>{paginatedItems.map((s) => (
            <TableRow key={s.id} className="hover:bg-muted/50">
              <TableCell>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedIds.has(s.id)}
                  onChange={() => toggleSelect(s.id)}
                />
              </TableCell>
              <TableCell className="text-sm">{formatDate(s.data)}</TableCell>
              <TableCell><p className="text-sm font-medium">{s.descrizione}</p>{s.clienteNome && <p className="text-xs text-muted-foreground">{s.clienteNome}</p>}{s.progettoNome && <p className="text-xs text-muted-foreground">{s.progettoNome}</p>}</TableCell>
              <TableCell className="hidden md:table-cell"><Badge variant="secondary" className={`text-xs ${categoriaBadge[s.categoria]}`}>{s.categoria}</Badge></TableCell>
              <TableCell className="hidden lg:table-cell text-sm">{s.dipendenteNome || '—'}</TableCell>
              <TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[s.stato]}`}>{s.stato.replace('_', ' ')}</Badge></TableCell>
              <TableCell className="text-right font-semibold text-sm">{formatCurrency(s.importo)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                    onClick={() => setDetailItem(s)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(s)}>
                        <Pencil className="mr-2 h-4 w-4" />Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        createSpesa({
                          tenantId,
                          descrizione: s.descrizione,
                          categoria: s.categoria as 'trasporti' | 'pasti' | 'alloggio' | 'materiali' | 'servizi' | 'utenze' | 'altro',
                          importo: String(s.importo),
                          data: s.data,
                          dipendenteId: s.dipendenteId ?? undefined,
                          dipendenteNome: s.dipendenteNome ?? undefined,
                          clienteId: s.clienteId ?? undefined,
                          clienteNome: s.clienteNome ?? undefined,
                          progettoId: s.progettoId ?? undefined,
                          progettoNome: s.progettoNome ?? undefined,
                          stato: 'da_approvare',
                          note: s.note ?? undefined,
                        }).then((res) => {
                          if (res.ok) refresh();
                          else alert(res.error || 'Errore durante la duplicazione');
                        });
                      }}>
                        <Copy className="mr-2 h-4 w-4" />Duplica
                      </DropdownMenuItem>
                      {s.stato === 'da_approvare' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleApprove(s.id)} className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />Approva
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
        <Pagination
          currentPage={safePage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardContent></Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => { if (!open) setDetailItem(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Dettaglio Spesa</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Descrizione</p>
                  <p className="text-sm font-medium">{detailItem.descrizione}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <Badge variant="secondary" className={`text-xs mt-1 ${categoriaBadge[detailItem.categoria]}`}>{detailItem.categoria}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Importo</p>
                  <p className="text-sm font-bold">{formatCurrency(detailItem.importo)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm font-medium">{formatDate(detailItem.data)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stato</p>
                  <Badge variant="secondary" className={`text-xs mt-1 ${statoBadge[detailItem.stato]}`}>{detailItem.stato.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dipendente</p>
                  <p className="text-sm font-medium">{detailItem.dipendenteNome || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">{detailItem.clienteNome || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Progetto</p>
                  <p className="text-sm font-medium">{detailItem.progettoNome || '—'}</p>
                </div>
              </div>
              {detailItem.note && (
                <div>
                  <p className="text-xs text-muted-foreground">Note</p>
                  <p className="text-sm">{detailItem.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditItem(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Modifica Spesa</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleEdit}>
            <div className="grid gap-3">
              <div><Label>Descrizione *</Label><Input placeholder="Descrizione spesa" className="mt-1" required value={editDescrizione} onChange={(e) => setEditDescrizione(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select value={editCategoria} onValueChange={(v) => setEditCategoria(v ?? 'trasporti')}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trasporti">Trasporti</SelectItem>
                      <SelectItem value="pasti">Pasti</SelectItem>
                      <SelectItem value="materiali">Materiali</SelectItem>
                      <SelectItem value="servizi">Servizi</SelectItem>
                      <SelectItem value="utenze">Utenze</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Importo *</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" required value={editImporto} onChange={(e) => setEditImporto(e.target.value)} /></div>
              </div>
              <div><Label>Data</Label><Input type="date" value={editData} onChange={(e) => setEditData(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Salva Modifiche'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
