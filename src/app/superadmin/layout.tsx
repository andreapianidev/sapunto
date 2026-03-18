'use client';

import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (!user || role !== 'superadmin') {
      router.push('/login');
    }
  }, [user, role, router]);

  if (!user || role !== 'superadmin') return null;

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
