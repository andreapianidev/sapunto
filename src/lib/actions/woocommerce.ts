'use server';

import { createWooCommerceClient } from '../woocommerce';
import type { WooProduct, WooOrder } from '../woocommerce';

// ==================== Test Connection ====================

export async function testWooConnection(params: {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createWooCommerceClient({
      url: params.url,
      consumerKey: params.consumerKey,
      consumerSecret: params.consumerSecret,
    });

    const connected = await client.testConnection();
    if (!connected) {
      return { success: false, error: 'Impossibile connettersi al negozio WooCommerce. Verifica URL e credenziali API.' };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return { success: false, error: message };
  }
}

// ==================== Sync Products ====================

export async function syncProducts(
  tenantId: string,
  integrationId: string,
): Promise<{ synced: number; errors: number }> {
  // Lazy imports to avoid build-time env var issues
  const dal = await import('../db/dal');

  const integration = await dal.getIntegrazioneById(integrationId);
  if (!integration || !integration.urlNegozio || !integration.apiKey || !integration.apiSecret) {
    throw new Error('Integrazione non trovata o configurazione incompleta');
  }

  const client = createWooCommerceClient({
    url: integration.urlNegozio,
    consumerKey: integration.apiKey,
    consumerSecret: integration.apiSecret,
  });

  let synced = 0;
  let errors = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    let products: WooProduct[];
    try {
      products = await client.getProducts({ page, per_page: 100 });
    } catch (err) {
      console.error(`[WooCommerce Sync] Error fetching products page ${page}:`, err);
      errors++;
      break;
    }

    if (products.length === 0) {
      hasMore = false;
      break;
    }

    for (const wooProduct of products) {
      try {
        await upsertProduct(dal, tenantId, wooProduct);
        synced++;
      } catch (err) {
        console.error(`[WooCommerce Sync] Error syncing product ${wooProduct.id} (${wooProduct.sku}):`, err);
        errors++;
      }
    }

    // WooCommerce returns fewer than per_page when on last page
    if (products.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Update integration record
  await dal.updateIntegrazione(integrationId, {
    prodottiMappati: synced,
    errori: errors,
    ultimoSync: new Date().toISOString(),
  });

  // Log sync
  await dal.createLogSync({
    id: `log-${crypto.randomUUID().slice(0, 8)}`,
    integrazioneId: integrationId,
    data: new Date().toISOString(),
    tipo: 'prodotto',
    stato: errors > 0 ? 'errore' : 'successo',
    messaggio: `Sincronizzati ${synced} prodotti, ${errors} errori`,
  });

  return { synced, errors };
}

async function upsertProduct(
  dal: typeof import('../db/dal'),
  tenantId: string,
  wooProduct: WooProduct,
) {
  const sku = wooProduct.sku || `woo-${wooProduct.id}`;

  // Try to find existing product by SKU
  const existing = await dal.getProdottoBySku(tenantId, sku);

  const productData = {
    nome: wooProduct.name,
    sku,
    descrizione: wooProduct.short_description || wooProduct.description || '',
    prezzo: wooProduct.price || wooProduct.regular_price || '0',
    prezzoAcquisto: '0',
    giacenza: wooProduct.stock_quantity ?? 0,
    scorteMinime: 0,
    categoria: wooProduct.categories?.[0]?.name ?? 'WooCommerce',
    unita: 'pz',
    iva: 22,
    attivo: wooProduct.status === 'publish',
  };

  if (existing) {
    await dal.updateProdotto(existing.id, productData);
  } else {
    await dal.createProdotto({
      id: `woo-prod-${wooProduct.id}`,
      tenantId,
      ...productData,
    });
  }
}

// ==================== Sync Orders ====================

export async function syncOrders(
  tenantId: string,
  integrationId: string,
): Promise<{ synced: number; errors: number }> {
  const dal = await import('../db/dal');

  const integration = await dal.getIntegrazioneById(integrationId);
  if (!integration || !integration.urlNegozio || !integration.apiKey || !integration.apiSecret) {
    throw new Error('Integrazione non trovata o configurazione incompleta');
  }

  const client = createWooCommerceClient({
    url: integration.urlNegozio,
    consumerKey: integration.apiKey,
    consumerSecret: integration.apiSecret,
  });

  let synced = 0;
  let errors = 0;
  let page = 1;
  let hasMore = true;

  // Fetch orders created/updated after last sync, or all if first sync
  const params: Record<string, string | number> = {
    page,
    per_page: 100,
    orderby: 'date',
    order: 'desc',
  };
  if (integration.ultimoSync) {
    params.after = integration.ultimoSync;
  }

  while (hasMore) {
    let orders: WooOrder[];
    try {
      orders = await client.getOrders({ ...params, page } as { page: number; per_page: number; status?: string; after?: string });
    } catch (err) {
      console.error(`[WooCommerce Sync] Error fetching orders page ${page}:`, err);
      errors++;
      break;
    }

    if (orders.length === 0) {
      hasMore = false;
      break;
    }

    for (const wooOrder of orders) {
      try {
        await upsertOrder(dal, tenantId, wooOrder);
        synced++;
      } catch (err) {
        console.error(`[WooCommerce Sync] Error syncing order ${wooOrder.id}:`, err);
        errors++;
      }
    }

    if (orders.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Update integration record
  await dal.updateIntegrazione(integrationId, {
    ordiniSincronizzati: (integration.ordiniSincronizzati || 0) + synced,
    errori: errors,
    ultimoSync: new Date().toISOString(),
  });

  // Log sync
  await dal.createLogSync({
    id: `log-${crypto.randomUUID().slice(0, 8)}`,
    integrazioneId: integrationId,
    data: new Date().toISOString(),
    tipo: 'ordine',
    stato: errors > 0 ? 'errore' : 'successo',
    messaggio: `Sincronizzati ${synced} ordini, ${errors} errori`,
  });

  return { synced, errors };
}

// ==================== WooCommerce Status Mapping ====================

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

async function upsertOrder(
  dal: typeof import('../db/dal'),
  tenantId: string,
  wooOrder: WooOrder,
) {
  const ordineId = `woo-${wooOrder.id}`;
  const numero = `WC-${wooOrder.number}`;
  const sapuntoStato = mapOrderStatus(wooOrder.status);

  const clienteNome = wooOrder.billing.company
    || `${wooOrder.billing.first_name} ${wooOrder.billing.last_name}`.trim()
    || 'Cliente WooCommerce';

  // Build order lines
  const righe = wooOrder.line_items.map((item) => ({
    prodottoId: `woo-prod-${item.product_id}`,
    nome: item.name,
    quantita: item.quantity,
    prezzoUnitario: item.price,
    iva: 22,
    totale: parseFloat(item.total),
  }));

  const subtotale = wooOrder.line_items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const totale = parseFloat(wooOrder.total);
  const iva = Math.max(totale - subtotale, 0);

  const orderData = {
    stato: sapuntoStato,
    righe,
    subtotale: subtotale.toFixed(2),
    iva: iva.toFixed(2),
    totale: totale.toFixed(2),
    note: `Ordine WooCommerce #${wooOrder.number} — ${wooOrder.payment_method_title || ''}`.trim(),
  };

  // Try update first (order may already exist from webhook or previous sync)
  try {
    // Check existence by trying to fetch ordini for the tenant and matching
    const existing = await dal.getOrdini(tenantId);
    const found = existing.find((o) => o.id === ordineId);

    if (found) {
      await dal.updateOrdine(ordineId, orderData);
    } else {
      await dal.createOrdine({
        id: ordineId,
        tenantId,
        numero,
        clienteId: `woo-client-${wooOrder.billing.email || wooOrder.id}`,
        clienteNome,
        data: wooOrder.date_created ? wooOrder.date_created.split('T')[0] : new Date().toISOString().split('T')[0],
        canale: 'woocommerce',
        ...orderData,
      });
    }
  } catch {
    // Fallback: try create, if fails try update
    try {
      await dal.createOrdine({
        id: ordineId,
        tenantId,
        numero,
        clienteId: `woo-client-${wooOrder.billing.email || wooOrder.id}`,
        clienteNome,
        data: wooOrder.date_created ? wooOrder.date_created.split('T')[0] : new Date().toISOString().split('T')[0],
        canale: 'woocommerce',
        ...orderData,
      });
    } catch {
      await dal.updateOrdine(ordineId, orderData);
    }
  }
}
