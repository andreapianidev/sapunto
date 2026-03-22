import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserRole } from './types';

const SESSION_COOKIE = 'sapunto_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.DATABASE_URL || 'sapunto-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  nome: string;
  cognome: string;
  tenantId: string;
  ruolo: UserRole;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Edge-compatible version for middleware (no cookies() API)
export async function verifySessionFromToken(token: string): Promise<SessionPayload | null> {
  return verifySession(token);
}

export { SESSION_COOKIE };
