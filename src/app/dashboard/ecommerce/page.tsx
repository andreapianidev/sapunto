'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  fetchIntegrazioniEcommerce, fetchLogSync,
  createIntegrazioneEcommerce, updateIntegrazioneEcommerce, deleteIntegrazioneEcommerce,
} from '@/lib/actions/data';
import { testWooConnection, syncProducts, syncOrders } from '@/lib/actions/woocommerce';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/utils';
import {
  ShoppingBag, RefreshCw, AlertCircle, CheckCircle, XCircle,
  Plus, Settings, Trash2, Loader2, Wifi, WifiOff, Pencil, Download,
} from 'lucide-react';

type Piattaforma = 'woocommerce' | 'prestashop' | 'shopify';

const PIATTAFORME: { value: Piattaforma; label: string; color: string; available: boolean }[] = [
  { value: 'woocommerce', label: 'WooCommerce', color: 'bg-purple-100 text-purple-700', available: true },
  { value: 'prestashop', label: 'PrestaShop', color: 'bg-pink-100 text-pink-700', available: false },
  { value: 'shopify', label: 'Shopify', color: 'bg-green-100 text-green-700', available: false },
];

export default function EcommercePage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchIntegrazioniEcommerce(tenantId), fetchLogSync(tenantId)]),
    [[], []]
  );
  const integrazioniEcommerce = allData[0];
  const logSync = allData[1];

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formPiattaforma, setFormPiattaforma] = useState<Piattaforma>('woocommerce');
  const [formUrl, setFormUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiSecret, setFormApiSecret] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Test connection
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  // Sync state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncType, setSyncType] = useState<'products' | 'orders' | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openNewDialog = () => {
    setEditingId(null);
    setFormPiattaforma('woocommerce');
    setFormUrl('');
    setFormApiKey('');
    setFormApiSecret('');
    setFormError('');
    setShowDialog(true);
  };

  const openEditDialog = (int: typeof integrazioniEcommerce[0]) => {
    setEditingId(int.id);
    setFormPiattaforma(int.piattaforma as Piattaforma);
    setFormUrl(int.urlNegozio || '');
    setFormApiKey(int.apiKey || '');
    setFormApiSecret(int.apiSecret || '');
    setFormError('');
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formUrl.trim() || !formApiKey.trim() || !formApiSecret.trim()) {
      setFormError('Tutti i campi sono obbligatori');
      return;
    }
    setFormSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateIntegrazioneEcommerce(editingId, {
          urlNegozio: formUrl.trim(),
          apiKey: formApiKey.trim(),
          apiSecret: formApiSecret.trim(),
        });
      } else {
        await createIntegrazioneEcommerce({
          tenantId,
          piattaforma: formPiattaforma,
          urlNegozio: formUrl.trim(),
          apiKey: formApiKey.trim(),
          apiSecret: formApiSecret.trim(),
        });
      }
      setShowDialog(false);
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setFormSaving(false);
    }
  };

  const handleTestConnection = async (int: typeof integrazioniEcommerce[0]) => {
    if (!int.urlNegozio || !int.apiKey || !int.apiSecret) {
      setTestResult({ id: int.id, ok: false, msg: 'Configurazione incompleta' });
      return;
    }
    setTestingId(int.id);
    setTestResult(null);
    try {
      const result = await testWooConnection({
        url: int.urlNegozio,
        consumerKey: int.apiKey,
        consumerSecret: int.apiSecret,
      });
      setTestResult({ id: int.id, ok: result.success, msg: result.success ? 'Connessione riuscita!' : result.error || 'Errore di connessione' });
      if (result.success && int.stato !== 'attivo') {
        await updateIntegrazioneEcommerce(int.id, { stato: 'attivo' });
        refresh();
      }
    } catch {
      setTestResult({ id: int.id, ok: false, msg: 'Errore durante il test' });
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (int: typeof integrazioniEcommerce[0], type: 'products' | 'orders') => {
    setSyncingId(int.id);
    setSyncType(type);
    try {
      if (type === 'products') {
        await syncProducts(tenantId, int.id);
      } else {
        await syncOrders(tenantId, int.id);
      }
      refresh();
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncingId(null);
      setSyncType(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteIntegrazioneEcommerce(deletingId);
      setConfirmDelete(false);
      setDeletingId(null);
      refresh();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleStato = async (int: typeof integrazioniEcommerce[0]) => {
    const nuovoStato = int.stato === 'attivo' ? 'disattivo' : 'attivo';
    await updateIntegrazioneEcommerce(int.id, { stato: nuovoStato });
    refresh();
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  const piattaformaInfo = (p: string) => PIATTAFORME.find(pp => pp.value === p) || PIATTAFORME[0];

  return (
    <PageContainer
      title="Integrazioni E-commerce"
      description="Configura e gestisci le connessioni con i tuoi negozi online"
    >
      {/* Header with Add Button */}
      <div className="flex justify-end">
        <Button onClick={openNewDialog} className="bg-[#1a2332] hover:bg-[#1a2332]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Integrazione
        </Button>
      </div>

      {/* Empty State */}
      {integrazioniEcommerce.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Collega il tuo negozio online</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Sincronizza ordini, prodotti e clienti automaticamente dal tuo e-commerce.
              Supportiamo WooCommerce, con PrestaShop e Shopify in arrivo.
            </p>
            <Button onClick={openNewDialog} className="bg-[#1a2332] hover:bg-[#1a2332]/90">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Integrazione
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrazioniEcommerce.map((int) => {
          const pInfo = piattaformaInfo(int.piattaforma);
          const isSyncing = syncingId === int.id;
          const isTesting = testingId === int.id;
          const thisTestResult = testResult?.id === int.id ? testResult : null;

          return (
            <Card key={int.id}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${pInfo.color}`}>
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{pInfo.label}</p>
                      {int.urlNegozio && (
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{int.urlNegozio}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs shrink-0 ${
                      int.stato === 'attivo' ? 'bg-green-100 text-green-800' :
                      int.stato === 'errore' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {int.stato === 'attivo' ? 'Attivo' : int.stato === 'errore' ? 'Errore' : 'Disattivo'}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{int.ordiniSincronizzati || 0}</p>
                    <p className="text-xs text-muted-foreground">Ordini</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{int.prodottiMappati || 0}</p>
                    <p className="text-xs text-muted-foreground">Prodotti</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className={`text-lg font-bold ${(int.errori || 0) > 0 ? 'text-red-600' : ''}`}>{int.errori || 0}</p>
                    <p className="text-xs text-muted-foreground">Errori</p>
                  </div>
                </div>

                {int.ultimoSync && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Ultimo sync: {formatDateTime(int.ultimoSync)}
                  </p>
                )}

                {/* Test result */}
                {thisTestResult && (
                  <div className={`rounded-lg p-2 mb-3 text-xs flex items-center gap-1.5 ${thisTestResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {thisTestResult.ok ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {thisTestResult.msg}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleTestConnection(int)}
                    disabled={isTesting || isSyncing}
                    className="text-xs h-8"
                  >
                    {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Wifi className="h-3.5 w-3.5 mr-1" />}
                    Test
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleSync(int, 'products')}
                    disabled={isSyncing || int.stato !== 'attivo'}
                    className="text-xs h-8"
                  >
                    {isSyncing && syncType === 'products' ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                    Prodotti
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleSync(int, 'orders')}
                    disabled={isSyncing || int.stato !== 'attivo'}
                    className="text-xs h-8"
                  >
                    {isSyncing && syncType === 'orders' ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                    Ordini
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => openEditDialog(int)}
                    className="text-xs h-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleToggleStato(int)}
                    className="text-xs h-8"
                  >
                    {int.stato === 'attivo' ? <WifiOff className="h-3.5 w-3.5 text-yellow-600" /> : <Wifi className="h-3.5 w-3.5 text-green-600" />}
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { setDeletingId(int.id); setConfirmDelete(true); }}
                    className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sync Log */}
      {logSync.length > 0 && (
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
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifica Integrazione' : 'Nuova Integrazione E-commerce'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifica le credenziali di connessione.' : 'Inserisci i dati per collegare il tuo negozio.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {!editingId && (
              <div>
                <Label>Piattaforma</Label>
                <Select value={formPiattaforma} onValueChange={(v) => setFormPiattaforma(v as Piattaforma)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIATTAFORME.map((p) => (
                      <SelectItem key={p.value} value={p.value} disabled={!p.available}>
                        {p.label} {!p.available && '(Prossimamente)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="url">URL del Negozio *</Label>
              <Input
                id="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://mionegozio.it"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">L'indirizzo del tuo negozio WooCommerce</p>
            </div>

            <div>
              <Label htmlFor="apiKey">Consumer Key *</Label>
              <Input
                id="apiKey"
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="apiSecret">Consumer Secret *</Label>
              <Input
                id="apiSecret"
                type="password"
                value={formApiSecret}
                onChange={(e) => setFormApiSecret(e.target.value)}
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Le chiavi API si generano in WooCommerce → Impostazioni → Avanzate → REST API
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annulla</Button>
            <Button onClick={handleSave} disabled={formSaving} className="bg-[#1a2332] hover:bg-[#1a2332]/90">
              {formSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? 'Salva Modifiche' : 'Aggiungi Integrazione'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Elimina Integrazione</DialogTitle>
            <DialogDescription>
              Questa azione è irreversibile. Verranno eliminati anche tutti i log di sincronizzazione.
              Gli ordini e i prodotti già importati non verranno rimossi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDelete}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
