'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Calendar,
  Mail,
  Wallet,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  CreditCard,
  BarChart3,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const tenantNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clienti', href: '/dashboard/clienti', icon: Users },
  { label: 'Ordini', href: '/dashboard/ordini', icon: ShoppingCart },
  { label: 'Magazzino', href: '/dashboard/magazzino', icon: Package },
  { label: 'Fatture', href: '/dashboard/fatture', icon: FileText },
  { label: 'Appuntamenti', href: '/dashboard/appuntamenti', icon: Calendar },
  { label: 'Mailbox', href: '/dashboard/mailbox', icon: Mail },
  { label: 'Payroll', href: '/dashboard/payroll', icon: Wallet },
  { label: 'E-commerce', href: '/dashboard/ecommerce', icon: ShoppingBag },
  { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
];

const superadminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { label: 'Tenant', href: '/superadmin/tenant', icon: Building2 },
  { label: 'Piani', href: '/superadmin/piani', icon: BarChart3 },
  { label: 'Billing', href: '/superadmin/billing', icon: CreditCard },
  { label: 'API Docs', href: '/api-docs', icon: BookOpen },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const navItems = role === 'superadmin' ? superadminNavItems : tenantNavItems;

  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === '/dashboard' || item.href === '/superadmin'
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#1a2332] text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Desktop sidebar
export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { role } = useAuth();
  const pathname = usePathname();
  const navItems = role === 'superadmin' ? superadminNavItems : tenantNavItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex-col hidden lg:flex',
        collapsed ? 'w-[68px]' : 'w-[250px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href={role === 'superadmin' ? '/superadmin' : '/dashboard'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a2332] text-white font-bold text-sm shrink-0">
            S
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-[#1a2332]">Sapunto</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard' || item.href === '/superadmin'
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#1a2332] text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}

// Mobile sidebar (overlay)
export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { role } = useAuth();

  if (!mobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={() => setMobileOpen(false)}
      />
      {/* Panel */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-[280px] bg-card border-r border-border flex flex-col lg:hidden animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href={role === 'superadmin' ? '/superadmin' : '/dashboard'} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a2332] text-white font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold text-[#1a2332]">Sapunto</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </nav>
      </aside>
    </>
  );
}

// Hamburger button for mobile
export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();

  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
