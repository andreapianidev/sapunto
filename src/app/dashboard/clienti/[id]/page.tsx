'use client';

import { use } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { clienti, ordini, fatture, emails, appuntamenti } from '@/lib/mockdata';
import {
  formatCurrency, formatDate, formatPIVA,
  getStatoOrdineColor, getStatoOrdineLabel,
  getStatoSDIColor, getStatoSDILabel,
  getStatoPagamentoColor,
} from '@/lib/utils';
import {
  ArrowLeft, Building2, User as UserIcon, Mail, Phone, MapPin,
  FileText, ShoppingCart, Calendar, Edit,
} from 'lucide-react';

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // TODO: Replace with Supabase query
  const cliente = clienti.find((c) => c.id === id);
  const clienteOrdini = ordini.filter((o) => o.clienteId === id);
  const clienteFatture = fatture.filter((f) => f.clienteId === id);
  const clienteEmail = emails.filter((e) => e.clienteId === id);
  const clienteAppuntamenti = appuntamenti.filter((a) => a.clienteId === id);

  if (!cliente) {
    return (
      <PageContainer title="Cliente non trovato">
        <p>Il cliente richiesto non esiste.</p>
        <Link href="/dashboard/clienti">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla lista
          </Button>
        </Link>
      </PageContainer>
    );
  }

  const totaleFatturato = clienteOrdini
    .filter((o) => o.stato === 'completato')
    .reduce((sum, o) => sum + o.totale, 0);

  return (
    <PageContainer
      title={cliente.ragioneSociale}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/clienti">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          </Link>
          <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
        </div>
      }
    >
      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {cliente.tipo === 'azienda' ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
              Anagrafica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Ragione Sociale</p>
                  <p className="font-medium text-sm">{cliente.ragioneSociale}</p>
                </div>
                {cliente.partitaIva && (
                  <div>
                    <p className="text-xs text-muted-foreground">Partita IVA</p>
                    <p className="font-medium text-sm">{formatPIVA(cliente.partitaIva)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Codice Fiscale</p>
                  <p className="font-medium text-sm">{cliente.codiceFiscale}</p>
                </div>
                {cliente.referente && (
                  <div>
                    <p className="text-xs text-muted-foreground">Referente</p>
                    <p className="font-medium text-sm">{cliente.referente}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{cliente.indirizzo}</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente.cap} {cliente.citta} ({cliente.provincia})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{cliente.telefono}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{cliente.email}</p>
                </div>
                {cliente.pec && (
                  <div>
                    <p className="text-xs text-muted-foreground">PEC</p>
                    <p className="text-sm">{cliente.pec}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {cliente.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Riepilogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Fatturato Totale</p>
              <p className="text-2xl font-bold">{formatCurrency(totaleFatturato)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">{clienteOrdini.length}</p>
                <p className="text-xs text-muted-foreground">Ordini</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">{clienteFatture.length}</p>
                <p className="text-xs text-muted-foreground">Fatture</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cliente dal</p>
              <p className="text-sm font-medium">{formatDate(cliente.dataCreazione)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ordini">
        <TabsList>
          <TabsTrigger value="ordini">
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Ordini ({clienteOrdini.length})
          </TabsTrigger>
          <TabsTrigger value="fatture">
            <FileText className="mr-1.5 h-4 w-4" />
            Fatture ({clienteFatture.length})
          </TabsTrigger>
          <TabsTrigger value="comunicazioni">
            <Mail className="mr-1.5 h-4 w-4" />
            Email ({clienteEmail.length})
          </TabsTrigger>
          <TabsTrigger value="appuntamenti">
            <Calendar className="mr-1.5 h-4 w-4" />
            Appuntamenti ({clienteAppuntamenti.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ordini">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Canale</TableHead>
                    <TableHead className="text-right">Totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clienteOrdini.map((ordine) => (
                    <TableRow key={ordine.id}>
                      <TableCell className="font-medium">{ordine.numero}</TableCell>
                      <TableCell>{formatDate(ordine.data)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatoOrdineColor(ordine.stato)}>
                          {getStatoOrdineLabel(ordine.stato)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{ordine.canale}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(ordine.totale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {clienteOrdini.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">Nessun ordine</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fatture">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Stato SDI</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clienteFatture.map((fattura) => (
                    <TableRow key={fattura.id}>
                      <TableCell className="font-medium">{fattura.numero}</TableCell>
                      <TableCell>{formatDate(fattura.data)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatoSDIColor(fattura.statoSDI)}>
                          {getStatoSDILabel(fattura.statoSDI)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatoPagamentoColor(fattura.stato)}>
                          {fattura.stato.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(fattura.totale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {clienteFatture.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">Nessuna fattura</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicazioni">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {clienteEmail.map((email) => (
                <div key={email.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    email.tipo === 'ricevuta' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{email.oggetto}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(email.data)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {email.tipo === 'ricevuta' ? `Da: ${email.da}` : `A: ${email.a}`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {email.corpo.slice(0, 120)}...
                    </p>
                  </div>
                </div>
              ))}
              {clienteEmail.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">Nessuna email</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appuntamenti">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {clienteAppuntamenti.map((app) => (
                <div key={app.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <span className="text-[10px] font-bold">{formatDate(app.data).slice(0, 5)}</span>
                    <span className="text-[10px]">{app.oraInizio}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{app.titolo}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.oraInizio} - {app.oraFine} | {app.operatoreNome}
                    </p>
                    {app.luogo && (
                      <p className="text-xs text-muted-foreground">{app.luogo}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className={`ml-auto text-[10px] ${
                    app.stato === 'confermato' ? 'bg-green-100 text-green-800' :
                    app.stato === 'in_attesa' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.stato.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {clienteAppuntamenti.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">Nessun appuntamento</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
