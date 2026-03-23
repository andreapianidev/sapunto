'use server';

import * as dal from '../db/dal';
import { revalidatePath } from 'next/cache';

// ==================== PIANI ====================
export async function fetchPiani() {
  return dal.getPiani();
}

// ==================== TENANTS ====================
export async function fetchTenants() {
  return dal.getTenants();
}

export async function fetchTenantById(id: string) {
  return dal.getTenantById(id);
}

// ==================== USERS ====================
export async function fetchUsers() {
  return dal.getUsers();
}

export async function fetchUsersByTenantId(tenantId: string) {
  return dal.getUsersByTenantId(tenantId);
}

export async function fetchUserById(id: string) {
  return dal.getUserById(id);
}

// ==================== CLIENTI ====================
export async function fetchClienti(tenantId: string) {
  return dal.getClienti(tenantId);
}

export async function fetchClienteById(id: string) {
  return dal.getClienteById(id);
}

// ==================== PRODOTTI ====================
export async function fetchProdotti(tenantId: string) {
  return dal.getProdotti(tenantId);
}

// ==================== ORDINI ====================
export async function fetchOrdini(tenantId: string) {
  return dal.getOrdini(tenantId);
}

export async function fetchOrdiniByClienteId(tenantId: string, clienteId: string) {
  return dal.getOrdiniByClienteId(tenantId, clienteId);
}

// ==================== FATTURE ====================
export async function fetchFatture(tenantId: string) {
  return dal.getFatture(tenantId);
}

export async function fetchFattureByClienteId(tenantId: string, clienteId: string) {
  return dal.getFattureByClienteId(tenantId, clienteId);
}

// ==================== DIPENDENTI ====================
export async function fetchDipendenti(tenantId: string) {
  return dal.getDipendenti(tenantId);
}

// ==================== CEDOLINI ====================
export async function fetchCedolini(tenantId: string) {
  return dal.getCedolini(tenantId);
}

// ==================== APPUNTAMENTI ====================
export async function fetchAppuntamenti(tenantId: string) {
  return dal.getAppuntamenti(tenantId);
}

// ==================== EMAILS ====================
export async function fetchEmails(tenantId: string) {
  return dal.getEmails(tenantId);
}

// ==================== MOVIMENTI MAGAZZINO ====================
export async function fetchMovimentiMagazzino(tenantId: string) {
  return dal.getMovimentiMagazzino(tenantId);
}

// ==================== INTEGRAZIONI E-COMMERCE ====================
export async function fetchIntegrazioniEcommerce(tenantId: string) {
  return dal.getIntegrazioniEcommerce(tenantId);
}

// ==================== LOG SYNC ====================
export async function fetchLogSync() {
  return dal.getLogSync();
}

// ==================== PREVENTIVI ====================
export async function fetchPreventivi(tenantId: string) {
  return dal.getPreventivi(tenantId);
}

// ==================== LEADS ====================
export async function fetchLeads(tenantId: string) {
  return dal.getLeads(tenantId);
}

// ==================== PROGETTI ====================
export async function fetchProgetti(tenantId: string) {
  return dal.getProgetti(tenantId);
}

// ==================== TASKS ====================
export async function fetchTasks(tenantId: string) {
  return dal.getTasks(tenantId);
}

// ==================== TICKETS ====================
export async function fetchTickets(tenantId: string) {
  return dal.getTickets(tenantId);
}

// ==================== CONTRATTI ====================
export async function fetchContratti(tenantId: string) {
  return dal.getContratti(tenantId);
}

// ==================== SPESE ====================
export async function fetchSpese(tenantId: string) {
  return dal.getSpese(tenantId);
}

// ==================== NOTE DI CREDITO ====================
export async function fetchNoteDiCredito(tenantId: string) {
  return dal.getNoteDiCredito(tenantId);
}

// ==================== ABBONAMENTI E TRANSAZIONI ====================

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

// ==================== STATISTICHE AGGREGATE ====================

export async function fetchVenditeMensili(tenantId: string) {
  const ordiniData = await dal.getOrdini(tenantId);
  const mesiMap = new Map<string, { fatturato: number; ordini: number }>();

  for (const o of ordiniData) {
    if (o.stato === 'annullato') continue;
    const date = new Date(o.data);
    const mese = date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = mesiMap.get(key) || { fatturato: 0, ordini: 0 };
    existing.fatturato += o.totale;
    existing.ordini += 1;
    mesiMap.set(key, existing);
  }

  const monthNames: Record<string, string> = {
    '01': 'Gen', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mag', '06': 'Giu',
    '07': 'Lug', '08': 'Ago', '09': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic',
  };

  return Array.from(mesiMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => {
      const [year, month] = key.split('-');
      return {
        mese: `${monthNames[month]} ${year.slice(-2)}`,
        fatturato: Math.round(val.fatturato),
        ordini: val.ordini,
      };
    });
}

export async function fetchTopClienti(tenantId: string) {
  const ordiniData = await dal.getOrdini(tenantId);
  const clienteMap = new Map<string, number>();

  for (const o of ordiniData) {
    if (o.stato === 'annullato') continue;
    const existing = clienteMap.get(o.clienteNome) || 0;
    clienteMap.set(o.clienteNome, existing + o.totale);
  }

  return Array.from(clienteMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nome, fatturato]) => ({ nome, fatturato: Math.round(fatturato) }));
}

export async function fetchOrdiniPerCanale(tenantId: string) {
  const ordiniData = await dal.getOrdini(tenantId);
  const canaleMap = new Map<string, number>();
  const canaleLabels: Record<string, string> = {
    diretto: 'Diretto', woocommerce: 'WooCommerce', prestashop: 'PrestaShop',
    telefono: 'Telefono', email: 'Email',
  };

  for (const o of ordiniData) {
    if (o.stato === 'annullato') continue;
    const label = canaleLabels[o.canale] || o.canale;
    const existing = canaleMap.get(label) || 0;
    canaleMap.set(label, existing + 1);
  }

  const total = Array.from(canaleMap.values()).reduce((s, v) => s + v, 0);
  return Array.from(canaleMap.entries()).map(([canale, count]) => ({
    canale,
    valore: Math.round((count / total) * 100),
  }));
}

export async function fetchStatsPiattaforma() {
  const allTenants = await dal.getTenants();
  const allUsers = await dal.getUsers();
  const pianiData = await dal.getPiani();

  const tenantAttivi = allTenants.filter(t => t.stato === 'attivo').length;
  const utentiTotali = allUsers.length;

  let mrr = 0;
  for (const t of allTenants) {
    if (t.stato !== 'attivo') continue;
    const piano = pianiData.find(p => p.id === t.piano);
    if (piano) mrr += piano.prezzoMensile;
  }

  return {
    tenantAttivi,
    utentiTotali,
    mrr,
    mrrTrend: [
      { mese: 'Ott 25', mrr: 128 },
      { mese: 'Nov 25', mrr: 128 },
      { mese: 'Dic 25', mrr: 158 },
      { mese: 'Gen 26', mrr: Math.round(mrr) },
      { mese: 'Feb 26', mrr: Math.round(mrr) },
      { mese: 'Mar 26', mrr: Math.round(mrr) },
    ],
    crescitaUtenti: [
      { mese: 'Ott 25', utenti: 14 },
      { mese: 'Nov 25', utenti: 16 },
      { mese: 'Dic 25', utenti: 19 },
      { mese: 'Gen 26', utenti: 21 },
      { mese: 'Feb 26', utenti: utentiTotali },
      { mese: 'Mar 26', utenti: utentiTotali },
    ],
    churnRate: 0,
  };
}

// ==================== CRUD ACTIONS ====================

type ActionResult = { ok: true } | { ok: false; error: string };

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ==================== CLIENTI CRUD ====================

export async function createCliente(data: {
  tenantId: string;
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  email: string;
  telefono: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  tipo: 'azienda' | 'privato';
  pec?: string;
  codiceDestinatario?: string;
  referente?: string;
  note?: string;
  tags?: string[];
}): Promise<ActionResult> {
  try {
    await dal.createCliente({
      id: genId('cl'),
      tenantId: data.tenantId,
      ragioneSociale: data.ragioneSociale,
      partitaIva: data.partitaIva,
      codiceFiscale: data.codiceFiscale,
      email: data.email,
      telefono: data.telefono,
      indirizzo: data.indirizzo,
      citta: data.citta,
      cap: data.cap,
      provincia: data.provincia,
      tipo: data.tipo,
      pec: data.pec,
      codiceDestinatario: data.codiceDestinatario,
      referente: data.referente,
      note: data.note,
      tags: data.tags || [],
      dataCreazione: new Date().toISOString().split('T')[0],
    });
    revalidatePath('/dashboard/clienti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateCliente(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateCliente(id, data as Parameters<typeof dal.updateCliente>[1]);
    revalidatePath('/dashboard/clienti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    await dal.deleteCliente(id);
    revalidatePath('/dashboard/clienti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== PRODOTTI CRUD ====================

export async function createProdotto(data: {
  tenantId: string;
  nome: string;
  sku: string;
  descrizione: string;
  prezzo: string;
  prezzoAcquisto: string;
  giacenza: number;
  scorteMinime: number;
  categoria: string;
  unita: string;
  iva: number;
}): Promise<ActionResult> {
  try {
    await dal.createProdotto({
      id: genId('prod'),
      tenantId: data.tenantId,
      nome: data.nome,
      sku: data.sku,
      descrizione: data.descrizione,
      prezzo: data.prezzo,
      prezzoAcquisto: data.prezzoAcquisto,
      giacenza: data.giacenza,
      scorteMinime: data.scorteMinime,
      categoria: data.categoria,
      unita: data.unita,
      iva: data.iva,
      attivo: true,
    });
    revalidatePath('/dashboard/magazzino');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateProdotto(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateProdotto(id, data as Parameters<typeof dal.updateProdotto>[1]);
    revalidatePath('/dashboard/magazzino');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteProdotto(id: string): Promise<ActionResult> {
  try {
    await dal.deleteProdotto(id);
    revalidatePath('/dashboard/magazzino');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== ORDINI CRUD ====================

export async function createOrdine(data: {
  tenantId: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  stato: 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';
  righe: { prodottoId: string; nome: string; quantita: number; prezzoUnitario: number; iva: number; totale: number }[];
  subtotale: string;
  iva: string;
  totale: string;
  canale: 'diretto' | 'woocommerce' | 'prestashop' | 'telefono' | 'email';
  note?: string;
}): Promise<ActionResult> {
  try {
    const numero = await dal.getNextOrdineNumber(data.tenantId);
    await dal.createOrdine({
      id: genId('ord'),
      tenantId: data.tenantId,
      numero,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      stato: data.stato,
      righe: data.righe,
      subtotale: data.subtotale,
      iva: data.iva,
      totale: data.totale,
      canale: data.canale,
      note: data.note,
    });
    revalidatePath('/dashboard/ordini');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateOrdine(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateOrdine(id, data as Parameters<typeof dal.updateOrdine>[1]);
    revalidatePath('/dashboard/ordini');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteOrdine(id: string): Promise<ActionResult> {
  try {
    await dal.deleteOrdine(id);
    revalidatePath('/dashboard/ordini');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== FATTURE CRUD ====================

export async function createFattura(data: {
  tenantId: string;
  tipo: 'emessa' | 'ricevuta';
  clienteId: string;
  clienteNome: string;
  data: string;
  dataScadenza: string;
  stato: 'pagata' | 'non_pagata' | 'scaduta' | 'parziale';
  statoSDI: 'bozza' | 'inviata' | 'consegnata' | 'scartata' | 'in_attesa' | 'accettata' | 'rifiutata';
  righe: { prodottoId: string; nome: string; quantita: number; prezzoUnitario: number; iva: number; totale: number }[];
  subtotale: string;
  iva: string;
  totale: string;
  ordineId?: string;
}): Promise<ActionResult> {
  try {
    const numero = await dal.getNextFatturaNumber(data.tenantId);
    await dal.createFattura({
      id: genId('fat'),
      tenantId: data.tenantId,
      numero,
      tipo: data.tipo,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      dataScadenza: data.dataScadenza,
      stato: data.stato,
      statoSDI: data.statoSDI,
      notificheSDI: [],
      righe: data.righe,
      subtotale: data.subtotale,
      iva: data.iva,
      totale: data.totale,
      ordineId: data.ordineId,
    });
    revalidatePath('/dashboard/fatture');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateFattura(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateFattura(id, data as Parameters<typeof dal.updateFattura>[1]);
    revalidatePath('/dashboard/fatture');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteFattura(id: string): Promise<ActionResult> {
  try {
    await dal.deleteFattura(id);
    revalidatePath('/dashboard/fatture');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== PREVENTIVI CRUD ====================

export async function createPreventivo(data: {
  tenantId: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  dataScadenza: string;
  stato: 'bozza' | 'inviato' | 'accettato' | 'rifiutato' | 'scaduto';
  oggetto: string;
  righe: { prodottoId: string; nome: string; quantita: number; prezzoUnitario: number; iva: number; totale: number }[];
  subtotale: string;
  iva: string;
  totale: string;
  note?: string;
}): Promise<ActionResult> {
  try {
    const numero = await dal.getNextPreventivoNumber(data.tenantId);
    await dal.createPreventivo({
      id: genId('prv'),
      tenantId: data.tenantId,
      numero,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      dataScadenza: data.dataScadenza,
      stato: data.stato,
      oggetto: data.oggetto,
      righe: data.righe,
      subtotale: data.subtotale,
      iva: data.iva,
      totale: data.totale,
      note: data.note,
    });
    revalidatePath('/dashboard/preventivi');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updatePreventivo(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updatePreventivo(id, data as Parameters<typeof dal.updatePreventivo>[1]);
    revalidatePath('/dashboard/preventivi');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deletePreventivo(id: string): Promise<ActionResult> {
  try {
    await dal.deletePreventivo(id);
    revalidatePath('/dashboard/preventivi');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== LEAD CRUD ====================

export async function createLead(data: {
  tenantId: string;
  azienda: string;
  referente: string;
  email: string;
  telefono: string;
  fonte: 'sito_web' | 'referral' | 'fiera' | 'social' | 'cold_call' | 'altro';
  fase: 'nuovo' | 'contattato' | 'qualificato' | 'proposta' | 'negoziazione' | 'vinto' | 'perso';
  valore: string;
  probabilita: number;
  assegnatoA: string;
  assegnatoNome: string;
  dataChiusuraPrevista: string;
  note?: string;
}): Promise<ActionResult> {
  try {
    await dal.createLead({
      id: genId('lead'),
      tenantId: data.tenantId,
      azienda: data.azienda,
      referente: data.referente,
      email: data.email,
      telefono: data.telefono,
      fonte: data.fonte,
      fase: data.fase,
      valore: data.valore,
      probabilita: data.probabilita,
      assegnatoA: data.assegnatoA,
      assegnatoNome: data.assegnatoNome,
      dataCreazione: new Date().toISOString().split('T')[0],
      dataChiusuraPrevista: data.dataChiusuraPrevista,
      note: data.note,
    });
    revalidatePath('/dashboard/lead');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateLead(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateLead(id, data as Parameters<typeof dal.updateLead>[1]);
    revalidatePath('/dashboard/lead');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    await dal.deleteLead(id);
    revalidatePath('/dashboard/lead');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== CONTRATTI CRUD ====================

export async function createContratto(data: {
  tenantId: string;
  clienteId: string;
  clienteNome: string;
  oggetto: string;
  tipo: 'servizio' | 'fornitura' | 'manutenzione' | 'consulenza' | 'altro';
  stato: 'bozza' | 'attivo' | 'scaduto' | 'rinnovato' | 'rescisso';
  dataInizio: string;
  dataFine: string;
  valoreAnnuale: string;
  rinnovo: 'automatico' | 'manuale';
  note?: string;
}): Promise<ActionResult> {
  try {
    const numero = await dal.getNextContrattoNumber(data.tenantId);
    await dal.createContratto({
      id: genId('ctr'),
      tenantId: data.tenantId,
      numero,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      oggetto: data.oggetto,
      tipo: data.tipo,
      stato: data.stato,
      dataInizio: data.dataInizio,
      dataFine: data.dataFine,
      valoreAnnuale: data.valoreAnnuale,
      rinnovo: data.rinnovo,
      note: data.note,
    });
    revalidatePath('/dashboard/contratti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateContratto(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateContratto(id, data as Parameters<typeof dal.updateContratto>[1]);
    revalidatePath('/dashboard/contratti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteContratto(id: string): Promise<ActionResult> {
  try {
    await dal.deleteContratto(id);
    revalidatePath('/dashboard/contratti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== NOTE DI CREDITO CRUD ====================

export async function createNotaDiCredito(data: {
  tenantId: string;
  fatturaId: string;
  fatturaNumero: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  motivo: string;
  importo: string;
  iva: string;
  totale: string;
  stato: 'emessa' | 'inviata_sdi' | 'accettata';
}): Promise<ActionResult> {
  try {
    const numero = await dal.getNextNotaCreditoNumber(data.tenantId);
    await dal.createNotaDiCredito({
      id: genId('nc'),
      tenantId: data.tenantId,
      numero,
      fatturaId: data.fatturaId,
      fatturaNumero: data.fatturaNumero,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      motivo: data.motivo,
      importo: data.importo,
      iva: data.iva,
      totale: data.totale,
      stato: data.stato,
    });
    revalidatePath('/dashboard/note-credito');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateNotaDiCredito(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateNotaDiCredito(id, data as Parameters<typeof dal.updateNotaDiCredito>[1]);
    revalidatePath('/dashboard/note-credito');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteNotaDiCredito(id: string): Promise<ActionResult> {
  try {
    await dal.deleteNotaDiCredito(id);
    revalidatePath('/dashboard/note-credito');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== TICKET CRUD ====================

export async function createTicket(data: {
  tenantId: string;
  clienteId?: string;
  clienteNome?: string;
  oggetto: string;
  descrizione: string;
  priorita: 'bassa' | 'media' | 'alta' | 'critica';
  stato: 'aperto' | 'in_lavorazione' | 'in_attesa' | 'risolto' | 'chiuso';
  categoria: string;
  assegnatoA?: string;
  assegnatoNome?: string;
}): Promise<ActionResult> {
  try {
    const numero = await dal.getNextTicketNumber(data.tenantId);
    await dal.createTicket({
      id: genId('tkt'),
      tenantId: data.tenantId,
      numero,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      oggetto: data.oggetto,
      descrizione: data.descrizione,
      priorita: data.priorita,
      stato: data.stato,
      categoria: data.categoria,
      assegnatoA: data.assegnatoA,
      assegnatoNome: data.assegnatoNome,
      dataApertura: new Date().toISOString().split('T')[0],
      risposte: [],
    });
    revalidatePath('/dashboard/ticket');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateTicket(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateTicket(id, data as Parameters<typeof dal.updateTicket>[1]);
    revalidatePath('/dashboard/ticket');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteTicket(id: string): Promise<ActionResult> {
  try {
    await dal.deleteTicket(id);
    revalidatePath('/dashboard/ticket');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== PROGETTI CRUD ====================

export async function createProgetto(data: {
  tenantId: string;
  nome: string;
  clienteId?: string;
  clienteNome?: string;
  stato: 'pianificato' | 'in_corso' | 'in_pausa' | 'completato' | 'annullato';
  dataInizio: string;
  dataFinePrevista: string;
  budget?: string;
  descrizione: string;
  responsabileId: string;
  responsabileNome: string;
}): Promise<ActionResult> {
  try {
    await dal.createProgetto({
      id: genId('prj'),
      tenantId: data.tenantId,
      nome: data.nome,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      stato: data.stato,
      dataInizio: data.dataInizio,
      dataFinePrevista: data.dataFinePrevista,
      budget: data.budget,
      descrizione: data.descrizione,
      responsabileId: data.responsabileId,
      responsabileNome: data.responsabileNome,
      completamento: 0,
    });
    revalidatePath('/dashboard/progetti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateProgetto(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateProgetto(id, data as Parameters<typeof dal.updateProgetto>[1]);
    revalidatePath('/dashboard/progetti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteProgetto(id: string): Promise<ActionResult> {
  try {
    await dal.deleteProgetto(id);
    revalidatePath('/dashboard/progetti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== TASKS CRUD ====================

export async function createTask(data: {
  tenantId: string;
  progettoId: string;
  titolo: string;
  descrizione?: string;
  stato: 'da_fare' | 'in_corso' | 'in_revisione' | 'completato';
  priorita: 'bassa' | 'media' | 'alta' | 'urgente';
  assegnatoA: string;
  assegnatoNome: string;
  dataScadenza: string;
  oreStimate?: number;
}): Promise<ActionResult> {
  try {
    await dal.createTask({
      id: genId('task'),
      tenantId: data.tenantId,
      progettoId: data.progettoId,
      titolo: data.titolo,
      descrizione: data.descrizione,
      stato: data.stato,
      priorita: data.priorita,
      assegnatoA: data.assegnatoA,
      assegnatoNome: data.assegnatoNome,
      dataScadenza: data.dataScadenza,
      oreStimate: data.oreStimate,
    });
    revalidatePath('/dashboard/progetti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateTask(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateTask(id, data as Parameters<typeof dal.updateTask>[1]);
    revalidatePath('/dashboard/progetti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    await dal.deleteTask(id);
    revalidatePath('/dashboard/progetti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== SPESE CRUD ====================

export async function createSpesa(data: {
  tenantId: string;
  descrizione: string;
  categoria: 'trasporti' | 'pasti' | 'alloggio' | 'materiali' | 'servizi' | 'utenze' | 'altro';
  importo: string;
  data: string;
  dipendenteId?: string;
  dipendenteNome?: string;
  clienteId?: string;
  clienteNome?: string;
  progettoId?: string;
  progettoNome?: string;
  stato: 'da_approvare' | 'approvata' | 'rifiutata' | 'rimborsata';
  note?: string;
}): Promise<ActionResult> {
  try {
    await dal.createSpesa({
      id: genId('sp'),
      tenantId: data.tenantId,
      descrizione: data.descrizione,
      categoria: data.categoria,
      importo: data.importo,
      data: data.data,
      dipendenteId: data.dipendenteId,
      dipendenteNome: data.dipendenteNome,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      progettoId: data.progettoId,
      progettoNome: data.progettoNome,
      stato: data.stato,
      note: data.note,
    });
    revalidatePath('/dashboard/spese');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateSpesa(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateSpesa(id, data as Parameters<typeof dal.updateSpesa>[1]);
    revalidatePath('/dashboard/spese');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteSpesa(id: string): Promise<ActionResult> {
  try {
    await dal.deleteSpesa(id);
    revalidatePath('/dashboard/spese');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== DIPENDENTI CRUD ====================

export async function createDipendente(data: {
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
  ralLorda: string;
  livello: string;
  iban: string;
}): Promise<ActionResult> {
  try {
    await dal.createDipendente({
      id: genId('dip'),
      tenantId: data.tenantId,
      nome: data.nome,
      cognome: data.cognome,
      codiceFiscale: data.codiceFiscale,
      dataNascita: data.dataNascita,
      luogoNascita: data.luogoNascita,
      indirizzo: data.indirizzo,
      telefono: data.telefono,
      email: data.email,
      ruoloAziendale: data.ruoloAziendale,
      tipoContratto: data.tipoContratto,
      dataAssunzione: data.dataAssunzione,
      ralLorda: data.ralLorda,
      livello: data.livello,
      iban: data.iban,
    });
    revalidatePath('/dashboard/payroll');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateDipendente(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateDipendente(id, data as Parameters<typeof dal.updateDipendente>[1]);
    revalidatePath('/dashboard/payroll');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteDipendente(id: string): Promise<ActionResult> {
  try {
    await dal.deleteDipendente(id);
    revalidatePath('/dashboard/payroll');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== CEDOLINI CRUD ====================

export async function createCedolino(data: {
  tenantId: string;
  dipendenteId: string;
  mese: number;
  anno: number;
  lordo: string;
  contributiInps: string;
  irpef: string;
  addizionaleRegionale: string;
  addizionaleComunale: string;
  altreRitenute: string;
  netto: string;
}): Promise<ActionResult> {
  try {
    await dal.createCedolino({
      id: genId('ced'),
      tenantId: data.tenantId,
      dipendenteId: data.dipendenteId,
      mese: data.mese,
      anno: data.anno,
      lordo: data.lordo,
      contributiInps: data.contributiInps,
      irpef: data.irpef,
      addizionaleRegionale: data.addizionaleRegionale,
      addizionaleComunale: data.addizionaleComunale,
      altreRitenute: data.altreRitenute,
      netto: data.netto,
      dataEmissione: new Date().toISOString().split('T')[0],
    });
    revalidatePath('/dashboard/payroll');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateCedolino(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateCedolino(id, data as Parameters<typeof dal.updateCedolino>[1]);
    revalidatePath('/dashboard/payroll');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteCedolino(id: string): Promise<ActionResult> {
  try {
    await dal.deleteCedolino(id);
    revalidatePath('/dashboard/payroll');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== APPUNTAMENTI CRUD ====================

export async function createAppuntamento(data: {
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
}): Promise<ActionResult> {
  try {
    await dal.createAppuntamento({
      id: genId('app'),
      tenantId: data.tenantId,
      titolo: data.titolo,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      operatoreId: data.operatoreId,
      operatoreNome: data.operatoreNome,
      data: data.data,
      oraInizio: data.oraInizio,
      oraFine: data.oraFine,
      stato: data.stato,
      luogo: data.luogo,
      note: data.note,
    });
    revalidatePath('/dashboard/appuntamenti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateAppuntamento(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateAppuntamento(id, data as Parameters<typeof dal.updateAppuntamento>[1]);
    revalidatePath('/dashboard/appuntamenti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteAppuntamento(id: string): Promise<ActionResult> {
  try {
    await dal.deleteAppuntamento(id);
    revalidatePath('/dashboard/appuntamenti');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== EMAILS CRUD ====================

export async function createEmailRecord(data: {
  tenantId: string;
  da: string;
  a: string;
  oggetto: string;
  corpo: string;
  tipo: 'ricevuta' | 'inviata' | 'bozza';
  clienteId?: string;
  clienteNome?: string;
}): Promise<ActionResult> {
  try {
    await dal.createEmail({
      id: genId('em'),
      tenantId: data.tenantId,
      da: data.da,
      a: data.a,
      oggetto: data.oggetto,
      corpo: data.corpo,
      data: new Date().toISOString(),
      letto: data.tipo === 'inviata' || data.tipo === 'bozza',
      tipo: data.tipo,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
    });
    revalidatePath('/dashboard/mailbox');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateEmailRecord(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateEmail(id, data as Parameters<typeof dal.updateEmail>[1]);
    revalidatePath('/dashboard/mailbox');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteEmailRecord(id: string): Promise<ActionResult> {
  try {
    await dal.deleteEmail(id);
    revalidatePath('/dashboard/mailbox');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== MOVIMENTI MAGAZZINO CRUD ====================

export async function createMovimentoMagazzino(data: {
  tenantId: string;
  prodottoId: string;
  prodottoNome: string;
  tipo: 'carico' | 'scarico';
  quantita: number;
  motivo: string;
  ordineId?: string;
}): Promise<ActionResult> {
  try {
    await dal.createMovimentoMagazzino({
      id: genId('mov'),
      tenantId: data.tenantId,
      prodottoId: data.prodottoId,
      prodottoNome: data.prodottoNome,
      tipo: data.tipo,
      quantita: data.quantita,
      data: new Date().toISOString().split('T')[0],
      motivo: data.motivo,
      ordineId: data.ordineId,
    });
    revalidatePath('/dashboard/magazzino');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ==================== SUPERADMIN CRUD ====================

export async function updatePianoAdmin(id: string, data: {
  nome?: string;
  descrizione?: string;
  prezzoMensile?: string;
  prezzoAnnuale?: string;
  maxUtenti?: number;
  maxClienti?: number;
  maxFatture?: number;
  costoUtenteAggiuntivo?: string;
  funzionalita?: string[];
}): Promise<ActionResult> {
  try {
    await dal.updatePiano(id, data as Parameters<typeof dal.updatePiano>[1]);
    revalidatePath('/superadmin/piani');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function createTenantAdmin(data: {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  email: string;
  pec: string;
  codiceDestinatario: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  piano: 'express' | 'explore' | 'experience';
  adminNome: string;
  adminCognome: string;
  adminEmail: string;
}): Promise<ActionResult> {
  try {
    const pianiData = await dal.getPiani();
    const piano = pianiData.find(p => p.id === data.piano);
    const tenantId = genId('t');
    const today = new Date().toISOString().split('T')[0];
    const scadenza = new Date();
    scadenza.setFullYear(scadenza.getFullYear() + 1);

    await dal.createTenant({
      id: tenantId,
      ragioneSociale: data.ragioneSociale,
      partitaIva: data.partitaIva,
      codiceFiscale: data.codiceFiscale,
      email: data.email,
      pec: data.pec,
      codiceDestinatario: data.codiceDestinatario,
      indirizzo: data.indirizzo,
      citta: data.citta,
      cap: data.cap,
      provincia: data.provincia,
      telefono: data.telefono,
      piano: data.piano,
      stato: 'attivo',
      dataCreazione: today,
      dataScadenza: scadenza.toISOString().split('T')[0],
      maxUtenti: piano?.maxUtenti ?? 5,
      utentiAttivi: 1,
    });

    await dal.createUser({
      id: genId('u'),
      tenantId,
      nome: data.adminNome,
      cognome: data.adminCognome,
      email: data.adminEmail,
      ruolo: 'tenant_admin',
      attivo: true,
    });

    revalidatePath('/superadmin/tenant');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateTenantAdmin(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateTenant(id, data as Parameters<typeof dal.updateTenant>[1]);
    revalidatePath('/superadmin/tenant');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function createUserAdmin(data: {
  tenantId: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'superadmin' | 'tenant_admin' | 'utente';
}): Promise<ActionResult> {
  try {
    await dal.createUser({
      id: genId('u'),
      tenantId: data.tenantId,
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      ruolo: data.ruolo,
      attivo: true,
    });
    revalidatePath('/superadmin/tenant');
    revalidatePath('/dashboard/impostazioni');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateUserAdmin(id: string, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    await dal.updateUser(id, data as Parameters<typeof dal.updateUser>[1]);
    revalidatePath('/superadmin/tenant');
    revalidatePath('/dashboard/impostazioni');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteUserAdmin(id: string): Promise<ActionResult> {
  try {
    await dal.deleteUser(id);
    revalidatePath('/superadmin/tenant');
    revalidatePath('/dashboard/impostazioni');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
