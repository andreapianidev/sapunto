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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { fetchTenants, fetchPiani, updateTenantAdmin, createTenantAdmin } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCurrency, formatPIVA } from '@/lib/utils';
import { Plus, MoreHorizontal, Pause, Edit, Search, Eye, Building2, Users, DollarSign, Loader2 } from 'lucide-react';
import type { Tenant } from '@/lib/types';

export default function TenantPage() {
  const { user } = useAuth();
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchTenants(), fetchPiani()]),
    [[], []]
  );
  const tenants = allData[0];
  const piani = allData[1];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPiano, setFilterPiano] = useState<string>('tutti');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailTenant, setDetailTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    ragioneSociale: '', partitaIva: '', codiceFiscale: '', email: '', pec: '',
    codiceDestinatario: '0000000', indirizzo: '', citta: '', cap: '', provincia: '',
    telefono: '', piano: 'explore' as 'express' | 'explore' | 'experience',
    adminNome: '', adminCognome: '', adminEmail: '',
  });

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch = t.ragioneSociale.toLowerCase().includes(searchTerm.toLowerCase()) || t.citta.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPiano = filterPiano === 'tutti' || t.piano === filterPiano;
      const matchStato = filterStato === 'tutti' || t.stato === filterStato;
      return matchSearch && matchPiano && matchStato;
    });
  }, [searchTerm, filterPiano, filterStato, tenants]);

  const mrrTotale = tenants.reduce((s, t) => {
    const piano = piani.find((p) => p.id === t.piano);
    return s + (piano ? piano.prezzoMensile : 0);
  }, 0);

  const handleSuspend = async (tenantId: string) => {
    if (!confirm('Sei sicuro di voler sospendere questo tenant?')) return;
    setSubmitting(true);
    const t = tenants.find(t => t.id === tenantId);
    if (t) {
      await updateTenantAdmin(tenantId, { stato: t.stato === 'sospeso' ? 'attivo' : 'sospeso' });
      refresh();
    }
    setSubmitting(false);
  };

  const handleChangePlan = async (tenantId: string, newPiano: string) => {
    setSubmitting(true);
    await updateTenantAdmin(tenantId, { piano: newPiano });
    refresh();
    setSubmitting(false);
  };

  const handleCreateTenant = async () => {
    setSubmitting(true);
    const result = await createTenantAdmin(createForm);
    if (result.ok) {
      setShowCreate(false);
      setCreateForm({
        ragioneSociale: '', partitaIva: '', codiceFiscale: '', email: '', pec: '',
        codiceDestinatario: '0000000', indirizzo: '', citta: '', cap: '', provincia: '',
        telefono: '', piano: 'explore',
        adminNome: '', adminCognome: '', adminEmail: '',
      });
      refresh();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Gestione Tenant"
      description={`${tenants.length} aziende registrate`}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Tenant
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Building2 className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{tenants.length}</p><p className="text-xs text-muted-foreground">Tenant Totali</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><Building2 className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{tenants.filter((t) => t.stato === 'attivo').length}</p><p className="text-xs text-muted-foreground">Attivi</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{tenants.reduce((s, t) => s + t.utentiAttivi, 0)}</p><p className="text-xs text-muted-foreground">Utenti Totali</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><DollarSign className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(mrrTotale)}</p><p className="text-xs text-muted-foreground">MRR Totale</p></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cerca tenant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
        <Select value={filterPiano} onValueChange={(v) => v && setFilterPiano(v)}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti i Piani</SelectItem><SelectItem value="express">Express</SelectItem><SelectItem value="explore">Explore</SelectItem><SelectItem value="experience">Experience</SelectItem></SelectContent></Select>
        <Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti gli Stati</SelectItem><SelectItem value="attivo">Attivo</SelectItem><SelectItem value="sospeso">Sospeso</SelectItem><SelectItem value="trial">Trial</SelectItem></SelectContent></Select>
      </div></CardContent></Card>

      {/* Detail dialog */}
      <Dialog open={!!detailTenant} onOpenChange={(open) => !open && setDetailTenant(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Dettaglio Tenant</DialogTitle></DialogHeader>
          {detailTenant && (() => {
            const piano = piani.find((p) => p.id === detailTenant.piano);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a2332] text-white font-bold text-lg">
                    {detailTenant.ragioneSociale.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{detailTenant.ragioneSociale}</p>
                    <p className="text-sm text-muted-foreground">{detailTenant.citta}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Partita IVA</p><p className="font-medium font-mono">{formatPIVA(detailTenant.partitaIva)}</p></div>
                  <div><p className="text-muted-foreground">Stato</p><Badge variant="secondary" className={`text-xs ${detailTenant.stato === 'attivo' ? 'bg-green-100 text-green-800' : detailTenant.stato === 'sospeso' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{detailTenant.stato}</Badge></div>
                  <div><p className="text-muted-foreground">Piano</p>
                    <Select defaultValue={detailTenant.piano} onValueChange={(v) => v && handleChangePlan(detailTenant.id, v)}>
                      <SelectTrigger className="w-[140px] h-7"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="express">Express</SelectItem><SelectItem value="explore">Explore</SelectItem><SelectItem value="experience">Experience</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><p className="text-muted-foreground">MRR</p><p className="font-bold">{piano ? formatCurrency(piano.prezzoMensile) : '—'}/mese</p></div>
                  <div><p className="text-muted-foreground">Utenti</p><p className="font-medium">{detailTenant.utentiAttivi} / {detailTenant.maxUtenti}</p></div>
                  <div><p className="text-muted-foreground">Data Creazione</p><p className="font-medium">{formatDate(detailTenant.dataCreazione)}</p></div>
                  <div><p className="text-muted-foreground">Email</p><p className="font-medium">{detailTenant.email}</p></div>
                  <div><p className="text-muted-foreground">Telefono</p><p className="font-medium">{detailTenant.telefono || '—'}</p></div>
                </div>
                {piano && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-semibold mb-2">Limiti Piano {piano.nome}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="bg-muted/50 rounded p-2 text-center"><p className="font-semibold text-foreground">{piano.maxUtenti}</p><p>Max Utenti</p></div>
                      <div className="bg-muted/50 rounded p-2 text-center"><p className="font-semibold text-foreground">{piano.maxClienti}</p><p>Max Clienti</p></div>
                      <div className="bg-muted/50 rounded p-2 text-center"><p className="font-semibold text-foreground">{piano.maxFatture}</p><p>Max Fatture</p></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create Tenant dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuovo Tenant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Dati Azienda</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ragione Sociale *</Label><Input value={createForm.ragioneSociale} onChange={(e) => setCreateForm({ ...createForm, ragioneSociale: e.target.value })} /></div>
              <div><Label>Partita IVA *</Label><Input value={createForm.partitaIva} onChange={(e) => setCreateForm({ ...createForm, partitaIva: e.target.value })} placeholder="12345678901" /></div>
              <div><Label>Codice Fiscale</Label><Input value={createForm.codiceFiscale} onChange={(e) => setCreateForm({ ...createForm, codiceFiscale: e.target.value })} /></div>
              <div><Label>Email Azienda *</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} /></div>
              <div><Label>PEC</Label><Input value={createForm.pec} onChange={(e) => setCreateForm({ ...createForm, pec: e.target.value })} /></div>
              <div><Label>Codice Destinatario</Label><Input value={createForm.codiceDestinatario} onChange={(e) => setCreateForm({ ...createForm, codiceDestinatario: e.target.value })} /></div>
              <div><Label>Telefono</Label><Input value={createForm.telefono} onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })} /></div>
              <div>
                <Label>Piano *</Label>
                <Select value={createForm.piano} onValueChange={(v) => setCreateForm({ ...createForm, piano: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="express">Express — €69/anno</SelectItem>
                    <SelectItem value="explore">Explore — €69/mese</SelectItem>
                    <SelectItem value="experience">Experience — €149/mese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2"><Label>Indirizzo</Label><Input value={createForm.indirizzo} onChange={(e) => setCreateForm({ ...createForm, indirizzo: e.target.value })} /></div>
              <div><Label>Città</Label><Input value={createForm.citta} onChange={(e) => setCreateForm({ ...createForm, citta: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>CAP</Label><Input value={createForm.cap} onChange={(e) => setCreateForm({ ...createForm, cap: e.target.value })} /></div>
                <div><Label>Prov.</Label><Input value={createForm.provincia} onChange={(e) => setCreateForm({ ...createForm, provincia: e.target.value })} maxLength={2} /></div>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4">Amministratore Tenant (verrà creato automaticamente)</p>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Nome *</Label><Input value={createForm.adminNome} onChange={(e) => setCreateForm({ ...createForm, adminNome: e.target.value })} /></div>
                <div><Label>Cognome *</Label><Input value={createForm.adminCognome} onChange={(e) => setCreateForm({ ...createForm, adminCognome: e.target.value })} /></div>
                <div><Label>Email *</Label><Input type="email" value={createForm.adminEmail} onChange={(e) => setCreateForm({ ...createForm, adminEmail: e.target.value })} /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annulla</Button>
            <Button
              onClick={handleCreateTenant}
              disabled={submitting || !createForm.ragioneSociale || !createForm.partitaIva || !createForm.email || !createForm.adminNome || !createForm.adminCognome || !createForm.adminEmail}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crea Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Azienda</TableHead>
                <TableHead className="hidden md:table-cell">P.IVA</TableHead>
                <TableHead>Piano</TableHead>
                <TableHead className="hidden lg:table-cell">Utenti</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="hidden lg:table-cell">Creazione</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((t) => {
                const piano = piani.find((p) => p.id === t.piano);
                return (
                  <TableRow key={t.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2332] text-white font-bold text-xs">
                          {t.ragioneSociale.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{t.ragioneSociale}</p>
                          <p className="text-xs text-muted-foreground">{t.citta}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{formatPIVA(t.partitaIva)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${
                        t.piano === 'experience' ? 'bg-purple-100 text-purple-800' :
                        t.piano === 'explore' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.piano.charAt(0).toUpperCase() + t.piano.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {t.utentiAttivi}/{t.maxUtenti}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${
                        t.stato === 'attivo' ? 'bg-green-100 text-green-800' :
                        t.stato === 'sospeso' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.stato.charAt(0).toUpperCase() + t.stato.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{formatDate(t.dataCreazione)}</TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {piano ? formatCurrency(piano.prezzoMensile) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailTenant(t)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setDetailTenant(t); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifica Piano
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspend(t.id)} disabled={submitting}>
                              <Pause className="mr-2 h-4 w-4" />
                              {t.stato === 'sospeso' ? 'Riattiva' : 'Sospendi'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
