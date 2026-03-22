'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination } from '@/components/ui/pagination';
import { fetchLeads, createLead, updateLead, deleteLead } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Target, DollarSign, TrendingUp, Users, Save, MoreHorizontal, Pencil, Trash2, Copy, Download, Search, Eye } from 'lucide-react';
import type { FaseLead } from '@/lib/types';

const faseBadge: Record<string, string> = { nuovo: 'bg-gray-100 text-gray-800', contattato: 'bg-blue-100 text-blue-800', qualificato: 'bg-purple-100 text-purple-800', proposta: 'bg-yellow-100 text-yellow-800', negoziazione: 'bg-orange-100 text-orange-800', vinto: 'bg-green-100 text-green-800', perso: 'bg-red-100 text-red-800' };
const faseLabel: Record<string, string> = { nuovo: 'Nuovo', contattato: 'Contattato', qualificato: 'Qualificato', proposta: 'Proposta', negoziazione: 'Negoziazione', vinto: 'Vinto', perso: 'Perso' };
const faseBorderColor: Record<string, string> = { nuovo: 'border-t-gray-400', contattato: 'border-t-blue-500', qualificato: 'border-t-purple-500', proposta: 'border-t-yellow-500', negoziazione: 'border-t-orange-500' };
const fonteLabel: Record<string, string> = { sito_web: 'Sito Web', referral: 'Referral', fiera: 'Fiera', social: 'Social', cold_call: 'Cold Call', altro: 'Altro' };
const pipelineFasi: FaseLead[] = ['nuovo', 'contattato', 'qualificato', 'proposta', 'negoziazione'];

export default function LeadPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [leads, loading, refresh] = useServerData(() => fetchLeads(tenantId), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFase, setFilterFase] = useState<string>('tutti');
  const [filterFonte, setFilterFonte] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailLead, setDetailLead] = useState<typeof leads[number] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state for new lead
  const [formAzienda, setFormAzienda] = useState('');
  const [formReferente, setFormReferente] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formValore, setFormValore] = useState('');
  const [formFonte, setFormFonte] = useState<string>('sito_web');

  const resetForm = () => {
    setFormAzienda('');
    setFormReferente('');
    setFormEmail('');
    setFormTelefono('');
    setFormValore('');
    setFormFonte('sito_web');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createLead({
        tenantId,
        azienda: formAzienda,
        referente: formReferente,
        email: formEmail,
        telefono: formTelefono,
        fonte: formFonte as 'sito_web' | 'referral' | 'fiera' | 'social' | 'cold_call' | 'altro',
        fase: 'nuovo',
        valore: formValore || '0',
        probabilita: 20,
        assegnatoA: user?.id || '',
        assegnatoNome: user?.nome ? `${user.nome} ${user.cognome || ''}`.trim() : '',
        dataChiusuraPrevista: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      if (result.ok) {
        resetForm();
        setCreateOpen(false);
        refresh();
      } else {
        alert('Errore: ' + ('error' in result ? result.error : 'Errore sconosciuto'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo lead?')) return;
    setSubmitting(true);
    try {
      const result = await deleteLead(id);
      if (result.ok) {
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
        refresh();
      } else {
        alert('Errore: ' + ('error' in result ? result.error : 'Errore sconosciuto'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} lead?`)) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await deleteLead(id);
      }
      setSelectedIds(new Set());
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhaseChange = async (id: string, newFase: FaseLead) => {
    setSubmitting(true);
    try {
      const result = await updateLead(id, { fase: newFase });
      if (result.ok) {
        refresh();
      } else {
        alert('Errore: ' + ('error' in result ? result.error : 'Errore sconosciuto'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const attivi = leads.filter((l) => l.fase !== 'vinto' && l.fase !== 'perso');
  const valorePipeline = attivi.reduce((s, l) => s + l.valore, 0);
  const valorePesato = attivi.reduce((s, l) => s + l.valore * (l.probabilita / 100), 0);
  const tassoConversione = Math.round((leads.filter((l) => l.fase === 'vinto').length / leads.length) * 100);

  // Filtered leads for Lista tab
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.azienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.referente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFase = filterFase === 'tutti' || l.fase === filterFase;
      const matchFonte = filterFonte === 'tutti' || l.fonte === filterFonte;
      return matchSearch && matchFase && matchFonte;
    });
  }, [searchTerm, filterFase, filterFonte]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleFaseChange = (value: string) => {
    setFilterFase(value);
    setCurrentPage(1);
  };
  const handleFonteChange = (value: string) => {
    setFilterFonte(value);
    setCurrentPage(1);
  };

  // Bulk selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Lead & Pipeline" description="Gestione opportunità commerciali" actions={
      <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90"><Plus className="mr-2 h-4 w-4" />Nuovo Lead</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nuovo Lead</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Azienda *</Label><Input placeholder="Nome azienda" className="mt-1" required value={formAzienda} onChange={(e) => setFormAzienda(e.target.value)} /></div>
              <div><Label>Referente *</Label><Input placeholder="Nome e cognome" className="mt-1" required value={formReferente} onChange={(e) => setFormReferente(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" placeholder="email@azienda.it" className="mt-1" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} /></div>
              <div><Label>Telefono</Label><Input placeholder="+39..." className="mt-1" value={formTelefono} onChange={(e) => setFormTelefono(e.target.value)} /></div>
              <div><Label>Valore Stimato</Label><Input type="number" placeholder="0" className="mt-1" value={formValore} onChange={(e) => setFormValore(e.target.value)} /></div>
              <div><Label>Fonte</Label><Select value={formFonte} onValueChange={(v) => v && setFormFonte(v)}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sito_web">Sito Web</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="fiera">Fiera</SelectItem><SelectItem value="social">Social</SelectItem><SelectItem value="cold_call">Cold Call</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Salva Lead'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    }>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Target className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{leads.length}</p><p className="text-xs text-muted-foreground">Lead Totali</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><DollarSign className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(valorePipeline)}</p><p className="text-xs text-muted-foreground">Valore Pipeline</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><TrendingUp className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{tassoConversione}%</p><p className="text-xs text-muted-foreground">Conversione</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{attivi.length}</p><p className="text-xs text-muted-foreground">Lead Attivi</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList><TabsTrigger value="pipeline">Pipeline</TabsTrigger><TabsTrigger value="lista">Lista</TabsTrigger></TabsList>

        <TabsContent value="pipeline">
          <div className="grid gap-3 lg:grid-cols-5">
            {pipelineFasi.map((fase) => {
              const faseLeads = leads.filter((l) => l.fase === fase);
              return (
                <Card key={fase} className={`border-t-4 ${faseBorderColor[fase]}`}>
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider">{faseLabel[fase]}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{faseLeads.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(faseLeads.reduce((s, l) => s + l.valore, 0))}</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {faseLeads.map((lead) => (
                      <div key={lead.id} className="rounded-lg border p-2.5 bg-background hover:shadow-sm transition-shadow relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{lead.azienda}</p>
                            <p className="text-xs text-muted-foreground">{lead.referente}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0 shrink-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setDetailLead(lead); setDetailOpen(true); }}><Eye className="mr-2 h-4 w-4" />Dettagli</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Copy className="mr-2 h-4 w-4" />Converti a Cliente</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {/* Phase change options */}
                              {pipelineFasi.filter((f) => f !== fase).map((targetFase) => (
                                <DropdownMenuItem key={targetFase} onClick={() => handlePhaseChange(lead.id, targetFase)} disabled={submitting}>
                                  <TrendingUp className="mr-2 h-4 w-4" />Sposta a {faseLabel[targetFase]}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(lead.id)} disabled={submitting} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-green-700">{formatCurrency(lead.valore)}</span>
                          <span className="text-xs text-muted-foreground">{lead.probabilita}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{lead.assegnatoNome}</p>
                      </div>
                    ))}
                    {faseLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nessun lead</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="lista" className="space-y-4">
          {/* Search & Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per azienda, referente..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterFase} onValueChange={(v) => v && handleFaseChange(v)}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutte le fasi</SelectItem>
                    <SelectItem value="nuovo">Nuovo</SelectItem>
                    <SelectItem value="contattato">Contattato</SelectItem>
                    <SelectItem value="qualificato">Qualificato</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="negoziazione">Negoziazione</SelectItem>
                    <SelectItem value="vinto">Vinto</SelectItem>
                    <SelectItem value="perso">Perso</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterFonte} onValueChange={(v) => v && handleFonteChange(v)}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutte le fonti</SelectItem>
                    <SelectItem value="sito_web">Sito Web</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="fiera">Fiera</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
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
                    {submitting ? 'Eliminazione...' : 'Elimina selezionati'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}>
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
                        checked={filteredLeads.length > 0 && selectedIds.size === filteredLeads.length}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Azienda</TableHead>
                    <TableHead className="hidden md:table-cell">Referente</TableHead>
                    <TableHead className="hidden lg:table-cell">Fonte</TableHead>
                    <TableHead>Fase</TableHead>
                    <TableHead className="text-right">Valore</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Prob.</TableHead>
                    <TableHead className="hidden lg:table-cell">Assegnato</TableHead>
                    <TableHead className="w-[80px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((l) => (
                    <TableRow key={l.id} className="hover:bg-muted/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedIds.has(l.id)}
                          onChange={() => toggleSelect(l.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{l.azienda}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{l.referente}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{fonteLabel[l.fonte] || l.fonte}</TableCell>
                      <TableCell><Badge variant="secondary" className={`text-xs ${faseBadge[l.fase]}`}>{faseLabel[l.fase]}</Badge></TableCell>
                      <TableCell className="text-right font-semibold text-sm">{formatCurrency(l.valore)}</TableCell>
                      <TableCell className="text-center hidden md:table-cell text-sm">{l.probabilita}%</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{l.assegnatoNome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => { setDetailLead(l); setDetailOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(l.id)} disabled={submitting}><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Copy className="mr-2 h-4 w-4" />Converti a Cliente</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredLeads.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  Nessun lead trovato con i filtri selezionati
                </div>
              )}
              {/* Pagination */}
              {filteredLeads.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredLeads.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail View Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettaglio Lead</DialogTitle>
          </DialogHeader>
          {detailLead && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Azienda</p>
                  <p className="text-sm font-medium">{detailLead.azienda}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referente</p>
                  <p className="text-sm font-medium">{detailLead.referente}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{detailLead.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefono</p>
                  <p className="text-sm font-medium">{detailLead.telefono}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valore</p>
                  <p className="text-sm font-semibold text-green-700">{formatCurrency(detailLead.valore)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Probabilità</p>
                  <p className="text-sm font-medium">{detailLead.probabilita}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fase</p>
                  <Badge variant="secondary" className={`text-xs ${faseBadge[detailLead.fase]}`}>{faseLabel[detailLead.fase]}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fonte</p>
                  <Badge variant="secondary" className="text-xs">{fonteLabel[detailLead.fonte] || detailLead.fonte}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assegnato a</p>
                  <p className="text-sm font-medium">{detailLead.assegnatoNome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Creazione</p>
                  <p className="text-sm font-medium">{formatDate(detailLead.dataCreazione)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chiusura Prevista</p>
                  <p className="text-sm font-medium">{formatDate(detailLead.dataChiusuraPrevista)}</p>
                </div>
              </div>
              {detailLead.note && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Note</p>
                  <p className="text-sm rounded-md bg-muted/50 p-3">{detailLead.note}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}>
                  <Pencil className="mr-2 h-4 w-4" />Modifica
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { handleDelete(detailLead.id); setDetailOpen(false); }} disabled={submitting}>
                  <Trash2 className="mr-2 h-4 w-4" />Elimina
                </Button>
                <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90" onClick={() => alert('Demo: azione eseguita!')}>
                  <Copy className="mr-2 h-4 w-4" />Converti a Cliente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
