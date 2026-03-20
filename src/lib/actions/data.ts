'use server';

import * as dal from '../db/dal';

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
