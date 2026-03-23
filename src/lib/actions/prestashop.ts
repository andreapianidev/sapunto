'use server';

import { createPrestaShopClient, extractLangValue } from '../prestashop';
import type { PrestaShopProduct, PrestaShopOrder, PrestaShopOrderRow } from '../prestashop';

// ==================== Status Mapping ====================

type SapuntoOrderStatus = 'nuovo' | 'in_lavorazione' | 'spedito' | 'completato' | 'annullato';

const PS_STATUS_MAP: Record<string, SapuntoOrderStatus> = {
  '1': 'nuovo',        // Awaiting check payment
  '2': 'in_lavorazione', // Payment accepted
  '3': 'in_lavorazione', // Processing
  '4': 'spedito',      // Shipped
  '5': 'completato',   // Delivered
  '6': 'annullato',    // Canceled
  '7': 'annullato',    // Refunded
  '8': 'annullato',    // Payment error
  '9': 'in_lavorazione', // On backorder
  '10': 'nuovo',       // Awaiting bank wire
  '11': 'nuovo',       // Awaiting PayPal
  '12': 'in_lavorazione', // Remote payment accepted
};

function mapOrderStatus(stateId: string): SapuntoOrderStatus {
  return PS_STATUS_MAP[stateId] ?? 'nuovo';
}

// ==================== Test Connection ====================

export async function testPrestaShopConnection(params: {
  url: string;
  apiKey: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createPrestaShopClient({
      url: params.url,
      apiKey: params.apiKey,
    });

    const connected = await client.testConnection();
    if (!connected) {
      return { success: false, error: 'Impossibile connettersi al negozio PrestaShop. Verifica URL e chiave API.' };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return { success: false, error: message };
  }
}

// ==================== Sync Products ====================

export async function syncPrestaShopProducts(
  tenantId: string,
  integrationId: string,
): Promise<{ synced: number; errors: number }> {
  const dal = await import('../db/dal');

  const integration = await dal.getIntegrazioneById(integrationId);
  if (!integration || !integration.urlNegozio || !integration.apiKey) {
    throw new Error('Integrazione non trovata o configurazione incompleta');
  }

  const client = createPrestaShopClient({
    url: integration.urlNegozio,
    apiKey: integration.apiKey,
  });

  let synced = 0;
  let errors = 0;
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    let products: PrestaShopProduct[];
    try {
      products = await client.getProducts({ offset, limit });
    } catch (err) {
      console.error(`[PrestaShop Sync] Error fetching products offset ${offset}:`, err);
      errors++;
      break;
    }

    if (products.length === 0) {
      hasMore = false;
      break;
    }

    for (const psProduct of products) {
      try {
        await upsertProduct(dal, tenantId, psProduct);
        synced++;
      } catch (err) {
        console.error(`[PrestaShop Sync] Error syncing product ${psProduct.id}:`, err);
        errors++;
      }
    }

    if (products.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
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
  psProduct: PrestaShopProduct,
) {
  const sku = psProduct.reference || `ps-${psProduct.id}`;
  const existing = await dal.getProdottoBySku(tenantId, sku);

  const productData = {
    nome: extractLangValue(psProduct.name),
    sku,
    descrizione: extractLangValue(psProduct.description_short) || extractLangValue(psProduct.description) || '',
    prezzo: psProduct.price || '0',
    prezzoAcquisto: '0',
    giacenza: psProduct.quantity ?? 0,
    scorteMinime: 0,
    categoria: 'PrestaShop',
    unita: 'pz',
    iva: 22,
    attivo: psProduct.active === '1',
  };

  if (existing) {
    await dal.updateProdotto(existing.id, productData);
  } else {
    await dal.createProdotto({
      id: `ps-prod-${psProduct.id}`,
      tenantId,
      ...productData,
    });
  }
}

// ==================== Sync Orders ====================

export async function syncPrestaShopOrders(
  tenantId: string,
  integrationId: string,
): Promise<{ synced: number; errors: number }> {
  const dal = await import('../db/dal');

  const integration = await dal.getIntegrazioneById(integrationId);
  if (!integration || !integration.urlNegozio || !integration.apiKey) {
    throw new Error('Integrazione non trovata o configurazione incompleta');
  }

  const client = createPrestaShopClient({
    url: integration.urlNegozio,
    apiKey: integration.apiKey,
  });

  let synced = 0;
  let errors = 0;
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    let orders: PrestaShopOrder[];
    try {
      orders = await client.getOrders({ offset, limit });
    } catch (err) {
      console.error(`[PrestaShop Sync] Error fetching orders offset ${offset}:`, err);
      errors++;
      break;
    }

    if (orders.length === 0) {
      hasMore = false;
      break;
    }

    for (const psOrder of orders) {
      try {
        await upsertOrder(dal, tenantId, psOrder);
        synced++;
      } catch (err) {
        console.error(`[PrestaShop Sync] Error syncing order ${psOrder.id}:`, err);
        errors++;
      }
    }

    if (orders.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
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

function getOrderRows(order: PrestaShopOrder): PrestaShopOrderRow[] {
  if (!order.associations?.order_rows) return [];
  const rows = order.associations.order_rows;
  if (Array.isArray(rows)) return rows;
  if ('order_row' in rows && Array.isArray(rows.order_row)) return rows.order_row;
  return [];
}

async function upsertOrder(
  dal: typeof import('../db/dal'),
  tenantId: string,
  psOrder: PrestaShopOrder,
) {
  const ordineId = `ps-${psOrder.id}`;
  const numero = `PS-${psOrder.reference}`;
  const sapuntoStato = mapOrderStatus(psOrder.current_state);

  const orderRows = getOrderRows(psOrder);
  const righe = orderRows.map((row) => ({
    prodottoId: `ps-prod-${row.product_id}`,
    nome: row.product_name,
    quantita: parseInt(row.product_quantity, 10) || 1,
    prezzoUnitario: parseFloat(row.unit_price_tax_incl) || 0,
    iva: 22,
    totale: (parseInt(row.product_quantity, 10) || 1) * (parseFloat(row.unit_price_tax_incl) || 0),
  }));

  const totale = parseFloat(psOrder.total_paid) || 0;
  const subtotale = parseFloat(psOrder.total_products) || 0;
  const iva = Math.max(totale - subtotale, 0);

  const orderData = {
    stato: sapuntoStato,
    righe,
    subtotale: subtotale.toFixed(2),
    iva: iva.toFixed(2),
    totale: totale.toFixed(2),
    note: `Ordine PrestaShop ${psOrder.reference} — ${psOrder.payment || ''}`.trim(),
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
        clienteId: `ps-client-${psOrder.id}`,
        clienteNome: `Cliente PrestaShop #${psOrder.id}`,
        data: psOrder.date_add ? psOrder.date_add.split(' ')[0] : new Date().toISOString().split('T')[0],
        canale: 'prestashop',
        ...orderData,
      });
    }
  } catch {
    try {
      await dal.createOrdine({
        id: ordineId,
        tenantId,
        numero,
        clienteId: `ps-client-${psOrder.id}`,
        clienteNome: `Cliente PrestaShop #${psOrder.id}`,
        data: psOrder.date_add ? psOrder.date_add.split(' ')[0] : new Date().toISOString().split('T')[0],
        canale: 'prestashop',
        ...orderData,
      });
    } catch {
      await dal.updateOrdine(ordineId, orderData);
    }
  }
}
