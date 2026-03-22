import { NextRequest } from 'next/server';

// In production, API keys would be stored in the database per tenant
// For now, we check against a simple API_MASTER_KEY env var
export async function validateApiKey(request: NextRequest): Promise<{ valid: boolean; tenantId?: string; error?: string }> {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return { valid: false, error: 'API key required. Send via X-API-Key header or Authorization: Bearer <key>' };
  }

  // Extract tenantId from API key format: sapunto_<tenantId>_<secret>
  const parts = apiKey.split('_');
  if (parts.length < 3 || parts[0] !== 'sapunto') {
    return { valid: false, error: 'Invalid API key format' };
  }

  const tenantId = parts[1];
  // Validate against stored keys (simplified: check env var)
  const masterKey = process.env.API_MASTER_KEY;
  if (masterKey && apiKey === masterKey) {
    return { valid: true, tenantId };
  }

  // TODO: In production, validate against per-tenant API keys in DB
  // For now, accept any well-formatted key in development
  if (!masterKey) {
    return { valid: true, tenantId };
  }

  return { valid: false, error: 'Invalid API key' };
}

// Helper to create standard JSON responses
export function apiResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Content-Type': 'application/json' } });
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
