'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { dipendenti, cedolini } from '@/lib/mockdata';
import { formatCurrency, formatDate, getMeseLabel } from '@/lib/utils';
import { Users, Wallet, Eye, FileDown } from 'lucide-react';
import type { Dipendente } from '@/lib/types';

export default function PayrollPage() {
  const [selectedDipendente, setSelectedDipendente] = useState<Dipendente | null>(null);

  // TODO: Replace with Supabase query
  const costoMensile = dipendenti.reduce((s, d) => s + d.ralLorda / 13, 0);
  const costoAnnuale = dipendenti.reduce((s, d) => s + d.ralLorda, 0);

  return (
    <PageContainer
      title="Payroll"
      description="Gestione dipendenti e cedolini"
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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dipendente</TableHead>
                    <TableHead className="hidden md:table-cell">Ruolo</TableHead>
                    <TableHead className="hidden lg:table-cell">Contratto</TableHead>
                    <TableHead className="hidden lg:table-cell">Livello</TableHead>
                    <TableHead className="text-right">RAL</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dipendenti.map((dip) => (
                    <TableRow key={dip.id} className="hover:bg-muted/50">
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
                        <Dialog>
                          <DialogTrigger
                            onClick={() => setSelectedDipendente(dip)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cedolini">
          <Card>
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
                  {cedolini.map((ced) => {
                    const dip = dipendenti.find((d) => d.id === ced.dipendenteId);
                    return (
                      <TableRow key={ced.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-sm">
                          {dip ? `${dip.nome} ${dip.cognome}` : '—'}
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
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
