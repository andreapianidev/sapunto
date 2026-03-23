/**
 * Modulo SDI — Entry point unificato
 * Gestisce l'invio fatture elettroniche tramite intermediari SDI.
 */

export type {
  SDIProvider,
  InvioFatturaParams,
  InvioFatturaResult,
  StatoFatturaSDIResult,
  NotificaSDIItem,
  TipoNotificaSDI,
  SDIProviderType,
  ConfigurazioneSDI,
  AzioneSDI,
  LogSDI,
  ValidationError,
  ValidationResult,
} from './types';

export {
  validatePartitaIva,
  validateCodiceFiscale,
  validateCodiceDestinatario,
  validatePEC,
  validateFatturaPerSDI,
} from './validation';

export {
  generateFatturaPA,
  mapFatturaToSDI,
} from './xml';

export type { DatiFattura } from './xml';

import type { SDIProvider, SDIProviderType } from './types';
import { ProviderSimulato } from './providers/simulato';

/**
 * Factory per ottenere il provider SDI in base alla configurazione.
 * Default: provider simulato.
 */
export function getSDIProvider(providerType: SDIProviderType = 'simulato'): SDIProvider {
  switch (providerType) {
    case 'simulato':
      return new ProviderSimulato();
    case 'fattura24':
    case 'fattureincloud':
      // I provider reali verranno implementati quando il cliente fornirà le credenziali API
      throw new Error(`Provider SDI "${providerType}" non ancora configurato. Contattare il supporto per attivare l'integrazione.`);
    case 'manuale':
      // Modalità manuale: l'utente scarica XML e lo invia autonomamente
      return new ProviderSimulato(); // Usa simulato come fallback per tracking
    default:
      return new ProviderSimulato();
  }
}
