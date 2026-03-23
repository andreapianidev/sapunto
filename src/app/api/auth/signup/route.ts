import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ragioneSociale, partitaIva, email, password, nome, cognome, piano: pianoParam } = body;
    const piano = ['express', 'explore', 'experience'].includes(pianoParam) ? pianoParam : 'explore';

    if (!ragioneSociale || !partitaIva || !email || !password || !nome || !cognome) {
      return NextResponse.json({ error: 'Tutti i campi obbligatori devono essere compilati' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La password deve essere di almeno 8 caratteri' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Un utente con questa email esiste già' }, { status: 409 });
    }

    // Generate IDs
    const tenantId = `t-${Date.now()}`;
    const userId = `u-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create tenant
    await db.insert(schema.tenants).values({
      id: tenantId,
      ragioneSociale,
      partitaIva,
      codiceFiscale: partitaIva,
      indirizzo: '',
      citta: '',
      cap: '',
      provincia: '',
      telefono: '',
      email,
      pec: '',
      codiceDestinatario: '0000000',
      piano,
      stato: 'trial',
      dataCreazione: now,
      dataScadenza: trialEnd,
      maxUtenti: 3,
      utentiAttivi: 1,
    });

    // Create admin user
    await db.insert(schema.users).values({
      id: userId,
      tenantId,
      nome,
      cognome,
      email,
      passwordHash,
      ruolo: 'tenant_admin',
      attivo: true,
    });

    // Create session
    const token = await createSession({
      userId,
      email,
      nome,
      cognome,
      tenantId,
      ruolo: 'tenant_admin',
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: userId,
        tenantId,
        nome,
        cognome,
        email,
        ruolo: 'tenant_admin' as const,
        avatar: null,
        attivo: true,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
