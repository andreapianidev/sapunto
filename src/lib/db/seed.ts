import { execSync } from 'child_process';
import {
  piani, tenants, users, clienti, prodotti,
  ordini, fatture, dipendenti, cedolini,
  appuntamenti, emails, movimentiMagazzino,
  integrazioniEcommerce, logSync,
  preventivi, leads, progetti, tasks,
  tickets, contratti, spese, noteDiCredito,
} from '../mockdata';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const host = new URL(DATABASE_URL).hostname;
const apiUrl = `https://${host}/sql`;

function execQuery(query: string, params: unknown[] = []): void {
  const body = JSON.stringify({ query, params });
  // Escape for shell - write body to a temp approach using stdin
  const escaped = body.replace(/'/g, "'\\''");
  execSync(
    `curl -s -X POST "${apiUrl}" -H "Content-Type: application/json" -H "Neon-Connection-String: ${DATABASE_URL}" -d '${escaped}'`,
    { encoding: 'utf-8', timeout: 30000 }
  );
}

function insertRow(table: string, data: Record<string, unknown>): void {
  const keys = Object.keys(data);
  const cols = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = keys.map(k => {
    const v = data[k];
    if (v === null || v === undefined) return null;
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  const query = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
  execQuery(query, values);
}

function insertRows(table: string, rows: Record<string, unknown>[]): void {
  for (const row of rows) {
    insertRow(table, row);
  }
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear tables
  console.log('🗑️  Clearing existing data...');
  const tables = [
    'note_di_credito', 'spese', 'contratti', 'tickets', 'tasks', 'progetti',
    'leads', 'preventivi', 'log_sync', 'integrazioni_ecommerce', 'movimenti_magazzino',
    'emails', 'appuntamenti', 'cedolini', 'dipendenti', 'fatture', 'ordini',
    'prodotti', 'clienti', 'users', 'tenants', 'piani',
  ];
  for (const t of tables) {
    execQuery(`DELETE FROM "${t}"`);
  }

  // 1. Piani
  console.log('📋 Inserting piani...');
  insertRows('piani', piani.map(p => ({
    id: p.id, nome: p.nome, prezzo_mensile: p.prezzoMensile,
    prezzo_annuale: p.prezzoAnnuale, max_utenti: p.maxUtenti,
    max_clienti: p.maxClienti, max_fatture: p.maxFatture,
    funzionalita: p.funzionalita,
  })));

  // 2. Tenants
  console.log('🏢 Inserting tenants...');
  insertRows('tenants', tenants.map(t => ({
    id: t.id, ragione_sociale: t.ragioneSociale, partita_iva: t.partitaIva,
    codice_fiscale: t.codiceFiscale, indirizzo: t.indirizzo, citta: t.citta,
    cap: t.cap, provincia: t.provincia, telefono: t.telefono, email: t.email,
    pec: t.pec, codice_destinatario: t.codiceDestinatario, logo: t.logo ?? null,
    piano: t.piano, stato: t.stato, data_creazione: t.dataCreazione,
    data_scadenza: t.dataScadenza, max_utenti: t.maxUtenti, utenti_attivi: t.utentiAttivi,
  })));

  // 3. Users
  console.log('👤 Inserting users...');
  insertRows('users', users.map(u => ({
    id: u.id, tenant_id: u.tenantId, nome: u.nome, cognome: u.cognome,
    email: u.email, ruolo: u.ruolo, avatar: u.avatar ?? null, attivo: u.attivo,
  })));

  // 4. Clienti
  console.log('👥 Inserting clienti...');
  insertRows('clienti', clienti.map(c => ({
    id: c.id, tenant_id: c.tenantId, ragione_sociale: c.ragioneSociale,
    partita_iva: c.partitaIva, codice_fiscale: c.codiceFiscale,
    indirizzo: c.indirizzo, citta: c.citta, cap: c.cap, provincia: c.provincia,
    telefono: c.telefono, email: c.email, pec: c.pec ?? null,
    codice_destinatario: c.codiceDestinatario ?? null, tipo: c.tipo,
    tags: c.tags, note: c.note ?? null, data_creazione: c.dataCreazione,
    referente: c.referente ?? null,
  })));

  // 5. Prodotti
  console.log('📦 Inserting prodotti...');
  insertRows('prodotti', prodotti.map(p => ({
    id: p.id, tenant_id: p.tenantId, nome: p.nome, sku: p.sku,
    descrizione: p.descrizione, prezzo: p.prezzo, prezzo_acquisto: p.prezzoAcquisto,
    giacenza: p.giacenza, scorte_minime: p.scorteMinime, categoria: p.categoria,
    unita: p.unita, iva: p.iva, attivo: p.attivo,
  })));

  // 6. Ordini
  console.log('🛒 Inserting ordini...');
  insertRows('ordini', ordini.map(o => ({
    id: o.id, tenant_id: o.tenantId, numero: o.numero, cliente_id: o.clienteId,
    cliente_nome: o.clienteNome, data: o.data, stato: o.stato, righe: o.righe,
    subtotale: o.subtotale, iva: o.iva, totale: o.totale, canale: o.canale,
    note: o.note ?? null, fattura_id: o.fatturaId ?? null,
  })));

  // 7. Fatture
  console.log('🧾 Inserting fatture...');
  insertRows('fatture', fatture.map(f => ({
    id: f.id, tenant_id: f.tenantId, numero: f.numero, tipo: f.tipo,
    cliente_id: f.clienteId, cliente_nome: f.clienteNome, data: f.data,
    data_scadenza: f.dataScadenza, stato: f.stato, stato_sdi: f.statoSDI,
    notifiche_sdi: f.notificheSDI, ordine_id: f.ordineId ?? null,
    righe: f.righe, subtotale: f.subtotale, iva: f.iva, totale: f.totale,
    xml_riferimento: f.xmlRiferimento ?? null,
  })));

  // 8. Dipendenti
  console.log('👷 Inserting dipendenti...');
  insertRows('dipendenti', dipendenti.map(d => ({
    id: d.id, tenant_id: d.tenantId, nome: d.nome, cognome: d.cognome,
    codice_fiscale: d.codiceFiscale, data_nascita: d.dataNascita,
    luogo_nascita: d.luogoNascita, indirizzo: d.indirizzo, telefono: d.telefono,
    email: d.email, ruolo_aziendale: d.ruoloAziendale, tipo_contratto: d.tipoContratto,
    data_assunzione: d.dataAssunzione, ral_lorda: d.ralLorda, livello: d.livello,
    iban: d.iban,
  })));

  // 9. Cedolini
  console.log('💰 Inserting cedolini...');
  insertRows('cedolini', cedolini.map(c => ({
    id: c.id, dipendente_id: c.dipendenteId, tenant_id: c.tenantId,
    mese: c.mese, anno: c.anno, lordo: c.lordo, contributi_inps: c.contributiInps,
    irpef: c.irpef, addizionale_regionale: c.addizionaleRegionale,
    addizionale_comunale: c.addizionaleComunale, altre_ritenute: c.altreRitenute,
    netto: c.netto, data_emissione: c.dataEmissione,
  })));

  // 10. Appuntamenti
  console.log('📅 Inserting appuntamenti...');
  insertRows('appuntamenti', appuntamenti.map(a => ({
    id: a.id, tenant_id: a.tenantId, titolo: a.titolo,
    cliente_id: a.clienteId ?? null, cliente_nome: a.clienteNome ?? null,
    operatore_id: a.operatoreId, operatore_nome: a.operatoreNome,
    data: a.data, ora_inizio: a.oraInizio, ora_fine: a.oraFine,
    stato: a.stato, luogo: a.luogo ?? null, note: a.note ?? null,
  })));

  // 11. Emails
  console.log('📧 Inserting emails...');
  insertRows('emails', emails.map(e => ({
    id: e.id, tenant_id: e.tenantId, da: e.da, a: e.a,
    oggetto: e.oggetto, corpo: e.corpo, data: e.data, letto: e.letto,
    cliente_id: e.clienteId ?? null, cliente_nome: e.clienteNome ?? null,
    tipo: e.tipo,
  })));

  // 12. Movimenti Magazzino
  console.log('📦 Inserting movimenti magazzino...');
  insertRows('movimenti_magazzino', movimentiMagazzino.map(m => ({
    id: m.id, tenant_id: m.tenantId, prodotto_id: m.prodottoId,
    prodotto_nome: m.prodottoNome, tipo: m.tipo, quantita: m.quantita,
    data: m.data, motivo: m.motivo, ordine_id: m.ordineId ?? null,
  })));

  // 13. Integrazioni E-commerce
  console.log('🛍️ Inserting integrazioni...');
  insertRows('integrazioni_ecommerce', integrazioniEcommerce.map(i => ({
    id: i.id, tenant_id: i.tenantId, piattaforma: i.piattaforma,
    stato: i.stato, url_negozio: i.urlNegozio ?? null,
    ultimo_sync: i.ultimoSync ?? null, ordini_sincronizzati: i.ordiniSincronizzati,
    prodotti_mappati: i.prodottiMappati, errori: i.errori,
  })));

  // 14. Log Sync
  console.log('📊 Inserting log sync...');
  insertRows('log_sync', logSync.map(l => ({
    id: l.id, integrazione_id: l.integrazioneId, data: l.data,
    tipo: l.tipo, stato: l.stato, messaggio: l.messaggio,
  })));

  // 15. Preventivi
  console.log('📝 Inserting preventivi...');
  insertRows('preventivi', preventivi.map(p => ({
    id: p.id, tenant_id: p.tenantId, numero: p.numero,
    cliente_id: p.clienteId, cliente_nome: p.clienteNome,
    data: p.data, data_scadenza: p.dataScadenza, stato: p.stato,
    oggetto: p.oggetto, righe: p.righe, subtotale: p.subtotale,
    iva: p.iva, totale: p.totale, note: p.note ?? null,
    ordine_id: p.ordineId ?? null,
  })));

  // 16. Leads
  console.log('🎯 Inserting leads...');
  insertRows('leads', leads.map(l => ({
    id: l.id, tenant_id: l.tenantId, azienda: l.azienda,
    referente: l.referente, email: l.email, telefono: l.telefono,
    fonte: l.fonte, fase: l.fase, valore: l.valore,
    probabilita: l.probabilita, assegnato_a: l.assegnatoA,
    assegnato_nome: l.assegnatoNome, data_creazione: l.dataCreazione,
    data_chiusura_prevista: l.dataChiusuraPrevista, note: l.note ?? null,
  })));

  // 17. Progetti
  console.log('📁 Inserting progetti...');
  insertRows('progetti', progetti.map(p => ({
    id: p.id, tenant_id: p.tenantId, nome: p.nome,
    cliente_id: p.clienteId ?? null, cliente_nome: p.clienteNome ?? null,
    stato: p.stato, data_inizio: p.dataInizio,
    data_fine_prevista: p.dataFinePrevista,
    budget: p.budget ?? null, descrizione: p.descrizione,
    responsabile_id: p.responsabileId, responsabile_nome: p.responsabileNome,
    completamento: p.completamento,
  })));

  // 18. Tasks
  console.log('✅ Inserting tasks...');
  insertRows('tasks', tasks.map(t => ({
    id: t.id, tenant_id: t.tenantId, progetto_id: t.progettoId,
    titolo: t.titolo, descrizione: t.descrizione ?? null,
    stato: t.stato, priorita: t.priorita, assegnato_a: t.assegnatoA,
    assegnato_nome: t.assegnatoNome, data_scadenza: t.dataScadenza,
    ore_stimate: t.oreStimate ?? null, ore_effettive: t.oreEffettive ?? null,
  })));

  // 19. Tickets
  console.log('🎫 Inserting tickets...');
  insertRows('tickets', tickets.map(t => ({
    id: t.id, tenant_id: t.tenantId, numero: t.numero,
    cliente_id: t.clienteId ?? null, cliente_nome: t.clienteNome ?? null,
    oggetto: t.oggetto, descrizione: t.descrizione, priorita: t.priorita,
    stato: t.stato, categoria: t.categoria,
    assegnato_a: t.assegnatoA ?? null, assegnato_nome: t.assegnatoNome ?? null,
    data_apertura: t.dataApertura, data_chiusura: t.dataChiusura ?? null,
    risposte: t.risposte,
  })));

  // 20. Contratti
  console.log('📃 Inserting contratti...');
  insertRows('contratti', contratti.map(c => ({
    id: c.id, tenant_id: c.tenantId, numero: c.numero,
    cliente_id: c.clienteId, cliente_nome: c.clienteNome,
    oggetto: c.oggetto, tipo: c.tipo, stato: c.stato,
    data_inizio: c.dataInizio, data_fine: c.dataFine,
    valore_annuale: c.valoreAnnuale, rinnovo: c.rinnovo,
    note: c.note ?? null,
  })));

  // 21. Spese
  console.log('💸 Inserting spese...');
  insertRows('spese', spese.map(s => ({
    id: s.id, tenant_id: s.tenantId, descrizione: s.descrizione,
    categoria: s.categoria, importo: s.importo, data: s.data,
    dipendente_id: s.dipendenteId ?? null, dipendente_nome: s.dipendenteNome ?? null,
    cliente_id: s.clienteId ?? null, cliente_nome: s.clienteNome ?? null,
    progetto_id: s.progettoId ?? null, progetto_nome: s.progettoNome ?? null,
    stato: s.stato, ricevuta: s.ricevuta ?? null, note: s.note ?? null,
  })));

  // 22. Note di Credito
  console.log('📄 Inserting note di credito...');
  insertRows('note_di_credito', noteDiCredito.map(n => ({
    id: n.id, tenant_id: n.tenantId, numero: n.numero,
    fattura_id: n.fatturaId, fattura_numero: n.fatturaNumero,
    cliente_id: n.clienteId, cliente_nome: n.clienteNome,
    data: n.data, motivo: n.motivo, importo: n.importo,
    iva: n.iva, totale: n.totale, stato: n.stato,
  })));

  console.log('✅ Seed completed! All data inserted successfully.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
