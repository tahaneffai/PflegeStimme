import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';

// Explicitly set Node.js runtime for cookie operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

