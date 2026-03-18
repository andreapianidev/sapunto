'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User } from 'lucide-react';
import { MobileMenuButton } from './sidebar';
import { Button } from '@/components/ui/button';
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>

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
