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
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatPIVA, formatCurrency } from '@/lib/utils';
import { Building2, Users, FileText, CreditCard, Save, Plus, Loader2, Trash2 } from 'lucide-react';

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
                  <Input defaultValue={tenant.codiceDestinatario} className="mt-1" />
                </div>
                <div>
                  <Label>PEC per Fatturazione</Label>
                  <Input defaultValue={tenant.pec} className="mt-1" />
                </div>
                <div>
                  <Label>Regime Fiscale</Label>
                  <Input defaultValue="RF01 - Ordinario" className="mt-1" readOnly />
                </div>
                <div>
                  <Label>Progressivo Fatture</Label>
                  <Input defaultValue="FE-2026-0040" className="mt-1" readOnly />
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Certificato Firma Digitale</p>
                <div className="p-4 border border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Certificato attivo — Scadenza: 15/12/2027
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Aggiorna Certificato
                  </Button>
                </div>
              </div>
              <Button className="bg-[#1a2332] hover:bg-[#1a2332]/90">
                <Save className="mr-2 h-4 w-4" />
                Salva Configurazione
              </Button>
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
