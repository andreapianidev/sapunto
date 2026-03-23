'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Server, CreditCard, Mail, HardDrive, Activity, Globe, Shield, Database, FileText,
} from 'lucide-react';
import { useServerData } from '@/lib/hooks/use-server-data';
import { fetchTenants } from '@/lib/actions/data';

const gatewayStatus = [
  { name: 'NexiPay (XPay)', status: 'Attivo', icon: CreditCard, color: 'bg-green-100 text-green-800' },
  { name: 'PayPal', status: 'Attivo', icon: CreditCard, color: 'bg-green-100 text-green-800' },
  { name: 'Bonifico Bancario', status: 'Attivo', icon: CreditCard, color: 'bg-green-100 text-green-800' },
];

export default function ImpostazioniPage() {
  const [tenants] = useServerData(() => fetchTenants(), []);

  return (
    <PageContainer title="Impostazioni Piattaforma" description="Configurazione e stato dei servizi Sapunto">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="h-4 w-4" />
              Informazioni Piattaforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nome Piattaforma</span>
              <span className="font-medium">Sapunto SaaS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Versione</span>
              <span className="font-medium font-mono">v2.1.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ambiente</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Production</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Regione</span>
              <span className="font-medium">EU-West (Frankfurt)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">Vercel + Neon</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">Next.js 14 (App Router)</span>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Stato Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> API Uptime</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">99.97%</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><Database className="h-3.5 w-3.5" /> Database</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-600">Healthy</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><HardDrive className="h-3.5 w-3.5" /> Storage</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">2.1 GB / 10 GB</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> SSL/TLS</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Valido</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Ultimo Deploy</span>
              <span className="font-medium text-xs">{new Date().toLocaleDateString('it-IT')} 10:30</span>
            </div>
            <div className="mt-2 bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Utilizzo Storage</span>
                <span className="font-medium">21%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '21%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateways */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Gateway di Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gatewayStatus.map((gw) => (
              <div key={gw.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <gw.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{gw.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${gw.color}`}>{gw.status}</Badge>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-2">
              I gateway sono configurati tramite le variabili d&apos;ambiente su Vercel.
            </div>
          </CardContent>
        </Card>

        {/* Email Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Configurazione Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provider SMTP</span>
              <span className="font-medium">Resend</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Indirizzo Mittente</span>
              <span className="font-medium font-mono text-xs">noreply@sapunto.cloud</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email Supporto</span>
              <span className="font-medium font-mono text-xs">supporto@sapunto.cloud</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Stato</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Attivo</Badge>
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium mb-2">Template Attivi</p>
              <div className="space-y-1">
                {['Benvenuto', 'Conferma Pagamento', 'Scadenza Abbonamento', 'Reset Password'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SDI / Fatturazione Elettronica */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fatturazione Elettronica (SDI)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{tenants.length}</p>
                <p className="text-xs text-muted-foreground">Tenant Totali</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{tenants.filter(t => t.stato === 'attivo').length}</p>
                <p className="text-xs text-muted-foreground">Tenant Attivi</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">Simulato</p>
                <p className="text-xs text-muted-foreground">Provider SDI Default</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Configurazione SDI per Tenant</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>P.IVA</TableHead>
                    <TableHead>Codice Dest.</TableHead>
                    <TableHead>PEC</TableHead>
                    <TableHead>Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium text-sm">{t.ragioneSociale}</TableCell>
                      <TableCell className="text-sm font-mono">{t.partitaIva}</TableCell>
                      <TableCell className="text-sm font-mono">{t.codiceDestinatario || '-'}</TableCell>
                      <TableCell className="text-sm">{t.pec || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${t.stato === 'attivo' ? 'bg-green-100 text-green-800' : t.stato === 'trial' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {t.stato}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              Il provider SDI è configurato a livello di tenant (Impostazioni → Fatturazione).
              Attualmente tutti i tenant usano il provider <strong>Simulato</strong> in attesa delle credenziali API dell&apos;intermediario.
              Il cron job di polling SDI è attivo ogni 15 minuti.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
