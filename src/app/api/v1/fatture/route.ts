import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { getFatture } = await import('@/lib/db/dal');
  const data = await getFatture(auth.tenantId!);
  return apiResponse({ data, count: data.length });
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const body = await request.json();
    const id = `fat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { createFattura, getNextFatturaNumber } = await import('@/lib/db/dal');
    const numero = body.numero || await getNextFatturaNumber(auth.tenantId!);
    await createFattura({
      id,
      tenantId: auth.tenantId!,
      numero,
      ...body,
    });
    return apiResponse({ id, numero, message: 'Fattura creata' }, 201);
  } catch (e) {
    return apiError(`Errore nella creazione della fattura: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
