'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  User,
  Search,
  ShoppingCart,
  FileText,
  LifeBuoy,
  FileSignature,
  UserPlus,
} from 'lucide-react';
import { MobileMenuButton } from './sidebar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';

export function Header() {
  const { user, tenant, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const notifications = [
    {
      id: 1,
      icon: ShoppingCart,
      text: 'Nuovo ordine #ORD-2026-078 ricevuto',
      time: '2 minuti fa',
      unread: true,
    },
    {
      id: 2,
      icon: FileText,
      text: 'Fattura FE-2026-0045 consegnata via SDI',
      time: '15 minuti fa',
      unread: true,
    },
    {
      id: 3,
      icon: LifeBuoy,
      text: 'Ticket #TK-008 assegnato a te',
      time: '1 ora fa',
      unread: true,
    },
    {
      id: 4,
      icon: FileSignature,
      text: 'Contratto CT-003 in scadenza tra 7 giorni',
      time: '3 ore fa',
      unread: false,
    },
    {
      id: 5,
      icon: UserPlus,
      text: 'Nuovo cliente aggiunto: Verdi Costruzioni',
      time: 'ieri',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-3">
        <MobileMenuButton />
        {tenant && (
          <>
            <h2 className="text-sm font-semibold text-foreground">
              {tenant.ragioneSociale}
            </h2>
            <Badge variant="secondary" className="text-xs">
              Piano {tenant.piano.charAt(0).toUpperCase() + tenant.piano.slice(1)}
            </Badge>
          </>
        )}
        {role === 'superadmin' && (
          <h2 className="text-sm font-semibold text-foreground">
            Pannello SuperAdmin
          </h2>
        )}
      </div>

      {/* Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca clienti, ordini, fatture..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                3
              </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <h4 className="text-sm font-semibold">Notifiche</h4>
              <button className="text-xs text-primary hover:underline">
                Segna tutte come lette
              </button>
            </div>
            <Separator />
            <ScrollArea className="max-h-[320px]">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-tight ${
                          notification.unread
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {notification.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.time}
                      </p>
                    </div>
                    {notification.unread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </ScrollArea>
            <Separator />
            <div className="p-2 text-center">
              <button className="text-xs text-primary hover:underline">
                Vedi tutte le notifiche
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 rounded-md hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#1a2332] text-white text-xs">
                  {user ? getInitials(user.nome, user.cognome) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">
                  {user ? `${user.nome} ${user.cognome}` : 'Utente'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {role === 'superadmin'
                    ? 'Super Admin'
                    : role === 'tenant_admin'
                    ? 'Amministratore'
                    : 'Operatore'}
                </p>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profilo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
