'use server';

import * as dal from '../db/dal';
import { nexiClient, paypalClient, generateOrderId, generateContractId, getBonificoInfo, getAvailablePaymentMethods } from '../payments';
import type { MetodoPagamentoPiattaforma, CicloPagamento, PianoAbbonamento } from '../types';

// ==================== QUERY ====================

export async function fetchAbbonamenti() {
  return dal.getAbbonamenti();
}

export async function fetchAbbonamentoByTenantId(tenantId: string) {
  return dal.getAbbonamentoByTenantId(tenantId);
}

export async function fetchTransazioniPiattaforma() {
  return dal.getTransazioniPiattaforma();
}

export async function fetchTransazioniByTenantId(tenantId: string) {
  return dal.getTransazioniByTenantId(tenantId);
}

export async function fetchMetodiPagamentoDisponibili() {
  return getAvailablePaymentMethods();
}

export async function fetchInfoBonifico() {
  return getBonificoInfo();
}

// ==================== CHECKOUT ====================

interface CheckoutResult {
  success: boolean;
  redirectUrl?: string;
  abbonamentoId?: string;
  error?: string;
  bonificoInfo?: {
    iban: string;
    intestatario: string;
    banca: string;
    causale: string;
    importo: number;
  };
}

/**
 * Avvia il processo di checkout per un nuovo abbonamento.
 */
export async function iniziaCheckout(params: {
  tenantId: string;
  pianoId: PianoAbbonamento;
  cicloPagamento: CicloPagamento;
  metodoPagamento: MetodoPagamentoPiattaforma;
  utentiAggiuntivi?: number;
}): Promise<CheckoutResult> {
  const { tenantId, pianoId, cicloPagamento, metodoPagamento, utentiAggiuntivi = 0 } = params;

  // Recupera il piano
  const piani = await dal.getPiani();
  const piano = piani.find(p => p.id === pianoId);
  if (!piano) {
    return { success: false, error: 'Piano non trovato' };
  }

  // Calcola importo
  const importoBase = cicloPagamento === 'mensile' ? piano.prezzoMensile : piano.prezzoAnnuale;
  const costoUtentiAgg = utentiAggiuntivi * 19; // €19/mese per utente aggiuntivo
  const importoTotale = importoBase + costoUtentiAgg;

  // Genera IDs
  const abbonamentoId = `abb-${crypto.randomUUID().slice(0, 8)}`;
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  // Crea abbonamento in stato pending
  const dataFine = new Date();
  if (cicloPagamento === 'mensile') {
    dataFine.setMonth(dataFine.getMonth() + 1);
  } else {
    dataFine.setFullYear(dataFine.getFullYear() + 1);
  }

  await dal.createAbbonamento({
    id: abbonamentoId,
    tenantId,
    pianoId,
    stato: 'in_attesa_pagamento',
    metodoPagamento,
    cicloPagamento,
    dataInizio: now,
    dataFine: dataFine.toISOString(),
    prossimoRinnovo: dataFine.toISOString(),
    importoBase: importoBase.toString(),
    utentiAggiuntivi,
    costoUtentiAggiuntivi: costoUtentiAgg.toString(),
    importoTotale: importoTotale.toString(),
    dataCreazione: now,
    dataAggiornamento: now,
  });

  // Crea transazione pending
  const transazioneId = `trx-${crypto.randomUUID().slice(0, 8)}`;
  await dal.createTransazione({
    id: transazioneId,
    abbonamentoId,
    tenantId,
    importo: importoTotale.toString(),
    valuta: 'EUR',
    stato: 'pending',
    metodoPagamento,
    riferimentoEsterno: orderId,
    descrizione: `Attivazione ${piano.nome} - ${cicloPagamento}`,
    data: now,
  });

  // Gestisci in base al metodo di pagamento
  switch (metodoPagamento) {
    case 'nexi':
      return handleNexiCheckout({
        orderId,
        amount: importoTotale,
        pianoNome: piano.nome,
        tenantId,
        abbonamentoId,
        cicloPagamento,
      });

    case 'paypal':
      return handlePayPalCheckout({
        orderId,
        amount: importoTotale,
        pianoNome: piano.nome,
        tenantId,
        abbonamentoId,
        cicloPagamento,
      });

    case 'bonifico':
      return handleBonificoCheckout({
        orderId,
        amount: importoTotale,
        pianoNome: piano.nome,
        abbonamentoId,
      });

    default:
      return { success: false, error: 'Metodo di pagamento non supportato' };
  }
}

// ==================== NEXI CHECKOUT ====================

async function handleNexiCheckout(params: {
  orderId: string;
  amount: number;
  pianoNome: string;
  tenantId: string;
  abbonamentoId: string;
  cicloPagamento: CicloPagamento;
}): Promise<CheckoutResult> {
  if (!nexiClient.isConfigured) {
    return { success: false, error: 'NexiPay non è ancora configurato. Contatta l\'amministratore.' };
  }

  const contractId = generateContractId(params.tenantId);

  // Salva il contractId nell'abbonamento
  await dal.updateAbbonamento(params.abbonamentoId, {
    nexiContractId: contractId,
  });

  const request = nexiClient.buildSubscriptionRequest({
    orderId: params.orderId,
    amount: params.amount,
    pianoNome: params.pianoNome,
    tenantId: params.tenantId,
    contractId,
    cicloPagamento: params.cicloPagamento,
  });

  try {
    const response = await nexiClient.createHppPayment(request);
    return {
      success: true,
      redirectUrl: response.hostedPage,
      abbonamentoId: params.abbonamentoId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore durante la creazione del pagamento Nexi';
    return { success: false, error: message };
  }
}

// ==================== PAYPAL CHECKOUT ====================

async function handlePayPalCheckout(params: {
  orderId: string;
  amount: number;
  pianoNome: string;
  tenantId: string;
  abbonamentoId: string;
  cicloPagamento: CicloPagamento;
}): Promise<CheckoutResult> {
  if (!paypalClient.isConfigured) {
    return { success: false, error: 'PayPal non è ancora configurato. Contatta l\'amministratore.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Usa l'API Orders per un pagamento diretto
    const order = await paypalClient.createOrder({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.orderId,
        custom_id: params.tenantId,
        description: `Sapunto ${params.pianoNome} - ${params.cicloPagamento === 'mensile' ? 'Abbonamento Mensile' : 'Abbonamento Annuale'}`,
        amount: {
          currency_code: 'EUR',
          value: params.amount.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'Sapunto',
        locale: 'it-IT',
        return_url: `${appUrl}/checkout/result?provider=paypal&orderId=${params.orderId}&abbonamentoId=${params.abbonamentoId}`,
        cancel_url: `${appUrl}/checkout/cancel`,
      },
    });

    // Salva il PayPal order ID
    await dal.updateAbbonamento(params.abbonamentoId, {
      paypalSubscriptionId: order.id,
    });

    // Trova l'URL di approvazione
    const approveLink = order.links.find(l => l.rel === 'approve');
    if (!approveLink) {
      return { success: false, error: 'Impossibile ottenere il link di pagamento PayPal' };
    }

    return {
      success: true,
      redirectUrl: approveLink.href,
      abbonamentoId: params.abbonamentoId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore durante la creazione del pagamento PayPal';
    return { success: false, error: message };
  }
}

// ==================== BONIFICO CHECKOUT ====================

async function handleBonificoCheckout(params: {
  orderId: string;
  amount: number;
  pianoNome: string;
  abbonamentoId: string;
}): Promise<CheckoutResult> {
  const info = getBonificoInfo();

  // Aggiorna stato abbonamento a "in attesa conferma"
  await dal.updateAbbonamento(params.abbonamentoId, {
    riferimentoBonifico: params.orderId,
  });

  return {
    success: true,
    abbonamentoId: params.abbonamentoId,
    bonificoInfo: {
      iban: info.iban,
      intestatario: info.intestatario,
      banca: info.banca,
      causale: `Sapunto ${params.pianoNome} - Rif. ${params.orderId}`,
      importo: params.amount,
    },
  };
}

// ==================== CONFERMA PAGAMENTI ====================

/**
 * Conferma un pagamento (chiamato dai webhook o dall'admin per bonifici).
 */
export async function confermaPagamento(params: {
  riferimentoEsterno: string;
  operationId?: string;
  dettagliRisposta?: Record<string, unknown>;
}) {
  const transazione = await dal.getTransazioneByRiferimentoEsterno(params.riferimentoEsterno);
  if (!transazione) {
    throw new Error(`Transazione non trovata per riferimento: ${params.riferimentoEsterno}`);
  }

  const now = new Date().toISOString();

  // Aggiorna transazione
  await dal.updateTransazione(transazione.id, {
    stato: 'completata',
    dataConferma: now,
    nexiOperationId: params.operationId,
    dettagliRisposta: params.dettagliRisposta,
  });

  // Attiva l'abbonamento
  await dal.updateAbbonamento(transazione.abbonamentoId, {
    stato: 'attivo',
  });

  // Aggiorna stato tenant
  const abbonamento = await dal.getAbbonamentoById(transazione.abbonamentoId);
  if (abbonamento) {
    // Aggiorna il tenant con il piano e lo stato
    await dal.updateTenantPiano(abbonamento.tenantId, abbonamento.pianoId, 'attivo');
  }
}

/**
 * Segna un pagamento come fallito.
 */
export async function segnaTransazioneFallita(params: {
  riferimentoEsterno: string;
  dettagliRisposta?: Record<string, unknown>;
}) {
  const transazione = await dal.getTransazioneByRiferimentoEsterno(params.riferimentoEsterno);
  if (!transazione) return;

  await dal.updateTransazione(transazione.id, {
    stato: 'fallita',
    dettagliRisposta: params.dettagliRisposta,
  });
}

// ==================== ADMIN ACTIONS ====================

/**
 * Conferma manuale di un bonifico (azione admin/superadmin).
 */
export async function confermaBonifico(abbonamentoId: string) {
  const abbonamento = await dal.getAbbonamentoById(abbonamentoId);
  if (!abbonamento) {
    return { success: false, error: 'Abbonamento non trovato' };
  }

  if (!abbonamento.riferimentoBonifico) {
    return { success: false, error: 'Nessun riferimento bonifico trovato' };
  }

  await confermaPagamento({
    riferimentoEsterno: abbonamento.riferimentoBonifico,
    dettagliRisposta: { tipo: 'conferma_manuale_bonifico', data: new Date().toISOString() },
  });

  return { success: true };
}

/**
 * Cattura un pagamento PayPal dopo l'approvazione del cliente.
 */
export async function capturePayPalPayment(paypalOrderId: string, sapuntoOrderId: string) {
  if (!paypalClient.isConfigured) {
    return { success: false, error: 'PayPal non configurato' };
  }

  try {
    const capture = await paypalClient.captureOrder(paypalOrderId);

    if (capture.status === 'COMPLETED') {
      await confermaPagamento({
        riferimentoEsterno: sapuntoOrderId,
        dettagliRisposta: capture as unknown as Record<string, unknown>,
      });
      return { success: true };
    } else {
      return { success: false, error: `Pagamento PayPal non completato: ${capture.status}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore PayPal';
    return { success: false, error: message };
  }
}