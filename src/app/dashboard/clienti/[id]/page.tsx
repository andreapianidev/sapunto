'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { fetchClienti, fetchOrdini, fetchFatture, fetchEmails, deleteCliente, updateCliente } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import {
  formatCurrency, formatDate, formatPIVA,
  getStatoOrdineColor, getStatoOrdineLabel,
  getStatoSDIColor, getStatoSDILabel,
  getStatoPagamentoColor,
} from '@/lib/utils';
import {
  ArrowLeft, Building2, User as UserIcon, Mail, Phone, MapPin,
  FileText, ShoppingCart, Pencil, Trash2, Euro, Clock, StickyNote,
  Globe, Hash, UserCheck, CalendarDays, Plus, MessageSquare, Loader2,
} from 'lucide-react';

export default function ClienteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [submitting, setSubmitting] = useState(false);
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchClienti(tenantId), fetchOrdini(tenantId), fetchFatture(tenantId), fetchEmails(tenantId)]),
    [[], [], [], []]
  );
  const clienti = allData[0];
  const ordini = allData[1];
  const fatture = allData[2];
  const emails = allData[3];

  // TODO: Replace with Supabase query
  const cliente = clienti.find((c) => c.id === id);
  const clienteOrdini = useMemo(() => ordini.filter((o) => o.clienteId === id), [id, ordini]);
  const clienteFatture = useMemo(() => fatture.filter((f) => f.clienteId === id), [id, fatture]);
  const clienteEmail = useMemo(() => emails.filter((e) => e.clienteId === id), [id, emails]);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  if (!cliente) {
    return (
      <PageContainer title="Cliente non trovato">
        <p className="text-muted-foreground">Il cliente richiesto non esiste.</p>
        <Link href="/dashboard/clienti">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla lista
          </Button>
        </Link>
      </PageContainer>
    );
  }

  // Summary computations
  const totaleFatturato = clienteOrdini
    .filter((o) => o.stato !== 'annullato')
    .reduce((sum, o) => sum + o.totale, 0);

  const fattureInSospeso = clienteFatture
    .filter((f) => f.stato === 'non_pagata' || f.stato === 'scaduta')
    .reduce((sum, f) => sum + f.totale, 0);

  const ultimoOrdine = clienteOrdini.length > 0
    ? clienteOrdini.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
    : null;

  return (
    <PageContainer
      title={cliente.ragioneSociale}
      description={`Cliente dal ${formatDate(cliente.dataCreazione)}`}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/clienti">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          </Link>
          <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifica
          </Button>
          <Button variant="destructive" size="sm" disabled={submitting} onClick={async () => {
            if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
            setSubmitting(true);
            const result = await deleteCliente(id);
            if (result.ok) {
              router.push('/dashboard/clienti');
            } else {
              setSubmitting(false);
            }
          }}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Elimina
          </Button>
        </div>
      }
    >
      {/* Header: Type badge + Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className={cliente.tipo === 'azienda'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800'
          }
        >
          {cliente.tipo === 'azienda' ? (
            <Building2 className="mr-1 h-3 w-3" />
          ) : (
            <UserIcon className="mr-1 h-3 w-3" />
          )}
          {cliente.tipo === 'azienda' ? 'Azienda' : 'Privato'}
        </Badge>
        {cliente.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Totale ordini</p>
                <p className="text-2xl font-bold">{clienteOrdini.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fatturato totale</p>
                <p className="text-2xl font-bold">{formatCurrency(totaleFatturato)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fatture in sospeso</p>
                <p className="text-2xl font-bold">{formatCurrency(fattureInSospeso)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ultimo ordine</p>
                <p className="text-lg font-bold">
                  {ultimoOrdine ? formatDate(ultimoOrdine.data) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="anagrafica">
        <TabsList>
          <TabsTrigger value="anagrafica">
            <Building2 className="mr-1.5 h-4 w-4" />
            Anagrafica
          </TabsTrigger>
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
            Comunicazioni ({clienteEmail.length})
          </TabsTrigger>
          <TabsTrigger value="note">
            <StickyNote className="mr-1.5 h-4 w-4" />
            Note
          </TabsTrigger>
        </TabsList>

        {/* Tab: Anagrafica */}
        <TabsContent value="anagrafica">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {cliente.tipo === 'azienda' ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
                Dati Anagrafici
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Ragione Sociale */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ragione Sociale</p>
                  <p className="text-sm font-medium">{cliente.ragioneSociale}</p>
                </div>

                {/* Tipo */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</p>
                  <p className="text-sm font-medium capitalize">{cliente.tipo}</p>
                </div>

                {/* Partita IVA */}
                {cliente.partitaIva && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Partita IVA
                    </p>
                    <p className="text-sm font-medium font-mono">{formatPIVA(cliente.partitaIva)}</p>
                  </div>
                )}

                {/* Codice Fiscale */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Codice Fiscale
                  </p>
                  <p className="text-sm font-medium font-mono">{cliente.codiceFiscale}</p>
                </div>

                {/* Indirizzo */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Indirizzo
                  </p>
                  <p className="text-sm font-medium">{cliente.indirizzo}</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente.cap} {cliente.citta} ({cliente.provincia})
                  </p>
                </div>

                {/* Telefono */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Telefono
                  </p>
                  <p className="text-sm font-medium">{cliente.telefono}</p>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-sm font-medium">{cliente.email}</p>
                </div>

                {/* PEC */}
                {cliente.pec && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      PEC
                    </p>
                    <p className="text-sm font-medium">{cliente.pec}</p>
                  </div>
                )}

                {/* Codice Destinatario */}
                {cliente.codiceDestinatario && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Codice Destinatario</p>
                    <p className="text-sm font-medium font-mono">{cliente.codiceDestinatario}</p>
                  </div>
                )}

                {/* Referente */}
                {cliente.referente && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      Referente
                    </p>
                    <p className="text-sm font-medium">{cliente.referente}</p>
                  </div>
                )}

                {/* Data Creazione */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Data Creazione
                  </p>
                  <p className="text-sm font-medium">{formatDate(cliente.dataCreazione)}</p>
                </div>
              </div>

              {/* Tags */}
              {cliente.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cliente.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Note del cliente */}
              {cliente.note && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Note</p>
                  <p className="text-sm text-muted-foreground">{cliente.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ordini */}
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
                <div className="py-8 text-center text-muted-foreground">
                  Nessun ordine per questo cliente
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Fatture */}
        <TabsContent value="fatture">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Scadenza</TableHead>
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
                      <TableCell>{formatDate(fattura.dataScadenza)}</TableCell>
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
                <div className="py-8 text-center text-muted-foreground">
                  Nessuna fattura per questo cliente
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Comunicazioni */}
        <TabsContent value="comunicazioni">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {clienteEmail.map((email) => (
                <div key={email.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    email.tipo === 'ricevuta' ? 'bg-blue-50 text-blue-600' :
                    email.tipo === 'inviata' ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{email.oggetto}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {email.tipo === 'ricevuta' ? 'Ricevuta' : email.tipo === 'inviata' ? 'Inviata' : 'Bozza'}
                        </Badge>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(email.data)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {email.tipo === 'ricevuta' ? `Da: ${email.da}` : `A: ${email.a}`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {email.corpo.slice(0, 150)}...
                    </p>
                  </div>
                </div>
              ))}
              {clienteEmail.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  Nessuna comunicazione per questo cliente
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Note */}
        <TabsContent value="note">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Note
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-[#1a2332] hover:bg-[#1a2332]/90"
                  onClick={async () => {
                    const nota = prompt('Inserisci la nota:');
                    if (nota) {
                      const currentNote = cliente.note ? `${cliente.note}\n\n---\n\n${nota}` : nota;
                      await updateCliente(id, { note: currentNote });
                      refresh();
                    }
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi nota
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cliente.note ? (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cliente.dataCreazione)} - Nota iniziale
                      </p>
                    </div>
                    <p className="text-sm">{cliente.note}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Demo notes to show the UI works */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium">Primo contatto</p>
                      <p className="text-xs text-muted-foreground">{formatDate(cliente.dataCreazione)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliente acquisito tramite passaparola. Interessato ai nostri prodotti di networking e domotica.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium">Follow-up commerciale</p>
                      <p className="text-xs text-muted-foreground">{formatDate(new Date().toISOString())}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inviato listino aggiornato e condizioni commerciali. Attesa riscontro per ordine.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
