'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { progetti, tasks } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, FolderKanban, CheckCircle, Clock, Save } from 'lucide-react';
import type { StatoProgetto, StatoTask } from '@/lib/types';

const statoBadge: Record<string, string> = { pianificato: 'bg-gray-100 text-gray-800', in_corso: 'bg-blue-100 text-blue-800', in_pausa: 'bg-yellow-100 text-yellow-800', completato: 'bg-green-100 text-green-800', annullato: 'bg-red-100 text-red-800' };
const statoLabel: Record<string, string> = { pianificato: 'Pianificato', in_corso: 'In Corso', in_pausa: 'In Pausa', completato: 'Completato', annullato: 'Annullato' };
const prioritaBadge: Record<string, string> = { bassa: 'bg-gray-100 text-gray-800', media: 'bg-blue-100 text-blue-800', alta: 'bg-orange-100 text-orange-800', urgente: 'bg-red-100 text-red-800' };
const taskStatoLabel: Record<string, string> = { da_fare: 'Da Fare', in_corso: 'In Corso', in_revisione: 'In Revisione', completato: 'Completato' };
const taskStatoBorder: Record<string, string> = { da_fare: 'border-t-gray-400', in_corso: 'border-t-blue-500', in_revisione: 'border-t-purple-500', completato: 'border-t-green-500' };
const taskFasi: StatoTask[] = ['da_fare', 'in_corso', 'in_revisione', 'completato'];

export default function ProgettiPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const budgetTotale = progetti.reduce((s, p) => s + (p.budget || 0), 0);
  const projectTasks = selectedProject ? tasks.filter((t) => t.progettoId === selectedProject) : [];

  return (
    <PageContainer title="Progetti" description="Gestione progetti e task" actions={
      <Dialog>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90"><Plus className="mr-2 h-4 w-4" />Nuovo Progetto</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuovo Progetto</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: progetto creato!'); }}>
            <div className="grid gap-3"><div><Label>Nome Progetto *</Label><Input placeholder="Nome del progetto" className="mt-1" required /></div><div><Label>Descrizione</Label><Input placeholder="Descrizione breve" className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Data Inizio</Label><Input type="date" className="mt-1" /></div><div><Label>Data Fine</Label><Input type="date" className="mt-1" /></div></div><div><Label>Budget</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" /></div></div>
            <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90"><Save className="mr-2 h-4 w-4" />Crea</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    }>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FolderKanban className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{progetti.length}</p><p className="text-xs text-muted-foreground">Totale Progetti</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{progetti.filter((p) => p.stato === 'in_corso').length}</p><p className="text-xs text-muted-foreground">In Corso</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{progetti.filter((p) => p.stato === 'completato').length}</p><p className="text-xs text-muted-foreground">Completati</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><FolderKanban className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(budgetTotale)}</p><p className="text-xs text-muted-foreground">Budget Totale</p></div></CardContent></Card>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progetti.map((p) => (
          <Card key={p.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedProject === p.id ? 'ring-2 ring-[#1a2332]' : ''}`} onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{p.nome}</p>
                  {p.clienteNome && <p className="text-xs text-muted-foreground">{p.clienteNome}</p>}
                </div>
                <Badge variant="secondary" className={`text-[10px] ${statoBadge[p.stato]}`}>{statoLabel[p.stato]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{p.descrizione}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(p.dataInizio)} → {formatDate(p.dataFinePrevista)}</span>
                <span>{p.responsabileNome}</span>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Avanzamento</span><span className="font-semibold">{p.completamento}%</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a2332] rounded-full transition-all" style={{ width: `${p.completamento}%` }} />
                </div>
              </div>
              {p.budget && <p className="text-xs"><strong>Budget:</strong> {formatCurrency(p.budget)}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Kanban for selected project */}
      {selectedProject && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Task — {progetti.find((p) => p.id === selectedProject)?.nome}</h3>
          <div className="grid gap-3 lg:grid-cols-4">
            {taskFasi.map((fase) => {
              const faseTasks = projectTasks.filter((t) => t.stato === fase);
              return (
                <Card key={fase} className={`border-t-4 ${taskStatoBorder[fase]}`}>
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider">{taskStatoLabel[fase]}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{faseTasks.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {faseTasks.map((task) => (
                      <div key={task.id} className="rounded-lg border p-2.5 bg-background">
                        <p className="text-sm font-medium">{task.titolo}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className={`text-[10px] ${prioritaBadge[task.priorita]}`}>{task.priorita}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDate(task.dataScadenza)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{task.assegnatoNome}</p>
                        {task.oreStimate && <p className="text-[10px] text-muted-foreground">{task.oreEffettive || 0}/{task.oreStimate}h</p>}
                      </div>
                    ))}
                    {faseTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">—</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
