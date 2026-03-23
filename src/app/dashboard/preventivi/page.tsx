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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchPreventivi, fetchClienti, createPreventivo, updatePreventivo, deletePreventivo } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, exportCSV } from '@/lib/utils';
import { Search, Plus, ClipboardList, CheckCircle, Clock, XCircle, Save, Send, MoreHorizontal, Pencil, Trash2, Copy, Download } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

const statoBadge: Record<string, string> = { bozza: 'bg-gray-100 text-gray-800', inviato: 'bg-blue-100 text-blue-800', accettato: 'bg-green-100 text-green-800', rifiutato: 'bg-red-100 text-red-800', scaduto: 'bg-yellow-100 text-yellow-800' };

export default function PreventiviPage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchPreventivi(tenantId), fetchClienti(tenantId)]),
    [[], []]
  );
  const preventivi = allData[0];
  const clienti = allData[1];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state for new preventivo
  const [formClienteId, setFormClienteId] = useState('c-1');
  const [formOggetto, setFormOggetto] = useState('');
  const [formData, setFormData] = useState('2026-03-22');
  const [formScadenza, setFormScadenza] = useState('2026-04-22');
  const [formNote, setFormNote] = useState('');

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof preventivi[number] | null>(null);
  const [editOggetto, setEditOggetto] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editStato, setEditStato] = useState('');

  const filtered = useMemo(() => preventivi.filter((p) => {
    const matchSearch = p.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || p.oggetto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStato = filterStato === 'tutti' || p.stato === filterStato;
    return matchSearch && matchStato;
  }), [searchTerm, filterStato]);

  const valoreInviati = preventivi.filter((p) => p.stato === 'inviato').reduce((s, p) => s + p.totale, 0);

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
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const preventiviColumns = [
    { key: 'numero', label: 'Numero' },
    { key: 'clienteNome', label: 'Cliente' },
    { key: 'data', label: 'Data' },
    { key: 'dataScadenza', label: 'Valido Fino' },
    { key: 'totale', label: 'Totale' },
    { key: 'stato', label: 'Stato' },
  ];

  const resetCreateForm = () => {
    setFormClienteId('c-1');
    setFormOggetto('');
    setFormData('2026-03-22');
    setFormScadenza('2026-04-22');
    setFormNote('');
  };

  const handleCreate = async (stato: 'bozza' | 'inviato') => {
    setSubmitting(true);
    const cliente = clienti.find((c) => c.id === formClienteId);
    const res = await createPreventivo({
      tenantId,
      clienteId: formClienteId,
      clienteNome: cliente?.ragioneSociale || '',
      data: formData,
      dataScadenza: formScadenza,
      stato,
      oggetto: formOggetto,
      righe: [],
      subtotale: '0',
      iva: '0',
      totale: '0',
      note: formNote || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setCreateDialogOpen(false);
      resetCreateForm();
      refresh();
    } else {
      alert(res.error || 'Errore nella creazione del preventivo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo preventivo?')) return;
    setSubmitting(true);
    const res = await deletePreventivo(id);
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore nella cancellazione');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} preventivi?`)) return;
    setSubmitting(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await deletePreventivo(id);
    }
    setSubmitting(false);
    setSelectedIds(new Set());
    refresh();
  };

  const openEdit = (p: typeof preventivi[number]) => {
    setEditItem(p);
    setEditOggetto(p.oggetto);
    setEditNote((p as Record<string, unknown>).note as string || '');
    setEditStato(p.stato);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSubmitting(true);
    const res = await updatePreventivo(editItem.id, {
      oggetto: editOggetto,
      stato: editStato,
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

  const handleDuplicate = async (p: typeof preventivi[number]) => {
    setSubmitting(true);
    const res = await createPreventivo({
      tenantId,
      clienteId: p.clienteId,
      clienteNome: p.clienteNome,
      data: new Date().toISOString().split('T')[0],
      dataScadenza: p.dataScadenza,
      stato: 'bozza',
      oggetto: p.oggetto + ' (copia)',
      righe: [],
      subtotale: String(p.subtotale ?? 0),
      iva: String(p.iva ?? 0),
      totale: String(p.totale ?? 0),
      note: (p as Record<string, unknown>).note as string | undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore nella duplicazione');
    }
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Preventivi" description="Gestione offerte e preventivi" actions={
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered, preventiviColumns, 'preventivi')}>
          <Download className="mr-2 h-4 w-4" />Esporta
        </Button>
        <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetCreateForm(); }}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90"><Plus className="mr-2 h-4 w-4" />Nuovo Preventivo</DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Nuovo Preventivo</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreate('bozza'); }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Cliente *</Label><Select value={formClienteId} onValueChange={(v) => v && setFormClienteId(v)}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent>{clienti.slice(0, 10).map((c) => (<SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>))}</SelectContent></Select></div>
                <div className="sm:col-span-2"><Label>Oggetto *</Label><Input placeholder="Es. Fornitura sistema domotica" className="mt-1" required value={formOggetto} onChange={(e) => setFormOggetto(e.target.value)} /></div>
                <div><Label>Data</Label><Input type="date" value={formData} onChange={(e) => setFormData(e.target.value)} className="mt-1" /></div>
                <div><Label>Validità fino al</Label><Input type="date" value={formScadenza} onChange={(e) => setFormScadenza(e.target.value)} className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Note</Label><Input placeholder="Note aggiuntive..." className="mt-1" value={formNote} onChange={(e) => setFormNote(e.target.value)} /></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="submit" variant="outline" disabled={submitting}>{submitting ? 'Salvataggio...' : 'Salva Bozza'}</Button><Button type="button" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting} onClick={() => handleCreate('inviato')}><Send className="mr-2 h-4 w-4" />{submitting ? 'Invio...' : 'Invia al Cliente'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    }>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><ClipboardList className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{preventivi.length}</p><p className="text-xs text-muted-foreground">Totale</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{preventivi.filter((p) => p.stato === 'accettato').length}</p><p className="text-xs text-muted-foreground">Accettati</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{preventivi.filter((p) => p.stato === 'inviato').length}</p><p className="text-xs text-muted-foreground">In Attesa</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><ClipboardList className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(valoreInviati)}</p><p className="text-xs text-muted-foreground">Valore In Attesa</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca preventivo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div><Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti</SelectItem><SelectItem value="bozza">Bozza</SelectItem><SelectItem value="inviato">Inviato</SelectItem><SelectItem value="accettato">Accettato</SelectItem><SelectItem value="rifiutato">Rifiutato</SelectItem><SelectItem value="scaduto">Scaduto</SelectItem></SelectContent></Select></div></CardContent></Card>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selezionati</span>
            <Button variant="destructive" size="sm" disabled={submitting} onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />{submitting ? 'Eliminazione...' : 'Elimina selezionati'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.filter((p) => selectedIds.has(p.id)), preventiviColumns, 'preventivi-selezionati')}>
              <Download className="mr-2 h-4 w-4" />Esporta selezionati
            </Button>
          </CardContent>
        </Card>
      )}

      <Card><CardContent className="p-0"><Table><TableHeader><TableRow>
        <TableHead className="w-10">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={filtered.length > 0 && selectedIds.size === filtered.length}
            onChange={toggleSelectAll}
          />
        </TableHead>
        <TableHead>Numero</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Oggetto</TableHead><TableHead>Data</TableHead><TableHead className="hidden lg:table-cell">Scadenza</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Totale</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>{filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p) => (
        <TableRow key={p.id} className="hover:bg-muted/50">
          <TableCell>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={selectedIds.has(p.id)}
              onChange={() => toggleSelect(p.id)}
            />
          </TableCell>
          <TableCell className="font-medium text-sm">{p.numero}</TableCell><TableCell className="text-sm">{p.clienteNome}</TableCell><TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{p.oggetto}</TableCell><TableCell className="text-sm">{formatDate(p.data)}</TableCell><TableCell className="hidden lg:table-cell text-sm">{formatDate(p.dataScadenza)}</TableCell><TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[p.stato]}`}>{p.stato}</Badge></TableCell><TableCell className="text-right font-semibold text-sm">{formatCurrency(p.totale)}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(p)}>
                  <Pencil className="mr-2 h-4 w-4" />Modifica
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                  <Copy className="mr-2 h-4 w-4" />Duplica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}</TableBody></Table><Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} /></CardContent></Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditItem(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Modifica Preventivo</DialogTitle></DialogHeader>
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
                  <Label>Stato</Label>
                  <Select value={editStato} onValueChange={(v) => v && setEditStato(v)}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bozza">Bozza</SelectItem>
                      <SelectItem value="inviato">Inviato</SelectItem>
                      <SelectItem value="accettato">Accettato</SelectItem>
                      <SelectItem value="rifiutato">Rifiutato</SelectItem>
                      <SelectItem value="scaduto">Scaduto</SelectItem>
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
