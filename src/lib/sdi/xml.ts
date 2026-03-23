/**
 * Generazione XML FatturaPA (formato 1.2.2)
 * Standard: https://www.fatturapa.gov.it/
 *
 * Questo modulo genera XML conforme allo standard FatturaPA
 * per l'invio tramite Sistema di Interscambio (SDI).
 */

// ==================== TYPES ====================

export interface DatiFattura {
  // Progressivo invio
  progressivoInvio: string;

  // Dati cedente/prestatore (emittente)
  cedente: {
    partitaIva: string;
    codiceFiscale: string;
    denominazione: string;
    indirizzo: string;
    cap: string;
    comune: string;
    provincia: string;
    nazione: string; // "IT"
    regimeFiscale: string; // "RF01" (ordinario) by default
    telefono?: string;
    email?: string;
    pec?: string;
  };

  // Dati cessionario/committente (cliente)
  cessionario: {
    partitaIva?: string;
    codiceFiscale?: string;
    denominazione: string;
    indirizzo: string;
    cap: string;
    comune: string;
    provincia: string;
    nazione: string;
    codiceDestinatario: string; // "0000000" if PEC
    pec?: string;
  };

  // Dati fattura
  tipoDocumento: string; // "TD01" = fattura, "TD04" = nota di credito, "TD06" = parcella
  numero: string;
  data: string; // YYYY-MM-DD
  divisa: string; // "EUR"
  causale?: string;

  // Righe
  righe: Array<{
    numero: number;
    descrizione: string;
    quantita: number;
    prezzoUnitario: number;
    aliquotaIVA: number; // es. 22.00
    prezzoTotale: number;
    natura?: string; // N1-N7, obbligatorio se aliquotaIVA = 0
    riferimentoNormativo?: string; // es. "Art.15 DPR 633/72"
  }>;

  // Riepilogo IVA
  riepilogoIVA: Array<{
    aliquotaIVA: number;
    imponibile: number;
    imposta: number;
    natura?: string; // N1-N7, obbligatorio se aliquotaIVA = 0
    riferimentoNormativo?: string;
  }>;

  // Pagamento
  importoPagamento: number;
  condizionePagamento: string; // "TP02" = completo
  modalitaPagamento: string; // "MP05" = bonifico, "MP08" = carta, etc.
  dataScadenzaPagamento?: string;
  ibanBeneficiario?: string;
}

// ==================== XML HELPERS ====================

/** Escape dei caratteri speciali XML */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Formatta un numero con 2 decimali */
function fmt2(n: number): string {
  return n.toFixed(2);
}

/** Formatta un numero con 8 decimali (per prezzi unitari FatturaPA) */
function fmt8(n: number): string {
  return n.toFixed(8);
}

// ==================== GENERATOR ====================

/**
 * Genera XML FatturaPA 1.2.2 valido per l'invio tramite SDI.
 * Utilizza string concatenation per evitare dipendenze da librerie XML.
 */
export function generateFatturaPA(dati: DatiFattura): string {
  const lines: string[] = [];

  // Header XML
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<p:FatturaElettronica versione="FPR12"');
  lines.push('  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"');
  lines.push('  xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2"');
  lines.push('  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  lines.push('  xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2.2/Schema_del_file_xml_FatturaPA_v1.2.2.xsd">');

  // ==================== HEADER ====================
  lines.push('  <FatturaElettronicaHeader>');

  // DatiTrasmissione
  lines.push('    <DatiTrasmissione>');
  lines.push('      <IdTrasmittente>');
  lines.push(`        <IdPaese>${escapeXml(dati.cedente.nazione)}</IdPaese>`);
  lines.push(`        <IdCodice>${escapeXml(dati.cedente.partitaIva)}</IdCodice>`);
  lines.push('      </IdTrasmittente>');
  lines.push(`      <ProgressivoInvio>${escapeXml(dati.progressivoInvio)}</ProgressivoInvio>`);
  lines.push('      <FormatoTrasmissione>FPR12</FormatoTrasmissione>');
  lines.push(`      <CodiceDestinatario>${escapeXml(dati.cessionario.codiceDestinatario)}</CodiceDestinatario>`);
  if (dati.cessionario.pec && dati.cessionario.codiceDestinatario === '0000000') {
    lines.push(`      <PECDestinatario>${escapeXml(dati.cessionario.pec)}</PECDestinatario>`);
  }
  lines.push('    </DatiTrasmissione>');

  // CedentePrestatore
  lines.push('    <CedentePrestatore>');
  lines.push('      <DatiAnagrafici>');
  lines.push('        <IdFiscaleIVA>');
  lines.push(`          <IdPaese>${escapeXml(dati.cedente.nazione)}</IdPaese>`);
  lines.push(`          <IdCodice>${escapeXml(dati.cedente.partitaIva)}</IdCodice>`);
  lines.push('        </IdFiscaleIVA>');
  if (dati.cedente.codiceFiscale) {
    lines.push(`        <CodiceFiscale>${escapeXml(dati.cedente.codiceFiscale)}</CodiceFiscale>`);
  }
  lines.push('        <Anagrafica>');
  lines.push(`          <Denominazione>${escapeXml(dati.cedente.denominazione)}</Denominazione>`);
  lines.push('        </Anagrafica>');
  lines.push(`        <RegimeFiscale>${escapeXml(dati.cedente.regimeFiscale)}</RegimeFiscale>`);
  lines.push('      </DatiAnagrafici>');
  lines.push('      <Sede>');
  lines.push(`        <Indirizzo>${escapeXml(dati.cedente.indirizzo)}</Indirizzo>`);
  lines.push(`        <CAP>${escapeXml(dati.cedente.cap)}</CAP>`);
  lines.push(`        <Comune>${escapeXml(dati.cedente.comune)}</Comune>`);
  lines.push(`        <Provincia>${escapeXml(dati.cedente.provincia)}</Provincia>`);
  lines.push(`        <Nazione>${escapeXml(dati.cedente.nazione)}</Nazione>`);
  lines.push('      </Sede>');
  // Contatti (opzionali)
  if (dati.cedente.telefono || dati.cedente.email) {
    lines.push('      <Contatti>');
    if (dati.cedente.telefono) {
      lines.push(`        <Telefono>${escapeXml(dati.cedente.telefono)}</Telefono>`);
    }
    if (dati.cedente.email) {
      lines.push(`        <Email>${escapeXml(dati.cedente.email)}</Email>`);
    }
    lines.push('      </Contatti>');
  }
  lines.push('    </CedentePrestatore>');

  // CessionarioCommittente
  lines.push('    <CessionarioCommittente>');
  lines.push('      <DatiAnagrafici>');
  if (dati.cessionario.partitaIva) {
    lines.push('        <IdFiscaleIVA>');
    lines.push(`          <IdPaese>${escapeXml(dati.cessionario.nazione)}</IdPaese>`);
    lines.push(`          <IdCodice>${escapeXml(dati.cessionario.partitaIva)}</IdCodice>`);
    lines.push('        </IdFiscaleIVA>');
  }
  if (dati.cessionario.codiceFiscale) {
    lines.push(`        <CodiceFiscale>${escapeXml(dati.cessionario.codiceFiscale)}</CodiceFiscale>`);
  }
  lines.push('        <Anagrafica>');
  lines.push(`          <Denominazione>${escapeXml(dati.cessionario.denominazione)}</Denominazione>`);
  lines.push('        </Anagrafica>');
  lines.push('      </DatiAnagrafici>');
  lines.push('      <Sede>');
  lines.push(`        <Indirizzo>${escapeXml(dati.cessionario.indirizzo)}</Indirizzo>`);
  lines.push(`        <CAP>${escapeXml(dati.cessionario.cap)}</CAP>`);
  lines.push(`        <Comune>${escapeXml(dati.cessionario.comune)}</Comune>`);
  lines.push(`        <Provincia>${escapeXml(dati.cessionario.provincia)}</Provincia>`);
  lines.push(`        <Nazione>${escapeXml(dati.cessionario.nazione)}</Nazione>`);
  lines.push('      </Sede>');
  lines.push('    </CessionarioCommittente>');

  lines.push('  </FatturaElettronicaHeader>');

  // ==================== BODY ====================
  lines.push('  <FatturaElettronicaBody>');

  // DatiGenerali
  lines.push('    <DatiGenerali>');
  lines.push('      <DatiGeneraliDocumento>');
  lines.push(`        <TipoDocumento>${escapeXml(dati.tipoDocumento)}</TipoDocumento>`);
  lines.push(`        <Divisa>${escapeXml(dati.divisa)}</Divisa>`);
  lines.push(`        <Data>${escapeXml(dati.data)}</Data>`);
  lines.push(`        <Numero>${escapeXml(dati.numero)}</Numero>`);
  lines.push(`        <ImportoTotaleDocumento>${fmt2(dati.importoPagamento)}</ImportoTotaleDocumento>`);
  if (dati.causale) {
    lines.push(`        <Causale>${escapeXml(dati.causale)}</Causale>`);
  }
  lines.push('      </DatiGeneraliDocumento>');
  lines.push('    </DatiGenerali>');

  // DatiBeniServizi
  lines.push('    <DatiBeniServizi>');

  // Righe (DettaglioLinee)
  for (const riga of dati.righe) {
    lines.push('      <DettaglioLinee>');
    lines.push(`        <NumeroLinea>${riga.numero}</NumeroLinea>`);
    lines.push(`        <Descrizione>${escapeXml(riga.descrizione)}</Descrizione>`);
    lines.push(`        <Quantita>${fmt2(riga.quantita)}</Quantita>`);
    lines.push(`        <PrezzoUnitario>${fmt8(riga.prezzoUnitario)}</PrezzoUnitario>`);
    lines.push(`        <PrezzoTotale>${fmt2(riga.prezzoTotale)}</PrezzoTotale>`);
    lines.push(`        <AliquotaIVA>${fmt2(riga.aliquotaIVA)}</AliquotaIVA>`);
    if (riga.aliquotaIVA === 0 && riga.natura) {
      lines.push(`        <Natura>${escapeXml(riga.natura)}</Natura>`);
    }
    lines.push('      </DettaglioLinee>');
  }

  // Riepilogo IVA (DatiRiepilogo)
  for (const riepilogo of dati.riepilogoIVA) {
    lines.push('      <DatiRiepilogo>');
    lines.push(`        <AliquotaIVA>${fmt2(riepilogo.aliquotaIVA)}</AliquotaIVA>`);
    if (riepilogo.aliquotaIVA === 0 && riepilogo.natura) {
      lines.push(`        <Natura>${escapeXml(riepilogo.natura)}</Natura>`);
    }
    lines.push(`        <ImponibileImporto>${fmt2(riepilogo.imponibile)}</ImponibileImporto>`);
    lines.push(`        <Imposta>${fmt2(riepilogo.imposta)}</Imposta>`);
    lines.push('        <EsigibilitaIVA>I</EsigibilitaIVA>');
    if (riepilogo.riferimentoNormativo) {
      lines.push(`        <RiferimentoNormativo>${escapeXml(riepilogo.riferimentoNormativo)}</RiferimentoNormativo>`);
    }
    lines.push('      </DatiRiepilogo>');
  }

  lines.push('    </DatiBeniServizi>');

  // DatiPagamento
  lines.push('    <DatiPagamento>');
  lines.push(`      <CondizioniPagamento>${escapeXml(dati.condizionePagamento)}</CondizioniPagamento>`);
  lines.push('      <DettaglioPagamento>');
  lines.push(`        <ModalitaPagamento>${escapeXml(dati.modalitaPagamento)}</ModalitaPagamento>`);
  if (dati.dataScadenzaPagamento) {
    lines.push(`        <DataScadenzaPagamento>${escapeXml(dati.dataScadenzaPagamento)}</DataScadenzaPagamento>`);
  }
  lines.push(`        <ImportoPagamento>${fmt2(dati.importoPagamento)}</ImportoPagamento>`);
  if (dati.ibanBeneficiario) {
    lines.push(`        <IBANAppoggio>${escapeXml(dati.ibanBeneficiario)}</IBANAppoggio>`);
  }
  lines.push('      </DettaglioPagamento>');
  lines.push('    </DatiPagamento>');

  lines.push('  </FatturaElettronicaBody>');
  lines.push('</p:FatturaElettronica>');

  return lines.join('\n');
}

// ==================== MAPPER ====================

/**
 * Converte i dati dal formato interno Sapunto al formato DatiFattura
 * richiesto dal generatore XML FatturaPA.
 */
export function mapFatturaToSDI(params: {
  fattura: {
    numero: string;
    data: string;
    dataScadenza: string;
    righe: Array<{
      nome: string;
      quantita: number;
      prezzoUnitario: number;
      iva: number;
      totale: number;
    }>;
    subtotale: number;
    iva: number;
    totale: number;
  };
  emittente: {
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
  };
  cliente: {
    ragioneSociale: string;
    partitaIva: string;
    codiceFiscale: string;
    indirizzo: string;
    citta: string;
    cap: string;
    provincia: string;
    pec?: string | null;
    codiceDestinatario?: string | null;
  };
  progressivoInvio: string;
  tipoDocumento?: string; // default TD01
  regimeFiscale?: string; // default RF01
  modalitaPagamento?: string; // default MP05
  ibanBeneficiario?: string;
}): DatiFattura {
  const { fattura, emittente, cliente, progressivoInvio } = params;

  // Mappa le righe con numerazione progressiva
  const righe = fattura.righe.map((riga, index) => {
    const mapped: DatiFattura['righe'][0] = {
      numero: index + 1,
      descrizione: riga.nome,
      quantita: riga.quantita,
      prezzoUnitario: riga.prezzoUnitario,
      aliquotaIVA: riga.iva,
      prezzoTotale: riga.totale,
    };
    // Se IVA = 0, indica natura N4 (esente) come default
    if (riga.iva === 0) {
      mapped.natura = 'N4';
      mapped.riferimentoNormativo = 'Art.15 DPR 633/72';
    }
    return mapped;
  });

  // Calcola riepilogo IVA raggruppato per aliquota
  const ivaMap = new Map<number, { imponibile: number; imposta: number; natura?: string; riferimentoNormativo?: string }>();
  for (const riga of fattura.righe) {
    const existing = ivaMap.get(riga.iva) || { imponibile: 0, imposta: 0 };
    const imponibileRiga = riga.prezzoUnitario * riga.quantita;
    const impostaRiga = riga.totale - imponibileRiga;
    existing.imponibile += imponibileRiga;
    existing.imposta += impostaRiga;
    if (riga.iva === 0) {
      existing.natura = 'N4';
      existing.riferimentoNormativo = 'Art.15 DPR 633/72';
    }
    ivaMap.set(riga.iva, existing);
  }

  const riepilogoIVA = Array.from(ivaMap.entries()).map(([aliquota, valori]) => ({
    aliquotaIVA: aliquota,
    imponibile: Math.round(valori.imponibile * 100) / 100,
    imposta: Math.round(valori.imposta * 100) / 100,
    natura: valori.natura,
    riferimentoNormativo: valori.riferimentoNormativo,
  }));

  return {
    progressivoInvio,

    cedente: {
      partitaIva: emittente.partitaIva,
      codiceFiscale: emittente.codiceFiscale,
      denominazione: emittente.ragioneSociale,
      indirizzo: emittente.indirizzo,
      cap: emittente.cap,
      comune: emittente.citta,
      provincia: emittente.provincia,
      nazione: 'IT',
      regimeFiscale: params.regimeFiscale || 'RF01', // Regime ordinario
      telefono: emittente.telefono || undefined,
      email: emittente.email || undefined,
      pec: emittente.pec || undefined,
    },

    cessionario: {
      partitaIva: cliente.partitaIva || undefined,
      codiceFiscale: cliente.codiceFiscale || undefined,
      denominazione: cliente.ragioneSociale,
      indirizzo: cliente.indirizzo,
      cap: cliente.cap,
      comune: cliente.citta,
      provincia: cliente.provincia,
      nazione: 'IT',
      codiceDestinatario: cliente.codiceDestinatario || '0000000',
      pec: cliente.pec || undefined,
    },

    tipoDocumento: params.tipoDocumento || 'TD01', // Fattura
    numero: fattura.numero,
    data: fattura.data,
    divisa: 'EUR',

    righe,
    riepilogoIVA,

    importoPagamento: fattura.totale,
    condizionePagamento: 'TP02', // Pagamento completo
    modalitaPagamento: params.modalitaPagamento || 'MP05', // Bonifico bancario (default)
    dataScadenzaPagamento: fattura.dataScadenza,
    ibanBeneficiario: params.ibanBeneficiario,
  };
}
