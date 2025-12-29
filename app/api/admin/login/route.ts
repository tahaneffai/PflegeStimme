import { NextRequest, NextResponse } from 'next/server';
import { checkPassword } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Password is required' } },
        { status: 400 }
      );
    }

    // SIMPLIFIED: Direct password check
    console.log('========================================');
    console.log('[POST /api/admin/login] LOGIN REQUEST RECEIVED');
    console.log('[POST /api/admin/login] Password received:', JSON.stringify(password));
    console.log('[POST /api/admin/login] Password type:', typeof password);
    console.log('[POST /api/admin/login] Password length:', password?.length || 0);
    
    let isValid = false;
    try {
      isValid = checkPassword(password);
      console.log('[POST /api/admin/login] Final result:', isValid);
    } catch (error: any) {
      console.error('[POST /api/admin/login] ERROR:', error);
      console.error('[POST /api/admin/login] Error stack:', error?.stack);
      return NextResponse.json(
        { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Authentication error: ' + error.message } },
        { status: 500 }
      );
    }
    console.log('========================================');

    if (!isValid) {
      console.log('[POST /api/admin/login] ❌ Invalid password - returning 401');
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid password' } },
        { status: 401 }
      );
    }
    
    console.log('[POST /api/admin/login] ✅ Password valid - creating session');

    // Create session token using Web Crypto API (Edge Runtime compatible)
    let token: string;
    try {
      const timestamp = Date.now();
      const payload = `admin:${timestamp}`;
      const encodedPayload = Buffer.from(payload).toString('base64');
      const secret = process.env.ADMIN_SESSION_SECRET || 'default-secret-change-in-production';
      
      // Use Web Crypto API for Edge Runtime compatibility
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const payloadData = encoder.encode(payload);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
      const signatureBase64 = Buffer.from(signature).toString('base64');
      token = `${encodedPayload}.${signatureBase64}`;
      
      console.log('[POST /api/admin/login] Session token created');
    } catch (error: any) {
      console.error('[POST /api/admin/login] Token creation error:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true, data: { message: 'Login successful' } });
    
    // Set cookie using Next.js cookies() API
    // Note: Don't URL encode - Next.js handles this
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    console.log('[POST /api/admin/login] Cookie set successfully');
    console.log('[POST /api/admin/login] Token (first 30 chars):', token.substring(0, 30));
    console.log('[POST /api/admin/login] Cookie will be set with value:', token.substring(0, 30) + '...');

    return response;
  } catch (error: any) {
    console.error('[POST /api/admin/login] Error:', error);
    console.error('[POST /api/admin/login] Error details:', {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        ok: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error?.message || 'Login failed' 
        } 
      },
      { status: 500 }
    );
  }
}
