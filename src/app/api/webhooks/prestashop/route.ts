import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Webhook PrestaShop
 *
 * Riceve notifiche da moduli PrestaShop per ordini e prodotti.
 * Valida la firma tramite header X-Prestashop-Webhook-Secret.
 */

type SapuntoOrderStatus = 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';

const PS_STATUS_MAP: Record<string, SapuntoOrderStatus> = {
  '1': 'nuovo', '2': 'in_lavorazione', '3': 'in_lavorazione',
  '4': 'spedito', '5': 'completato', '6': 'annullato',
  '7': 'annullato', '8': 'annullato', '9': 'in_lavorazione',
  '10': 'nuovo', '11': 'nuovo', '12': 'in_lavorazione',
};

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const secret = process.env.PRESTASHOP_WEBHOOK_SECRET;

    if (secret) {
      const signature = request.headers.get('x-prestashop-webhook-secret') || request.headers.get('x-webhook-signature') || '';
      if (!signature || !verifySignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const topic = request.headers.get('x-prestashop-topic') || payload.topic || '';
    const tenantId = request.headers.get('x-sapunto-tenant-id') || payload.tenant_id || '';

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenant ID' }, { status: 400 });
    }

    const dal = await import('@/lib/db/dal');

    if (topic.includes('order')) {
      const order = payload.order || payload;
      if (order.id) {
        const ordineId = `ps-${order.id}`;
        const stato = PS_STATUS_MAP[String(order.current_state)] || 'nuovo';
        const totale = parseFloat(order.total_paid) || 0;

        try {
          await dal.createOrdine({
            id: ordineId,
            tenantId,
            numero: `PS-${order.reference || order.id}`,
            clienteId: `ps-client-${order.id_customer || order.id}`,
            clienteNome: `Cliente PrestaShop #${order.id}`,
            data: order.date_add ? order.date_add.split(' ')[0] : new Date().toISOString().split('T')[0],
            canale: 'prestashop',
            stato,
            righe: [],
            subtotale: (parseFloat(order.total_products) || 0).toFixed(2),
            iva: Math.max(totale - (parseFloat(order.total_products) || 0), 0).toFixed(2),
            totale: totale.toFixed(2),
            note: `Ordine PrestaShop ${order.reference || ''} — webhook`.trim(),
          });
        } catch {
          await dal.updateOrdine(ordineId, { stato, totale: totale.toFixed(2) });
        }
      }
    }

    if (topic.includes('product')) {
      const product = payload.product || payload;
      if (product.id) {
        const sku = product.reference || `ps-${product.id}`;
        const existing = await dal.getProdottoBySku(tenantId, sku);
        const productData = {
          nome: typeof product.name === 'string' ? product.name : (product.name?.[0]?.value || `Prodotto PS ${product.id}`),
          sku,
          giacenza: product.quantity ?? 0,
          prezzo: product.price || '0',
          attivo: product.active === '1',
        };
        if (existing) {
          await dal.updateProdotto(existing.id, productData);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PrestaShop webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
