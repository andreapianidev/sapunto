'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { fetchIntegrazioniEcommerce, fetchLogSync } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/utils';
import { ShoppingBag, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EcommercePage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchIntegrazioniEcommerce(tenantId), fetchLogSync()]),
    [[], []]
  );
  const integrazioniEcommerce = allData[0];
  const logSync = allData[1];

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Integrazioni E-commerce"
      description="Stato connessioni e sincronizzazione"
    >
      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {integrazioniEcommerce.map((int) => (
          <Card key={int.id} className={int.stato === 'prossimamente' ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    int.piattaforma === 'woocommerce' ? 'bg-purple-100 text-purple-700' :
                    int.piattaforma === 'prestashop' ? 'bg-pink-100 text-pink-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{int.piattaforma}</p>
                    {int.urlNegozio && (
                      <p className="text-xs text-muted-foreground">{int.urlNegozio}</p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    int.stato === 'attivo' ? 'bg-green-100 text-green-800' :
                    int.stato === 'errore' ? 'bg-red-100 text-red-800' :
                    int.stato === 'prossimamente' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {int.stato === 'attivo' ? 'Attivo' :
                   int.stato === 'prossimamente' ? 'Prossimamente' :
                   int.stato === 'errore' ? 'Errore' : 'Disattivo'}
                </Badge>
              </div>

              {int.stato !== 'prossimamente' && (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">{int.ordiniSincronizzati}</p>
                      <p className="text-xs text-muted-foreground">Ordini sync</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">{int.prodottiMappati}</p>
                      <p className="text-xs text-muted-foreground">Prodotti</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className={`text-lg font-bold ${int.errori > 0 ? 'text-red-600' : ''}`}>{int.errori}</p>
                      <p className="text-xs text-muted-foreground">Errori</p>
                    </div>
                  </div>
                  {int.ultimoSync && (
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Ultimo sync: {formatDateTime(int.ultimoSync)}</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {int.stato === 'prossimamente' && (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Integrazione in arrivo</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Log Sincronizzazione</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Ora</TableHead>
                <TableHead>Piattaforma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Messaggio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logSync.map((log) => {
                const integrazione = integrazioniEcommerce.find((i) => i.id === log.integrazioneId);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{formatDateTime(log.data)}</TableCell>
                    <TableCell className="text-sm capitalize font-medium">
                      {integrazione?.piattaforma || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{log.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {log.stato === 'successo' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {log.stato === 'errore' && <XCircle className="h-4 w-4 text-red-500" />}
                        {log.stato === 'conflitto' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        <span className={`text-sm ${
                          log.stato === 'successo' ? 'text-green-700' :
                          log.stato === 'errore' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {log.stato === 'successo' ? 'Successo' : log.stato === 'errore' ? 'Errore' : 'Conflitto'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.messaggio}</TableCell>
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
