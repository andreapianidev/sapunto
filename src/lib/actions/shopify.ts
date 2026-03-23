'use server';

import { createShopifyClient } from '../shopify';
import type { ShopifyProduct, ShopifyOrder } from '../shopify';

// ==================== Status Mapping ====================

type SapuntoOrderStatus = 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';

function mapOrderStatus(financialStatus: string, fulfillmentStatus: string | null): SapuntoOrderStatus {
  if (financialStatus === 'refunded' || financialStatus === 'voided') return 'annullato';
  if (financialStatus === 'pending') return 'nuovo';
  if (fulfillmentStatus === 'fulfilled') return 'completato';
  if (fulfillmentStatus === 'partial') return 'spedito';
  if (financialStatus === 'paid' || financialStatus === 'partially_paid') return 'in_lavorazione';
  return 'nuovo';
}

// ==================== Test Connection ====================

export async function testShopifyConnection(params: {
  url: string;
  accessToken: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createShopifyClient({
      url: params.url,
      accessToken: params.accessToken,
    });

    const connected = await client.testConnection();
    if (!connected) {
      return { success: false, error: 'Impossibile connettersi al negozio Shopify. Verifica URL e Access Token.' };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return { success: false, error: message };
  }
}

// ==================== Sync Products ====================

export async function syncShopifyProducts(
  tenantId: string,
  integrationId: string,
): Promise<{ synced: number; errors: number }> {
  const dal = await import('../db/dal');

  const integration = await dal.getIntegrazioneById(integrationId);
  if (!integration || !integration.urlNegozio || !integration.apiKey) {
    throw new Error('Integrazione non trovata o configurazione incompleta');
  }

  const client = createShopifyClient({
    url: integration.urlNegozio,
    accessToken: integration.apiKey,
  });

  let synced = 0;
  let errors = 0;
  let nextPageUrl: string | undefined;
  let isFirstPage = true;

  while (isFirstPage || nextPageUrl) {
    let products: ShopifyProduct[];
    try {
      if (isFirstPage) {
        const result = await client.getProducts({ limit: 250 });
        products = result.products;
        nextPageUrl = result.nextPageUrl;
        isFirstPage = false;
      } else {
        const result = await client.getProductsNextPage(nextPageUrl!);
        products = result.products;
        nextPageUrl = result.nextPageUrl;
      }
    } catch (err) {
      console.error(`[Shopify Sync] Error fetching products:`, err);
      errors++;
      break;
    }

    if (products.length === 0) break;

    for (const shProduct of products) {
      try {
        await upsertProduct(dal, tenantId, shProduct);
        synced++;
      } catch (err) {
        console.error(`[Shopify Sync] Error syncing product ${shProduct.id}:`, err);
        errors++;
      }
    }
  }

  await dal.updateIntegrazione(integrationId, {
    prodottiMappati: synced,
    errori: errors,
    ultimoSync: new Date().toISOString(),
  });

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
  shProduct: ShopifyProduct,
) {
  // For multi-variant products, create one product per variant with distinct SKU
  // For single-variant, create one product
  const variants = shProduct.variants || [];
  if (variants.length === 0) return;

  for (const variant of variants) {
    const sku = variant.sku || `shp-${shProduct.id}-${variant.id}`;
    const existing = await dal.getProdottoBySku(tenantId, sku);

    const variantSuffix = variants.length > 1 && variant.title !== 'Default Title' ? ` — ${variant.title}` : '';

    const productData = {
      nome: `${shProduct.title}${variantSuffix}`,
      sku,
      descrizione: (shProduct.body_html || '').replace(/<[^>]*>/g, '').slice(0, 500),
      prezzo: variant.price || '0',
      prezzoAcquisto: '0',
      giacenza: variant.inventory_quantity ?? 0,
      scorteMinime: 0,
      categoria: shProduct.product_type || 'Shopify',
      unita: 'pz',
      iva: 22,
      attivo: shProduct.status === 'active',
    };

    if (existing) {
      await dal.updateProdotto(existing.id, productData);
    } else {
      await dal.createProdotto({
        id: `shp-prod-${shProduct.id}-${variant.id}`,
        tenantId,
        ...productData,
      });
    }
  }
}

// ==================== Sync Orders ====================

export async function syncShopifyOrders(
  tenantId: string,
  integrationId: string,
): Promise<{ synced: number; errors: number }> {
  const dal = await import('../db/dal');

  const integration = await dal.getIntegrazioneById(integrationId);
  if (!integration || !integration.urlNegozio || !integration.apiKey) {
    throw new Error('Integrazione non trovata o configurazione incompleta');
  }

  const client = createShopifyClient({
    url: integration.urlNegozio,
    accessToken: integration.apiKey,
  });

  let synced = 0;
  let errors = 0;
  let nextPageUrl: string | undefined;
  let isFirstPage = true;

  while (isFirstPage || nextPageUrl) {
    let orders: ShopifyOrder[];
    try {
      if (isFirstPage) {
        const params: { limit?: number; updated_at_min?: string } = { limit: 250 };
        if (integration.ultimoSync) params.updated_at_min = integration.ultimoSync;
        const result = await client.getOrders(params);
        orders = result.orders;
        nextPageUrl = result.nextPageUrl;
        isFirstPage = false;
      } else {
        const result = await client.getOrdersNextPage(nextPageUrl!);
        orders = result.orders;
        nextPageUrl = result.nextPageUrl;
      }
    } catch (err) {
      console.error(`[Shopify Sync] Error fetching orders:`, err);
      errors++;
      break;
    }

    if (orders.length === 0) break;

    for (const shOrder of orders) {
      try {
        await upsertOrder(dal, tenantId, shOrder);
        synced++;
      } catch (err) {
        console.error(`[Shopify Sync] Error syncing order ${shOrder.id}:`, err);
        errors++;
      }
    }
  }

  await dal.updateIntegrazione(integrationId, {
    ordiniSincronizzati: (integration.ordiniSincronizzati || 0) + synced,
    errori: errors,
    ultimoSync: new Date().toISOString(),
  });

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

async function upsertOrder(
  dal: typeof import('../db/dal'),
  tenantId: string,
  shOrder: ShopifyOrder,
) {
  const ordineId = `shp-${shOrder.id}`;
  const numero = `SH-${shOrder.order_number}`;
  const sapuntoStato = mapOrderStatus(shOrder.financial_status, shOrder.fulfillment_status);

  const clienteNome = shOrder.billing_address?.company
    || (shOrder.customer ? `${shOrder.customer.first_name} ${shOrder.customer.last_name}`.trim() : '')
    || 'Cliente Shopify';

  const righe = shOrder.line_items.map((item) => ({
    prodottoId: `shp-prod-${item.product_id}-${item.variant_id}`,
    nome: item.title,
    quantita: item.quantity,
    prezzoUnitario: parseFloat(item.price) || 0,
    iva: 22,
    totale: item.quantity * (parseFloat(item.price) || 0),
  }));

  const totale = parseFloat(shOrder.total_price) || 0;
  const subtotale = parseFloat(shOrder.subtotal_price) || 0;
  const iva = parseFloat(shOrder.total_tax) || Math.max(totale - subtotale, 0);

  const orderData = {
    stato: sapuntoStato,
    righe,
    subtotale: subtotale.toFixed(2),
    iva: iva.toFixed(2),
    totale: totale.toFixed(2),
    note: `Ordine Shopify ${shOrder.name} — ${shOrder.gateway || ''}`.trim(),
  };

  try {
    const existing = await dal.getOrdini(tenantId);
    const found = existing.find((o) => o.id === ordineId);

    if (found) {
      await dal.updateOrdine(ordineId, orderData);
    } else {
      await dal.createOrdine({
        id: ordineId,
        tenantId,
        numero,
        clienteId: `shp-client-${shOrder.customer?.email || shOrder.id}`,
        clienteNome,
        data: shOrder.created_at ? shOrder.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        canale: 'shopify',
        ...orderData,
      });
    }
  } catch {
    try {
      await dal.createOrdine({
        id: ordineId,
        tenantId,
        numero,
        clienteId: `shp-client-${shOrder.customer?.email || shOrder.id}`,
        clienteNome,
        data: shOrder.created_at ? shOrder.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        canale: 'shopify',
        ...orderData,
      });
    } catch {
      await dal.updateOrdine(ordineId, orderData);
    }
  }
}
