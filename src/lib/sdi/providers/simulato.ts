/**
 * Provider SDI Simulato
 * Replica il comportamento reale del Sistema di Interscambio
 * con progressione temporale degli stati e notifiche realistiche.
 *
 * Usato in fase di demo/test finché il cliente non fornisce
 * le credenziali API dell'intermediario reale.
 */

import type {
  SDIProvider,
  InvioFatturaParams,
  InvioFatturaResult,
  StatoFatturaSDIResult,
  NotificaSDIItem,
} from '../types';

/**
 * Hash semplice e deterministico per generare risultati riproducibili
 * in base all'ID della fattura.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export class ProviderSimulato implements SDIProvider {
  readonly name = 'simulato';
  readonly isConfigured = true;

  /**
   * Simula l'invio di una fattura al SDI.
   * Genera un identificativo fittizio e restituisce successo.
   */
  async inviaFattura(params: InvioFatturaParams): Promise<InvioFatturaResult> {
    // Simula un breve ritardo di rete
    await new Promise(resolve => setTimeout(resolve, 200));

    const sdiIdentificativo = `SIM-${Date.now()}-${params.fatturaId.slice(-5)}`;

    return {
      success: true,
      sdiIdentificativo,
      dettagli: {
        provider: 'simulato',
        nomeFile: params.nomeFile,
        xmlLength: params.xml.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Simula il controllo stato con progressione temporale deterministica.
   *
   * Logica di progressione basata sul tempo trascorso dall'invio:
   * - 0-60s: inviata
   * - 60-180s: consegnata (90%) o scartata (10%)
   * - >180s: accettata (85%) o rifiutata (15%)
   *
   * Il risultato è deterministico basato sull'hash dell'identificativo.
   */
  async controllaStato(sdiIdentificativo: string, sdiDataInvio: string): Promise<StatoFatturaSDIResult> {
    const now = new Date();
    const invioDate = new Date(sdiDataInvio);
    const elapsedSeconds = (now.getTime() - invioDate.getTime()) / 1000;

    const hash = simpleHash(sdiIdentificativo);
    const notifiche: NotificaSDIItem[] = [];

    // Fase 1: Appena inviata
    if (elapsedSeconds < 60) {
      return {
        stato: 'inviata',
        dataAggiornamento: now.toISOString(),
        notifiche: [],
      };
    }

    // Fase 2: Consegna o scarto (dopo 1 minuto)
    const isScartata = (hash % 10) === 0; // 10% di probabilità scarto
    if (isScartata) {
      const motiviScarto = [
        'Errore 00200: File non conforme al formato - Elemento TipoDocumento non valido',
        'Errore 00305: IdFiscaleIVA del CedentePrestatore non presente in Anagrafe Tributaria',
        'Errore 00400: Numero fattura già presente per lo stesso cedente/prestatore',
        'Errore 00404: CodiceDestinatario non attivo',
        'Errore 00100: Firma non valida o certificato scaduto',
      ];
      const motivoIndex = hash % motiviScarto.length;

      notifiche.push({
        tipo: 'Notifica di Scarto',
        data: new Date(invioDate.getTime() + 65000).toISOString(),
        descrizione: motiviScarto[motivoIndex],
      });

      return {
        stato: 'scartata',
        dataAggiornamento: new Date(invioDate.getTime() + 65000).toISOString(),
        notifiche,
        erroreDettaglio: motiviScarto[motivoIndex],
      };
    }

    // Fattura consegnata
    notifiche.push({
      tipo: 'Ricevuta di Consegna',
      data: new Date(invioDate.getTime() + 75000).toISOString(),
      descrizione: 'Fattura consegnata al destinatario',
    });

    if (elapsedSeconds < 180) {
      return {
        stato: 'consegnata',
        dataAggiornamento: new Date(invioDate.getTime() + 75000).toISOString(),
        notifiche,
      };
    }

    // Fase 3: Accettazione o rifiuto (dopo 3 minuti)
    const isRifiutata = (hash % 7) === 0; // ~15% di probabilità rifiuto
    if (isRifiutata) {
      notifiche.push({
        tipo: 'Esito Committente',
        data: new Date(invioDate.getTime() + 185000).toISOString(),
        descrizione: 'Fattura rifiutata dal destinatario: dati non conformi all\'ordine',
      });

      return {
        stato: 'rifiutata',
        dataAggiornamento: new Date(invioDate.getTime() + 185000).toISOString(),
        notifiche,
        erroreDettaglio: 'Fattura rifiutata dal destinatario',
      };
    }

    // Fattura accettata
    notifiche.push({
      tipo: 'Esito Committente',
      data: new Date(invioDate.getTime() + 190000).toISOString(),
      descrizione: 'Fattura accettata dal destinatario',
    });

    return {
      stato: 'accettata',
      dataAggiornamento: new Date(invioDate.getTime() + 190000).toISOString(),
      notifiche,
    };
  }

  /**
   * Recupera le notifiche per una fattura.
   * Delega a controllaStato per generare le notifiche appropriate.
   */
  async getNotifiche(sdiIdentificativo: string): Promise<NotificaSDIItem[]> {
    // Per il provider simulato, le notifiche vengono generate dal controllaStato
    // Questo metodo restituisce un array vuoto poiché il cron/webhook gestisce l'aggiornamento
    return [];
  }
}
