'use client';

import { useState, useMemo } from 'react';
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
import { prodotti, movimentiMagazzino } from '@/lib/mockdata';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Plus, MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react';

export default function MagazzinoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('tutte');

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

  const sottoscorta = prodotti.filter((p) => p.giacenza <= p.scorteMinime);
  const valoreInventario = prodotti.reduce((sum, p) => sum + p.prezzo * p.giacenza, 0);

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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {filtered.map((prodotto) => {
                    const isSottoscorta = prodotto.giacenza <= prodotto.scorteMinime;
                    return (
                      <TableRow key={prodotto.id} className="hover:bg-muted/50">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                  {movimentiMagazzino.map((mov) => (
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
    </PageContainer>
  );
}
