import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionFromToken, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Verify session
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySessionFromToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Superadmin routes — require superadmin role
  if (pathname.startsWith('/superadmin') && session.ruolo !== 'superadmin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Dashboard routes — require non-superadmin (tenant user)
  if (pathname.startsWith('/dashboard') && session.ruolo === 'superadmin') {
    return NextResponse.redirect(new URL('/superadmin', request.url));
  }

  // Pass session data in headers for server components
  const response = NextResponse.next();
  response.headers.set('x-user-id', session.userId);
  response.headers.set('x-tenant-id', session.tenantId);
  response.headers.set('x-user-role', session.ruolo);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
