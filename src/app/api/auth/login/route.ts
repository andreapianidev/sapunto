import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatori' }, { status: 400 });
    }

    // Find user by email
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    const user = users[0];

    if (!user || !user.attivo) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    // Verify password
    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
      }
    } else {
      // Legacy demo users without password hash — accept "demo12345"
      if (password !== 'demo12345') {
        return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
      }
    }

    // Create JWT session
    const token = await createSession({
      userId: user.id,
      email: user.email,
      nome: user.nome,
      cognome: user.cognome,
      tenantId: user.tenantId,
      ruolo: user.ruolo,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        tenantId: user.tenantId,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
        avatar: user.avatar,
        attivo: user.attivo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
