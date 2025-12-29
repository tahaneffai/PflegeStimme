import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin pages (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect admin API routes (EXCEPT login and logout)
  if (pathname.startsWith('/api/admin') && 
      pathname !== '/api/admin/login' && 
      pathname !== '/api/admin/logout') {
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
