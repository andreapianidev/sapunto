import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifica la firma HMAC-SHA256 del webhook SDI.
 */
async function verifySDISignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedHex.length !== signatureHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedHex.length; i++) {
    mismatch |= computedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Webhook SDI — Riceve notifiche dall'intermediario
 *
 * Gestisce le notifiche del Sistema di Interscambio:
 * - RC: Ricevuta di Consegna
 * - NS: Notifica di Scarto
 * - MC: Notifica di Mancata Consegna
 * - EC: Esito Committente
 * - AT: Attestazione di Avvenuta Trasmissione
 * - DT: Decorrenza Termini
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Validazione firma
    const webhookSecret = process.env.SDI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-sdi-signature') || request.headers.get('x-webhook-signature') || '';
      const isValid = await verifySDISignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Webhook SDI: firma non valida');
        return NextResponse.json({ error: 'Firma non valida' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Lazy imports
    const dal = await import('@/lib/db/dal');

    const {
      sdiIdentificativo,
      tipo, // RC, NS, MC, EC, AT, DT
      stato, // consegnata, scartata, accettata, rifiutata, in_attesa
      descrizione,
      erroreDettaglio,
    } = payload;

    if (!sdiIdentificativo) {
      return NextResponse.json({ error: 'sdiIdentificativo obbligatorio' }, { status: 400 });
    }

    // Mappa tipo notifica
    const tipoNotificaMap: Record<string, string> = {
      'RC': 'Ricevuta di Consegna',
      'NS': 'Notifica di Scarto',
      'MC': 'Notifica di Mancata Consegna',
      'EC': 'Esito Committente',
      'AT': 'Attestazione di Avvenuta Trasmissione',
      'DT': 'Decorrenza Termini',
    };

    // Trova la fattura per sdiIdentificativo
    const fattureInAttesa = await dal.getFattureInAttesaSDI();
    const fattura = fattureInAttesa.find(f => f.sdiIdentificativo === sdiIdentificativo);

    if (!fattura) {
      console.warn(`Webhook SDI: fattura non trovata per sdiIdentificativo=${sdiIdentificativo}`);
      return NextResponse.json({ received: true, warning: 'fattura non trovata' });
    }

    // Verifica idempotenza
    const existingNotifiche = fattura.notificheSDI || [];
    const now = new Date().toISOString();
    const tipoNotifica = tipoNotificaMap[tipo] || tipo;

    const isDuplicate = existingNotifiche.some(
      n => n.tipo === tipoNotifica && n.descrizione === (descrizione || tipoNotifica)
    );

    if (!isDuplicate) {
      const notificheSDI = [
        ...existingNotifiche,
        { tipo: tipoNotifica, data: now, descrizione: descrizione || tipoNotifica },
      ];

      const statoSDI = stato || fattura.statoSDI;

      await dal.updateFatturaSDI(fattura.id, {
        statoSDI,
        notificheSDI,
        sdiErroreDettaglio: erroreDettaglio || null,
      });

      // Log
      await dal.createLogSdi({
        id: `log-sdi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fatturaId: fattura.id,
        tenantId: fattura.tenantId,
        azione: 'notifica',
        stato: 'successo',
        dettagli: { tipo, statoSDI, descrizione },
        data: now,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Errore webhook SDI:', error);
    return NextResponse.json({ received: true, error: 'Errore interno' });
  }
}
