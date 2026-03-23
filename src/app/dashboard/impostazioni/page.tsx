'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { fetchUsersByTenantId, fetchPiani, updateTenantAdmin, createUserAdmin, updateUserAdmin, deleteUserAdmin } from '@/lib/actions/data';
import { salvaConfigurazioneSdi, fetchConfigurazioneSdi } from '@/lib/actions/sdi';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatPIVA, formatCurrency } from '@/lib/utils';
import { Building2, Users, FileText, CreditCard, Save, Plus, Loader2, Trash2, CheckCircle } from 'lucide-react';

export default function ImpostazioniPage() {
  const { tenant, user, refreshSession } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchUsersByTenantId(tenantId), fetchPiani()]),
    [[], []]
  );
  const users = allData[0];
  const piani = allData[1];

  const [saving, setSaving] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ nome: '', cognome: '', email: '', ruolo: 'utente' as 'tenant_admin' | 'utente' });

  // SDI Configuration state
  const [sdiProvider, setSdiProvider] = useState<string>('simulato');
  const [sdiApiKey, setSdiApiKey] = useState('');
  const [sdiApiSecret, setSdiApiSecret] = useState('');
  const [sdiRegime, setSdiRegime] = useState('RF01');
  const [sdiPagamento, setSdiPagamento] = useState('MP05');
  const [sdiIban, setSdiIban] = useState('');
  const [sdiSaving, setSdiSaving] = useState(false);
  const [sdiSaved, setSdiSaved] = useState(false);
  const [sdiLoaded, setSdiLoaded] = useState(false);

  // Load SDI config on mount
  if (!sdiLoaded && tenantId) {
    setSdiLoaded(true);
    fetchConfigurazioneSdi(tenantId).then((config) => {
      if (config) {
        setSdiProvider(config.provider);
        setSdiApiKey(config.apiKey || '');
        setSdiApiSecret(config.apiSecret || '');
        setSdiRegime(config.regimeFiscale || 'RF01');
        setSdiPagamento(config.modalitaPagamentoDefault || 'MP05');
        setSdiIban(config.ibanBeneficiario || '');
      }
    });
  }

  const handleSaveSdiConfig = async () => {
    setSdiSaving(true);
    setSdiSaved(false);
    try {
      const result = await salvaConfigurazioneSdi(tenantId, {
        provider: sdiProvider as 'simulato' | 'fattura24' | 'fattureincloud' | 'manuale',
        apiKey: sdiApiKey || undefined,
        apiSecret: sdiApiSecret || undefined,
        regimeFiscale: sdiRegime,
        modalitaPagamentoDefault: sdiPagamento,
        ibanBeneficiario: sdiIban || undefined,
      });
      if (result.ok) {
        setSdiSaved(true);
        setTimeout(() => setSdiSaved(false), 3000);
      } else {
        alert(result.error || 'Errore nel salvataggio');
      }
    } finally {
      setSdiSaving(false);
    }
  };

  if (!tenant) return null;
  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  const tenantUsers = users;
  const piano = piani.find((p) => p.id === tenant.piano);

  const handleSaveAzienda = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await updateTenantAdmin(tenant.id, {
      ragioneSociale: form.get('ragioneSociale') as string,
      telefono: form.get('telefono') as string,
      email: form.get('email') as string,
      pec: form.get('pec') as string,
    });
    await refreshSession();
    setSaving(false);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await createUserAdmin({
      tenantId,
      nome: inviteForm.nome,
      cognome: inviteForm.cognome,
      email: inviteForm.email,
      ruolo: inviteForm.ruolo,
    });
    if (result.ok) {
      setShowInviteDialog(false);
      setInviteForm({ nome: '', cognome: '', email: '', ruolo: 'utente' });
      refresh();
    }
    setSaving(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) return;
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    await deleteUserAdmin(userId);
    refresh();
  };

  const handleToggleUser = async (userId: string, attivo: boolean) => {
    await updateUserAdmin(userId, { attivo: !attivo });
    refresh();
  };

  return (
    <PageContainer title="Impostazioni" description="Configurazione azienda e account">
      <Tabs defaultValue="azienda">
        <TabsList>
          <TabsTrigger value="azienda">
            <Building2 className="mr-1.5 h-4 w-4" />
            Azienda
          </TabsTrigger>
          <TabsTrigger value="utenti">
            <Users className="mr-1.5 h-4 w-4" />
            Utenti
          </TabsTrigger>
          <TabsTrigger value="fatturazione">
            <FileText className="mr-1.5 h-4 w-4" />
            Fatturazione
          </TabsTrigger>
          <TabsTrigger value="piano">
            <CreditCard className="mr-1.5 h-4 w-4" />
            Piano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="azienda">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dati Azienda</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAzienda} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Ragione Sociale</Label>
                    <Input name="ragioneSociale" defaultValue={tenant.ragioneSociale} className="mt-1" />
                  </div>
                  <div>
                    <Label>Partita IVA</Label>
                    <Input defaultValue={formatPIVA(tenant.partitaIva)} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label>Codice Fiscale</Label>
                    <Input defaultValue={tenant.codiceFiscale} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label>Telefono</Label>
                    <Input name="telefono" defaultValue={tenant.telefono} className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input name="email" defaultValue={tenant.email} className="mt-1" />
                  </div>
                  <div>
                    <Label>PEC</Label>
                    <Input name="pec" defaultValue={tenant.pec} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Indirizzo</Label>
                    <Input defaultValue={`${tenant.indirizzo}, ${tenant.cap} ${tenant.citta} (${tenant.provincia})`} className="mt-1" readOnly />
                  </div>
                </div>
                <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salva Modifiche
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utenti">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Utenti ({tenantUsers.length}/{tenant.maxUtenti})</CardTitle>
              <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90" onClick={() => setShowInviteDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invita Utente
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome} {u.cognome}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {u.ruolo === 'tenant_admin' ? 'Admin' : 'Operatore'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs cursor-pointer ${u.attivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          onClick={() => handleToggleUser(u.id, u.attivo)}>
                          {u.attivo ? 'Attivo' : 'Disattivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {u.id !== user?.id && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>Invita Utente</DialogTitle></DialogHeader>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Nome *</Label><Input value={inviteForm.nome} onChange={(e) => setInviteForm(f => ({ ...f, nome: e.target.value }))} required className="mt-1" /></div>
                  <div><Label>Cognome *</Label><Input value={inviteForm.cognome} onChange={(e) => setInviteForm(f => ({ ...f, cognome: e.target.value }))} required className="mt-1" /></div>
                  <div><Label>Email *</Label><Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))} required className="mt-1" /></div>
                  <div>
                    <Label>Ruolo</Label>
                    <Select value={inviteForm.ruolo} onValueChange={(v) => setInviteForm(f => ({ ...f, ruolo: v as 'tenant_admin' | 'utente' }))}>
                      <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant_admin">Amministratore</SelectItem>
                        <SelectItem value="utente">Operatore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Invita
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="fatturazione">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurazione Fatturazione Elettronica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Codice Destinatario SDI</Label>
                  <Input defaultValue={tenant.codiceDestinatario} className="mt-1" readOnly />
                </div>
                <div>
                  <Label>PEC per Fatturazione</Label>
                  <Input defaultValue={tenant.pec} className="mt-1" readOnly />
                </div>
              </div>
              <Separator />
              <p className="text-sm font-semibold">Provider Intermediario SDI</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Provider</Label>
                  <Select value={sdiProvider} onValueChange={(v) => v && setSdiProvider(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simulato">Simulato (Demo/Test)</SelectItem>
                      <SelectItem value="fattura24">Fattura24</SelectItem>
                      <SelectItem value="fattureincloud">FattureInCloud</SelectItem>
                      <SelectItem value="manuale">Manuale (XML scaricabile)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Regime Fiscale</Label>
                  <Select value={sdiRegime} onValueChange={(v) => v && setSdiRegime(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RF01">RF01 - Ordinario</SelectItem>
                      <SelectItem value="RF02">RF02 - Contribuenti minimi</SelectItem>
                      <SelectItem value="RF04">RF04 - Agricoltura</SelectItem>
                      <SelectItem value="RF19">RF19 - Forfettario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(sdiProvider === 'fattura24' || sdiProvider === 'fattureincloud') && (
                  <>
                    <div>
                      <Label>API Key</Label>
                      <Input type="password" placeholder="Inserisci API Key" value={sdiApiKey} onChange={(e) => setSdiApiKey(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>API Secret</Label>
                      <Input type="password" placeholder="Inserisci API Secret" value={sdiApiSecret} onChange={(e) => setSdiApiSecret(e.target.value)} className="mt-1" />
                    </div>
                  </>
                )}
                <div>
                  <Label>Metodo Pagamento Default</Label>
                  <Select value={sdiPagamento} onValueChange={(v) => v && setSdiPagamento(v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MP05">MP05 - Bonifico Bancario</SelectItem>
                      <SelectItem value="MP01">MP01 - Contanti</SelectItem>
                      <SelectItem value="MP08">MP08 - Carta di Credito</SelectItem>
                      <SelectItem value="MP12">MP12 - Ri.Ba.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>IBAN Beneficiario</Label>
                  <Input placeholder="IT60X0542811101000000123456" value={sdiIban} onChange={(e) => setSdiIban(e.target.value)} className="mt-1" />
                </div>
              </div>
              {sdiProvider === 'simulato' && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Il provider simulato replica il comportamento del SDI per test e demo. Gli stati delle fatture progrediranno automaticamente (inviata → consegnata → accettata).
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button className="bg-[#1a2332] hover:bg-[#1a2332]/90" onClick={handleSaveSdiConfig} disabled={sdiSaving}>
                  {sdiSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salva Configurazione
                </Button>
                {sdiSaved && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Salvato
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="piano">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Piano Attivo</CardTitle>
            </CardHeader>
            <CardContent>
              {piano && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1a2332] text-white rounded-lg">
                    <div>
                      <p className="text-lg font-bold">Piano {piano.nome}</p>
                      <p className="text-sm text-blue-200">
                        {formatCurrency(piano.prezzoMensile)}/mese
                      </p>
                    </div>
                    <Badge className="bg-white text-[#1a2332]">Attivo</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-lg font-bold">{tenant.utentiAttivi}/{piano.maxUtenti}</p>
                      <p className="text-xs text-muted-foreground">Utenti</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-lg font-bold">{piano.maxClienti === -1 ? 'Illim.' : piano.maxClienti}</p>
                      <p className="text-xs text-muted-foreground">Max Clienti</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-lg font-bold">{piano.maxFatture === -1 ? 'Illim.' : piano.maxFatture}</p>
                      <p className="text-xs text-muted-foreground">Max Fatture/mese</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Funzionalità incluse</p>
                    <div className="flex flex-wrap gap-2">
                      {piano.funzionalita.map((f) => (
                        <Badge key={f} variant="secondary">{f}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => window.location.href = '/checkout'}>
                    Cambia Piano
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
