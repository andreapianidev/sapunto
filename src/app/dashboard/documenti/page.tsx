'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchDocumenti, createDocumento, updateDocumento, deleteDocumento } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import {
  FolderOpen, Upload, Search, Download, Trash2, Pencil, MoreHorizontal,
  FileText, FileImage, FileSpreadsheet, File, Loader2, Save, HardDrive,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Documento } from '@/lib/types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime === 'text/csv') return FileSpreadsheet;
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('document') || mime === 'text/plain') return FileText;
  return File;
}

function getFileTypeLabel(mime: string): string {
  if (mime.startsWith('image/')) return 'Immagine';
  if (mime === 'application/pdf') return 'PDF';
  if (mime === 'text/csv') return 'CSV';
  if (mime === 'text/plain') return 'Testo';
  if (mime.includes('word')) return 'Word';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'Excel';
  if (mime.includes('zip')) return 'ZIP';
  return 'File';
}

export default function DocumentiPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const userId = user?.id;
  const userName = user ? `${user.nome} ${user.cognome}` : 'Utente';
  const [documenti, loading, refresh] = useServerData<Documento[]>(
    () => fetchDocumenti(tenantId!),
    []
  );

  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('tutti');
  const [uploading, setUploading] = useState(false);
  const [editDoc, setEditDoc] = useState<Documento | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editCartella, setEditCartella] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const filtered = useMemo(() => {
    let list = documenti;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.nome.toLowerCase().includes(q) ||
        d.nomeOriginale.toLowerCase().includes(q) ||
        d.caricatoDaNome.toLowerCase().includes(q) ||
        (d.cartella && d.cartella.toLowerCase().includes(q))
      );
    }
    if (filterTipo !== 'tutti') {
      list = list.filter(d => getFileTypeLabel(d.tipoMime).toLowerCase() === filterTipo);
    }
    return list;
  }, [documenti, search, filterTipo]);

  const totalSize = useMemo(() => documenti.reduce((sum, d) => sum + d.dimensione, 0), [documenti]);

  const tipiPresenti = useMemo(() => {
    const set = new Set(documenti.map(d => getFileTypeLabel(d.tipoMime).toLowerCase()));
    return Array.from(set).sort();
  }, [documenti]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !tenantId || !userId) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/upload?folder=documenti/${tenantId}`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          window.alert(err.error || 'Errore durante il caricamento');
          continue;
        }

        const blob = await res.json();

        await createDocumento({
          tenantId,
          nome: file.name,
          nomeOriginale: file.name,
          dimensione: file.size,
          tipoMime: file.type || 'application/octet-stream',
          url: blob.url,
          pathname: blob.pathname,
          caricatoDa: userId,
          caricatoDaNome: userName || 'Utente',
        });
      }
      refresh();
      setUploadDialogOpen(false);
    } catch (e) {
      window.alert('Errore durante il caricamento: ' + String(e));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [tenantId, userId, userName, refresh]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleEdit = useCallback((doc: Documento) => {
    setEditDoc(doc);
    setEditNome(doc.nome);
    setEditNote(doc.note || '');
    setEditCartella(doc.cartella || '');
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editDoc) return;
    setSaving(true);
    try {
      await updateDocumento(editDoc.id, {
        nome: editNome,
        note: editNote || null,
        cartella: editCartella || null,
      });
      refresh();
      setEditDialogOpen(false);
    } catch (e) {
      window.alert('Errore: ' + String(e));
    } finally {
      setSaving(false);
    }
  }, [editDoc, editNome, editNote, editCartella, refresh]);

  const handleDelete = useCallback(async (doc: Documento) => {
    if (!window.confirm(`Eliminare "${doc.nome}"?`)) return;
    const result = await deleteDocumento(doc.id, doc.url);
    if (result.ok) {
      refresh();
    } else {
      window.alert('Errore: ' + (result.error || 'Errore sconosciuto'));
    }
  }, [refresh]);

  if (!tenantId) {
    return (
      <PageContainer title="Documenti" description="Gestione file e documenti condivisi">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
          <p>Accedi per visualizzare i documenti</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Documenti"
      description="Gestione file e documenti condivisi"
      actions={
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
            <Upload className="h-4 w-4 mr-2" />Carica File
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Carica Documenti</DialogTitle>
            </DialogHeader>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">Trascina i file qui</p>
              <p className="text-xs text-muted-foreground mt-1">oppure clicca per selezionare</p>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                className="mt-3"
                onChange={(e) => handleUpload(e.target.files)}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.csv,.doc,.docx,.xls,.xlsx,.zip,.txt"
              />
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Caricamento in corso...</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Formati accettati: Immagini, PDF, CSV, Word, Excel, ZIP, TXT. Max 10 MB per file.
            </p>
          </DialogContent>
        </Dialog>
      }
    >
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documenti.length}</p>
              <p className="text-xs text-muted-foreground">Documenti Totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-muted-foreground">Spazio Utilizzato</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca documenti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="tutti">Tutti i tipi</option>
          {tipiPresenti.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {documenti.length === 0 ? 'Nessun documento caricato' : 'Nessun risultato trovato'}
          </p>
          <p className="text-sm mt-1">
            {documenti.length === 0 ? 'Carica il tuo primo file per iniziare' : 'Prova a modificare i filtri di ricerca'}
          </p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Dimensione</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Caricato da</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Data</th>
                  <th className="px-4 py-3 text-right font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const Icon = getFileIcon(doc.tipoMime);
                  return (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.nome}</p>
                            {doc.cartella && (
                              <p className="text-xs text-muted-foreground truncate">{doc.cartella}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                          {getFileTypeLabel(doc.tipoMime)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatFileSize(doc.dimensione)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {doc.caricatoDaNome}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatDate(doc.dataCaricamento)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                              <Download className="h-4 w-4 mr-2" />Scarica
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(doc)}>
                              <Pencil className="h-4 w-4 mr-2" />Modifica
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(doc)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>
            <div>
              <Label>Cartella</Label>
              <Input
                value={editCartella}
                onChange={(e) => setEditCartella(e.target.value)}
                placeholder="Es. contratti, fatture, altro..."
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Note opzionali..."
              />
            </div>
            <Button onClick={handleSaveEdit} disabled={saving || !editNome.trim()} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salva Modifiche
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
