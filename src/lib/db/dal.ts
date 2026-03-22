import { db } from './index';
import { eq, desc } from 'drizzle-orm';
import * as schema from './schema';

// Helper to convert numeric strings back to numbers
function numericToNumber(val: string | null): number {
  return val ? parseFloat(val) : 0;
}

// ==================== PIANI ====================

export async function getPiani() {
  const rows = await db.select().from(schema.piani);
  return rows.map(r => ({
    ...r,
    prezzoMensile: numericToNumber(r.prezzoMensile),
    prezzoAnnuale: numericToNumber(r.prezzoAnnuale),
    costoUtenteAggiuntivo: numericToNumber(r.costoUtenteAggiuntivo),
  }));
}

// ==================== TENANTS ====================

export async function getTenants() {
  const rows = await db.select().from(schema.tenants);
  return rows;
}

export async function getTenantById(id: string) {
  const rows = await db.select().from(schema.tenants).where(eq(schema.tenants.id, id));
  return rows[0] ?? null;
}

export async function updateTenantPiano(tenantId: string, piano: 'express' | 'explore' | 'experience', stato: 'attivo' | 'sospeso' | 'trial') {
  await db.update(schema.tenants)
    .set({ piano, stato })
    .where(eq(schema.tenants.id, tenantId));
}

// ==================== USERS ====================

export async function getUsers() {
  return db.select().from(schema.users);
}

export async function getUsersByTenantId(tenantId: string) {
  return db.select().from(schema.users).where(eq(schema.users.tenantId, tenantId));
}

export async function getUserById(id: string) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return rows[0] ?? null;
}

// ==================== CLIENTI ====================

export async function getClienti(tenantId: string) {
  return db.select().from(schema.clienti).where(eq(schema.clienti.tenantId, tenantId));
}

export async function getClienteById(id: string) {
  const rows = await db.select().from(schema.clienti).where(eq(schema.clienti.id, id));
  return rows[0] ?? null;
}

// ==================== PRODOTTI ====================

export async function getProdotti(tenantId: string) {
  const rows = await db.select().from(schema.prodotti).where(eq(schema.prodotti.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    prezzo: numericToNumber(r.prezzo),
    prezzoAcquisto: numericToNumber(r.prezzoAcquisto),
  }));
}

// ==================== ORDINI ====================

export async function getOrdini(tenantId: string) {
  const rows = await db.select().from(schema.ordini).where(eq(schema.ordini.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    subtotale: numericToNumber(r.subtotale),
    iva: numericToNumber(r.iva),
    totale: numericToNumber(r.totale),
  }));
}

export async function getOrdiniByClienteId(tenantId: string, clienteId: string) {
  const rows = await db.select().from(schema.ordini)
    .where(eq(schema.ordini.tenantId, tenantId));
  return rows
    .filter(r => r.clienteId === clienteId)
    .map(r => ({
      ...r,
      subtotale: numericToNumber(r.subtotale),
      iva: numericToNumber(r.iva),
      totale: numericToNumber(r.totale),
    }));
}

// ==================== FATTURE ====================

export async function getFatture(tenantId: string) {
  const rows = await db.select().from(schema.fatture).where(eq(schema.fatture.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    subtotale: numericToNumber(r.subtotale),
    iva: numericToNumber(r.iva),
    totale: numericToNumber(r.totale),
  }));
}

export async function getFattureByClienteId(tenantId: string, clienteId: string) {
  const rows = await db.select().from(schema.fatture)
    .where(eq(schema.fatture.tenantId, tenantId));
  return rows
    .filter(r => r.clienteId === clienteId)
    .map(r => ({
      ...r,
      subtotale: numericToNumber(r.subtotale),
      iva: numericToNumber(r.iva),
      totale: numericToNumber(r.totale),
    }));
}

// ==================== DIPENDENTI ====================

export async function getDipendenti(tenantId: string) {
  const rows = await db.select().from(schema.dipendenti).where(eq(schema.dipendenti.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    ralLorda: numericToNumber(r.ralLorda),
  }));
}

// ==================== CEDOLINI ====================

export async function getCedolini(tenantId: string) {
  const rows = await db.select().from(schema.cedolini).where(eq(schema.cedolini.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    lordo: numericToNumber(r.lordo),
    contributiInps: numericToNumber(r.contributiInps),
    irpef: numericToNumber(r.irpef),
    addizionaleRegionale: numericToNumber(r.addizionaleRegionale),
    addizionaleComunale: numericToNumber(r.addizionaleComunale),
    altreRitenute: numericToNumber(r.altreRitenute),
    netto: numericToNumber(r.netto),
  }));
}

// ==================== APPUNTAMENTI ====================

export async function getAppuntamenti(tenantId: string) {
  return db.select().from(schema.appuntamenti).where(eq(schema.appuntamenti.tenantId, tenantId));
}

// ==================== EMAILS ====================

export async function getEmails(tenantId: string) {
  return db.select().from(schema.emails).where(eq(schema.emails.tenantId, tenantId));
}

// ==================== MOVIMENTI MAGAZZINO ====================

export async function getMovimentiMagazzino(tenantId: string) {
  return db.select().from(schema.movimentiMagazzino).where(eq(schema.movimentiMagazzino.tenantId, tenantId));
}

// ==================== INTEGRAZIONI E-COMMERCE ====================

export async function getIntegrazioniEcommerce(tenantId: string) {
  return db.select().from(schema.integrazioniEcommerce).where(eq(schema.integrazioniEcommerce.tenantId, tenantId));
}

// ==================== LOG SYNC ====================

export async function getLogSync() {
  return db.select().from(schema.logSync);
}

// ==================== PREVENTIVI ====================

export async function getPreventivi(tenantId: string) {
  const rows = await db.select().from(schema.preventivi).where(eq(schema.preventivi.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    subtotale: numericToNumber(r.subtotale),
    iva: numericToNumber(r.iva),
    totale: numericToNumber(r.totale),
  }));
}

// ==================== LEADS ====================

export async function getLeads(tenantId: string) {
  const rows = await db.select().from(schema.leads).where(eq(schema.leads.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    valore: numericToNumber(r.valore),
  }));
}

// ==================== PROGETTI ====================

export async function getProgetti(tenantId: string) {
  const rows = await db.select().from(schema.progetti).where(eq(schema.progetti.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    budget: r.budget ? numericToNumber(r.budget) : undefined,
  }));
}

// ==================== TASKS ====================

export async function getTasks(tenantId: string) {
  return db.select().from(schema.tasks).where(eq(schema.tasks.tenantId, tenantId));
}

// ==================== TICKETS ====================

export async function getTickets(tenantId: string) {
  return db.select().from(schema.tickets).where(eq(schema.tickets.tenantId, tenantId));
}

// ==================== CONTRATTI ====================

export async function getContratti(tenantId: string) {
  const rows = await db.select().from(schema.contratti).where(eq(schema.contratti.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    valoreAnnuale: numericToNumber(r.valoreAnnuale),
  }));
}

// ==================== SPESE ====================

export async function getSpese(tenantId: string) {
  const rows = await db.select().from(schema.spese).where(eq(schema.spese.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    importo: numericToNumber(r.importo),
  }));
}

// ==================== NOTE DI CREDITO ====================

export async function getNoteDiCredito(tenantId: string) {
  const rows = await db.select().from(schema.noteDiCredito).where(eq(schema.noteDiCredito.tenantId, tenantId));
  return rows.map(r => ({
    ...r,
    importo: numericToNumber(r.importo),
    iva: numericToNumber(r.iva),
    totale: numericToNumber(r.totale),
  }));
}

// ==================== ABBONAMENTI ====================

export async function getAbbonamenti() {
  const rows = await db.select().from(schema.abbonamenti);
  return rows.map(r => ({
    ...r,
    importoBase: numericToNumber(r.importoBase),
    costoUtentiAggiuntivi: numericToNumber(r.costoUtentiAggiuntivi),
    importoTotale: numericToNumber(r.importoTotale),
  }));
}

export async function getAbbonamentoByTenantId(tenantId: string) {
  const rows = await db.select().from(schema.abbonamenti)
    .where(eq(schema.abbonamenti.tenantId, tenantId));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    importoBase: numericToNumber(r.importoBase),
    costoUtentiAggiuntivi: numericToNumber(r.costoUtentiAggiuntivi),
    importoTotale: numericToNumber(r.importoTotale),
  };
}

export async function getAbbonamentoById(id: string) {
  const rows = await db.select().from(schema.abbonamenti)
    .where(eq(schema.abbonamenti.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    importoBase: numericToNumber(r.importoBase),
    costoUtentiAggiuntivi: numericToNumber(r.costoUtentiAggiuntivi),
    importoTotale: numericToNumber(r.importoTotale),
  };
}

export async function createAbbonamento(data: typeof schema.abbonamenti.$inferInsert) {
  await db.insert(schema.abbonamenti).values(data);
}

export async function updateAbbonamento(id: string, data: Partial<typeof schema.abbonamenti.$inferInsert>) {
  await db.update(schema.abbonamenti)
    .set({ ...data, dataAggiornamento: new Date().toISOString() })
    .where(eq(schema.abbonamenti.id, id));
}

// ==================== TRANSAZIONI PIATTAFORMA ====================

export async function getTransazioniPiattaforma() {
  const rows = await db.select().from(schema.transazioniPiattaforma)
    .orderBy(desc(schema.transazioniPiattaforma.data));
  return rows.map(r => ({
    ...r,
    importo: numericToNumber(r.importo),
  }));
}

export async function getTransazioniByTenantId(tenantId: string) {
  const rows = await db.select().from(schema.transazioniPiattaforma)
    .where(eq(schema.transazioniPiattaforma.tenantId, tenantId))
    .orderBy(desc(schema.transazioniPiattaforma.data));
  return rows.map(r => ({
    ...r,
    importo: numericToNumber(r.importo),
  }));
}

export async function getTransazioneByRiferimentoEsterno(riferimento: string) {
  const rows = await db.select().from(schema.transazioniPiattaforma)
    .where(eq(schema.transazioniPiattaforma.riferimentoEsterno, riferimento));
  if (rows.length === 0) return null;
  const r = rows[0];
  return { ...r, importo: numericToNumber(r.importo) };
}

export async function createTransazione(data: typeof schema.transazioniPiattaforma.$inferInsert) {
  await db.insert(schema.transazioniPiattaforma).values(data);
}

export async function updateTransazione(id: string, data: Partial<typeof schema.transazioniPiattaforma.$inferInsert>) {
  await db.update(schema.transazioniPiattaforma)
    .set(data)
    .where(eq(schema.transazioniPiattaforma.id, id));
}
