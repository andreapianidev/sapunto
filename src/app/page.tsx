import Link from 'next/link';
import {
  FileText, ShoppingCart, BarChart3, Users, Package, Calendar,
  Shield, Zap, Check, ArrowRight, CreditCard, Building,
  ChevronRight, Star, Clock, Globe, HeadphonesIcon, Lock,
  TrendingUp, Layers, RefreshCw, Settings, Mail, Briefcase,
  CheckCircle2, ArrowDown, Smartphone, Cloud, Database,
  MessageSquare, Receipt, Truck, Target, PieChart, Wallet,
  Eye, Cpu, BookOpen, Phone, MapPin, ChevronDown,
  LayoutDashboard, CircleDollarSign, ShieldCheck, Server,
  BadgeCheck, Rocket, CircleCheck, Boxes, Workflow, Bell,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════ */

const piani = [
  {
    id: 'express',
    nome: 'Express',
    prezzo: '69',
    periodo: '/anno',
    periodoFull: "all'anno",
    descrizione: 'Solo fatturazione elettronica — ideale per professionisti e micro imprese che vogliono partire subito.',
    highlight: false,
    cta: 'Inizia con Express',
    icon: FileText,
    color: 'from-emerald-500 to-teal-600',
    funzionalita: [
      'Fatturazione Elettronica SDI',
      'Invio automatico allo SDI',
      '150 fatture al mese',
      '1 utente incluso',
      'Note di credito',
      'Fatture proforma',
      'Supporto via Email',
      'Backup giornalieri',
    ],
    nonIncluso: [
      'CRM Clienti',
      'Gestione Ordini',
      'Magazzino',
      'E-commerce',
    ],
  },
  {
    id: 'explore',
    nome: 'Explore',
    prezzo: '69',
    periodo: '/mese',
    periodoFull: 'al mese',
    descrizione: 'CRM, ordini, magazzino e integrazioni e-commerce — per chi vende online e in negozio.',
    highlight: false,
    cta: 'Inizia con Explore',
    icon: ShoppingCart,
    color: 'from-blue-500 to-indigo-600',
    funzionalita: [
      'Tutto di Express incluso',
      'CRM Clienti e Anagrafiche',
      'Gestione Ordini completa',
      'Magazzino e Inventario',
      'Integrazione E-commerce',
      'WooCommerce + PrestaShop',
      '1 utente incluso',
      'Pipeline Commerciale',
      'Import/Export CSV',
      'Supporto Prioritario (4h)',
    ],
    nonIncluso: [
      'Project Management',
      'Payroll',
      'Report Avanzati',
    ],
  },
  {
    id: 'experience',
    nome: 'Experience',
    prezzo: '149',
    periodo: '/mese',
    periodoFull: 'al mese',
    descrizione: 'La suite completa — project management, payroll, statistiche avanzate e accesso API.',
    highlight: true,
    cta: 'Inizia con Experience',
    icon: Rocket,
    color: 'from-violet-500 to-purple-600',
    funzionalita: [
      'Tutto di Explore incluso',
      'Project Management',
      'Task e Milestone',
      'Timetracking',
      'Payroll e Cedolini',
      'Gestione Contratti',
      'Report e Statistiche Avanzate',
      'Accesso API REST',
      'Shopify (prossimamente)',
      '1 utente incluso',
      'Account Manager Dedicato',
      'Supporto Telefonico',
    ],
    nonIncluso: [],
  },
];

const funzionalitaPrimarie = [
  {
    icon: FileText,
    titolo: 'Fatturazione Elettronica',
    desc: 'Crea e invia fatture in formato FatturaPA direttamente allo SDI. Gestisci note di credito, fatture proforma e ricevute con un click. Monitoraggio stato in tempo reale.',
    badge: 'Core',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShoppingCart,
    titolo: 'E-commerce Integrato',
    desc: 'Collega WooCommerce, PrestaShop e Shopify. Sincronizza ordini, prodotti e inventario in tempo reale con mappatura automatica dei prodotti.',
    badge: 'Integrazione',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    titolo: 'CRM Clienti e Lead',
    desc: 'Gestisci anagrafiche, storico ordini, pipeline commerciale e segmentazione clienti con kanban board. Tutto il ciclo di vendita in un posto solo.',
    badge: 'Vendite',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Package,
    titolo: 'Magazzino e Inventario',
    desc: 'Controlla giacenze, movimenti di carico/scarico, avvisi sottoscorta e gestisci più magazzini. Allineamento automatico con ordini e fatture.',
    badge: 'Logistica',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BarChart3,
    titolo: 'Report e Statistiche',
    desc: 'Dashboard con KPI in tempo reale, andamento vendite, analisi per canale, margini e trend. Esporta report in PDF e CSV per il tuo commercialista.',
    badge: 'Analytics',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Calendar,
    titolo: 'Project Management',
    desc: 'Gestisci progetti con task, milestone, timetracking e Gantt chart. Monitora lo stato di avanzamento del team e i budget di progetto.',
    badge: 'Gestione',
    color: 'from-sky-500 to-blue-500',
  },
];

const funzionalitaSecondarie = [
  { icon: Receipt, titolo: 'Preventivi e Ordini', desc: 'Da preventivo a ordine a fattura, tutto collegato e tracciabile.' },
  { icon: Briefcase, titolo: 'Contratti', desc: 'Gestisci rinnovi automatici, scadenze e condizioni contrattuali.' },
  { icon: Wallet, titolo: 'Spese e Note Spese', desc: 'Traccia spese aziendali con workflow di approvazione.' },
  { icon: Target, titolo: 'Pipeline Commerciale', desc: 'Kanban board drag-and-drop per gestire le trattative.' },
  { icon: Mail, titolo: 'Mailbox Integrata', desc: 'Email centralizzata collegata ai clienti e ai ticket.' },
  { icon: HeadphonesIcon, titolo: 'Ticket e Supporto', desc: 'Sistema di ticketing con SLA, priorità e conversazioni.' },
  { icon: Truck, titolo: 'DDT e Spedizioni', desc: 'Documenti di trasporto e tracciamento spedizioni.' },
  { icon: PieChart, titolo: 'Payroll e Cedolini', desc: 'Calcolo buste paga con tassazione italiana e INPS.' },
  { icon: Bell, titolo: 'Notifiche e Promemoria', desc: 'Alert su scadenze, pagamenti e appuntamenti.' },
  { icon: Workflow, titolo: 'Automazioni', desc: 'Regole automatiche per fatturazione ricorrente e follow-up.' },
  { icon: Eye, titolo: 'Audit Log', desc: 'Traccia ogni azione degli utenti per sicurezza e compliance.' },
  { icon: Boxes, titolo: 'Multi-Magazzino', desc: 'Gestisci più sedi con trasferimenti tra magazzini.' },
];

const testimonianze = [
  {
    nome: 'Marco Bianchi',
    ruolo: 'CEO, TechStore Milano',
    testo: 'Da quando usiamo Sapunto abbiamo dimezzato il tempo dedicato alla fatturazione. L\'integrazione con WooCommerce è stata immediata e il sync degli ordini è perfetto.',
    stelle: 5,
    avatar: 'MB',
  },
  {
    nome: 'Laura Rossi',
    ruolo: 'Titolare, Rossi Arredamenti',
    testo: 'Finalmente un gestionale pensato per le PMI italiane. L\'invio allo SDI funziona perfettamente e il supporto risponde sempre in tempi rapidi.',
    stelle: 5,
    avatar: 'LR',
  },
  {
    nome: 'Giuseppe Verdi',
    ruolo: 'Direttore, Verdi & Partners',
    testo: 'Il Project Management integrato ci ha permesso di eliminare due tool separati. Tutto in un\'unica piattaforma — è esattamente quello che cercavamo.',
    stelle: 5,
    avatar: 'GV',
  },
  {
    nome: 'Anna Colombo',
    ruolo: 'Commercialista, Studio Colombo',
    testo: 'Consiglio Sapunto a tutti i miei clienti. La fatturazione elettronica è impeccabile e poter vedere lo stato SDI in tempo reale è un game-changer.',
    stelle: 5,
    avatar: 'AC',
  },
  {
    nome: 'Roberto Ferrari',
    ruolo: 'E-commerce Manager, FerrariShop',
    testo: 'Gestivo ordini da 3 piattaforme diverse con 3 gestionali diversi. Ora con Sapunto è tutto centralizzato. Il magazzino si aggiorna in automatico.',
    stelle: 5,
    avatar: 'RF',
  },
  {
    nome: 'Chiara Marino',
    ruolo: 'HR Manager, Marino Group',
    testo: 'Il modulo Payroll è semplice e preciso. I cedolini vengono generati in un attimo e i dipendenti possono consultarli dal loro account. Ottimo.',
    stelle: 5,
    avatar: 'CM',
  },
];

const vantaggi = [
  {
    icon: Zap,
    titolo: 'Operativo in 5 minuti',
    desc: 'Nessuna installazione, nessun server da gestire. Registrati, configura la P.IVA e inizia subito a lavorare.',
  },
  {
    icon: Shield,
    titolo: 'Dati sicuri in Italia',
    desc: 'Server in Italia con crittografia AES-256, backup giornalieri automatici e isolamento completo tra aziende.',
  },
  {
    icon: Globe,
    titolo: 'Accessibile ovunque',
    desc: 'Lavora da computer, tablet o smartphone. Interfaccia responsive pensata per ogni dispositivo e ogni situazione.',
  },
  {
    icon: RefreshCw,
    titolo: 'Sempre aggiornato',
    desc: 'Nuove funzionalità e aggiornamenti normativi rilasciati automaticamente. Zero downtime, zero interventi manuali.',
  },
  {
    icon: Layers,
    titolo: 'Multi-tenant nativo',
    desc: 'Ogni azienda ha il proprio spazio isolato con dati, utenti e configurazioni completamente indipendenti.',
  },
  {
    icon: Cpu,
    titolo: 'API REST completa',
    desc: 'API documentata per integrare Sapunto con i tuoi sistemi, automatizzare processi e costruire workflow custom.',
  },
];

const confronto = [
  { funzione: 'Fatturazione Elettronica SDI', sapunto: true, altri: true },
  { funzione: 'CRM e Pipeline Vendite', sapunto: true, altri: true },
  { funzione: 'Integrazione E-commerce nativa', sapunto: true, altri: false },
  { funzione: 'Sync WooCommerce + PrestaShop', sapunto: true, altri: false },
  { funzione: 'Project Management integrato', sapunto: true, altri: false },
  { funzione: 'Multi-tenant con isolamento dati', sapunto: true, altri: false },
  { funzione: 'Payroll con tassazione italiana', sapunto: true, altri: false },
  { funzione: 'Nessuna installazione richiesta', sapunto: true, altri: false },
  { funzione: 'API REST documentata', sapunto: true, altri: false },
  { funzione: 'Prezzo trasparente, no costi nascosti', sapunto: true, altri: false },
];

const faqs = [
  {
    categoria: 'Piani e Prezzi',
    domande: [
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
        a: 'Accettiamo pagamenti tramite PayPal e bonifico bancario. Il piano Express si paga annualmente (€69/anno), mentre Explore e Experience si pagano mensilmente. Ricevi fattura per ogni pagamento.',
      },
      {
        q: 'Posso cambiare piano in qualsiasi momento?',
        a: 'Sì, puoi fare upgrade o downgrade in qualsiasi momento dal pannello di controllo. La differenza viene calcolata pro-rata, senza penali o vincoli.',
      },
      {
        q: "C'è un contratto minimo?",
        a: 'No, nessun vincolo contrattuale. Puoi disdire in qualsiasi momento. Il piano Express è annuale, mentre Explore e Experience sono mensili senza penali di uscita.',
      },
      {
        q: 'Offrite una prova gratuita?',
        a: 'Sì! Puoi provare Sapunto gratuitamente per 14 giorni con tutte le funzionalità del piano Experience. Nessuna carta di credito richiesta per iniziare.',
      },
    ],
  },
  {
    categoria: 'Funzionalità',
    domande: [
      {
        q: "Come funziona l'invio allo SDI?",
        a: "Sapunto è collegato direttamente al Sistema di Interscambio (SDI) dell'Agenzia delle Entrate. Le fatture vengono inviate automaticamente in formato FatturaPA XML e ricevi notifiche di esito in tempo reale.",
      },
      {
        q: 'Quali piattaforme e-commerce supportate?',
        a: 'Supportiamo WooCommerce e PrestaShop con sincronizzazione bidirezionale di ordini, prodotti e inventario. Shopify è in arrivo. Nuove integrazioni vengono aggiunte regolarmente.',
      },
      {
        q: 'Posso importare i dati dal mio gestionale attuale?',
        a: 'Sì, offriamo strumenti di importazione per anagrafiche clienti, prodotti e storico fatture tramite file CSV/Excel. Il nostro team di supporto può assisterti nella migrazione gratuitamente.',
      },
      {
        q: 'Il modulo Payroll sostituisce il consulente del lavoro?',
        a: 'No, il modulo Payroll è uno strumento gestionale interno per calcolare buste paga base e monitorare i costi del personale. Per gli adempimenti ufficiali ti consigliamo di affidarti al tuo consulente del lavoro.',
      },
      {
        q: 'Sapunto funziona su mobile?',
        a: "Sì, l'interfaccia è completamente responsive e ottimizzata per smartphone e tablet. Gestisci la tua azienda ovunque, senza bisogno di installare app native.",
      },
      {
        q: "Posso usare Sapunto per più aziende?",
        a: "Sì, grazie all'architettura multi-tenant puoi gestire più aziende dalla stessa piattaforma, ognuna con il proprio spazio dati isolato, utenti e configurazioni indipendenti.",
      },
    ],
  },
  {
    categoria: 'Sicurezza e Supporto',
    domande: [
      {
        q: 'I miei dati sono al sicuro?',
        a: 'Assolutamente. I dati sono ospitati su server sicuri in Italia con backup giornalieri automatici, crittografia AES-256, isolamento completo tra i tenant e piena conformità GDPR.',
      },
      {
        q: 'Come funziona il supporto tecnico?',
        a: 'Express include supporto via email. Explore ha supporto prioritario con risposta garantita entro 4 ore lavorative. Experience include un account manager dedicato e supporto telefonico diretto.',
      },
      {
        q: 'Cosa succede ai miei dati se disdico?',
        a: 'Dopo la disdetta hai 30 giorni per esportare tutti i tuoi dati in formato CSV/JSON. I tuoi dati non vengono mai venduti o condivisi con terze parti, in nessun caso.',
      },
      {
        q: "Sapunto è conforme al GDPR?",
        a: 'Sì, Sapunto è pienamente conforme al GDPR. I dati sono trattati in Italia, offriamo DPA su richiesta e implementiamo tutti i controlli di accesso e cifratura richiesti dalla normativa.',
      },
    ],
  },
];

const integrazioni = [
  { nome: 'WooCommerce', stato: 'attivo', desc: 'Sync ordini, prodotti e clienti' },
  { nome: 'PrestaShop', stato: 'attivo', desc: 'Importazione catalogo e ordini' },
  { nome: 'Shopify', stato: 'presto', desc: 'In arrivo Q2 2026' },
  { nome: 'SDI / Agenzia Entrate', stato: 'attivo', desc: 'Invio diretto FatturaPA' },
  { nome: 'PayPal', stato: 'attivo', desc: 'Pagamenti e riconciliazione' },
  { nome: 'Mailchimp', stato: 'presto', desc: 'Sync contatti e campagne' },
  { nome: 'Zapier', stato: 'presto', desc: 'Automazioni cross-platform' },
  { nome: 'Google Workspace', stato: 'presto', desc: 'Calendar e Gmail' },
];

const numeri = [
  { value: '150+', label: 'Aziende attive', icon: Building, desc: 'PMI italiane che usano Sapunto ogni giorno' },
  { value: '50K+', label: 'Fatture inviate', icon: FileText, desc: 'Fatture elettroniche processate via SDI' },
  { value: '99.9%', label: 'Uptime', icon: Server, desc: 'Disponibilità garantita della piattaforma' },
  { value: '4.9/5', label: 'Valutazione', icon: Star, desc: 'Punteggio medio delle recensioni clienti' },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Announcement Bar ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0f1620] via-[#1a2332] to-[#0f1620] text-center py-3 px-4">
        <p className="text-sm text-blue-200 tracking-wide">
          <Zap className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-yellow-400" />
          <strong className="text-white font-semibold">Prova gratuita 14 giorni</strong>
          <span className="hidden sm:inline"> — Tutte le funzionalità, nessuna carta di credito.</span>
          <span className="sm:hidden"> — Nessuna carta richiesta.</span>{' '}
          <Link href="/login" className="underline underline-offset-4 text-cyan-300 hover:text-white transition-colors font-medium ml-1">
            Inizia ora &rarr;
          </Link>
        </p>
      </div>

      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#2d4a6f] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[#1a2332]/20">
                S
              </div>
              <span className="text-xl font-bold text-[#1a2332] tracking-tight">Sapunto</span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <a href="#funzionalita" className="text-[14px] font-medium text-gray-500 hover:text-[#1a2332] transition-colors">Funzionalit&agrave;</a>
              <a href="#vantaggi" className="text-[14px] font-medium text-gray-500 hover:text-[#1a2332] transition-colors">Vantaggi</a>
              <a href="#prezzi" className="text-[14px] font-medium text-gray-500 hover:text-[#1a2332] transition-colors">Prezzi</a>
              <a href="#confronto" className="text-[14px] font-medium text-gray-500 hover:text-[#1a2332] transition-colors">Confronto</a>
              <a href="#testimonianze" className="text-[14px] font-medium text-gray-500 hover:text-[#1a2332] transition-colors">Testimonianze</a>
              <a href="#faq" className="text-[14px] font-medium text-gray-500 hover:text-[#1a2332] transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[14px] font-medium text-gray-600 hover:text-[#1a2332] transition-colors px-3 py-2"
              >
                Accedi
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a2332] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#243044] transition-all duration-200 shadow-md shadow-[#1a2332]/15 hover:shadow-lg hover:shadow-[#1a2332]/20"
              >
                Prova Gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e14] via-[#131b27] to-[#162035]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.2), transparent)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(139, 92, 246, 0.1), transparent)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/[0.08] px-5 py-2.5 text-[13px] text-blue-200/90 mb-10 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Piattaforma gestionale 100% italiana &middot; Prova gratis 14 giorni
            </div>

            <h1 className="text-[44px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-extrabold text-white leading-[1.05] tracking-[-0.03em] animate-fade-in-up">
              Il gestionale che la
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 animate-gradient">
                {' '}tua azienda merita.
              </span>
            </h1>

            <p className="mt-8 text-[17px] md:text-[19px] text-slate-300/80 max-w-2xl mx-auto leading-[1.7] animate-fade-in-up animation-delay-200">
              Fatturazione elettronica, CRM, magazzino, e-commerce e project management
              in un&apos;unica piattaforma cloud. Sapunto &egrave; il SaaS gestionale costruito
              per le <strong className="text-white font-semibold">piccole e medie imprese italiane</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[15px] font-bold text-[#1a2332] hover:bg-gray-50 transition-all duration-300 shadow-2xl shadow-black/25 hover:shadow-black/35 hover:scale-[1.02]"
              >
                Inizia la Prova Gratuita
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#funzionalita"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 backdrop-blur-sm px-8 py-4 text-[15px] font-medium text-white/90 hover:bg-white/[0.06] hover:border-white/25 transition-all duration-300"
              >
                Scopri le Funzionalit&agrave;
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-slate-400/70 animate-fade-in animation-delay-500">
              {[
                { icon: Shield, text: 'Dati protetti in Italia' },
                { icon: Clock, text: 'Setup in 5 minuti' },
                { icon: CreditCard, text: 'Nessuna carta richiesta' },
                { icon: Lock, text: 'Conforme GDPR' },
                { icon: BadgeCheck, text: '14 giorni gratis' },
              ].map((badge, i) => (
                <div key={badge.text} className="flex items-center gap-2">
                  {i > 0 && <div className="hidden sm:block w-px h-3.5 bg-white/10 -ml-3 mr-0" />}
                  <badge.icon className="h-3.5 w-3.5" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up animation-delay-600">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50 animate-pulse-glow">
              <div className="rounded-2xl bg-[#1a2236] overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 bg-[#111827] border-b border-white/[0.04]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="max-w-md mx-auto bg-white/[0.06] rounded-lg px-4 py-1.5 text-[12px] text-slate-500 text-center font-mono">
                      app.sapunto.cloud/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-6 md:p-8">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Fatturato Mese', value: '€ 48.250', change: '+12.5%', icon: CircleDollarSign },
                      { label: 'Ordini Attivi', value: '127', change: '+8.3%', icon: ShoppingCart },
                      { label: 'Clienti Totali', value: '1.842', change: '+3.1%', icon: Users },
                      { label: 'Ticket Aperti', value: '14', change: '-22%', icon: HeadphonesIcon },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                          <stat.icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <p className="text-[22px] font-bold text-white tracking-tight">{stat.value}</p>
                        <p className="text-[12px] mt-1 text-emerald-400 font-medium">{stat.change} vs mese prec.</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white/[0.04] rounded-xl p-5 border border-white/[0.05] h-44">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[12px] text-slate-400 font-medium">Andamento Vendite — Ultimi 12 mesi</p>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-slate-500 bg-white/[0.06] px-2 py-0.5 rounded">2025</span>
                          <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">2026</span>
                        </div>
                      </div>
                      <div className="flex items-end gap-[6px] h-24">
                        {[35, 45, 40, 55, 50, 65, 58, 72, 68, 80, 75, 90].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col gap-0.5">
                            <div
                              className="rounded-sm bg-gradient-to-t from-blue-500/50 to-cyan-400/50 hover:from-blue-500/70 hover:to-cyan-400/70 transition-colors"
                              style={{ height: `${h}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/[0.04] rounded-xl p-5 border border-white/[0.05] h-44">
                      <p className="text-[12px] text-slate-400 font-medium mb-4">Vendite per Canale</p>
                      <div className="space-y-3">
                        {[
                          { label: 'E-commerce', pct: 45, color: 'bg-blue-400' },
                          { label: 'Diretto', pct: 30, color: 'bg-violet-400' },
                          { label: 'Telefono', pct: 15, color: 'bg-emerald-400' },
                          { label: 'Altro', pct: 10, color: 'bg-slate-400' },
                        ].map((ch) => (
                          <div key={ch.label}>
                            <div className="flex justify-between text-[11px] mb-1.5">
                              <span className="text-slate-400 font-medium">{ch.label}</span>
                              <span className="text-slate-300 font-semibold">{ch.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${ch.color} transition-all`} style={{ width: `${ch.pct}%` }} />
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

      {/* ── Numeri / Social Proof ─────────────────────────────── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {numeri.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#1a2332]/[0.04] text-[#1a2332] mb-4 group-hover:bg-[#1a2332] group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight">{stat.value}</p>
                  <p className="text-[15px] font-semibold text-[#1a2332] mt-2">{stat.label}</p>
                  <p className="text-[13px] text-gray-400 mt-1">{stat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Funzionalità Principali ───────────────────────────── */}
      <section id="funzionalita" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-[13px] font-semibold text-blue-600 mb-5">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
              Funzionalit&agrave;
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Tutto ci&ograve; che serve alla tua azienda, in un&apos;unica piattaforma
            </h2>
            <p className="mt-6 text-[17px] text-gray-500 leading-relaxed">
              Dalla fatturazione elettronica al project management, ogni modulo &egrave; progettato
              per lavorare in sinergia. Niente integrazioni complesse, niente dati sparsi.
            </p>
          </div>

          {/* Primary Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {funzionalitaPrimarie.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titolo}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-8 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1a2332] tracking-tight">{f.titolo}</h3>
                  <p className="mt-3 text-[14px] text-gray-500 leading-[1.7]">{f.desc}</p>
                  <div className="mt-5 flex items-center text-[13px] font-semibold text-[#1a2332] group-hover:text-blue-600 transition-colors">
                    Scopri di pi&ugrave;
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary Features Grid */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 md:p-10 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[20px] font-bold text-[#1a2332] tracking-tight">E molto altro ancora...</h3>
                <p className="text-[14px] text-gray-400 mt-1">Funzionalit&agrave; aggiuntive incluse in Sapunto</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {funzionalitaSecondarie.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.titolo} className="flex items-start gap-3.5 bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a2332]/[0.04] text-[#1a2332]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a2332]">{f.titolo}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5 leading-[1.5]">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Spotlight: Fatturazione ────────────────────── */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-[13px] font-semibold text-blue-600 mb-5">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Fatturazione Elettronica
              </span>
              <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
                Fattura in 30 secondi.
                <br />
                <span className="text-blue-600">Invio SDI automatico.</span>
              </h2>
              <p className="mt-6 text-[16px] text-gray-500 leading-[1.7]">
                Crea fatture elettroniche conformi alla normativa italiana, inviale allo SDI
                con un click e monitora lo stato in tempo reale. Tutto senza uscire da Sapunto.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Formato FatturaPA XML conforme',
                  'Invio diretto al Sistema di Interscambio',
                  'Notifiche esito in tempo reale (Consegna, Scarto, Mancata Consegna)',
                  'Note di credito e fatture proforma',
                  'Numerazione automatica progressiva',
                  'Archiviazione digitale a norma',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CircleCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-[14px] text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#1a2332] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#243044] transition-all shadow-md">
                  Prova la Fatturazione
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Fattura Mockup */}
            <div className="relative">
              <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-gray-200/50 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Fattura Elettronica</p>
                    <p className="text-[22px] font-bold text-[#1a2332] mt-1">FE-2026/0247</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-600">
                    <CircleCheck className="h-3.5 w-3.5" />
                    Consegnata
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-400">Cliente</span>
                    <span className="text-[#1a2332] font-medium">Rossi Elettronica S.r.l.</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-400">P.IVA</span>
                    <span className="text-[#1a2332] font-mono text-[12px]">IT02345678901</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-400">Data emissione</span>
                    <span className="text-[#1a2332] font-medium">18/03/2026</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-400">Codice Destinatario</span>
                    <span className="text-[#1a2332] font-mono text-[12px]">M5UXCR1</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 mt-5 pt-5">
                  <div className="flex justify-between text-[13px] text-gray-400 mb-2">
                    <span>Descrizione</span>
                    <span>Importo</span>
                  </div>
                  <div className="flex justify-between text-[13px] py-2">
                    <span className="text-[#1a2332]">Servizio consulenza IT</span>
                    <span className="text-[#1a2332] font-medium">€ 2.400,00</span>
                  </div>
                  <div className="flex justify-between text-[13px] py-2">
                    <span className="text-[#1a2332]">Licenza software annuale</span>
                    <span className="text-[#1a2332] font-medium">€ 1.200,00</span>
                  </div>
                </div>
                <div className="border-t-2 border-[#1a2332] mt-4 pt-4 flex justify-between">
                  <span className="text-[14px] font-bold text-[#1a2332]">Totale (IVA incl.)</span>
                  <span className="text-[20px] font-extrabold text-[#1a2332]">€ 4.392,00</span>
                </div>
                {/* SDI Timeline */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Stato SDI</p>
                  <div className="space-y-2.5">
                    {[
                      { stato: 'Inviata allo SDI', ora: '10:32', colore: 'bg-blue-500' },
                      { stato: 'Ricevuta di Consegna', ora: '10:33', colore: 'bg-emerald-500' },
                      { stato: 'Esito Committente: Accettata', ora: '14:15', colore: 'bg-emerald-500' },
                    ].map((step) => (
                      <div key={step.stato} className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${step.colore}`} />
                        <span className="text-[12px] text-gray-600 flex-1">{step.stato}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{step.ora}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Spotlight: E-commerce ──────────────────────── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mockup left */}
            <div className="order-2 lg:order-1 relative">
              <div className="rounded-2xl bg-[#1a2236] border border-white/[0.06] shadow-2xl shadow-[#1a2332]/30 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[14px] font-semibold text-white">Sincronizzazione E-commerce</p>
                  <span className="text-[11px] text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full font-medium">Live</span>
                </div>
                <div className="space-y-3">
                  {[
                    { piattaforma: 'WooCommerce', ordini: '2.341', prodotti: '458', stato: 'Sincronizzato', ultimo: '2 min fa' },
                    { piattaforma: 'PrestaShop', ordini: '1.892', prodotti: '312', stato: 'Sincronizzato', ultimo: '5 min fa' },
                    { piattaforma: 'Shopify', ordini: '—', prodotti: '—', stato: 'Prossimamente', ultimo: '—' },
                  ].map((p) => (
                    <div key={p.piattaforma} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-semibold text-white">{p.piattaforma}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.stato === 'Sincronizzato' ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-400 bg-white/[0.06]'}`}>
                          {p.stato}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-[11px]">
                        <div>
                          <p className="text-slate-500">Ordini</p>
                          <p className="text-white font-semibold mt-0.5">{p.ordini}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Prodotti</p>
                          <p className="text-white font-semibold mt-0.5">{p.prodotti}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Ultimo sync</p>
                          <p className="text-slate-300 font-medium mt-0.5">{p.ultimo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text right */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center rounded-full bg-violet-50 px-4 py-1.5 text-[13px] font-semibold text-violet-600 mb-5">
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                E-commerce Integrato
              </span>
              <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
                Tutti i tuoi shop,
                <br />
                <span className="text-violet-600">un unico gestionale.</span>
              </h2>
              <p className="mt-6 text-[16px] text-gray-500 leading-[1.7]">
                Collega WooCommerce e PrestaShop in pochi click. Ordini, prodotti e inventario
                si sincronizzano automaticamente. Basta gestire tutto a mano.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Sync bidirezionale ordini e prodotti',
                  'Inventario centralizzato multi-canale',
                  'Mappatura automatica dei prodotti',
                  'Log errori e conflitti in tempo reale',
                  'Dashboard ordini per canale di vendita',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CircleCheck className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                    <span className="text-[14px] text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Perché Sapunto (Vantaggi) ─────────────────────────── */}
      <section id="vantaggi" className="py-28 md:py-36 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-[13px] font-semibold text-emerald-600 mb-5">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Perch&eacute; Sapunto
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Il gestionale pensato
              <br />
              per chi lavora davvero
            </h2>
            <p className="mt-6 text-[17px] text-gray-500 leading-relaxed">
              Non un software generico adattato al mercato italiano, ma una piattaforma
              nata per le esigenze reali delle PMI. Dalla fatturazione alla gestione
              del magazzino, tutto &egrave; progettato per semplificare il tuo lavoro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vantaggi.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.titolo}
                  className="group rounded-2xl bg-white border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a2332] text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1a2332] tracking-tight">{v.titolo}</h3>
                  <p className="mt-3 text-[14px] text-gray-500 leading-[1.7]">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Come Funziona ─────────────────────────────────────── */}
      <section className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1.5 text-[13px] font-semibold text-amber-600 mb-5">
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Come funziona
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Dalla registrazione alla prima fattura in 5 minuti
            </h2>
            <p className="mt-6 text-[17px] text-gray-500">
              Tre passi e sei operativo. Nessun tecnico, nessuna installazione.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[72px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />

            {[
              {
                step: '01',
                titolo: 'Crea il tuo account',
                desc: 'Registrati gratuitamente in 30 secondi. Nessuna carta di credito, nessun vincolo. Scegli il piano che preferisci.',
                icon: Smartphone,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                titolo: 'Configura l\'azienda',
                desc: 'Inserisci ragione sociale, P.IVA, codice destinatario SDI e carica il logo. Il tuo spazio di lavoro è pronto.',
                icon: Settings,
                color: 'from-violet-500 to-purple-500',
              },
              {
                step: '03',
                titolo: 'Inizia a lavorare',
                desc: 'Emetti fatture, gestisci ordini, monitora il magazzino e collega il tuo e-commerce. Tutto dal browser.',
                icon: TrendingUp,
                color: 'from-emerald-500 to-teal-500',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative text-center">
                  <div className={`relative z-10 mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-3xl bg-gradient-to-br ${s.color} text-white shadow-xl mb-8`}>
                    <div>
                      <span className="block text-[32px] font-extrabold tracking-tight">{s.step}</span>
                      <Icon className="h-5 w-5 mx-auto mt-1 opacity-70" />
                    </div>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1a2332] tracking-tight">{s.titolo}</h3>
                  <p className="mt-3 text-[14px] text-gray-500 max-w-xs mx-auto leading-[1.7]">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1a2332] px-8 py-4 text-[15px] font-bold text-white hover:bg-[#243044] transition-all shadow-lg shadow-[#1a2332]/15 hover:shadow-xl hover:scale-[1.02]"
            >
              Crea il tuo Account Gratuito
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-[13px] text-gray-400 mt-4">14 giorni gratis &middot; Nessuna carta richiesta &middot; Cancella quando vuoi</p>
          </div>
        </div>
      </section>

      {/* ── Confronto ─────────────────────────────────────────── */}
      <section id="confronto" className="py-28 md:py-36 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full bg-rose-50 px-4 py-1.5 text-[13px] font-semibold text-rose-600 mb-5">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Confronto
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Sapunto vs altri gestionali
            </h2>
            <p className="mt-6 text-[17px] text-gray-500">
              Ecco perch&eacute; centinaia di PMI italiane hanno scelto Sapunto.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-5 px-6 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Funzionalit&agrave;</th>
                  <th className="py-5 px-6 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[#1a2332] text-white flex items-center justify-center text-[10px] font-bold">S</div>
                      <span className="text-[14px] font-bold text-[#1a2332]">Sapunto</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-center">
                    <span className="text-[14px] font-medium text-gray-400">Altri CRM</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {confronto.map((row, i) => (
                  <tr key={row.funzione} className={`${i < confronto.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-blue-50/30 transition-colors`}>
                    <td className="py-4 px-6 text-[14px] text-gray-700 font-medium">{row.funzione}</td>
                    <td className="py-4 px-6 text-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.altri ? (
                        <CheckCircle2 className="h-5 w-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-gray-200 text-xl font-light">&times;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Prezzi ────────────────────────────────────────────── */}
      <section id="prezzi" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-[13px] font-semibold text-indigo-600 mb-5">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Prezzi trasparenti
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Scegli il piano perfetto per la tua azienda
            </h2>
            <p className="mt-6 text-[17px] text-gray-500 leading-relaxed">
              Tutti i piani includono <strong className="text-[#1a2332]">1 utente</strong> e <strong className="text-[#1a2332]">150 fatture/mese</strong>.
              <br className="hidden sm:block" />
              Aggiungi utenti extra a soli <strong className="text-[#1a2332]">€19/mese</strong> ciascuno.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {piani.map((piano) => {
              const Icon = piano.icon;
              return (
                <div
                  key={piano.id}
                  className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] ${
                    piano.highlight
                      ? 'bg-gradient-to-b from-[#1a2332] to-[#0d1219] text-white ring-2 ring-[#1a2332]/20 shadow-2xl shadow-[#1a2332]/25 scale-[1.02]'
                      : 'bg-white border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl'
                  }`}
                >
                  {piano.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-1.5 text-[12px] font-bold text-white shadow-lg shadow-violet-500/25">
                        <Star className="h-3.5 w-3.5 fill-white" />
                        Pi&ugrave; Popolare
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${piano.color} text-white shadow-lg mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-[22px] font-bold ${piano.highlight ? 'text-white' : 'text-[#1a2332]'}`}>
                      {piano.nome}
                    </h3>
                    <p className={`mt-2 text-[13px] min-h-[40px] leading-[1.6] ${piano.highlight ? 'text-blue-200/60' : 'text-gray-400'}`}>
                      {piano.descrizione}
                    </p>
                    <div className="mt-6">
                      <span className={`text-[52px] font-extrabold tracking-tight leading-none ${piano.highlight ? 'text-white' : 'text-[#1a2332]'}`}>
                        €{piano.prezzo}
                      </span>
                      <span className={`text-[15px] ml-1 ${piano.highlight ? 'text-blue-200/50' : 'text-gray-400'}`}>
                        {piano.periodo}
                      </span>
                    </div>
                    {piano.id === 'express' && (
                      <p className="text-[12px] text-emerald-500 font-medium mt-1">meno di €6 al mese</p>
                    )}
                  </div>

                  <div className={`h-px ${piano.highlight ? 'bg-white/10' : 'bg-gray-100'}`} />

                  <ul className="space-y-3 my-8">
                    {piano.funzionalita.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[13px]">
                        <Check className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${piano.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        <span className={piano.highlight ? 'text-blue-100/80' : 'text-gray-600'}>{f}</span>
                      </li>
                    ))}
                    {piano.nonIncluso.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[13px] opacity-40">
                        <span className="h-4.5 w-4.5 shrink-0 mt-0.5 text-center">—</span>
                        <span className={piano.highlight ? 'text-blue-100/50' : 'text-gray-400'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/checkout?piano=${piano.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-[14px] font-bold transition-all duration-300 ${
                      piano.highlight
                        ? 'bg-white text-[#1a2332] hover:bg-gray-100 shadow-lg'
                        : 'bg-[#1a2332] text-white hover:bg-[#243044] shadow-md shadow-[#1a2332]/10'
                    }`}
                  >
                    {piano.cta}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Payment Methods */}
          <div className="mt-20 text-center">
            <p className="text-[13px] text-gray-400 mb-5 font-medium uppercase tracking-wider">Metodi di pagamento accettati</p>
            <div className="flex items-center justify-center gap-10 flex-wrap">
              <div className="flex items-center gap-3 text-gray-400">
                <CreditCard className="h-7 w-7" />
                <span className="text-[14px] font-semibold">NexiPay</span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-3 text-gray-400">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.283c-.413 0-.764.306-.828.72l-.848 5.36-.241 1.527a.433.433 0 0 1-.29.399z" />
                </svg>
                <span className="text-[14px] font-semibold">PayPal</span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-3 text-gray-400">
                <Building className="h-7 w-7" />
                <span className="text-[14px] font-semibold">Bonifico Bancario</span>
              </div>
            </div>
            <p className="mt-6 text-[13px] text-gray-400">
              Tutti i prezzi sono IVA esclusa. Ricevi fattura elettronica per ogni pagamento.
            </p>
          </div>
        </div>
      </section>

      {/* ── Integrazioni ──────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center rounded-full bg-sky-50 px-4 py-1.5 text-[13px] font-semibold text-sky-600 mb-5">
              <Workflow className="h-3.5 w-3.5 mr-1.5" />
              Integrazioni
            </span>
            <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#1a2332] tracking-tight">
              Si integra con i tuoi strumenti
            </h2>
            <p className="mt-4 text-[16px] text-gray-500">
              Collega Sapunto alle piattaforme che usi ogni giorno.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {integrazioni.map((int) => (
              <div
                key={int.nome}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-center"
              >
                <Database className="h-6 w-6 text-[#1a2332]/30 mb-1" />
                <p className="text-[14px] font-semibold text-[#1a2332]">{int.nome}</p>
                <p className="text-[11px] text-gray-400">{int.desc}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  int.stato === 'attivo'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-amber-600 bg-amber-50'
                }`}>
                  {int.stato === 'attivo' ? 'Attivo' : 'In arrivo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonianze ─────────────────────────────────────── */}
      <section id="testimonianze" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-4 py-1.5 text-[13px] font-semibold text-yellow-600 mb-5">
              <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-500" />
              Testimonianze
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Cosa dicono le aziende che usano Sapunto
            </h2>
            <p className="mt-6 text-[17px] text-gray-500">
              Oltre 150 PMI italiane gestiscono la propria attivit&agrave; con Sapunto ogni giorno.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonianze.map((t) => (
              <div
                key={t.nome}
                className="rounded-2xl bg-white border border-gray-100 p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stelle }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-[14px] text-gray-600 leading-[1.8]">
                  &ldquo;{t.testo}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#1a2332] to-[#2d4a6f] flex items-center justify-center text-white font-bold text-[13px]">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a2332]">{t.nome}</p>
                    <p className="text-[12px] text-gray-400">{t.ruolo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sicurezza e Privacy ───────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#0f1620]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.08] px-4 py-1.5 text-[13px] font-semibold text-emerald-400 mb-5">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Sicurezza e Privacy
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-white tracking-tight leading-[1.1]">
              I tuoi dati, al sicuro in Italia
            </h2>
            <p className="mt-6 text-[17px] text-slate-400 leading-relaxed">
              La sicurezza dei tuoi dati &egrave; la nostra priorit&agrave; assoluta.
              Ecco come li proteggiamo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Server, titolo: 'Server in Italia', desc: 'Dati ospitati esclusivamente su server italiani certificati.' },
              { icon: Lock, titolo: 'Crittografia AES-256', desc: 'Tutti i dati sono cifrati in transito e a riposo.' },
              { icon: Database, titolo: 'Backup giornalieri', desc: 'Backup automatici ogni giorno con retention di 30 giorni.' },
              { icon: ShieldCheck, titolo: 'Conforme GDPR', desc: 'Piena conformità GDPR con DPA disponibile su richiesta.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titolo} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 hover:bg-white/[0.06] transition-colors">
                  <Icon className="h-7 w-7 text-emerald-400 mb-4" />
                  <h3 className="text-[16px] font-bold text-white">{item.titolo}</h3>
                  <p className="mt-2 text-[13px] text-slate-400 leading-[1.7]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section id="faq" className="py-28 md:py-36 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-purple-50 px-4 py-1.5 text-[13px] font-semibold text-purple-600 mb-5">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              FAQ
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2332] tracking-tight leading-[1.1]">
              Domande frequenti
            </h2>
            <p className="mt-6 text-[17px] text-gray-500">
              Tutto quello che devi sapere su Sapunto. Non trovi la risposta?{' '}
              <a href="mailto:info@sapunto.cloud" className="text-[#1a2332] font-semibold underline underline-offset-4 decoration-[#1a2332]/20 hover:decoration-[#1a2332] transition-colors">
                Scrivici
              </a>
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((cat) => (
              <div key={cat.categoria}>
                <h3 className="text-[18px] font-bold text-[#1a2332] mb-5 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#1a2332]" />
                  {cat.categoria}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {cat.domande.map((faq) => (
                    <div
                      key={faq.q}
                      className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
                    >
                      <h4 className="text-[14px] font-bold text-[#1a2332] leading-snug">
                        {faq.q}
                      </h4>
                      <p className="mt-3 text-[13px] text-gray-500 leading-[1.7]">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Finale ────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e14] via-[#131b27] to-[#162035]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 120%, rgba(139, 92, 246, 0.2), transparent)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/[0.08] px-5 py-2.5 text-[13px] text-blue-200/80 mb-10">
            <Zap className="h-4 w-4 text-yellow-400" />
            14 giorni gratis &middot; Nessun vincolo &middot; Nessuna carta
          </div>

          <h2 className="text-[36px] md:text-[52px] font-extrabold text-white tracking-tight leading-[1.1]">
            Pronto a semplificare la gestione della tua azienda?
          </h2>
          <p className="mt-8 text-[17px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            Unisciti a oltre 150 aziende italiane che hanno gi&agrave; scelto Sapunto per gestire
            fatturazione, clienti, magazzino e molto altro — tutto da un&apos;unica piattaforma.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-[16px] font-bold text-[#1a2332] hover:bg-gray-50 transition-all duration-300 shadow-2xl shadow-black/25 hover:scale-[1.02]"
            >
              Inizia la Prova Gratuita
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="mailto:info@sapunto.cloud"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 backdrop-blur-sm px-8 py-5 text-[15px] font-medium text-white/90 hover:bg-white/[0.06] hover:border-white/25 transition-all"
            >
              Contattaci
              <Mail className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-8 text-[13px] text-slate-500">
            Oppure chiamaci al <a href="tel:+390000000000" className="text-white/70 hover:text-white transition-colors font-medium">+39 000 000 0000</a>
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#080b10] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-6 gap-10 pb-14 border-b border-white/[0.06]">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white to-gray-200 text-[#1a2332] flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Sapunto</span>
              </div>
              <p className="text-[14px] text-gray-400 max-w-sm leading-[1.7]">
                Piattaforma gestionale SaaS per piccole e medie imprese italiane.
                Fatturazione elettronica, CRM, magazzino, e-commerce e molto altro
                in un&apos;unica soluzione cloud sicura e affidabile.
              </p>
              <div className="mt-5 flex items-center gap-4 text-[13px] text-gray-500">
                <span>sapunto.com</span>
                <span>&middot;</span>
                <span>sapunto.cloud</span>
              </div>
            </div>

            {/* Prodotto */}
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-5">Prodotto</h4>
              <ul className="space-y-3 text-[14px] text-gray-400">
                <li><a href="#funzionalita" className="hover:text-white transition-colors">Funzionalit&agrave;</a></li>
                <li><a href="#prezzi" className="hover:text-white transition-colors">Prezzi</a></li>
                <li><a href="#vantaggi" className="hover:text-white transition-colors">Vantaggi</a></li>
                <li><a href="#confronto" className="hover:text-white transition-colors">Confronto</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>

            {/* Risorse */}
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-5">Risorse</h4>
              <ul className="space-y-3 text-[14px] text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guide e Tutorial</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Piattaforma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap Pubblica</a></li>
              </ul>
            </div>

            {/* Contatti */}
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-5">Contatti</h4>
              <ul className="space-y-3 text-[14px] text-gray-400">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a href="mailto:info@sapunto.cloud" className="hover:text-white transition-colors">info@sapunto.cloud</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <HeadphonesIcon className="h-4 w-4 text-gray-500" />
                  <a href="mailto:support@sapunto.cloud" className="hover:text-white transition-colors">support@sapunto.cloud</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>+39 000 000 0000</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">Italia</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-gray-500">
              &copy; {new Date().getFullYear()} Sapunto — Un prodotto Immaginet S.r.l. Tutti i diritti riservati.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[13px] text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Termini di Servizio</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Conformit&agrave; GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
