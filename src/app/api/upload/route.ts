import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, validateFile, MAX_FILE_SIZE } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'uploads';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      );
    }

    // Validazione dimensione
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Il file supera la dimensione massima consentita (${MAX_FILE_SIZE / (1024 * 1024)}MB)` },
        { status: 413 }
      );
    }

    // Validazione tipo e dimensione
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload su Vercel Blob
    const result = await uploadFile(file, folder);

    return NextResponse.json({
      url: result.url,
      pathname: result.pathname,
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof Error && error.message === 'BLOB_READ_WRITE_TOKEN non configurato') {
      return NextResponse.json(
        { error: 'Servizio di storage non configurato' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante il caricamento del file' },
      { status: 500 }
    );
  }
}
