/**
 * PrestaShop Webservice REST API Client
 *
 * Uses HTTP Basic Auth with API Key (key as username, empty password).
 * API returns JSON when ?output_format=JSON is appended.
 * No external packages required — uses plain fetch.
 */

// ==================== Types ====================

export interface PrestaShopConfig {
  /** Store URL, e.g. https://myshop.com (no trailing slash) */
  url: string;
  apiKey: string;
}

export interface PrestaShopProduct {
  id: number;
  reference: string;
  name: string | Array<{ id: number; value: string }>;
  price: string;
  quantity: number;
  active: string;
  description: string | Array<{ id: number; value: string }>;
  description_short: string | Array<{ id: number; value: string }>;
  id_category_default: string;
}

export interface PrestaShopOrderRow {
  product_id: string;
  product_reference: string;
  product_name: string;
  product_quantity: string;
  unit_price_tax_incl: string;
}

export interface PrestaShopOrder {
  id: number;
  reference: string;
  current_state: string;
  date_add: string;
  total_paid: string;
  total_products: string;
  total_shipping: string;
  payment: string;
  associations?: {
    order_rows?: PrestaShopOrderRow[] | { order_row: PrestaShopOrderRow[] };
  };
}

// ==================== Helpers ====================

/** Extract text from a PrestaShop multilingual field */
function extractLangValue(field: string | Array<{ id: number; value: string }> | undefined): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field) && field.length > 0) return field[0].value || '';
  return '';
}

// ==================== Client ====================

class PrestaShopClient {
  private config: PrestaShopConfig;

  constructor(config: PrestaShopConfig) {
    this.config = {
      ...config,
      url: config.url.replace(/\/+$/, ''),
    };
  }

  private get authHeader(): string {
    return 'Basic ' + btoa(`${this.config.apiKey}:`);
  }

  private buildUrl(resource: string, params?: Record<string, string | number>): string {
    const searchParams = new URLSearchParams();
    searchParams.set('output_format', 'JSON');

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
    }

    return `${this.config.url}/api/${resource}?${searchParams.toString()}`;
  }

  private async request<T>(resource: string, params?: Record<string, string | number>): Promise<T> {
    const url = this.buildUrl(resource, params);

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: this.authHeader },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`PrestaShop API error (${res.status}): ${errorText.slice(0, 200)}`);
    }

    return res.json();
  }

  // ==================== Products ====================

  async getProducts(params?: { offset?: number; limit?: number }): Promise<PrestaShopProduct[]> {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 100;
    const data = await this.request<{ products?: PrestaShopProduct[] }>('products', {
      display: 'full',
      limit: `${offset},${limit}`,
    });
    return data.products || [];
  }

  async getProduct(id: number): Promise<PrestaShopProduct> {
    const data = await this.request<{ product: PrestaShopProduct }>(`products/${id}`);
    return data.product;
  }

  // ==================== Orders ====================

  async getOrders(params?: { offset?: number; limit?: number; sort?: string }): Promise<PrestaShopOrder[]> {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 100;
    const data = await this.request<{ orders?: PrestaShopOrder[] }>('orders', {
      display: 'full',
      limit: `${offset},${limit}`,
      sort: params?.sort || '[date_add_DESC]',
    });
    return data.orders || [];
  }

  async getOrder(id: number): Promise<PrestaShopOrder> {
    const data = await this.request<{ order: PrestaShopOrder }>(`orders/${id}`);
    return data.order;
  }

  // ==================== Test Connection ====================

  async testConnection(): Promise<boolean> {
    try {
      await this.request<unknown>('');
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== Factory ====================

export function createPrestaShopClient(config: PrestaShopConfig): PrestaShopClient {
  return new PrestaShopClient(config);
}

export { extractLangValue };
