import { put, del } from '@vercel/blob';

// Costanti
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/csv',
];

// Lazy check del token — non disponibile a build time su Vercel
function getToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN non configurato');
  }
  return token;
}

/**
 * Valida un file prima dell'upload.
 * Controlla dimensione e tipo MIME.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Il file supera la dimensione massima consentita (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo di file non consentito: ${file.type}. Tipi accettati: ${ALLOWED_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Carica un file su Vercel Blob.
 * @param file - Il file da caricare
 * @param folder - La cartella di destinazione (es. "logos", "attachments", "documents")
 * @returns L'URL pubblico e il pathname del file caricato
 */
export async function uploadFile(
  file: File,
  folder: string
): Promise<{ url: string; pathname: string }> {
  const token = getToken();

  const pathname = `${folder}/${Date.now()}-${file.name}`;

  const blob = await put(pathname, file, {
    access: 'public',
    token,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

/**
 * Elimina un file da Vercel Blob.
 * @param url - L'URL del file da eliminare
 */
export async function deleteFile(url: string): Promise<void> {
  const token = getToken();

  await del(url, { token });
}

/**
 * Ottiene un URL pre-firmato per upload lato client.
 * @param pathname - Il percorso di destinazione del file
 * @param options - Opzioni aggiuntive (es. contentType)
 * @returns L'URL pubblico e l'URL di upload pre-firmato
 */
export async function getUploadUrl(
  pathname: string,
  options?: { contentType?: string }
): Promise<{ url: string; uploadUrl: string }> {
  const token = getToken();

  const blob = await put(pathname, new Blob([]), {
    access: 'public',
    token,
    contentType: options?.contentType,
    multipart: true,
  });

  return {
    url: blob.url,
    uploadUrl: blob.url,
  };
}
