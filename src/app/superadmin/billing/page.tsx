'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { tenants, piani } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const pagamenti = [
  { id: 'pay-1', tenantId: 't-1', tenant: 'Rossi Elettronica S.r.l.', importo: 99, data: '2026-03-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-2', tenantId: 't-2', tenant: 'Studio Bianchi & Associati', importo: 29, data: '2026-03-01', stato: 'completato', metodo: 'Bonifico' },
  { id: 'pay-3', tenantId: 't-3', tenant: 'GreenFood Italia S.p.A.', importo: 59, data: '2026-03-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-4', tenantId: 't-1', tenant: 'Rossi Elettronica S.r.l.', importo: 99, data: '2026-02-01', stato: 'completato', metodo: 'Carta di Credito' },
  { id: 'pay-5', tenantId: 't-2', tenant: 'Studio Bianchi & Associati', importo: 29, data: '2026-02-01', stato: 'completato', metodo: 'Bonifico' },
  { id: 'pay-6', tenantId: 't-3', tenant: 'GreenFood Italia S.p.A.', importo: 59, data: '2026-02-01', stato: 'completato', metodo: 'Carta di Credito' },
];

export default function BillingPage() {
  const mrrTotale = piani.reduce((sum, p) => {
    const count = tenants.filter((t) => t.piano === p.id).length;
    return sum + p.prezzoMensile * count;
  }, 0);

  return (
    <PageContainer title="Billing Globale" description="Panoramica pagamenti e rinnovi">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(mrrTotale)}</p>
              <p className="text-xs text-muted-foreground">MRR Totale</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(mrrTotale * 12)}</p>
              <p className="text-xs text-muted-foreground">ARR Stimato</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Rinnovi in Scadenza</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Pagamenti Falliti</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Storico Pagamenti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamenti.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="text-sm">{formatDate(pay.data)}</TableCell>
                  <TableCell className="text-sm font-medium">{pay.tenant}</TableCell>
                  <TableCell className="text-sm">{pay.metodo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Completato
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(pay.importo)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
