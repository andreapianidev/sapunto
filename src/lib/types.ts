// TypeScript interfaces per Sapunto SaaS
// TODO: Replace with Supabase database types

export type UserRole = 'superadmin' | 'tenant_admin' | 'utente';

export type PianoAbbonamento = 'base' | 'professional' | 'premium';

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
  logo?: string;
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
  avatar?: string;
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
  pec?: string;
  codiceDestinatario?: string;
  tipo: 'azienda' | 'privato';
  tags: string[];
  note?: string;
  dataCreazione: string;
  referente?: string;
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
  canale: 'diretto' | 'woocommerce' | 'prestashop' | 'telefono' | 'email';
  note?: string;
  fatturaId?: string;
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
  ordineId?: string;
  righe: RigaOrdine[];
  subtotale: number;
  iva: number;
  totale: number;
  xmlRiferimento?: string;
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
  clienteId?: string;
  clienteNome?: string;
  operatoreId: string;
  operatoreNome: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  stato: 'confermato' | 'in_attesa' | 'annullato';
  luogo?: string;
  note?: string;
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
  clienteId?: string;
  clienteNome?: string;
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
  funzionalita: string[];
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
  ordineId?: string;
}

export interface IntegrazionEcommerce {
  id: string;
  tenantId: string;
  piattaforma: 'woocommerce' | 'prestashop' | 'shopify';
  stato: 'attivo' | 'disattivo' | 'errore' | 'prossimamente';
  urlNegozio?: string;
  ultimoSync?: string;
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
