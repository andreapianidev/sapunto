'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { tenants, piani } from '@/lib/mockdata';
import { formatDate, formatCurrency, formatPIVA } from '@/lib/utils';
import { Plus, MoreHorizontal, Pause, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TenantPage() {
  return (
    <PageContainer
      title="Gestione Tenant"
      description={`${tenants.length} aziende registrate`}
      actions={
        <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Tenant
        </Button>
      }
    >
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
              {tenants.map((t) => {
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
                        t.piano === 'premium' ? 'bg-purple-100 text-purple-800' :
                        t.piano === 'professional' ? 'bg-blue-100 text-blue-800' :
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
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifica Piano
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Sospendi
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
