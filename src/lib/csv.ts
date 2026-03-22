import type {
  Cliente,
  Ordine,
  Prodotto,
  Preventivo,
  Lead,
  Spesa,
  Dipendente,
  Contratto,
  Ticket,
} from './types';

// Use a relaxed type for Fattura to accept DAL return type
// (the DAL returns notificheSDI.tipo as string instead of the strict union)
type FatturaForCSV = {
  numero: string;
  tipo: string;
  clienteNome: string;
  data: string;
  dataScadenza: string;
  stato: string;
  statoSDI: string;
  subtotale: number;
  iva: number;
  totale: number;
};

// Helper to generate CSV content with UTF-8 BOM (for Italian Excel compatibility)
export function generateCSV(headers: string[], rows: string[][]): string {
  const BOM = '\uFEFF';
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  const headerLine = headers.map(escape).join(',');
  const dataLines = rows.map(row => row.map(escape).join(','));
  return BOM + [headerLine, ...dataLines].join('\n');
}

// Helper to safely convert a value to string for CSV
function s(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

// Helper to format numbers with 2 decimal places for currency fields
function n(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0';
  return val.toFixed(2);
}

export function clientiToCSV(clienti: Cliente[]): string {
  const headers = ['Ragione Sociale', 'P.IVA', 'Codice Fiscale', 'Email', 'Telefono', 'Tipo', 'Città', 'Provincia'];
  const rows = clienti.map(c => [
    s(c.ragioneSociale),
    s(c.partitaIva),
    s(c.codiceFiscale),
    s(c.email),
    s(c.telefono),
    s(c.tipo),
    s(c.citta),
    s(c.provincia),
  ]);
  return generateCSV(headers, rows);
}

export function ordiniToCSV(ordini: Ordine[]): string {
  const headers = ['Numero', 'Cliente', 'Data', 'Stato', 'Canale', 'Subtotale', 'IVA', 'Totale'];
  const rows = ordini.map(o => [
    s(o.numero),
    s(o.clienteNome),
    s(o.data),
    s(o.stato),
    s(o.canale),
    n(o.subtotale),
    n(o.iva),
    n(o.totale),
  ]);
  return generateCSV(headers, rows);
}

export function fattureToCSV(fatture: FatturaForCSV[]): string {
  const headers = ['Numero', 'Tipo', 'Cliente', 'Data', 'Scadenza', 'Stato', 'Stato SDI', 'Subtotale', 'IVA', 'Totale'];
  const rows = fatture.map(f => [
    s(f.numero),
    s(f.tipo),
    s(f.clienteNome),
    s(f.data),
    s(f.dataScadenza),
    s(f.stato),
    s(f.statoSDI),
    n(f.subtotale),
    n(f.iva),
    n(f.totale),
  ]);
  return generateCSV(headers, rows);
}

export function prodottiToCSV(prodotti: Prodotto[]): string {
  const headers = ['Nome', 'SKU', 'Categoria', 'Prezzo', 'Prezzo Acquisto', 'Giacenza', 'Scorte Min.', 'Unità', 'IVA %'];
  const rows = prodotti.map(p => [
    s(p.nome),
    s(p.sku),
    s(p.categoria),
    n(p.prezzo),
    n(p.prezzoAcquisto),
    s(p.giacenza),
    s(p.scorteMinime),
    s(p.unita),
    s(p.iva),
  ]);
  return generateCSV(headers, rows);
}

export function preventiviToCSV(preventivi: Preventivo[]): string {
  const headers = ['Numero', 'Cliente', 'Data', 'Scadenza', 'Stato', 'Oggetto', 'Subtotale', 'IVA', 'Totale'];
  const rows = preventivi.map(p => [
    s(p.numero),
    s(p.clienteNome),
    s(p.data),
    s(p.dataScadenza),
    s(p.stato),
    s(p.oggetto),
    n(p.subtotale),
    n(p.iva),
    n(p.totale),
  ]);
  return generateCSV(headers, rows);
}

export function leadsToCSV(leads: Lead[]): string {
  const headers = ['Azienda', 'Referente', 'Email', 'Telefono', 'Fonte', 'Fase', 'Valore', 'Probabilità', 'Assegnato A'];
  const rows = leads.map(l => [
    s(l.azienda),
    s(l.referente),
    s(l.email),
    s(l.telefono),
    s(l.fonte),
    s(l.fase),
    n(l.valore),
    s(l.probabilita),
    s(l.assegnatoNome),
  ]);
  return generateCSV(headers, rows);
}

export function speseToCSV(spese: Spesa[]): string {
  const headers = ['Descrizione', 'Categoria', 'Importo', 'Data', 'Dipendente', 'Cliente', 'Progetto', 'Stato'];
  const rows = spese.map(sp => [
    s(sp.descrizione),
    s(sp.categoria),
    n(sp.importo),
    s(sp.data),
    s(sp.dipendenteNome),
    s(sp.clienteNome),
    s(sp.progettoNome),
    s(sp.stato),
  ]);
  return generateCSV(headers, rows);
}

export function dipendentiToCSV(dipendenti: Dipendente[]): string {
  const headers = ['Nome', 'Cognome', 'Codice Fiscale', 'Email', 'Ruolo', 'Tipo Contratto', 'Data Assunzione', 'RAL'];
  const rows = dipendenti.map(d => [
    s(d.nome),
    s(d.cognome),
    s(d.codiceFiscale),
    s(d.email),
    s(d.ruoloAziendale),
    s(d.tipoContratto),
    s(d.dataAssunzione),
    n(d.ralLorda),
  ]);
  return generateCSV(headers, rows);
}

export function contrattiToCSV(contratti: Contratto[]): string {
  const headers = ['Numero', 'Cliente', 'Oggetto', 'Tipo', 'Stato', 'Data Inizio', 'Data Fine', 'Valore Annuale'];
  const rows = contratti.map(c => [
    s(c.numero),
    s(c.clienteNome),
    s(c.oggetto),
    s(c.tipo),
    s(c.stato),
    s(c.dataInizio),
    s(c.dataFine),
    n(c.valoreAnnuale),
  ]);
  return generateCSV(headers, rows);
}

export function ticketsToCSV(tickets: Ticket[]): string {
  const headers = ['Numero', 'Cliente', 'Oggetto', 'Priorità', 'Stato', 'Categoria', 'Assegnato A', 'Data Apertura'];
  const rows = tickets.map(t => [
    s(t.numero),
    s(t.clienteNome),
    s(t.oggetto),
    s(t.priorita),
    s(t.stato),
    s(t.categoria),
    s(t.assegnatoNome),
    s(t.dataApertura),
  ]);
  return generateCSV(headers, rows);
}
