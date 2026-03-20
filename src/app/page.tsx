import Link from 'next/link';
import {
  FileText, ShoppingCart, BarChart3, Users, Package, Calendar,
  Shield, Zap, Check, ArrowRight, CreditCard, Building,
  ChevronRight, Star, Clock, Globe, HeadphonesIcon, Lock,
  TrendingUp, Layers, RefreshCw, Settings, Mail, Briefcase,
  CheckCircle2, ArrowDown, Smartphone, Cloud, Database,
  MessageSquare, Receipt, Truck, Target, PieChart, Wallet,
} from 'lucide-react';

/* ── Pricing Data ─────────────────────────────────────────── */

const piani = [
  {
    id: 'express',
    nome: 'Express',
    prezzo: '69',
    periodo: '/anno',
    periodoFull: 'all\'anno',
    descrizione: 'Solo fatturazione elettronica — ideale per professionisti e micro imprese',
    highlight: false,
    cta: 'Inizia con Express',
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
    periodoFull: 'al mese',
    descrizione: 'Piattaforma e-commerce integrata — connetti il tuo shop online',
    highlight: false,
    cta: 'Inizia con Explore',
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
    periodoFull: 'al mese',
    descrizione: 'Suite completa con Project Management e statistiche avanzate',
    highlight: true,
    cta: 'Inizia con Experience',
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

/* ── Features Data ────────────────────────────────────────── */

const funzionalitaPrimarie = [
  {
    icon: FileText,
    titolo: 'Fatturazione Elettronica',
    desc: 'Crea e invia fatture in formato FatturaPA direttamente allo SDI. Gestisci note di credito, fatture proforma e ricevute con un click.',
    badge: 'Core',
  },
  {
    icon: ShoppingCart,
    titolo: 'E-commerce Integrato',
    desc: 'Collega WooCommerce, PrestaShop e Shopify. Sincronizza ordini, prodotti e inventario in tempo reale.',
    badge: 'Integrazione',
  },
  {
    icon: Users,
    titolo: 'CRM Clienti e Lead',
    desc: 'Gestisci anagrafiche, storico ordini, pipeline commerciale e segmentazione clienti con kanban board.',
    badge: 'Vendite',
  },
  {
    icon: Package,
    titolo: 'Magazzino e Inventario',
    desc: 'Controlla giacenze, movimenti di carico/scarico, avvisi sottoscorta e gestisci più magazzini.',
    badge: 'Logistica',
  },
  {
    icon: BarChart3,
    titolo: 'Report e Statistiche',
    desc: 'Dashboard con KPI in tempo reale, andamento vendite, analisi per canale, margini e trend.',
    badge: 'Analytics',
  },
  {
    icon: Calendar,
    titolo: 'Project Management',
    desc: 'Gestisci progetti con task, milestone, timetracking e monitora lo stato di avanzamento del team.',
    badge: 'Gestione',
  },
];

const funzionalitaSecondarie = [
  { icon: Receipt, titolo: 'Preventivi e Ordini', desc: 'Da preventivo a ordine a fattura, tutto collegato.' },
  { icon: Briefcase, titolo: 'Contratti', desc: 'Gestisci rinnovi, scadenze e condizioni contrattuali.' },
  { icon: Wallet, titolo: 'Spese e Note Spese', desc: 'Traccia spese aziendali con approvazione workflow.' },
  { icon: Target, titolo: 'Pipeline Commerciale', desc: 'Kanban board per gestire le trattative in corso.' },
  { icon: Mail, titolo: 'Mailbox Integrata', desc: 'Email centralizzata collegata ai clienti e ai ticket.' },
  { icon: HeadphonesIcon, titolo: 'Ticket e Supporto', desc: 'Sistema di ticketing con SLA e conversazioni.' },
  { icon: Truck, titolo: 'DDT e Spedizioni', desc: 'Documenti di trasporto e tracciamento spedizioni.' },
  { icon: PieChart, titolo: 'Payroll e Cedolini', desc: 'Calcolo buste paga con tassazione italiana.' },
];

/* ── Testimonials Data ────────────────────────────────────── */

const testimonianze = [
  {
    nome: 'Marco Bianchi',
    ruolo: 'CEO, TechStore Milano',
    testo: 'Da quando usiamo Sapunto abbiamo dimezzato il tempo dedicato alla fatturazione. L\'integrazione con il nostro e-commerce WooCommerce è stata immediata.',
    stelle: 5,
  },
  {
    nome: 'Laura Rossi',
    ruolo: 'Titolare, Rossi Arredamenti',
    testo: 'Finalmente un gestionale pensato davvero per le PMI italiane. L\'invio allo SDI funziona perfettamente e il supporto è sempre disponibile.',
    stelle: 5,
  },
  {
    nome: 'Giuseppe Verdi',
    ruolo: 'Direttore, Verdi & Partners',
    testo: 'Il Project Management integrato ci ha permesso di eliminare due tool separati. Sapunto è tutto quello che ci serviva in un\'unica piattaforma.',
    stelle: 5,
  },
];

/* ── Vantaggi Data ────────────────────────────────────────── */

const vantaggi = [
  {
    icon: Zap,
    titolo: 'Operativo in 5 minuti',
    desc: 'Nessuna installazione, nessun server. Registrati, configura la P.IVA e inizia a fatturare.',
  },
  {
    icon: Shield,
    titolo: 'Dati sicuri in Italia',
    desc: 'Server in Italia con crittografia AES-256, backup giornalieri e isolamento completo tra aziende.',
  },
  {
    icon: Globe,
    titolo: 'Accessibile ovunque',
    desc: 'Lavora da computer, tablet o smartphone. Interfaccia responsive pensata per ogni dispositivo.',
  },
  {
    icon: RefreshCw,
    titolo: 'Aggiornamenti automatici',
    desc: 'Nuove funzionalità e aggiornamenti normativi senza interruzioni. Sempre alla versione più recente.',
  },
  {
    icon: Layers,
    titolo: 'Multi-tenant nativo',
    desc: 'Ogni azienda ha il proprio spazio isolato con dati, utenti e configurazioni indipendenti.',
  },
  {
    icon: Settings,
    titolo: 'API e integrazioni',
    desc: 'API REST documentata per integrare Sapunto con i tuoi sistemi esistenti e automatizzare i processi.',
  },
];

/* ── Confronto Data ───────────────────────────────────────── */

const confronto = [
  { funzione: 'Fatturazione Elettronica SDI', sapunto: true, altri: true },
  { funzione: 'CRM e Pipeline Vendite', sapunto: true, altri: true },
  { funzione: 'Integrazione E-commerce nativa', sapunto: true, altri: false },
  { funzione: 'Project Management integrato', sapunto: true, altri: false },
  { funzione: 'Multi-tenant isolato', sapunto: true, altri: false },
  { funzione: 'Payroll con tassazione italiana', sapunto: true, altri: false },
  { funzione: 'Nessuna installazione richiesta', sapunto: true, altri: false },
  { funzione: 'Prezzo trasparente, no costi nascosti', sapunto: true, altri: false },
];

/* ── FAQ Data ─────────────────────────────────────────────── */

const faqs = [
  {
    q: 'Quante fatture posso emettere al mese?',
    a: 'Tutti i piani includono 150 fatture al mese. Se hai bisogno di un volume maggiore, contattaci per una soluzione personalizzata su misura per la tua azienda.',
  },
  {
    q: 'Posso aggiungere altri utenti?',
    a: 'Tutti i piani includono 1 utente. Puoi aggiungere utenti aggiuntivi al costo di €19/mese ciascuno, senza limiti. Ogni utente ha le proprie credenziali e permessi personalizzabili.',
  },
  {
    q: 'Come funziona il pagamento?',
    a: 'Accettiamo pagamenti tramite PayPal e bonifico bancario. Il piano Express si paga annualmente (€69/anno), mentre Explore e Experience si pagano mensilmente. Riceverai fattura per ogni pagamento.',
  },
  {
    q: 'I miei dati sono al sicuro?',
    a: 'Assolutamente. I dati sono ospitati su server sicuri in Italia con backup giornalieri, crittografia AES-256, isolamento completo tra i tenant e conformità GDPR.',
  },
  {
    q: 'Posso cambiare piano in qualsiasi momento?',
    a: 'Sì, puoi fare upgrade o downgrade del tuo piano in qualsiasi momento direttamente dal pannello di controllo. La differenza verrà calcolata pro-rata.',
  },
  {
    q: 'Offrite una prova gratuita?',
    a: 'Sì! Puoi provare Sapunto gratuitamente per 14 giorni con tutte le funzionalità del piano Experience. Nessuna carta di credito richiesta per iniziare.',
  },
  {
    q: 'Quali piattaforme e-commerce supportate?',
    a: 'Supportiamo WooCommerce, PrestaShop e Shopify con sincronizzazione bidirezionale di ordini, prodotti e inventario. Nuove integrazioni vengono aggiunte regolarmente.',
  },
  {
    q: 'Come funziona l\'invio allo SDI?',
    a: 'Sapunto è collegato direttamente al Sistema di Interscambio (SDI) dell\'Agenzia delle Entrate. Le fatture vengono inviate automaticamente in formato FatturaPA XML e ricevi le notifiche di esito in tempo reale.',
  },
  {
    q: 'Posso importare i dati dal mio gestionale attuale?',
    a: 'Sì, offriamo strumenti di importazione per anagrafiche clienti, prodotti e storico fatture tramite file CSV/Excel. Il nostro team di supporto può assisterti nella migrazione.',
  },
  {
    q: 'Sapunto funziona su mobile?',
    a: 'Sì, l\'interfaccia è completamente responsive e ottimizzata per smartphone e tablet. Puoi gestire la tua azienda ovunque ti trovi, senza bisogno di installare app.',
  },
  {
    q: 'C\'è un contratto minimo?',
    a: 'No, nessun vincolo contrattuale. Puoi disdire in qualsiasi momento. Il piano Express è annuale, mentre Explore e Experience sono mensili senza penali di uscita.',
  },
  {
    q: 'Come funziona il supporto tecnico?',
    a: 'Il piano Express include supporto via email. Explore ha supporto prioritario con risposta garantita entro 4 ore lavorative. Experience include un account manager dedicato e supporto telefonico.',
  },
];

/* ── Integrazioni Data ────────────────────────────────────── */

const integrazioni = [
  'WooCommerce', 'PrestaShop', 'Shopify', 'PayPal',
  'Agenzia delle Entrate (SDI)', 'Stripe', 'Mailchimp', 'Zapier',
];

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>

      {/* ── Announcement Bar ────────────────────────────────── */}
      <div className="bg-[#1a2332] text-center py-2.5 px-4">
        <p className="text-sm text-blue-200">
          <Zap className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          <strong className="text-white">Prova gratuita 14 giorni</strong> — Nessuna carta di credito richiesta.{' '}
          <Link href="/login" className="underline underline-offset-2 text-cyan-300 hover:text-white transition-colors">
            Inizia ora &rarr;
          </Link>
        </p>
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#2d4a6f] text-white flex items-center justify-center font-bold text-lg shadow-md">
                S
              </div>
              <span className="text-xl font-bold text-[#1a2332] tracking-tight">Sapunto</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#funzionalita" className="hover:text-[#1a2332] transition-colors">Funzionalit&agrave;</a>
              <a href="#vantaggi" className="hover:text-[#1a2332] transition-colors">Vantaggi</a>
              <a href="#prezzi" className="hover:text-[#1a2332] transition-colors">Prezzi</a>
              <a href="#testimonianze" className="hover:text-[#1a2332] transition-colors">Testimonianze</a>
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#1a2332] to-[#2d4a6f] px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#1a2332]/25 transition-all duration-300"
              >
                Prova Gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1620] via-[#1a2332] to-[#1e3a5f]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.3), transparent)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-5 py-2 text-sm text-blue-200 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              Piattaforma gestionale 100% italiana
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Gestisci la tua azienda.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300">
                Tutto in un unico posto.
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              Fatturazione elettronica, CRM, magazzino, e-commerce e project management.
              Sapunto è il gestionale SaaS pensato per le <strong className="text-white">piccole e medie imprese italiane</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#1a2332] hover:bg-gray-50 transition-all duration-300 shadow-2xl shadow-black/30 hover:shadow-black/40 hover:scale-[1.02]"
              >
                Inizia la Prova Gratuita
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#funzionalita"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 backdrop-blur-sm px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-all duration-300"
              >
                Scopri le Funzionalit&agrave;
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-200/70">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Dati protetti in Italia</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Setup in 5 minuti</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Nessuna carta richiesta</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Conforme GDPR</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-gradient-to-b from-white/5 to-transparent p-1">
              <div className="rounded-xl bg-[#1e293b] overflow-hidden">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="max-w-sm mx-auto bg-white/10 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                      app.sapunto.cloud/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup content */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Fatturato Mese', value: '€ 48.250', change: '+12.5%', color: 'text-green-400' },
                      { label: 'Ordini Attivi', value: '127', change: '+8.3%', color: 'text-green-400' },
                      { label: 'Clienti', value: '1.842', change: '+3.1%', color: 'text-green-400' },
                      { label: 'Ticket Aperti', value: '14', change: '-22%', color: 'text-green-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-gray-400">{stat.label}</p>
                        <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                        <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart area placeholder */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/5 h-40">
                      <p className="text-xs text-gray-400 mb-3">Andamento Vendite</p>
                      <div className="flex items-end gap-1.5 h-24">
                        {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 88, 100].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm bg-gradient-to-t from-blue-500/60 to-cyan-400/60"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 h-40">
                      <p className="text-xs text-gray-400 mb-3">Per Canale</p>
                      <div className="space-y-2.5 mt-2">
                        {[
                          { label: 'E-commerce', pct: 45, color: 'bg-blue-400' },
                          { label: 'Diretto', pct: 30, color: 'bg-cyan-400' },
                          { label: 'Telefono', pct: 15, color: 'bg-teal-400' },
                          { label: 'Altro', pct: 10, color: 'bg-gray-400' },
                        ].map((ch) => (
                          <div key={ch.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">{ch.label}</span>
                              <span className="text-gray-300">{ch.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Numbers ────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: '150+', label: 'Aziende italiane attive', icon: Building },
              { value: '50.000+', label: 'Fatture inviate allo SDI', icon: FileText },
              { value: '99.9%', label: 'Uptime garantito', icon: Cloud },
              { value: '4.9/5', label: 'Valutazione media clienti', icon: Star },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#1a2332]/5 text-[#1a2332] mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-[#1a2332] tracking-tight">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Funzionalita Principali ─────────────────────────── */}
      <section id="funzionalita" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
              Funzionalit&agrave;
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">
              Tutto ci&ograve; che serve alla tua azienda
            </h2>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed">
              Una piattaforma completa per gestire ogni aspetto del tuo business,
              dalla fatturazione al project management, con un&apos;unica interfaccia intuitiva.
            </p>
          </div>

          {/* Primary Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {funzionalitaPrimarie.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titolo}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-7 hover:border-[#1a2332]/20 hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a2332]/5 to-[#1a2332]/10 text-[#1a2332] group-hover:from-[#1a2332] group-hover:to-[#2d4a6f] group-hover:text-white transition-all duration-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a2332]/40 bg-[#1a2332]/5 px-2.5 py-1 rounded-full">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2332]">{f.titolo}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Secondary Features Strip */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-10">
            <h3 className="text-lg font-bold text-[#1a2332] mb-6">
              E molto altro ancora...
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {funzionalitaSecondarie.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.titolo} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                    <Icon className="h-5 w-5 text-[#1a2332]/60 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#1a2332]">{f.titolo}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Perché Sapunto (Vantaggi) ───────────────────────── */}
      <section id="vantaggi" className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
                Perch&eacute; Sapunto
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight leading-tight">
                Il gestionale pensato per chi lavora davvero
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Non un software generico adattato al mercato italiano, ma una piattaforma
                nata per le esigenze reali delle PMI italiane. Dalla fatturazione elettronica
                alla gestione del magazzino, tutto &egrave; progettato per semplificare.
              </p>

              <div className="mt-10 space-y-6">
                {vantaggi.slice(0, 3).map((v) => {
                  const Icon = v.icon;
                  return (
                    <div key={v.titolo} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a2332] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a2332]">{v.titolo}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{v.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Advantage cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vantaggi.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.titolo}
                    className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a2332]/5 to-[#1a2332]/10 text-[#1a2332] mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-[#1a2332] text-sm">{v.titolo}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Come Funziona ───────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
              Come funziona
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">
              Inizia in 3 semplici passi
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Dall&apos;iscrizione alla prima fattura in meno di 5 minuti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#1a2332]/20 via-[#1a2332]/20 to-[#1a2332]/20" />

            {[
              {
                step: '1',
                titolo: 'Registrati gratuitamente',
                desc: 'Crea il tuo account in pochi secondi. Nessuna carta di credito richiesta, nessun vincolo contrattuale.',
                icon: Smartphone,
              },
              {
                step: '2',
                titolo: 'Configura la tua azienda',
                desc: 'Inserisci i dati aziendali, P.IVA, codice destinatario SDI e personalizza il tuo spazio di lavoro.',
                icon: Settings,
              },
              {
                step: '3',
                titolo: 'Inizia a lavorare',
                desc: 'Fattura, gestisci ordini, monitora il magazzino e molto altro da qualsiasi dispositivo.',
                icon: TrendingUp,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative text-center">
                  <div className="relative z-10 mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#2d4a6f] text-white shadow-xl shadow-[#1a2332]/20 mb-6">
                    <div>
                      <span className="block text-3xl font-extrabold">{s.step}</span>
                      <Icon className="h-5 w-5 mx-auto mt-1 opacity-60" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2332]">{s.titolo}</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Confronto con la Concorrenza ────────────────────── */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
              Confronto
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">
              Sapunto vs altri gestionali
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Non tutti i gestionali sono uguali. Ecco cosa ci rende diversi.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider">Funzionalit&agrave;</th>
                  <th className="py-4 px-6 text-center">
                    <span className="text-sm font-bold text-[#1a2332]">Sapunto</span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="text-sm font-medium text-gray-400">Altri</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {confronto.map((row, i) => (
                  <tr key={row.funzione} className={i < confronto.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="py-3.5 px-6 text-sm text-gray-700">{row.funzione}</td>
                    <td className="py-3.5 px-6 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {row.altri ? (
                        <CheckCircle2 className="h-5 w-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-gray-300 text-lg">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Prezzi ──────────────────────────────────────────── */}
      <section id="prezzi" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
              Prezzi trasparenti
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">
              Scegli il piano giusto per te
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Tutti i piani includono 1 utente e 150 fatture/mese.
              Utenti aggiuntivi a soli <strong className="text-[#1a2332]">€19/mese</strong> ciascuno.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {piani.map((piano) => (
              <div
                key={piano.id}
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                  piano.highlight
                    ? 'bg-gradient-to-b from-[#1a2332] to-[#0f1620] text-white ring-4 ring-[#1a2332]/20 shadow-2xl shadow-[#1a2332]/20'
                    : 'bg-white border-2 border-gray-100 hover:border-[#1a2332]/20 shadow-sm hover:shadow-lg'
                }`}
              >
                {piano.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 px-5 py-1.5 text-xs font-bold text-white shadow-lg">
                      <Star className="h-3.5 w-3.5 fill-white" />
                      Pi&ugrave; Popolare
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className={`text-xl font-bold ${piano.highlight ? 'text-white' : 'text-[#1a2332]'}`}>
                    {piano.nome}
                  </h3>
                  <p className={`mt-2 text-sm min-h-[40px] ${piano.highlight ? 'text-blue-200/70' : 'text-gray-500'}`}>
                    {piano.descrizione}
                  </p>
                  <div className="mt-6 mb-2">
                    <span className={`text-5xl font-extrabold tracking-tight ${piano.highlight ? 'text-white' : 'text-[#1a2332]'}`}>
                      €{piano.prezzo}
                    </span>
                    <span className={`ml-1 ${piano.highlight ? 'text-blue-200/60' : 'text-gray-400'}`}>
                      {piano.periodo}
                    </span>
                  </div>
                  {piano.id === 'express' && (
                    <p className="text-xs text-gray-400">meno di €6 al mese</p>
                  )}
                </div>

                <div className={`my-6 h-px ${piano.highlight ? 'bg-white/10' : 'bg-gray-100'}`} />

                <ul className="space-y-3">
                  {piano.funzionalita.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className={`h-5 w-5 shrink-0 mt-0.5 ${piano.highlight ? 'text-cyan-300' : 'text-green-500'}`} />
                      <span className={piano.highlight ? 'text-blue-100/90' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/login"
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
                      piano.highlight
                        ? 'bg-white text-[#1a2332] hover:bg-gray-100 shadow-lg'
                        : 'bg-[#1a2332] text-white hover:bg-[#1a2332]/90 hover:shadow-lg'
                    }`}
                  >
                    {piano.cta}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-400 mb-4">Metodi di pagamento accettati</p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2.5 text-gray-400">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.283c-.413 0-.764.306-.828.72l-.848 5.36-.241 1.527a.433.433 0 0 1-.29.399z" />
                </svg>
                <span className="text-sm font-medium">PayPal</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2.5 text-gray-400">
                <Building className="h-7 w-7" />
                <span className="text-sm font-medium">Bonifico Bancario</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              Tutti i prezzi sono IVA esclusa. Ricevi fattura per ogni pagamento.
            </p>
          </div>
        </div>
      </section>

      {/* ── Integrazioni ────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2332] tracking-tight">
              Si integra con i tuoi strumenti
            </h2>
            <p className="mt-3 text-gray-500">
              Collega Sapunto alle piattaforme che usi ogni giorno.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {integrazioni.map((name) => (
              <div
                key={name}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md hover:border-[#1a2332]/20 transition-all"
              >
                <Database className="h-4 w-4 text-[#1a2332]/40" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonianze ───────────────────────────────────── */}
      <section id="testimonianze" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
              Testimonianze
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">
              Cosa dicono i nostri clienti
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonianze.map((t) => (
              <div
                key={t.nome}
                className="rounded-2xl bg-white border border-gray-100 p-7 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stelle }).map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  &ldquo;{t.testo}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a2332] to-[#2d4a6f] flex items-center justify-center text-white font-bold text-sm">
                    {t.nome.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a2332]">{t.nome}</p>
                    <p className="text-xs text-gray-400">{t.ruolo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-[#1a2332]/5 px-4 py-1.5 text-sm font-medium text-[#1a2332] mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">
              Domande frequenti
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Tutto quello che devi sapere su Sapunto. Non trovi la risposta?{' '}
              <a href="mailto:info@sapunto.cloud" className="text-[#1a2332] font-medium underline underline-offset-2">
                Scrivici
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-[#1a2332] text-[15px]">
                  <MessageSquare className="inline h-4 w-4 mr-2 text-[#1a2332]/40 -mt-0.5" />
                  {faq.q}
                </h3>
                <p className="mt-2.5 text-sm text-gray-500 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Finale ──────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1620] via-[#1a2332] to-[#1e3a5f]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 120%, rgba(59, 130, 246, 0.4), transparent)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-5 py-2 text-sm text-blue-200 mb-8">
            <Zap className="h-4 w-4" />
            14 giorni gratis, nessun vincolo
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Pronto a semplificare la gestione della tua azienda?
          </h2>
          <p className="mt-6 text-lg text-blue-100/70 max-w-xl mx-auto leading-relaxed">
            Unisciti a oltre 150 aziende italiane che hanno gi&agrave; scelto Sapunto per gestire
            fatturazione, clienti, magazzino e molto altro.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-4.5 text-base font-bold text-[#1a2332] hover:bg-gray-50 transition-all duration-300 shadow-2xl shadow-black/30 hover:scale-[1.02]"
            >
              Inizia la Prova Gratuita
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="mailto:info@sapunto.cloud"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 backdrop-blur-sm px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-all"
            >
              Contattaci
              <Mail className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-6 text-sm text-blue-200/50">
            Nessuna carta di credito richiesta &middot; Setup in 5 minuti &middot; Cancella quando vuoi
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#0a0f16] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white to-gray-200 text-[#1a2332] flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Sapunto</span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Piattaforma gestionale SaaS per piccole e medie imprese italiane.
                Fatturazione elettronica, CRM, magazzino, e-commerce e molto altro in un&apos;unica soluzione cloud.
              </p>
              <div className="mt-5 flex items-center gap-4 text-xs text-gray-500">
                <span>sapunto.com</span>
                <span>&middot;</span>
                <span>sapunto.cloud</span>
              </div>
            </div>

            {/* Prodotto */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-[11px]">Prodotto</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#funzionalita" className="hover:text-white transition-colors">Funzionalit&agrave;</a></li>
                <li><a href="#prezzi" className="hover:text-white transition-colors">Prezzi</a></li>
                <li><a href="#vantaggi" className="hover:text-white transition-colors">Vantaggi</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>

            {/* Risorse */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-[11px]">Risorse</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Contatti */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-[11px]">Contatti</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  info@sapunto.cloud
                </li>
                <li className="flex items-center gap-2">
                  <HeadphonesIcon className="h-3.5 w-3.5" />
                  support@sapunto.cloud
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Sapunto. Tutti i diritti riservati. P.IVA: 00000000000
            </p>
            <div className="flex gap-8 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Termini di Servizio</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
