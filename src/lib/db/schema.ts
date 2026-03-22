import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum('user_role', ['superadmin', 'tenant_admin', 'utente']);
export const pianoEnum = pgEnum('piano_abbonamento', ['express', 'explore', 'experience']);
export const statoTenantEnum = pgEnum('stato_tenant', ['attivo', 'sospeso', 'trial']);
export const tipoClienteEnum = pgEnum('tipo_cliente', ['azienda', 'privato']);
export const statoOrdineEnum = pgEnum('stato_ordine', ['nuovo', 'in_lavorazione', 'spedito', 'completato', 'annullato']);
export const canaleOrdineEnum = pgEnum('canale_ordine', ['diretto', 'woocommerce', 'prestashop', 'telefono', 'email']);
export const statoPagamentoEnum = pgEnum('stato_pagamento', ['pagata', 'non_pagata', 'scaduta', 'parziale']);
export const statoSDIEnum = pgEnum('stato_sdi', ['bozza', 'inviata', 'consegnata', 'scartata', 'in_attesa', 'accettata', 'rifiutata']);
export const tipoFatturaEnum = pgEnum('tipo_fattura', ['emessa', 'ricevuta']);
export const tipoContrattoLavoroEnum = pgEnum('tipo_contratto_lavoro', ['indeterminato', 'determinato', 'apprendistato', 'collaborazione']);
export const statoAppuntamentoEnum = pgEnum('stato_appuntamento', ['confermato', 'in_attesa', 'annullato']);
export const tipoEmailEnum = pgEnum('tipo_email', ['ricevuta', 'inviata', 'bozza']);
export const tipoMovimentoEnum = pgEnum('tipo_movimento', ['carico', 'scarico']);
export const piattaformaEcommerceEnum = pgEnum('piattaforma_ecommerce', ['woocommerce', 'prestashop', 'shopify']);
export const statoIntegrazioneEnum = pgEnum('stato_integrazione', ['attivo', 'disattivo', 'errore', 'prossimamente']);
export const tipoLogSyncEnum = pgEnum('tipo_log_sync', ['ordine', 'prodotto', 'cliente', 'inventario']);
export const statoLogSyncEnum = pgEnum('stato_log_sync', ['successo', 'errore', 'conflitto']);
export const statoPreventivoEnum = pgEnum('stato_preventivo', ['bozza', 'inviato', 'accettato', 'rifiutato', 'scaduto']);
export const faseLeadEnum = pgEnum('fase_lead', ['nuovo', 'contattato', 'qualificato', 'proposta', 'negoziazione', 'vinto', 'perso']);
export const fonteLeadEnum = pgEnum('fonte_lead', ['sito_web', 'referral', 'fiera', 'social', 'cold_call', 'altro']);
export const statoProgettoEnum = pgEnum('stato_progetto', ['pianificato', 'in_corso', 'in_pausa', 'completato', 'annullato']);
export const statoTaskEnum = pgEnum('stato_task', ['da_fare', 'in_corso', 'in_revisione', 'completato']);
export const prioritaTaskEnum = pgEnum('priorita_task', ['bassa', 'media', 'alta', 'urgente']);
export const prioritaTicketEnum = pgEnum('priorita_ticket', ['bassa', 'media', 'alta', 'critica']);
export const statoTicketEnum = pgEnum('stato_ticket', ['aperto', 'in_lavorazione', 'in_attesa', 'risolto', 'chiuso']);
export const statoContrattoEnum = pgEnum('stato_contratto', ['bozza', 'attivo', 'scaduto', 'rinnovato', 'rescisso']);
export const tipoContrattoEnum = pgEnum('tipo_contratto', ['servizio', 'fornitura', 'manutenzione', 'consulenza', 'altro']);
export const rinnovoContrattoEnum = pgEnum('rinnovo_contratto', ['automatico', 'manuale']);
export const categoriaSpesaEnum = pgEnum('categoria_spesa', ['trasporti', 'pasti', 'alloggio', 'materiali', 'servizi', 'utenze', 'altro']);
export const statoSpesaEnum = pgEnum('stato_spesa', ['da_approvare', 'approvata', 'rifiutata', 'rimborsata']);
export const statoNotaCreditoEnum = pgEnum('stato_nota_credito', ['emessa', 'inviata_sdi', 'accettata']);
export const metodoPagamentoPiattaformaEnum = pgEnum('metodo_pagamento_piattaforma', ['nexi', 'paypal', 'bonifico']);
export const statoAbbonamentoEnum = pgEnum('stato_abbonamento', ['attivo', 'scaduto', 'sospeso', 'cancellato', 'trial', 'in_attesa_pagamento']);
export const statoTransazioneEnum = pgEnum('stato_transazione', ['pending', 'completata', 'fallita', 'rimborsata', 'in_attesa_conferma']);
export const cicloPagamentoEnum = pgEnum('ciclo_pagamento', ['mensile', 'annuale']);

// ==================== TABLES ====================

export const piani = pgTable('piani', {
  id: pianoEnum('id').primaryKey(),
  nome: text('nome').notNull(),
  prezzoMensile: numeric('prezzo_mensile', { precision: 10, scale: 2 }).notNull(),
  prezzoAnnuale: numeric('prezzo_annuale', { precision: 10, scale: 2 }).notNull(),
  maxUtenti: integer('max_utenti').notNull(),
  maxClienti: integer('max_clienti').notNull(),
  maxFatture: integer('max_fatture').notNull(),
  costoUtenteAggiuntivo: numeric('costo_utente_aggiuntivo', { precision: 10, scale: 2 }).notNull().default('19'),
  funzionalita: jsonb('funzionalita').$type<string[]>().notNull(),
  descrizione: text('descrizione').notNull().default(''),
});

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  ragioneSociale: text('ragione_sociale').notNull(),
  partitaIva: text('partita_iva').notNull(),
  codiceFiscale: text('codice_fiscale').notNull(),
  indirizzo: text('indirizzo').notNull(),
  citta: text('citta').notNull(),
  cap: text('cap').notNull(),
  provincia: text('provincia').notNull(),
  telefono: text('telefono').notNull(),
  email: text('email').notNull(),
  pec: text('pec').notNull(),
  codiceDestinatario: text('codice_destinatario').notNull(),
  logo: text('logo'),
  piano: pianoEnum('piano').notNull(),
  stato: statoTenantEnum('stato').notNull(),
  dataCreazione: text('data_creazione').notNull(),
  dataScadenza: text('data_scadenza').notNull(),
  maxUtenti: integer('max_utenti').notNull(),
  utentiAttivi: integer('utenti_attivi').notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  nome: text('nome').notNull(),
  cognome: text('cognome').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  ruolo: userRoleEnum('ruolo').notNull(),
  avatar: text('avatar'),
  attivo: boolean('attivo').notNull().default(true),
});

export const clienti = pgTable('clienti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  ragioneSociale: text('ragione_sociale').notNull(),
  partitaIva: text('partita_iva').notNull(),
  codiceFiscale: text('codice_fiscale').notNull(),
  indirizzo: text('indirizzo').notNull(),
  citta: text('citta').notNull(),
  cap: text('cap').notNull(),
  provincia: text('provincia').notNull(),
  telefono: text('telefono').notNull(),
  email: text('email').notNull(),
  pec: text('pec'),
  codiceDestinatario: text('codice_destinatario'),
  tipo: tipoClienteEnum('tipo').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  note: text('note'),
  dataCreazione: text('data_creazione').notNull(),
  referente: text('referente'),
});

export const prodotti = pgTable('prodotti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  nome: text('nome').notNull(),
  sku: text('sku').notNull(),
  descrizione: text('descrizione').notNull(),
  prezzo: numeric('prezzo', { precision: 10, scale: 2 }).notNull(),
  prezzoAcquisto: numeric('prezzo_acquisto', { precision: 10, scale: 2 }).notNull(),
  giacenza: integer('giacenza').notNull(),
  scorteMinime: integer('scorte_minime').notNull(),
  categoria: text('categoria').notNull(),
  unita: text('unita').notNull(),
  iva: integer('iva').notNull(),
  attivo: boolean('attivo').notNull().default(true),
});

export const ordini = pgTable('ordini', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  numero: text('numero').notNull(),
  clienteId: text('cliente_id').notNull(),
  clienteNome: text('cliente_nome').notNull(),
  data: text('data').notNull(),
  stato: statoOrdineEnum('stato').notNull(),
  righe: jsonb('righe').$type<{
    prodottoId: string;
    nome: string;
    quantita: number;
    prezzoUnitario: number;
    iva: number;
    totale: number;
  }[]>().notNull(),
  subtotale: numeric('subtotale', { precision: 10, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 10, scale: 2 }).notNull(),
  totale: numeric('totale', { precision: 10, scale: 2 }).notNull(),
  canale: canaleOrdineEnum('canale').notNull(),
  note: text('note'),
  fatturaId: text('fattura_id'),
});

export const fatture = pgTable('fatture', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  numero: text('numero').notNull(),
  tipo: tipoFatturaEnum('tipo').notNull(),
  clienteId: text('cliente_id').notNull(),
  clienteNome: text('cliente_nome').notNull(),
  data: text('data').notNull(),
  dataScadenza: text('data_scadenza').notNull(),
  stato: statoPagamentoEnum('stato').notNull(),
  statoSDI: statoSDIEnum('stato_sdi').notNull(),
  notificheSDI: jsonb('notifiche_sdi').$type<{
    tipo: string;
    data: string;
    descrizione: string;
  }[]>().notNull().default([]),
  ordineId: text('ordine_id'),
  righe: jsonb('righe').$type<{
    prodottoId: string;
    nome: string;
    quantita: number;
    prezzoUnitario: number;
    iva: number;
    totale: number;
  }[]>().notNull(),
  subtotale: numeric('subtotale', { precision: 10, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 10, scale: 2 }).notNull(),
  totale: numeric('totale', { precision: 10, scale: 2 }).notNull(),
  xmlRiferimento: text('xml_riferimento'),
});

export const dipendenti = pgTable('dipendenti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  nome: text('nome').notNull(),
  cognome: text('cognome').notNull(),
  codiceFiscale: text('codice_fiscale').notNull(),
  dataNascita: text('data_nascita').notNull(),
  luogoNascita: text('luogo_nascita').notNull(),
  indirizzo: text('indirizzo').notNull(),
  telefono: text('telefono').notNull(),
  email: text('email').notNull(),
  ruoloAziendale: text('ruolo_aziendale').notNull(),
  tipoContratto: tipoContrattoLavoroEnum('tipo_contratto').notNull(),
  dataAssunzione: text('data_assunzione').notNull(),
  ralLorda: numeric('ral_lorda', { precision: 10, scale: 2 }).notNull(),
  livello: text('livello').notNull(),
  iban: text('iban').notNull(),
});

export const cedolini = pgTable('cedolini', {
  id: text('id').primaryKey(),
  dipendenteId: text('dipendente_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  mese: integer('mese').notNull(),
  anno: integer('anno').notNull(),
  lordo: numeric('lordo', { precision: 10, scale: 2 }).notNull(),
  contributiInps: numeric('contributi_inps', { precision: 10, scale: 2 }).notNull(),
  irpef: numeric('irpef', { precision: 10, scale: 2 }).notNull(),
  addizionaleRegionale: numeric('addizionale_regionale', { precision: 10, scale: 2 }).notNull(),
  addizionaleComunale: numeric('addizionale_comunale', { precision: 10, scale: 2 }).notNull(),
  altreRitenute: numeric('altre_ritenute', { precision: 10, scale: 2 }).notNull(),
  netto: numeric('netto', { precision: 10, scale: 2 }).notNull(),
  dataEmissione: text('data_emissione').notNull(),
});

export const appuntamenti = pgTable('appuntamenti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  titolo: text('titolo').notNull(),
  clienteId: text('cliente_id'),
  clienteNome: text('cliente_nome'),
  operatoreId: text('operatore_id').notNull(),
  operatoreNome: text('operatore_nome').notNull(),
  data: text('data').notNull(),
  oraInizio: text('ora_inizio').notNull(),
  oraFine: text('ora_fine').notNull(),
  stato: statoAppuntamentoEnum('stato').notNull(),
  luogo: text('luogo'),
  note: text('note'),
});

export const emails = pgTable('emails', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  da: text('da').notNull(),
  a: text('a').notNull(),
  oggetto: text('oggetto').notNull(),
  corpo: text('corpo').notNull(),
  data: text('data').notNull(),
  letto: boolean('letto').notNull().default(false),
  clienteId: text('cliente_id'),
  clienteNome: text('cliente_nome'),
  tipo: tipoEmailEnum('tipo').notNull(),
});

export const movimentiMagazzino = pgTable('movimenti_magazzino', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  prodottoId: text('prodotto_id').notNull(),
  prodottoNome: text('prodotto_nome').notNull(),
  tipo: tipoMovimentoEnum('tipo').notNull(),
  quantita: integer('quantita').notNull(),
  data: text('data').notNull(),
  motivo: text('motivo').notNull(),
  ordineId: text('ordine_id'),
});

export const integrazioniEcommerce = pgTable('integrazioni_ecommerce', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  piattaforma: piattaformaEcommerceEnum('piattaforma').notNull(),
  stato: statoIntegrazioneEnum('stato').notNull(),
  urlNegozio: text('url_negozio'),
  ultimoSync: text('ultimo_sync'),
  ordiniSincronizzati: integer('ordini_sincronizzati').notNull().default(0),
  prodottiMappati: integer('prodotti_mappati').notNull().default(0),
  errori: integer('errori').notNull().default(0),
});

export const logSync = pgTable('log_sync', {
  id: text('id').primaryKey(),
  integrazioneId: text('integrazione_id').notNull(),
  data: text('data').notNull(),
  tipo: tipoLogSyncEnum('tipo').notNull(),
  stato: statoLogSyncEnum('stato').notNull(),
  messaggio: text('messaggio').notNull(),
});

export const preventivi = pgTable('preventivi', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  numero: text('numero').notNull(),
  clienteId: text('cliente_id').notNull(),
  clienteNome: text('cliente_nome').notNull(),
  data: text('data').notNull(),
  dataScadenza: text('data_scadenza').notNull(),
  stato: statoPreventivoEnum('stato').notNull(),
  oggetto: text('oggetto').notNull(),
  righe: jsonb('righe').$type<{
    prodottoId: string;
    nome: string;
    quantita: number;
    prezzoUnitario: number;
    iva: number;
    totale: number;
  }[]>().notNull(),
  subtotale: numeric('subtotale', { precision: 10, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 10, scale: 2 }).notNull(),
  totale: numeric('totale', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  ordineId: text('ordine_id'),
});

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  azienda: text('azienda').notNull(),
  referente: text('referente').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono').notNull(),
  fonte: fonteLeadEnum('fonte').notNull(),
  fase: faseLeadEnum('fase').notNull(),
  valore: numeric('valore', { precision: 10, scale: 2 }).notNull(),
  probabilita: integer('probabilita').notNull(),
  assegnatoA: text('assegnato_a').notNull(),
  assegnatoNome: text('assegnato_nome').notNull(),
  dataCreazione: text('data_creazione').notNull(),
  dataChiusuraPrevista: text('data_chiusura_prevista').notNull(),
  note: text('note'),
});

export const progetti = pgTable('progetti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  nome: text('nome').notNull(),
  clienteId: text('cliente_id'),
  clienteNome: text('cliente_nome'),
  stato: statoProgettoEnum('stato').notNull(),
  dataInizio: text('data_inizio').notNull(),
  dataFinePrevista: text('data_fine_prevista').notNull(),
  budget: numeric('budget', { precision: 10, scale: 2 }),
  descrizione: text('descrizione').notNull(),
  responsabileId: text('responsabile_id').notNull(),
  responsabileNome: text('responsabile_nome').notNull(),
  completamento: integer('completamento').notNull().default(0),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  progettoId: text('progetto_id').notNull(),
  titolo: text('titolo').notNull(),
  descrizione: text('descrizione'),
  stato: statoTaskEnum('stato').notNull(),
  priorita: prioritaTaskEnum('priorita').notNull(),
  assegnatoA: text('assegnato_a').notNull(),
  assegnatoNome: text('assegnato_nome').notNull(),
  dataScadenza: text('data_scadenza').notNull(),
  oreStimate: integer('ore_stimate'),
  oreEffettive: integer('ore_effettive'),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  numero: text('numero').notNull(),
  clienteId: text('cliente_id'),
  clienteNome: text('cliente_nome'),
  oggetto: text('oggetto').notNull(),
  descrizione: text('descrizione').notNull(),
  priorita: prioritaTicketEnum('priorita').notNull(),
  stato: statoTicketEnum('stato').notNull(),
  categoria: text('categoria').notNull(),
  assegnatoA: text('assegnato_a'),
  assegnatoNome: text('assegnato_nome'),
  dataApertura: text('data_apertura').notNull(),
  dataChiusura: text('data_chiusura'),
  risposte: jsonb('risposte').$type<{
    id: string;
    autore: string;
    tipo: 'cliente' | 'operatore';
    messaggio: string;
    data: string;
  }[]>().notNull().default([]),
});

export const contratti = pgTable('contratti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  numero: text('numero').notNull(),
  clienteId: text('cliente_id').notNull(),
  clienteNome: text('cliente_nome').notNull(),
  oggetto: text('oggetto').notNull(),
  tipo: tipoContrattoEnum('tipo').notNull(),
  stato: statoContrattoEnum('stato').notNull(),
  dataInizio: text('data_inizio').notNull(),
  dataFine: text('data_fine').notNull(),
  valoreAnnuale: numeric('valore_annuale', { precision: 10, scale: 2 }).notNull(),
  rinnovo: rinnovoContrattoEnum('rinnovo').notNull(),
  note: text('note'),
});

export const spese = pgTable('spese', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  descrizione: text('descrizione').notNull(),
  categoria: categoriaSpesaEnum('categoria').notNull(),
  importo: numeric('importo', { precision: 10, scale: 2 }).notNull(),
  data: text('data').notNull(),
  dipendenteId: text('dipendente_id'),
  dipendenteNome: text('dipendente_nome'),
  clienteId: text('cliente_id'),
  clienteNome: text('cliente_nome'),
  progettoId: text('progetto_id'),
  progettoNome: text('progetto_nome'),
  stato: statoSpesaEnum('stato').notNull(),
  ricevuta: boolean('ricevuta'),
  note: text('note'),
});

export const noteDiCredito = pgTable('note_di_credito', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  numero: text('numero').notNull(),
  fatturaId: text('fattura_id').notNull(),
  fatturaNumero: text('fattura_numero').notNull(),
  clienteId: text('cliente_id').notNull(),
  clienteNome: text('cliente_nome').notNull(),
  data: text('data').notNull(),
  motivo: text('motivo').notNull(),
  importo: numeric('importo', { precision: 10, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 10, scale: 2 }).notNull(),
  totale: numeric('totale', { precision: 10, scale: 2 }).notNull(),
  stato: statoNotaCreditoEnum('stato').notNull(),
});

// ==================== ABBONAMENTI (Subscriptions) ====================

export const abbonamenti = pgTable('abbonamenti', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  pianoId: pianoEnum('piano_id').notNull(),
  stato: statoAbbonamentoEnum('stato').notNull(),
  metodoPagamento: metodoPagamentoPiattaformaEnum('metodo_pagamento'),
  cicloPagamento: cicloPagamentoEnum('ciclo_pagamento').notNull(),
  dataInizio: text('data_inizio').notNull(),
  dataFine: text('data_fine').notNull(),
  prossimoRinnovo: text('prossimo_rinnovo'),
  // Riferimenti gateway esterni
  nexiContractId: text('nexi_contract_id'),
  paypalSubscriptionId: text('paypal_subscription_id'),
  // Importi
  importoBase: numeric('importo_base', { precision: 10, scale: 2 }).notNull(),
  utentiAggiuntivi: integer('utenti_aggiuntivi').notNull().default(0),
  costoUtentiAggiuntivi: numeric('costo_utenti_aggiuntivi', { precision: 10, scale: 2 }).notNull().default('0'),
  importoTotale: numeric('importo_totale', { precision: 10, scale: 2 }).notNull(),
  // Bonifico
  riferimentoBonifico: text('riferimento_bonifico'),
  // Metadata
  note: text('note'),
  dataCreazione: text('data_creazione').notNull(),
  dataAggiornamento: text('data_aggiornamento').notNull(),
});

// ==================== TRANSAZIONI PIATTAFORMA (Platform Payments) ====================

export const transazioniPiattaforma = pgTable('transazioni_piattaforma', {
  id: text('id').primaryKey(),
  abbonamentoId: text('abbonamento_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  importo: numeric('importo', { precision: 10, scale: 2 }).notNull(),
  valuta: text('valuta').notNull().default('EUR'),
  stato: statoTransazioneEnum('stato').notNull(),
  metodoPagamento: metodoPagamentoPiattaformaEnum('metodo_pagamento').notNull(),
  // Riferimenti gateway
  riferimentoEsterno: text('riferimento_esterno'),
  nexiOperationId: text('nexi_operation_id'),
  paypalTransactionId: text('paypal_transaction_id'),
  // Dettagli
  descrizione: text('descrizione').notNull(),
  data: text('data').notNull(),
  dataConferma: text('data_conferma'),
  dettagliRisposta: jsonb('dettagli_risposta').$type<Record<string, unknown>>(),
});
