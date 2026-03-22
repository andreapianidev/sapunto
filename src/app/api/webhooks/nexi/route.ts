import { NextRequest, NextResponse } from 'next/server';
import { confermaPagamento, segnaTransazioneFallita } from '@/lib/actions/payments';
import type { NexiWebhookPayload } from '@/lib/payments/nexi';

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
    const payload: NexiWebhookPayload = await request.json();

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
