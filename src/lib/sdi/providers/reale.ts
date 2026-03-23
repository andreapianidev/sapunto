/**
 * Provider SDI Reale (Stub)
 *
 * Placeholder per il provider reale che verrà implementato
 * quando il cliente fornirà le credenziali API dell'intermediario
 * (Fattura24, FattureInCloud, o altro).
 */

import type {
  SDIProvider,
  InvioFatturaParams,
  InvioFatturaResult,
  StatoFatturaSDIResult,
  NotificaSDIItem,
} from '../types';

export class ProviderReale implements SDIProvider {
  readonly name = 'reale';
  readonly isConfigured = false;

  async inviaFattura(_params: InvioFatturaParams): Promise<InvioFatturaResult> {
    return {
      success: false,
      error: 'Provider SDI reale non ancora configurato. Contattare il supporto per attivare l\'integrazione con l\'intermediario.',
    };
  }

  async controllaStato(_sdiIdentificativo: string, _sdiDataInvio: string): Promise<StatoFatturaSDIResult> {
    throw new Error('Provider SDI reale non configurato');
  }

  async getNotifiche(_sdiIdentificativo: string): Promise<NotificaSDIItem[]> {
    throw new Error('Provider SDI reale non configurato');
  }
}
