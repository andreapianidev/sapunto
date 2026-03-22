import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { getProdotti } = await import('@/lib/db/dal');
  const data = await getProdotti(auth.tenantId!);
  return apiResponse({ data, count: data.length });
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const body = await request.json();
    const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { createProdotto } = await import('@/lib/db/dal');
    await createProdotto({
      id,
      tenantId: auth.tenantId!,
      ...body,
    });
    return apiResponse({ id, message: 'Prodotto creato' }, 201);
  } catch (e) {
    return apiError(`Errore nella creazione del prodotto: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
