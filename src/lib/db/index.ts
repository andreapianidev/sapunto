import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Connessione lazy: evita errore durante il build di Next.js su Vercel
// quando DATABASE_URL non è ancora disponibile come env var a build time.
let _db: NeonHttpDatabase<typeof schema> | null = null;

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    if (!_db) {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL non configurata. Verifica le variabili d\'ambiente.');
      }
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql, { schema });
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
