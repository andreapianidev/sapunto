import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { id } = await params;
  const { getFatturaById } = await import('@/lib/db/dal');
  const data = await getFatturaById(id);
  if (!data) return apiError('Fattura non trovata', 404);
  return apiResponse({ data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const body = await request.json();
    const { updateFattura } = await import('@/lib/db/dal');
    await updateFattura(id, body);
    return apiResponse({ id, message: 'Fattura aggiornata' });
  } catch (e) {
    return apiError(`Errore nell'aggiornamento della fattura: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const { deleteFattura } = await import('@/lib/db/dal');
    await deleteFattura(id);
    return apiResponse({ id, message: 'Fattura eliminata' });
  } catch (e) {
    return apiError(`Errore nell'eliminazione della fattura: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
