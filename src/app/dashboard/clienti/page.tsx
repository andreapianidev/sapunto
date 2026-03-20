'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { fetchClienti, fetchOrdini, fetchFatture } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatPIVA } from '@/lib/utils';
import { Search, Plus, Download, Upload, Eye, Building2, User as UserIcon, Save, MoreHorizontal, Pencil, Trash2, Copy, FileUp } from 'lucide-react';

export default function ClientiPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading] = useServerData(
    () => Promise.all([fetchClienti(tenantId), fetchOrdini(tenantId), fetchFatture(tenantId)]),
    [[], [], []]
  );
  const clienti = allData[0];
  const ordini = allData[1];
  const fatture = allData[2];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('tutti');
  const [filterTag, setFilterTag] = useState<string>('tutti');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredClienti.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClienti.map((c) => c.id)));
    }
  };

  // TODO: Replace with Supabase query
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    clienti.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [clienti]);

  const filteredClienti = useMemo(() => {
    return clienti.filter((c) => {
      const matchSearch =
        c.ragioneSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citta.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filterTipo === 'tutti' || c.tipo === filterTipo;
      const matchTag = filterTag === 'tutti' || c.tags.includes(filterTag);
      return matchSearch && matchTipo && matchTag;
    });
  }, [searchTerm, filterTipo, filterTag, clienti]);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Clienti"
      description={`${clienti.length} clienti totali`}
      actions={
        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
              <Upload className="mr-2 h-4 w-4" />
              Importa CSV
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Importa Clienti da CSV</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium">Trascina il file CSV qui</p>
                  <p className="text-xs text-muted-foreground mt-1">oppure clicca per selezionare</p>
                  <Input type="file" accept=".csv" className="mt-3" />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Formato richiesto:</p>
                  <p>Ragione Sociale, Tipo, P.IVA, CF, Email, Telefono, Indirizzo, Citta, CAP, Provincia</p>
                  <p className="mt-2">
                    <Button variant="link" className="h-auto p-0 text-xs" onClick={() => alert('Demo: download template CSV')}>
                      Scarica template CSV
                    </Button>
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowImportDialog(false)}>Annulla</Button>
                  <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90" onClick={() => { alert('Demo: importazione 15 clienti completata!'); setShowImportDialog(false); }}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => alert('Demo: esporta CSV!')}>
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Cliente
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuovo Cliente</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Demo: cliente creato!'); }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Ragione Sociale *</Label>
                    <Input placeholder="Es. Azienda S.r.l." className="mt-1" required />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select defaultValue="azienda">
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="azienda">Azienda</SelectItem>
                        <SelectItem value="privato">Privato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Partita IVA</Label>
                    <Input placeholder="01234567890" className="mt-1" />
                  </div>
                  <div>
                    <Label>Codice Fiscale</Label>
                    <Input placeholder="Codice fiscale" className="mt-1" />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" placeholder="email@azienda.it" className="mt-1" required />
                  </div>
                  <div>
                    <Label>Telefono</Label>
                    <Input placeholder="+39 02 1234567" className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Indirizzo</Label>
                    <Input placeholder="Via Roma 1" className="mt-1" />
                  </div>
                  <div>
                    <Label>Città</Label>
                    <Input placeholder="Milano" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>CAP</Label>
                      <Input placeholder="20121" className="mt-1" />
                    </div>
                    <div>
                      <Label>Provincia</Label>
                      <Input placeholder="MI" maxLength={2} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>PEC</Label>
                    <Input placeholder="azienda@pec.it" className="mt-1" />
                  </div>
                  <div>
                    <Label>Codice Destinatario</Label>
                    <Input placeholder="USAL8PV" maxLength={7} className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
                    <Save className="mr-2 h-4 w-4" />
                    Salva Cliente
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTipo} onValueChange={(v) => v && setFilterTipo(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i tipi</SelectItem>
                <SelectItem value="azienda">Azienda</SelectItem>
                <SelectItem value="privato">Privato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={(v) => v && setFilterTag(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i tag</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{selectedIds.size} selezionati</span>
              <Button variant="destructive" size="sm" onClick={() => alert('Demo: azione eseguita!')}>
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina selezionati
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert('Demo: azione eseguita!')}>
                <Download className="mr-2 h-4 w-4" />
                Esporta selezionati
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={filteredClienti.length > 0 && selectedIds.size === filteredClienti.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Ragione Sociale</TableHead>
                <TableHead className="hidden md:table-cell">P.IVA / C.F.</TableHead>
                <TableHead className="hidden lg:table-cell">Città</TableHead>
                <TableHead className="hidden lg:table-cell">Contatto</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClienti.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedIds.has(cliente.id)}
                      onChange={() => toggleSelect(cliente.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        cliente.tipo === 'azienda' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {cliente.tipo === 'azienda' ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cliente.ragioneSociale}</p>
                        <p className="text-xs text-muted-foreground">{cliente.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {cliente.partitaIva ? formatPIVA(cliente.partitaIva) : cliente.codiceFiscale}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {cliente.citta} ({cliente.provincia})
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {cliente.referente || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cliente.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {cliente.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{cliente.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/clienti/${cliente.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => alert('Demo: azione eseguita!')} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClienti.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Nessun cliente trovato con i filtri selezionati
            </div>
          )}
          <Pagination currentPage={currentPage} totalItems={filteredClienti.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
