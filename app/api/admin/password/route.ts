import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated, updateAdminPassword } from '@/lib/admin-auth';

// Explicitly set Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      );
    }

    const result = await updateAdminPassword(oldPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/admin/password] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update password',
        message: 'Temporary unavailable. Please try again later.',
      },
      { status: 200 }
    );
  }
}

