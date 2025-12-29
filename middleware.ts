import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from "better-auth/cookies";
import { error } from 'console';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin pages (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      console.log( "wa zbbbb", error)
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

   //Protect admin API routes (EXCEPT login and logout)
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
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
