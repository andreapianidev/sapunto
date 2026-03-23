'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchEmails, fetchClienti, createEmailRecord, updateEmailRecord, deleteEmailRecord } from '@/lib/actions/data';
import { useServerData } from '@/lib/hooks/use-server-data';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime, exportCSV } from '@/lib/utils';
import { Search, Plus, Mail, Send, Inbox, Archive, Circle, MoreHorizontal, Pencil, Trash2, Download, Forward } from 'lucide-react';
import type { Email } from '@/lib/types';

export default function MailboxPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 't-1';
  const [allData, loading, refresh] = useServerData(
    () => Promise.all([fetchEmails(tenantId), fetchClienti(tenantId)]),
    [[], []]
  );
  const emails = allData[0];
  const clienti = allData[1];

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filterTipo, setFilterTipo] = useState<'tutte' | 'ricevuta' | 'inviata'>('tutte');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dialog open state
  const [newEmailOpen, setNewEmailOpen] = useState(false);

  // --- New Email form state ---
  const [emailFormA, setEmailFormA] = useState('');
  const [emailFormOggetto, setEmailFormOggetto] = useState('');
  const [emailFormCliente, setEmailFormCliente] = useState('');
  const [emailFormCorpo, setEmailFormCorpo] = useState('');

  // --- Reset form ---
  const resetEmailForm = () => {
    setEmailFormA('');
    setEmailFormOggetto('');
    setEmailFormCliente('');
    setEmailFormCorpo('');
  };

  // --- Handle send email ---
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cliente = emailFormCliente ? clienti.find((c) => c.id === emailFormCliente) : null;
      const res = await createEmailRecord({
        tenantId,
        da: user?.email || 'utente@sapunto.it',
        a: emailFormA,
        oggetto: emailFormOggetto,
        corpo: emailFormCorpo,
        tipo: 'inviata',
        clienteId: emailFormCliente || undefined,
        clienteNome: cliente?.ragioneSociale || undefined,
      });
      if (!res.ok) {
        alert(`Errore: ${res.error}`);
      } else {
        resetEmailForm();
        setNewEmailOpen(false);
        refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle save draft ---
  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const cliente = emailFormCliente ? clienti.find((c) => c.id === emailFormCliente) : null;
      const res = await createEmailRecord({
        tenantId,
        da: user?.email || 'utente@sapunto.it',
        a: emailFormA,
        oggetto: emailFormOggetto || '(Bozza)',
        corpo: emailFormCorpo,
        tipo: 'bozza',
        clienteId: emailFormCliente || undefined,
        clienteNome: cliente?.ragioneSociale || undefined,
      });
      if (!res.ok) {
        alert(`Errore: ${res.error}`);
      } else {
        resetEmailForm();
        setNewEmailOpen(false);
        refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle delete email ---
  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Eliminare questa email?')) return;
    setSubmitting(true);
    try {
      const res = await deleteEmailRecord(id);
      if (!res.ok) {
        alert(`Errore: ${res.error}`);
      } else {
        if (selectedEmail?.id === id) setSelectedEmail(null);
        refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle mark as read ---
  const handleMarkAsRead = async (email: Email) => {
    if (!email.letto) {
      await updateEmailRecord(email.id, { letto: true });
      refresh();
    }
  };

  // TODO: Replace with Supabase query
  const filtered = emails.filter((e) => {
    const matchTipo = filterTipo === 'tutte' || e.tipo === filterTipo;
    const matchSearch =
      e.oggetto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.da.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  const nonLette = emails.filter((e) => !e.letto).length;

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <PageContainer
      title="Mailbox"
      description={`${nonLette} messaggi non letti`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered as unknown as Record<string, unknown>[], [{ key: 'da', label: 'Mittente' }, { key: 'oggetto', label: 'Oggetto' }, { key: 'data', label: 'Data' }, { key: 'letto', label: 'Letto' }], 'email')}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Dialog open={newEmailOpen} onOpenChange={(open) => { setNewEmailOpen(open); if (!open) resetEmailForm(); }}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-[#1a2332] text-white hover:bg-[#1a2332]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Email
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuova Email</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSendEmail}>
                <div className="grid gap-3">
                  <div>
                    <Label>A (destinatario) *</Label>
                    <Input type="email" placeholder="email@esempio.it" className="mt-1" required value={emailFormA} onChange={(e) => setEmailFormA(e.target.value)} />
                  </div>
                  <div>
                    <Label>Oggetto *</Label>
                    <Input placeholder="Oggetto dell'email" className="mt-1" required value={emailFormOggetto} onChange={(e) => setEmailFormOggetto(e.target.value)} />
                  </div>
                  <div>
                    <Label>Collega a Cliente</Label>
                    <Select value={emailFormCliente} onValueChange={(v) => v && setEmailFormCliente(v)}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Seleziona cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clienti.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.ragioneSociale}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Corpo</Label>
                    <textarea
                      placeholder="Scrivi il messaggio..."
                      rows={8}
                      className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={emailFormCorpo}
                      onChange={(e) => setEmailFormCorpo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" disabled={submitting} onClick={handleSaveDraft}>
                    {submitting ? 'Salvataggio...' : 'Salva Bozza'}
                  </Button>
                  <Button type="submit" className="bg-[#1a2332] hover:bg-[#1a2332]/90" disabled={submitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Invio...' : 'Invia'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-5 h-[calc(100vh-220px)]">
        {/* Email List */}
        <Card className="lg:col-span-2 flex flex-col">
          <div className="p-3 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-1">
              {(['tutte', 'ricevuta', 'inviata'] as const).map((tipo) => (
                <Button
                  key={tipo}
                  variant={filterTipo === tipo ? 'default' : 'ghost'}
                  size="sm"
                  className={`text-xs ${filterTipo === tipo ? 'bg-[#1a2332]' : ''}`}
                  onClick={() => setFilterTipo(tipo)}
                >
                  {tipo === 'tutte' && <Inbox className="mr-1 h-3.5 w-3.5" />}
                  {tipo === 'ricevuta' && <Mail className="mr-1 h-3.5 w-3.5" />}
                  {tipo === 'inviata' && <Send className="mr-1 h-3.5 w-3.5" />}
                  {tipo === 'tutte' ? 'Tutte' : tipo === 'ricevuta' ? 'Ricevute' : 'Inviate'}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filtered.map((email) => (
                <div
                  key={email.id}
                  className={`relative group ${
                    selectedEmail?.id === email.id ? 'bg-muted' : ''
                  } ${!email.letto ? 'bg-blue-50/50' : ''}`}
                >
                  <button
                    onClick={() => {
                      setSelectedEmail(email);
                      handleMarkAsRead(email);
                    }}
                    className="w-full text-left p-3 pr-10 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {!email.letto && (
                        <Circle className="mt-1.5 h-2 w-2 fill-blue-500 text-blue-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${!email.letto ? 'font-semibold' : 'font-medium'}`}>
                            {email.tipo === 'ricevuta' ? email.da.split('@')[0] : email.a.split('@')[0]}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDateTime(email.data).slice(0, 10)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${!email.letto ? 'font-medium' : ''}`}>
                          {email.oggetto}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {email.corpo.slice(0, 80)}...
                        </p>
                        {email.clienteNome && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {email.clienteNome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { handleMarkAsRead(email); setSelectedEmail(email); /* TODO: reply dialog */ }}>
                          <Mail className="mr-2 h-4 w-4" />Rispondi
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { handleMarkAsRead(email); setSelectedEmail(email); /* TODO: forward dialog */ }}>
                          <Forward className="mr-2 h-4 w-4" />Inoltra
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={submitting}
                          onClick={() => handleDeleteEmail(email.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Email Detail */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedEmail ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">{selectedEmail.oggetto}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Da: </span>
                      <span className="font-medium">{selectedEmail.da}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">A: </span>
                      <span className="font-medium">{selectedEmail.a}</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(selectedEmail.data)}
                  </p>
                </div>
                {selectedEmail.clienteNome && (
                  <Badge variant="outline" className="mt-2">
                    Collegata a: {selectedEmail.clienteNome}
                  </Badge>
                )}
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedEmail.corpo}
                </div>
              </ScrollArea>
              <div className="border-t p-3 flex gap-2">
                <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Rispondi
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="mr-2 h-4 w-4" />
                  Archivia
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Seleziona un messaggio per visualizzarlo</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
