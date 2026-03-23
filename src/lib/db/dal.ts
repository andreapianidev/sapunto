import { db } from './index';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
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

export async function updatePiano(id: string, data: Partial<typeof schema.piani.$inferInsert>) {
  await db.update(schema.piani).set(data).where(eq(schema.piani.id, id as 'express' | 'explore' | 'experience'));
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

export async function getProdottoById(id: string) {
  const rows = await db.select().from(schema.prodotti).where(eq(schema.prodotti.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    prezzo: numericToNumber(r.prezzo),
    prezzoAcquisto: numericToNumber(r.prezzoAcquisto),
  };
}

// ==================== PRODOTTI (query extra) ====================

export async function getProdottoBySku(tenantId: string, sku: string) {
  const rows = await db.select().from(schema.prodotti)
    .where(and(eq(schema.prodotti.tenantId, tenantId), eq(schema.prodotti.sku, sku)));
  return rows[0] ?? null;
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

export async function getOrdineById(id: string) {
  const rows = await db.select().from(schema.ordini).where(eq(schema.ordini.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    subtotale: numericToNumber(r.subtotale),
    iva: numericToNumber(r.iva),
    totale: numericToNumber(r.totale),
  };
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

export async function getFatturaById(id: string) {
  const rows = await db.select().from(schema.fatture).where(eq(schema.fatture.id, id));
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    subtotale: numericToNumber(r.subtotale),
    iva: numericToNumber(r.iva),
    totale: numericToNumber(r.totale),
  };
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

export async function getIntegrazioneById(id: string) {
  const rows = await db.select().from(schema.integrazioniEcommerce).where(eq(schema.integrazioniEcommerce.id, id));
  return rows[0] ?? null;
}

export async function updateIntegrazione(id: string, data: Partial<typeof schema.integrazioniEcommerce.$inferInsert>) {
  await db.update(schema.integrazioniEcommerce).set(data).where(eq(schema.integrazioniEcommerce.id, id));
}

// ==================== LOG SYNC ====================

export async function getLogSync(tenantId: string) {
  const integrazioni = await db.select({ id: schema.integrazioniEcommerce.id }).from(schema.integrazioniEcommerce).where(eq(schema.integrazioniEcommerce.tenantId, tenantId));
  if (integrazioni.length === 0) return [];
  const ids = integrazioni.map(i => i.id);
  return db.select().from(schema.logSync).where(inArray(schema.logSync.integrazioneId, ids));
}

export async function createLogSync(data: typeof schema.logSync.$inferInsert) {
  await db.insert(schema.logSync).values(data);
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

// ==================== AUTH HELPERS ====================

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email));
  return rows[0] ?? null;
}

// ==================== TENANTS CRUD ====================

export async function createTenant(data: typeof schema.tenants.$inferInsert) {
  await db.insert(schema.tenants).values(data);
}

export async function updateTenant(id: string, data: Partial<typeof schema.tenants.$inferInsert>) {
  await db.update(schema.tenants).set(data).where(eq(schema.tenants.id, id));
}

// ==================== USERS CRUD ====================

export async function createUser(data: typeof schema.users.$inferInsert) {
  await db.insert(schema.users).values(data);
}

export async function updateUser(id: string, data: Partial<typeof schema.users.$inferInsert>) {
  await db.update(schema.users).set(data).where(eq(schema.users.id, id));
}

export async function deleteUser(id: string) {
  await db.delete(schema.users).where(eq(schema.users.id, id));
}

// ==================== CLIENTI CRUD ====================

export async function createCliente(data: typeof schema.clienti.$inferInsert) {
  await db.insert(schema.clienti).values(data);
}

export async function updateCliente(id: string, data: Partial<typeof schema.clienti.$inferInsert>) {
  await db.update(schema.clienti).set(data).where(eq(schema.clienti.id, id));
}

export async function deleteCliente(id: string) {
  await db.delete(schema.clienti).where(eq(schema.clienti.id, id));
}

// ==================== PRODOTTI CRUD ====================

export async function createProdotto(data: typeof schema.prodotti.$inferInsert) {
  await db.insert(schema.prodotti).values(data);
}

export async function updateProdotto(id: string, data: Partial<typeof schema.prodotti.$inferInsert>) {
  await db.update(schema.prodotti).set(data).where(eq(schema.prodotti.id, id));
}

export async function deleteProdotto(id: string) {
  await db.delete(schema.prodotti).where(eq(schema.prodotti.id, id));
}

// ==================== ORDINI CRUD ====================

export async function getNextOrdineNumber(tenantId: string): Promise<string> {
  const rows = await db.select({ numero: schema.ordini.numero })
    .from(schema.ordini)
    .where(eq(schema.ordini.tenantId, tenantId));
  const maxNum = rows.reduce((max, r) => {
    const match = r.numero.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function createOrdine(data: typeof schema.ordini.$inferInsert) {
  await db.insert(schema.ordini).values(data);
}

export async function updateOrdine(id: string, data: Partial<typeof schema.ordini.$inferInsert>) {
  await db.update(schema.ordini).set(data).where(eq(schema.ordini.id, id));
}

export async function deleteOrdine(id: string) {
  await db.delete(schema.ordini).where(eq(schema.ordini.id, id));
}

// ==================== FATTURE CRUD ====================

export async function getNextFatturaNumber(tenantId: string): Promise<string> {
  const rows = await db.select({ numero: schema.fatture.numero })
    .from(schema.fatture)
    .where(eq(schema.fatture.tenantId, tenantId));
  const maxNum = rows.reduce((max, r) => {
    const match = r.numero.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  return `FE-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function createFattura(data: typeof schema.fatture.$inferInsert) {
  await db.insert(schema.fatture).values(data);
}

export async function updateFattura(id: string, data: Partial<typeof schema.fatture.$inferInsert>) {
  await db.update(schema.fatture).set(data).where(eq(schema.fatture.id, id));
}

export async function deleteFattura(id: string) {
  await db.delete(schema.fatture).where(eq(schema.fatture.id, id));
}

// ==================== PREVENTIVI CRUD ====================

export async function getNextPreventivoNumber(tenantId: string): Promise<string> {
  const rows = await db.select({ numero: schema.preventivi.numero })
    .from(schema.preventivi)
    .where(eq(schema.preventivi.tenantId, tenantId));
  const maxNum = rows.reduce((max, r) => {
    const match = r.numero.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  return `PRV-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function createPreventivo(data: typeof schema.preventivi.$inferInsert) {
  await db.insert(schema.preventivi).values(data);
}

export async function updatePreventivo(id: string, data: Partial<typeof schema.preventivi.$inferInsert>) {
  await db.update(schema.preventivi).set(data).where(eq(schema.preventivi.id, id));
}

export async function deletePreventivo(id: string) {
  await db.delete(schema.preventivi).where(eq(schema.preventivi.id, id));
}

// ==================== LEADS CRUD ====================

export async function createLead(data: typeof schema.leads.$inferInsert) {
  await db.insert(schema.leads).values(data);
}

export async function updateLead(id: string, data: Partial<typeof schema.leads.$inferInsert>) {
  await db.update(schema.leads).set(data).where(eq(schema.leads.id, id));
}

export async function deleteLead(id: string) {
  await db.delete(schema.leads).where(eq(schema.leads.id, id));
}

// ==================== CONTRATTI CRUD ====================

export async function getNextContrattoNumber(tenantId: string): Promise<string> {
  const rows = await db.select({ numero: schema.contratti.numero })
    .from(schema.contratti)
    .where(eq(schema.contratti.tenantId, tenantId));
  const maxNum = rows.reduce((max, r) => {
    const match = r.numero.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  return `CTR-${year}-${String(maxNum + 1).padStart(3, '0')}`;
}

export async function createContratto(data: typeof schema.contratti.$inferInsert) {
  await db.insert(schema.contratti).values(data);
}

export async function updateContratto(id: string, data: Partial<typeof schema.contratti.$inferInsert>) {
  await db.update(schema.contratti).set(data).where(eq(schema.contratti.id, id));
}

export async function deleteContratto(id: string) {
  await db.delete(schema.contratti).where(eq(schema.contratti.id, id));
}

// ==================== NOTE DI CREDITO CRUD ====================

export async function getNextNotaCreditoNumber(tenantId: string): Promise<string> {
  const rows = await db.select({ numero: schema.noteDiCredito.numero })
    .from(schema.noteDiCredito)
    .where(eq(schema.noteDiCredito.tenantId, tenantId));
  const maxNum = rows.reduce((max, r) => {
    const match = r.numero.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  return `NC-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function createNotaDiCredito(data: typeof schema.noteDiCredito.$inferInsert) {
  await db.insert(schema.noteDiCredito).values(data);
}

export async function updateNotaDiCredito(id: string, data: Partial<typeof schema.noteDiCredito.$inferInsert>) {
  await db.update(schema.noteDiCredito).set(data).where(eq(schema.noteDiCredito.id, id));
}

export async function deleteNotaDiCredito(id: string) {
  await db.delete(schema.noteDiCredito).where(eq(schema.noteDiCredito.id, id));
}

// ==================== TICKETS CRUD ====================

export async function getNextTicketNumber(tenantId: string): Promise<string> {
  const rows = await db.select({ numero: schema.tickets.numero })
    .from(schema.tickets)
    .where(eq(schema.tickets.tenantId, tenantId));
  const maxNum = rows.reduce((max, r) => {
    const match = r.numero.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  return `TKT-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function createTicket(data: typeof schema.tickets.$inferInsert) {
  await db.insert(schema.tickets).values(data);
}

export async function updateTicket(id: string, data: Partial<typeof schema.tickets.$inferInsert>) {
  await db.update(schema.tickets).set(data).where(eq(schema.tickets.id, id));
}

export async function deleteTicket(id: string) {
  await db.delete(schema.tickets).where(eq(schema.tickets.id, id));
}

// ==================== PROGETTI CRUD ====================

export async function createProgetto(data: typeof schema.progetti.$inferInsert) {
  await db.insert(schema.progetti).values(data);
}

export async function updateProgetto(id: string, data: Partial<typeof schema.progetti.$inferInsert>) {
  await db.update(schema.progetti).set(data).where(eq(schema.progetti.id, id));
}

export async function deleteProgetto(id: string) {
  await db.delete(schema.progetti).where(eq(schema.progetti.id, id));
}

// ==================== TASKS CRUD ====================

export async function createTask(data: typeof schema.tasks.$inferInsert) {
  await db.insert(schema.tasks).values(data);
}

export async function updateTask(id: string, data: Partial<typeof schema.tasks.$inferInsert>) {
  await db.update(schema.tasks).set(data).where(eq(schema.tasks.id, id));
}

export async function deleteTask(id: string) {
  await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
}

// ==================== SPESE CRUD ====================

export async function createSpesa(data: typeof schema.spese.$inferInsert) {
  await db.insert(schema.spese).values(data);
}

export async function updateSpesa(id: string, data: Partial<typeof schema.spese.$inferInsert>) {
  await db.update(schema.spese).set(data).where(eq(schema.spese.id, id));
}

export async function deleteSpesa(id: string) {
  await db.delete(schema.spese).where(eq(schema.spese.id, id));
}

// ==================== DIPENDENTI CRUD ====================

export async function createDipendente(data: typeof schema.dipendenti.$inferInsert) {
  await db.insert(schema.dipendenti).values(data);
}

export async function updateDipendente(id: string, data: Partial<typeof schema.dipendenti.$inferInsert>) {
  await db.update(schema.dipendenti).set(data).where(eq(schema.dipendenti.id, id));
}

export async function deleteDipendente(id: string) {
  await db.delete(schema.dipendenti).where(eq(schema.dipendenti.id, id));
}

// ==================== CEDOLINI CRUD ====================

export async function createCedolino(data: typeof schema.cedolini.$inferInsert) {
  await db.insert(schema.cedolini).values(data);
}

export async function updateCedolino(id: string, data: Partial<typeof schema.cedolini.$inferInsert>) {
  await db.update(schema.cedolini).set(data).where(eq(schema.cedolini.id, id));
}

export async function deleteCedolino(id: string) {
  await db.delete(schema.cedolini).where(eq(schema.cedolini.id, id));
}

// ==================== APPUNTAMENTI CRUD ====================

export async function createAppuntamento(data: typeof schema.appuntamenti.$inferInsert) {
  await db.insert(schema.appuntamenti).values(data);
}

export async function updateAppuntamento(id: string, data: Partial<typeof schema.appuntamenti.$inferInsert>) {
  await db.update(schema.appuntamenti).set(data).where(eq(schema.appuntamenti.id, id));
}

export async function deleteAppuntamento(id: string) {
  await db.delete(schema.appuntamenti).where(eq(schema.appuntamenti.id, id));
}

// ==================== EMAILS CRUD ====================

export async function createEmail(data: typeof schema.emails.$inferInsert) {
  await db.insert(schema.emails).values(data);
}

export async function updateEmail(id: string, data: Partial<typeof schema.emails.$inferInsert>) {
  await db.update(schema.emails).set(data).where(eq(schema.emails.id, id));
}

export async function deleteEmail(id: string) {
  await db.delete(schema.emails).where(eq(schema.emails.id, id));
}

// ==================== MOVIMENTI MAGAZZINO CRUD ====================

export async function createMovimentoMagazzino(data: typeof schema.movimentiMagazzino.$inferInsert) {
  await db.insert(schema.movimentiMagazzino).values(data);
  // Update product stock
  if (data.tipo === 'carico') {
    await db.update(schema.prodotti)
      .set({ giacenza: sql`${schema.prodotti.giacenza} + ${data.quantita}` })
      .where(eq(schema.prodotti.id, data.prodottoId));
  } else {
    await db.update(schema.prodotti)
      .set({ giacenza: sql`${schema.prodotti.giacenza} - ${data.quantita}` })
      .where(eq(schema.prodotti.id, data.prodottoId));
  }
}
