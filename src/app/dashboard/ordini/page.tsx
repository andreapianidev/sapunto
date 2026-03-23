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
import { fetchOrdini, fetchClienti, fetchProdotti, createOrdine, updateOrdine, deleteOrdine } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, getStatoOrdineColor, getStatoOrdineLabel, exportCSV } from '@/lib/utils';
import { Search, Plus, Eye, ShoppingCart, Save, MoreHorizontal, Pencil, Trash2, Copy, Download } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import type { Ordine } from '@/lib/types';

export default function OrdiniPage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchOrdini(tenantId), fetchClienti(tenantId), fetchProdotti(tenantId)]),
    [[], [], []]
  );
  const ordini = allData[0];
  const clienti = allData[1];
  const prodotti = allData[2];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [filterCanale, setFilterCanale] = useState<string>('tutti');
  const [selectedOrdine, setSelectedOrdine] = useState<Ordine | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state for new order
  const [formClienteId, setFormClienteId] = useState('');
  const [formCanale, setFormCanale] = useState<'diretto' | 'woocommerce' | 'prestashop' | 'telefono' | 'email'>('diretto');
  const [formData, setFormData] = useState(new Date().toISOString().split('T')[0]);
  const [formNote, setFormNote] = useState('');
  const [formQuantities, setFormQuantities] = useState<Record<string, number>>({});

  const resetForm = () => {
    setFormClienteId(clienti.length > 0 ? clienti[0].id : '');
    setFormCanale('diretto');
    setFormData(new Date().toISOString().split('T')[0]);
    setFormNote('');
    setFormQuantities({});
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };

  // TODO: Replace with Supabase query
  const filtered = useMemo(() => {
    return ordini.filter((o) => {
      const matchSearch =
        o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || o.stato === filterStato;
      const matchCanale = filterCanale === 'tutti' || o.canale === filterCanale;
      return matchSearch && matchStato && matchCanale;
    });
  }, [searchTerm, filterStato, filterCanale, ordini]);

  const stats = useMemo(() => ({
    totali: ordini.length,
    nuovi: ordini.filter((o) => o.stato === 'nuovo').length,
    inLavorazione: ordini.filter((o) => o.stato === 'in_lavorazione').length,
    completati: ordini.filter((o) => o.stato === 'completato').length,
  }), [ordini]);

  const handleCreateOrdine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const selectedCliente = clienti.find((c) => c.id === formClienteId);
      const righe = prodotti
        .slice(0, 8)
        .filter((p) => (formQuantities[p.id] || 0) > 0)
        .map((p) => {
          const qty = formQuantities[p.id] || 0;
          const lineTotal = p.prezzo * qty;
          return {
            prodottoId: p.id,
            nome: p.nome,
            quantita: qty,
            prezzoUnitario: p.prezzo,
            iva: lineTotal * 0.22,
            totale: lineTotal,
          };
        });

      const subtotale = righe.reduce((acc, r) => acc + r.totale, 0);
      const iva = subtotale * 0.22;
      const totale = subtotale + iva;

      const result = await createOrdine({
        tenantId,
        clienteId: formClienteId,
        clienteNome: selectedCliente?.ragioneSociale || '',
        data: formData,
        stato: 'nuovo',
        righe,
        subtotale: subtotale.toFixed(2),
        iva: iva.toFixed(2),
        totale: totale.toFixed(2),
        canale: formCanale,
        note: formNote || undefined,
      });

      if (result.ok) {
        setCreateDialogOpen(false);
        resetForm();
        refresh();
      } else {
        alert(result.error || 'Errore nella creazione dell\'ordine');
      }
    } catch {
      alert('Errore nella creazione dell\'ordine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrdine = async (id: string) => {
    if (submitting) return;
    if (!confirm('Sei sicuro di voler eliminare questo ordine?')) return;
    setSubmitting(true);
    try {
      const result = await deleteOrdine(id);
      if (result.ok) {
        refresh();
      } else {
        alert(result.error || 'Errore nell\'eliminazione dell\'ordine');
      }
    } catch {
      alert('Errore nell\'eliminazione dell\'ordine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (submitting) return;
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} ordini?`)) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await deleteOrdine(id);
      }
      setSelectedIds(new Set());
      refresh();
    } catch {
      alert('Errore nell\'eliminazione degli ordini');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStato = async (id: string, newStato: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await updateOrdine(id, { stato: newStato });
      if (result.ok) {
        refresh();
      } else {
        alert(result.error || 'Errore nell\'aggiornamento dello stato');
      }
    } catch {
      alert('Errore nell\'aggiornamento dello stato');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateOrdine = async (ordine: Ordine) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await createOrdine({
        tenantId,
        clienteId: ordine.clienteId,
        clienteNome: ordine.clienteNome,
        data: new Date().toISOString().split('T')[0],
        stato: 'nuovo',
        righe: ordine.righe.map((r) => ({
          prodottoId: r.prodottoId,
          nome: r.nome,
          quantita: r.quantita,
          prezzoUnitario: r.prezzoUnitario,
          iva: r.iva,
          totale: r.totale,
        })),
        subtotale: String(ordine.subtotale),
        iva: String(ordine.iva),
        totale: String(ordine.totale),
        canale: ordine.canale as 'diretto' | 'woocommerce' | 'prestashop' | 'telefono' | 'email',
        note: ordine.note || undefined,
      });

      if (result.ok) {
        refresh();
      } else {
        alert(result.error || 'Errore nella duplicazione dell\'ordine');
      }
    } catch {
      alert('Errore nella duplicazione dell\'ordine');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Ordini"
      description="Gestione ordini clienti"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(
            filtered.map((o) => ({ numero: o.numero, clienteNome: o.clienteNome, data: o.data, stato: o.stato, canale: o.canale, totale: o.totale })),
            [
              { key: 'numero', label: 'Numero' },
              { key: 'clienteNome', label: 'Cliente' },
              { key: 'data', label: 'Data' },
              { key: 'stato', label: 'Stato' },
              { key: 'canale', label: 'Canale' },
              { key: 'totale', label: 'Totale' },
            ],
            'ordini'
          )}>
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (open) resetForm(); }}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Ordine
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuovo Ordine</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateOrdine}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Cliente *</Label>
                  <Select value={formClienteId || (clienti.length > 0 ? clienti[0].id : '')} onValueChange={(v) => v && setFormClienteId(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clienti.slice(0, 10).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Canale</Label>
                  <Select value={formCanale} onValueChange={(v) => setFormCanale(v as typeof formCanale)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diretto">Diretto</SelectItem>
                      <SelectItem value="telefono">Telefono</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="woocommerce">WooCommerce</SelectItem>
                      <SelectItem value="prestashop">PrestaShop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={formData} onChange={(e) => setFormData(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Prodotti</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {prodotti.slice(0, 8).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="flex-1 truncate">{p.nome}</span>
                      <span className="text-muted-foreground mx-2">{formatCurrency(p.prezzo)}</span>
                      <Input
                        type="number"
                        min={0}
                        value={formQuantities[p.id] || 0}
                        onChange={(e) => setFormQuantities((prev) => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                        className="w-16 h-7 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <Input placeholder="Note aggiuntive..." className="mt-1" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? 'Creazione...' : 'Crea Ordine'}
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
        {[
          { label: 'Totale Ordini', value: stats.totali, color: 'bg-blue-50 text-blue-700' },
          { label: 'Nuovi', value: stats.nuovi, color: 'bg-green-50 text-green-700' },
          { label: 'In Lavorazione', value: stats.inLavorazione, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Completati', value: stats.completati, color: 'bg-emerald-50 text-emerald-700' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per numero ordine o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli stati</SelectItem>
                <SelectItem value="nuovo">Nuovo</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="spedito">Spedito</SelectItem>
                <SelectItem value="completato">Completato</SelectItem>
                <SelectItem value="annullato">Annullato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCanale} onValueChange={(v) => v && setFilterCanale(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Canale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i canali</SelectItem>
                <SelectItem value="diretto">Diretto</SelectItem>
                <SelectItem value="woocommerce">WooCommerce</SelectItem>
                <SelectItem value="prestashop">PrestaShop</SelectItem>
                <SelectItem value="telefono">Telefono</SelectItem>
                <SelectItem value="email">Email</SelectItem>
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
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={submitting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {submitting ? 'Eliminazione...' : 'Elimina selezionati'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCSV(
                filtered.filter((o) => selectedIds.has(o.id)).map((o) => ({ numero: o.numero, clienteNome: o.clienteNome, data: o.data, stato: o.stato, canale: o.canale, totale: o.totale })),
                [
                  { key: 'numero', label: 'Numero' },
                  { key: 'clienteNome', label: 'Cliente' },
                  { key: 'data', label: 'Data' },
                  { key: 'stato', label: 'Stato' },
                  { key: 'canale', label: 'Canale' },
                  { key: 'totale', label: 'Totale' },
                ],
                'ordini-selezionati'
              )}>
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
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="hidden md:table-cell">Canale</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((ordine) => (
                <TableRow key={ordine.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedIds.has(ordine.id)}
                      onChange={() => toggleSelect(ordine.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-sm">{ordine.numero}</TableCell>
                  <TableCell className="text-sm">{ordine.clienteNome}</TableCell>
                  <TableCell className="text-sm">{formatDate(ordine.data)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${getStatoOrdineColor(ordine.stato)}`}>
                      {getStatoOrdineLabel(ordine.stato)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm capitalize">{ordine.canale}</TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(ordine.totale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Dialog>
                        <DialogTrigger
                          onClick={() => setSelectedOrdine(ordine as Ordine)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Ordine {ordine.numero}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Cliente</p>
                                <p className="font-medium">{ordine.clienteNome}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Data</p>
                                <p className="font-medium">{formatDate(ordine.data)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Stato</p>
                                <Badge variant="secondary" className={getStatoOrdineColor(ordine.stato)}>
                                  {getStatoOrdineLabel(ordine.stato)}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Canale</p>
                                <p className="font-medium capitalize">{ordine.canale}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-2">Righe ordine</p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Prodotto</TableHead>
                                    <TableHead className="text-center">Qtà</TableHead>
                                    <TableHead className="text-right">Totale</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {ordine.righe.map((riga, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="text-sm">{riga.nome}</TableCell>
                                      <TableCell className="text-center text-sm">{riga.quantita}</TableCell>
                                      <TableCell className="text-right text-sm">{formatCurrency(riga.totale)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <div className="border-t pt-3 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotale</span>
                                <span>{formatCurrency(ordine.subtotale)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">IVA 22%</span>
                                <span>{formatCurrency(ordine.iva)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-base">
                                <span>Totale</span>
                                <span>{formatCurrency(ordine.totale)}</span>
                              </div>
                            </div>
                            <div className="border-t pt-3">
                              <Label className="text-sm font-semibold">Cambia Stato</Label>
                              <Select
                                value={ordine.stato}
                                onValueChange={(newStato) => newStato && handleUpdateStato(ordine.id, newStato)}
                              >
                                <SelectTrigger className="mt-1 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nuovo">Nuovo</SelectItem>
                                  <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                                  <SelectItem value="spedito">Spedito</SelectItem>
                                  <SelectItem value="completato">Completato</SelectItem>
                                  <SelectItem value="annullato">Annullato</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStato(ordine.id, ordine.stato === 'nuovo' ? 'in_lavorazione' : ordine.stato === 'in_lavorazione' ? 'spedito' : 'completato')}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Avanza stato
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateOrdine(ordine as Ordine)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteOrdine(ordine.id)} className="text-red-600">
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
          <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
