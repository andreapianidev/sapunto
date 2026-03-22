/**
 * Payment Gateway Manager
 *
 * Punto di ingresso unificato per tutti i metodi di pagamento:
 * - Nexi XPay (carte di credito)
 * - PayPal (carte + conto PayPal)
 * - Bonifico bancario (manuale)
 */

export { nexiClient } from './nexi';
export { paypalClient } from './paypal';

export type { NexiHppResponse, NexiWebhookPayload, NexiMitResponse } from './nexi';
export type { PayPalSubscriptionResponse, PayPalWebhookEvent, PayPalSubscriptionDetails } from './paypal';

/**
 * Genera un ID ordine univoco per le transazioni.
 * Formato: SAP-{timestamp}-{random}
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SAP-${timestamp}-${random}`;
}

/**
 * Genera un ID contratto per Nexi.
 * Formato: SAPC-{tenantId}-{random}
 */
export function generateContractId(tenantId: string): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SAPC-${tenantId}-${random}`;
}

/**
 * Informazioni per il pagamento con bonifico bancario.
 */
export function getBonificoInfo() {
  return {
    iban: process.env.BONIFICO_IBAN || '',
    intestatario: process.env.BONIFICO_INTESTATARIO || '',
    banca: process.env.BONIFICO_BANCA || '',
  };
}

/**
 * Controlla quali gateway di pagamento sono configurati.
 */
export function getAvailablePaymentMethods() {
  return {
    nexi: (process.env.NEXI_API_KEY || '').length > 0,
    paypal: (process.env.PAYPAL_CLIENT_ID || '').length > 0 && (process.env.PAYPAL_CLIENT_SECRET || '').length > 0,
    bonifico: (process.env.BONIFICO_IBAN || '').length > 0,
  };
}
