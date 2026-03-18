'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { leads } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Target, DollarSign, TrendingUp, Users, Save, MoreHorizontal, Pencil, Trash2, Copy, Download } from 'lucide-react';
import type { FaseLead } from '@/lib/types';

const faseBadge: Record<string, string> = { nuovo: 'bg-gray-100 text-gray-800', contattato: 'bg-blue-100 text-blue-800', qualificato: 'bg-purple-100 text-purple-800', proposta: 'bg-yellow-100 text-yellow-800', negoziazione: 'bg-orange-100 text-orange-800', vinto: 'bg-green-100 text-green-800', perso: 'bg-red-100 text-red-800' };
const faseLabel: Record<string, string> = { nuovo: 'Nuovo', contattato: 'Contattato', qualificato: 'Qualificato', proposta: 'Proposta', negoziazione: 'Negoziazione', vinto: 'Vinto', perso: 'Perso' };
const faseBorderColor: Record<string, string> = { nuovo: 'border-t-gray-400', contattato: 'border-t-blue-500', qualificato: 'border-t-purple-500', proposta: 'border-t-yellow-500', negoziazione: 'border-t-orange-500' };
const pipelineFasi: FaseLead[] = ['nuovo', 'contattato', 'qualificato', 'proposta', 'negoziazione'];

export default function LeadPage() {
  const attivi = leads.filter((l) => l.fase !== 'vinto' && l.fase !== 'perso');
  const valorePipeline = attivi.reduce((s, l) => s + l.valore, 0);
  const valorePesato = attivi.reduce((s, l) => s + l.valore * (l.probabilita / 100), 0);
  const tassoConversione = Math.round((leads.filter((l) => l.fase === 'vinto').length / leads.length) * 100);

  return (
    <PageContainer title="Lead & Pipeline" description="Gestione opportunità commerciali" actions={
      <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      <Dialog>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90"><Plus className="mr-2 h-4 w-4" />Nuovo Lead</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nuovo Lead</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: lead creato!'); }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Azienda *</Label><Input placeholder="Nome azienda" className="mt-1" required /></div>
              <div><Label>Referente *</Label><Input placeholder="Nome e cognome" className="mt-1" required /></div>
              <div><Label>Email</Label><Input type="email" placeholder="email@azienda.it" className="mt-1" /></div>
              <div><Label>Telefono</Label><Input placeholder="+39..." className="mt-1" /></div>
              <div><Label>Valore Stimato</Label><Input type="number" placeholder="0" className="mt-1" /></div>
              <div><Label>Fonte</Label><Select defaultValue="sito_web"><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sito_web">Sito Web</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="fiera">Fiera</SelectItem><SelectItem value="social">Social</SelectItem><SelectItem value="cold_call">Cold Call</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90"><Save className="mr-2 h-4 w-4" />Salva Lead</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    }>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Target className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{leads.length}</p><p className="text-xs text-muted-foreground">Lead Totali</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><DollarSign className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(valorePipeline)}</p><p className="text-xs text-muted-foreground">Valore Pipeline</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><TrendingUp className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{tassoConversione}%</p><p className="text-xs text-muted-foreground">Conversione</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{attivi.length}</p><p className="text-xs text-muted-foreground">Lead Attivi</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList><TabsTrigger value="pipeline">Pipeline</TabsTrigger><TabsTrigger value="lista">Lista</TabsTrigger></TabsList>

        <TabsContent value="pipeline">
          <div className="grid gap-3 lg:grid-cols-5">
            {pipelineFasi.map((fase) => {
              const faseLeads = leads.filter((l) => l.fase === fase);
              return (
                <Card key={fase} className={`border-t-4 ${faseBorderColor[fase]}`}>
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider">{faseLabel[fase]}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{faseLeads.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(faseLeads.reduce((s, l) => s + l.valore, 0))}</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {faseLeads.map((lead) => (
                      <div key={lead.id} className="rounded-lg border p-2.5 bg-background hover:shadow-sm transition-shadow relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{lead.azienda}</p>
                            <p className="text-xs text-muted-foreground">{lead.referente}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0 shrink-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-green-700">{formatCurrency(lead.valore)}</span>
                          <span className="text-xs text-muted-foreground">{lead.probabilita}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{lead.assegnatoNome}</p>
                      </div>
                    ))}
                    {faseLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nessun lead</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="lista">
          <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Azienda</TableHead><TableHead className="hidden md:table-cell">Referente</TableHead><TableHead className="hidden lg:table-cell">Fonte</TableHead><TableHead>Fase</TableHead><TableHead className="text-right">Valore</TableHead><TableHead className="text-center hidden md:table-cell">Prob.</TableHead><TableHead className="hidden lg:table-cell">Assegnato</TableHead><TableHead className="w-[50px]">Azioni</TableHead></TableRow></TableHeader>
          <TableBody>{leads.map((l) => (
            <TableRow key={l.id} className="hover:bg-muted/50"><TableCell className="font-medium text-sm">{l.azienda}</TableCell><TableCell className="hidden md:table-cell text-sm">{l.referente}</TableCell><TableCell className="hidden lg:table-cell text-sm capitalize">{l.fonte.replace('_', ' ')}</TableCell><TableCell><Badge variant="secondary" className={`text-xs ${faseBadge[l.fase]}`}>{faseLabel[l.fase]}</Badge></TableCell><TableCell className="text-right font-semibold text-sm">{formatCurrency(l.valore)}</TableCell><TableCell className="text-center hidden md:table-cell text-sm">{l.probabilita}%</TableCell><TableCell className="hidden lg:table-cell text-sm">{l.assegnatoNome}</TableCell><TableCell><DropdownMenu><DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Pencil className="mr-2 h-4 w-4" />Modifica</DropdownMenuItem><DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}><Copy className="mr-2 h-4 w-4" />Converti a Cliente</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>
          ))}</TableBody></Table></CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
