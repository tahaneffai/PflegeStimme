import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const cookie = clearSessionCookie();
  const response = NextResponse.json({ ok: true, data: { message: 'Logged out successfully' } });
  response.headers.set('Set-Cookie', cookie);
  return response;
  }


