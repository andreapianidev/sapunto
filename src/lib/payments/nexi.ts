/**
 * Nexi XPay API Client
 *
 * Integrazione con Nexi XPay per pagamenti con carta di credito.
 * Supporta HPP (Hosted Payment Page) per il primo pagamento
 * e MIT (Merchant Initiated Transaction) per i rinnovi automatici.
 *
 * Docs: https://developer.nexi.it/it
 */

// ==================== TYPES ====================

export interface NexiOrderRequest {
  order: {
    orderId: string;
    amount: string; // in centesimi (es. "6900" = €69.00)
    currency: string;
    description?: string;
    customField?: string;
  };
  paymentSession: {
    actionType: 'PAY' | 'VERIFY';
    amount: string;
    language: string;
    resultUrl: string;
    cancelUrl: string;
    notificationUrl: string;
  };
  recurrence?: {
    action: 'CONTRACT_CREATION' | 'SUBSEQUENT_PAYMENT';
    contractId: string;
    contractType: 'MIT_SCHEDULED' | 'MIT_UNSCHEDULED';
    contractFrequency?: string; // giorni tra i pagamenti (es. "30")
    contractExpiryDate?: string; // YYYY-MM-DD
  };
}

export interface NexiHppResponse {
  hostedPage: string;
  securityToken: string;
}

export interface NexiMitRequest {
  order: {
    orderId: string;
    amount: string;
    currency: string;
    description?: string;
  };
  contractId: string;
}

export interface NexiMitResponse {
  operation: {
    orderId: string;
    operationId: string;
    operationType: string;
    operationResult: string;
    operationTime: string;
    paymentMethod: string;
    paymentCircuit: string;
    paymentEndToEndId?: string;
  };
}

export interface NexiOrderStatusResponse {
  orderStatus: {
    order: {
      orderId: string;
      amount: string;
      currency: string;
    };
    operations: Array<{
      operationId: string;
      operationType: string;
      operationResult: string;
      operationTime: string;
      paymentMethod: string;
      paymentCircuit: string;
      paymentEndToEndId?: string;
      customerInfo?: {
        cardHolderName?: string;
        cardHolderEmail?: string;
      };
    }>;
  };
}

export interface NexiWebhookPayload {
  eventId: string;
  eventType: string;
  eventTime: string;
  securityToken: string;
  operation: {
    orderId: string;
    operationId: string;
    operationType: string;
    operationResult: string;
    operationTime: string;
    paymentMethod: string;
    paymentCircuit: string;
    paymentInstrumentInfo?: string;
    paymentEndToEndId?: string;
    cancelledOperationId?: string;
    operationAmount?: string;
    operationCurrency?: string;
    customerInfo?: {
      cardHolderName?: string;
      cardHolderEmail?: string;
    };
  };
}

export interface NexiContractInfo {
  contractId: string;
  contractType: string;
  contractExpiryDate?: string;
}

// ==================== CLIENT ====================

class NexiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXI_API_BASE_URL || 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    this.apiKey = process.env.NEXI_API_KEY || '';
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      'Correlation-Id': crypto.randomUUID(),
    };
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Converte un importo in euro (es. 69.00) in centesimi stringa (es. "6900")
   */
  static euroToCents(euro: number): string {
    return Math.round(euro * 100).toString();
  }

  /**
   * Converte centesimi stringa (es. "6900") in euro (es. 69.00)
   */
  static centsToEuro(cents: string): number {
    return parseInt(cents, 10) / 100;
  }

  /**
   * Crea una sessione di pagamento HPP (Hosted Payment Page).
   * Usato per il primo pagamento con creazione contratto ricorrente.
   */
  async createHppPayment(request: NexiOrderRequest): Promise<NexiHppResponse> {
    const response = await fetch(`${this.baseUrl}/orders/hpp`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nexi HPP error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Esegue un pagamento ricorrente MIT (Merchant Initiated Transaction).
   * Usato per i rinnovi automatici dopo la prima payment con contratto.
   */
  async createMitPayment(request: NexiMitRequest): Promise<NexiMitResponse> {
    const response = await fetch(`${this.baseUrl}/orders/mit`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nexi MIT error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Verifica lo stato di un ordine.
   * Da usare come fallback quando il webhook non arriva.
   */
  async getOrderStatus(orderId: string): Promise<NexiOrderStatusResponse> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nexi order status error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Disattiva un contratto ricorrente.
   */
  async deactivateContract(contractId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/contracts/${contractId}/deactivation`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nexi contract deactivation error (${response.status}): ${error}`);
    }
  }

  /**
   * Costruisce la richiesta HPP per un nuovo abbonamento Sapunto.
   */
  buildSubscriptionRequest(params: {
    orderId: string;
    amount: number; // in euro
    pianoNome: string;
    tenantId: string;
    contractId: string;
    cicloPagamento: 'mensile' | 'annuale';
  }): NexiOrderRequest {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const amountCents = NexiClient.euroToCents(params.amount);

    const contractFrequency = params.cicloPagamento === 'mensile' ? '30' : '365';

    // Scadenza contratto: 5 anni dal primo pagamento
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    const contractExpiryDate = expiryDate.toISOString().split('T')[0];

    return {
      order: {
        orderId: params.orderId,
        amount: amountCents,
        currency: 'EUR',
        description: `Sapunto ${params.pianoNome} - ${params.cicloPagamento === 'mensile' ? 'Abbonamento Mensile' : 'Abbonamento Annuale'}`,
        customField: params.tenantId,
      },
      paymentSession: {
        actionType: 'PAY',
        amount: amountCents,
        language: 'ita',
        resultUrl: `${appUrl}/checkout/result?orderId=${params.orderId}`,
        cancelUrl: `${appUrl}/checkout/cancel`,
        notificationUrl: `${appUrl}/api/webhooks/nexi`,
      },
      recurrence: {
        action: 'CONTRACT_CREATION',
        contractId: params.contractId,
        contractType: 'MIT_SCHEDULED',
        contractFrequency,
        contractExpiryDate,
      },
    };
  }

  /**
   * Costruisce la richiesta MIT per un rinnovo automatico.
   */
  buildRenewalRequest(params: {
    orderId: string;
    amount: number;
    contractId: string;
    pianoNome: string;
  }): NexiMitRequest {
    return {
      order: {
        orderId: params.orderId,
        amount: NexiClient.euroToCents(params.amount),
        currency: 'EUR',
        description: `Rinnovo Sapunto ${params.pianoNome}`,
      },
      contractId: params.contractId,
    };
  }
}

export const nexiClient = new NexiClient();
