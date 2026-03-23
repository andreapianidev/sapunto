'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { fetchPiani, fetchTenants, updatePianoAdmin } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatCurrency } from '@/lib/utils';
import { Check, Edit, Users, FileText, CreditCard, Loader2, X, Plus } from 'lucide-react';

export default function PianiPage() {
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchPiani(), fetchTenants()]),
    [[], []]
  );
  const piani = allData[0];
  const tenants = allData[1];

  const [editingPiano, setEditingPiano] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [newFeature, setNewFeature] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openEdit = (piano: any) => {
    setFormData({
      nome: piano.nome,
      descrizione: piano.descrizione,
      prezzoMensile: String(piano.prezzoMensile),
      prezzoAnnuale: String(piano.prezzoAnnuale),
      maxUtenti: piano.maxUtenti,
      maxClienti: piano.maxClienti,
      maxFatture: piano.maxFatture,
      costoUtenteAggiuntivo: String(piano.costoUtenteAggiuntivo),
      funzionalita: [...piano.funzionalita],
    });
    setEditingPiano(piano);
    setNewFeature('');
  };

  const handleSave = async () => {
    if (!editingPiano) return;
    setSubmitting(true);
    await updatePianoAdmin(editingPiano.id, {
      nome: formData.nome,
      descrizione: formData.descrizione,
      prezzoMensile: formData.prezzoMensile,
      prezzoAnnuale: formData.prezzoAnnuale,
      maxUtenti: Number(formData.maxUtenti),
      maxClienti: Number(formData.maxClienti),
      maxFatture: Number(formData.maxFatture),
      costoUtenteAggiuntivo: formData.costoUtenteAggiuntivo,
      funzionalita: formData.funzionalita,
    });
    setSubmitting(false);
    setEditingPiano(null);
    refresh();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, funzionalita: [...formData.funzionalita, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      funzionalita: formData.funzionalita.filter((_: string, i: number) => i !== index),
    });
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Piani e Abbonamenti" description="Configurazione piani disponibili — Pagamenti via PayPal e Bonifico Bancario">
      <div className="grid gap-6 md:grid-cols-3">
        {piani.map((piano: any) => {
          const tenantsCount = tenants.filter((t: any) => t.piano === piano.id).length;
          const isPopular = piano.id === 'experience';
          const isAnnualOnly = piano.id === 'express';

          return (
            <Card key={piano.id} className={isPopular ? 'ring-2 ring-[#1a2332] relative' : ''}>
              <CardHeader className="text-center pb-2">
                {isPopular && (
                  <Badge className="bg-[#1a2332] text-white mb-2 self-center">
                    Più Completo
                  </Badge>
                )}
                <CardTitle className="text-xl">{piano.nome}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{piano.descrizione}</p>
                <div className="mt-3">
                  {isAnnualOnly ? (
                    <>
                      <span className="text-4xl font-bold">{formatCurrency(piano.prezzoAnnuale)}</span>
                      <span className="text-muted-foreground">/anno</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">{formatCurrency(piano.prezzoMensile)}</span>
                      <span className="text-muted-foreground">/mese</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(piano.prezzoAnnuale)}/anno
                      </p>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Utenti inclusi
                    </span>
                    <span className="font-medium">{piano.maxUtenti}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Utente aggiuntivo
                    </span>
                    <span className="font-medium">{formatCurrency(piano.costoUtenteAggiuntivo)}/mese</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Fatture/mese
                    </span>
                    <span className="font-medium">{piano.maxFatture}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> Pagamento
                    </span>
                    <span className="font-medium">PayPal / Bonifico</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tenant attivi</span>
                    <span className="font-bold">{tenantsCount}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {piano.funzionalita.map((f: string) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={() => openEdit(piano)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifica Piano
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPiano} onOpenChange={(open) => !open && setEditingPiano(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Piano — {editingPiano?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Input value={formData.descrizione || ''} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prezzo Mensile</Label>
                <Input type="number" step="0.01" value={formData.prezzoMensile || ''} onChange={(e) => setFormData({ ...formData, prezzoMensile: e.target.value })} />
              </div>
              <div>
                <Label>Prezzo Annuale</Label>
                <Input type="number" step="0.01" value={formData.prezzoAnnuale || ''} onChange={(e) => setFormData({ ...formData, prezzoAnnuale: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Max Utenti</Label>
                <Input type="number" value={formData.maxUtenti || ''} onChange={(e) => setFormData({ ...formData, maxUtenti: e.target.value })} />
              </div>
              <div>
                <Label>Max Clienti</Label>
                <Input type="number" value={formData.maxClienti || ''} onChange={(e) => setFormData({ ...formData, maxClienti: e.target.value })} />
              </div>
              <div>
                <Label>Max Fatture</Label>
                <Input type="number" value={formData.maxFatture || ''} onChange={(e) => setFormData({ ...formData, maxFatture: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Costo Utente Aggiuntivo (/mese)</Label>
              <Input type="number" step="0.01" value={formData.costoUtenteAggiuntivo || ''} onChange={(e) => setFormData({ ...formData, costoUtenteAggiuntivo: e.target.value })} />
            </div>
            <div>
              <Label>Funzionalità</Label>
              <div className="space-y-2 mt-2">
                {formData.funzionalita?.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm flex-1">{f}</span>
                    <button onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nuova funzionalità..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button variant="outline" size="icon" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPiano(null)}>Annulla</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
