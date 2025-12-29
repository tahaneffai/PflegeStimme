import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: Get current password status (just confirms if password is set)
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        message: 'Password management available',
        note: 'Password is currently hardcoded to: 12345678',
      },
    });
  } catch (error: any) {
    console.error('[GET /api/admin/password] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get password info' } },
      { status: 500 }
    );
  }
}

// POST: Change password (for future implementation)
// Note: Currently password is hardcoded, but this endpoint is ready for future use
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' } },
        { status: 400 }
      );
    }

    // For now, just return success (password is hardcoded)
    // In the future, you could update .env.local file here
    return NextResponse.json({
      ok: true,
      data: {
        message: 'Password change feature coming soon. Current password: 12345678',
        note: 'To change password, update ADMIN_PASSWORD in .env.local and restart server',
      },
    });
  } catch (error: any) {
    console.error('[POST /api/admin/password] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to change password' } },
      { status: 500 }
    );
  }
}

