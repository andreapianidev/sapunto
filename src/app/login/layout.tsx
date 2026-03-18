import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accedi — Sapunto',
  description: 'Accedi alla piattaforma gestionale SaaS Sapunto per PMI italiane. CRM, fatturazione elettronica, magazzino e molto altro.',
  openGraph: {
    title: 'Sapunto — Gestionale SaaS per PMI',
    description: 'Piattaforma gestionale completa per piccole e medie imprese italiane',
    siteName: 'Sapunto',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
