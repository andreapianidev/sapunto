'use server';

import { revalidatePath } from 'next/cache';

type ActionResult = { ok: true; data?: Record<string, unknown> } | { ok: false; error: string; errori?: { campo: string; messaggio: string }[] };

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ==================== INVIO FATTURA A SDI ====================

/**
 * Invia una fattura al Sistema di Interscambio.
 * Flusso: validazione → generazione XML → invio tramite provider → aggiornamento DB.
 */
export async function inviaFatturaSDI(fatturaId: string, tenantId: string): Promise<ActionResult> {
  try {
    // Lazy imports per compatibilità Vercel build
    const dal = await import('../db/dal');
    const { validateFatturaPerSDI } = await import('../sdi/validation');
    const { mapFatturaToSDI, generateFatturaPA } = await import('../sdi/xml');
    const { getSDIProvider } = await import('../sdi/index');

    // 1. Carica fattura, tenant, cliente
    const fattura = await dal.getFatturaById(fatturaId);
    if (!fattura) return { ok: false, error: 'Fattura non trovata' };
    if (fattura.tenantId !== tenantId) return { ok: false, error: 'Fattura non appartenente al tenant' };

    const tenant = await dal.getTenantById(tenantId);
    if (!tenant) return { ok: false, error: 'Tenant non trovato' };

    const cliente = await dal.getClienteById(fattura.clienteId);
    if (!cliente) return { ok: false, error: 'Cliente non trovato' };

    // 2. Validazione pre-invio
    const validation = validateFatturaPerSDI({
      fattura: {
        numero: fattura.numero,
        data: fattura.data,
        righe: (fattura.righe || []).map(r => ({
          nome: r.nome,
          quantita: r.quantita,
          prezzoUnitario: r.prezzoUnitario,
          iva: r.iva,
          totale: r.totale,
        })),
        subtotale: fattura.subtotale,
        totale: fattura.totale,
      },
      tenant: {
        ragioneSociale: tenant.ragioneSociale,
        partitaIva: tenant.partitaIva,
        codiceFiscale: tenant.codiceFiscale,
        indirizzo: tenant.indirizzo,
        citta: tenant.citta,
        cap: tenant.cap,
        provincia: tenant.provincia,
        pec: tenant.pec,
      },
      cliente: {
        ragioneSociale: cliente.ragioneSociale,
        partitaIva: cliente.partitaIva,
        codiceFiscale: cliente.codiceFiscale,
        indirizzo: cliente.indirizzo,
        citta: cliente.citta,
        cap: cliente.cap,
        provincia: cliente.provincia,
        pec: cliente.pec,
        codiceDestinatario: cliente.codiceDestinatario,
      },
    });

    if (!validation.valido) {
      return {
        ok: false,
        error: 'Dati non validi per l\'invio al SDI',
        errori: validation.errori,
      };
    }

    // 3. Carica configurazione SDI del tenant (default: simulato)
    const config = await dal.getConfigurazioneSdi(tenantId);
    const providerType = config?.provider || 'simulato';
    const provider = getSDIProvider(providerType);

    // 4. Genera XML FatturaPA
    const progressivoInvio = `${tenant.partitaIva.slice(-5)}_${fattura.numero.replace(/[^a-zA-Z0-9]/g, '')}`;
    const datiFattura = mapFatturaToSDI({
      fattura: {
        numero: fattura.numero,
        data: fattura.data,
        dataScadenza: fattura.dataScadenza,
        righe: (fattura.righe || []).map(r => ({
          nome: r.nome,
          quantita: r.quantita,
          prezzoUnitario: r.prezzoUnitario,
          iva: r.iva,
          totale: r.totale,
        })),
        subtotale: fattura.subtotale,
        iva: fattura.iva,
        totale: fattura.totale,
      },
      emittente: {
        ragioneSociale: tenant.ragioneSociale,
        partitaIva: tenant.partitaIva,
        codiceFiscale: tenant.codiceFiscale,
        indirizzo: tenant.indirizzo,
        citta: tenant.citta,
        cap: tenant.cap,
        provincia: tenant.provincia,
        telefono: tenant.telefono,
        email: tenant.email,
        pec: tenant.pec,
      },
      cliente: {
        ragioneSociale: cliente.ragioneSociale,
        partitaIva: cliente.partitaIva,
        codiceFiscale: cliente.codiceFiscale,
        indirizzo: cliente.indirizzo,
        citta: cliente.citta,
        cap: cliente.cap,
        provincia: cliente.provincia,
        pec: cliente.pec,
        codiceDestinatario: cliente.codiceDestinatario,
      },
      progressivoInvio,
      regimeFiscale: config?.regimeFiscale || 'RF01',
      modalitaPagamento: config?.modalitaPagamentoDefault || 'MP05',
      ibanBeneficiario: config?.ibanBeneficiario || undefined,
    });

    const xml = generateFatturaPA(datiFattura);
    const nomeFile = `IT${tenant.partitaIva}_${progressivoInvio}.xml`;

    // 5. Invia tramite provider
    const result = await provider.inviaFattura({
      xml,
      nomeFile,
      fatturaId,
      tenantId,
    });

    if (!result.success) {
      // Errore invio — non cambiare stato, logga errore
      await dal.createLogSdi({
        id: genId('log-sdi'),
        fatturaId,
        tenantId,
        azione: 'invio',
        stato: 'errore',
        dettagli: { error: result.error, provider: providerType },
        data: new Date().toISOString(),
      });
      return { ok: false, error: result.error || 'Errore durante l\'invio al SDI' };
    }

    // 6. Successo — aggiorna fattura
    const now = new Date().toISOString();
    const notificheSDI = [
      ...(fattura.notificheSDI || []),
      { tipo: 'Invio', data: now, descrizione: `Fattura inviata al SDI tramite provider ${providerType}` },
    ];

    await dal.updateFatturaSDI(fatturaId, {
      statoSDI: 'inviata',
      sdiIdentificativo: result.sdiIdentificativo || null,
      sdiProgressivoInvio: progressivoInvio,
      sdiDataInvio: now,
      sdiErroreDettaglio: null,
      xmlRiferimento: nomeFile,
      notificheSDI,
    });

    // 7. Log successo
    await dal.createLogSdi({
      id: genId('log-sdi'),
      fatturaId,
      tenantId,
      azione: 'invio',
      stato: 'successo',
      dettagli: {
        sdiIdentificativo: result.sdiIdentificativo,
        provider: providerType,
        nomeFile,
      },
      data: now,
    });

    revalidatePath('/dashboard/fatture');
    return { ok: true, data: { sdiIdentificativo: result.sdiIdentificativo } };
  } catch (e) {
    console.error('Errore inviaFatturaSDI:', e);
    return { ok: false, error: String(e) };
  }
}

// ==================== VALIDAZIONE PRE-INVIO ====================

/**
 * Valida una fattura senza inviarla. Ritorna errori di validazione.
 */
export async function validaFatturaPerSDI(fatturaId: string, tenantId: string): Promise<ActionResult> {
  try {
    const dal = await import('../db/dal');
    const { validateFatturaPerSDI } = await import('../sdi/validation');

    const fattura = await dal.getFatturaById(fatturaId);
    if (!fattura) return { ok: false, error: 'Fattura non trovata' };

    const tenant = await dal.getTenantById(tenantId);
    if (!tenant) return { ok: false, error: 'Tenant non trovato' };

    const cliente = await dal.getClienteById(fattura.clienteId);
    if (!cliente) return { ok: false, error: 'Cliente non trovato' };

    const validation = validateFatturaPerSDI({
      fattura: {
        numero: fattura.numero,
        data: fattura.data,
        righe: (fattura.righe || []).map(r => ({
          nome: r.nome,
          quantita: r.quantita,
          prezzoUnitario: r.prezzoUnitario,
          iva: r.iva,
          totale: r.totale,
        })),
        subtotale: fattura.subtotale,
        totale: fattura.totale,
      },
      tenant: {
        ragioneSociale: tenant.ragioneSociale,
        partitaIva: tenant.partitaIva,
        codiceFiscale: tenant.codiceFiscale,
        indirizzo: tenant.indirizzo,
        citta: tenant.citta,
        cap: tenant.cap,
        provincia: tenant.provincia,
        pec: tenant.pec,
      },
      cliente: {
        ragioneSociale: cliente.ragioneSociale,
        partitaIva: cliente.partitaIva,
        codiceFiscale: cliente.codiceFiscale,
        indirizzo: cliente.indirizzo,
        citta: cliente.citta,
        cap: cliente.cap,
        provincia: cliente.provincia,
        pec: cliente.pec,
        codiceDestinatario: cliente.codiceDestinatario,
      },
    });

    if (!validation.valido) {
      return { ok: false, error: 'Validazione fallita', errori: validation.errori };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== REINVIO FATTURA ====================

/**
 * Reinvia una fattura scartata dopo correzione.
 */
export async function reinviaFatturaSDI(fatturaId: string, tenantId: string): Promise<ActionResult> {
  try {
    const dal = await import('../db/dal');
    const fattura = await dal.getFatturaById(fatturaId);
    if (!fattura) return { ok: false, error: 'Fattura non trovata' };

    if (fattura.statoSDI !== 'scartata' && fattura.statoSDI !== 'rifiutata') {
      return { ok: false, error: 'Solo le fatture scartate o rifiutate possono essere reinviate' };
    }

    // Reset stato e reinvia
    await dal.updateFatturaSDI(fatturaId, {
      statoSDI: 'bozza',
      sdiErroreDettaglio: null,
    });

    // Log reinvio
    await dal.createLogSdi({
      id: genId('log-sdi'),
      fatturaId,
      tenantId,
      azione: 'reinvio',
      stato: 'successo',
      dettagli: { statoPrec: fattura.statoSDI },
      data: new Date().toISOString(),
    });

    // Invia nuovamente
    return inviaFatturaSDI(fatturaId, tenantId);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== CONTROLLO STATO MANUALE ====================

/**
 * Polling manuale dello stato di una singola fattura.
 */
export async function controllaStatoSDI(fatturaId: string): Promise<ActionResult> {
  try {
    const dal = await import('../db/dal');
    const { getSDIProvider } = await import('../sdi/index');

    const fattura = await dal.getFatturaById(fatturaId);
    if (!fattura) return { ok: false, error: 'Fattura non trovata' };

    if (!fattura.sdiIdentificativo || !fattura.sdiDataInvio) {
      return { ok: false, error: 'Fattura non ancora inviata al SDI' };
    }

    const config = await dal.getConfigurazioneSdi(fattura.tenantId);
    const provider = getSDIProvider(config?.provider || 'simulato');

    const result = await provider.controllaStato(fattura.sdiIdentificativo, fattura.sdiDataInvio);

    // Aggiorna solo se lo stato è cambiato
    if (result.stato !== fattura.statoSDI) {
      const notificheSDI = [
        ...(fattura.notificheSDI || []),
        ...result.notifiche.filter(n =>
          !(fattura.notificheSDI || []).some(existing => existing.tipo === n.tipo && existing.data === n.data)
        ),
      ];

      await dal.updateFatturaSDI(fatturaId, {
        statoSDI: result.stato,
        notificheSDI,
        sdiErroreDettaglio: result.erroreDettaglio || null,
      });

      await dal.createLogSdi({
        id: genId('log-sdi'),
        fatturaId,
        tenantId: fattura.tenantId,
        azione: 'polling',
        stato: 'successo',
        dettagli: { statoPrecedente: fattura.statoSDI, statoNuovo: result.stato },
        data: new Date().toISOString(),
      });
    }

    revalidatePath('/dashboard/fatture');
    return { ok: true, data: { stato: result.stato, notifiche: result.notifiche } };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== CONFIGURAZIONE SDI ====================

/**
 * Salva o aggiorna la configurazione SDI di un tenant.
 */
export async function salvaConfigurazioneSdi(tenantId: string, config: {
  provider: 'simulato' | 'fattura24' | 'fattureincloud' | 'manuale';
  apiKey?: string;
  apiSecret?: string;
  attivo?: boolean;
  regimeFiscale?: string;
  modalitaPagamentoDefault?: string;
  ibanBeneficiario?: string;
}): Promise<ActionResult> {
  try {
    const dal = await import('../db/dal');
    const now = new Date().toISOString();

    const existing = await dal.getConfigurazioneSdi(tenantId);

    if (existing) {
      await dal.updateConfigurazioneSdi(existing.id, {
        provider: config.provider,
        apiKey: config.apiKey || null,
        apiSecret: config.apiSecret || null,
        attivo: config.attivo ?? true,
        regimeFiscale: config.regimeFiscale || 'RF01',
        modalitaPagamentoDefault: config.modalitaPagamentoDefault || 'MP05',
        ibanBeneficiario: config.ibanBeneficiario || null,
        dataAggiornamento: now,
      });
    } else {
      await dal.createConfigurazioneSdi({
        id: genId('cfg-sdi'),
        tenantId,
        provider: config.provider,
        apiKey: config.apiKey || null,
        apiSecret: config.apiSecret || null,
        attivo: config.attivo ?? true,
        regimeFiscale: config.regimeFiscale || 'RF01',
        modalitaPagamentoDefault: config.modalitaPagamentoDefault || 'MP05',
        ibanBeneficiario: config.ibanBeneficiario || null,
        dataCreazione: now,
        dataAggiornamento: now,
      });
    }

    revalidatePath('/dashboard/impostazioni');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Recupera la configurazione SDI di un tenant.
 */
export async function fetchConfigurazioneSdi(tenantId: string) {
  const dal = await import('../db/dal');
  return dal.getConfigurazioneSdi(tenantId);
}
