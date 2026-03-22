import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { getOrdini } = await import('@/lib/db/dal');
  const data = await getOrdini(auth.tenantId!);
  return apiResponse({ data, count: data.length });
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const body = await request.json();
    const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { createOrdine, getNextOrdineNumber } = await import('@/lib/db/dal');
    const numero = body.numero || await getNextOrdineNumber(auth.tenantId!);
    await createOrdine({
      id,
      tenantId: auth.tenantId!,
      numero,
      ...body,
    });
    return apiResponse({ id, numero, message: 'Ordine creato' }, 201);
  } catch (e) {
    return apiError(`Errore nella creazione dell'ordine: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
