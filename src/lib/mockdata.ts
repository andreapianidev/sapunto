// Dati mockup centralizzati per la demo Sapunto
// TODO: Replace with Supabase queries

import type {
  Tenant, User, Cliente, Prodotto, Ordine, Fattura,
  Dipendente, Cedolino, Appuntamento, Email, PianoConfig,
  MovimentoMagazzino, IntegrazionEcommerce, LogSync,
  RigaOrdine, StatoOrdine, StatoSDI,
  Preventivo, Lead, Progetto, Task, Ticket, Contratto, Spesa, NotaDiCredito,
} from './types';

// ==================== PIANI ====================

export const piani: PianoConfig[] = [
  {
    id: 'express',
    nome: 'Express',
    prezzoMensile: 0,
    prezzoAnnuale: 69,
    maxUtenti: 1,
    maxClienti: 50,
    maxFatture: 150,
    costoUtenteAggiuntivo: 19,
    descrizione: 'Solo fatturazione elettronica — ideale per professionisti e micro imprese',
    funzionalita: ['Fatturazione Elettronica', 'Invio SDI automatico', '150 fatture/mese', 'Supporto Email'],
  },
  {
    id: 'explore',
    nome: 'Explore',
    prezzoMensile: 69,
    prezzoAnnuale: 690,
    maxUtenti: 1,
    maxClienti: 200,
    maxFatture: 150,
    costoUtenteAggiuntivo: 19,
    descrizione: 'Piattaforma e-commerce integrata — connetti il tuo shop online',
    funzionalita: ['Fatturazione Elettronica', 'CRM Clienti', 'Gestione Ordini', 'Magazzino', 'Integrazione E-commerce', '150 fatture/mese', 'Supporto Prioritario'],
  },
  {
    id: 'experience',
    nome: 'Experience',
    prezzoMensile: 149,
    prezzoAnnuale: 1490,
    maxUtenti: 1,
    maxClienti: -1,
    maxFatture: 150,
    costoUtenteAggiuntivo: 19,
    descrizione: 'Suite completa con Project Management e statistiche avanzate',
    funzionalita: ['Tutto incluso in Explore', 'Project Management', 'Statistiche Complete', 'Payroll', 'Contratti', 'Report Avanzati', 'API Access', 'Supporto Dedicato'],
  },
];

// ==================== TENANT ====================

export const tenants: Tenant[] = [
  {
    id: 't-1',
    ragioneSociale: 'Rossi Elettronica S.r.l.',
    partitaIva: '02345678901',
    codiceFiscale: '02345678901',
    indirizzo: 'Via Roma 45',
    citta: 'Milano',
    cap: '20121',
    provincia: 'MI',
    telefono: '+39 02 1234567',
    email: 'info@rossielettonica.it',
    pec: 'rossielettonica@pec.it',
    codiceDestinatario: 'USAL8PV',
    piano: 'experience',
    stato: 'attivo',
    dataCreazione: '2024-03-15',
    dataScadenza: '2027-03-15',
    maxUtenti: 10,
    utentiAttivi: 8,
  },
  {
    id: 't-2',
    ragioneSociale: 'Studio Bianchi & Associati',
    partitaIva: '03456789012',
    codiceFiscale: '03456789012',
    indirizzo: 'Corso Vittorio Emanuele 120',
    citta: 'Roma',
    cap: '00186',
    provincia: 'RM',
    telefono: '+39 06 7654321',
    email: 'info@studiobianchi.it',
    pec: 'studiobianchi@pec.it',
    codiceDestinatario: 'M5UXCR1',
    piano: 'express',
    stato: 'attivo',
    dataCreazione: '2024-08-01',
    dataScadenza: '2027-08-01',
    maxUtenti: 3,
    utentiAttivi: 3,
  },
  {
    id: 't-3',
    ragioneSociale: 'GreenFood Italia S.p.A.',
    partitaIva: '04567890123',
    codiceFiscale: '04567890123',
    indirizzo: 'Via Garibaldi 88',
    citta: 'Napoli',
    cap: '80121',
    provincia: 'NA',
    telefono: '+39 081 9876543',
    email: 'info@greenfood.it',
    pec: 'greenfood@pec.it',
    codiceDestinatario: 'KRRH6B9',
    piano: 'explore',
    stato: 'attivo',
    dataCreazione: '2024-06-10',
    dataScadenza: '2027-06-10',
    maxUtenti: 13,
    utentiAttivi: 12,
  },
];

// ==================== UTENTI ====================

export const users: User[] = [
  { id: 'u-super-1', tenantId: '', nome: 'Marco', cognome: 'Verdi', email: 'admin@sapunto.cloud', ruolo: 'superadmin', attivo: true },
  // Tenant 1 - Rossi Elettronica
  { id: 'u-admin-1', tenantId: 't-1', nome: 'Luigi', cognome: 'Rossi', email: 'luigi@rossielettonica.it', ruolo: 'tenant_admin', attivo: true },
  { id: 'u-op-1', tenantId: 't-1', nome: 'Anna', cognome: 'Bianchi', email: 'anna@rossielettonica.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-2', tenantId: 't-1', nome: 'Giuseppe', cognome: 'Ferrara', email: 'giuseppe@rossielettonica.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-3', tenantId: 't-1', nome: 'Maria', cognome: 'Conti', email: 'maria@rossielettonica.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-4', tenantId: 't-1', nome: 'Paolo', cognome: 'Ricci', email: 'paolo@rossielettonica.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-5', tenantId: 't-1', nome: 'Francesca', cognome: 'Moretti', email: 'francesca@rossielettonica.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-6', tenantId: 't-1', nome: 'Roberto', cognome: 'Colombo', email: 'roberto@rossielettonica.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-7', tenantId: 't-1', nome: 'Chiara', cognome: 'Marchetti', email: 'chiara@rossielettonica.it', ruolo: 'utente', attivo: true },
  // Tenant 2 - Studio Bianchi
  { id: 'u-admin-2', tenantId: 't-2', nome: 'Giacomo', cognome: 'Bianchi', email: 'giacomo@studiobianchi.it', ruolo: 'tenant_admin', attivo: true },
  { id: 'u-op-8', tenantId: 't-2', nome: 'Valentina', cognome: 'De Luca', email: 'valentina@studiobianchi.it', ruolo: 'utente', attivo: true },
  { id: 'u-op-9', tenantId: 't-2', nome: 'Simone', cognome: 'Barbieri', email: 'simone@studiobianchi.it', ruolo: 'utente', attivo: true },
  // Tenant 3 - GreenFood
  { id: 'u-admin-3', tenantId: 't-3', nome: 'Andrea', cognome: 'Esposito', email: 'andrea@greenfood.it', ruolo: 'tenant_admin', attivo: true },
];

// ==================== CLIENTI (Tenant 1) ====================
// TODO: Replace with Supabase query

export const clienti: Cliente[] = [
  { id: 'c-1', tenantId: 't-1', ragioneSociale: 'TechnoService S.r.l.', partitaIva: '05678901234', codiceFiscale: '05678901234', indirizzo: 'Via Manzoni 15', citta: 'Milano', cap: '20121', provincia: 'MI', telefono: '+39 02 5551234', email: 'ordini@technoservice.it', pec: 'technoservice@pec.it', codiceDestinatario: 'USAL8PV', tipo: 'azienda', tags: ['premium', 'elettronica'], dataCreazione: '2024-04-10', referente: 'Marco Galli' },
  { id: 'c-2', tenantId: 't-1', ragioneSociale: 'Elettro Forniture Italia S.p.A.', partitaIva: '06789012345', codiceFiscale: '06789012345', indirizzo: 'Corso Buenos Aires 78', citta: 'Milano', cap: '20124', provincia: 'MI', telefono: '+39 02 5559876', email: 'acquisti@elettroforniture.it', pec: 'elettroforniture@pec.it', codiceDestinatario: 'M5UXCR1', tipo: 'azienda', tags: ['grossista', 'top_cliente'], dataCreazione: '2024-03-20', referente: 'Sara Colombo' },
  { id: 'c-3', tenantId: 't-1', ragioneSociale: 'Impianti Sicuri S.a.s.', partitaIva: '07890123456', codiceFiscale: '07890123456', indirizzo: 'Via Torino 33', citta: 'Torino', cap: '10121', provincia: 'TO', telefono: '+39 011 4445678', email: 'info@impiantisicuri.it', tipo: 'azienda', tags: ['impianti', 'ricorrente'], dataCreazione: '2024-05-15', referente: 'Antonio De Rosa' },
  { id: 'c-4', tenantId: 't-1', ragioneSociale: 'Digital Home S.r.l.', partitaIva: '08901234567', codiceFiscale: '08901234567', indirizzo: 'Via Dante 56', citta: 'Bergamo', cap: '24121', provincia: 'BG', telefono: '+39 035 2223456', email: 'info@digitalhome.it', tipo: 'azienda', tags: ['domotica', 'nuovo'], dataCreazione: '2025-01-10', referente: 'Laura Fontana' },
  { id: 'c-5', tenantId: 't-1', ragioneSociale: 'Rossi Giovanni', partitaIva: '', codiceFiscale: 'RSSGNN80A01F205X', indirizzo: 'Via Verdi 12', citta: 'Monza', cap: '20900', provincia: 'MB', telefono: '+39 333 1112222', email: 'giovanni.rossi@email.it', tipo: 'privato', tags: ['privato'], dataCreazione: '2024-09-05' },
  { id: 'c-6', tenantId: 't-1', ragioneSociale: 'MegaStore Elettronica S.r.l.', partitaIva: '09012345678', codiceFiscale: '09012345678', indirizzo: 'Via Marconi 100', citta: 'Bologna', cap: '40121', provincia: 'BO', telefono: '+39 051 3334567', email: 'ordini@megastore.it', pec: 'megastore@pec.it', codiceDestinatario: 'KRRH6B9', tipo: 'azienda', tags: ['retail', 'grossista'], dataCreazione: '2024-04-22', referente: 'Claudio Neri' },
  { id: 'c-7', tenantId: 't-1', ragioneSociale: 'Costruzioni Lombarde S.r.l.', partitaIva: '10123456789', codiceFiscale: '10123456789', indirizzo: 'Via Garibaldi 45', citta: 'Brescia', cap: '25121', provincia: 'BS', telefono: '+39 030 6667890', email: 'ufficio@costruzionilombarde.it', tipo: 'azienda', tags: ['edilizia', 'impianti'], dataCreazione: '2024-06-18', referente: 'Fabio Martini' },
  { id: 'c-8', tenantId: 't-1', ragioneSociale: 'Albergo Bellavista S.a.s.', partitaIva: '11234567890', codiceFiscale: '11234567890', indirizzo: 'Lungolago Marconi 5', citta: 'Como', cap: '22100', provincia: 'CO', telefono: '+39 031 5556789', email: 'direzione@bellavista.it', tipo: 'azienda', tags: ['hospitality', 'ricorrente'], dataCreazione: '2024-07-02', referente: 'Elena Santoro' },
  { id: 'c-9', tenantId: 't-1', ragioneSociale: 'Farmacia Centrale Dr. Poli', partitaIva: '12345678901', codiceFiscale: '12345678901', indirizzo: 'Piazza Duomo 3', citta: 'Pavia', cap: '27100', provincia: 'PV', telefono: '+39 0382 445566', email: 'farmacia@poli.it', tipo: 'azienda', tags: ['farmacia'], dataCreazione: '2024-08-12' },
  { id: 'c-10', tenantId: 't-1', ragioneSociale: 'Studio Legale Marini', partitaIva: '13456789012', codiceFiscale: '13456789012', indirizzo: 'Via XX Settembre 28', citta: 'Genova', cap: '16121', provincia: 'GE', telefono: '+39 010 8889900', email: 'segreteria@studiomarini.it', pec: 'studiomarini@pec.it', tipo: 'azienda', tags: ['studio'], dataCreazione: '2024-09-20', referente: 'Avv. Marini' },
  { id: 'c-11', tenantId: 't-1', ragioneSociale: 'Ristorante Da Mario S.n.c.', partitaIva: '14567890123', codiceFiscale: '14567890123', indirizzo: 'Via Napoli 67', citta: 'Varese', cap: '21100', provincia: 'VA', telefono: '+39 0332 112233', email: 'info@damariosrl.it', tipo: 'azienda', tags: ['ristorazione'], dataCreazione: '2024-10-05' },
  { id: 'c-12', tenantId: 't-1', ragioneSociale: 'Autofficina Meccanica Rossi', partitaIva: '15678901234', codiceFiscale: '15678901234', indirizzo: 'Via Industria 12', citta: 'Lecco', cap: '23900', provincia: 'LC', telefono: '+39 0341 223344', email: 'info@autorossi.it', tipo: 'azienda', tags: ['automotive'], dataCreazione: '2024-10-18', referente: 'Marco Rossi' },
  { id: 'c-13', tenantId: 't-1', ragioneSociale: 'Scuola Privata San Giuseppe', partitaIva: '16789012345', codiceFiscale: '16789012345', indirizzo: 'Via San Giuseppe 15', citta: 'Cremona', cap: '26100', provincia: 'CR', telefono: '+39 0372 334455', email: 'segreteria@sangiuseppe.it', tipo: 'azienda', tags: ['istruzione'], dataCreazione: '2024-11-01' },
  { id: 'c-14', tenantId: 't-1', ragioneSociale: 'Palestra FitLife', partitaIva: '17890123456', codiceFiscale: '17890123456', indirizzo: 'Via dello Sport 8', citta: 'Lodi', cap: '26900', provincia: 'LO', telefono: '+39 0371 445566', email: 'info@fitlife.it', tipo: 'azienda', tags: ['sport', 'nuovo'], dataCreazione: '2025-01-20' },
  { id: 'c-15', tenantId: 't-1', ragioneSociale: 'Bianchi Maria Teresa', partitaIva: '', codiceFiscale: 'BNCMRT75B41F205Y', indirizzo: 'Via Volta 22', citta: 'Sesto San Giovanni', cap: '20099', provincia: 'MI', telefono: '+39 348 5556677', email: 'mt.bianchi@gmail.com', tipo: 'privato', tags: ['privato'], dataCreazione: '2024-11-15' },
  { id: 'c-16', tenantId: 't-1', ragioneSociale: 'Ottica Visione Perfetta', partitaIva: '18901234567', codiceFiscale: '18901234567', indirizzo: 'Corso Italia 44', citta: 'Milano', cap: '20122', provincia: 'MI', telefono: '+39 02 7778899', email: 'info@visioneperfetta.it', tipo: 'azienda', tags: ['retail', 'ricorrente'], dataCreazione: '2024-05-28', referente: 'Dr. Visconti' },
  { id: 'c-17', tenantId: 't-1', ragioneSociale: 'Cooperativa Sociale Aurora', partitaIva: '19012345678', codiceFiscale: '19012345678', indirizzo: 'Via della Pace 20', citta: 'Mantova', cap: '46100', provincia: 'MN', telefono: '+39 0376 556677', email: 'coop@aurora.org', tipo: 'azienda', tags: ['cooperativa'], dataCreazione: '2024-12-01' },
  { id: 'c-18', tenantId: 't-1', ragioneSociale: 'Agenzia Immobiliare CasaNova', partitaIva: '20123456789', codiceFiscale: '20123456789', indirizzo: 'Piazza Repubblica 10', citta: 'Piacenza', cap: '29121', provincia: 'PC', telefono: '+39 0523 667788', email: 'info@casanova.it', tipo: 'azienda', tags: ['immobiliare'], dataCreazione: '2024-06-30', referente: 'Gianluca Ferri' },
  { id: 'c-19', tenantId: 't-1', ragioneSociale: 'Tipografia Express S.r.l.', partitaIva: '21234567890', codiceFiscale: '21234567890', indirizzo: 'Via dell\'Artigianato 5', citta: 'Novara', cap: '28100', provincia: 'NO', telefono: '+39 0321 778899', email: 'ordini@tipografiaexpress.it', tipo: 'azienda', tags: ['tipografia', 'ricorrente'], dataCreazione: '2024-07-15', referente: 'Stefano Bruni' },
  { id: 'c-20', tenantId: 't-1', ragioneSociale: 'Centro Medico Salus', partitaIva: '22345678901', codiceFiscale: '22345678901', indirizzo: 'Via della Salute 30', citta: 'Alessandria', cap: '15121', provincia: 'AL', telefono: '+39 0131 889900', email: 'info@centrosalus.it', pec: 'centrosalus@pec.it', tipo: 'azienda', tags: ['sanitario', 'premium'], dataCreazione: '2024-04-05', referente: 'Dr. Caruso' },
  { id: 'c-21', tenantId: 't-1', ragioneSociale: 'Laboratorio Analisi BioTech', partitaIva: '23456789012', codiceFiscale: '23456789012', indirizzo: 'Via Pasteur 18', citta: 'Pavia', cap: '27100', provincia: 'PV', telefono: '+39 0382 990011', email: 'lab@biotech.it', tipo: 'azienda', tags: ['laboratorio', 'sanitario'], dataCreazione: '2024-08-25' },
  { id: 'c-22', tenantId: 't-1', ragioneSociale: 'Mobilificio Artigiano S.n.c.', partitaIva: '24567890123', codiceFiscale: '24567890123', indirizzo: 'Via del Legno 7', citta: 'Cantù', cap: '22063', provincia: 'CO', telefono: '+39 031 1122334', email: 'info@mobilificioartigiano.it', tipo: 'azienda', tags: ['arredamento'], dataCreazione: '2024-09-10', referente: 'Pietro Sala' },
  { id: 'c-23', tenantId: 't-1', ragioneSociale: 'Panetteria Il Forno d\'Oro', partitaIva: '25678901234', codiceFiscale: '25678901234', indirizzo: 'Via del Pane 2', citta: 'Vigevano', cap: '27029', provincia: 'PV', telefono: '+39 0381 223344', email: 'ilfornooro@email.it', tipo: 'azienda', tags: ['alimentare'], dataCreazione: '2024-10-30' },
  { id: 'c-24', tenantId: 't-1', ragioneSociale: 'Assicurazioni Futuro S.a.s.', partitaIva: '26789012345', codiceFiscale: '26789012345', indirizzo: 'Viale Libertà 55', citta: 'Busto Arsizio', cap: '21052', provincia: 'VA', telefono: '+39 0331 334455', email: 'agenzia@assfuturo.it', tipo: 'azienda', tags: ['assicurazioni', 'ricorrente'], dataCreazione: '2024-05-12', referente: 'Dott. Pellegrini' },
  { id: 'c-25', tenantId: 't-1', ragioneSociale: 'Ferramenta Moderna S.r.l.', partitaIva: '27890123456', codiceFiscale: '27890123456', indirizzo: 'Via Cavour 90', citta: 'Gallarate', cap: '21013', provincia: 'VA', telefono: '+39 0331 445566', email: 'vendite@ferramentamoderna.it', tipo: 'azienda', tags: ['ferramenta', 'grossista'], dataCreazione: '2024-06-08', referente: 'Massimo Torre' },
  { id: 'c-26', tenantId: 't-1', ragioneSociale: 'Grafica Creativa Studio', partitaIva: '28901234567', codiceFiscale: '28901234567', indirizzo: 'Via dei Colori 14', citta: 'Milano', cap: '20123', provincia: 'MI', telefono: '+39 02 1234999', email: 'hello@graficacreativa.it', tipo: 'azienda', tags: ['design', 'nuovo'], dataCreazione: '2025-02-01', referente: 'Alessia Gentile' },
  { id: 'c-27', tenantId: 't-1', ragioneSociale: 'Conti Francesco', partitaIva: '', codiceFiscale: 'CNTFNC90C15F205Z', indirizzo: 'Via Leopardi 8', citta: 'Rho', cap: '20017', provincia: 'MI', telefono: '+39 340 9998877', email: 'f.conti@email.it', tipo: 'privato', tags: ['privato'], dataCreazione: '2025-02-10' },
];

// ==================== PRODOTTI (Tenant 1) ====================
// TODO: Replace with Supabase query

export const prodotti: Prodotto[] = [
  { id: 'p-1', tenantId: 't-1', nome: 'Cavo HDMI 2.1 Ultra HD 2m', sku: 'CAV-HDMI-2M', descrizione: 'Cavo HDMI 2.1 certificato 8K 2 metri', prezzo: 24.90, prezzoAcquisto: 12.50, giacenza: 150, scorteMinime: 30, categoria: 'Cavi e Connettori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-2', tenantId: 't-1', nome: 'Cavo HDMI 2.1 Ultra HD 5m', sku: 'CAV-HDMI-5M', descrizione: 'Cavo HDMI 2.1 certificato 8K 5 metri', prezzo: 39.90, prezzoAcquisto: 19.00, giacenza: 85, scorteMinime: 20, categoria: 'Cavi e Connettori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-3', tenantId: 't-1', nome: 'Cavo Ethernet Cat.8 3m', sku: 'CAV-ETH-3M', descrizione: 'Cavo di rete Cat.8 schermato 3 metri', prezzo: 18.50, prezzoAcquisto: 8.20, giacenza: 200, scorteMinime: 40, categoria: 'Cavi e Connettori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-4', tenantId: 't-1', nome: 'Alimentatore USB-C 65W', sku: 'ALM-USBC-65', descrizione: 'Caricatore USB-C PD 65W GaN', prezzo: 45.00, prezzoAcquisto: 22.00, giacenza: 60, scorteMinime: 15, categoria: 'Alimentatori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-5', tenantId: 't-1', nome: 'Alimentatore USB-C 100W', sku: 'ALM-USBC-100', descrizione: 'Caricatore USB-C PD 100W GaN doppia porta', prezzo: 69.90, prezzoAcquisto: 35.00, giacenza: 35, scorteMinime: 10, categoria: 'Alimentatori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-6', tenantId: 't-1', nome: 'Multipresa Smart WiFi 4 posti', sku: 'MUL-WIFI-4', descrizione: 'Multipresa smart WiFi 4 prese + 2 USB', prezzo: 34.90, prezzoAcquisto: 16.00, giacenza: 45, scorteMinime: 10, categoria: 'Domotica', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-7', tenantId: 't-1', nome: 'Lampadina Smart E27 RGB', sku: 'LAM-SMART-E27', descrizione: 'Lampadina LED smart WiFi E27 RGB 10W', prezzo: 14.90, prezzoAcquisto: 5.50, giacenza: 300, scorteMinime: 50, categoria: 'Domotica', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-8', tenantId: 't-1', nome: 'Switch di rete 8 porte Gigabit', sku: 'SWT-8P-GIG', descrizione: 'Switch Ethernet 8 porte 10/100/1000', prezzo: 29.90, prezzoAcquisto: 15.00, giacenza: 40, scorteMinime: 10, categoria: 'Networking', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-9', tenantId: 't-1', nome: 'Router WiFi 6 AX3000', sku: 'RTR-AX3000', descrizione: 'Router WiFi 6 dual-band AX3000', prezzo: 89.90, prezzoAcquisto: 48.00, giacenza: 22, scorteMinime: 5, categoria: 'Networking', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-10', tenantId: 't-1', nome: 'Access Point WiFi 6E', sku: 'AP-WIFI6E', descrizione: 'Access Point enterprise WiFi 6E tri-band', prezzo: 189.00, prezzoAcquisto: 95.00, giacenza: 12, scorteMinime: 3, categoria: 'Networking', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-11', tenantId: 't-1', nome: 'Gruppo di Continuità 1000VA', sku: 'UPS-1000VA', descrizione: 'UPS Line Interactive 1000VA/600W', prezzo: 129.00, prezzoAcquisto: 68.00, giacenza: 18, scorteMinime: 5, categoria: 'Alimentatori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-12', tenantId: 't-1', nome: 'Webcam Full HD 1080p', sku: 'WEB-FHD', descrizione: 'Webcam USB Full HD con microfono integrato', prezzo: 49.90, prezzoAcquisto: 24.00, giacenza: 55, scorteMinime: 10, categoria: 'Periferiche', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-13', tenantId: 't-1', nome: 'Mouse Wireless Ergonomico', sku: 'MOU-ERGO', descrizione: 'Mouse wireless ergonomico 2.4GHz + BT', prezzo: 32.90, prezzoAcquisto: 14.00, giacenza: 75, scorteMinime: 15, categoria: 'Periferiche', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-14', tenantId: 't-1', nome: 'Tastiera Meccanica Bluetooth', sku: 'TAS-MECH-BT', descrizione: 'Tastiera meccanica wireless Bluetooth layout IT', prezzo: 79.90, prezzoAcquisto: 38.00, giacenza: 30, scorteMinime: 8, categoria: 'Periferiche', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-15', tenantId: 't-1', nome: 'Hub USB-C 7-in-1', sku: 'HUB-USBC-7', descrizione: 'Hub USB-C con HDMI, USB-A, SD, Ethernet', prezzo: 54.90, prezzoAcquisto: 26.00, giacenza: 42, scorteMinime: 10, categoria: 'Accessori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-16', tenantId: 't-1', nome: 'Supporto Monitor Regolabile', sku: 'SUP-MON-REG', descrizione: 'Braccio monitor da scrivania VESA 75/100', prezzo: 44.90, prezzoAcquisto: 20.00, giacenza: 25, scorteMinime: 5, categoria: 'Accessori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-17', tenantId: 't-1', nome: 'SSD NVMe 1TB M.2', sku: 'SSD-NVME-1T', descrizione: 'SSD NVMe PCIe 4.0 1TB M.2 2280', prezzo: 89.90, prezzoAcquisto: 52.00, giacenza: 38, scorteMinime: 8, categoria: 'Storage', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-18', tenantId: 't-1', nome: 'SSD NVMe 2TB M.2', sku: 'SSD-NVME-2T', descrizione: 'SSD NVMe PCIe 4.0 2TB M.2 2280', prezzo: 159.00, prezzoAcquisto: 92.00, giacenza: 15, scorteMinime: 3, categoria: 'Storage', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-19', tenantId: 't-1', nome: 'Hard Disk Esterno 4TB USB 3.2', sku: 'HDD-EXT-4T', descrizione: 'Hard Disk esterno portatile 4TB USB 3.2', prezzo: 109.00, prezzoAcquisto: 62.00, giacenza: 20, scorteMinime: 5, categoria: 'Storage', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-20', tenantId: 't-1', nome: 'Telecamera IP WiFi 2K', sku: 'CAM-IP-2K', descrizione: 'Telecamera sorveglianza WiFi 2K con visione notturna', prezzo: 59.90, prezzoAcquisto: 28.00, giacenza: 48, scorteMinime: 10, categoria: 'Sicurezza', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-21', tenantId: 't-1', nome: 'Videocitofono Smart WiFi', sku: 'VID-SMART', descrizione: 'Videocitofono smart WiFi con monitor 7"', prezzo: 149.00, prezzoAcquisto: 75.00, giacenza: 14, scorteMinime: 3, categoria: 'Sicurezza', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-22', tenantId: 't-1', nome: 'Sensore Movimento PIR', sku: 'SEN-PIR', descrizione: 'Sensore di movimento PIR wireless 433MHz', prezzo: 19.90, prezzoAcquisto: 7.50, giacenza: 120, scorteMinime: 25, categoria: 'Sicurezza', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-23', tenantId: 't-1', nome: 'Cablaggio Strutturato Cat.6 (100m)', sku: 'CAB-CAT6-100', descrizione: 'Matassa cavo Cat.6 UTP 100 metri', prezzo: 79.90, prezzoAcquisto: 42.00, giacenza: 30, scorteMinime: 5, categoria: 'Cavi e Connettori', unita: 'bobina', iva: 22, attivo: true },
  { id: 'p-24', tenantId: 't-1', nome: 'Pannello Patch 24 Porte', sku: 'PAN-24P', descrizione: 'Pannello patch 24 porte Cat.6 1U rack', prezzo: 45.00, prezzoAcquisto: 22.00, giacenza: 8, scorteMinime: 2, categoria: 'Networking', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-25', tenantId: 't-1', nome: 'Armadio Rack 12U', sku: 'RACK-12U', descrizione: 'Armadio rack da parete 12U 600x450mm', prezzo: 189.00, prezzoAcquisto: 98.00, giacenza: 6, scorteMinime: 2, categoria: 'Networking', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-26', tenantId: 't-1', nome: 'Termostato Smart WiFi', sku: 'TERM-SMART', descrizione: 'Termostato intelligente WiFi con display touch', prezzo: 79.90, prezzoAcquisto: 38.00, giacenza: 28, scorteMinime: 5, categoria: 'Domotica', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-27', tenantId: 't-1', nome: 'Presa Smart WiFi singola', sku: 'PRE-SMART', descrizione: 'Presa smart WiFi con monitoraggio energia', prezzo: 12.90, prezzoAcquisto: 4.80, giacenza: 180, scorteMinime: 30, categoria: 'Domotica', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-28', tenantId: 't-1', nome: 'Kit Videosorveglianza 4CH', sku: 'KIT-VS-4CH', descrizione: 'Kit DVR 4 canali + 4 telecamere HD + HDD 1TB', prezzo: 349.00, prezzoAcquisto: 185.00, giacenza: 7, scorteMinime: 2, categoria: 'Sicurezza', unita: 'kit', iva: 22, attivo: true },
  { id: 'p-29', tenantId: 't-1', nome: 'Batteria Tampone 12V 7Ah', sku: 'BAT-12V-7A', descrizione: 'Batteria al piombo 12V 7Ah per UPS e allarmi', prezzo: 18.90, prezzoAcquisto: 8.50, giacenza: 65, scorteMinime: 15, categoria: 'Alimentatori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-30', tenantId: 't-1', nome: 'Ciabatta Filtrata 6 Posti', sku: 'CIA-FILT-6', descrizione: 'Ciabatta con filtro EMI 6 posti + interruttore', prezzo: 22.90, prezzoAcquisto: 10.00, giacenza: 95, scorteMinime: 20, categoria: 'Alimentatori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-31', tenantId: 't-1', nome: 'Monitor LED 27" 4K', sku: 'MON-27-4K', descrizione: 'Monitor LED IPS 27 pollici 4K UHD USB-C', prezzo: 349.00, prezzoAcquisto: 210.00, giacenza: 10, scorteMinime: 3, categoria: 'Monitor', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-32', tenantId: 't-1', nome: 'Monitor LED 24" Full HD', sku: 'MON-24-FHD', descrizione: 'Monitor LED IPS 24 pollici Full HD HDMI+DP', prezzo: 179.00, prezzoAcquisto: 105.00, giacenza: 16, scorteMinime: 5, categoria: 'Monitor', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-33', tenantId: 't-1', nome: 'Cuffie Bluetooth ANC', sku: 'CUF-BT-ANC', descrizione: 'Cuffie over-ear Bluetooth 5.3 con cancellazione rumore', prezzo: 89.90, prezzoAcquisto: 42.00, giacenza: 33, scorteMinime: 8, categoria: 'Audio', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-34', tenantId: 't-1', nome: 'Speaker Bluetooth Portatile', sku: 'SPK-BT-PORT', descrizione: 'Speaker Bluetooth portatile waterproof 20W', prezzo: 39.90, prezzoAcquisto: 18.00, giacenza: 44, scorteMinime: 10, categoria: 'Audio', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-35', tenantId: 't-1', nome: 'Cavo di Alimentazione IEC C13 2m', sku: 'CAV-IEC-2M', descrizione: 'Cavo alimentazione standard IEC C13 2 metri', prezzo: 5.90, prezzoAcquisto: 1.80, giacenza: 250, scorteMinime: 50, categoria: 'Cavi e Connettori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-36', tenantId: 't-1', nome: 'Adattatore USB-C a HDMI', sku: 'ADP-USBC-HDMI', descrizione: 'Adattatore da USB-C a HDMI 4K 60Hz', prezzo: 19.90, prezzoAcquisto: 8.00, giacenza: 70, scorteMinime: 15, categoria: 'Accessori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-37', tenantId: 't-1', nome: 'Docking Station USB-C Triple', sku: 'DOCK-USBC-3', descrizione: 'Docking Station USB-C triplo monitor 100W PD', prezzo: 179.00, prezzoAcquisto: 92.00, giacenza: 11, scorteMinime: 3, categoria: 'Accessori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-38', tenantId: 't-1', nome: 'Toner Compatibile HP 26A', sku: 'TON-HP26A', descrizione: 'Toner nero compatibile HP CF226A', prezzo: 29.90, prezzoAcquisto: 12.00, giacenza: 40, scorteMinime: 10, categoria: 'Consumabili', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-39', tenantId: 't-1', nome: 'Carta A4 80g (500 fogli)', sku: 'CAR-A4-500', descrizione: 'Risma carta A4 80g/m² bianca 500 fogli', prezzo: 5.90, prezzoAcquisto: 3.20, giacenza: 150, scorteMinime: 30, categoria: 'Consumabili', unita: 'risma', iva: 22, attivo: true },
  { id: 'p-40', tenantId: 't-1', nome: 'Powerbank 20000mAh USB-C', sku: 'PWB-20K-USBC', descrizione: 'Powerbank 20000mAh con PD 65W USB-C', prezzo: 49.90, prezzoAcquisto: 24.00, giacenza: 38, scorteMinime: 8, categoria: 'Accessori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-41', tenantId: 't-1', nome: 'NAS 2 Bay', sku: 'NAS-2BAY', descrizione: 'NAS domestico/ufficio 2 bay senza dischi', prezzo: 229.00, prezzoAcquisto: 135.00, giacenza: 5, scorteMinime: 2, categoria: 'Storage', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-42', tenantId: 't-1', nome: 'Cavo USB-C 1m', sku: 'CAV-USBC-1M', descrizione: 'Cavo USB-C 3.2 Gen2 100W 1 metro', prezzo: 12.90, prezzoAcquisto: 4.50, giacenza: 180, scorteMinime: 30, categoria: 'Cavi e Connettori', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-43', tenantId: 't-1', nome: 'Protezione Sovratensione DIN', sku: 'PRO-DIN', descrizione: 'Scaricatore sovratensione per quadro DIN', prezzo: 39.90, prezzoAcquisto: 18.00, giacenza: 22, scorteMinime: 5, categoria: 'Sicurezza', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-44', tenantId: 't-1', nome: 'Sirena Allarme Esterna', sku: 'SIR-EST', descrizione: 'Sirena autoalimentata per esterno con lampeggiante', prezzo: 69.90, prezzoAcquisto: 32.00, giacenza: 15, scorteMinime: 3, categoria: 'Sicurezza', unita: 'pz', iva: 22, attivo: true },
  { id: 'p-45', tenantId: 't-1', nome: 'Stampante Laser Mono WiFi', sku: 'STA-LAS-MONO', descrizione: 'Stampante laser monocromatica WiFi fronte/retro', prezzo: 199.00, prezzoAcquisto: 115.00, giacenza: 8, scorteMinime: 2, categoria: 'Periferiche', unita: 'pz', iva: 22, attivo: true },
];

// ==================== ORDINI (Tenant 1) ====================
// TODO: Replace with Supabase query

function generateOrdini(): Ordine[] {
  const stati: StatoOrdine[] = ['nuovo', 'in_lavorazione', 'spedito', 'completato', 'annullato'];
  const canali: Ordine['canale'][] = ['diretto', 'woocommerce', 'prestashop', 'telefono', 'email'];
  const ordini: Ordine[] = [];

  const orderData = [
    { clienteId: 'c-2', mese: 9, giorno: 5, prodotti: [{ idx: 0, q: 20 }, { idx: 7, q: 5 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-1', mese: 9, giorno: 12, prodotti: [{ idx: 3, q: 10 }, { idx: 14, q: 5 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-6', mese: 9, giorno: 18, prodotti: [{ idx: 6, q: 50 }, { idx: 26, q: 30 }], stato: 'completato' as StatoOrdine, canale: 'woocommerce' as Ordine['canale'] },
    { clienteId: 'c-3', mese: 9, giorno: 25, prodotti: [{ idx: 8, q: 3 }, { idx: 22, q: 2 }], stato: 'completato' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
    { clienteId: 'c-7', mese: 10, giorno: 2, prodotti: [{ idx: 19, q: 4 }, { idx: 21, q: 8 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-8', mese: 10, giorno: 8, prodotti: [{ idx: 5, q: 6 }, { idx: 25, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-2', mese: 10, giorno: 15, prodotti: [{ idx: 16, q: 8 }, { idx: 17, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-10', mese: 10, giorno: 20, prodotti: [{ idx: 11, q: 2 }, { idx: 12, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'prestashop' as Ordine['canale'] },
    { clienteId: 'c-4', mese: 10, giorno: 28, prodotti: [{ idx: 5, q: 8 }, { idx: 6, q: 20 }, { idx: 25, q: 5 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-16', mese: 11, giorno: 3, prodotti: [{ idx: 30, q: 2 }, { idx: 15, q: 2 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-1', mese: 11, giorno: 8, prodotti: [{ idx: 8, q: 2 }, { idx: 9, q: 1 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-19', mese: 11, giorno: 12, prodotti: [{ idx: 44, q: 1 }, { idx: 37, q: 5 }], stato: 'completato' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
    { clienteId: 'c-6', mese: 11, giorno: 18, prodotti: [{ idx: 0, q: 30 }, { idx: 1, q: 15 }, { idx: 2, q: 25 }], stato: 'completato' as StatoOrdine, canale: 'woocommerce' as Ordine['canale'] },
    { clienteId: 'c-20', mese: 11, giorno: 22, prodotti: [{ idx: 44, q: 2 }, { idx: 11, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-3', mese: 11, giorno: 28, prodotti: [{ idx: 27, q: 1 }, { idx: 19, q: 6 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-25', mese: 12, giorno: 2, prodotti: [{ idx: 7, q: 10 }, { idx: 22, q: 5 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-8', mese: 12, giorno: 5, prodotti: [{ idx: 20, q: 2 }, { idx: 19, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
    { clienteId: 'c-2', mese: 12, giorno: 10, prodotti: [{ idx: 30, q: 5 }, { idx: 31, q: 8 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-12', mese: 12, giorno: 15, prodotti: [{ idx: 10, q: 1 }, { idx: 28, q: 2 }], stato: 'completato' as StatoOrdine, canale: 'prestashop' as Ordine['canale'] },
    { clienteId: 'c-7', mese: 12, giorno: 18, prodotti: [{ idx: 23, q: 3 }, { idx: 24, q: 1 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-1', mese: 12, giorno: 22, prodotti: [{ idx: 36, q: 2 }, { idx: 14, q: 5 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    // Gennaio 2026
    { clienteId: 'c-6', mese: 1, giorno: 8, prodotti: [{ idx: 32, q: 10 }, { idx: 33, q: 8 }], stato: 'completato' as StatoOrdine, canale: 'woocommerce' as Ordine['canale'] },
    { clienteId: 'c-4', mese: 1, giorno: 12, prodotti: [{ idx: 5, q: 10 }, { idx: 6, q: 30 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-2', mese: 1, giorno: 15, prodotti: [{ idx: 0, q: 40 }, { idx: 2, q: 30 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-20', mese: 1, giorno: 20, prodotti: [{ idx: 30, q: 3 }, { idx: 44, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-3', mese: 1, giorno: 25, prodotti: [{ idx: 8, q: 5 }, { idx: 9, q: 2 }], stato: 'completato' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
    { clienteId: 'c-18', mese: 1, giorno: 28, prodotti: [{ idx: 11, q: 2 }, { idx: 12, q: 2 }], stato: 'spedito' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    // Febbraio 2026
    { clienteId: 'c-1', mese: 2, giorno: 3, prodotti: [{ idx: 4, q: 5 }, { idx: 36, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-6', mese: 2, giorno: 7, prodotti: [{ idx: 6, q: 40 }, { idx: 26, q: 20 }], stato: 'completato' as StatoOrdine, canale: 'woocommerce' as Ordine['canale'] },
    { clienteId: 'c-16', mese: 2, giorno: 10, prodotti: [{ idx: 31, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-22', mese: 2, giorno: 13, prodotti: [{ idx: 7, q: 15 }, { idx: 26, q: 8 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-2', mese: 2, giorno: 18, prodotti: [{ idx: 3, q: 15 }, { idx: 4, q: 10 }], stato: 'completato' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-7', mese: 2, giorno: 21, prodotti: [{ idx: 22, q: 5 }, { idx: 34, q: 10 }], stato: 'spedito' as StatoOrdine, canale: 'prestashop' as Ordine['canale'] },
    { clienteId: 'c-24', mese: 2, giorno: 25, prodotti: [{ idx: 38, q: 20 }, { idx: 37, q: 8 }], stato: 'spedito' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-10', mese: 2, giorno: 28, prodotti: [{ idx: 44, q: 1 }, { idx: 37, q: 3 }], stato: 'completato' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
    // Marzo 2026
    { clienteId: 'c-1', mese: 3, giorno: 3, prodotti: [{ idx: 16, q: 5 }, { idx: 17, q: 2 }], stato: 'in_lavorazione' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-4', mese: 3, giorno: 5, prodotti: [{ idx: 20, q: 8 }, { idx: 21, q: 4 }, { idx: 42, q: 3 }], stato: 'in_lavorazione' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-6', mese: 3, giorno: 8, prodotti: [{ idx: 0, q: 50 }, { idx: 1, q: 25 }], stato: 'nuovo' as StatoOrdine, canale: 'woocommerce' as Ordine['canale'] },
    { clienteId: 'c-2', mese: 3, giorno: 10, prodotti: [{ idx: 8, q: 10 }, { idx: 23, q: 5 }], stato: 'nuovo' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-14', mese: 3, giorno: 12, prodotti: [{ idx: 32, q: 5 }, { idx: 33, q: 3 }], stato: 'nuovo' as StatoOrdine, canale: 'email' as Ordine['canale'] },
    { clienteId: 'c-26', mese: 3, giorno: 14, prodotti: [{ idx: 30, q: 2 }, { idx: 15, q: 2 }], stato: 'nuovo' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    { clienteId: 'c-8', mese: 3, giorno: 15, prodotti: [{ idx: 6, q: 10 }, { idx: 25, q: 2 }], stato: 'nuovo' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
    { clienteId: 'c-5', mese: 3, giorno: 16, prodotti: [{ idx: 12, q: 1 }, { idx: 13, q: 1 }], stato: 'nuovo' as StatoOrdine, canale: 'diretto' as Ordine['canale'] },
    // Ordine annullato
    { clienteId: 'c-11', mese: 2, giorno: 14, prodotti: [{ idx: 5, q: 3 }], stato: 'annullato' as StatoOrdine, canale: 'telefono' as Ordine['canale'] },
  ];

  orderData.forEach((od, i) => {
    const anno = od.mese >= 9 ? 2025 : 2026;
    const righe: RigaOrdine[] = od.prodotti.map((p) => {
      const prod = prodotti[p.idx];
      const tot = prod.prezzo * p.q;
      return {
        prodottoId: prod.id,
        nome: prod.nome,
        quantita: p.q,
        prezzoUnitario: prod.prezzo,
        iva: prod.iva,
        totale: tot,
      };
    });
    const subtotale = righe.reduce((s, r) => s + r.totale, 0);
    const iva = subtotale * 0.22;
    const cliente = clienti.find((c) => c.id === od.clienteId)!;

    ordini.push({
      id: `ord-${String(i + 1).padStart(3, '0')}`,
      tenantId: 't-1',
      numero: `ORD-${anno}-${String(i + 1).padStart(4, '0')}`,
      clienteId: od.clienteId,
      clienteNome: cliente.ragioneSociale,
      data: `${anno}-${String(od.mese).padStart(2, '0')}-${String(od.giorno).padStart(2, '0')}`,
      stato: od.stato,
      righe,
      subtotale: Math.round(subtotale * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      totale: Math.round((subtotale + iva) * 100) / 100,
      canale: od.canale,
    });
  });

  return ordini;
}

export const ordini: Ordine[] = generateOrdini();

// ==================== FATTURE (Tenant 1) ====================
// TODO: Replace with Supabase query

function generateFatture(): Fattura[] {
  const fatture: Fattura[] = [];
  const statiSDI: StatoSDI[] = ['consegnata', 'consegnata', 'consegnata', 'accettata', 'inviata', 'scartata', 'in_attesa', 'bozza'];

  // Genera fatture dagli ordini completati
  const ordiniCompletati = ordini.filter((o) => o.stato === 'completato');
  ordiniCompletati.forEach((ord, i) => {
    const statoSDI = statiSDI[i % statiSDI.length];
    const notificheSDI = [];

    if (statoSDI !== 'bozza') {
      notificheSDI.push({
        tipo: 'Ricevuta di Consegna' as const,
        data: ord.data,
        descrizione: 'Fattura trasmessa al Sistema di Interscambio',
      });
    }
    if (statoSDI === 'consegnata' || statoSDI === 'accettata') {
      notificheSDI.push({
        tipo: 'Ricevuta di Consegna' as const,
        data: ord.data,
        descrizione: 'Fattura consegnata al destinatario',
      });
    }
    if (statoSDI === 'accettata') {
      notificheSDI.push({
        tipo: 'Esito Committente' as const,
        data: ord.data,
        descrizione: 'Fattura accettata dal committente',
      });
    }
    if (statoSDI === 'scartata') {
      notificheSDI.push({
        tipo: 'Notifica di Scarto' as const,
        data: ord.data,
        descrizione: 'Fattura scartata per errore nel codice destinatario',
      });
    }

    const dataDate = new Date(ord.data);
    const scadenza = new Date(dataDate);
    scadenza.setDate(scadenza.getDate() + 30);

    const oggi = new Date('2026-03-18');
    let statoPag: Fattura['stato'] = 'non_pagata';
    if (statoSDI === 'consegnata' || statoSDI === 'accettata') {
      statoPag = i % 3 === 0 ? 'pagata' : scadenza < oggi ? 'scaduta' : 'non_pagata';
    }

    fatture.push({
      id: `fat-${String(i + 1).padStart(3, '0')}`,
      tenantId: 't-1',
      numero: `FE-${new Date(ord.data).getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      tipo: 'emessa',
      clienteId: ord.clienteId,
      clienteNome: ord.clienteNome,
      data: ord.data,
      dataScadenza: scadenza.toISOString().split('T')[0],
      stato: statoPag,
      statoSDI,
      notificheSDI,
      ordineId: ord.id,
      righe: ord.righe,
      subtotale: ord.subtotale,
      iva: ord.iva,
      totale: ord.totale,
      xmlRiferimento: `IT02345678901_${String(i + 1).padStart(5, '0')}.xml`,
    });
  });

  // Aggiungi alcune fatture ricevute
  const fattureRicevute = [
    { fornitore: 'Distribuzione Elettronica S.p.A.', importo: 4520.00 },
    { fornitore: 'LogiTrasporti S.r.l.', importo: 890.00 },
    { fornitore: 'Telecom Business S.p.A.', importo: 245.00 },
    { fornitore: 'Enel Energia S.p.A.', importo: 680.50 },
    { fornitore: 'Assicurazioni Generali', importo: 1200.00 },
  ];

  fattureRicevute.forEach((fr, i) => {
    const idx = fatture.length + 1;
    fatture.push({
      id: `fat-r-${String(i + 1).padStart(3, '0')}`,
      tenantId: 't-1',
      numero: `FR-2026-${String(i + 1).padStart(4, '0')}`,
      tipo: 'ricevuta',
      clienteId: '',
      clienteNome: fr.fornitore,
      data: `2026-0${i + 1}-15`,
      dataScadenza: `2026-0${i + 2}-15`,
      stato: i < 3 ? 'pagata' : 'non_pagata',
      statoSDI: 'consegnata',
      notificheSDI: [{ tipo: 'Ricevuta di Consegna', data: `2026-0${i + 1}-15`, descrizione: 'Fattura ricevuta' }],
      righe: [{ prodottoId: '', nome: fr.fornitore, quantita: 1, prezzoUnitario: fr.importo / 1.22, iva: 22, totale: fr.importo / 1.22 }],
      subtotale: Math.round((fr.importo / 1.22) * 100) / 100,
      iva: Math.round((fr.importo - fr.importo / 1.22) * 100) / 100,
      totale: fr.importo,
    });
  });

  return fatture;
}

export const fatture: Fattura[] = generateFatture();

// ==================== DIPENDENTI (Tenant 1) ====================
// TODO: Replace with Supabase query

export const dipendenti: Dipendente[] = [
  { id: 'd-1', tenantId: 't-1', nome: 'Luigi', cognome: 'Rossi', codiceFiscale: 'RSSLGU70A01F205X', dataNascita: '1970-01-01', luogoNascita: 'Milano', indirizzo: 'Via Roma 10, Milano', telefono: '+39 333 1111111', email: 'luigi@rossielettonica.it', ruoloAziendale: 'Amministratore', tipoContratto: 'indeterminato', dataAssunzione: '2010-03-01', ralLorda: 55000, livello: 'Quadro', iban: 'IT60X0542811101000000123456' },
  { id: 'd-2', tenantId: 't-1', nome: 'Anna', cognome: 'Bianchi', codiceFiscale: 'BNCNNA85B41F205Y', dataNascita: '1985-02-01', luogoNascita: 'Monza', indirizzo: 'Via Verdi 5, Monza', telefono: '+39 333 2222222', email: 'anna@rossielettonica.it', ruoloAziendale: 'Responsabile Vendite', tipoContratto: 'indeterminato', dataAssunzione: '2018-06-15', ralLorda: 38000, livello: '3° Livello', iban: 'IT60X0542811101000000234567' },
  { id: 'd-3', tenantId: 't-1', nome: 'Giuseppe', cognome: 'Ferrara', codiceFiscale: 'FRRGPP82C15F205Z', dataNascita: '1982-03-15', luogoNascita: 'Bergamo', indirizzo: 'Via Dante 20, Bergamo', telefono: '+39 333 3333333', email: 'giuseppe@rossielettonica.it', ruoloAziendale: 'Tecnico Installatore', tipoContratto: 'indeterminato', dataAssunzione: '2019-09-01', ralLorda: 32000, livello: '4° Livello', iban: 'IT60X0542811101000000345678' },
  { id: 'd-4', tenantId: 't-1', nome: 'Maria', cognome: 'Conti', codiceFiscale: 'CNTMRA90D45F205W', dataNascita: '1990-04-05', luogoNascita: 'Como', indirizzo: 'Via Manzoni 8, Como', telefono: '+39 333 4444444', email: 'maria@rossielettonica.it', ruoloAziendale: 'Amministrazione', tipoContratto: 'indeterminato', dataAssunzione: '2020-01-10', ralLorda: 30000, livello: '4° Livello', iban: 'IT60X0542811101000000456789' },
  { id: 'd-5', tenantId: 't-1', nome: 'Paolo', cognome: 'Ricci', codiceFiscale: 'RCCPLA88E20F205V', dataNascita: '1988-05-20', luogoNascita: 'Brescia', indirizzo: 'Via Garibaldi 15, Brescia', telefono: '+39 333 5555555', email: 'paolo@rossielettonica.it', ruoloAziendale: 'Magazziniere', tipoContratto: 'indeterminato', dataAssunzione: '2021-03-15', ralLorda: 26000, livello: '5° Livello', iban: 'IT60X0542811101000000567890' },
  { id: 'd-6', tenantId: 't-1', nome: 'Francesca', cognome: 'Moretti', codiceFiscale: 'MRTFNC95F50F205U', dataNascita: '1995-06-10', luogoNascita: 'Lecco', indirizzo: 'Via Manzoni 30, Lecco', telefono: '+39 333 6666666', email: 'francesca@rossielettonica.it', ruoloAziendale: 'Commerciale', tipoContratto: 'determinato', dataAssunzione: '2024-09-01', ralLorda: 28000, livello: '4° Livello', iban: 'IT60X0542811101000000678901' },
  { id: 'd-7', tenantId: 't-1', nome: 'Roberto', cognome: 'Colombo', codiceFiscale: 'CLMRRT92G25F205T', dataNascita: '1992-07-25', luogoNascita: 'Varese', indirizzo: 'Via Volta 12, Varese', telefono: '+39 333 7777777', email: 'roberto@rossielettonica.it', ruoloAziendale: 'Tecnico Assistenza', tipoContratto: 'apprendistato', dataAssunzione: '2025-01-15', ralLorda: 24000, livello: '5° Livello', iban: 'IT60X0542811101000000789012' },
];

// ==================== CEDOLINI ====================
// TODO: Replace with Supabase query

function generateCedolini(): Cedolino[] {
  const cedolini: Cedolino[] = [];
  const mesi = [
    { mese: 1, anno: 2026 },
    { mese: 2, anno: 2026 },
  ];

  dipendenti.forEach((dip) => {
    mesi.forEach((m) => {
      const lordo = Math.round(dip.ralLorda / 13 * 100) / 100;
      const inps = Math.round(lordo * 0.0919 * 100) / 100;
      const imponibile = lordo - inps;
      const irpef = Math.round(imponibile * 0.23 * 100) / 100;
      const addReg = Math.round(imponibile * 0.0173 * 100) / 100;
      const addCom = Math.round(imponibile * 0.008 * 100) / 100;
      const netto = Math.round((lordo - inps - irpef - addReg - addCom) * 100) / 100;

      cedolini.push({
        id: `ced-${dip.id}-${m.anno}-${m.mese}`,
        dipendenteId: dip.id,
        tenantId: 't-1',
        mese: m.mese,
        anno: m.anno,
        lordo,
        contributiInps: inps,
        irpef,
        addizionaleRegionale: addReg,
        addizionaleComunale: addCom,
        altreRitenute: 0,
        netto,
        dataEmissione: `${m.anno}-${String(m.mese).padStart(2, '0')}-27`,
      });
    });
  });

  return cedolini;
}

export const cedolini: Cedolino[] = generateCedolini();

// ==================== APPUNTAMENTI ====================
// TODO: Replace with Supabase query

export const appuntamenti: Appuntamento[] = [
  { id: 'app-1', tenantId: 't-1', titolo: 'Sopralluogo impianto rete', clienteId: 'c-3', clienteNome: 'Impianti Sicuri S.a.s.', operatoreId: 'u-op-2', operatoreNome: 'Giuseppe Ferrara', data: '2026-03-18', oraInizio: '09:00', oraFine: '11:00', stato: 'confermato', luogo: 'Via Torino 33, Torino', note: 'Portare tester di rete e crimpatrice' },
  { id: 'app-2', tenantId: 't-1', titolo: 'Presentazione prodotti domotica', clienteId: 'c-4', clienteNome: 'Digital Home S.r.l.', operatoreId: 'u-op-1', operatoreNome: 'Anna Bianchi', data: '2026-03-18', oraInizio: '14:00', oraFine: '15:30', stato: 'confermato', luogo: 'Sede cliente', note: 'Demo termostato smart + illuminazione' },
  { id: 'app-3', tenantId: 't-1', titolo: 'Ritiro merce magazzino', clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', operatoreId: 'u-op-4', operatoreNome: 'Paolo Ricci', data: '2026-03-18', oraInizio: '10:00', oraFine: '11:00', stato: 'in_attesa' },
  { id: 'app-4', tenantId: 't-1', titolo: 'Installazione sistema videosorveglianza', clienteId: 'c-8', clienteNome: 'Albergo Bellavista S.a.s.', operatoreId: 'u-op-2', operatoreNome: 'Giuseppe Ferrara', data: '2026-03-19', oraInizio: '08:30', oraFine: '17:00', stato: 'confermato', luogo: 'Lungolago Marconi 5, Como', note: 'Kit 4 canali + installazione completa' },
  { id: 'app-5', tenantId: 't-1', titolo: 'Riunione trimestrale vendite', operatoreId: 'u-admin-1', operatoreNome: 'Luigi Rossi', data: '2026-03-19', oraInizio: '10:00', oraFine: '12:00', stato: 'confermato', luogo: 'Sala riunioni' },
  { id: 'app-6', tenantId: 't-1', titolo: 'Assistenza tecnica server', clienteId: 'c-20', clienteNome: 'Centro Medico Salus', operatoreId: 'u-op-6', operatoreNome: 'Roberto Colombo', data: '2026-03-20', oraInizio: '09:00', oraFine: '12:00', stato: 'confermato', luogo: 'Via della Salute 30, Alessandria' },
  { id: 'app-7', tenantId: 't-1', titolo: 'Preventivo impianto allarme', clienteId: 'c-7', clienteNome: 'Costruzioni Lombarde S.r.l.', operatoreId: 'u-op-1', operatoreNome: 'Anna Bianchi', data: '2026-03-20', oraInizio: '14:30', oraFine: '16:00', stato: 'in_attesa', luogo: 'Cantiere Via Industria, Brescia' },
  { id: 'app-8', tenantId: 't-1', titolo: 'Consegna ordine networking', clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', operatoreId: 'u-op-4', operatoreNome: 'Paolo Ricci', data: '2026-03-21', oraInizio: '09:00', oraFine: '10:30', stato: 'confermato' },
  { id: 'app-9', tenantId: 't-1', titolo: 'Formazione dipendenti - CRM', operatoreId: 'u-admin-1', operatoreNome: 'Luigi Rossi', data: '2026-03-21', oraInizio: '14:00', oraFine: '17:00', stato: 'confermato', luogo: 'Sala formazione', note: 'Tutti i commerciali presenti' },
  { id: 'app-10', tenantId: 't-1', titolo: 'Manutenzione rete', clienteId: 'c-13', clienteNome: 'Scuola Privata San Giuseppe', operatoreId: 'u-op-2', operatoreNome: 'Giuseppe Ferrara', data: '2026-03-24', oraInizio: '08:00', oraFine: '13:00', stato: 'confermato', luogo: 'Via San Giuseppe 15, Cremona' },
  { id: 'app-11', tenantId: 't-1', titolo: 'Demo prodotti audio', clienteId: 'c-11', clienteNome: 'Ristorante Da Mario S.n.c.', operatoreId: 'u-op-5', operatoreNome: 'Francesca Moretti', data: '2026-03-24', oraInizio: '15:00', oraFine: '16:30', stato: 'in_attesa', luogo: 'Via Napoli 67, Varese' },
  { id: 'app-12', tenantId: 't-1', titolo: 'Configurazione NAS', clienteId: 'c-21', clienteNome: 'Laboratorio Analisi BioTech', operatoreId: 'u-op-6', operatoreNome: 'Roberto Colombo', data: '2026-03-25', oraInizio: '09:00', oraFine: '12:00', stato: 'confermato', luogo: 'Via Pasteur 18, Pavia' },
  { id: 'app-13', tenantId: 't-1', titolo: 'Trattativa sistema sicurezza', clienteId: 'c-18', clienteNome: 'Agenzia Immobiliare CasaNova', operatoreId: 'u-op-1', operatoreNome: 'Anna Bianchi', data: '2026-03-25', oraInizio: '14:00', oraFine: '15:00', stato: 'confermato' },
  { id: 'app-14', tenantId: 't-1', titolo: 'Sopralluogo nuovo ufficio', clienteId: 'c-26', clienteNome: 'Grafica Creativa Studio', operatoreId: 'u-op-2', operatoreNome: 'Giuseppe Ferrara', data: '2026-03-26', oraInizio: '10:00', oraFine: '12:00', stato: 'in_attesa', luogo: 'Via dei Colori 14, Milano' },
  { id: 'app-15', tenantId: 't-1', titolo: 'Revisione contratto annuale', clienteId: 'c-24', clienteNome: 'Assicurazioni Futuro S.a.s.', operatoreId: 'u-admin-1', operatoreNome: 'Luigi Rossi', data: '2026-03-26', oraInizio: '15:00', oraFine: '16:30', stato: 'confermato' },
  { id: 'app-16', tenantId: 't-1', titolo: 'Installazione access point', clienteId: 'c-14', clienteNome: 'Palestra FitLife', operatoreId: 'u-op-2', operatoreNome: 'Giuseppe Ferrara', data: '2026-03-27', oraInizio: '08:30', oraFine: '12:30', stato: 'confermato', luogo: 'Via dello Sport 8, Lodi' },
  { id: 'app-17', tenantId: 't-1', titolo: 'Incontro partnership', clienteId: 'c-25', clienteNome: 'Ferramenta Moderna S.r.l.', operatoreId: 'u-admin-1', operatoreNome: 'Luigi Rossi', data: '2026-03-27', oraInizio: '14:00', oraFine: '15:30', stato: 'confermato' },
  { id: 'app-18', tenantId: 't-1', titolo: 'Assistenza stampanti', clienteId: 'c-19', clienteNome: 'Tipografia Express S.r.l.', operatoreId: 'u-op-6', operatoreNome: 'Roberto Colombo', data: '2026-03-28', oraInizio: '09:00', oraFine: '11:00', stato: 'in_attesa', luogo: "Via dell'Artigianato 5, Novara" },
  { id: 'app-19', tenantId: 't-1', titolo: 'Consegna monitor e periferiche', clienteId: 'c-16', clienteNome: 'Ottica Visione Perfetta', operatoreId: 'u-op-4', operatoreNome: 'Paolo Ricci', data: '2026-03-28', oraInizio: '14:00', oraFine: '15:00', stato: 'confermato' },
  { id: 'app-20', tenantId: 't-1', titolo: 'Chiusura trimestre - riepilogo', operatoreId: 'u-admin-1', operatoreNome: 'Luigi Rossi', data: '2026-03-31', oraInizio: '09:00', oraFine: '12:00', stato: 'confermato', luogo: 'Sala riunioni', note: 'Presenti tutti i responsabili area' },
];

// ==================== EMAIL MOCKUP ====================
// TODO: Replace with Supabase query

export const emails: Email[] = [
  { id: 'em-1', tenantId: 't-1', da: 'ordini@technoservice.it', a: 'info@rossielettonica.it', oggetto: 'Conferma ordine n. ORD-2026-0036', corpo: 'Gentile Rossi Elettronica,\n\nconfermiamo la ricezione del Vs. ordine n. ORD-2026-0036 relativo a SSD NVMe e HDD esterni.\n\nRestiamo in attesa della consegna prevista per il 20/03/2026.\n\nCordiali saluti,\nMarco Galli\nTechnoService S.r.l.', data: '2026-03-15T09:30:00', letto: true, clienteId: 'c-1', clienteNome: 'TechnoService S.r.l.', tipo: 'ricevuta' },
  { id: 'em-2', tenantId: 't-1', da: 'acquisti@elettroforniture.it', a: 'info@rossielettonica.it', oggetto: 'Richiesta listino aggiornato 2026', corpo: 'Spett.le Rossi Elettronica,\n\ncon la presente vi chiediamo cortesemente di inviarci il listino prezzi aggiornato per l\'anno 2026, con particolare attenzione alle categorie networking e domotica.\n\nGrazie e cordiali saluti,\nSara Colombo\nEletttro Forniture Italia S.p.A.', data: '2026-03-14T14:20:00', letto: true, clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', tipo: 'ricevuta' },
  { id: 'em-3', tenantId: 't-1', da: 'info@rossielettonica.it', a: 'acquisti@elettroforniture.it', oggetto: 'Re: Richiesta listino aggiornato 2026', corpo: 'Gentile Dott.ssa Colombo,\n\nin allegato trova il listino aggiornato 2026 con le condizioni riservate ai clienti Premium.\n\nResto a disposizione per qualsiasi chiarimento.\n\nCordiali saluti,\nAnna Bianchi\nRossi Elettronica S.r.l.', data: '2026-03-14T16:45:00', letto: true, clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', tipo: 'inviata' },
  { id: 'em-4', tenantId: 't-1', da: 'info@impiantisicuri.it', a: 'info@rossielettonica.it', oggetto: 'Preventivo impianto videosorveglianza', corpo: 'Buongiorno,\n\navremmo necessità di un preventivo per un impianto di videosorveglianza composto da:\n- 8 telecamere IP 2K\n- 1 NVR 16 canali\n- Installazione e configurazione\n\nIl sito è un capannone industriale di circa 2000mq.\n\nGrazie,\nAntonio De Rosa', data: '2026-03-13T10:15:00', letto: true, clienteId: 'c-3', clienteNome: 'Impianti Sicuri S.a.s.', tipo: 'ricevuta' },
  { id: 'em-5', tenantId: 't-1', da: 'info@digitalhome.it', a: 'info@rossielettonica.it', oggetto: 'Disponibilità termostati smart', corpo: 'Salve,\n\nvorremmo sapere se avete disponibilità immediata di:\n- 15 Termostati Smart WiFi\n- 30 Prese Smart WiFi\n- 50 Lampadine Smart E27 RGB\n\nper un progetto di domotizzazione residenziale.\n\nGrazie,\nLaura Fontana\nDigital Home S.r.l.', data: '2026-03-12T11:30:00', letto: false, clienteId: 'c-4', clienteNome: 'Digital Home S.r.l.', tipo: 'ricevuta' },
  { id: 'em-6', tenantId: 't-1', da: 'info@rossielettonica.it', a: 'info@digitalhome.it', oggetto: 'Re: Disponibilità termostati smart', corpo: 'Gentile Dott.ssa Fontana,\n\nconfermo la disponibilità di tutti i prodotti richiesti. Le invio preventivo dedicato con sconto del 10% per quantità.\n\nTermostati Smart: 28 pz disponibili\nPrese Smart: 180 pz disponibili\nLampadine RGB: 300 pz disponibili\n\nConsegna stimata: 3 giorni lavorativi.\n\nCordialmente,\nAnna Bianchi', data: '2026-03-12T15:00:00', letto: true, clienteId: 'c-4', clienteNome: 'Digital Home S.r.l.', tipo: 'inviata' },
  { id: 'em-7', tenantId: 't-1', da: 'direzione@bellavista.it', a: 'info@rossielettonica.it', oggetto: 'Problema telecamera esterna', corpo: 'Buongiorno,\n\nuna delle telecamere installate il mese scorso (posizione: ingresso laterale) sembra avere problemi di connessione WiFi intermittente.\n\nPotreste organizzare un intervento tecnico?\n\nGrazie,\nElena Santoro\nAlbergo Bellavista', data: '2026-03-11T08:45:00', letto: true, clienteId: 'c-8', clienteNome: 'Albergo Bellavista S.a.s.', tipo: 'ricevuta' },
  { id: 'em-8', tenantId: 't-1', da: 'vendite@ferramentamoderna.it', a: 'info@rossielettonica.it', oggetto: 'Proposta partnership distribuzione', corpo: 'Spett.le Rossi Elettronica,\n\nsiamo interessati a diventare punto di distribuzione dei vostri prodotti nella zona di Gallarate e Busto Arsizio.\n\nSarebbe possibile fissare un incontro per discutere le condizioni commerciali?\n\nDistinti saluti,\nMassimo Torre\nFerramenta Moderna S.r.l.', data: '2026-03-10T16:20:00', letto: true, clienteId: 'c-25', clienteNome: 'Ferramenta Moderna S.r.l.', tipo: 'ricevuta' },
  { id: 'em-9', tenantId: 't-1', da: 'info@rossielettonica.it', a: 'vendite@ferramentamoderna.it', oggetto: 'Re: Proposta partnership distribuzione', corpo: 'Gentile Sig. Torre,\n\nla ringraziamo per l\'interesse. Siamo molto aperti alla collaborazione.\n\nLe propongo un incontro il 27 marzo alle 14:00 presso la nostra sede.\n\nConfermando, le invierò le condizioni commerciali base per i rivenditori.\n\nCordiali saluti,\nLuigi Rossi\nAmministratore', data: '2026-03-11T09:10:00', letto: true, clienteId: 'c-25', clienteNome: 'Ferramenta Moderna S.r.l.', tipo: 'inviata' },
  { id: 'em-10', tenantId: 't-1', da: 'segreteria@sangiuseppe.it', a: 'info@rossielettonica.it', oggetto: 'Manutenzione rete marzo', corpo: 'Buongiorno,\n\nvi ricordiamo l\'appuntamento per la manutenzione programmata della rete scolastica prevista per il 24 marzo.\n\nL\'accesso sarà possibile dalle 8:00. Referente in loco: Prof. Castellani.\n\nGrazie,\nSegreteria Scuola San Giuseppe', data: '2026-03-10T09:00:00', letto: true, clienteId: 'c-13', clienteNome: 'Scuola Privata San Giuseppe', tipo: 'ricevuta' },
  { id: 'em-11', tenantId: 't-1', da: 'info@centrosalus.it', a: 'info@rossielettonica.it', oggetto: 'Fattura n. FE-2026-0025 - Richiesta nota di credito', corpo: 'Spett.le Rossi Elettronica,\n\nin riferimento alla fattura in oggetto, vi chiediamo cortesemente l\'emissione di una nota di credito per la differenza di €120,00 dovuta all\'applicazione dello sconto concordato.\n\nGrazie,\nDr. Caruso\nCentro Medico Salus', data: '2026-03-09T11:00:00', letto: false, clienteId: 'c-20', clienteNome: 'Centro Medico Salus', tipo: 'ricevuta' },
  { id: 'em-12', tenantId: 't-1', da: 'ordini@megastore.it', a: 'info@rossielettonica.it', oggetto: 'Ordine urgente cavi HDMI e Ethernet', corpo: 'Gentili,\n\nabbiamo necessità urgente di:\n- 50 Cavi HDMI 2.1 2m\n- 25 Cavi HDMI 2.1 5m\n\nPossibilità di consegna entro fine settimana?\n\nGrazie,\nClaudio Neri\nMegaStore Elettronica', data: '2026-03-08T13:45:00', letto: true, clienteId: 'c-6', clienteNome: 'MegaStore Elettronica S.r.l.', tipo: 'ricevuta' },
  { id: 'em-13', tenantId: 't-1', da: 'info@rossielettonica.it', a: 'ordini@megastore.it', oggetto: 'Re: Ordine urgente cavi HDMI e Ethernet', corpo: 'Gentile Sig. Neri,\n\nconfermo la disponibilità e la possibilità di consegnare entro venerdì.\n\nHo inserito l\'ordine ORD-2026-0038 nel sistema.\n\nCordiali saluti,\nAnna Bianchi', data: '2026-03-08T15:30:00', letto: true, clienteId: 'c-6', clienteNome: 'MegaStore Elettronica S.r.l.', tipo: 'inviata' },
  { id: 'em-14', tenantId: 't-1', da: 'hello@graficacreativa.it', a: 'info@rossielettonica.it', oggetto: 'Richiesta preventivo attrezzatura ufficio', corpo: 'Salve,\n\nstiamo allestendo il nuovo ufficio e avremmo bisogno di:\n- 2 Monitor 27" 4K\n- 2 Supporti monitor regolabili\n- 2 Docking station USB-C\n- Varie periferiche\n\nPotreste farci un preventivo?\n\nGrazie,\nAlessia Gentile\nGrafica Creativa Studio', data: '2026-03-07T10:30:00', letto: true, clienteId: 'c-26', clienteNome: 'Grafica Creativa Studio', tipo: 'ricevuta' },
  { id: 'em-15', tenantId: 't-1', da: 'info@fitlife.it', a: 'info@rossielettonica.it', oggetto: 'WiFi palestra - richiesta ampliamento copertura', corpo: 'Buongiorno,\n\nil WiFi nella zona piscina e spogliatoi ha copertura insufficiente. Avremmo bisogno di 3-4 access point aggiuntivi.\n\nQuando sarebbe possibile un sopralluogo?\n\nGrazie,\nDirezione FitLife', data: '2026-03-06T14:00:00', letto: true, clienteId: 'c-14', clienteNome: 'Palestra FitLife', tipo: 'ricevuta' },
];

// ==================== MOVIMENTI MAGAZZINO ====================
// TODO: Replace with Supabase query

export const movimentiMagazzino: MovimentoMagazzino[] = [
  { id: 'mov-1', tenantId: 't-1', prodottoId: 'p-1', prodottoNome: 'Cavo HDMI 2.1 Ultra HD 2m', tipo: 'carico', quantita: 100, data: '2026-03-01', motivo: 'Rifornimento da fornitore' },
  { id: 'mov-2', tenantId: 't-1', prodottoId: 'p-1', prodottoNome: 'Cavo HDMI 2.1 Ultra HD 2m', tipo: 'scarico', quantita: 50, data: '2026-03-08', motivo: 'Ordine ORD-2026-0038', ordineId: 'ord-038' },
  { id: 'mov-3', tenantId: 't-1', prodottoId: 'p-6', prodottoNome: 'Multipresa Smart WiFi 4 posti', tipo: 'carico', quantita: 30, data: '2026-03-02', motivo: 'Rifornimento da fornitore' },
  { id: 'mov-4', tenantId: 't-1', prodottoId: 'p-7', prodottoNome: 'Lampadina Smart E27 RGB', tipo: 'carico', quantita: 200, data: '2026-03-02', motivo: 'Rifornimento da fornitore' },
  { id: 'mov-5', tenantId: 't-1', prodottoId: 'p-9', prodottoNome: 'Router WiFi 6 AX3000', tipo: 'scarico', quantita: 2, data: '2026-03-05', motivo: 'Ordine ORD-2026-0039', ordineId: 'ord-039' },
  { id: 'mov-6', tenantId: 't-1', prodottoId: 'p-20', prodottoNome: 'Telecamera IP WiFi 2K', tipo: 'scarico', quantita: 8, data: '2026-03-05', motivo: 'Ordine ORD-2026-0037', ordineId: 'ord-037' },
  { id: 'mov-7', tenantId: 't-1', prodottoId: 'p-31', prodottoNome: 'Monitor LED 27" 4K', tipo: 'carico', quantita: 10, data: '2026-03-10', motivo: 'Rifornimento da fornitore' },
  { id: 'mov-8', tenantId: 't-1', prodottoId: 'p-38', prodottoNome: 'Toner Compatibile HP 26A', tipo: 'scarico', quantita: 20, data: '2026-03-12', motivo: 'Ordine ORD-2026-0034' },
];

// ==================== INTEGRAZIONI E-COMMERCE ====================
// TODO: Replace with Supabase query

export const integrazioniEcommerce: IntegrazionEcommerce[] = [
  { id: 'int-1', tenantId: 't-1', piattaforma: 'woocommerce', stato: 'attivo', urlNegozio: 'https://shop.rossielettonica.it', ultimoSync: '2026-03-18T08:30:00', ordiniSincronizzati: 156, prodottiMappati: 42, errori: 0 },
  { id: 'int-2', tenantId: 't-1', piattaforma: 'prestashop', stato: 'attivo', urlNegozio: 'https://store.rossielettonica.it', ultimoSync: '2026-03-18T08:30:00', ordiniSincronizzati: 89, prodottiMappati: 38, errori: 2 },
  { id: 'int-3', tenantId: 't-1', piattaforma: 'shopify', stato: 'prossimamente', ordiniSincronizzati: 0, prodottiMappati: 0, errori: 0 },
];

export const logSync: LogSync[] = [
  { id: 'log-1', integrazioneId: 'int-1', data: '2026-03-18T08:30:00', tipo: 'ordine', stato: 'successo', messaggio: 'Ordine #WC-4521 sincronizzato correttamente' },
  { id: 'log-2', integrazioneId: 'int-1', data: '2026-03-18T08:30:00', tipo: 'inventario', stato: 'successo', messaggio: 'Giacenze aggiornate per 42 prodotti' },
  { id: 'log-3', integrazioneId: 'int-2', data: '2026-03-18T08:30:00', tipo: 'ordine', stato: 'successo', messaggio: 'Ordine #PS-1892 sincronizzato correttamente' },
  { id: 'log-4', integrazioneId: 'int-2', data: '2026-03-17T20:00:00', tipo: 'prodotto', stato: 'errore', messaggio: 'SKU "CAV-HDMI-2M" non trovato su PrestaShop - mappatura mancante' },
  { id: 'log-5', integrazioneId: 'int-2', data: '2026-03-17T20:00:00', tipo: 'cliente', stato: 'conflitto', messaggio: 'Cliente "Bianchi Maria Teresa" già esistente con dati diversi - richiesta revisione manuale' },
  { id: 'log-6', integrazioneId: 'int-1', data: '2026-03-17T08:30:00', tipo: 'ordine', stato: 'successo', messaggio: 'Ordine #WC-4520 sincronizzato correttamente' },
  { id: 'log-7', integrazioneId: 'int-1', data: '2026-03-17T08:30:00', tipo: 'inventario', stato: 'successo', messaggio: 'Giacenze aggiornate per 42 prodotti' },
  { id: 'log-8', integrazioneId: 'int-2', data: '2026-03-16T20:00:00', tipo: 'ordine', stato: 'successo', messaggio: '3 ordini sincronizzati correttamente' },
];

// ==================== DATI STATISTICI PER GRAFICI ====================

export const venditeMensili = [
  { mese: 'Ott 25', fatturato: 18450, ordini: 8 },
  { mese: 'Nov 25', fatturato: 24380, ordini: 12 },
  { mese: 'Dic 25', fatturato: 21200, ordini: 10 },
  { mese: 'Gen 26', fatturato: 28950, ordini: 11 },
  { mese: 'Feb 26', fatturato: 32100, ordini: 14 },
  { mese: 'Mar 26', fatturato: 19800, ordini: 8 },
];

export const topClienti = [
  { nome: 'Elettro Forniture Italia', fatturato: 32450 },
  { nome: 'MegaStore Elettronica', fatturato: 28900 },
  { nome: 'Digital Home', fatturato: 18200 },
  { nome: 'TechnoService', fatturato: 15800 },
  { nome: 'Impianti Sicuri', fatturato: 12400 },
];

export const ordiniPerCanale = [
  { canale: 'Diretto', valore: 45 },
  { canale: 'WooCommerce', valore: 25 },
  { canale: 'PrestaShop', valore: 15 },
  { canale: 'Telefono', valore: 10 },
  { canale: 'Email', valore: 5 },
];

// ==================== STATISTICHE SUPERADMIN ====================

export const statsPiattaforma = {
  tenantAttivi: 3,
  utentiTotali: 23,
  mrr: 187, // 99 + 29 + 59
  mrrTrend: [
    { mese: 'Ott 25', mrr: 128 },
    { mese: 'Nov 25', mrr: 128 },
    { mese: 'Dic 25', mrr: 158 },
    { mese: 'Gen 26', mrr: 187 },
    { mese: 'Feb 26', mrr: 187 },
    { mese: 'Mar 26', mrr: 187 },
  ],
  crescitaUtenti: [
    { mese: 'Ott 25', utenti: 14 },
    { mese: 'Nov 25', utenti: 16 },
    { mese: 'Dic 25', utenti: 19 },
    { mese: 'Gen 26', utenti: 21 },
    { mese: 'Feb 26', utenti: 23 },
    { mese: 'Mar 26', utenti: 23 },
  ],
  churnRate: 0,
};

// ==================== PREVENTIVI ====================
// TODO: Replace with Supabase query

export const preventivi: Preventivo[] = [
  { id: 'prev-1', tenantId: 't-1', numero: 'PRV-2026-0001', clienteId: 'c-4', clienteNome: 'Digital Home S.r.l.', data: '2026-02-20', dataScadenza: '2026-03-20', stato: 'accettato', oggetto: 'Fornitura sistema domotica residenziale', righe: [{ prodottoId: 'p-26', nome: 'Termostato Smart WiFi', quantita: 15, prezzoUnitario: 71.91, iva: 22, totale: 1078.65 }, { prodottoId: 'p-27', nome: 'Presa Smart WiFi singola', quantita: 30, prezzoUnitario: 11.61, iva: 22, totale: 348.30 }, { prodottoId: 'p-7', nome: 'Lampadina Smart E27 RGB', quantita: 50, prezzoUnitario: 13.41, iva: 22, totale: 670.50 }], subtotale: 2097.45, iva: 461.44, totale: 2558.89, ordineId: 'ord-037' },
  { id: 'prev-2', tenantId: 't-1', numero: 'PRV-2026-0002', clienteId: 'c-3', clienteNome: 'Impianti Sicuri S.a.s.', data: '2026-03-01', dataScadenza: '2026-03-31', stato: 'inviato', oggetto: 'Impianto videosorveglianza capannone industriale', righe: [{ prodottoId: 'p-20', nome: 'Telecamera IP WiFi 2K', quantita: 8, prezzoUnitario: 53.90, iva: 22, totale: 431.20 }, { prodottoId: 'p-28', nome: 'Kit Videosorveglianza 4CH', quantita: 2, prezzoUnitario: 314.10, iva: 22, totale: 628.20 }], subtotale: 1059.40, iva: 233.07, totale: 1292.47, note: 'Include installazione e configurazione' },
  { id: 'prev-3', tenantId: 't-1', numero: 'PRV-2026-0003', clienteId: 'c-26', clienteNome: 'Grafica Creativa Studio', data: '2026-03-07', dataScadenza: '2026-04-07', stato: 'inviato', oggetto: 'Allestimento postazioni ufficio', righe: [{ prodottoId: 'p-31', nome: 'Monitor LED 27" 4K', quantita: 2, prezzoUnitario: 314.10, iva: 22, totale: 628.20 }, { prodottoId: 'p-16', nome: 'Supporto Monitor Regolabile', quantita: 2, prezzoUnitario: 40.41, iva: 22, totale: 80.82 }, { prodottoId: 'p-37', nome: 'Docking Station USB-C Triple', quantita: 2, prezzoUnitario: 161.10, iva: 22, totale: 322.20 }], subtotale: 1031.22, iva: 226.87, totale: 1258.09 },
  { id: 'prev-4', tenantId: 't-1', numero: 'PRV-2026-0004', clienteId: 'c-14', clienteNome: 'Palestra FitLife', data: '2026-03-10', dataScadenza: '2026-04-10', stato: 'bozza', oggetto: 'Ampliamento copertura WiFi', righe: [{ prodottoId: 'p-10', nome: 'Access Point WiFi 6E', quantita: 4, prezzoUnitario: 170.10, iva: 22, totale: 680.40 }, { prodottoId: 'p-23', nome: 'Cablaggio Strutturato Cat.6 (100m)', quantita: 2, prezzoUnitario: 71.91, iva: 22, totale: 143.82 }], subtotale: 824.22, iva: 181.33, totale: 1005.55 },
  { id: 'prev-5', tenantId: 't-1', numero: 'PRV-2026-0005', clienteId: 'c-7', clienteNome: 'Costruzioni Lombarde S.r.l.', data: '2026-02-10', dataScadenza: '2026-03-10', stato: 'scaduto', oggetto: 'Sistema allarme cantiere', righe: [{ prodottoId: 'p-22', nome: 'Sensore Movimento PIR', quantita: 12, prezzoUnitario: 17.91, iva: 22, totale: 214.92 }, { prodottoId: 'p-44', nome: 'Sirena Allarme Esterna', quantita: 2, prezzoUnitario: 62.91, iva: 22, totale: 125.82 }], subtotale: 340.74, iva: 74.96, totale: 415.70 },
  { id: 'prev-6', tenantId: 't-1', numero: 'PRV-2026-0006', clienteId: 'c-11', clienteNome: 'Ristorante Da Mario S.n.c.', data: '2026-01-20', dataScadenza: '2026-02-20', stato: 'rifiutato', oggetto: 'Sistema audio multizona', righe: [{ prodottoId: 'p-34', nome: 'Speaker Bluetooth Portatile', quantita: 6, prezzoUnitario: 35.91, iva: 22, totale: 215.46 }], subtotale: 215.46, iva: 47.40, totale: 262.86, note: 'Cliente ha scelto un fornitore alternativo' },
  { id: 'prev-7', tenantId: 't-1', numero: 'PRV-2026-0007', clienteId: 'c-20', clienteNome: 'Centro Medico Salus', data: '2026-03-12', dataScadenza: '2026-04-12', stato: 'inviato', oggetto: 'Upgrade infrastruttura IT', righe: [{ prodottoId: 'p-9', nome: 'Router WiFi 6 AX3000', quantita: 2, prezzoUnitario: 80.91, iva: 22, totale: 161.82 }, { prodottoId: 'p-41', nome: 'NAS 2 Bay', quantita: 1, prezzoUnitario: 206.10, iva: 22, totale: 206.10 }, { prodottoId: 'p-17', nome: 'SSD NVMe 1TB M.2', quantita: 4, prezzoUnitario: 80.91, iva: 22, totale: 323.64 }], subtotale: 691.56, iva: 152.14, totale: 843.70 },
  { id: 'prev-8', tenantId: 't-1', numero: 'PRV-2026-0008', clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', data: '2026-03-15', dataScadenza: '2026-04-15', stato: 'inviato', oggetto: 'Fornitura trimestrale networking Q2', righe: [{ prodottoId: 'p-8', nome: 'Switch di rete 8 porte Gigabit', quantita: 20, prezzoUnitario: 26.91, iva: 22, totale: 538.20 }, { prodottoId: 'p-9', nome: 'Router WiFi 6 AX3000', quantita: 10, prezzoUnitario: 80.91, iva: 22, totale: 809.10 }], subtotale: 1347.30, iva: 296.41, totale: 1643.71 },
];

// ==================== LEAD / PIPELINE ====================
// TODO: Replace with Supabase query

export const leads: Lead[] = [
  { id: 'lead-1', tenantId: 't-1', azienda: 'Hotel Metropol S.r.l.', referente: 'Dott. Riccardo Valli', email: 'r.valli@hotelmetropol.it', telefono: '+39 02 8891234', fonte: 'sito_web', fase: 'proposta', valore: 8500, probabilita: 70, assegnatoA: 'u-op-1', assegnatoNome: 'Anna Bianchi', dataCreazione: '2026-02-15', dataChiusuraPrevista: '2026-04-01', note: 'Interessato a sistema videosorveglianza + domotica camere' },
  { id: 'lead-2', tenantId: 't-1', azienda: 'Logistica Nord S.p.A.', referente: 'Ing. Stefano Bassi', email: 's.bassi@logisticanord.it', telefono: '+39 02 5554321', fonte: 'fiera', fase: 'negoziazione', valore: 15000, probabilita: 85, assegnatoA: 'u-admin-1', assegnatoNome: 'Luigi Rossi', dataCreazione: '2026-01-20', dataChiusuraPrevista: '2026-03-25', note: 'Cablaggio strutturato nuovo magazzino 5000mq' },
  { id: 'lead-3', tenantId: 't-1', azienda: 'Clinica Veterinaria PetCare', referente: 'Dr.ssa Monica Greco', email: 'greco@petcare.it', telefono: '+39 031 6789012', fonte: 'referral', fase: 'qualificato', valore: 3200, probabilita: 50, assegnatoA: 'u-op-5', assegnatoNome: 'Francesca Moretti', dataCreazione: '2026-03-05', dataChiusuraPrevista: '2026-04-15' },
  { id: 'lead-4', tenantId: 't-1', azienda: 'Coworking Innovation Hub', referente: 'Marco Pellegrini', email: 'info@innovationhub.it', telefono: '+39 02 3456789', fonte: 'social', fase: 'contattato', valore: 6800, probabilita: 30, assegnatoA: 'u-op-1', assegnatoNome: 'Anna Bianchi', dataCreazione: '2026-03-10', dataChiusuraPrevista: '2026-05-01', note: 'Networking + access point per 3 piani' },
  { id: 'lead-5', tenantId: 't-1', azienda: 'Panificio Artigianale Dolce Forno', referente: 'Giuseppe Mantovani', email: 'g.mantovani@dolceforno.it', telefono: '+39 0332 112233', fonte: 'cold_call', fase: 'nuovo', valore: 1200, probabilita: 15, assegnatoA: 'u-op-5', assegnatoNome: 'Francesca Moretti', dataCreazione: '2026-03-15', dataChiusuraPrevista: '2026-05-15' },
  { id: 'lead-6', tenantId: 't-1', azienda: 'Studio Architettura Spazio Aperto', referente: 'Arch. Laura Ferri', email: 'ferri@spazioaperto.it', telefono: '+39 02 9876543', fonte: 'sito_web', fase: 'qualificato', valore: 4500, probabilita: 60, assegnatoA: 'u-op-1', assegnatoNome: 'Anna Bianchi', dataCreazione: '2026-03-01', dataChiusuraPrevista: '2026-04-20', note: 'Postazioni workstation + monitor professionali' },
  { id: 'lead-7', tenantId: 't-1', azienda: 'Carrozzeria Moderna', referente: 'Luca Fontanella', email: 'info@carrozzeriamoderna.it', telefono: '+39 035 4445566', fonte: 'referral', fase: 'nuovo', valore: 2800, probabilita: 20, assegnatoA: 'u-op-5', assegnatoNome: 'Francesca Moretti', dataCreazione: '2026-03-16', dataChiusuraPrevista: '2026-05-30' },
  { id: 'lead-8', tenantId: 't-1', azienda: 'Residence Le Palme', referente: 'Sandra Colombini', email: 's.colombini@lepalme.it', telefono: '+39 031 7778899', fonte: 'sito_web', fase: 'proposta', valore: 5600, probabilita: 65, assegnatoA: 'u-admin-1', assegnatoNome: 'Luigi Rossi', dataCreazione: '2026-02-28', dataChiusuraPrevista: '2026-04-10', note: 'Videosorveglianza + WiFi aree comuni' },
  { id: 'lead-9', tenantId: 't-1', azienda: 'Concessionaria AutoPlus', referente: 'Diego Martinelli', email: 'd.martinelli@autoplus.it', telefono: '+39 0332 5556677', fonte: 'fiera', fase: 'vinto', valore: 9200, probabilita: 100, assegnatoA: 'u-admin-1', assegnatoNome: 'Luigi Rossi', dataCreazione: '2025-12-10', dataChiusuraPrevista: '2026-02-28' },
  { id: 'lead-10', tenantId: 't-1', azienda: 'Azienda Agricola Il Girasole', referente: 'Matteo Biondi', email: 'info@ilgirasole.it', telefono: '+39 0376 8889900', fonte: 'cold_call', fase: 'perso', valore: 1800, probabilita: 0, assegnatoA: 'u-op-5', assegnatoNome: 'Francesca Moretti', dataCreazione: '2026-01-05', dataChiusuraPrevista: '2026-03-01', note: 'Budget insufficiente — ricontattare Q3' },
];

// ==================== PROGETTI E TASK ====================
// TODO: Replace with Supabase query

export const progetti: Progetto[] = [
  { id: 'prj-1', tenantId: 't-1', nome: 'Cablaggio magazzino Logistica Nord', clienteId: 'c-7', clienteNome: 'Costruzioni Lombarde S.r.l.', stato: 'in_corso', dataInizio: '2026-03-01', dataFinePrevista: '2026-04-15', budget: 15000, descrizione: 'Progetto di cablaggio strutturato Cat.6 per nuovo magazzino', responsabileId: 'u-op-2', responsabileNome: 'Giuseppe Ferrara', completamento: 45 },
  { id: 'prj-2', tenantId: 't-1', nome: 'Domotica Digital Home - Fase 1', clienteId: 'c-4', clienteNome: 'Digital Home S.r.l.', stato: 'in_corso', dataInizio: '2026-02-15', dataFinePrevista: '2026-03-30', budget: 8500, descrizione: 'Installazione sistema domotica completo residenziale', responsabileId: 'u-op-2', responsabileNome: 'Giuseppe Ferrara', completamento: 72 },
  { id: 'prj-3', tenantId: 't-1', nome: 'Upgrade rete Scuola San Giuseppe', clienteId: 'c-13', clienteNome: 'Scuola Privata San Giuseppe', stato: 'pianificato', dataInizio: '2026-04-01', dataFinePrevista: '2026-04-30', budget: 6000, descrizione: 'Sostituzione switch e access point obsoleti', responsabileId: 'u-op-6', responsabileNome: 'Roberto Colombo', completamento: 0 },
  { id: 'prj-4', tenantId: 't-1', nome: 'Videosorveglianza Albergo Bellavista', clienteId: 'c-8', clienteNome: 'Albergo Bellavista S.a.s.', stato: 'completato', dataInizio: '2026-01-10', dataFinePrevista: '2026-02-28', budget: 4500, descrizione: 'Installazione sistema CCTV 4 canali + configurazione', responsabileId: 'u-op-2', responsabileNome: 'Giuseppe Ferrara', completamento: 100 },
  { id: 'prj-5', tenantId: 't-1', nome: 'Migrazione IT Centro Medico Salus', clienteId: 'c-20', clienteNome: 'Centro Medico Salus', stato: 'pianificato', dataInizio: '2026-04-15', dataFinePrevista: '2026-05-31', budget: 12000, descrizione: 'Migrazione server, NAS, upgrade rete e backup', responsabileId: 'u-op-6', responsabileNome: 'Roberto Colombo', completamento: 0 },
];

export const tasks: Task[] = [
  // Progetto 1
  { id: 'task-1', tenantId: 't-1', progettoId: 'prj-1', titolo: 'Sopralluogo e progettazione', stato: 'completato', priorita: 'alta', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataScadenza: '2026-03-05', oreStimate: 4, oreEffettive: 5 },
  { id: 'task-2', tenantId: 't-1', progettoId: 'prj-1', titolo: 'Acquisto materiali cablaggio', stato: 'completato', priorita: 'alta', assegnatoA: 'u-op-4', assegnatoNome: 'Paolo Ricci', dataScadenza: '2026-03-10', oreStimate: 2, oreEffettive: 2 },
  { id: 'task-3', tenantId: 't-1', progettoId: 'prj-1', titolo: 'Posa cavi piano terra', stato: 'in_corso', priorita: 'alta', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataScadenza: '2026-03-22', oreStimate: 16 },
  { id: 'task-4', tenantId: 't-1', progettoId: 'prj-1', titolo: 'Posa cavi primo piano', stato: 'da_fare', priorita: 'media', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataScadenza: '2026-03-29', oreStimate: 16 },
  { id: 'task-5', tenantId: 't-1', progettoId: 'prj-1', titolo: 'Installazione rack e patch panel', stato: 'da_fare', priorita: 'media', assegnatoA: 'u-op-6', assegnatoNome: 'Roberto Colombo', dataScadenza: '2026-04-05', oreStimate: 8 },
  { id: 'task-6', tenantId: 't-1', progettoId: 'prj-1', titolo: 'Test e certificazione', stato: 'da_fare', priorita: 'alta', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataScadenza: '2026-04-12', oreStimate: 8 },
  // Progetto 2
  { id: 'task-7', tenantId: 't-1', progettoId: 'prj-2', titolo: 'Installazione termostati', stato: 'completato', priorita: 'alta', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataScadenza: '2026-03-01', oreStimate: 8, oreEffettive: 10 },
  { id: 'task-8', tenantId: 't-1', progettoId: 'prj-2', titolo: 'Installazione prese smart', stato: 'completato', priorita: 'media', assegnatoA: 'u-op-6', assegnatoNome: 'Roberto Colombo', dataScadenza: '2026-03-08', oreStimate: 6, oreEffettive: 6 },
  { id: 'task-9', tenantId: 't-1', progettoId: 'prj-2', titolo: 'Configurazione hub centrale', stato: 'in_corso', priorita: 'alta', assegnatoA: 'u-op-6', assegnatoNome: 'Roberto Colombo', dataScadenza: '2026-03-20', oreStimate: 4 },
  { id: 'task-10', tenantId: 't-1', progettoId: 'prj-2', titolo: 'Test scenari automazione', stato: 'da_fare', priorita: 'media', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataScadenza: '2026-03-25', oreStimate: 4 },
  { id: 'task-11', tenantId: 't-1', progettoId: 'prj-2', titolo: 'Formazione cliente', stato: 'da_fare', priorita: 'bassa', assegnatoA: 'u-op-1', assegnatoNome: 'Anna Bianchi', dataScadenza: '2026-03-28', oreStimate: 3 },
];

// ==================== TICKET SUPPORTO ====================
// TODO: Replace with Supabase query

export const tickets: Ticket[] = [
  { id: 'tkt-1', tenantId: 't-1', numero: 'TKT-2026-0001', clienteId: 'c-8', clienteNome: 'Albergo Bellavista S.a.s.', oggetto: 'Telecamera esterna disconnessione intermittente', descrizione: 'La telecamera posizionata all\'ingresso laterale perde la connessione WiFi in modo intermittente.', priorita: 'alta', stato: 'in_lavorazione', categoria: 'Assistenza Tecnica', assegnatoA: 'u-op-6', assegnatoNome: 'Roberto Colombo', dataApertura: '2026-03-11', risposte: [{ id: 'r-1', autore: 'Elena Santoro', tipo: 'cliente', messaggio: 'Il problema si verifica soprattutto nelle ore serali, dalle 18 alle 22.', data: '2026-03-11T09:00:00' }, { id: 'r-2', autore: 'Roberto Colombo', tipo: 'operatore', messaggio: 'Verificheremo il segnale WiFi nella zona. Potrebbe essere un\'interferenza. Prevediamo un intervento per il 19 marzo.', data: '2026-03-11T14:30:00' }] },
  { id: 'tkt-2', tenantId: 't-1', numero: 'TKT-2026-0002', clienteId: 'c-20', clienteNome: 'Centro Medico Salus', oggetto: 'Richiesta nota di credito fattura FE-2026-0025', descrizione: 'Chiediamo emissione nota di credito per €120,00 — sconto concordato non applicato.', priorita: 'media', stato: 'aperto', categoria: 'Amministrazione', assegnatoA: 'u-op-3', assegnatoNome: 'Maria Conti', dataApertura: '2026-03-09', risposte: [] },
  { id: 'tkt-3', tenantId: 't-1', numero: 'TKT-2026-0003', clienteId: 'c-6', clienteNome: 'MegaStore Elettronica S.r.l.', oggetto: 'Prodotto difettoso - Switch 8 porte lotto 2026-02', descrizione: '2 switch del lotto di febbraio presentano una porta non funzionante. Richiesta sostituzione.', priorita: 'alta', stato: 'in_lavorazione', categoria: 'Garanzia/Resi', assegnatoA: 'u-op-4', assegnatoNome: 'Paolo Ricci', dataApertura: '2026-03-14', risposte: [{ id: 'r-3', autore: 'Paolo Ricci', tipo: 'operatore', messaggio: 'Abbiamo aperto pratica RMA con il fornitore. Sostituzione prevista entro 5gg lavorativi.', data: '2026-03-14T16:00:00' }] },
  { id: 'tkt-4', tenantId: 't-1', numero: 'TKT-2026-0004', clienteId: 'c-13', clienteNome: 'Scuola Privata San Giuseppe', oggetto: 'WiFi laboratorio informatica non funzionante', descrizione: 'Il WiFi nel laboratorio informatica al secondo piano non funziona da ieri mattina.', priorita: 'critica', stato: 'in_lavorazione', categoria: 'Assistenza Tecnica', assegnatoA: 'u-op-2', assegnatoNome: 'Giuseppe Ferrara', dataApertura: '2026-03-17', risposte: [{ id: 'r-4', autore: 'Giuseppe Ferrara', tipo: 'operatore', messaggio: 'Verificato da remoto: l\'access point risulta offline. Interverremo lunedì 24 durante la manutenzione programmata. Nel frattempo consigliamo di riavviare il dispositivo.', data: '2026-03-17T11:00:00' }] },
  { id: 'tkt-5', tenantId: 't-1', numero: 'TKT-2026-0005', clienteId: 'c-1', clienteNome: 'TechnoService S.r.l.', oggetto: 'Richiesta informazioni garanzia UPS', descrizione: 'Vorrei sapere i termini di garanzia del Gruppo di Continuità 1000VA acquistato a dicembre.', priorita: 'bassa', stato: 'risolto', categoria: 'Informazioni', assegnatoA: 'u-op-1', assegnatoNome: 'Anna Bianchi', dataApertura: '2026-03-05', dataChiusura: '2026-03-06', risposte: [{ id: 'r-5', autore: 'Anna Bianchi', tipo: 'operatore', messaggio: 'La garanzia del prodotto è di 24 mesi dalla data di acquisto. In caso di guasto, si prega di contattarci per l\'apertura della pratica RMA.', data: '2026-03-06T09:30:00' }] },
  { id: 'tkt-6', tenantId: 't-1', numero: 'TKT-2026-0006', clienteId: 'c-16', clienteNome: 'Ottica Visione Perfetta', oggetto: 'Monitor 24" pixel bruciato', descrizione: 'Uno dei monitor acquistati presenta un pixel bruciato al centro dello schermo.', priorita: 'media', stato: 'chiuso', categoria: 'Garanzia/Resi', assegnatoA: 'u-op-4', assegnatoNome: 'Paolo Ricci', dataApertura: '2026-02-20', dataChiusura: '2026-03-01', risposte: [{ id: 'r-6', autore: 'Paolo Ricci', tipo: 'operatore', messaggio: 'Monitor sostituito in garanzia. Ritiro e consegna effettuati il 28/02.', data: '2026-03-01T10:00:00' }] },
];

// ==================== CONTRATTI ====================
// TODO: Replace with Supabase query

export const contratti: Contratto[] = [
  { id: 'ctr-1', tenantId: 't-1', numero: 'CTR-2025-001', clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', oggetto: 'Fornitura trimestrale prodotti networking', tipo: 'fornitura', stato: 'attivo', dataInizio: '2025-01-01', dataFine: '2026-12-31', valoreAnnuale: 48000, rinnovo: 'automatico' },
  { id: 'ctr-2', tenantId: 't-1', numero: 'CTR-2025-002', clienteId: 'c-13', clienteNome: 'Scuola Privata San Giuseppe', oggetto: 'Manutenzione rete e assistenza IT', tipo: 'manutenzione', stato: 'attivo', dataInizio: '2025-09-01', dataFine: '2026-08-31', valoreAnnuale: 4800, rinnovo: 'automatico', note: '12 interventi programmati + assistenza remota' },
  { id: 'ctr-3', tenantId: 't-1', numero: 'CTR-2025-003', clienteId: 'c-8', clienteNome: 'Albergo Bellavista S.a.s.', oggetto: 'Manutenzione sistema videosorveglianza', tipo: 'manutenzione', stato: 'attivo', dataInizio: '2026-03-01', dataFine: '2027-02-28', valoreAnnuale: 2400, rinnovo: 'manuale' },
  { id: 'ctr-4', tenantId: 't-1', numero: 'CTR-2025-004', clienteId: 'c-20', clienteNome: 'Centro Medico Salus', oggetto: 'Consulenza IT e supporto tecnico', tipo: 'consulenza', stato: 'attivo', dataInizio: '2025-04-01', dataFine: '2026-03-31', valoreAnnuale: 7200, rinnovo: 'automatico', note: 'In scadenza — proporre rinnovo con upgrade' },
  { id: 'ctr-5', tenantId: 't-1', numero: 'CTR-2024-005', clienteId: 'c-10', clienteNome: 'Studio Legale Marini', oggetto: 'Assistenza tecnica informatica', tipo: 'servizio', stato: 'scaduto', dataInizio: '2024-06-01', dataFine: '2025-05-31', valoreAnnuale: 3600, rinnovo: 'manuale' },
  { id: 'ctr-6', tenantId: 't-1', numero: 'CTR-2026-006', clienteId: 'c-24', clienteNome: 'Assicurazioni Futuro S.a.s.', oggetto: 'Fornitura annuale consumabili e periferiche', tipo: 'fornitura', stato: 'bozza', dataInizio: '2026-04-01', dataFine: '2027-03-31', valoreAnnuale: 5400, rinnovo: 'automatico' },
];

// ==================== SPESE ====================
// TODO: Replace with Supabase query

export const spese: Spesa[] = [
  { id: 'sp-1', tenantId: 't-1', descrizione: 'Autostrada MI-TO per sopralluogo', categoria: 'trasporti', importo: 28.50, data: '2026-03-10', dipendenteId: 'd-3', dipendenteNome: 'Giuseppe Ferrara', clienteId: 'c-3', clienteNome: 'Impianti Sicuri S.a.s.', stato: 'approvata', ricevuta: true },
  { id: 'sp-2', tenantId: 't-1', descrizione: 'Pranzo di lavoro con cliente', categoria: 'pasti', importo: 65.00, data: '2026-03-12', dipendenteId: 'd-2', dipendenteNome: 'Anna Bianchi', clienteId: 'c-4', clienteNome: 'Digital Home S.r.l.', stato: 'approvata', ricevuta: true },
  { id: 'sp-3', tenantId: 't-1', descrizione: 'Parcheggio centro Milano', categoria: 'trasporti', importo: 12.00, data: '2026-03-14', dipendenteId: 'd-6', dipendenteNome: 'Francesca Moretti', stato: 'approvata', ricevuta: true },
  { id: 'sp-4', tenantId: 't-1', descrizione: 'Materiale minuto installazione (fascette, viti)', categoria: 'materiali', importo: 45.80, data: '2026-03-15', dipendenteId: 'd-3', dipendenteNome: 'Giuseppe Ferrara', progettoId: 'prj-1', progettoNome: 'Cablaggio magazzino Logistica Nord', stato: 'approvata', ricevuta: true },
  { id: 'sp-5', tenantId: 't-1', descrizione: 'Bolletta energia elettrica sede - Marzo', categoria: 'utenze', importo: 380.00, data: '2026-03-01', stato: 'approvata', ricevuta: true },
  { id: 'sp-6', tenantId: 't-1', descrizione: 'Abbonamento software gestione ticket', categoria: 'servizi', importo: 29.00, data: '2026-03-01', stato: 'approvata', ricevuta: true },
  { id: 'sp-7', tenantId: 't-1', descrizione: 'Carburante auto aziendale', categoria: 'trasporti', importo: 85.00, data: '2026-03-16', dipendenteId: 'd-5', dipendenteNome: 'Paolo Ricci', stato: 'da_approvare', ricevuta: true },
  { id: 'sp-8', tenantId: 't-1', descrizione: 'Cena aziendale team Q1', categoria: 'pasti', importo: 220.00, data: '2026-03-14', dipendenteId: 'd-1', dipendenteNome: 'Luigi Rossi', stato: 'da_approvare', ricevuta: true },
  { id: 'sp-9', tenantId: 't-1', descrizione: 'Noleggio furgone per consegna', categoria: 'trasporti', importo: 95.00, data: '2026-03-08', dipendenteId: 'd-5', dipendenteNome: 'Paolo Ricci', clienteId: 'c-2', clienteNome: 'Elettro Forniture Italia S.p.A.', stato: 'rimborsata', ricevuta: true },
  { id: 'sp-10', tenantId: 't-1', descrizione: 'Iscrizione fiera Sicurezza 2026', categoria: 'altro', importo: 450.00, data: '2026-02-15', stato: 'approvata', ricevuta: true, note: 'Fiera Milano, 15-17 aprile 2026' },
];

// ==================== NOTE DI CREDITO ====================
// TODO: Replace with Supabase query

export const noteDiCredito: NotaDiCredito[] = [
  { id: 'ndc-1', tenantId: 't-1', numero: 'NDC-2026-0001', fatturaId: 'fat-005', fatturaNumero: 'FE-2025-0005', clienteId: 'c-6', clienteNome: 'MegaStore Elettronica S.r.l.', data: '2026-01-15', motivo: 'Reso parziale merce difettosa (2x Switch 8 porte)', importo: 49.02, iva: 10.78, totale: 59.80, stato: 'accettata' },
  { id: 'ndc-2', tenantId: 't-1', numero: 'NDC-2026-0002', fatturaId: 'fat-012', fatturaNumero: 'FE-2025-0012', clienteId: 'c-16', clienteNome: 'Ottica Visione Perfetta', data: '2026-03-01', motivo: 'Sostituzione monitor in garanzia', importo: 146.72, iva: 32.28, totale: 179.00, stato: 'accettata' },
  { id: 'ndc-3', tenantId: 't-1', numero: 'NDC-2026-0003', fatturaId: 'fat-025', fatturaNumero: 'FE-2026-0025', clienteId: 'c-20', clienteNome: 'Centro Medico Salus', data: '2026-03-18', motivo: 'Sconto concordato non applicato in fattura', importo: 98.36, iva: 21.64, totale: 120.00, stato: 'emessa' },
];
