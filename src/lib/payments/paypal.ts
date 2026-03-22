/**
 * PayPal REST API Client
 *
 * Integrazione con PayPal per pagamenti e abbonamenti ricorrenti.
 * Usa l'API Orders per pagamenti singoli e Subscriptions per ricorrenti.
 *
 * Docs: https://developer.paypal.com/docs/api/
 */

// ==================== TYPES ====================

export interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalPlanRequest {
  product_id: string;
  name: string;
  description: string;
  billing_cycles: Array<{
    frequency: {
      interval_unit: 'MONTH' | 'YEAR';
      interval_count: number;
    };
    tenure_type: 'REGULAR';
    sequence: number;
    total_cycles: number; // 0 = infinito
    pricing_scheme: {
      fixed_price: {
        value: string;
        currency_code: string;
      };
    };
  }>;
  payment_preferences: {
    auto_bill_outstanding: boolean;
    setup_fee_failure_action: 'CONTINUE' | 'CANCEL';
    payment_failure_threshold: number;
  };
}

export interface PayPalPlanResponse {
  id: string;
  status: string;
  name: string;
}

export interface PayPalSubscriptionRequest {
  plan_id: string;
  custom_id?: string; // tenantId
  application_context: {
    brand_name: string;
    locale: string;
    shipping_preference: 'NO_SHIPPING';
    user_action: 'SUBSCRIBE_NOW';
    return_url: string;
    cancel_url: string;
  };
}

export interface PayPalSubscriptionResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalSubscriptionDetails {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  plan_id: string;
  custom_id?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: {
      amount: {
        value: string;
        currency_code: string;
      };
      time: string;
    };
  };
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: {
    id: string;
    status: string;
    plan_id?: string;
    custom_id?: string;
    billing_info?: {
      next_billing_time?: string;
      last_payment?: {
        amount: {
          value: string;
          currency_code: string;
        };
        time: string;
      };
    };
  };
  summary: string;
  create_time: string;
}

export interface PayPalOrderRequest {
  intent: 'CAPTURE';
  purchase_units: Array<{
    reference_id?: string;
    custom_id?: string;
    description?: string;
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  application_context: {
    brand_name: string;
    locale: string;
    return_url: string;
    cancel_url: string;
  };
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

// ==================== CLIENT ====================

class PayPalClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  }

  get isConfigured(): boolean {
    return this.clientId.length > 0 && this.clientSecret.length > 0;
  }

  /**
   * Ottiene un access token OAuth2 (con cache).
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal auth error (${response.status}): ${error}`);
    }

    const data: PayPalAccessToken = await response.json();
    this.accessToken = data.access_token;
    // Scade 5 minuti prima per sicurezza
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Crea un prodotto PayPal (necessario per i piani di abbonamento).
   */
  async createProduct(name: string, description: string): Promise<{ id: string }> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        description,
        type: 'SERVICE',
        category: 'SOFTWARE',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal create product error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Crea un piano di abbonamento PayPal.
   */
  async createPlan(request: PayPalPlanRequest): Promise<PayPalPlanResponse> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/billing/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal create plan error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Crea un abbonamento PayPal e restituisce l'URL di approvazione.
   */
  async createSubscription(request: PayPalSubscriptionRequest): Promise<PayPalSubscriptionResponse> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal create subscription error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Ottiene i dettagli di un abbonamento.
   */
  async getSubscriptionDetails(subscriptionId: string): Promise<PayPalSubscriptionDetails> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal subscription details error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Sospende un abbonamento.
   */
  async suspendSubscription(subscriptionId: string, reason: string): Promise<void> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/suspend`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal suspend subscription error (${response.status}): ${error}`);
    }
  }

  /**
   * Cancella un abbonamento.
   */
  async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal cancel subscription error (${response.status}): ${error}`);
    }
  }

  /**
   * Crea un ordine PayPal (pagamento singolo, es. per piano annuale).
   */
  async createOrder(request: PayPalOrderRequest): Promise<PayPalOrderResponse> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal create order error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Cattura un ordine PayPal dopo l'approvazione del cliente.
   */
  async captureOrder(orderId: string): Promise<PayPalOrderResponse> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal capture order error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Verifica la firma di un webhook PayPal.
   */
  async verifyWebhookSignature(params: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookId: string;
    webhookEvent: unknown;
  }): Promise<boolean> {
    const headers = await this.authHeaders();

    const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: params.webhookId,
        webhook_event: params.webhookEvent,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  }

  /**
   * Helper: crea richiesta abbonamento per un piano Sapunto.
   */
  buildSubscriptionRequest(params: {
    planId: string; // PayPal plan ID
    tenantId: string;
  }): PayPalSubscriptionRequest {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
      plan_id: params.planId,
      custom_id: params.tenantId,
      application_context: {
        brand_name: 'Sapunto',
        locale: 'it-IT',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${appUrl}/checkout/result?provider=paypal`,
        cancel_url: `${appUrl}/checkout/cancel`,
      },
    };
  }
}

export const paypalClient = new PayPalClient();
