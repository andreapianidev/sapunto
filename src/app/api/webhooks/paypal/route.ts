import { NextRequest, NextResponse } from 'next/server';
import { confermaPagamento, segnaTransazioneFallita } from '@/lib/actions/payments';
import { paypalClient } from '@/lib/payments/paypal';
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
    // Leggiamo il body come testo per la validazione della firma
    const rawBody = await request.text();

    // Validazione firma webhook PayPal
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const authAlgo = request.headers.get('paypal-auth-algo');
      const certUrl = request.headers.get('paypal-cert-url');
      const transmissionId = request.headers.get('paypal-transmission-id');
      const transmissionSig = request.headers.get('paypal-transmission-sig');
      const transmissionTime = request.headers.get('paypal-transmission-time');

      if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
        console.error('[PayPal Webhook] Missing required PayPal signature headers');
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
      }

      const isValid = await paypalClient.verifyWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent: JSON.parse(rawBody),
      });

      if (!isValid) {
        console.error('[PayPal Webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[PayPal Webhook] PAYPAL_WEBHOOK_ID not configured — skipping signature validation (development mode)');
    }

    const payload: PayPalWebhookEvent = JSON.parse(rawBody);

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
