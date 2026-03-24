import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionFromToken, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isRSC = request.headers.get('RSC') === '1';

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
    if (isRSC) {
      return new NextResponse(null, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySessionFromToken(token);
  if (!session) {
    const response = isRSC
      ? new NextResponse(null, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
