'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { fetchProgetti, fetchTasks, createProgetto, updateProgetto, deleteProgetto, createTask, updateTask, deleteTask } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, exportCSV } from '@/lib/utils';
import { Plus, FolderKanban, CheckCircle, Clock, Save, MoreHorizontal, Pencil, Trash2, Download, Search, Eye, ListTodo, CalendarDays, User as UserIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { StatoProgetto, StatoTask, Progetto } from '@/lib/types';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statoBadge: Record<string, string> = { pianificato: 'bg-gray-100 text-gray-800', in_corso: 'bg-blue-100 text-blue-800', in_pausa: 'bg-yellow-100 text-yellow-800', completato: 'bg-green-100 text-green-800', annullato: 'bg-red-100 text-red-800' };
const statoLabel: Record<string, string> = { pianificato: 'Pianificato', in_corso: 'In Corso', in_pausa: 'In Pausa', completato: 'Completato', annullato: 'Annullato' };
const prioritaBadge: Record<string, string> = { bassa: 'bg-gray-100 text-gray-800', media: 'bg-blue-100 text-blue-800', alta: 'bg-orange-100 text-orange-800', urgente: 'bg-red-100 text-red-800' };
const prioritaLabel: Record<string, string> = { bassa: 'Bassa', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
const taskStatoLabel: Record<string, string> = { da_fare: 'Da Fare', in_corso: 'In Corso', in_revisione: 'In Revisione', completato: 'Completato' };
const taskStatoBorder: Record<string, string> = { da_fare: 'border-t-gray-400', in_corso: 'border-t-blue-500', in_revisione: 'border-t-purple-500', completato: 'border-t-green-500' };
const taskFasi: StatoTask[] = ['da_fare', 'in_corso', 'in_revisione', 'completato'];

/* ── Drag-and-drop helper components ── */

function TaskDroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] transition-colors rounded-lg ${isOver ? 'bg-accent/40' : ''}`}
    >
      {children}
    </div>
  );
}

function SortableTaskCard({
  task,
  onAdvanceStatus,
  onDelete,
}: {
  task: { id: string; titolo: string; priorita: string; dataScadenza: string; assegnatoNome: string; stato: string; oreStimate?: number | null; oreEffettive?: number | null };
  onAdvanceStatus: (id: string, stato: StatoTask) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg border p-2.5 bg-background ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium">{task.titolo}</p>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-5 w-5 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { /* TODO: edit task dialog */ }}>
              <Pencil className="mr-2 h-3.5 w-3.5" />Modifica
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAdvanceStatus(task.id, task.stato as StatoTask)}>
              <Clock className="mr-2 h-3.5 w-3.5" />Avanza Stato
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(task.id)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="secondary" className={`text-xs ${prioritaBadge[task.priorita]}`}>{task.priorita}</Badge>
        <span className="text-xs text-muted-foreground">{formatDate(task.dataScadenza)}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{task.assegnatoNome}</p>
      {task.oreStimate && <p className="text-xs text-muted-foreground">{task.oreEffettive || 0}/{task.oreStimate}h</p>}
    </div>
  );
}

export default function ProgettiPage() {
  const { user } = useAuth();
  const tenantId = user!.tenantId;
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchProgetti(tenantId), fetchTasks(tenantId)]),
    [[], []]
  );
  const progetti = allData[0];
  const tasks = allData[1];

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [detailProject, setDetailProject] = useState<Progetto | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New project form state
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjNome, setNewProjNome] = useState('');
  const [newProjDescrizione, setNewProjDescrizione] = useState('');
  const [newProjDataInizio, setNewProjDataInizio] = useState('');
  const [newProjDataFine, setNewProjDataFine] = useState('');
  const [newProjBudget, setNewProjBudget] = useState('');

  const resetNewProjectForm = () => {
    setNewProjNome('');
    setNewProjDescrizione('');
    setNewProjDataInizio('');
    setNewProjDataFine('');
    setNewProjBudget('');
  };

  // New task form state
  const [newTaskTitolo, setNewTaskTitolo] = useState('');
  const [newTaskDescrizione, setNewTaskDescrizione] = useState('');
  const [newTaskPriorita, setNewTaskPriorita] = useState<'bassa' | 'media' | 'alta' | 'urgente'>('media');
  const [newTaskAssegnato, setNewTaskAssegnato] = useState('');
  const [newTaskScadenza, setNewTaskScadenza] = useState('');
  const [newTaskOre, setNewTaskOre] = useState('');

  const resetNewTaskForm = () => {
    setNewTaskTitolo('');
    setNewTaskDescrizione('');
    setNewTaskPriorita('media');
    setNewTaskAssegnato('');
    setNewTaskScadenza('');
    setNewTaskOre('');
  };

  const budgetTotale = progetti.reduce((s, p) => s + (p.budget || 0), 0);

  const filteredProgetti = useMemo(() => {
    return progetti.filter((p) => {
      const matchSearch =
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clienteNome || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStato = filterStato === 'tutti' || p.stato === filterStato;
      return matchSearch && matchStato;
    });
  }, [progetti, searchTerm, filterStato]);

  const projectTasks = selectedProject ? tasks.filter((t) => t.progettoId === selectedProject) : [];

  // --- CRUD handlers ---
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createProgetto({
      tenantId,
      nome: newProjNome,
      descrizione: newProjDescrizione || '',
      stato: 'pianificato',
      dataInizio: newProjDataInizio || new Date().toISOString().split('T')[0],
      dataFinePrevista: newProjDataFine || '',
      budget: newProjBudget || undefined,
      responsabileId: user?.id || '',
      responsabileNome: user?.nome || '',
    });
    setSubmitting(false);
    if (res.ok) {
      resetNewProjectForm();
      setNewProjectOpen(false);
      refresh();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setSubmitting(true);
    const res = await deleteProgetto(id);
    setSubmitting(false);
    if (res.ok) {
      if (selectedProject === id) setSelectedProject(null);
      refresh();
    } else {
      alert(res.error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    const res = await createTask({
      tenantId,
      progettoId: selectedProject,
      titolo: newTaskTitolo,
      descrizione: newTaskDescrizione || undefined,
      stato: 'da_fare',
      priorita: newTaskPriorita,
      assegnatoA: '',
      assegnatoNome: newTaskAssegnato || '',
      dataScadenza: newTaskScadenza || '',
      oreStimate: newTaskOre ? parseFloat(newTaskOre) : undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      resetNewTaskForm();
      setNewTaskOpen(false);
      refresh();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setSubmitting(true);
    const res = await deleteTask(id);
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error);
    }
  };

  const handleAdvanceTaskStatus = async (taskId: string, currentStato: StatoTask) => {
    const currentIdx = taskFasi.indexOf(currentStato);
    if (currentIdx < 0 || currentIdx >= taskFasi.length - 1) return;
    const nextStato = taskFasi[currentIdx + 1];
    setSubmitting(true);
    const res = await updateTask(taskId, { stato: nextStato });
    setSubmitting(false);
    if (res.ok) {
      refresh();
    } else {
      alert(res.error);
    }
  };

  // ── Drag-and-drop state for Task Kanban ──
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const taskSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeDragTask = activeDragTaskId ? tasks.find((t) => t.id === activeDragTaskId) : null;

  const handleTaskDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragTaskId(event.active.id as string);
  }, []);

  const handleTaskDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTaskId(null);

    if (!over) return;

    const taskId = active.id as string;
    let targetStato: StatoTask | null = null;

    if (taskFasi.includes(over.id as StatoTask)) {
      targetStato = over.id as StatoTask;
    } else {
      // over.id is a task card id — find which stato that task belongs to
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStato = overTask.stato as StatoTask;
      }
    }

    if (!targetStato) return;

    const draggedTask = tasks.find((t) => t.id === taskId);
    if (!draggedTask || draggedTask.stato === targetStato) return;

    setSubmitting(true);
    try {
      const result = await updateTask(taskId, { stato: targetStato });
      if (result.ok) {
        refresh();
      } else {
        alert('Errore: ' + ('error' in result ? result.error : 'Errore sconosciuto'));
      }
    } finally {
      setSubmitting(false);
    }
  }, [tasks, refresh]);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer title="Progetti" description="Gestione progetti e task" actions={
      <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => exportCSV(filteredProgetti as unknown as Record<string, unknown>[], [{ key: 'nome', label: 'Nome' }, { key: 'clienteNome', label: 'Cliente' }, { key: 'stato', label: 'Stato' }, { key: 'dataInizio', label: 'Data Inizio' }, { key: 'dataFinePrevista', label: 'Data Fine' }, { key: 'budget', label: 'Budget' }], 'progetti')}><Download className="mr-2 h-4 w-4" />Esporta</Button>
      <Dialog open={newProjectOpen} onOpenChange={(open) => { setNewProjectOpen(open); if (!open) resetNewProjectForm(); }}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90"><Plus className="mr-2 h-4 w-4" />Nuovo Progetto</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuovo Progetto</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateProject}>
            <div className="grid gap-3"><div><Label>Nome Progetto *</Label><Input placeholder="Nome del progetto" className="mt-1" required value={newProjNome} onChange={(e) => setNewProjNome(e.target.value)} /></div><div><Label>Descrizione</Label><Input placeholder="Descrizione breve" className="mt-1" value={newProjDescrizione} onChange={(e) => setNewProjDescrizione(e.target.value)} /></div><div className="grid grid-cols-2 gap-3"><div><Label>Data Inizio</Label><Input type="date" className="mt-1" value={newProjDataInizio} onChange={(e) => setNewProjDataInizio(e.target.value)} /></div><div><Label>Data Fine</Label><Input type="date" className="mt-1" value={newProjDataFine} onChange={(e) => setNewProjDataFine(e.target.value)} /></div></div><div><Label>Budget</Label><Input type="number" step="0.01" placeholder="0,00" className="mt-1" value={newProjBudget} onChange={(e) => setNewProjBudget(e.target.value)} /></div></div>
            <div className="flex justify-end"><Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Crea'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    }>
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FolderKanban className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{progetti.length}</p><p className="text-xs text-muted-foreground">Totale Progetti</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{progetti.filter((p) => p.stato === 'in_corso').length}</p><p className="text-xs text-muted-foreground">In Corso</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{progetti.filter((p) => p.stato === 'completato').length}</p><p className="text-xs text-muted-foreground">Completati</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700"><FolderKanban className="h-5 w-5" /></div><div><p className="text-xl font-bold">{formatCurrency(budgetTotale)}</p><p className="text-xs text-muted-foreground">Budget Totale</p></div></CardContent></Card>
      </div>

      {/* Search / Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cerca progetto o cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStato} onValueChange={(v) => v && setFilterStato(v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli stati</SelectItem>
                <SelectItem value="pianificato">Pianificato</SelectItem>
                <SelectItem value="in_corso">In Corso</SelectItem>
                <SelectItem value="in_pausa">In Pausa</SelectItem>
                <SelectItem value="completato">Completato</SelectItem>
                <SelectItem value="annullato">Annullato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project Cards */}
      {filteredProgetti.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nessun progetto trovato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProgetti.map((p) => (
            <Card key={p.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedProject === p.id ? 'ring-2 ring-[#1a2332]' : ''}`} onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{p.nome}</p>
                    {p.clienteNome && <p className="text-xs text-muted-foreground">{p.clienteNome}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className={`text-xs ${statoBadge[p.stato]}`}>{statoLabel[p.stato]}</Badge>
                    {/* Detail Eye Button */}
                    <button
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setDetailProject(p); }}
                      title="Dettaglio progetto"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* TODO: edit project dialog */ }}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />Modifica
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!detailProject} onOpenChange={(open) => { if (!open) setDetailProject(null); }}>
        <DialogContent className="sm:max-w-lg">
          {detailProject && (() => {
            const detailTasks = tasks.filter((t) => t.progettoId === detailProject.id);
            const tasksByStato = taskFasi.reduce((acc, fase) => {
              acc[fase] = detailTasks.filter((t) => t.stato === fase).length;
              return acc;
            }, {} as Record<string, number>);
            const totalOreStimate = detailTasks.reduce((s, t) => s + (t.oreStimate || 0), 0);
            const totalOreEffettive = detailTasks.reduce((s, t) => s + (t.oreEffettive || 0), 0);

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    {detailProject.nome}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Stato + Completamento */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs ${statoBadge[detailProject.stato]}`}>{statoLabel[detailProject.stato]}</Badge>
                    <span className="text-sm font-semibold">{detailProject.completamento}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a2332] rounded-full transition-all" style={{ width: `${detailProject.completamento}%` }} />
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {detailProject.clienteNome && (
                      <>
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">{detailProject.clienteNome}</span>
                      </>
                    )}
                    <span className="text-muted-foreground">Responsabile</span>
                    <span className="font-medium">{detailProject.responsabileNome}</span>
                    <span className="text-muted-foreground">Data Inizio</span>
                    <span className="font-medium">{formatDate(detailProject.dataInizio)}</span>
                    <span className="text-muted-foreground">Data Fine Prevista</span>
                    <span className="font-medium">{formatDate(detailProject.dataFinePrevista)}</span>
                    {detailProject.budget != null && (
                      <>
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">{formatCurrency(detailProject.budget)}</span>
                      </>
                    )}
                  </div>

                  {/* Descrizione */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Descrizione</p>
                    <p className="text-sm">{detailProject.descrizione}</p>
                  </div>

                  {/* Tasks Summary */}
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ListTodo className="h-4 w-4" />Riepilogo Task ({detailTasks.length})</p>
                    {detailTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nessun task associato</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2">
                          {taskFasi.map((fase) => (
                            <div key={fase} className="text-center">
                              <p className="text-lg font-bold">{tasksByStato[fase]}</p>
                              <p className="text-xs text-muted-foreground">{taskStatoLabel[fase]}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>Ore stimate: <strong className="text-foreground">{totalOreStimate}h</strong></span>
                          <span>Ore effettive: <strong className="text-foreground">{totalOreEffettive}h</strong></span>
                        </div>
                        {/* Task list */}
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                          {detailTasks.map((t) => (
                            <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded border bg-muted/30">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{t.titolo}</p>
                                <p className="text-muted-foreground">{t.assegnatoNome} &middot; {formatDate(t.dataScadenza)}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <Badge variant="secondary" className={`text-xs ${prioritaBadge[t.priorita]}`}>{t.priorita}</Badge>
                                <Badge variant="secondary" className={`text-xs ${statoBadge[t.stato] || 'bg-gray-100 text-gray-800'}`}>{taskStatoLabel[t.stato]}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Task Kanban for selected project */}
      {selectedProject && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Task — {progetti.find((p) => p.id === selectedProject)?.nome}</h3>
            {/* New Task Dialog */}
            <Dialog open={newTaskOpen} onOpenChange={(open) => { setNewTaskOpen(open); if (!open) resetNewTaskForm(); }}>
              <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
                <Plus className="mr-2 h-4 w-4" />Nuovo Task
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Nuovo Task</DialogTitle></DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateTask}>
                  <div className="grid gap-3">
                    <div>
                      <Label>Titolo *</Label>
                      <Input placeholder="Titolo del task" className="mt-1" required value={newTaskTitolo} onChange={(e) => setNewTaskTitolo(e.target.value)} />
                    </div>
                    <div>
                      <Label>Descrizione</Label>
                      <textarea className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={3} placeholder="Descrizione del task..." value={newTaskDescrizione} onChange={(e) => setNewTaskDescrizione(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Priorita</Label>
                        <Select value={newTaskPriorita} onValueChange={(v) => setNewTaskPriorita(v as 'bassa' | 'media' | 'alta' | 'urgente')}>
                          <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bassa">Bassa</SelectItem>
                            <SelectItem value="media">Media</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Assegnato a</Label>
                        <Input placeholder="Nome operatore" className="mt-1" value={newTaskAssegnato} onChange={(e) => setNewTaskAssegnato(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Data Scadenza</Label>
                        <Input type="date" className="mt-1" value={newTaskScadenza} onChange={(e) => setNewTaskScadenza(e.target.value)} />
                      </div>
                      <div>
                        <Label>Ore Stimate</Label>
                        <Input type="number" step="0.5" min="0" placeholder="0" className="mt-1" value={newTaskOre} onChange={(e) => setNewTaskOre(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? 'Salvataggio...' : 'Crea Task'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DndContext
            sensors={taskSensors}
            collisionDetection={closestCorners}
            onDragStart={handleTaskDragStart}
            onDragEnd={handleTaskDragEnd}
          >
            <div className="grid gap-3 lg:grid-cols-4">
              {taskFasi.map((fase) => {
                const faseTasks = projectTasks.filter((t) => t.stato === fase);
                return (
                  <Card key={fase} className={`border-t-4 ${taskStatoBorder[fase]}`}>
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider">{taskStatoLabel[fase]}</CardTitle>
                        <Badge variant="secondary" className="text-xs">{faseTasks.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      <TaskDroppableColumn id={fase}>
                        <SortableContext items={faseTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {faseTasks.map((task) => (
                              <SortableTaskCard
                                key={task.id}
                                task={task}
                                onAdvanceStatus={handleAdvanceTaskStatus}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </SortableContext>
                        {faseTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">--</p>}
                      </TaskDroppableColumn>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <DragOverlay>
              {activeDragTask ? (
                <div className="rounded-lg border p-2.5 bg-background shadow-xl ring-2 ring-primary/30 opacity-90 w-[200px]">
                  <p className="text-sm font-medium">{activeDragTask.titolo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className={`text-xs ${prioritaBadge[activeDragTask.priorita]}`}>{activeDragTask.priorita}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(activeDragTask.dataScadenza)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activeDragTask.assegnatoNome}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </PageContainer>
  );
}
