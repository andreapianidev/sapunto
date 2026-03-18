'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { piani, tenants } from '@/lib/mockdata';
import { formatCurrency } from '@/lib/utils';
import { Check, Edit } from 'lucide-react';

export default function PianiPage() {
  return (
    <PageContainer title="Piani e Abbonamenti" description="Configurazione piani disponibili">
      <div className="grid gap-6 md:grid-cols-3">
        {piani.map((piano) => {
          const tenantsCount = tenants.filter((t) => t.piano === piano.id).length;
          const isPopular = piano.id === 'professional';

          return (
            <Card key={piano.id} className={isPopular ? 'ring-2 ring-[#1a2332]' : ''}>
              <CardHeader className="text-center pb-2">
                {isPopular && (
                  <Badge className="bg-[#1a2332] text-white mb-2 self-center">
                    Più Popolare
                  </Badge>
                )}
                <CardTitle className="text-xl">{piano.nome}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{formatCurrency(piano.prezzoMensile)}</span>
                  <span className="text-muted-foreground">/mese</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(piano.prezzoAnnuale)}/anno
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Utenti</span>
                    <span className="font-medium">{piano.maxUtenti}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Clienti</span>
                    <span className="font-medium">{piano.maxClienti === -1 ? 'Illimitati' : piano.maxClienti}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Fatture/mese</span>
                    <span className="font-medium">{piano.maxFatture === -1 ? 'Illimitate' : piano.maxFatture}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tenant attivi</span>
                    <span className="font-bold">{tenantsCount}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {piano.funzionalita.map((f) => (
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
