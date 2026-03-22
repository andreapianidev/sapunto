import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { getClienti } = await import('@/lib/db/dal');
  const data = await getClienti(auth.tenantId!);
  return apiResponse({ data, count: data.length });
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const body = await request.json();
    const id = `cli-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { createCliente } = await import('@/lib/db/dal');
    await createCliente({
      id,
      tenantId: auth.tenantId!,
      dataCreazione: new Date().toISOString(),
      ...body,
    });
    return apiResponse({ id, message: 'Cliente creato' }, 201);
  } catch (e) {
    return apiError(`Errore nella creazione del cliente: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
