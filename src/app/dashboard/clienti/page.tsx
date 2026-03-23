'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
import { fetchClienti, fetchOrdini, fetchFatture, createCliente, updateCliente, deleteCliente } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatPIVA, exportCSV, parseCSV } from '@/lib/utils';
import { Search, Plus, Download, Upload, Eye, Building2, User as UserIcon, Save, MoreHorizontal, Pencil, Trash2, Copy, FileUp } from 'lucide-react';
import type { Cliente } from '@/lib/types';

const emptyForm = {
  ragioneSociale: '',
  tipo: 'azienda' as 'azienda' | 'privato',
  partitaIva: '',
  codiceFiscale: '',
  email: '',
  telefono: '',
  indirizzo: '',
  citta: '',
  cap: '',
  provincia: '',
  pec: '',
  codiceDestinatario: '',
};

export default function ClientiPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchClienti(tenantId), fetchOrdini(tenantId), fetchFatture(tenantId)]),
    [[], [], []]
  );
  const clienti = allData[0];
  const ordini = allData[1];
  const fatture = allData[2];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('tutti');
  const [filterTag, setFilterTag] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ ...emptyForm });

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredClienti.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClienti.map((c) => c.id)));
    }
  };

  // TODO: Replace with Supabase query
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    clienti.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [clienti]);

  const filteredClienti = useMemo(() => {
    return clienti.filter((c) => {
      const matchSearch =
        c.ragioneSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citta.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filterTipo === 'tutti' || c.tipo === filterTipo;
      const matchTag = filterTag === 'tutti' || c.tags.includes(filterTag);
      return matchSearch && matchTipo && matchTag;
    });
  }, [searchTerm, filterTipo, filterTag, clienti]);

  // --- Handlers ---

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createCliente({
        tenantId,
        ragioneSociale: createForm.ragioneSociale,
        tipo: createForm.tipo,
        partitaIva: createForm.partitaIva,
        codiceFiscale: createForm.codiceFiscale,
        email: createForm.email,
        telefono: createForm.telefono,
        indirizzo: createForm.indirizzo,
        citta: createForm.citta,
        cap: createForm.cap,
        provincia: createForm.provincia,
        pec: createForm.pec || undefined,
        codiceDestinatario: createForm.codiceDestinatario || undefined,
      });
      if (res.ok) {
        setShowCreateDialog(false);
        setCreateForm({ ...emptyForm });
        refresh();
      } else {
        window.alert(res.error || 'Errore nella creazione del cliente');
      }
    } catch (err) {
      window.alert('Errore nella creazione del cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCliente) return;
    setSubmitting(true);
    try {
      const res = await updateCliente(editingCliente.id, {
        ragioneSociale: editForm.ragioneSociale,
        tipo: editForm.tipo,
        partitaIva: editForm.partitaIva,
        codiceFiscale: editForm.codiceFiscale,
        email: editForm.email,
        telefono: editForm.telefono,
        indirizzo: editForm.indirizzo,
        citta: editForm.citta,
        cap: editForm.cap,
        provincia: editForm.provincia,
        pec: editForm.pec || undefined,
        codiceDestinatario: editForm.codiceDestinatario || undefined,
      });
      if (res.ok) {
        setShowEditDialog(false);
        setEditingCliente(null);
        refresh();
      } else {
        window.alert(res.error || 'Errore nella modifica del cliente');
      }
    } catch (err) {
      window.alert('Errore nella modifica del cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    setSubmitting(true);
    try {
      const res = await deleteCliente(id);
      if (res.ok) {
        refresh();
      } else {
        window.alert(res.error || 'Errore nella eliminazione del cliente');
      }
    } catch (err) {
      window.alert('Errore nella eliminazione del cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Sei sicuro di voler eliminare ${selectedIds.size} clienti?`)) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        const res = await deleteCliente(id);
        if (!res.ok) {
          window.alert(res.error || `Errore eliminando il cliente ${id}`);
        }
      }
      setSelectedIds(new Set());
      refresh();
    } catch (err) {
      window.alert('Errore nella eliminazione dei clienti');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (cliente: Cliente) => {
    setSubmitting(true);
    try {
      const res = await createCliente({
        tenantId,
        ragioneSociale: `${cliente.ragioneSociale} (copia)`,
        tipo: cliente.tipo,
        partitaIva: cliente.partitaIva,
        codiceFiscale: cliente.codiceFiscale,
        email: cliente.email,
        telefono: cliente.telefono,
        indirizzo: cliente.indirizzo,
        citta: cliente.citta,
        cap: cliente.cap,
        provincia: cliente.provincia,
        pec: cliente.pec || undefined,
        codiceDestinatario: cliente.codiceDestinatario || undefined,
        referente: cliente.referente || undefined,
        note: cliente.note || undefined,
        tags: cliente.tags,
      });
      if (res.ok) {
        refresh();
      } else {
        window.alert(res.error || 'Errore nella duplicazione del cliente');
      }
    } catch (err) {
      window.alert('Errore nella duplicazione del cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setEditForm({
      ragioneSociale: cliente.ragioneSociale,
      tipo: cliente.tipo,
      partitaIva: cliente.partitaIva,
      codiceFiscale: cliente.codiceFiscale,
      email: cliente.email,
      telefono: cliente.telefono,
      indirizzo: cliente.indirizzo,
      citta: cliente.citta,
      cap: cliente.cap,
      provincia: cliente.provincia,
      pec: cliente.pec || '',
      codiceDestinatario: cliente.codiceDestinatario || '',
    });
    setShowEditDialog(true);
  };

  // Reusable form JSX builder
  const renderForm = (
    form: typeof emptyForm,
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>,
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string
  ) => (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Ragione Sociale *</Label>
          <Input
            placeholder="Es. Azienda S.r.l."
            className="mt-1"
            required
            value={form.ragioneSociale}
            onChange={(e) => setForm((f) => ({ ...f, ragioneSociale: e.target.value }))}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as 'azienda' | 'privato' }))}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="azienda">Azienda</SelectItem>
              <SelectItem value="privato">Privato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Partita IVA</Label>
          <Input
            placeholder="01234567890"
            className="mt-1"
            value={form.partitaIva}
            onChange={(e) => setForm((f) => ({ ...f, partitaIva: e.target.value }))}
          />
        </div>
        <div>
          <Label>Codice Fiscale</Label>
          <Input
            placeholder="Codice fiscale"
            className="mt-1"
            value={form.codiceFiscale}
            onChange={(e) => setForm((f) => ({ ...f, codiceFiscale: e.target.value }))}
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            placeholder="email@azienda.it"
            className="mt-1"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <Label>Telefono</Label>
          <Input
            placeholder="+39 02 1234567"
            className="mt-1"
            value={form.telefono}
            onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Indirizzo</Label>
          <Input
            placeholder="Via Roma 1"
            className="mt-1"
            value={form.indirizzo}
            onChange={(e) => setForm((f) => ({ ...f, indirizzo: e.target.value }))}
          />
        </div>
        <div>
          <Label>Città</Label>
          <Input
            placeholder="Milano"
            className="mt-1"
            value={form.citta}
            onChange={(e) => setForm((f) => ({ ...f, citta: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>CAP</Label>
            <Input
              placeholder="20121"
              className="mt-1"
              value={form.cap}
              onChange={(e) => setForm((f) => ({ ...f, cap: e.target.value }))}
            />
          </div>
          <div>
            <Label>Provincia</Label>
            <Input
              placeholder="MI"
              maxLength={2}
              className="mt-1"
              value={form.provincia}
              onChange={(e) => setForm((f) => ({ ...f, provincia: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label>PEC</Label>
          <Input
            placeholder="azienda@pec.it"
            className="mt-1"
            value={form.pec}
            onChange={(e) => setForm((f) => ({ ...f, pec: e.target.value }))}
          />
        </div>
        <div>
          <Label>Codice Destinatario</Label>
          <Input
            placeholder="USAL8PV"
            maxLength={7}
            className="mt-1"
            value={form.codiceDestinatario}
            onChange={(e) => setForm((f) => ({ ...f, codiceDestinatario: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
          <Save className="mr-2 h-4 w-4" />
          {submitting ? 'Salvataggio...' : submitLabel}
        </Button>
      </div>
    </form>
  );

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Clienti"
      description={`${clienti.length} clienti totali`}
      actions={
        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
              <Upload className="mr-2 h-4 w-4" />
              Importa CSV
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Importa Clienti da CSV</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium">Trascina il file CSV qui</p>
                  <p className="text-xs text-muted-foreground mt-1">oppure clicca per selezionare</p>
                  <Input type="file" accept=".csv" className="mt-3" />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Formato richiesto:</p>
                  <p>Ragione Sociale, Tipo, P.IVA, CF, Email, Telefono, Indirizzo, Citta, CAP, Provincia</p>
                  <p className="mt-2">
                    <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {
                      const headers = ['Ragione Sociale', 'Tipo', 'P.IVA', 'Codice Fiscale', 'Email', 'Telefono', 'Indirizzo', 'Citta', 'CAP', 'Provincia'].join(',');
                      const blob = new Blob([headers + '\n'], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'template_clienti.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                      Scarica template CSV
                    </Button>
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowImportDialog(false)}>Annulla</Button>
                  <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting} onClick={async () => {
                    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"][accept=".csv"]');
                    const file = fileInput?.files?.[0];
                    if (!file) {
                      window.alert('Seleziona un file CSV');
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const text = await file.text();
                      const rows = parseCSV(text);
                      let imported = 0;
                      for (const row of rows) {
                        const res = await createCliente({
                          tenantId,
                          ragioneSociale: row['Ragione Sociale'] || '',
                          tipo: (row['Tipo']?.toLowerCase() === 'privato' ? 'privato' : 'azienda') as 'azienda' | 'privato',
                          partitaIva: row['P.IVA'] || '',
                          codiceFiscale: row['Codice Fiscale'] || '',
                          email: row['Email'] || '',
                          telefono: row['Telefono'] || '',
                          indirizzo: row['Indirizzo'] || '',
                          citta: row['Citta'] || '',
                          cap: row['CAP'] || '',
                          provincia: row['Provincia'] || '',
                        });
                        if (res.ok) imported++;
                      }
                      window.alert(`Importazione completata: ${imported} clienti importati su ${rows.length}`);
                      refresh();
                      setShowImportDialog(false);
                    } catch (err) {
                      window.alert('Errore durante l\'importazione del CSV');
                    } finally {
                      setSubmitting(false);
                    }
                  }}>
                    <Upload className="mr-2 h-4 w-4" />
                    {submitting ? 'Importazione...' : 'Importa'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => exportCSV(
            clienti as unknown as Record<string, unknown>[],
            [
              { key: 'ragioneSociale', label: 'Ragione Sociale' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'partitaIva', label: 'P.IVA' },
              { key: 'codiceFiscale', label: 'Codice Fiscale' },
              { key: 'email', label: 'Email' },
              { key: 'telefono', label: 'Telefono' },
              { key: 'citta', label: 'Città' },
              { key: 'provincia', label: 'Provincia' },
            ],
            'clienti'
          )}>
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setCreateForm({ ...emptyForm }); }}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Cliente
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuovo Cliente</DialogTitle>
              </DialogHeader>
              {renderForm(createForm, setCreateForm, handleCreate, 'Salva Cliente')}
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTipo} onValueChange={(v) => v && setFilterTipo(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i tipi</SelectItem>
                <SelectItem value="azienda">Azienda</SelectItem>
                <SelectItem value="privato">Privato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={(v) => v && setFilterTag(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i tag</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{selectedIds.size} selezionati</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={submitting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina selezionati
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const selected = clienti.filter((c) => selectedIds.has(c.id));
                exportCSV(
                  selected as unknown as Record<string, unknown>[],
                  [
                    { key: 'ragioneSociale', label: 'Ragione Sociale' },
                    { key: 'tipo', label: 'Tipo' },
                    { key: 'partitaIva', label: 'P.IVA' },
                    { key: 'codiceFiscale', label: 'Codice Fiscale' },
                    { key: 'email', label: 'Email' },
                    { key: 'telefono', label: 'Telefono' },
                    { key: 'citta', label: 'Città' },
                    { key: 'provincia', label: 'Provincia' },
                  ],
                  'clienti_selezionati'
                );
              }}>
                <Download className="mr-2 h-4 w-4" />
                Esporta selezionati
              </Button>
            </div>
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
                    checked={filteredClienti.length > 0 && selectedIds.size === filteredClienti.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Ragione Sociale</TableHead>
                <TableHead className="hidden md:table-cell">P.IVA / C.F.</TableHead>
                <TableHead className="hidden lg:table-cell">Città</TableHead>
                <TableHead className="hidden lg:table-cell">Contatto</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClienti.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedIds.has(cliente.id)}
                      onChange={() => toggleSelect(cliente.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        cliente.tipo === 'azienda' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {cliente.tipo === 'azienda' ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cliente.ragioneSociale}</p>
                        <p className="text-xs text-muted-foreground">{cliente.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {cliente.partitaIva ? formatPIVA(cliente.partitaIva) : cliente.codiceFiscale}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {cliente.citta} ({cliente.provincia})
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {cliente.referente || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cliente.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {cliente.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{cliente.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/clienti/${cliente.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(cliente)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(cliente)} disabled={submitting}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(cliente.id)} className="text-red-600" disabled={submitting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClienti.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Nessun cliente trovato con i filtri selezionati
            </div>
          )}
          <Pagination currentPage={currentPage} totalItems={filteredClienti.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingCliente(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica Cliente</DialogTitle>
          </DialogHeader>
          {renderForm(editForm, setEditForm, handleEdit, 'Aggiorna Cliente')}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
