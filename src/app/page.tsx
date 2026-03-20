import Link from 'next/link';
import {
  FileText, ShoppingCart, BarChart3, Users, Package, Calendar,
  Shield, Zap, Check, ArrowRight, CreditCard, Building,
  ChevronRight, Star,
} from 'lucide-react';

const piani = [
  {
    id: 'express',
    nome: 'Express',
    prezzo: '69',
    periodo: '/anno',
    descrizione: 'Solo fatturazione elettronica — ideale per professionisti e micro imprese',
    highlight: false,
    funzionalita: [
      'Fatturazione Elettronica',
      'Invio SDI automatico',
      '150 fatture/mese',
      '1 utente incluso',
      'Supporto Email',
    ],
  },
  {
    id: 'explore',
    nome: 'Explore',
    prezzo: '69',
    periodo: '/mese',
    descrizione: 'Piattaforma e-commerce integrata — connetti il tuo shop online',
    highlight: false,
    funzionalita: [
      'Tutto in Express',
      'CRM Clienti',
      'Gestione Ordini',
      'Magazzino',
      'Integrazione E-commerce',
      '1 utente incluso',
      'Supporto Prioritario',
    ],
  },
  {
    id: 'experience',
    nome: 'Experience',
    prezzo: '149',
    periodo: '/mese',
    descrizione: 'Suite completa con Project Management e statistiche avanzate',
    highlight: true,
    funzionalita: [
      'Tutto in Explore',
      'Project Management',
      'Statistiche Complete',
      'Payroll',
      'Gestione Contratti',
      'Report Avanzati',
      'API Access',
      '1 utente incluso',
      'Supporto Dedicato',
    ],
  },
];

const funzionalita = [
  {
    icon: FileText,
    titolo: 'Fatturazione Elettronica',
    desc: 'Crea e invia fatture in formato FatturaPA con integrazione SDI automatica.',
  },
  {
    icon: ShoppingCart,
    titolo: 'E-commerce Integrato',
    desc: 'Collega WooCommerce, PrestaShop e Shopify. Sincronizza ordini e inventario.',
  },
  {
    icon: Users,
    titolo: 'CRM Clienti',
    desc: 'Gestisci anagrafiche, storico ordini, comunicazioni e segmentazione clienti.',
  },
  {
    icon: Package,
    titolo: 'Magazzino',
    desc: 'Controlla giacenze, movimenti di carico/scarico e avvisi sottoscorta.',
  },
  {
    icon: BarChart3,
    titolo: 'Report e Statistiche',
    desc: 'Dashboard con KPI, andamento vendite, analisi per canale e trend.',
  },
  {
    icon: Calendar,
    titolo: 'Project Management',
    desc: 'Gestisci progetti, task, scadenze e monitora lo stato di avanzamento.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#1a2332] text-white flex items-center justify-center font-bold text-lg">
                S
              </div>
              <span className="text-xl font-bold text-[#1a2332]">Sapunto</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#funzionalita" className="hover:text-[#1a2332] transition-colors">Funzionalit&agrave;</a>
              <a href="#prezzi" className="hover:text-[#1a2332] transition-colors">Prezzi</a>
              <a href="#faq" className="hover:text-[#1a2332] transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-[#1a2332] transition-colors"
              >
                Accedi
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2332] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a2332]/90 transition-colors"
              >
                Prova Gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-blue-200 mb-6">
              <Zap className="h-4 w-4" />
              La piattaforma gestionale per le PMI italiane
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Gestisci la tua azienda.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Tutto in un unico posto.
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              Fatturazione elettronica, CRM, magazzino, e-commerce e project management.
              Sapunto è il gestionale SaaS pensato per le piccole e medie imprese italiane.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#1a2332] hover:bg-gray-100 transition-colors shadow-lg shadow-black/20"
              >
                Inizia la Prova Gratuita
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#prezzi"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                Scopri i Piani
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200/70">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Dati protetti in Italia
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                PayPal o Bonifico
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                Multi-tenant
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-[#1a2332]">150+</p>
              <p className="text-sm text-gray-500 mt-1">Aziende attive</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a2332]">50.000+</p>
              <p className="text-sm text-gray-500 mt-1">Fatture inviate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a2332]">99.9%</p>
              <p className="text-sm text-gray-500 mt-1">Uptime garantito</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">Valutazione clienti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Funzionalita */}
      <section id="funzionalita" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]">
              Tutto ciò che serve alla tua azienda
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Una piattaforma completa per gestire ogni aspetto del tuo business, dalla fatturazione al project management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funzionalita.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titolo}
                  className="group rounded-2xl border border-gray-100 p-6 hover:border-[#1a2332]/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2332]/5 text-[#1a2332] group-hover:bg-[#1a2332] group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1a2332]">{f.titolo}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prezzi */}
      <section id="prezzi" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]">
              Scegli il piano giusto per te
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Tutti i piani includono 1 utente e 150 fatture/mese.
              Utenti aggiuntivi a soli <strong>€19/mese</strong> ciascuno.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {piani.map((piano) => (
              <div
                key={piano.id}
                className={`relative rounded-2xl bg-white p-8 ${
                  piano.highlight
                    ? 'ring-2 ring-[#1a2332] shadow-xl scale-[1.02]'
                    : 'border border-gray-200 shadow-sm'
                }`}
              >
                {piano.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-[#1a2332] px-4 py-1 text-xs font-semibold text-white">
                      Più Completo
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#1a2332]">{piano.nome}</h3>
                  <p className="mt-2 text-sm text-gray-500 min-h-[40px]">{piano.descrizione}</p>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-[#1a2332]">€{piano.prezzo}</span>
                    <span className="text-gray-500 ml-1">{piano.periodo}</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-3">
                  {piano.funzionalita.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/login"
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                      piano.highlight
                        ? 'bg-[#1a2332] text-white hover:bg-[#1a2332]/90'
                        : 'border-2 border-[#1a2332] text-[#1a2332] hover:bg-[#1a2332] hover:text-white'
                    }`}
                  >
                    Inizia Ora
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {/* Payment methods */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 mb-4">Metodi di pagamento accettati</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-gray-500">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.283c-.413 0-.764.306-.828.72l-.848 5.36-.241 1.527a.433.433 0 0 1-.29.399z" />
                </svg>
                <span className="text-sm font-medium">PayPal</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2 text-gray-500">
                <Building className="h-6 w-6" />
                <span className="text-sm font-medium">Bonifico Bancario</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]">
              Inizia in 3 semplici passi
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2332] text-white text-xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a2332]">Registrati</h3>
              <p className="mt-2 text-sm text-gray-500">
                Crea il tuo account in pochi secondi. Nessuna carta di credito richiesta.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2332] text-white text-xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a2332]">Configura</h3>
              <p className="mt-2 text-sm text-gray-500">
                Inserisci i dati della tua azienda, P.IVA e codice destinatario.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2332] text-white text-xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a2332]">Inizia a lavorare</h3>
              <p className="mt-2 text-sm text-gray-500">
                Fattura, gestisci ordini e monitora il tuo business da qualsiasi dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332] text-center mb-12">
            Domande frequenti
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Quante fatture posso emettere al mese?',
                a: 'Tutti i piani includono 150 fatture al mese. Se hai bisogno di un volume maggiore, contattaci per una soluzione personalizzata.',
              },
              {
                q: 'Posso aggiungere altri utenti?',
                a: 'Tutti i piani includono 1 utente. Puoi aggiungere utenti aggiuntivi al costo di €19/mese ciascuno, senza limiti.',
              },
              {
                q: 'Come funziona il pagamento?',
                a: 'Accettiamo pagamenti tramite PayPal e bonifico bancario. Il piano Express si paga annualmente (€69/anno), mentre Explore e Experience si pagano mensilmente.',
              },
              {
                q: 'I miei dati sono al sicuro?',
                a: 'Assolutamente. I dati sono ospitati su server sicuri con backup giornalieri, crittografia e isolamento completo tra i tenant.',
              },
              {
                q: 'Posso cambiare piano in qualsiasi momento?',
                a: 'Sì, puoi fare upgrade o downgrade del tuo piano in qualsiasi momento. La differenza verrà calcolata pro-rata.',
              },
              {
                q: 'Offrite una prova gratuita?',
                a: 'Sì! Puoi provare Sapunto gratuitamente per 14 giorni con tutte le funzionalità del piano Experience.',
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl bg-white border border-gray-100 p-6">
                <h3 className="font-semibold text-[#1a2332]">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Pronto a semplificare la gestione della tua azienda?
          </h2>
          <p className="mt-4 text-lg text-blue-100/70">
            Inizia oggi con una prova gratuita di 14 giorni. Nessun vincolo.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#1a2332] hover:bg-gray-100 transition-colors shadow-lg"
            >
              Inizia la Prova Gratuita
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1620] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-white text-[#1a2332] flex items-center justify-center font-bold">
                  S
                </div>
                <span className="text-lg font-bold text-white">Sapunto</span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Piattaforma gestionale SaaS per piccole e medie imprese italiane.
                Fatturazione, CRM, magazzino e molto altro in un&apos;unica soluzione.
              </p>
              <div className="mt-4 text-xs text-gray-500">
                sapunto.com — sapunto.cloud
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Prodotto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#funzionalita" className="hover:text-white transition-colors">Funzionalità</a></li>
                <li><a href="#prezzi" className="hover:text-white transition-colors">Prezzi</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Contatti</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@sapunto.cloud</li>
                <li>Supporto: support@sapunto.cloud</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Sapunto. Tutti i diritti riservati.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300">Termini di Servizio</a>
              <a href="#" className="hover:text-gray-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
