'use client';

import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { collapsed } = useSidebar();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332]" />
      </div>
    );
  }

  if (!user) return null; // middleware handles redirect

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar />
      <div className={cn(
        'transition-all duration-300',
        collapsed ? 'lg:pl-[68px]' : 'lg:pl-[250px]'
      )}>
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
