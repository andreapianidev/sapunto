'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { noteDiCredito } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, FileX, Save } from 'lucide-react';

const statoBadge: Record<string, string> = {
  emessa: 'bg-blue-100 text-blue-800',
  inviata_sdi: 'bg-yellow-100 text-yellow-800',
  accettata: 'bg-green-100 text-green-800',
};

export default function NoteCreditoPage() {
  const totale = noteDiCredito.reduce((s, n) => s + n.totale, 0);

  return (
    <PageContainer
      title="Note di Credito"
      description="Gestione note di credito emesse"
      actions={
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Nota di Credito
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Nuova Nota di Credito</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: nota di credito emessa!'); }}>
              <div className="grid gap-3">
                <div><Label>Fattura di Riferimento *</Label><Input placeholder="Es. FE-2026-0025" className="mt-1" required /></div>
                <div><Label>Motivo *</Label><Input placeholder="Motivo della nota di credito" className="mt-1" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Importo (netto)</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" /></div>
                  <div><Label>IVA</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" /></div>
                </div>
              </div>
              <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90"><Save className="mr-2 h-4 w-4" />Emetti</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileX className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{noteDiCredito.length}</p><p className="text-xs text-muted-foreground">Totale NDC</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700"><FileX className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(totale)}</p><p className="text-xs text-muted-foreground">Valore Totale</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><FileX className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{noteDiCredito.filter((n) => n.stato === 'accettata').length}</p><p className="text-xs text-muted-foreground">Accettate SDI</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Numero</TableHead><TableHead>Fattura Rif.</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Data</TableHead><TableHead className="hidden lg:table-cell">Motivo</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Totale</TableHead>
          </TableRow></TableHeader>
          <TableBody>{noteDiCredito.map((n) => (
            <TableRow key={n.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-sm">{n.numero}</TableCell>
              <TableCell className="text-sm font-mono">{n.fatturaNumero}</TableCell>
              <TableCell className="text-sm">{n.clienteNome}</TableCell>
              <TableCell className="hidden md:table-cell text-sm">{formatDate(n.data)}</TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{n.motivo}</TableCell>
              <TableCell><Badge variant="secondary" className={`text-xs ${statoBadge[n.stato]}`}>{n.stato.replace('_', ' ')}</Badge></TableCell>
              <TableCell className="text-right font-semibold text-sm">{formatCurrency(n.totale)}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </PageContainer>
  );
}
