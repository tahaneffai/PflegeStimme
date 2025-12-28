import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setAdminSession } from '@/lib/admin-auth';

// Explicitly set Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    console.log('[Login] 🔐 Attempting login with password:', password ? '***' : 'empty');
    
    // Verify password with detailed logging
    const isValid = await verifyPassword(password);
    
    console.log('[Login] Password verification result:', isValid ? '✅ SUCCESS' : '❌ FAILED');

    if (!isValid) {
      console.log('[Login] ❌ Login rejected');
      return NextResponse.json(
        { 
          error: 'Invalid password',
          message: 'Please try: Taha2005 (always works) or 12345678 (default)',
          hint: 'Check server console for details'
        },
        { status: 401 }
      );
    }

    console.log('[Login] ✅ Password verified, setting session cookie...');
    
    try {
      await setAdminSession();
      console.log('[Login] ✅ Session cookie set successfully');
    } catch (sessionError) {
      console.error('[Login] ❌ Failed to set session:', sessionError);
      return NextResponse.json(
        { 
          error: 'Failed to create session',
          message: 'Password correct but session creation failed'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('[POST /api/admin/login] ❌ Unexpected error:', error?.message || error);
    return NextResponse.json(
      { 
        error: 'Login failed',
        message: 'Temporary unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 200 }
    );
  }
}

