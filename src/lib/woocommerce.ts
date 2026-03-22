/**
 * WooCommerce REST API v3 Client
 *
 * Uses query-string authentication (consumer_key / consumer_secret)
 * which is the recommended approach for HTTPS connections.
 * No external WooCommerce packages required — uses plain fetch.
 */

// ==================== Types ====================

export interface WooConfig {
  /** Store URL, e.g. https://myshop.com (no trailing slash) */
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  regular_price: string;
  stock_quantity: number | null;
  status: string;
  description: string;
  short_description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  manage_stock: boolean;
}

export interface WooOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  sku: string;
  price: number;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  date_modified: string;
  total: string;
  currency: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    company: string;
    address_1: string;
    city: string;
    postcode: string;
    state: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    state: string;
  };
  line_items: WooOrderLineItem[];
  payment_method: string;
  payment_method_title: string;
}

interface WooSystemStatus {
  environment: {
    version: string;
    wp_version: string;
  };
}

// ==================== Client ====================

class WooCommerceClient {
  private config: WooConfig;

  constructor(config: WooConfig) {
    // Normalize URL: strip trailing slash
    this.config = {
      ...config,
      url: config.url.replace(/\/+$/, ''),
    };
  }

  private get authParams(): string {
    return `consumer_key=${encodeURIComponent(this.config.consumerKey)}&consumer_secret=${encodeURIComponent(this.config.consumerSecret)}`;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const base = `${this.config.url}/wp-json/wc/v3${endpoint}`;
    const searchParams = new URLSearchParams();

    // Add auth params
    searchParams.set('consumer_key', this.config.consumerKey);
    searchParams.set('consumer_secret', this.config.consumerSecret);

    // Add additional query params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
    }

    return `${base}?${searchParams.toString()}`;
  }

  private async request<T>(
    endpoint: string,
    method = 'GET',
    body?: unknown,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);

    const headers: Record<string, string> = {};
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`WooCommerce API error (${res.status}): ${errorText}`);
    }

    return res.json();
  }

  // ==================== Products ====================

  async getProducts(params?: { page?: number; per_page?: number; status?: string }): Promise<WooProduct[]> {
    return this.request<WooProduct[]>('/products', 'GET', undefined, params as Record<string, string | number>);
  }

  async getProduct(id: number): Promise<WooProduct> {
    return this.request<WooProduct>(`/products/${id}`);
  }

  async updateProduct(id: number, data: Partial<WooProduct>): Promise<WooProduct> {
    return this.request<WooProduct>(`/products/${id}`, 'PUT', data);
  }

  // ==================== Orders ====================

  async getOrders(params?: { page?: number; per_page?: number; status?: string; after?: string }): Promise<WooOrder[]> {
    return this.request<WooOrder[]>('/orders', 'GET', undefined, params as Record<string, string | number>);
  }

  async getOrder(id: number): Promise<WooOrder> {
    return this.request<WooOrder>(`/orders/${id}`);
  }

  async updateOrder(id: number, data: Partial<WooOrder>): Promise<WooOrder> {
    return this.request<WooOrder>(`/orders/${id}`, 'PUT', data);
  }

  // ==================== Test Connection ====================

  async testConnection(): Promise<boolean> {
    try {
      await this.request<WooSystemStatus>('/system_status');
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== Factory ====================

export function createWooCommerceClient(config: WooConfig): WooCommerceClient {
  return new WooCommerceClient(config);
}
