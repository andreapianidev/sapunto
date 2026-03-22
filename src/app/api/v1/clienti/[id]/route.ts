import { NextRequest } from 'next/server';
import { validateApiKey, apiResponse, apiError } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  const { id } = await params;
  const { getClienteById } = await import('@/lib/db/dal');
  const data = await getClienteById(id);
  if (!data) return apiError('Cliente non trovato', 404);
  return apiResponse({ data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const body = await request.json();
    const { updateCliente } = await import('@/lib/db/dal');
    await updateCliente(id, body);
    return apiResponse({ id, message: 'Cliente aggiornato' });
  } catch (e) {
    return apiError(`Errore nell'aggiornamento del cliente: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error!, 401);

  try {
    const { id } = await params;
    const { deleteCliente } = await import('@/lib/db/dal');
    await deleteCliente(id);
    return apiResponse({ id, message: 'Cliente eliminato' });
  } catch (e) {
    return apiError(`Errore nell'eliminazione del cliente: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
