import PDFDocument from 'pdfkit';

// ==================== TYPES ====================

interface RigaFattura {
  nome: string;
  quantita: number;
  prezzoUnitario: number;
  iva: number;
  totale: number;
}

interface FatturaData {
  numero: string;
  tipo: string;
  data: string;
  dataScadenza: string;
  stato: string;
  statoSDI: string;
  righe: RigaFattura[];
  subtotale: number;
  iva: number;
  totale: number;
}

interface ClienteData {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  pec?: string;
  codiceDestinatario?: string;
}

interface EmittenteData {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  email: string;
  pec: string;
}

interface CedolinoData {
  mese: number;
  anno: number;
  lordo: number;
  contributiInps: number;
  irpef: number;
  addizionaleRegionale: number;
  addizionaleComunale: number;
  altreRitenute: number;
  netto: number;
  dataEmissione: string;
}

interface DipendenteData {
  nome: string;
  cognome: string;
  codiceFiscale: string;
  ruoloAziendale: string;
  tipoContratto: string;
  livello: string;
  dataAssunzione: string;
  iban: string;
}

interface AziendaData {
  ragioneSociale: string;
  partitaIva: string;
  indirizzo: string;
  citta: string;
}

// ==================== HELPERS ====================

const MESI_ITALIANI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

function formatCurrency(value: number): string {
  return value.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Colors
const PRIMARY = '#1a365d';
const SECONDARY = '#2d5aa0';
const LIGHT_BG = '#f0f4f8';
const BORDER = '#cbd5e0';
const TEXT_DARK = '#1a202c';
const TEXT_MEDIUM = '#4a5568';
const TEXT_LIGHT = '#718096';

// ==================== FATTURA PDF ====================

export async function generateFatturaPDF(params: {
  fattura: FatturaData;
  cliente: ClienteData;
  emittente: EmittenteData;
}): Promise<Buffer> {
  const { fattura, cliente, emittente } = params;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const promise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // ---- HEADER ----

  // Emittente info (left)
  doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY)
    .text(emittente.ragioneSociale, 50, 40, { width: 280 });
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_MEDIUM);
  let emittenteY = doc.y + 4;
  doc.text(`P.IVA: ${emittente.partitaIva}`, 50, emittenteY);
  doc.text(`C.F.: ${emittente.codiceFiscale}`);
  doc.text(`${emittente.indirizzo}`);
  doc.text(`${emittente.cap} ${emittente.citta} (${emittente.provincia})`);
  doc.text(`Tel: ${emittente.telefono}`);
  doc.text(`Email: ${emittente.email}`);
  doc.text(`PEC: ${emittente.pec}`);

  // Fattura title and number (right)
  const tipoLabel = fattura.tipo === 'emessa' ? 'FATTURA' : 'FATTURA RICEVUTA';
  doc.fontSize(20).font('Helvetica-Bold').fillColor(PRIMARY)
    .text(tipoLabel, 330, 40, { width: 215, align: 'right' });
  doc.fontSize(11).font('Helvetica').fillColor(SECONDARY)
    .text(`N. ${fattura.numero}`, 330, doc.y + 4, { width: 215, align: 'right' });
  doc.fontSize(9).fillColor(TEXT_MEDIUM)
    .text(`Data: ${fattura.data}`, 330, doc.y + 4, { width: 215, align: 'right' });
  doc.text(`Scadenza: ${fattura.dataScadenza}`, 330, doc.y + 2, { width: 215, align: 'right' });

  // Separator line
  const headerEndY = Math.max(doc.y, 140) + 15;
  doc.moveTo(50, headerEndY).lineTo(50 + pageWidth, headerEndY)
    .strokeColor(BORDER).lineWidth(1).stroke();

  // ---- CLIENTE SECTION ----
  let currentY = headerEndY + 15;

  // Client box
  doc.rect(50, currentY, pageWidth, 80).fillColor(LIGHT_BG).fill();
  doc.rect(50, currentY, pageWidth, 80).strokeColor(BORDER).lineWidth(0.5).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT)
    .text('DESTINATARIO', 60, currentY + 8);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_DARK)
    .text(cliente.ragioneSociale, 60, currentY + 22);
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_MEDIUM);
  doc.text(`P.IVA: ${cliente.partitaIva}  -  C.F.: ${cliente.codiceFiscale}`, 60, doc.y + 3);
  doc.text(`${cliente.indirizzo}, ${cliente.cap} ${cliente.citta} (${cliente.provincia})`, 60, doc.y + 2);
  if (cliente.pec) {
    doc.text(`PEC: ${cliente.pec}`, 60, doc.y + 2);
  }
  if (cliente.codiceDestinatario) {
    doc.text(`Codice Destinatario: ${cliente.codiceDestinatario}`, 60, doc.y + 2);
  }

  // ---- TABLE HEADER ----
  currentY = currentY + 80 + 20;

  const colX = {
    descrizione: 50,
    qta: 300,
    prezzo: 350,
    iva: 420,
    totale: 470,
  };
  const colW = {
    descrizione: 245,
    qta: 45,
    prezzo: 65,
    iva: 45,
    totale: pageWidth - (470 - 50),
  };

  // Table header background
  doc.rect(50, currentY, pageWidth, 22).fillColor(PRIMARY).fill();

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('Descrizione', colX.descrizione + 8, currentY + 6, { width: colW.descrizione });
  doc.text('Qta', colX.qta, currentY + 6, { width: colW.qta, align: 'center' });
  doc.text('Prezzo Unit.', colX.prezzo, currentY + 6, { width: colW.prezzo, align: 'right' });
  doc.text('IVA %', colX.iva, currentY + 6, { width: colW.iva, align: 'center' });
  doc.text('Totale', colX.totale, currentY + 6, { width: colW.totale, align: 'right' });

  currentY += 22;

  // ---- TABLE ROWS ----
  fattura.righe.forEach((riga, index) => {
    const rowHeight = 22;

    // Alternating background
    if (index % 2 === 0) {
      doc.rect(50, currentY, pageWidth, rowHeight).fillColor(LIGHT_BG).fill();
    }

    doc.fontSize(8).font('Helvetica').fillColor(TEXT_DARK);
    doc.text(riga.nome, colX.descrizione + 8, currentY + 6, { width: colW.descrizione });
    doc.text(String(riga.quantita), colX.qta, currentY + 6, { width: colW.qta, align: 'center' });
    doc.text(`${formatCurrency(riga.prezzoUnitario)} \u20AC`, colX.prezzo, currentY + 6, { width: colW.prezzo, align: 'right' });
    doc.text(`${riga.iva}%`, colX.iva, currentY + 6, { width: colW.iva, align: 'center' });
    doc.text(`${formatCurrency(riga.totale)} \u20AC`, colX.totale, currentY + 6, { width: colW.totale, align: 'right' });

    currentY += rowHeight;
  });

  // Table bottom border
  doc.moveTo(50, currentY).lineTo(50 + pageWidth, currentY)
    .strokeColor(BORDER).lineWidth(0.5).stroke();

  // ---- TOTALS SECTION ----
  currentY += 20;
  const totalsX = 370;
  const totalsW = pageWidth - (totalsX - 50);

  // Subtotale
  doc.fontSize(9).font('Helvetica').fillColor(TEXT_MEDIUM)
    .text('Subtotale:', totalsX, currentY, { width: 80 });
  doc.font('Helvetica').fillColor(TEXT_DARK)
    .text(`${formatCurrency(fattura.subtotale)} \u20AC`, totalsX + 80, currentY, { width: totalsW - 80, align: 'right' });

  currentY += 18;

  // IVA
  doc.font('Helvetica').fillColor(TEXT_MEDIUM)
    .text('IVA:', totalsX, currentY, { width: 80 });
  doc.font('Helvetica').fillColor(TEXT_DARK)
    .text(`${formatCurrency(fattura.iva)} \u20AC`, totalsX + 80, currentY, { width: totalsW - 80, align: 'right' });

  currentY += 18;

  // Separator
  doc.moveTo(totalsX, currentY).lineTo(50 + pageWidth, currentY)
    .strokeColor(BORDER).lineWidth(0.5).stroke();

  currentY += 8;

  // Totale
  doc.rect(totalsX - 5, currentY - 3, totalsW + 10, 26).fillColor(PRIMARY).fill();
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff')
    .text('TOTALE:', totalsX + 5, currentY + 3, { width: 80 });
  doc.text(`${formatCurrency(fattura.totale)} \u20AC`, totalsX + 80, currentY + 3, { width: totalsW - 80, align: 'right' });

  // ---- FOOTER ----
  currentY += 50;

  // Payment info
  doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_DARK)
    .text('Informazioni di pagamento', 50, currentY);
  currentY += 14;
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_MEDIUM)
    .text(`Stato pagamento: ${fattura.stato.replace(/_/g, ' ')}`, 50, currentY);
  doc.text(`Stato SDI: ${fattura.statoSDI.replace(/_/g, ' ')}`, 50, doc.y + 2);
  doc.text(`Scadenza: ${fattura.dataScadenza}`, 50, doc.y + 2);

  // Bottom line
  const footerY = doc.page.height - doc.page.margins.bottom - 20;
  doc.moveTo(50, footerY).lineTo(50 + pageWidth, footerY)
    .strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica').fillColor(TEXT_LIGHT)
    .text(
      `${emittente.ragioneSociale} - P.IVA ${emittente.partitaIva} - ${emittente.indirizzo}, ${emittente.cap} ${emittente.citta} (${emittente.provincia})`,
      50,
      footerY + 5,
      { width: pageWidth, align: 'center' },
    );

  doc.end();
  return promise;
}

// ==================== CEDOLINO PDF ====================

export async function generateCedolinoPDF(params: {
  cedolino: CedolinoData;
  dipendente: DipendenteData;
  azienda: AziendaData;
}): Promise<Buffer> {
  const { cedolino, dipendente, azienda } = params;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const promise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const meseNome = MESI_ITALIANI[cedolino.mese - 1] || '';

  // ---- HEADER ----

  doc.fontSize(20).font('Helvetica-Bold').fillColor(PRIMARY)
    .text('CEDOLINO PAGA', 50, 40, { width: pageWidth, align: 'center' });
  doc.fontSize(12).font('Helvetica').fillColor(SECONDARY)
    .text(`${meseNome} ${cedolino.anno}`, 50, doc.y + 6, { width: pageWidth, align: 'center' });

  // Separator
  let currentY = doc.y + 15;
  doc.moveTo(50, currentY).lineTo(50 + pageWidth, currentY)
    .strokeColor(BORDER).lineWidth(1).stroke();

  // ---- AZIENDA SECTION ----
  currentY += 15;

  doc.rect(50, currentY, pageWidth, 55).fillColor(LIGHT_BG).fill();
  doc.rect(50, currentY, pageWidth, 55).strokeColor(BORDER).lineWidth(0.5).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT)
    .text('AZIENDA', 60, currentY + 8);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_DARK)
    .text(azienda.ragioneSociale, 60, currentY + 22);
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_MEDIUM)
    .text(`P.IVA: ${azienda.partitaIva}`, 60, doc.y + 3);
  doc.text(`${azienda.indirizzo}, ${azienda.citta}`, 60, doc.y + 2);

  // ---- DIPENDENTE SECTION ----
  currentY += 55 + 15;

  doc.rect(50, currentY, pageWidth, 90).fillColor(LIGHT_BG).fill();
  doc.rect(50, currentY, pageWidth, 90).strokeColor(BORDER).lineWidth(0.5).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT)
    .text('DIPENDENTE', 60, currentY + 8);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_DARK)
    .text(`${dipendente.nome} ${dipendente.cognome}`, 60, currentY + 22);

  doc.fontSize(8).font('Helvetica').fillColor(TEXT_MEDIUM);

  // Left column
  doc.text(`Codice Fiscale: ${dipendente.codiceFiscale}`, 60, doc.y + 4);
  doc.text(`Ruolo: ${dipendente.ruoloAziendale}`, 60, doc.y + 2);
  doc.text(`Data Assunzione: ${dipendente.dataAssunzione}`, 60, doc.y + 2);

  // Right column
  const rightColX = 310;
  doc.text(`Contratto: ${dipendente.tipoContratto}`, rightColX, currentY + 36);
  doc.text(`Livello: ${dipendente.livello}`, rightColX, doc.y + 2);

  // ---- COMPENSATION TABLE ----
  currentY += 90 + 25;

  doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY)
    .text('Dettaglio Retribuzione', 50, currentY);

  currentY += 20;

  // Table header
  doc.rect(50, currentY, pageWidth, 22).fillColor(PRIMARY).fill();
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('Voce', 60, currentY + 6, { width: 300 });
  doc.text('Importo', 360, currentY + 6, { width: pageWidth - 310, align: 'right' });

  currentY += 22;

  // Table rows
  const voci: Array<{ label: string; value: number; isDeduction: boolean; isBold?: boolean }> = [
    { label: 'Retribuzione Lorda', value: cedolino.lordo, isDeduction: false },
    { label: 'Contributi INPS', value: cedolino.contributiInps, isDeduction: true },
    { label: 'IRPEF', value: cedolino.irpef, isDeduction: true },
    { label: 'Addizionale Regionale', value: cedolino.addizionaleRegionale, isDeduction: true },
    { label: 'Addizionale Comunale', value: cedolino.addizionaleComunale, isDeduction: true },
    { label: 'Altre Ritenute', value: cedolino.altreRitenute, isDeduction: true },
  ];

  voci.forEach((voce, index) => {
    const rowHeight = 26;

    // Alternating background
    if (index % 2 === 0) {
      doc.rect(50, currentY, pageWidth, rowHeight).fillColor(LIGHT_BG).fill();
    }

    doc.fontSize(9).font('Helvetica').fillColor(TEXT_DARK);
    const prefix = voce.isDeduction ? '- ' : '';
    doc.text(`${prefix}${voce.label}`, 60, currentY + 7, { width: 300 });

    const sign = voce.isDeduction ? '- ' : '';
    doc.text(`${sign}${formatNumber(voce.value)} \u20AC`, 360, currentY + 7, { width: pageWidth - 310, align: 'right' });

    currentY += rowHeight;
  });

  // Separator before total
  doc.moveTo(50, currentY).lineTo(50 + pageWidth, currentY)
    .strokeColor(BORDER).lineWidth(0.5).stroke();

  currentY += 8;

  // Netto row (highlighted)
  doc.rect(50, currentY, pageWidth, 32).fillColor(PRIMARY).fill();
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('NETTO IN BUSTA', 60, currentY + 9, { width: 300 });
  doc.text(`${formatCurrency(cedolino.netto)} \u20AC`, 360, currentY + 9, { width: pageWidth - 310, align: 'right' });

  // ---- PAYMENT INFO ----
  currentY += 55;

  doc.rect(50, currentY, pageWidth, 50).fillColor(LIGHT_BG).fill();
  doc.rect(50, currentY, pageWidth, 50).strokeColor(BORDER).lineWidth(0.5).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT)
    .text('MODALITA\' DI PAGAMENTO', 60, currentY + 8);
  doc.fontSize(9).font('Helvetica').fillColor(TEXT_DARK)
    .text(`Accredito su conto corrente`, 60, currentY + 22);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_DARK)
    .text(`IBAN: ${dipendente.iban}`, 60, doc.y + 3);

  // ---- DATA EMISSIONE ----
  currentY += 65;
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_MEDIUM)
    .text(`Data emissione: ${cedolino.dataEmissione}`, 50, currentY);

  // ---- FOOTER ----
  const footerY = doc.page.height - doc.page.margins.bottom - 20;
  doc.moveTo(50, footerY).lineTo(50 + pageWidth, footerY)
    .strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica').fillColor(TEXT_LIGHT)
    .text(
      `${azienda.ragioneSociale} - P.IVA ${azienda.partitaIva} - ${azienda.indirizzo}, ${azienda.citta}`,
      50,
      footerY + 5,
      { width: pageWidth, align: 'center' },
    );

  doc.end();
  return promise;
}
