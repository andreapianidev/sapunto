'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchAppuntamenti, fetchClienti, createAppuntamento, updateAppuntamento, deleteAppuntamento } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDate, exportCSV } from '@/lib/utils';
import { Plus, Calendar, Clock, MapPin, User, MoreHorizontal, Pencil, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const giorniSettimanaCompleti = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function AppuntamentiPage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchAppuntamenti(tenantId), fetchClienti(tenantId)]),
    [[], []]
  );
  const appuntamenti = allData[0];
  const clienti = allData[1];

  // Settimana corrente: 16-22 Marzo 2026 (Lun-Dom)
  const [settimanaOffset, setSettimanaOffset] = useState(0);
  const [meseOffset, setMeseOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filtroStato, setFiltroStato] = useState<string>('tutti');
  const [filtroOperatore, setFiltroOperatore] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Create form state
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitolo, setFormTitolo] = useState('');
  const [formClienteId, setFormClienteId] = useState('');
  const [formOperatore, setFormOperatore] = useState('');
  const [formData, setFormData] = useState('');
  const [formOraInizio, setFormOraInizio] = useState('');
  const [formOraFine, setFormOraFine] = useState('');
  const [formLuogo, setFormLuogo] = useState('');
  const [formStato, setFormStato] = useState<string>('confermato');
  const [formNote, setFormNote] = useState('');

  // Edit form state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitolo, setEditTitolo] = useState('');
  const [editClienteId, setEditClienteId] = useState('');
  const [editOperatore, setEditOperatore] = useState('');
  const [editData, setEditData] = useState('');
  const [editOraInizio, setEditOraInizio] = useState('');
  const [editOraFine, setEditOraFine] = useState('');
  const [editLuogo, setEditLuogo] = useState('');
  const [editStato, setEditStato] = useState<string>('confermato');
  const [editNote, setEditNote] = useState('');

  const resetCreateForm = () => {
    setFormTitolo('');
    setFormClienteId('');
    setFormOperatore('');
    setFormData('');
    setFormOraInizio('');
    setFormOraFine('');
    setFormLuogo('');
    setFormStato('confermato');
    setFormNote('');
  };

  const openEdit = (app: typeof appuntamenti[number]) => {
    setEditId(app.id);
    setEditTitolo(app.titolo);
    setEditClienteId(app.clienteId || '');
    setEditOperatore(app.operatoreNome);
    setEditData(app.data);
    setEditOraInizio(app.oraInizio);
    setEditOraFine(app.oraFine);
    setEditLuogo(app.luogo || '');
    setEditStato(app.stato);
    setEditNote(app.note || '');
    setEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const selectedCliente = clienti.find((c) => c.id === formClienteId);
    const res = await createAppuntamento({
      tenantId,
      titolo: formTitolo,
      clienteId: formClienteId || undefined,
      clienteNome: selectedCliente?.ragioneSociale || undefined,
      operatoreId: '',
      operatoreNome: formOperatore,
      data: formData,
      oraInizio: formOraInizio,
      oraFine: formOraFine,
      stato: formStato as 'confermato' | 'in_attesa' | 'annullato',
      luogo: formLuogo || undefined,
      note: formNote || undefined,
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
    if (!editId) return;
    setSubmitting(true);
    const selectedCliente = clienti.find((c) => c.id === editClienteId);
    const res = await updateAppuntamento(editId, {
      titolo: editTitolo,
      clienteId: editClienteId || null,
      clienteNome: selectedCliente?.ragioneSociale || null,
      operatoreNome: editOperatore,
      data: editData,
      oraInizio: editOraInizio,
      oraFine: editOraFine,
      stato: editStato,
      luogo: editLuogo || null,
      note: editNote || null,
    });
    setSubmitting(false);
    if (res.ok) {
      setEditOpen(false);
      setEditId(null);
      refresh();
    } else {
      alert(res.error || 'Errore durante la modifica');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;
    setSubmitting(true);
    const res = await deleteAppuntamento(id);
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error || 'Errore durante l\'eliminazione');
    }
  };

  const oggi = new Date().toISOString().split('T')[0];

  // Unique operators from data
  const operatori = useMemo(() => Array.from(new Set(appuntamenti.map(a => a.operatoreNome))).sort(), [appuntamenti]);

  // Filtered appuntamenti
  const appuntamentiFiltrati = useMemo(() => {
    return appuntamenti.filter((a) => {
      if (filtroStato !== 'tutti' && a.stato !== filtroStato) return false;
      if (filtroOperatore !== 'tutti' && a.operatoreNome !== filtroOperatore) return false;
      return true;
    });
  }, [filtroStato, filtroOperatore, appuntamenti]);

  const getSettimana = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const base = new Date(now);
    base.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); // Lunedì corrente
    base.setDate(base.getDate() + offset * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const settimana = getSettimana(settimanaOffset);

  const appPerGiorno = useMemo(() => {
    const map: Record<string, typeof appuntamenti> = {};
    settimana.forEach((d) => {
      const key = d.toISOString().split('T')[0];
      map[key] = appuntamentiFiltrati.filter((a) => a.data === key);
    });
    return map;
  }, [settimanaOffset, appuntamentiFiltrati]);

  // Monthly calendar helpers
  const getMeseInfo = (offset: number) => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + offset);
    const anno = base.getFullYear();
    const mese = base.getMonth();
    const primoGiorno = new Date(anno, mese, 1);
    const ultimoGiorno = new Date(anno, mese + 1, 0);
    const giorniNelMese = ultimoGiorno.getDate();
    // 0=Sun -> shift to Mon=0
    let startDay = primoGiorno.getDay() - 1;
    if (startDay < 0) startDay = 6;
    return { anno, mese, giorniNelMese, startDay, primoGiorno };
  };

  const meseInfo = getMeseInfo(meseOffset);

  const nomiMesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  const calendarCells = useMemo(() => {
    const cells: { date: string; day: number; inMonth: boolean }[] = [];
    const { anno, mese, giorniNelMese, startDay } = meseInfo;

    // Previous month padding
    const prevMonth = new Date(anno, mese, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonth.getDate() - i;
      const dateStr = new Date(anno, mese - 1, d).toISOString().split('T')[0];
      cells.push({ date: dateStr, day: d, inMonth: false });
    }

    // Current month days
    for (let d = 1; d <= giorniNelMese; d++) {
      const dateStr = new Date(anno, mese, d).toISOString().split('T')[0];
      cells.push({ date: dateStr, day: d, inMonth: true });
    }

    // Next month padding to fill grid (always fill to at least 35 cells, or 42 if needed)
    const totalRows = Math.ceil(cells.length / 7);
    const totalCells = totalRows * 7;
    let nextDay = 1;
    while (cells.length < totalCells) {
      const dateStr = new Date(anno, mese + 1, nextDay).toISOString().split('T')[0];
      cells.push({ date: dateStr, day: nextDay, inMonth: false });
      nextDay++;
    }

    return cells;
  }, [meseInfo]);

  const appPerGiornoMese = useMemo(() => {
    const map: Record<string, typeof appuntamenti> = {};
    calendarCells.forEach((cell) => {
      const apps = appuntamentiFiltrati.filter((a) => a.data === cell.date);
      if (apps.length > 0) map[cell.date] = apps;
    });
    return map;
  }, [calendarCells, appuntamentiFiltrati]);

  // Selected day appointments for monthly view
  const selectedDayApps = useMemo(() => {
    if (!selectedDay) return [];
    return appuntamentiFiltrati
      .filter((a) => a.data === selectedDay)
      .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));
  }, [selectedDay, appuntamentiFiltrati]);

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const prossimi = useMemo(() => {
    return appuntamentiFiltrati
      .filter((a) => a.data >= oggi)
      .sort((a, b) => a.data.localeCompare(b.data) || a.oraInizio.localeCompare(b.oraInizio))
      .slice(0, 10);
  }, [appuntamentiFiltrati]);

  const toggleSelectAll = () => {
    if (selectedIds.size === prossimi.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prossimi.map((a) => a.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} appuntamenti selezionati?`)) return;
    setSubmitting(true);
    for (const id of selectedIds) {
      await deleteAppuntamento(id);
    }
    setSubmitting(false);
    setSelectedIds(new Set());
    refresh();
  };

  const handleBulkExport = () => {
    exportCSV(
      appuntamenti.filter((a) => selectedIds.has(a.id)),
      [
        { key: 'data', label: 'Data' },
        { key: 'oraInizio', label: 'Ora' },
        { key: 'clienteNome', label: 'Cliente' },
        { key: 'titolo', label: 'Tipo' },
        { key: 'stato', label: 'Stato' },
        { key: 'note', label: 'Note' },
      ],
      'appuntamenti-selezionati'
    );
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Appuntamenti"
      description="Calendario appuntamenti e visite"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(appuntamentiFiltrati, [
            { key: 'data', label: 'Data' },
            { key: 'oraInizio', label: 'Ora' },
            { key: 'clienteNome', label: 'Cliente' },
            { key: 'titolo', label: 'Tipo' },
            { key: 'stato', label: 'Stato' },
            { key: 'note', label: 'Note' },
          ], 'appuntamenti')}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Appuntamento
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuovo Appuntamento</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Titolo *</Label>
                    <Input placeholder="Es. Sopralluogo cliente" className="mt-1" required value={formTitolo} onChange={(e) => setFormTitolo(e.target.value)} />
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <Select value={formClienteId} onValueChange={(v) => setFormClienteId(v ?? '')}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Seleziona cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clienti.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Operatore</Label>
                    <Input value={formOperatore} onChange={(e) => setFormOperatore(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" className="mt-1" value={formData} onChange={(e) => setFormData(e.target.value)} />
                  </div>
                  <div>
                    <Label>Ora Inizio</Label>
                    <Input type="time" className="mt-1" value={formOraInizio} onChange={(e) => setFormOraInizio(e.target.value)} />
                  </div>
                  <div>
                    <Label>Ora Fine</Label>
                    <Input type="time" className="mt-1" value={formOraFine} onChange={(e) => setFormOraFine(e.target.value)} />
                  </div>
                  <div>
                    <Label>Luogo</Label>
                    <Input placeholder="Es. Via Roma 10, Milano" className="mt-1" value={formLuogo} onChange={(e) => setFormLuogo(e.target.value)} />
                  </div>
                  <div>
                    <Label>Stato</Label>
                    <Select value={formStato} onValueChange={(v) => setFormStato(v ?? 'confermato')}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confermato">Confermato</SelectItem>
                        <SelectItem value="in_attesa">In Attesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Note</Label>
                    <textarea
                      placeholder="Note aggiuntive..."
                      rows={3}
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
                    {submitting ? 'Salvataggio...' : 'Salva Appuntamento'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[160px]">
              <Label className="text-xs text-muted-foreground">Stato</Label>
              <Select value={filtroStato} onValueChange={(v) => setFiltroStato(v ?? 'tutti')}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti gli stati</SelectItem>
                  <SelectItem value="confermato">Confermato</SelectItem>
                  <SelectItem value="in_attesa">In Attesa</SelectItem>
                  <SelectItem value="annullato">Annullato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Operatore</Label>
              <Select value={filtroOperatore} onValueChange={(v) => setFiltroOperatore(v ?? 'tutti')}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti gli operatori</SelectItem>
                  {operatori.map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(filtroStato !== 'tutti' || filtroOperatore !== 'tutti') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFiltroStato('tutti'); setFiltroOperatore('tutti'); }}
                className="text-muted-foreground"
              >
                Resetta filtri
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Tabs */}
      <Tabs defaultValue="settimana">
        <TabsList>
          <TabsTrigger value="settimana">Settimana</TabsTrigger>
          <TabsTrigger value="mese">Mese</TabsTrigger>
        </TabsList>

        {/* Weekly View */}
        <TabsContent value="settimana">
          {/* Week navigation */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setSettimanaOffset(settimanaOffset - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sett. Prec.
              </Button>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {formatDate(settimana[0].toISOString())} — {formatDate(settimana[6].toISOString())}
                </h3>
                {settimanaOffset !== 0 && (
                  <Button variant="outline" size="sm" onClick={() => setSettimanaOffset(0)}>
                    Oggi
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSettimanaOffset(settimanaOffset + 1)}>
                Sett. Succ.
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Weekly calendar */}
          <div className="grid gap-3 lg:grid-cols-7 mt-3">
            {settimana.map((giorno, i) => {
              const key = giorno.toISOString().split('T')[0];
              const apps = appPerGiorno[key] || [];
              const isOggi = key === oggi;
              const isWeekend = i >= 5;

              return (
                <Card key={key} className={`${isOggi ? 'ring-2 ring-[#1a2332]' : ''} ${isWeekend ? 'opacity-60' : ''}`}>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className={`text-sm font-semibold flex items-center justify-between ${isOggi ? 'text-[#1a2332]' : ''}`}>
                      <span>{giorniSettimana[i]}</span>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        isOggi ? 'bg-[#1a2332] text-white' : ''
                      }`}>
                        {giorno.getDate()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {apps.length > 0 ? (
                      apps.map((app) => (
                        <div
                          key={app.id}
                          className={`relative rounded-lg p-2 text-xs border ${
                            app.stato === 'confermato'
                              ? 'bg-green-50 border-green-200'
                              : app.stato === 'in_attesa'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="absolute top-1 right-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground h-5 w-5">
                                <MoreHorizontal className="h-3 w-3" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(app)}>
                                  <Pencil className="mr-2 h-4 w-4" />Modifica
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(app.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />Elimina
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="font-semibold truncate pr-5">{app.titolo}</p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{app.oraInizio}-{app.oraFine}</span>
                          </div>
                          {app.clienteNome && (
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span className="truncate">{app.clienteNome}</span>
                            </div>
                          )}
                          {app.luogo && (
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{app.luogo}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">—</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Monthly View */}
        <TabsContent value="mese">
          {/* Month navigation */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setMeseOffset(meseOffset - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Mese Prec.
              </Button>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {nomiMesi[meseInfo.mese]} {meseInfo.anno}
                </h3>
                {meseOffset !== 0 && (
                  <Button variant="outline" size="sm" onClick={() => setMeseOffset(0)}>
                    Oggi
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setMeseOffset(meseOffset + 1)}>
                Mese Succ.
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Monthly calendar grid */}
          <Card className="mt-3">
            <CardContent className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {giorniSettimana.map((g) => (
                  <div key={g} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {g}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px">
                {calendarCells.map((cell) => {
                  const apps = appPerGiornoMese[cell.date] || [];
                  const isOggi = cell.date === oggi;
                  const isSelected = cell.date === selectedDay;

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      onClick={() => setSelectedDay(cell.date === selectedDay ? null : cell.date)}
                      className={`relative min-h-[72px] p-1.5 text-left border rounded-md transition-colors ${
                        !cell.inMonth ? 'bg-muted/30 text-muted-foreground/50' : 'hover:bg-muted/50'
                      } ${isSelected ? 'ring-2 ring-[#1a2332] bg-muted/40' : ''} ${
                        isOggi && !isSelected ? 'bg-blue-50 border-blue-200' : 'border-border'
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        isOggi
                          ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1a2332] text-white'
                          : ''
                      }`}>
                        {cell.day}
                      </span>
                      {apps.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {apps.length <= 2 ? (
                            apps.map((app) => (
                              <div
                                key={app.id}
                                className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium ${
                                  app.stato === 'confermato'
                                    ? 'bg-green-100 text-green-800'
                                    : app.stato === 'in_attesa'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {app.titolo}
                              </div>
                            ))
                          ) : (
                            <>
                              <div
                                className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium ${
                                  apps[0].stato === 'confermato'
                                    ? 'bg-green-100 text-green-800'
                                    : apps[0].stato === 'in_attesa'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {apps[0].titolo}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium px-1">
                                +{apps.length - 1} altri
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected day detail */}
          {selectedDay && (
            <Card className="mt-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appuntamenti del {formatDate(selectedDay)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDayApps.length > 0 ? (
                  selectedDayApps.map((app) => (
                    <div key={app.id} className="flex items-start gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{app.oraInizio}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{app.titolo}</p>
                        {app.clienteNome && (
                          <p className="text-xs text-muted-foreground">{app.clienteNome}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {app.oraInizio} - {app.oraFine} | {app.operatoreNome}
                        </p>
                        {app.luogo && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />{app.luogo}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className={`text-xs ${
                        app.stato === 'confermato' ? 'bg-green-100 text-green-800' :
                        app.stato === 'in_attesa' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.stato === 'confermato' ? 'Confermato' : app.stato === 'in_attesa' ? 'In Attesa' : 'Annullato'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessun appuntamento in questa giornata</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Lista appuntamenti prossimi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Prossimi Appuntamenti</CardTitle>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedIds.size} selezionati</span>
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="mr-1 h-3 w-3" />
                  Esporta
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete} disabled={submitting} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="mr-1 h-3 w-3" />
                  {submitting ? 'Eliminazione...' : 'Elimina'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Select all */}
          {prossimi.length > 0 && (
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={selectedIds.size === prossimi.length && prossimi.length > 0}
                onChange={toggleSelectAll}
              />
              <span className="text-xs text-muted-foreground">Seleziona tutti</span>
            </div>
          )}
          {prossimi.map((app) => (
              <div key={app.id} className="flex items-start gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedIds.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                  />
                </div>
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-center">
                  <span className="text-xs font-bold">{formatDate(app.data).slice(0, 5)}</span>
                  <span className="text-xs text-muted-foreground">{app.oraInizio}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{app.titolo}</p>
                  {app.clienteNome && (
                    <p className="text-xs text-muted-foreground">{app.clienteNome}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {app.oraInizio} - {app.oraFine} | {app.operatoreNome}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-xs ${
                  app.stato === 'confermato' ? 'bg-green-100 text-green-800' :
                  app.stato === 'in_attesa' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {app.stato === 'confermato' ? 'Confermato' : app.stato === 'in_attesa' ? 'In Attesa' : 'Annullato'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(app)}>
                      <Pencil className="mr-2 h-4 w-4" />Modifica
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(app.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          {prossimi.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nessun appuntamento trovato con i filtri selezionati</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica Appuntamento</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEdit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Titolo *</Label>
                <Input placeholder="Es. Sopralluogo cliente" className="mt-1" required value={editTitolo} onChange={(e) => setEditTitolo(e.target.value)} />
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={editClienteId} onValueChange={(v) => setEditClienteId(v ?? '')}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleziona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clienti.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operatore</Label>
                <Input value={editOperatore} onChange={(e) => setEditOperatore(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" className="mt-1" value={editData} onChange={(e) => setEditData(e.target.value)} />
              </div>
              <div>
                <Label>Ora Inizio</Label>
                <Input type="time" className="mt-1" value={editOraInizio} onChange={(e) => setEditOraInizio(e.target.value)} />
              </div>
              <div>
                <Label>Ora Fine</Label>
                <Input type="time" className="mt-1" value={editOraFine} onChange={(e) => setEditOraFine(e.target.value)} />
              </div>
              <div>
                <Label>Luogo</Label>
                <Input placeholder="Es. Via Roma 10, Milano" className="mt-1" value={editLuogo} onChange={(e) => setEditLuogo(e.target.value)} />
              </div>
              <div>
                <Label>Stato</Label>
                <Select value={editStato} onValueChange={(v) => setEditStato(v ?? 'confermato')}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confermato">Confermato</SelectItem>
                    <SelectItem value="in_attesa">In Attesa</SelectItem>
                    <SelectItem value="annullato">Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Note</Label>
                <textarea
                  placeholder="Note aggiuntive..."
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
                {submitting ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
