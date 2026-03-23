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
import { Pagination } from '@/components/ui/pagination';
import { fetchContratti, fetchClienti, createContratto, updateContratto, deleteContratto } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, exportCSV } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, FileSignature, AlertTriangle, CheckCircle, Clock, Save, MoreHorizontal, Pencil, Trash2, Copy, Download, RefreshCw, Eye } from 'lucide-react';

const statoBadge: Record<string, string> = {
  bozza: 'bg-gray-100 text-gray-800',
  attivo: 'bg-green-100 text-green-800',
  scaduto: 'bg-red-100 text-red-800',
  rinnovato: 'bg-blue-100 text-blue-800',
  rescisso: 'bg-orange-100 text-orange-800',
};

export default function ContrattiPage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchContratti(tenantId), fetchClienti(tenantId)]),
    [[], []]
  );
  const contratti = allData[0];
  const clienti = allData[1];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<typeof contratti[number] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Create form state
  const [formClienteId, setFormClienteId] = useState('c-1');
  const [formOggetto, setFormOggetto] = useState('');
  const [formTipo, setFormTipo] = useState<'servizio' | 'fornitura' | 'manutenzione' | 'consulenza'>('servizio');
  const [formValoreAnnuale, setFormValoreAnnuale] = useState('');
  const [formDataInizio, setFormDataInizio] = useState('');
  const [formDataFine, setFormDataFine] = useState('');

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof contratti[number] | null>(null);
  const [editOggetto, setEditOggetto] = useState('');
  const [editStato, setEditStato] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editRinnovo, setEditRinnovo] = useState('');
  const [editNote, setEditNote] = useState('');

  const filtered = useMemo(() => {
    return contratti.filter((c) => {
      const matchSearch = c.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || c.oggetto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || c.stato === filterStato;
      return matchSearch && matchStato;
    });
  }, [searchTerm, filterStato]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const valoreAttivi = contratti.filter((c) => c.stato === 'attivo').reduce((s, c) => s + c.valoreAnnuale, 0);
  const inScadenza = contratti.filter((c) => c.stato === 'attivo' && c.dataFine <= '2026-04-30').length;

  // Bulk select helpers
  const allPageIds = paginatedItems.map((c) => c.id);
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

  const contrattiColumns = [
    { key: 'numero', label: 'Numero' },
    { key: 'clienteNome', label: 'Cliente' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'dataInizio', label: 'Data Inizio' },
    { key: 'dataFine', label: 'Data Fine' },
    { key: 'valoreAnnuale', label: 'Valore' },
    { key: 'stato', label: 'Stato' },
  ];

  const resetCreateForm = () => {
    setFormClienteId('c-1');
    setFormOggetto('');
    setFormTipo('servizio');
    setFormValoreAnnuale('');
    setFormDataInizio('');
    setFormDataFine('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const cliente = clienti.find((c) => c.id === formClienteId);
    const res = await createContratto({
      tenantId,
      clienteId: formClienteId,
      clienteNome: cliente?.ragioneSociale || '',
      oggetto: formOggetto,
      tipo: formTipo,
      stato: 'bozza',
      dataInizio: formDataInizio,
      dataFine: formDataFine,
      valoreAnnuale: formValoreAnnuale || '0',
      rinnovo: 'manuale',
      note: undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setCreateDialogOpen(false);
      resetCreateForm();
      refresh();
    } else {
      alert(res.error || 'Errore nella creazione del contratto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo contratto?')) return;
    setSubmitting(true);
    const res = await deleteContratto(id);
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore nella cancellazione');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} contratti?`)) return;
    setSubmitting(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await deleteContratto(id);
    }
    setSubmitting(false);
    setSelectedIds(new Set());
    refresh();
  };

  const openEdit = (c: typeof contratti[number]) => {
    setEditItem(c);
    setEditOggetto(c.oggetto);
    setEditStato(c.stato);
    setEditTipo(c.tipo);
    setEditRinnovo(c.rinnovo);
    setEditNote((c as Record<string, unknown>).note as string || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSubmitting(true);
    const res = await updateContratto(editItem.id, {
      oggetto: editOggetto,
      stato: editStato,
      tipo: editTipo,
      rinnovo: editRinnovo,
      note: editNote || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setEditDialogOpen(false);
      setEditItem(null);
      refresh();
    } else {
      alert(res.error || 'Errore nella modifica');
    }
  };

  const handleRinnova = async (c: typeof contratti[number]) => {
    if (!confirm(`Rinnovare il contratto ${c.numero}?`)) return;
    setSubmitting(true);
    const res = await updateContratto(c.id, { stato: 'rinnovato' });
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore nel rinnovo');
    }
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Contratti"
      description="Gestione contratti clienti"
      actions={
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered, contrattiColumns, 'contratti')}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetCreateForm(); }}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Contratto
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Nuovo Contratto</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Cliente *</Label>
                  <Select value={formClienteId} onValueChange={(v) => v && setFormClienteId(v)}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{clienti.slice(0, 10).map((c) => (<SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>Oggetto *</Label><Input placeholder="Descrizione contratto" className="mt-1" required value={formOggetto} onChange={(e) => setFormOggetto(e.target.value)} /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={formTipo} onValueChange={(v) => v && setFormTipo(v as typeof formTipo)}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servizio">Servizio</SelectItem>
                      <SelectItem value="fornitura">Fornitura</SelectItem>
                      <SelectItem value="manutenzione">Manutenzione</SelectItem>
                      <SelectItem value="consulenza">Consulenza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valore Annuale</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" value={formValoreAnnuale} onChange={(e) => setFormValoreAnnuale(e.target.value)} /></div>
                <div><Label>Data Inizio</Label><Input type="date" className="mt-1" value={formDataInizio} onChange={(e) => setFormDataInizio(e.target.value)} /></div>
                <div><Label>Data Fine</Label><Input type="date" className="mt-1" value={formDataFine} onChange={(e) => setFormDataFine(e.target.value)} /></div>
              </div>
              <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Salva'}</Button></div>
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

      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca contratto..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-9" /></div><Select value={filterStato} onValueChange={(v) => { if (v) { setFilterStato(v); setCurrentPage(1); } }}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Stato" /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti</SelectItem><SelectItem value="bozza">Bozza</SelectItem><SelectItem value="attivo">Attivo</SelectItem><SelectItem value="scaduto">Scaduto</SelectItem><SelectItem value="rescisso">Rescisso</SelectItem></SelectContent></Select></div></CardContent></Card>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <p className="text-sm font-medium">{selectedIds.size} element{selectedIds.size > 1 ? 'i' : 'o'} selezionat{selectedIds.size > 1 ? 'i' : 'o'}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.filter((c) => selectedIds.has(c.id)), contrattiColumns, 'contratti-selezionati')}>
                <Download className="mr-2 h-4 w-4" />Esporta selezionati
              </Button>
              <Button variant="destructive" size="sm" disabled={submitting} onClick={handleBulkDelete}>
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
            <TableHead>Numero</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Tipo</TableHead><TableHead>Stato</TableHead><TableHead className="hidden lg:table-cell">Periodo</TableHead><TableHead className="hidden md:table-cell">Rinnovo</TableHead><TableHead className="text-right">Valore/Anno</TableHead><TableHead className="w-[80px]">Azioni</TableHead>
          </TableRow></TableHeader>
          <TableBody>{paginatedItems.map((c) => (
            <TableRow key={c.id} className="hover:bg-muted/50">
              <TableCell>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                />
              </TableCell>
              <TableCell className="font-medium text-sm">{c.numero}</TableCell>
              <TableCell><p className="text-sm font-medium">{c.clienteNome}</p><p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.oggetto}</p></TableCell>
              <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs capitalize">{c.tipo}</Badge></TableCell>
              <TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[c.stato]}`}>{c.stato}</Badge></TableCell>
              <TableCell className="hidden lg:table-cell text-xs">{formatDate(c.dataInizio)} → {formatDate(c.dataFine)}</TableCell>
              <TableCell className="hidden md:table-cell text-sm capitalize">{c.rinnovo}</TableCell>
              <TableCell className="text-right font-semibold text-sm">{formatCurrency(c.valoreAnnuale)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                    onClick={() => setDetailItem(c)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <DropdownMenu><DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem><DropdownMenuItem onClick={() => handleRinnova(c)}><RefreshCw className="mr-2 h-4 w-4" />Rinnova</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
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
          <DialogHeader><DialogTitle>Dettaglio Contratto</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Numero</p>
                  <p className="text-sm font-medium">{detailItem.numero}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">{detailItem.clienteNome}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Oggetto</p>
                  <p className="text-sm font-medium">{detailItem.oggetto}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <Badge variant="outline" className="text-xs capitalize mt-1">{detailItem.tipo}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stato</p>
                  <Badge variant="secondary" className={`text-xs mt-1 ${statoBadge[detailItem.stato]}`}>{detailItem.stato}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Inizio</p>
                  <p className="text-sm font-medium">{formatDate(detailItem.dataInizio)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Fine</p>
                  <p className="text-sm font-medium">{formatDate(detailItem.dataFine)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valore Annuale</p>
                  <p className="text-sm font-bold">{formatCurrency(detailItem.valoreAnnuale)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rinnovo</p>
                  <p className="text-sm font-medium capitalize">{detailItem.rinnovo}</p>
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
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditItem(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Modifica Contratto</DialogTitle></DialogHeader>
          {editItem && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Cliente</Label>
                  <Input className="mt-1" value={editItem.clienteNome} disabled />
                </div>
                <div className="sm:col-span-2">
                  <Label>Oggetto *</Label>
                  <Input className="mt-1" required value={editOggetto} onChange={(e) => setEditOggetto(e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={editTipo} onValueChange={(v) => v && setEditTipo(v)}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servizio">Servizio</SelectItem>
                      <SelectItem value="fornitura">Fornitura</SelectItem>
                      <SelectItem value="manutenzione">Manutenzione</SelectItem>
                      <SelectItem value="consulenza">Consulenza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stato</Label>
                  <Select value={editStato} onValueChange={(v) => v && setEditStato(v)}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bozza">Bozza</SelectItem>
                      <SelectItem value="attivo">Attivo</SelectItem>
                      <SelectItem value="scaduto">Scaduto</SelectItem>
                      <SelectItem value="rinnovato">Rinnovato</SelectItem>
                      <SelectItem value="rescisso">Rescisso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rinnovo</Label>
                  <Select value={editRinnovo} onValueChange={(v) => v && setEditRinnovo(v)}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatico">Automatico</SelectItem>
                      <SelectItem value="manuale">Manuale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Note</Label>
                  <Input className="mt-1" placeholder="Note aggiuntive..." value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setEditDialogOpen(false); setEditItem(null); }}>Annulla</Button>
                <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
                  <Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
