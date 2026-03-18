'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { emails } from '@/lib/mockdata';
import { formatDateTime } from '@/lib/utils';
import { Search, Plus, Mail, Send, Inbox, Archive, Circle } from 'lucide-react';
import type { Email } from '@/lib/types';

export default function MailboxPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filterTipo, setFilterTipo] = useState<'tutte' | 'ricevuta' | 'inviata'>('tutte');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <PageContainer
      title="Mailbox"
      description={`${nonLette} messaggi non letti`}
      actions={
        <Button size="sm" className="bg-[#1a2332] hover:bg-[#1a2332]/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Email
        </Button>
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
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-muted' : ''
                  } ${!email.letto ? 'bg-blue-50/50' : ''}`}
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
                        <span className="text-[10px] text-muted-foreground shrink-0">
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
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {email.clienteNome}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
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
