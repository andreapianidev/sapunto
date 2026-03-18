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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dipendenti, cedolini } from '@/lib/mockdata';
import { formatCurrency, formatDate, getMeseLabel } from '@/lib/utils';
import { Users, Wallet, Eye, FileDown, Plus, MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react';
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
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => alert('Demo: Esportazione dati payroll in corso...')}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                <FileDown className="h-4 w-4 mr-2" />
                Genera Cedolino
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Genera Cedolino</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Demo: Cedolino generato con successo!');
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="ced-dipendente">Dipendente *</Label>
                  <Select>
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
                    <Input id="ced-mese" type="number" min="1" max="12" placeholder="1-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ced-anno">Anno</Label>
                    <Input id="ced-anno" type="number" min="2020" placeholder="2026" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                  Genera
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Dipendente
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuovo Dipendente</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Demo: Dipendente salvato con successo!');
                }}
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dip-nome">Nome *</Label>
                    <Input id="dip-nome" placeholder="Nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dip-cognome">Cognome *</Label>
                    <Input id="dip-cognome" placeholder="Cognome" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-email">Email</Label>
                  <Input id="dip-email" type="email" placeholder="email@esempio.it" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dip-cf">Codice Fiscale</Label>
                    <Input id="dip-cf" placeholder="RSSMRA80A01H501Z" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dip-nascita">Data Nascita</Label>
                    <Input id="dip-nascita" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-ruolo">Ruolo Aziendale</Label>
                  <Input id="dip-ruolo" placeholder="es. Sviluppatore, Commerciale..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dip-contratto">Tipo Contratto</Label>
                    <Select>
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
                    <Input id="dip-livello" placeholder="es. 3A, 4, 5..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-ral">RAL Lorda</Label>
                  <Input id="dip-ral" type="number" step="0.01" min="0" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-iban">IBAN</Label>
                  <Input id="dip-iban" placeholder="IT60X0542811101000000123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dip-indirizzo">Indirizzo</Label>
                  <Input id="dip-indirizzo" placeholder="Via Roma 1, 00100 Roma (RM)" />
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                  Salva Dipendente
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
                            <DropdownMenuItem onClick={() => alert(`Demo: Eliminazione dipendente "${dip.nome} ${dip.cognome}"`)}>
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              <span className="text-red-600">Elimina</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
