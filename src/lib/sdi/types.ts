/**
 * Tipi per il modulo SDI (Sistema di Interscambio)
 * Interfaccia provider-agnostica per l'invio fatture elettroniche.
 */

// ==================== PROVIDER INTERFACE ====================

export interface SDIProvider {
  readonly name: string;
  readonly isConfigured: boolean;

  /** Invia una fattura al SDI tramite l'intermediario */
  inviaFattura(params: InvioFatturaParams): Promise<InvioFatturaResult>;

  /** Controlla lo stato di una fattura già inviata */
  controllaStato(sdiIdentificativo: string, sdiDataInvio: string): Promise<StatoFatturaSDIResult>;

  /** Recupera le notifiche SDI per una fattura */
  getNotifiche(sdiIdentificativo: string): Promise<NotificaSDIItem[]>;
}

// ==================== PARAMS & RESULTS ====================

export interface InvioFatturaParams {
  xml: string;
  nomeFile: string;
  fatturaId: string;
  tenantId: string;
}

export interface InvioFatturaResult {
  success: boolean;
  sdiIdentificativo?: string;
  error?: string;
  dettagli?: Record<string, unknown>;
}

export interface StatoFatturaSDIResult {
  stato: 'inviata' | 'consegnata' | 'scartata' | 'in_attesa' | 'accettata' | 'rifiutata';
  dataAggiornamento: string;
  notifiche: NotificaSDIItem[];
  erroreDettaglio?: string;
}

export interface NotificaSDIItem {
  tipo: TipoNotificaSDI;
  data: string;
  descrizione: string;
}

// ==================== ENUMS / UNIONS ====================

export type TipoNotificaSDI =
  | 'Ricevuta di Consegna'        // RC - consegnata al destinatario
  | 'Notifica di Scarto'          // NS - scartata dal SDI
  | 'Notifica di Mancata Consegna' // MC - impossibile consegnare
  | 'Esito Committente'           // EC - accettata/rifiutata dal destinatario
  | 'Attestazione di Avvenuta Trasmissione' // AT - decorrenza termini
  | 'Decorrenza Termini'          // DT - nessuna risposta entro 15gg
  | 'Invio';                      // Interno - conferma invio

export type SDIProviderType = 'simulato' | 'fattura24' | 'fattureincloud' | 'manuale';

// ==================== CONFIGURAZIONE ====================

export interface ConfigurazioneSDI {
  id: string;
  tenantId: string;
  provider: SDIProviderType;
  apiKey: string | null;
  apiSecret: string | null;
  attivo: boolean;
  regimeFiscale: string;
  modalitaPagamentoDefault: string;
  ibanBeneficiario: string | null;
  dataCreazione: string;
  dataAggiornamento: string;
}

// ==================== LOG ====================

export type AzioneSDI = 'invio' | 'polling' | 'notifica' | 'errore' | 'reinvio';

export interface LogSDI {
  id: string;
  fatturaId: string;
  tenantId: string;
  azione: AzioneSDI;
  stato: 'successo' | 'errore';
  dettagli: Record<string, unknown>;
  data: string;
}

// ==================== VALIDATION ====================

export interface ValidationError {
  campo: string;
  messaggio: string;
}

export interface ValidationResult {
  valido: boolean;
  errori: ValidationError[];
}
