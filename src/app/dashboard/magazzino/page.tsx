'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { prodotti, movimentiMagazzino } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Plus, MoreHorizontal, Pencil, Trash2, Download, Eye } from 'lucide-react';

export default function MagazzinoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('tutte');

  // Pagination state for inventario tab
  const [invPage, setInvPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(10);

  // Pagination state for movimenti tab
  const [movPage, setMovPage] = useState(1);
  const [movPageSize, setMovPageSize] = useState(10);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Detail view dialog state
  const [detailProduct, setDetailProduct] = useState<typeof prodotti[number] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // TODO: Replace with Supabase query
  const categorie = useMemo(() => {
    return Array.from(new Set(prodotti.map((p) => p.categoria))).sort();
  }, []);

  const filtered = useMemo(() => {
    return prodotti.filter((p) => {
      const matchSearch =
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategoria === 'tutte' || p.categoria === filterCategoria;
      return matchSearch && matchCat;
    });
  }, [searchTerm, filterCategoria]);

  // Reset inventario page when filters change
  useMemo(() => {
    setInvPage(1);
    setSelectedIds(new Set());
  }, [searchTerm, filterCategoria]);

  // Paginated slices
  const paginatedInv = useMemo(() => {
    const start = (invPage - 1) * invPageSize;
    return filtered.slice(start, start + invPageSize);
  }, [filtered, invPage, invPageSize]);

  const paginatedMov = useMemo(() => {
    const start = (movPage - 1) * movPageSize;
    return movimentiMagazzino.slice(start, start + movPageSize);
  }, [movPage, movPageSize]);

  const sottoscorta = prodotti.filter((p) => p.giacenza <= p.scorteMinime);
  const valoreInventario = prodotti.reduce((sum, p) => sum + p.prezzo * p.giacenza, 0);

  // Bulk selection helpers
  const allPageSelected = paginatedInv.length > 0 && paginatedInv.every((p) => selectedIds.has(p.id));
  const somePageSelected = paginatedInv.some((p) => selectedIds.has(p.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginatedInv.forEach((p) => next.delete(p.id));
      } else {
        paginatedInv.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }, [allPageSelected, paginatedInv]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Get recent movements for a product (for detail view)
  const getProductMovements = useCallback((productId: string) => {
    return movimentiMagazzino
      .filter((m) => m.prodottoId === productId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 10);
  }, []);

  return (
    <PageContainer
      title="Magazzino"
      description="Gestione inventario e movimenti"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => alert('Demo: Esportazione inventario in corso...')}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Movimento Magazzino
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuovo Movimento Magazzino</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Demo: Movimento magazzino registrato con successo!');
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="mov-prodotto">Prodotto *</Label>
                  <Select>
                    <SelectTrigger id="mov-prodotto">
                      <SelectValue placeholder="Seleziona prodotto" />
                    </SelectTrigger>
                    <SelectContent>
                      {prodotti.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mov-tipo">Tipo *</Label>
                  <Select>
                    <SelectTrigger id="mov-tipo">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carico">Carico</SelectItem>
                      <SelectItem value="scarico">Scarico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mov-quantita">Quantit&agrave;</Label>
                  <Input id="mov-quantita" type="number" min="1" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mov-motivo">Motivo</Label>
                  <Input id="mov-motivo" placeholder="es. Acquisto fornitore, Vendita..." />
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                  Registra Movimento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Prodotto
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuovo Prodotto</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Demo: Prodotto salvato con successo!');
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="prod-nome">Nome Prodotto *</Label>
                  <Input id="prod-nome" placeholder="Nome del prodotto" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-sku">SKU</Label>
                  <Input id="prod-sku" placeholder="es. MAT-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-categoria">Categoria</Label>
                  <Select>
                    <SelectTrigger id="prod-categoria">
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorie.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prod-prezzo">Prezzo</Label>
                    <Input id="prod-prezzo" type="number" step="0.01" min="0" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-unita">Unit&agrave; di misura</Label>
                    <Input id="prod-unita" placeholder="es. pz, kg, lt" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prod-giacenza">Giacenza iniziale</Label>
                    <Input id="prod-giacenza" type="number" min="0" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-scorta">Scorta minima</Label>
                    <Input id="prod-scorta" type="number" min="0" placeholder="0" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                  Salva Prodotto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{prodotti.length}</p>
              <p className="text-xs text-muted-foreground">Prodotti Totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(valoreInventario)}</p>
              <p className="text-xs text-muted-foreground">Valore Inventario</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sottoscorta.length}</p>
              <p className="text-xs text-muted-foreground">Sottoscorta</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categorie.length}</p>
              <p className="text-xs text-muted-foreground">Categorie</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventario">
        <TabsList>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="movimenti">Movimenti</TabsTrigger>
          <TabsTrigger value="sottoscorta">
            Sottoscorta
            {sottoscorta.length > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-xs px-1.5">
                {sottoscorta.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventario">
          <Card>
            <CardContent className="p-4 pb-0">
              <div className="flex flex-col gap-3 md:flex-row md:items-center mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per nome o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterCategoria} onValueChange={(v) => v && setFilterCategoria(v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutte">Tutte le categorie</SelectItem>
                    {categorie.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <CardContent className="p-4 pt-0 pb-0">
                <div className="flex items-center gap-3 rounded-lg bg-muted/60 border px-4 py-2.5 mb-2">
                  <span className="text-sm font-medium">
                    {selectedIds.size} {selectedIds.size === 1 ? 'elemento selezionato' : 'elementi selezionati'}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      alert(`Demo: Eliminazione di ${selectedIds.size} prodotti selezionati`);
                      setSelectedIds(new Set());
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina selezionati
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert(`Demo: Esportazione di ${selectedIds.size} prodotti selezionati`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Esporta selezionati
                  </Button>
                </div>
              </CardContent>
            )}

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] pl-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = somePageSelected && !allPageSelected;
                        }}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Prodotto</TableHead>
                    <TableHead className="hidden md:table-cell">SKU</TableHead>
                    <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                    <TableHead className="text-center">Giacenza</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Prezzo</TableHead>
                    <TableHead className="text-right">Valore</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInv.map((prodotto) => {
                    const isSottoscorta = prodotto.giacenza <= prodotto.scorteMinime;
                    const isSelected = selectedIds.has(prodotto.id);
                    return (
                      <TableRow key={prodotto.id} className={`hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}>
                        <TableCell className="pl-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(prodotto.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{prodotto.nome}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{prodotto.sku}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm font-mono">{prodotto.sku}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary" className="text-xs">{prodotto.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold text-sm ${isSottoscorta ? 'text-red-600' : ''}`}>
                            {prodotto.giacenza}
                          </span>
                          <span className="text-xs text-muted-foreground"> {prodotto.unita}</span>
                          {isSottoscorta && (
                            <AlertTriangle className="inline-block ml-1 h-3.5 w-3.5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm">
                          {formatCurrency(prodotto.prezzo)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {formatCurrency(prodotto.prezzo * prodotto.giacenza)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Detail view button */}
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                              onClick={() => {
                                setDetailProduct(prodotto);
                                setDetailOpen(true);
                              }}
                              title="Dettaglio prodotto"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => alert(`Demo: Modifica prodotto "${prodotto.nome}"`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Modifica
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Demo: Carico rapido per "${prodotto.nome}"`)}>
                                  <ArrowUpCircle className="h-4 w-4 mr-2 text-green-600" />
                                  <span className="text-green-600">Carico Rapido</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Demo: Scarico rapido per "${prodotto.nome}"`)}>
                                  <ArrowDownCircle className="h-4 w-4 mr-2 text-red-600" />
                                  <span className="text-red-600">Scarico Rapido</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => alert(`Demo: Eliminazione prodotto "${prodotto.nome}"`)}>
                                  <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                  <span className="text-red-600">Elimina</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination
                currentPage={invPage}
                totalItems={filtered.length}
                pageSize={invPageSize}
                onPageChange={setInvPage}
                onPageSizeChange={setInvPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimenti">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Prodotto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Quantità</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMov.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">{formatDate(mov.data)}</TableCell>
                      <TableCell className="text-sm font-medium">{mov.prodottoNome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {mov.tipo === 'carico' ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            mov.tipo === 'carico' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {mov.tipo === 'carico' ? 'Carico' : 'Scarico'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {mov.tipo === 'carico' ? '+' : '-'}{mov.quantita}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{mov.motivo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={movPage}
                totalItems={movimentiMagazzino.length}
                pageSize={movPageSize}
                onPageChange={setMovPage}
                onPageSizeChange={setMovPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sottoscorta">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prodotto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Giacenza</TableHead>
                    <TableHead className="text-center">Scorta Minima</TableHead>
                    <TableHead className="text-center">Da Ordinare</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sottoscorta.map((p) => (
                    <TableRow key={p.id} className="bg-red-50/50">
                      <TableCell className="font-medium text-sm">{p.nome}</TableCell>
                      <TableCell className="text-sm font-mono">{p.sku}</TableCell>
                      <TableCell className="text-center text-red-600 font-semibold text-sm">{p.giacenza}</TableCell>
                      <TableCell className="text-center text-sm">{p.scorteMinime}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {Math.max(0, p.scorteMinime * 2 - p.giacenza)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sottoscorta.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Tutti i prodotti sono sopra la scorta minima
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettaglio Prodotto</DialogTitle>
          </DialogHeader>
          {detailProduct && (() => {
            const movements = getProductMovements(detailProduct.id);
            const isSottoscorta = detailProduct.giacenza <= detailProduct.scorteMinime;
            return (
              <div className="space-y-5">
                {/* Product info grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="text-sm font-medium">{detailProduct.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SKU</p>
                    <p className="text-sm font-mono">{detailProduct.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categoria</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">{detailProduct.categoria}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prezzo</p>
                    <p className="text-sm font-semibold">{formatCurrency(detailProduct.prezzo)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Giacenza</p>
                    <p className={`text-sm font-semibold ${isSottoscorta ? 'text-red-600' : ''}`}>
                      {detailProduct.giacenza} {detailProduct.unita}
                      {isSottoscorta && (
                        <AlertTriangle className="inline-block ml-1 h-3.5 w-3.5 text-red-500" />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scorte Minime</p>
                    <p className="text-sm">{detailProduct.scorteMinime} {detailProduct.unita}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unità di misura</p>
                    <p className="text-sm">{detailProduct.unita}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valore in magazzino</p>
                    <p className="text-sm font-semibold">{formatCurrency(detailProduct.prezzo * detailProduct.giacenza)}</p>
                  </div>
                </div>

                {/* Recent movements mini table */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Movimenti Recenti</h4>
                  {movements.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs h-8">Data</TableHead>
                            <TableHead className="text-xs h-8">Tipo</TableHead>
                            <TableHead className="text-xs h-8 text-center">Qtà</TableHead>
                            <TableHead className="text-xs h-8">Motivo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movements.map((mov) => (
                            <TableRow key={mov.id}>
                              <TableCell className="text-xs py-1.5">{formatDate(mov.data)}</TableCell>
                              <TableCell className="py-1.5">
                                <div className="flex items-center gap-1">
                                  {mov.tipo === 'carico' ? (
                                    <ArrowUpCircle className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <ArrowDownCircle className="h-3.5 w-3.5 text-red-500" />
                                  )}
                                  <span className={`text-xs font-medium ${
                                    mov.tipo === 'carico' ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                    {mov.tipo === 'carico' ? 'Carico' : 'Scarico'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-center font-semibold py-1.5">
                                {mov.tipo === 'carico' ? '+' : '-'}{mov.quantita}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground py-1.5">{mov.motivo}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nessun movimento registrato per questo prodotto
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
