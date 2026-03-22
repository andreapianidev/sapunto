import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { id } = await params;
  const { getOrdineById } = await import('@/lib/db/dal');
  const data = await getOrdineById(id);
  if (!data) return apiError('Ordine non trovato', 404);
  return apiResponse({ data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const body = await request.json();
    const { updateOrdine } = await import('@/lib/db/dal');
    await updateOrdine(id, body);
    return apiResponse({ id, message: 'Ordine aggiornato' });
  } catch (e) {
    return apiError(`Errore nell'aggiornamento dell'ordine: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const { deleteOrdine } = await import('@/lib/db/dal');
    await deleteOrdine(id);
    return apiResponse({ id, message: 'Ordine eliminato' });
  } catch (e) {
    return apiError(`Errore nell'eliminazione dell'ordine: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
