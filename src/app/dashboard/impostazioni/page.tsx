'use client';

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
import { useAuth } from '@/lib/auth-context';
import { fetchUsersByTenantId, fetchPiani } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatPIVA, formatCurrency } from '@/lib/utils';
import { Building2, Users, FileText, CreditCard, Save } from 'lucide-react';

export default function ImpostazioniPage() {
  const { tenant, user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading] = useServerData(
    () => Promise.all([fetchUsersByTenantId(tenantId), fetchPiani()]),
    [[], []]
  );
  const users = allData[0];
  const piani = allData[1];

  if (!tenant) return null;
  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  const tenantUsers = users;
  const piano = piani.find((p) => p.id === tenant.piano);

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
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ragione Sociale</Label>
                  <Input defaultValue={tenant.ragioneSociale} className="mt-1" />
                </div>
                <div>
                  <Label>Partita IVA</Label>
                  <Input defaultValue={formatPIVA(tenant.partitaIva)} className="mt-1" />
                </div>
                <div>
                  <Label>Codice Fiscale</Label>
                  <Input defaultValue={tenant.codiceFiscale} className="mt-1" />
                </div>
                <div>
                  <Label>Telefono</Label>
                  <Input defaultValue={tenant.telefono} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue={tenant.email} className="mt-1" />
                </div>
                <div>
                  <Label>PEC</Label>
                  <Input defaultValue={tenant.pec} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Indirizzo</Label>
                  <Input defaultValue={`${tenant.indirizzo}, ${tenant.cap} ${tenant.citta} (${tenant.provincia})`} className="mt-1" />
                </div>
              </div>
              <Button className="bg-[#1a2332] hover:bg-[#1a2332]/90">
                <Save className="mr-2 h-4 w-4" />
                Salva Modifiche
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utenti">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Utenti ({tenantUsers.length}/{tenant.maxUtenti})</CardTitle>
              <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome} {user.cognome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {user.ruolo === 'tenant_admin' ? 'Admin' : 'Operatore'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${user.attivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.attivo ? 'Attivo' : 'Disattivo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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

                  <Button variant="outline">
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
