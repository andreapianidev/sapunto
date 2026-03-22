import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null, tenant: null });
    }

    // Fetch fresh user data
    const users = await db.select().from(schema.users).where(eq(schema.users.id, session.userId));
    const user = users[0];
    if (!user || !user.attivo) {
      return NextResponse.json({ user: null, tenant: null });
    }

    // Fetch tenant data (if not superadmin)
    let tenant = null;
    if (user.tenantId && user.ruolo !== 'superadmin') {
      const tenants = await db.select().from(schema.tenants).where(eq(schema.tenants.id, user.tenantId));
      tenant = tenants[0] ?? null;
    }

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
      tenant,
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null, tenant: null });
  }
}
