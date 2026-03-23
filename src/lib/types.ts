// TypeScript interfaces per Sapunto SaaS
// Compatible with both in-memory mockdata and PostgreSQL (null for optional fields)

export type UserRole = 'superadmin' | 'tenant_admin' | 'utente';

export type PianoAbbonamento = 'express' | 'explore' | 'experience';

export interface Tenant {
  id: string;
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  email: string;
  pec: string;
  codiceDestinatario: string;
  logo?: string | null;
  piano: PianoAbbonamento;
  stato: 'attivo' | 'sospeso' | 'trial';
  dataCreazione: string;
  dataScadenza: string;
  maxUtenti: number;
  utentiAttivi: number;
}

export interface User {
  id: string;
  tenantId: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  avatar?: string | null;
  attivo: boolean;
}

export interface Cliente {
  id: string;
  tenantId: string;
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  email: string;
  pec?: string | null;
  codiceDestinatario?: string | null;
  tipo: 'azienda' | 'privato';
  tags: string[];
  note?: string | null;
  dataCreazione: string;
  referente?: string | null;
}

export interface Prodotto {
  id: string;
  tenantId: string;
  nome: string;
  sku: string;
  descrizione: string;
  prezzo: number;
  prezzoAcquisto: number;
  giacenza: number;
  scorteMinime: number;
  categoria: string;
  unita: string;
  iva: number;
  attivo: boolean;
}

export interface RigaOrdine {
  prodottoId: string;
  nome: string;
  quantita: number;
  prezzoUnitario: number;
  iva: number;
  totale: number;
}

export type StatoOrdine = 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';

export interface Ordine {
  id: string;
  tenantId: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  stato: StatoOrdine;
  righe: RigaOrdine[];
  subtotale: number;
  iva: number;
  totale: number;
  canale: 'diretto' | 'woocommerce' | 'prestashop' | 'shopify' | 'telefono' | 'email';
  note?: string | null;
  fatturaId?: string | null;
}

export type StatoSDI = 'bozza' | 'inviata' | 'consegnata' | 'scartata' | 'in_attesa' | 'accettata' | 'rifiutata';

export interface NotificaSDI {
  tipo: 'Ricevuta di Consegna' | 'Notifica di Scarto' | 'Esito Committente' | 'Notifica di Mancata Consegna' | 'Attestazione di Avvenuta Trasmissione';
  data: string;
  descrizione: string;
}

export interface Fattura {
  id: string;
  tenantId: string;
  numero: string;
  tipo: 'emessa' | 'ricevuta';
  clienteId: string;
  clienteNome: string;
  data: string;
  dataScadenza: string;
  stato: 'pagata' | 'non_pagata' | 'scaduta' | 'parziale';
  statoSDI: StatoSDI;
  notificheSDI: NotificaSDI[];
  ordineId?: string | null;
  righe: RigaOrdine[];
  subtotale: number;
  iva: number;
  totale: number;
  xmlRiferimento?: string | null;
  // Campi SDI per tracciamento invio
  sdiIdentificativo?: string | null;
  sdiProgressivoInvio?: string | null;
  sdiDataInvio?: string | null;
  sdiErroreDettaglio?: string | null;
}

export interface Dipendente {
  id: string;
  tenantId: string;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataNascita: string;
  luogoNascita: string;
  indirizzo: string;
  telefono: string;
  email: string;
  ruoloAziendale: string;
  tipoContratto: 'indeterminato' | 'determinato' | 'apprendistato' | 'collaborazione';
  dataAssunzione: string;
  ralLorda: number;
  livello: string;
  iban: string;
}

export interface Cedolino {
  id: string;
  dipendenteId: string;
  tenantId: string;
  mese: number;
  anno: number;
  lordo: number;
  contributiInps: number;
  irpef: number;
  addizionaleRegionale: number;
  addizionaleComunale: number;
  altreRitenute: number;
  netto: number;
  dataEmissione: string;
}

export interface Appuntamento {
  id: string;
  tenantId: string;
  titolo: string;
  clienteId?: string | null;
  clienteNome?: string | null;
  operatoreId: string;
  operatoreNome: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  stato: 'confermato' | 'in_attesa' | 'annullato';
  luogo?: string | null;
  note?: string | null;
}

export interface Email {
  id: string;
  tenantId: string;
  da: string;
  a: string;
  oggetto: string;
  corpo: string;
  data: string;
  letto: boolean;
  clienteId?: string | null;
  clienteNome?: string | null;
  tipo: 'ricevuta' | 'inviata' | 'bozza';
}

export interface PianoConfig {
  id: PianoAbbonamento;
  nome: string;
  prezzoMensile: number;
  prezzoAnnuale: number;
  maxUtenti: number;
  maxClienti: number;
  maxFatture: number;
  costoUtenteAggiuntivo: number;
  funzionalita: string[];
  descrizione: string;
}

export interface MovimentoMagazzino {
  id: string;
  tenantId: string;
  prodottoId: string;
  prodottoNome: string;
  tipo: 'carico' | 'scarico';
  quantita: number;
  data: string;
  motivo: string;
  ordineId?: string | null;
}

export interface IntegrazionEcommerce {
  id: string;
  tenantId: string;
  piattaforma: 'woocommerce' | 'prestashop' | 'shopify';
  stato: 'attivo' | 'disattivo' | 'errore' | 'prossimamente';
  urlNegozio?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  ultimoSync?: string | null;
  ordiniSincronizzati: number;
  prodottiMappati: number;
  errori: number;
}

export interface LogSync {
  id: string;
  integrazioneId: string;
  data: string;
  tipo: 'ordine' | 'prodotto' | 'cliente' | 'inventario';
  stato: 'successo' | 'errore' | 'conflitto';
  messaggio: string;
}

// ==================== PREVENTIVI ====================

export type StatoPreventivo = 'bozza' | 'inviato' | 'accettato' | 'rifiutato' | 'scaduto';

export interface Preventivo {
  id: string;
  tenantId: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  dataScadenza: string;
  stato: StatoPreventivo;
  oggetto: string;
  righe: RigaOrdine[];
  subtotale: number;
  iva: number;
  totale: number;
  note?: string | null;
  ordineId?: string | null;
}

// ==================== LEAD / PIPELINE ====================

export type FaseLead = 'nuovo' | 'contattato' | 'qualificato' | 'proposta' | 'negoziazione' | 'vinto' | 'perso';

export interface Lead {
  id: string;
  tenantId: string;
  azienda: string;
  referente: string;
  email: string;
  telefono: string;
  fonte: 'sito_web' | 'referral' | 'fiera' | 'social' | 'cold_call' | 'altro';
  fase: FaseLead;
  valore: number;
  probabilita: number;
  assegnatoA: string;
  assegnatoNome: string;
  dataCreazione: string;
  dataChiusuraPrevista: string;
  note?: string | null;
}

// ==================== PROGETTI E TASK ====================

export type StatoProgetto = 'pianificato' | 'in_corso' | 'in_pausa' | 'completato' | 'annullato';
export type StatoTask = 'da_fare' | 'in_corso' | 'in_revisione' | 'completato';
export type PrioritaTask = 'bassa' | 'media' | 'alta' | 'urgente';

export interface Progetto {
  id: string;
  tenantId: string;
  nome: string;
  clienteId?: string | null;
  clienteNome?: string | null;
  stato: StatoProgetto;
  dataInizio: string;
  dataFinePrevista: string;
  budget?: number | null;
  descrizione: string;
  responsabileId: string;
  responsabileNome: string;
  completamento: number;
}

export interface Task {
  id: string;
  tenantId: string;
  progettoId: string;
  titolo: string;
  descrizione?: string | null;
  stato: StatoTask;
  priorita: PrioritaTask;
  assegnatoA: string;
  assegnatoNome: string;
  dataScadenza: string;
  oreStimate?: number | null;
  oreEffettive?: number | null;
}

// ==================== TICKET SUPPORTO ====================

export type PrioritaTicket = 'bassa' | 'media' | 'alta' | 'critica';
export type StatoTicket = 'aperto' | 'in_lavorazione' | 'in_attesa' | 'risolto' | 'chiuso';

export interface Ticket {
  id: string;
  tenantId: string;
  numero: string;
  clienteId?: string | null;
  clienteNome?: string | null;
  oggetto: string;
  descrizione: string;
  priorita: PrioritaTicket;
  stato: StatoTicket;
  categoria: string;
  assegnatoA?: string | null;
  assegnatoNome?: string | null;
  dataApertura: string;
  dataChiusura?: string | null;
  risposte: RispostaTicket[];
}

export interface RispostaTicket {
  id: string;
  autore: string;
  tipo: 'cliente' | 'operatore';
  messaggio: string;
  data: string;
}

// ==================== CONTRATTI ====================

export type StatoContratto = 'bozza' | 'attivo' | 'scaduto' | 'rinnovato' | 'rescisso';

export interface Contratto {
  id: string;
  tenantId: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  oggetto: string;
  tipo: 'servizio' | 'fornitura' | 'manutenzione' | 'consulenza' | 'altro';
  stato: StatoContratto;
  dataInizio: string;
  dataFine: string;
  valoreAnnuale: number;
  rinnovo: 'automatico' | 'manuale';
  note?: string | null;
}

// ==================== SPESE ====================

export type CategoriaSpesa = 'trasporti' | 'pasti' | 'alloggio' | 'materiali' | 'servizi' | 'utenze' | 'altro';

export interface Spesa {
  id: string;
  tenantId: string;
  descrizione: string;
  categoria: CategoriaSpesa;
  importo: number;
  data: string;
  dipendenteId?: string | null;
  dipendenteNome?: string | null;
  clienteId?: string | null;
  clienteNome?: string | null;
  progettoId?: string | null;
  progettoNome?: string | null;
  stato: 'da_approvare' | 'approvata' | 'rifiutata' | 'rimborsata';
  ricevuta?: boolean | null;
  note?: string | null;
}

// ==================== NOTE DI CREDITO ====================

export interface NotaDiCredito {
  id: string;
  tenantId: string;
  numero: string;
  fatturaId: string;
  fatturaNumero: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  motivo: string;
  importo: number;
  iva: number;
  totale: number;
  stato: 'emessa' | 'inviata_sdi' | 'accettata';
}

// ==================== PAGAMENTI E ABBONAMENTI ====================

export type MetodoPagamentoPiattaforma = 'nexi' | 'paypal' | 'bonifico';
export type StatoAbbonamento = 'attivo' | 'scaduto' | 'sospeso' | 'cancellato' | 'trial' | 'in_attesa_pagamento';
export type StatoTransazione = 'pending' | 'completata' | 'fallita' | 'rimborsata' | 'in_attesa_conferma';
export type CicloPagamento = 'mensile' | 'annuale';

export interface Abbonamento {
  id: string;
  tenantId: string;
  pianoId: PianoAbbonamento;
  stato: StatoAbbonamento;
  metodoPagamento: MetodoPagamentoPiattaforma | null;
  cicloPagamento: CicloPagamento;
  dataInizio: string;
  dataFine: string;
  prossimoRinnovo: string | null;
  nexiContractId: string | null;
  paypalSubscriptionId: string | null;
  importoBase: number;
  utentiAggiuntivi: number;
  costoUtentiAggiuntivi: number;
  importoTotale: number;
  riferimentoBonifico: string | null;
  note: string | null;
  dataCreazione: string;
  dataAggiornamento: string;
}

export interface TransazionePiattaforma {
  id: string;
  abbonamentoId: string;
  tenantId: string;
  importo: number;
  valuta: string;
  stato: StatoTransazione;
  metodoPagamento: MetodoPagamentoPiattaforma;
  riferimentoEsterno: string | null;
  nexiOperationId: string | null;
  paypalTransactionId: string | null;
  descrizione: string;
  data: string;
  dataConferma: string | null;
  dettagliRisposta: Record<string, unknown> | null;
}

// ==================== DOCUMENTI (File Sharing) ====================

export interface Documento {
  id: string;
  tenantId: string;
  nome: string;
  nomeOriginale: string;
  dimensione: number;
  tipoMime: string;
  url: string;
  pathname: string;
  caricatoDa: string;
  caricatoDaNome: string;
  dataCaricamento: string;
  cartella?: string | null;
  note?: string | null;
}
