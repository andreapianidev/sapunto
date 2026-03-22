import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Webhook WooCommerce
 *
 * Riceve notifiche push da WooCommerce per ordini e prodotti.
 * Valida la firma HMAC-SHA256 tramite header X-WC-Webhook-Signature.
 *
 * Topic gestiti:
 *  - order.created / order.updated
 *  - product.updated
 */

// ==================== Status Mapping ====================

type WooOrderStatus = 'processing' | 'completed' | 'cancelled' | 'on-hold' | 'pending' | 'refunded' | 'failed';
type SapuntoOrderStatus = 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';

const WOO_STATUS_MAP: Record<WooOrderStatus, SapuntoOrderStatus> = {
  processing: 'in_lavorazione',
  completed: 'completato',
  cancelled: 'annullato',
  'on-hold': 'nuovo',
  pending: 'nuovo',
  refunded: 'annullato',
  failed: 'annullato',
};

function mapOrderStatus(wooStatus: string): SapuntoOrderStatus {
  return WOO_STATUS_MAP[wooStatus as WooOrderStatus] ?? 'nuovo';
}

// ==================== Signature Verification ====================

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

// ==================== Route Handler ====================

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Validate webhook signature
    const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
    if (secret) {
      const signature = request.headers.get('x-wc-webhook-signature');
      if (!signature) {
        console.error('[WooCommerce Webhook] Missing X-WC-Webhook-Signature header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      if (!verifySignature(rawBody, signature, secret)) {
        console.error('[WooCommerce Webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[WooCommerce Webhook] WOOCOMMERCE_WEBHOOK_SECRET not configured — skipping signature validation');
    }

    // WooCommerce sends a ping on webhook creation with topic "action.woocommerce_webhook_deliver"
    const topic = request.headers.get('x-wc-webhook-topic') ?? '';
    const source = request.headers.get('x-wc-webhook-source') ?? '';

    if (!topic || topic.includes('action.woocommerce')) {
      // Ping / verification request — acknowledge and return
      console.log(`[WooCommerce Webhook] Ping from ${source}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payload = JSON.parse(rawBody);

    // Determine tenant from webhook delivery
    // WooCommerce webhooks can include a custom header or we look up by source URL
    const tenantId = request.headers.get('x-sapunto-tenant-id') ?? '';

    switch (topic) {
      case 'order.created':
      case 'order.updated': {
        await handleOrder(payload, tenantId, topic);
        break;
      }

      case 'product.updated': {
        await handleProductUpdate(payload, tenantId);
        break;
      }

      default:
        console.log(`[WooCommerce Webhook] Unhandled topic: ${topic}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[WooCommerce Webhook] Error:', error);
    // Return 200 to prevent WooCommerce from retrying indefinitely
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// ==================== Order Handler ====================

interface WooWebhookOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    company: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
    sku: string;
    price: number;
  }>;
}

async function handleOrder(payload: WooWebhookOrder, tenantId: string, topic: string) {
  if (!tenantId) {
    console.error('[WooCommerce Webhook] Cannot process order — missing tenantId');
    return;
  }

  // Lazy import DAL to avoid build-time env var issues
  const dal = await import('@/lib/db/dal');

  const wooOrder = payload;
  const sapuntoStato = mapOrderStatus(wooOrder.status);
  const clienteNome = wooOrder.billing.company
    || `${wooOrder.billing.first_name} ${wooOrder.billing.last_name}`.trim()
    || 'Cliente WooCommerce';

  // Calculate subtotale (sum of line item totals before tax)
  const subtotale = wooOrder.line_items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const totale = parseFloat(wooOrder.total);
  const iva = totale - subtotale;

  // Build righe (order lines)
  const righe = wooOrder.line_items.map((item) => ({
    prodottoId: `woo-${item.product_id}`,
    nome: item.name,
    quantita: item.quantity,
    prezzoUnitario: item.price,
    iva: 22, // Default Italian VAT
    totale: parseFloat(item.total),
  }));

  // WooCommerce order number as Sapunto order ID for idempotency
  const ordineId = `woo-${wooOrder.id}`;
  const numero = `WC-${wooOrder.number}`;

  if (topic === 'order.created') {
    try {
      await dal.createOrdine({
        id: ordineId,
        tenantId,
        numero,
        clienteId: `woo-client-${wooOrder.billing.email || wooOrder.id}`,
        clienteNome,
        data: wooOrder.date_created ? wooOrder.date_created.split('T')[0] : new Date().toISOString().split('T')[0],
        stato: sapuntoStato,
        righe,
        subtotale: subtotale.toFixed(2),
        iva: iva.toFixed(2),
        totale: totale.toFixed(2),
        canale: 'woocommerce',
        note: `Ordine WooCommerce #${wooOrder.number}`,
      });
      console.log(`[WooCommerce Webhook] Created order ${numero} for tenant ${tenantId}`);
    } catch (err) {
      // If duplicate, try update instead
      console.warn(`[WooCommerce Webhook] Could not create order ${ordineId}, attempting update:`, err);
      await dal.updateOrdine(ordineId, {
        stato: sapuntoStato,
        righe,
        subtotale: subtotale.toFixed(2),
        iva: iva.toFixed(2),
        totale: totale.toFixed(2),
      });
    }
  } else {
    // order.updated
    try {
      await dal.updateOrdine(ordineId, {
        stato: sapuntoStato,
        righe,
        subtotale: subtotale.toFixed(2),
        iva: iva.toFixed(2),
        totale: totale.toFixed(2),
        note: `Ordine WooCommerce #${wooOrder.number} (aggiornato)`,
      });
      console.log(`[WooCommerce Webhook] Updated order ${numero} for tenant ${tenantId}`);
    } catch {
      console.error(`[WooCommerce Webhook] Failed to update order ${ordineId}`);
    }
  }
}

// ==================== Product Handler ====================

interface WooWebhookProduct {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  status: string;
}

async function handleProductUpdate(payload: WooWebhookProduct, tenantId: string) {
  if (!tenantId) {
    console.error('[WooCommerce Webhook] Cannot process product — missing tenantId');
    return;
  }

  const dal = await import('@/lib/db/dal');

  const wooProduct = payload;
  if (!wooProduct.sku) {
    console.log(`[WooCommerce Webhook] Skipping product ${wooProduct.id} — no SKU`);
    return;
  }

  // Find matching product by SKU
  const existing = await dal.getProdottoBySku(tenantId, wooProduct.sku);
  if (!existing) {
    console.log(`[WooCommerce Webhook] No matching Sapunto product for SKU ${wooProduct.sku}`);
    return;
  }

  // Update stock if managed
  if (wooProduct.manage_stock && wooProduct.stock_quantity !== null) {
    await dal.updateProdotto(existing.id, {
      giacenza: wooProduct.stock_quantity,
    });
    console.log(`[WooCommerce Webhook] Updated stock for SKU ${wooProduct.sku}: ${wooProduct.stock_quantity}`);
  }
}
