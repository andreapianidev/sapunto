import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { id } = await params;
  const { getProdottoById } = await import('@/lib/db/dal');
  const data = await getProdottoById(id);
  if (!data) return apiError('Prodotto non trovato', 404);
  return apiResponse({ data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const body = await request.json();
    const { updateProdotto } = await import('@/lib/db/dal');
    await updateProdotto(id, body);
    return apiResponse({ id, message: 'Prodotto aggiornato' });
  } catch (e) {
    return apiError(`Errore nell'aggiornamento del prodotto: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const { deleteProdotto } = await import('@/lib/db/dal');
    await deleteProdotto(id);
    return apiResponse({ id, message: 'Prodotto eliminato' });
  } catch (e) {
    return apiError(`Errore nell'eliminazione del prodotto: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
