/**
 * Validazione dati fiscali italiani per fatturazione elettronica.
 * Include algoritmi ufficiali per P.IVA e Codice Fiscale.
 */

import type { ValidationResult, ValidationError } from './types';

// ==================== PARTITA IVA ====================

/**
 * Valida una Partita IVA italiana (11 cifre + check digit).
 * Algoritmo ufficiale Agenzia delle Entrate.
 */
export function validatePartitaIva(piva: string): { valid: boolean; error?: string } {
  if (!piva) return { valid: false, error: 'Partita IVA obbligatoria' };

  const cleaned = piva.replace(/\s/g, '');
  if (!/^\d{11}$/.test(cleaned)) {
    return { valid: false, error: 'La Partita IVA deve contenere esattamente 11 cifre' };
  }

  // Verifica check digit con algoritmo Luhn modificato
  const digits = cleaned.split('').map(Number);
  let sumOdd = 0;
  let sumEven = 0;

  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      // Posizioni dispari (1,3,5,...) — indice 0,2,4,...
      sumOdd += digits[i];
    } else {
      // Posizioni pari (2,4,6,...) — indice 1,3,5,...
      const doubled = digits[i] * 2;
      sumEven += doubled > 9 ? doubled - 9 : doubled;
    }
  }

  const checkDigit = (10 - ((sumOdd + sumEven) % 10)) % 10;
  if (checkDigit !== digits[10]) {
    return { valid: false, error: 'Partita IVA non valida (check digit errato)' };
  }

  return { valid: true };
}

// ==================== CODICE FISCALE ====================

const CF_ODD_MAP: Record<string, number> = {
  '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
  'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
  'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
  'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23,
};

const CF_EVEN_MAP: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
  'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
  'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25,
};

/**
 * Valida un Codice Fiscale italiano (16 caratteri alfanumerici + check char).
 * Supporta anche il formato numerico a 11 cifre (coincide con P.IVA per le aziende).
 */
export function validateCodiceFiscale(cf: string): { valid: boolean; error?: string } {
  if (!cf) return { valid: false, error: 'Codice Fiscale obbligatorio' };

  const cleaned = cf.replace(/\s/g, '').toUpperCase();

  // Le aziende possono avere CF = P.IVA (11 cifre)
  if (/^\d{11}$/.test(cleaned)) {
    return validatePartitaIva(cleaned);
  }

  if (!/^[A-Z0-9]{16}$/.test(cleaned)) {
    return { valid: false, error: 'Il Codice Fiscale deve contenere 16 caratteri alfanumerici' };
  }

  // Calcola check character
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const char = cleaned[i];
    if (i % 2 === 0) {
      // Posizioni dispari (1-indexed): 1,3,5,...
      sum += CF_ODD_MAP[char] ?? 0;
    } else {
      // Posizioni pari (1-indexed): 2,4,6,...
      sum += CF_EVEN_MAP[char] ?? 0;
    }
  }

  const expectedCheck = String.fromCharCode(65 + (sum % 26)); // A=0, B=1, ...
  if (cleaned[15] !== expectedCheck) {
    return { valid: false, error: 'Codice Fiscale non valido (carattere di controllo errato)' };
  }

  return { valid: true };
}

// ==================== CODICE DESTINATARIO ====================

/**
 * Valida il Codice Destinatario SDI.
 * Deve essere "0000000" (per invio via PEC) oppure 7 caratteri alfanumerici.
 */
export function validateCodiceDestinatario(cd: string): { valid: boolean; error?: string } {
  if (!cd) return { valid: false, error: 'Codice Destinatario obbligatorio' };

  const cleaned = cd.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z0-9]{7}$/.test(cleaned)) {
    return { valid: false, error: 'Il Codice Destinatario deve contenere 7 caratteri alfanumerici' };
  }

  return { valid: true };
}

// ==================== PEC ====================

/**
 * Valida un indirizzo PEC (validazione formato email base).
 */
export function validatePEC(pec: string): { valid: boolean; error?: string } {
  if (!pec) return { valid: false, error: 'Indirizzo PEC obbligatorio' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(pec)) {
    return { valid: false, error: 'Formato PEC non valido' };
  }

  return { valid: true };
}

// ==================== VALIDAZIONE COMPLETA PRE-INVIO ====================

/**
 * Validazione completa di una fattura prima dell'invio al SDI.
 * Verifica tutti i campi obbligatori per FatturaPA 1.2.2.
 */
export function validateFatturaPerSDI(params: {
  fattura: {
    numero: string;
    data: string;
    righe: Array<{ nome: string; quantita: number; prezzoUnitario: number; iva: number; totale: number }>;
    subtotale: number;
    totale: number;
  };
  tenant: {
    ragioneSociale: string;
    partitaIva: string;
    codiceFiscale: string;
    indirizzo: string;
    citta: string;
    cap: string;
    provincia: string;
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
}): ValidationResult {
  const errori: ValidationError[] = [];

  // --- Emittente (tenant) ---
  if (!params.tenant.ragioneSociale) {
    errori.push({ campo: 'tenant.ragioneSociale', messaggio: 'Ragione sociale emittente obbligatoria' });
  }
  if (!params.tenant.partitaIva) {
    errori.push({ campo: 'tenant.partitaIva', messaggio: 'Partita IVA emittente obbligatoria' });
  } else {
    const pivaResult = validatePartitaIva(params.tenant.partitaIva);
    if (!pivaResult.valid) {
      errori.push({ campo: 'tenant.partitaIva', messaggio: pivaResult.error! });
    }
  }
  if (!params.tenant.indirizzo) errori.push({ campo: 'tenant.indirizzo', messaggio: 'Indirizzo emittente obbligatorio' });
  if (!params.tenant.citta) errori.push({ campo: 'tenant.citta', messaggio: 'Città emittente obbligatoria' });
  if (!params.tenant.cap) errori.push({ campo: 'tenant.cap', messaggio: 'CAP emittente obbligatorio' });
  if (!params.tenant.provincia) errori.push({ campo: 'tenant.provincia', messaggio: 'Provincia emittente obbligatoria' });

  // --- Cliente (cessionario) ---
  if (!params.cliente.ragioneSociale) {
    errori.push({ campo: 'cliente.ragioneSociale', messaggio: 'Ragione sociale cliente obbligatoria' });
  }

  // Il cliente deve avere almeno P.IVA o Codice Fiscale
  if (!params.cliente.partitaIva && !params.cliente.codiceFiscale) {
    errori.push({ campo: 'cliente.partitaIva', messaggio: 'Il cliente deve avere almeno Partita IVA o Codice Fiscale' });
  }
  if (params.cliente.partitaIva) {
    const pivaResult = validatePartitaIva(params.cliente.partitaIva);
    if (!pivaResult.valid) {
      errori.push({ campo: 'cliente.partitaIva', messaggio: pivaResult.error! });
    }
  }
  if (params.cliente.codiceFiscale) {
    const cfResult = validateCodiceFiscale(params.cliente.codiceFiscale);
    if (!cfResult.valid) {
      errori.push({ campo: 'cliente.codiceFiscale', messaggio: cfResult.error! });
    }
  }

  // Codice Destinatario o PEC obbligatorio
  if (!params.cliente.codiceDestinatario && !params.cliente.pec) {
    errori.push({
      campo: 'cliente.codiceDestinatario',
      messaggio: 'Il cliente deve avere Codice Destinatario o PEC per ricevere fatture elettroniche',
    });
  }
  if (params.cliente.codiceDestinatario && params.cliente.codiceDestinatario !== '0000000') {
    const cdResult = validateCodiceDestinatario(params.cliente.codiceDestinatario);
    if (!cdResult.valid) {
      errori.push({ campo: 'cliente.codiceDestinatario', messaggio: cdResult.error! });
    }
  }
  if (params.cliente.codiceDestinatario === '0000000' && !params.cliente.pec) {
    errori.push({
      campo: 'cliente.pec',
      messaggio: 'PEC obbligatoria quando il Codice Destinatario è 0000000',
    });
  }

  if (!params.cliente.indirizzo) errori.push({ campo: 'cliente.indirizzo', messaggio: 'Indirizzo cliente obbligatorio' });
  if (!params.cliente.citta) errori.push({ campo: 'cliente.citta', messaggio: 'Città cliente obbligatoria' });
  if (!params.cliente.cap) errori.push({ campo: 'cliente.cap', messaggio: 'CAP cliente obbligatorio' });
  if (!params.cliente.provincia) errori.push({ campo: 'cliente.provincia', messaggio: 'Provincia cliente obbligatoria' });

  // --- Fattura ---
  if (!params.fattura.numero) errori.push({ campo: 'fattura.numero', messaggio: 'Numero fattura obbligatorio' });
  if (!params.fattura.data) errori.push({ campo: 'fattura.data', messaggio: 'Data fattura obbligatoria' });
  if (!params.fattura.righe || params.fattura.righe.length === 0) {
    errori.push({ campo: 'fattura.righe', messaggio: 'La fattura deve contenere almeno una riga' });
  }
  if (params.fattura.totale <= 0) {
    errori.push({ campo: 'fattura.totale', messaggio: 'Il totale fattura deve essere maggiore di zero' });
  }

  // Verifica righe
  for (let i = 0; i < (params.fattura.righe?.length || 0); i++) {
    const riga = params.fattura.righe[i];
    if (!riga.nome) errori.push({ campo: `fattura.righe[${i}].nome`, messaggio: `Riga ${i + 1}: descrizione obbligatoria` });
    if (riga.quantita <= 0) errori.push({ campo: `fattura.righe[${i}].quantita`, messaggio: `Riga ${i + 1}: quantità deve essere maggiore di zero` });
    if (riga.prezzoUnitario < 0) errori.push({ campo: `fattura.righe[${i}].prezzoUnitario`, messaggio: `Riga ${i + 1}: prezzo unitario non può essere negativo` });
  }

  return {
    valido: errori.length === 0,
    errori,
  };
}
