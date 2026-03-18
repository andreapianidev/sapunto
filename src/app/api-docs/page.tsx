'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Key, Lock, Globe, Code } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/clienti',
    description: 'Lista tutti i clienti del tenant',
    params: 'page, limit, search, tipo',
    response: '{ data: Cliente[], total: number, page: number }',
  },
  {
    method: 'GET',
    path: '/api/v1/clienti/:id',
    description: 'Dettaglio singolo cliente',
    params: 'id (path)',
    response: '{ data: Cliente }',
  },
  {
    method: 'POST',
    path: '/api/v1/clienti',
    description: 'Crea nuovo cliente',
    params: 'body: ClienteInput',
    response: '{ data: Cliente }',
  },
  {
    method: 'GET',
    path: '/api/v1/ordini',
    description: 'Lista ordini con filtri',
    params: 'page, limit, stato, canale, clienteId',
    response: '{ data: Ordine[], total: number }',
  },
  {
    method: 'POST',
    path: '/api/v1/ordini',
    description: 'Crea nuovo ordine',
    params: 'body: OrdineInput',
    response: '{ data: Ordine }',
  },
  {
    method: 'GET',
    path: '/api/v1/prodotti',
    description: 'Lista prodotti inventario',
    params: 'page, limit, categoria, search',
    response: '{ data: Prodotto[], total: number }',
  },
  {
    method: 'GET',
    path: '/api/v1/fatture',
    description: 'Lista fatture elettroniche',
    params: 'page, limit, tipo, statoSDI, stato',
    response: '{ data: Fattura[], total: number }',
  },
  {
    method: 'POST',
    path: '/api/v1/fatture',
    description: 'Crea e invia fattura elettronica',
    params: 'body: FatturaInput',
    response: '{ data: Fattura, xmlUrl: string }',
  },
  {
    method: 'GET',
    path: '/api/v1/fatture/:id/xml',
    description: 'Scarica XML FatturaPA',
    params: 'id (path)',
    response: 'application/xml',
  },
  {
    method: 'GET',
    path: '/api/v1/appuntamenti',
    description: 'Lista appuntamenti',
    params: 'da, a, operatoreId',
    response: '{ data: Appuntamento[] }',
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-[#1a2332] text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna al login
              </Button>
            </Link>
            <Badge className="bg-white/20 text-white">v1.0</Badge>
          </div>
          <h1 className="text-3xl font-bold">Sapunto API</h1>
          <p className="text-blue-200 mt-2">
            API RESTful per integrare i dati del tuo gestionale con applicazioni esterne
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-blue-200">
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>Base URL: https://api.sapunto.cloud/v1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              <span>HTTPS Only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="endpoints">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="autenticazione">Autenticazione</TabsTrigger>
            <TabsTrigger value="esempi">Esempi</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4 mt-6">
            {endpoints.map((ep) => (
              <Card key={`${ep.method}-${ep.path}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge className={`${methodColors[ep.method]} font-mono text-xs shrink-0 mt-0.5`}>
                      {ep.method}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium">{ep.path}</p>
                      <p className="text-sm text-muted-foreground mt-1">{ep.description}</p>
                      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">Parametri: </span>
                          <span className="font-mono">{ep.params}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Response: </span>
                          <span className="font-mono">{ep.response}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="autenticazione" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Autenticazione API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tutte le richieste API devono includere un header di autenticazione con la tua API key.
                  Ogni tenant ha una propria API key generata dal pannello Impostazioni.
                </p>
                <div className="bg-[#1a2332] text-green-400 p-4 rounded-lg font-mono text-sm">
                  <p className="text-gray-400"># Header di autenticazione</p>
                  <p>Authorization: Bearer spt_demo_xxxxxxxxxxxxxxxxxxxxxxxx</p>
                  <p className="mt-2 text-gray-400"># Oppure come query parameter</p>
                  <p>GET /api/v1/clienti?api_key=spt_demo_xxxx</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Rate Limiting:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Piano Base: 100 richieste/minuto</li>
                    <li>Piano Professional: 500 richieste/minuto</li>
                    <li>Piano Premium: 2000 richieste/minuto</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="esempi" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Esempio: Lista Clienti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#1a2332] text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X GET "https://api.sapunto.cloud/v1/clienti?page=1&limit=10" \\
  -H "Authorization: Bearer spt_demo_xxxxx" \\
  -H "Content-Type: application/json"

# Response 200 OK
{
  "data": [
    {
      "id": "c-1",
      "ragioneSociale": "TechnoService S.r.l.",
      "partitaIva": "05678901234",
      "email": "ordini@technoservice.it",
      "citta": "Milano",
      "tags": ["premium", "elettronica"]
    }
  ],
  "total": 27,
  "page": 1,
  "limit": 10
}`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Esempio: Crea Ordine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#1a2332] text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X POST "https://api.sapunto.cloud/v1/ordini" \\
  -H "Authorization: Bearer spt_demo_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clienteId": "c-1",
    "canale": "api",
    "righe": [
      {
        "prodottoId": "p-1",
        "quantita": 10,
        "prezzoUnitario": 24.90
      }
    ]
  }'

# Response 201 Created
{
  "data": {
    "id": "ord-044",
    "numero": "ORD-2026-0044",
    "stato": "nuovo",
    "totale": 303.78
  }
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
