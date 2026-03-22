import { NextRequest, NextResponse } from 'next/server';
import { confermaPagamento, segnaTransazioneFallita } from '@/lib/actions/payments';
import type { NexiWebhookPayload } from '@/lib/payments/nexi';

/**
 * Verifica la firma HMAC-SHA256 del webhook Nexi.
 * Restituisce true se la firma è valida, false altrimenti.
 */
async function verifyNexiSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
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

  // Confronto costante nel tempo per evitare timing attacks
  if (computedHex.length !== signatureHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedHex.length; i++) {
    mismatch |= computedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Webhook Nexi XPay
 *
 * Riceve notifiche server-to-server da Nexi per conferma/rifiuto pagamenti.
 * L'endpoint deve rispondere con HTTP 200 per confermare la ricezione.
 *
 * IP sorgente Nexi (per firewall):
 * 185.198.117.13, .14, .17
 * 185.198.118.13, .14
 */
export async function POST(request: NextRequest) {
  try {
    // Leggiamo il body come testo per la validazione della firma
    const rawBody = await request.text();

    // Validazione firma HMAC-SHA256
    const webhookSecret = process.env.NEXI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signatureHeader = request.headers.get('x-webhook-signature');
      if (!signatureHeader) {
        console.error('[Nexi Webhook] Missing X-Webhook-Signature header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      const isValid = await verifyNexiSignature(rawBody, signatureHeader, webhookSecret);
      if (!isValid) {
        console.error('[Nexi Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[Nexi Webhook] NEXI_WEBHOOK_SECRET not configured — skipping signature validation (development mode)');
    }

    const payload: NexiWebhookPayload = JSON.parse(rawBody);

    const { operation } = payload;

    if (!operation?.orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const isSuccess = operation.operationResult === 'AUTHORIZED' ||
                      operation.operationResult === 'EXECUTED';

    if (isSuccess) {
      await confermaPagamento({
        riferimentoEsterno: operation.orderId,
        operationId: operation.operationId,
        dettagliRisposta: payload as unknown as Record<string, unknown>,
      });
    } else {
      await segnaTransazioneFallita({
        riferimentoEsterno: operation.orderId,
        dettagliRisposta: payload as unknown as Record<string, unknown>,
      });
    }

    // Nexi si aspetta sempre HTTP 200
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Nexi Webhook] Error:', error);
    // Restituiamo comunque 200 per evitare che Nexi continui a ritentare
    return NextResponse.json({ received: true, error: 'Internal processing error' }, { status: 200 });
  }
}
