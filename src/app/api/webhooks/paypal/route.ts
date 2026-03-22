import { NextRequest, NextResponse } from 'next/server';
import { confermaPagamento, segnaTransazioneFallita } from '@/lib/actions/payments';
import type { PayPalWebhookEvent } from '@/lib/payments/paypal';

/**
 * Webhook PayPal
 *
 * Riceve notifiche da PayPal per eventi di pagamento e abbonamento.
 * Gestisce: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED,
 * BILLING.SUBSCRIPTION.* eventi.
 */
export async function POST(request: NextRequest) {
  try {
    const payload: PayPalWebhookEvent = await request.json();

    const { event_type, resource } = payload;

    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Pagamento singolo completato
        const orderId = resource.id;
        if (orderId) {
          await confermaPagamento({
            riferimentoEsterno: orderId,
            dettagliRisposta: payload as unknown as Record<string, unknown>,
          });
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId = resource.id;
        if (orderId) {
          await segnaTransazioneFallita({
            riferimentoEsterno: orderId,
            dettagliRisposta: payload as unknown as Record<string, unknown>,
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        // Abbonamento attivato
        if (resource.custom_id) {
          // custom_id contiene il tenantId
          console.log(`[PayPal] Subscription activated for tenant: ${resource.custom_id}`);
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        if (resource.custom_id) {
          console.log(`[PayPal] Subscription ${event_type} for tenant: ${resource.custom_id}`);
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        if (resource.custom_id) {
          console.log(`[PayPal] Payment failed for tenant: ${resource.custom_id}`);
        }
        break;
      }

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${event_type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[PayPal Webhook] Error:', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
