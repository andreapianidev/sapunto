import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation — Sapunto',
  description: 'Documentazione API RESTful Sapunto. Integra il tuo gestionale con applicazioni esterne tramite le nostre API.',
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
