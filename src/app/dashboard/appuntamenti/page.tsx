'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { appuntamenti, clienti } from '@/lib/mockdata';
import { formatDate } from '@/lib/utils';
import { Plus, Calendar, Clock, MapPin, User, MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react';

const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export default function AppuntamentiPage() {
  // Settimana corrente: 16-22 Marzo 2026 (Lun-Dom)
  const [settimanaOffset, setSettimanaOffset] = useState(0);

  const getSettimana = (offset: number) => {
    const base = new Date('2026-03-16'); // Lunedì
    base.setDate(base.getDate() + offset * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const settimana = getSettimana(settimanaOffset);

  const appPerGiorno = useMemo(() => {
    const map: Record<string, typeof appuntamenti> = {};
    settimana.forEach((d) => {
      const key = d.toISOString().split('T')[0];
      map[key] = appuntamenti.filter((a) => a.data === key);
    });
    return map;
  }, [settimanaOffset]);

  const oggi = '2026-03-18';

  return (
    <PageContainer
      title="Appuntamenti"
      description="Calendario appuntamenti e visite"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => alert('Demo: esporta appuntamenti!')}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Appuntamento
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuovo Appuntamento</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: appuntamento creato!'); }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Titolo *</Label>
                    <Input placeholder="Es. Sopralluogo cliente" className="mt-1" required />
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <Select>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Seleziona cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clienti.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Operatore</Label>
                    <Input defaultValue="Marco Rossi" className="mt-1" />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label>Ora Inizio</Label>
                    <Input type="time" className="mt-1" />
                  </div>
                  <div>
                    <Label>Ora Fine</Label>
                    <Input type="time" className="mt-1" />
                  </div>
                  <div>
                    <Label>Luogo</Label>
                    <Input placeholder="Es. Via Roma 10, Milano" className="mt-1" />
                  </div>
                  <div>
                    <Label>Stato</Label>
                    <Select defaultValue="confermato">
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confermato">Confermato</SelectItem>
                        <SelectItem value="in_attesa">In Attesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Note</Label>
                    <textarea
                      placeholder="Note aggiuntive..."
                      rows={3}
                      className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
                    Salva Appuntamento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Week navigation */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setSettimanaOffset(settimanaOffset - 1)}>
            Settimana Prec.
          </Button>
          <h3 className="font-semibold">
            {formatDate(settimana[0].toISOString())} — {formatDate(settimana[6].toISOString())}
          </h3>
          <Button variant="outline" size="sm" onClick={() => setSettimanaOffset(settimanaOffset + 1)}>
            Settimana Succ.
          </Button>
        </CardContent>
      </Card>

      {/* Weekly calendar */}
      <div className="grid gap-3 lg:grid-cols-7">
        {settimana.map((giorno, i) => {
          const key = giorno.toISOString().split('T')[0];
          const apps = appPerGiorno[key] || [];
          const isOggi = key === oggi;
          const isWeekend = i >= 5;

          return (
            <Card key={key} className={`${isOggi ? 'ring-2 ring-[#1a2332]' : ''} ${isWeekend ? 'opacity-60' : ''}`}>
              <CardHeader className="p-3 pb-2">
                <CardTitle className={`text-sm font-semibold flex items-center justify-between ${isOggi ? 'text-[#1a2332]' : ''}`}>
                  <span>{giorniSettimana[i]}</span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    isOggi ? 'bg-[#1a2332] text-white' : ''
                  }`}>
                    {giorno.getDate()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {apps.length > 0 ? (
                  apps.map((app) => (
                    <div
                      key={app.id}
                      className={`relative rounded-lg p-2 text-xs border ${
                        app.stato === 'confermato'
                          ? 'bg-green-50 border-green-200'
                          : app.stato === 'in_attesa'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="absolute top-1 right-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground h-5 w-5">
                            <MoreHorizontal className="h-3 w-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}>
                              <Pencil className="mr-2 h-4 w-4" />Modifica
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="font-semibold truncate pr-5">{app.titolo}</p>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{app.oraInizio}-{app.oraFine}</span>
                      </div>
                      {app.clienteNome && (
                        <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate">{app.clienteNome}</span>
                        </div>
                      )}
                      {app.luogo && (
                        <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{app.luogo}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">—</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista appuntamenti prossimi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Prossimi Appuntamenti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appuntamenti
            .filter((a) => a.data >= oggi)
            .sort((a, b) => a.data.localeCompare(b.data) || a.oraInizio.localeCompare(b.oraInizio))
            .slice(0, 10)
            .map((app) => (
              <div key={app.id} className="flex items-start gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-center">
                  <span className="text-xs font-bold">{formatDate(app.data).slice(0, 5)}</span>
                  <span className="text-xs text-muted-foreground">{app.oraInizio}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{app.titolo}</p>
                  {app.clienteNome && (
                    <p className="text-xs text-muted-foreground">{app.clienteNome}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {app.oraInizio} - {app.oraFine} | {app.operatoreNome}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-xs ${
                  app.stato === 'confermato' ? 'bg-green-100 text-green-800' :
                  app.stato === 'in_attesa' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {app.stato === 'confermato' ? 'Confermato' : app.stato === 'in_attesa' ? 'In Attesa' : 'Annullato'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}>
                      <Pencil className="mr-2 h-4 w-4" />Modifica
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
