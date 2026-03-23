/**
 * Shopify Admin REST API Client (2024-01)
 *
 * Uses X-Shopify-Access-Token header for authentication.
 * Supports cursor-based pagination via Link header.
 * No external packages required — uses plain fetch.
 */

// ==================== Types ====================

export interface ShopifyConfig {
  /** Store URL, e.g. https://myshop.myshopify.com (no trailing slash) */
  url: string;
  accessToken: string;
}

export interface ShopifyProductVariant {
  id: number;
  sku: string;
  price: string;
  inventory_quantity: number;
  inventory_management: string | null;
  title: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: string;
  variants: ShopifyProductVariant[];
}

export interface ShopifyOrderLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    company?: string;
  } | null;
  line_items: ShopifyOrderLineItem[];
  billing_address?: {
    first_name: string;
    last_name: string;
    company: string;
  };
  gateway: string;
}

interface ShopifyShop {
  shop: {
    id: number;
    name: string;
    email: string;
    domain: string;
  };
}

// ==================== Client ====================

const API_VERSION = '2024-01';

class ShopifyClient {
  private config: ShopifyConfig;

  constructor(config: ShopifyConfig) {
    this.config = {
      ...config,
      url: config.url.replace(/\/+$/, ''),
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const base = `${this.config.url}/admin/api/${API_VERSION}${endpoint}`;
    if (!params || Object.keys(params).length === 0) return base;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    return `${base}?${searchParams.toString()}`;
  }

  private async request<T>(endpoint: string, params?: Record<string, string | number>): Promise<{ data: T; nextPageUrl?: string }> {
    const url = this.buildUrl(endpoint, params);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Shopify API error (${res.status}): ${errorText.slice(0, 200)}`);
    }

    // Parse cursor-based pagination from Link header
    let nextPageUrl: string | undefined;
    const linkHeader = res.headers.get('Link');
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch) nextPageUrl = nextMatch[1];
    }

    const data = await res.json();
    return { data, nextPageUrl };
  }

  private async requestDirect<T>(fullUrl: string): Promise<{ data: T; nextPageUrl?: string }> {
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Shopify API error (${res.status}): ${errorText.slice(0, 200)}`);
    }

    let nextPageUrl: string | undefined;
    const linkHeader = res.headers.get('Link');
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch) nextPageUrl = nextMatch[1];
    }

    const data = await res.json();
    return { data, nextPageUrl };
  }

  // ==================== Products ====================

  async getProducts(params?: { limit?: number }): Promise<{ products: ShopifyProduct[]; nextPageUrl?: string }> {
    const { data, nextPageUrl } = await this.request<{ products: ShopifyProduct[] }>('/products.json', {
      limit: params?.limit ?? 250,
    });
    return { products: data.products || [], nextPageUrl };
  }

  async getProductsNextPage(nextUrl: string): Promise<{ products: ShopifyProduct[]; nextPageUrl?: string }> {
    const { data, nextPageUrl } = await this.requestDirect<{ products: ShopifyProduct[] }>(nextUrl);
    return { products: data.products || [], nextPageUrl };
  }

  async getProduct(id: number): Promise<ShopifyProduct> {
    const { data } = await this.request<{ product: ShopifyProduct }>(`/products/${id}.json`);
    return data.product;
  }

  // ==================== Orders ====================

  async getOrders(params?: { limit?: number; status?: string; updated_at_min?: string }): Promise<{ orders: ShopifyOrder[]; nextPageUrl?: string }> {
    const queryParams: Record<string, string | number> = {
      limit: params?.limit ?? 250,
      status: params?.status || 'any',
    };
    if (params?.updated_at_min) queryParams.updated_at_min = params.updated_at_min;

    const { data, nextPageUrl } = await this.request<{ orders: ShopifyOrder[] }>('/orders.json', queryParams);
    return { orders: data.orders || [], nextPageUrl };
  }

  async getOrdersNextPage(nextUrl: string): Promise<{ orders: ShopifyOrder[]; nextPageUrl?: string }> {
    const { data, nextPageUrl } = await this.requestDirect<{ orders: ShopifyOrder[] }>(nextUrl);
    return { orders: data.orders || [], nextPageUrl };
  }

  // ==================== Test Connection ====================

  async testConnection(): Promise<boolean> {
    try {
      await this.request<ShopifyShop>('/shop.json');
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== Factory ====================

export function createShopifyClient(config: ShopifyConfig): ShopifyClient {
  return new ShopifyClient(config);
}
