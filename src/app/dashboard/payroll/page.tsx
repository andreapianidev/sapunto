'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { fetchDipendenti, fetchCedolini, createDipendente, updateDipendente, deleteDipendente, createCedolino, updateCedolino, deleteCedolino } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, getMeseLabel } from '@/lib/utils';
import { Users, Wallet, Eye, FileDown, Plus, MoreHorizontal, Pencil, Trash2, Download, Search } from 'lucide-react';
import type { Dipendente } from '@/lib/types';

export default function PayrollPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchDipendenti(tenantId), fetchCedolini(tenantId)]),
    [[], []]
  );
  const dipendenti = allData[0];
  const cedolini = allData[1];

  const [selectedDipendente, setSelectedDipendente] = useState<Dipendente | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Dialog open states ---
  const [newDipOpen, setNewDipOpen] = useState(false);
  const [newCedOpen, setNewCedOpen] = useState(false);

  // --- New Dipendente form state ---
  const [dipFormNome, setDipFormNome] = useState('');
  const [dipFormCognome, setDipFormCognome] = useState('');
  const [dipFormEmail, setDipFormEmail] = useState('');
  const [dipFormCf, setDipFormCf] = useState('');
  const [dipFormNascita, setDipFormNascita] = useState('');
  const [dipFormRuolo, setDipFormRuolo] = useState('');
  const [dipFormContratto, setDipFormContratto] = useState('');
  const [dipFormLivello, setDipFormLivello] = useState('');
  const [dipFormRal, setDipFormRal] = useState('');
  const [dipFormIban, setDipFormIban] = useState('');
  const [dipFormIndirizzo, setDipFormIndirizzo] = useState('');

  // --- Generate Cedolino form state ---
  const [cedFormDipendente, setCedFormDipendente] = useState('');
  const [cedFormMese, setCedFormMese] = useState('');
  const [cedFormAnno, setCedFormAnno] = useState('');

  // --- Dipendenti tab state ---
  const [dipSearch, setDipSearch] = useState('');
  const [dipContrattoFilter, setDipContrattoFilter] = useState('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dipPage, setDipPage] = useState(1);
  const [dipPageSize, setDipPageSize] = useState(10);

  // --- Cedolini tab state ---
  const [cedDipendenteFilter, setCedDipendenteFilter] = useState('tutti');
  const [cedMeseFilter, setCedMeseFilter] = useState('tutti');
  const [cedAnnoFilter, setCedAnnoFilter] = useState('tutti');
  const [cedPage, setCedPage] = useState(1);
  const [cedPageSize, setCedPageSize] = useState(10);

  // TODO: Replace with Supabase query
  const costoMensile = dipendenti.reduce((s, d) => s + d.ralLorda / 13, 0);
  const costoAnnuale = dipendenti.reduce((s, d) => s + d.ralLorda, 0);

  // --- Reset new dipendente form ---
  const resetDipForm = () => {
    setDipFormNome('');
    setDipFormCognome('');
    setDipFormEmail('');
    setDipFormCf('');
    setDipFormNascita('');
    setDipFormRuolo('');
    setDipFormContratto('');
    setDipFormLivello('');
    setDipFormRal('');
    setDipFormIban('');
    setDipFormIndirizzo('');
  };

  // --- Reset cedolino form ---
  const resetCedForm = () => {
    setCedFormDipendente('');
    setCedFormMese('');
    setCedFormAnno('');
  };

  // --- Handle create dipendente ---
  const handleCreateDipendente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createDipendente({
        tenantId,
        nome: dipFormNome,
        cognome: dipFormCognome,
        email: dipFormEmail,
        codiceFiscale: dipFormCf,
        dataNascita: dipFormNascita,
        luogoNascita: '',
        indirizzo: dipFormIndirizzo,
        telefono: '',
        ruoloAziendale: dipFormRuolo,
        tipoContratto: (dipFormContratto || 'indeterminato') as 'indeterminato' | 'determinato' | 'apprendistato' | 'collaborazione',
        dataAssunzione: new Date().toISOString().split('T')[0],
        ralLorda: dipFormRal || '0',
        livello: dipFormLivello,
        iban: dipFormIban,
      });
      if (!res.ok) {
        alert(`Errore: ${res.error}`);
      } else {
        resetDipForm();
        setNewDipOpen(false);
        refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle create cedolino ---
  const handleCreateCedolino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedFormDipendente) return;
    setSubmitting(true);
    try {
      const dip = dipendenti.find((d) => d.id === cedFormDipendente);
      const lordo = dip ? dip.ralLorda / 13 : 0;
      const inps = lordo * 0.0919;
      const imponibile = lordo - inps;
      const irpef = imponibile * 0.23;
      const addReg = imponibile * 0.0173;
      const addCom = imponibile * 0.008;
      const netto = lordo - inps - irpef - addReg - addCom;

      const res = await createCedolino({
        tenantId,
        dipendenteId: cedFormDipendente,
        mese: Number(cedFormMese) || new Date().getMonth() + 1,
        anno: Number(cedFormAnno) || new Date().getFullYear(),
        lordo: String(Math.round(lordo * 100) / 100),
        contributiInps: String(Math.round(inps * 100) / 100),
        irpef: String(Math.round(irpef * 100) / 100),
        addizionaleRegionale: String(Math.round(addReg * 100) / 100),
        addizionaleComunale: String(Math.round(addCom * 100) / 100),
        altreRitenute: '0',
        netto: String(Math.round(netto * 100) / 100),
      });
      if (!res.ok) {
        alert(`Errore: ${res.error}`);
      } else {
        resetCedForm();
        setNewCedOpen(false);
        refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle delete dipendente ---
  const handleDeleteDipendente = async (id: string, nome: string) => {
    if (!confirm(`Eliminare il dipendente "${nome}"?`)) return;
    setSubmitting(true);
    try {
      const res = await deleteDipendente(id);
      if (!res.ok) alert(`Errore: ${res.error}`);
      else refresh();
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle bulk delete ---
  const handleBulkDelete = async () => {
    if (!confirm(`Eliminare ${selectedIds.size} dipendente/i selezionati?`)) return;
    setSubmitting(true);
    try {
      for (const id of selectedIds) {
        await deleteDipendente(id);
      }
      setSelectedIds(new Set());
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  // --- Filtered dipendenti ---
  const filteredDipendenti = useMemo(() => {
    let result = dipendenti;

    // Search
    if (dipSearch.trim()) {
      const q = dipSearch.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.nome.toLowerCase().includes(q) ||
          d.cognome.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.ruoloAziendale.toLowerCase().includes(q)
      );
    }

    // Filter by tipo contratto
    if (dipContrattoFilter !== 'tutti') {
      result = result.filter((d) => d.tipoContratto === dipContrattoFilter);
    }

    return result;
  }, [dipSearch, dipContrattoFilter]);

  // Paginated dipendenti
  const paginatedDipendenti = useMemo(() => {
    const start = (dipPage - 1) * dipPageSize;
    return filteredDipendenti.slice(start, start + dipPageSize);
  }, [filteredDipendenti, dipPage, dipPageSize]);

  // Reset page when filters change
  const handleDipSearchChange = (value: string) => {
    setDipSearch(value);
    setDipPage(1);
    setSelectedIds(new Set());
  };

  const handleDipContrattoChange = (value: string) => {
    setDipContrattoFilter(value);
    setDipPage(1);
    setSelectedIds(new Set());
  };

  // --- Checkbox helpers ---
  const allOnPageSelected =
    paginatedDipendenti.length > 0 &&
    paginatedDipendenti.every((d) => selectedIds.has(d.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      const newSet = new Set(selectedIds);
      paginatedDipendenti.forEach((d) => newSet.delete(d.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginatedDipendenti.forEach((d) => newSet.add(d.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // --- Filtered cedolini ---
  const cedoliniAnni = useMemo(() => {
    const anni = [...new Set(cedolini.map((c) => c.anno))].sort((a, b) => b - a);
    return anni;
  }, []);

  const filteredCedolini = useMemo(() => {
    let result = cedolini;

    if (cedDipendenteFilter !== 'tutti') {
      result = result.filter((c) => c.dipendenteId === cedDipendenteFilter);
    }

    if (cedMeseFilter !== 'tutti') {
      result = result.filter((c) => c.mese === Number(cedMeseFilter));
    }

    if (cedAnnoFilter !== 'tutti') {
      result = result.filter((c) => c.anno === Number(cedAnnoFilter));
    }

    return result;
  }, [cedDipendenteFilter, cedMeseFilter, cedAnnoFilter]);

  // Paginated cedolini
  const paginatedCedolini = useMemo(() => {
    const start = (cedPage - 1) * cedPageSize;
    return filteredCedolini.slice(start, start + cedPageSize);
  }, [filteredCedolini, cedPage, cedPageSize]);

  const handleCedDipendenteChange = (value: string) => {
    setCedDipendenteFilter(value);
    setCedPage(1);
  };

  const handleCedMeseChange = (value: string) => {
    setCedMeseFilter(value);
    setCedPage(1);
  };

  const handleCedAnnoChange = (value: string) => {
    setCedAnnoFilter(value);
    setCedPage(1);
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Payroll"
      description="Gestione dipendenti e cedolini"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => alert('Demo: Esportazione dati payroll in corso...')}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Dialog open={newCedOpen} onOpenChange={setNewCedOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                <FileDown className="h-4 w-4 mr-2" />
                Genera Cedolino
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Genera Cedolino</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleCreateCedolino}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="ced-dipendente">Dipendente *</Label>
                  <Select value={cedFormDipendente} onValueChange={(v) => v && setCedFormDipendente(v)}>
                    <SelectTrigger id="ced-dipendente">
                      <SelectValue placeholder="Seleziona dipendente" />
                    </SelectTrigger>
                    <SelectContent>
                      {dipendenti.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.nome} {d.cognome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ced-mese">Mese</Label>
                    <Input id="ced-mese" type="number" min="1" max="12" placeholder="1-12" value={cedFormMese} onChange={(e) => setCedFormMese(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ced-anno">Anno</Label>
                    <Input id="ced-anno" type="number" min="2020" placeholder="2026" value={cedFormAnno} onChange={(e) => setCedFormAnno(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white" disabled={submitting}>
                  {submitting ? 'Generazione...' : 'Genera'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={newDipOpen} onOpenChange={(open) => { setNewDipOpen(open); if (!open) resetDipForm(); }}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Dipendente
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuovo Dipendente</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleCreateDipendente}
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dip-nome">Nome *</Label>
                    <Input id="dip-nome" placeholder="Nome" required value={dipFormNome} onChange={(e) => setDipFormNome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dip-cognome">Cognome *</Label>
                    <Input id="dip-cognome" placeholder="Cognome" required value={dipFormCognome} onChange={(e) => setDipFormCognome(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-email">Email</Label>
                  <Input id="dip-email" type="email" placeholder="email@esempio.it" value={dipFormEmail} onChange={(e) => setDipFormEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dip-cf">Codice Fiscale</Label>
                    <Input id="dip-cf" placeholder="RSSMRA80A01H501Z" value={dipFormCf} onChange={(e) => setDipFormCf(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dip-nascita">Data Nascita</Label>
                    <Input id="dip-nascita" type="date" value={dipFormNascita} onChange={(e) => setDipFormNascita(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-ruolo">Ruolo Aziendale</Label>
                  <Input id="dip-ruolo" placeholder="es. Sviluppatore, Commerciale..." value={dipFormRuolo} onChange={(e) => setDipFormRuolo(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dip-contratto">Tipo Contratto</Label>
                    <Select value={dipFormContratto} onValueChange={(v) => v && setDipFormContratto(v)}>
                      <SelectTrigger id="dip-contratto">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indeterminato">Indeterminato</SelectItem>
                        <SelectItem value="determinato">Determinato</SelectItem>
                        <SelectItem value="apprendistato">Apprendistato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dip-livello">Livello</Label>
                    <Input id="dip-livello" placeholder="es. 3A, 4, 5..." value={dipFormLivello} onChange={(e) => setDipFormLivello(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-ral">RAL Lorda</Label>
                  <Input id="dip-ral" type="number" step="0.01" min="0" placeholder="0.00" value={dipFormRal} onChange={(e) => setDipFormRal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-iban">IBAN</Label>
                  <Input id="dip-iban" placeholder="IT60X0542811101000000123456" value={dipFormIban} onChange={(e) => setDipFormIban(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-indirizzo">Indirizzo</Label>
                  <Input id="dip-indirizzo" placeholder="Via Roma 1, 00100 Roma (RM)" value={dipFormIndirizzo} onChange={(e) => setDipFormIndirizzo(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white" disabled={submitting}>
                  {submitting ? 'Salvataggio...' : 'Salva Dipendente'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dipendenti.length}</p>
              <p className="text-xs text-muted-foreground">Dipendenti</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(costoMensile)}</p>
              <p className="text-xs text-muted-foreground">Costo Mensile</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(costoAnnuale)}</p>
              <p className="text-xs text-muted-foreground">RAL Totale Annua</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dipendenti.filter((d) => d.tipoContratto === 'indeterminato').length}</p>
              <p className="text-xs text-muted-foreground">Indeterminato</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dipendenti">
        <TabsList>
          <TabsTrigger value="dipendenti">Dipendenti</TabsTrigger>
          <TabsTrigger value="cedolini">Cedolini</TabsTrigger>
        </TabsList>

        <TabsContent value="dipendenti">
          <Card>
            {/* Search, Filter & Bulk Actions Bar */}
            <div className="p-4 space-y-3 border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per nome, cognome, email, ruolo..."
                    value={dipSearch}
                    onChange={(e) => handleDipSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {/* Filter by tipo contratto */}
                <Select value={dipContrattoFilter} onValueChange={(v) => v && handleDipContrattoChange(v)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tipo contratto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti i contratti</SelectItem>
                    <SelectItem value="indeterminato">Indeterminato</SelectItem>
                    <SelectItem value="determinato">Determinato</SelectItem>
                    <SelectItem value="apprendistato">Apprendistato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size} selezionat{selectedIds.size === 1 ? 'o' : 'i'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert(`Demo: Esportazione di ${selectedIds.size} dipendente/i selezionati...`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Esporta selezionati
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    disabled={submitting}
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina selezionati
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 pl-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead className="hidden md:table-cell">Ruolo</TableHead>
                    <TableHead className="hidden lg:table-cell">Contratto</TableHead>
                    <TableHead className="hidden lg:table-cell">Livello</TableHead>
                    <TableHead className="text-right">RAL</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDipendenti.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nessun dipendente trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDipendenti.map((dip) => (
                      <TableRow key={dip.id} className="hover:bg-muted/50">
                        <TableCell className="pl-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={selectedIds.has(dip.id)}
                            onChange={() => toggleSelect(dip.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{dip.nome} {dip.cognome}</p>
                          <p className="text-xs text-muted-foreground">{dip.email}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{dip.ruoloAziendale}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {dip.tipoContratto}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{dip.livello}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {formatCurrency(dip.ralLorda)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog>
                                <DialogTrigger className="inline-flex items-center w-full rounded-sm px-2 py-1.5 text-sm cursor-default hover:bg-accent hover:text-accent-foreground" onClick={() => setSelectedDipendente(dip)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizza
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>{dip.nome} {dip.cognome}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-muted-foreground">Codice Fiscale</p>
                                        <p className="font-medium font-mono text-xs">{dip.codiceFiscale}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Data Nascita</p>
                                        <p className="font-medium">{formatDate(dip.dataNascita)}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Ruolo</p>
                                        <p className="font-medium">{dip.ruoloAziendale}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Contratto</p>
                                        <p className="font-medium capitalize">{dip.tipoContratto}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Data Assunzione</p>
                                        <p className="font-medium">{formatDate(dip.dataAssunzione)}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Livello</p>
                                        <p className="font-medium">{dip.livello}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">RAL Lorda</p>
                                        <p className="font-bold">{formatCurrency(dip.ralLorda)}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">IBAN</p>
                                        <p className="font-medium font-mono text-xs">{dip.iban}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Indirizzo</p>
                                      <p className="font-medium">{dip.indirizzo}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem onClick={() => alert(`Demo: Modifica dipendente "${dip.nome} ${dip.cognome}"`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={submitting}
                                onClick={() => handleDeleteDipendente(dip.id, `${dip.nome} ${dip.cognome}`)}
                              >
                                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                <span className="text-red-600">Elimina</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination
                currentPage={dipPage}
                totalItems={filteredDipendenti.length}
                pageSize={dipPageSize}
                onPageChange={setDipPage}
                onPageSizeChange={setDipPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cedolini">
          <Card>
            {/* Cedolini Filters */}
            <div className="p-4 border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={cedDipendenteFilter} onValueChange={(v) => v && handleCedDipendenteChange(v)}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filtra dipendente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti i dipendenti</SelectItem>
                    {dipendenti.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nome} {d.cognome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={cedMeseFilter} onValueChange={(v) => v && handleCedMeseChange(v)}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Filtra mese" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti i mesi</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={String(m)}>{getMeseLabel(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={cedAnnoFilter} onValueChange={(v) => v && handleCedAnnoChange(v)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Filtra anno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti gli anni</SelectItem>
                    {cedoliniAnni.map((a) => (
                      <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="text-right">Lordo</TableHead>
                    <TableHead className="text-right hidden md:table-cell">INPS</TableHead>
                    <TableHead className="text-right hidden md:table-cell">IRPEF</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                    <TableHead className="text-right">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCedolini.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nessun cedolino trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCedolini.map((ced) => {
                      const dip = dipendenti.find((d) => d.id === ced.dipendenteId);
                      return (
                        <TableRow key={ced.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-sm">
                            {dip ? `${dip.nome} ${dip.cognome}` : '\u2014'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {getMeseLabel(ced.mese)} {ced.anno}
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(ced.lordo)}</TableCell>
                          <TableCell className="text-right text-sm hidden md:table-cell">{formatCurrency(ced.contributiInps)}</TableCell>
                          <TableCell className="text-right text-sm hidden md:table-cell">{formatCurrency(ced.irpef)}</TableCell>
                          <TableCell className="text-right font-semibold text-sm">{formatCurrency(ced.netto)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <Pagination
                currentPage={cedPage}
                totalItems={filteredCedolini.length}
                pageSize={cedPageSize}
                onPageChange={setCedPage}
                onPageSizeChange={setCedPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
