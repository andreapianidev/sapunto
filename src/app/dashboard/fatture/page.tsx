'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { fetchFatture, fetchClienti, createFattura, updateFattura, deleteFattura } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import {
  formatCurrency, formatDate, getStatoSDIColor, getStatoSDILabel,
  getStatoPagamentoColor,
} from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, Eye, FileText, Send, CheckCircle, XCircle, Clock, Save, MoreHorizontal, Pencil, Trash2, Copy, Download, Printer } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import type { Fattura } from '@/lib/types';

export default function FatturePage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchFatture(tenantId), fetchClienti(tenantId)]),
    [[], []]
  );
  const fatture = allData[0];
  const clienti = allData[1];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('tutti');
  const [filterSDI, setFilterSDI] = useState<string>('tutti');
  const [selectedFattura, setSelectedFattura] = useState<Fattura | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state for new fattura
  const [formClienteId, setFormClienteId] = useState('');
  const [formTipo, setFormTipo] = useState<'emessa' | 'ricevuta'>('emessa');
  const [formData, setFormData] = useState('');
  const [formScadenza, setFormScadenza] = useState('');
  const [formMetodo, setFormMetodo] = useState('bonifico');
  const [formDescrizione, setFormDescrizione] = useState('');
  const [formImporto, setFormImporto] = useState('');
  const [formIva, setFormIva] = useState('22');

  const resetForm = () => {
    setFormClienteId('');
    setFormTipo('emessa');
    setFormData('');
    setFormScadenza('');
    setFormMetodo('bonifico');
    setFormDescrizione('');
    setFormImporto('');
    setFormIva('22');
  };

  const handleCreate = async (asBozza: boolean) => {
    if (submitting) return;
    const importoNum = parseFloat(formImporto);
    if (!formClienteId || isNaN(importoNum) || importoNum <= 0) return;
    const cliente = clienti.find((c) => c.id === formClienteId);
    if (!cliente) return;

    const ivaRate = parseInt(formIva) / 100;
    const subtotale = importoNum;
    const ivaAmount = subtotale * ivaRate;
    const totale = subtotale + ivaAmount;

    setSubmitting(true);
    try {
      const result = await createFattura({
        tenantId,
        tipo: formTipo,
        clienteId: formClienteId,
        clienteNome: cliente.ragioneSociale,
        data: formData || new Date().toISOString().split('T')[0],
        dataScadenza: formScadenza || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        stato: 'non_pagata',
        statoSDI: asBozza ? 'bozza' : 'inviata',
        righe: [{
          prodottoId: '',
          nome: formDescrizione || 'Vendita prodotti',
          quantita: 1,
          prezzoUnitario: subtotale,
          iva: parseInt(formIva),
          totale: totale,
        }],
        subtotale: String(subtotale),
        iva: String(ivaAmount),
        totale: String(totale),
      });
      if (result.ok) {
        setCreateDialogOpen(false);
        resetForm();
        refresh();
      } else {
        alert(result.error || 'Errore nella creazione della fattura');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Sei sicuro di voler eliminare questa fattura?')) return;
    setSubmitting(true);
    try {
      const result = await deleteFattura(id);
      if (result.ok) {
        refresh();
      } else {
        alert(result.error || 'Errore nella cancellazione');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (submitting) return;
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} fatture?`)) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await deleteFattura(id);
      }
      setSelectedIds(new Set());
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (fattura: Fattura) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await createFattura({
        tenantId,
        tipo: fattura.tipo,
        clienteId: fattura.clienteId,
        clienteNome: fattura.clienteNome,
        data: new Date().toISOString().split('T')[0],
        dataScadenza: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        stato: 'non_pagata',
        statoSDI: 'bozza',
        righe: fattura.righe,
        subtotale: String(fattura.subtotale),
        iva: String(fattura.iva),
        totale: String(fattura.totale),
      });
      if (result.ok) {
        refresh();
      } else {
        alert(result.error || 'Errore nella duplicazione');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, statoSDI: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await updateFattura(id, { statoSDI });
      if (result.ok) {
        refresh();
      } else {
        alert(result.error || 'Errore nell\'aggiornamento');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      setSelectedIds(new Set(filtered.map((f) => f.id)));
    }
  };

  const exportCSV = (rows: typeof fatture) => {
    const header = 'Numero,Cliente,Data,Tipo,Stato SDI,Pagamento,Totale';
    const csv = [header, ...rows.map((f) => `${f.numero},${f.clienteNome},${f.data},${f.tipo},${f.statoSDI},${f.stato},${f.totale}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fatture.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // TODO: Replace with Supabase query
  const fattureEmesse = fatture.filter((f) => f.tipo === 'emessa');
  const fattureRicevute = fatture.filter((f) => f.tipo === 'ricevuta');

  const filtered = useMemo(() => {
    return fatture.filter((f) => {
      const matchSearch =
        f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filterTipo === 'tutti' || f.tipo === filterTipo;
      const matchSDI = filterSDI === 'tutti' || f.statoSDI === filterSDI;
      return matchSearch && matchTipo && matchSDI;
    });
  }, [searchTerm, filterTipo, filterSDI, fatture]);

  const totaleEmesse = fattureEmesse.reduce((s, f) => s + f.totale, 0);
  const totalePagate = fattureEmesse.filter((f) => f.stato === 'pagata').reduce((s, f) => s + f.totale, 0);
  const totaleScadute = fattureEmesse.filter((f) => f.stato === 'scaduta').reduce((s, f) => s + f.totale, 0);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Fatturazione Elettronica"
      description="Gestione fatture emesse e ricevute"
      actions={
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)}>
          <Download className="mr-2 h-4 w-4" />
          Esporta
        </Button>
        <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Fattura
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuova Fattura Elettronica</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Cliente *</Label>
                  <Select value={formClienteId} onValueChange={(v) => v && setFormClienteId(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Seleziona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clienti.filter((c) => c.tipo === 'azienda').slice(0, 10).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo Fattura</Label>
                  <Select value={formTipo} onValueChange={(v) => v && setFormTipo(v as 'emessa' | 'ricevuta')}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emessa">Emessa</SelectItem>
                      <SelectItem value="ricevuta">Ricevuta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Emissione</Label>
                  <Input type="date" value={formData} onChange={(e) => setFormData(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Scadenza Pagamento</Label>
                  <Input type="date" value={formScadenza} onChange={(e) => setFormScadenza(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Metodo Pagamento</Label>
                  <Select value={formMetodo} onValueChange={(v) => v && setFormMetodo(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonifico">Bonifico Bancario</SelectItem>
                      <SelectItem value="contanti">Contanti</SelectItem>
                      <SelectItem value="carta">Carta di Credito</SelectItem>
                      <SelectItem value="ri.ba">Ri.Ba.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrizione</Label>
                  <Input placeholder="Vendita prodotti" value={formDescrizione} onChange={(e) => setFormDescrizione(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Importo (IVA esclusa) *</Label>
                  <Input type="number" step="0.01" placeholder="0,00" value={formImporto} onChange={(e) => setFormImporto(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <Label>Aliquota IVA</Label>
                  <Select value={formIva} onValueChange={(v) => v && setFormIva(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22">22%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="4">4%</SelectItem>
                      <SelectItem value="0">Esente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={submitting} onClick={() => handleCreate(true)}>
                  {submitting ? 'Salvataggio...' : 'Salva Bozza'}
                </Button>
                <Button type="button" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting} onClick={() => handleCreate(false)}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Invio...' : 'Crea e Invia a SDI'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totaleEmesse)}</p>
                <p className="text-xs text-muted-foreground">Totale Emesse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totalePagate)}</p>
                <p className="text-xs text-muted-foreground">Incassate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totaleScadute)}</p>
                <p className="text-xs text-muted-foreground">Scadute</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{fattureEmesse.filter((f) => f.statoSDI === 'consegnata' || f.statoSDI === 'accettata').length}</p>
                <p className="text-xs text-muted-foreground">Consegnate SDI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per numero fattura o cliente..."
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
                <SelectItem value="tutti">Tutte</SelectItem>
                <SelectItem value="emessa">Emesse</SelectItem>
                <SelectItem value="ricevuta">Ricevute</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSDI} onValueChange={(v) => v && setFilterSDI(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Stato SDI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli stati</SelectItem>
                <SelectItem value="bozza">Bozza</SelectItem>
                <SelectItem value="inviata">Inviata</SelectItem>
                <SelectItem value="consegnata">Consegnata</SelectItem>
                <SelectItem value="accettata">Accettata</SelectItem>
                <SelectItem value="scartata">Scartata</SelectItem>
                <SelectItem value="in_attesa">In Attesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selezionati</span>
            <Button variant="destructive" size="sm" disabled={submitting} onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />{submitting ? 'Eliminazione...' : 'Elimina selezionati'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.filter((f) => selectedIds.has(f.id)))}>
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
                <TableHead>Cliente / Fornitore</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stato SDI</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((fattura) => (
                <TableRow key={fattura.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedIds.has(fattura.id)}
                      onChange={() => toggleSelect(fattura.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-sm">{fattura.numero}</TableCell>
                  <TableCell className="text-sm">{fattura.clienteNome}</TableCell>
                  <TableCell className="text-sm">{formatDate(fattura.data)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {fattura.tipo === 'emessa' ? 'Emessa' : 'Ricevuta'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${getStatoSDIColor(fattura.statoSDI)}`}>
                      {getStatoSDILabel(fattura.statoSDI)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${getStatoPagamentoColor(fattura.stato)}`}>
                      {fattura.stato.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(fattura.totale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                    <Dialog>
                      <DialogTrigger
                        onClick={() => setSelectedFattura(fattura as Fattura)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Fattura {fattura.numero}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Cliente/Fornitore</p>
                              <p className="font-medium">{fattura.clienteNome}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Data</p>
                              <p className="font-medium">{formatDate(fattura.data)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Scadenza</p>
                              <p className="font-medium">{formatDate(fattura.dataScadenza)}</p>
                            </div>
                            {fattura.xmlRiferimento && (
                              <div>
                                <p className="text-muted-foreground">XML Riferimento</p>
                                <p className="font-medium font-mono text-xs">{fattura.xmlRiferimento}</p>
                              </div>
                            )}
                          </div>

                          {/* Timeline SDI */}
                          {fattura.notificheSDI.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Timeline Notifiche SDI</p>
                              <div className="space-y-2">
                                {fattura.notificheSDI.map((notifica, i) => (
                                  <div key={i} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{notifica.tipo}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(notifica.data)} — {notifica.descrizione}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="border-t pt-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotale</span>
                              <span>{formatCurrency(fattura.subtotale)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IVA</span>
                              <span>{formatCurrency(fattura.iva)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base">
                              <span>Totale</span>
                              <span>{formatCurrency(fattura.totale)}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={submitting} onClick={() => handleStatusChange(fattura.id, 'inviata')}>
                          <Pencil className="mr-2 h-4 w-4" />Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={submitting} onClick={() => handleDuplicate(fattura as Fattura)}>
                          <Copy className="mr-2 h-4 w-4" />Duplica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.print()}>
                          <Printer className="mr-2 h-4 w-4" />Stampa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={submitting} onClick={() => handleDelete(fattura.id)} className="text-red-600">
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
          <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
