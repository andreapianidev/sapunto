import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Webhook Shopify
 *
 * Riceve notifiche da Shopify per ordini e prodotti.
 * Valida la firma HMAC-SHA256 tramite header X-Shopify-Hmac-Sha256.
 */

type SapuntoOrderStatus = 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';

function mapOrderStatus(financialStatus: string, fulfillmentStatus: string | null): SapuntoOrderStatus {
  if (financialStatus === 'refunded' || financialStatus === 'voided') return 'annullato';
  if (financialStatus === 'pending') return 'nuovo';
  if (fulfillmentStatus === 'fulfilled') return 'completato';
  if (fulfillmentStatus === 'partial') return 'spedito';
  if (financialStatus === 'paid' || financialStatus === 'partially_paid') return 'in_lavorazione';
  return 'nuovo';
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'base64'), Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (secret) {
      const signature = request.headers.get('x-shopify-hmac-sha256') || '';
      if (!signature || !verifySignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const topic = request.headers.get('x-shopify-topic') || '';
    const tenantId = request.headers.get('x-sapunto-tenant-id') || '';

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenant ID' }, { status: 400 });
    }

    const dal = await import('@/lib/db/dal');

    // Handle order events
    if (topic === 'orders/create' || topic === 'orders/updated') {
      const order = payload;
      if (order.id) {
        const ordineId = `shp-${order.id}`;
        const stato = mapOrderStatus(order.financial_status || 'pending', order.fulfillment_status);
        const totale = parseFloat(order.total_price) || 0;
        const subtotale = parseFloat(order.subtotal_price) || 0;
        const iva = parseFloat(order.total_tax) || Math.max(totale - subtotale, 0);

        const clienteNome = order.billing_address?.company
          || (order.customer ? `${order.customer.first_name} ${order.customer.last_name}`.trim() : '')
          || 'Cliente Shopify';

        const righe = (order.line_items || []).map((item: { product_id: number; variant_id: number; title: string; quantity: number; price: string }) => ({
          prodottoId: `shp-prod-${item.product_id}-${item.variant_id}`,
          nome: item.title,
          quantita: item.quantity,
          prezzoUnitario: parseFloat(item.price) || 0,
          iva: 22,
          totale: item.quantity * (parseFloat(item.price) || 0),
        }));

        try {
          await dal.createOrdine({
            id: ordineId,
            tenantId,
            numero: `SH-${order.order_number}`,
            clienteId: `shp-client-${order.customer?.email || order.id}`,
            clienteNome,
            data: order.created_at ? order.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            canale: 'shopify',
            stato,
            righe,
            subtotale: subtotale.toFixed(2),
            iva: iva.toFixed(2),
            totale: totale.toFixed(2),
            note: `Ordine Shopify ${order.name || ''} — webhook`.trim(),
          });
        } catch {
          await dal.updateOrdine(ordineId, { stato, totale: totale.toFixed(2) });
        }
      }
    }

    // Handle product events
    if (topic === 'products/update' || topic === 'products/create') {
      const product = payload;
      if (product.id && product.variants) {
        for (const variant of product.variants) {
          const sku = variant.sku || `shp-${product.id}-${variant.id}`;
          const existing = await dal.getProdottoBySku(tenantId, sku);
          if (existing) {
            await dal.updateProdotto(existing.id, {
              nome: product.title,
              giacenza: variant.inventory_quantity ?? 0,
              prezzo: variant.price || '0',
              attivo: product.status === 'active',
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Shopify webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
