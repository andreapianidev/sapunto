'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchPiani, fetchTenants } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { formatCurrency } from '@/lib/utils';
import { Check, Edit, Users, FileText, CreditCard } from 'lucide-react';

export default function PianiPage() {
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchPiani(), fetchTenants()]),
    [[], []]
  );
  const piani = allData[0];
  const tenants = allData[1];

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

                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifica Piano
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
