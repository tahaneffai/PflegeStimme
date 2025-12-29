import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: Get current password status
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

// POST: Change password
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
    const { currentPassword, newPassword } = body;

    // Validate new password
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' } },
        { status: 400 }
      );
    }

    // Verify current password
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Current password is required' } },
        { status: 400 }
      );
    }

    // Check current password against database or env
    let adminConfig = null;
    let isCurrentPasswordValid = false;

    // Try to get admin config from database
    try {
      if (!prisma || !prisma.adminConfig) {
        throw new Error('Prisma client or AdminConfig model not available');
      }

      adminConfig = await prisma.adminConfig.findUnique({
        where: { id: 'admin' },
      });
    } catch (error: any) {
      console.error('[POST /api/admin/password] Database query error:', error?.message || error);
      // Continue with env var check
    }

    // Verify current password
    if (adminConfig && adminConfig.passwordHash) {
      // Check against database hash
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminConfig.passwordHash);
    } else {
      // Fallback to env var for initial setup
      const envPassword = process.env.ADMIN_PASSWORD || '12345678';
      const cleanedEnvPassword = envPassword.replace(/^["']|["']$/g, '').trim();
      isCurrentPasswordValid = currentPassword.trim() === cleanedEnvPassword;
    }
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Current password is incorrect' } },
        { status: 401 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update or create admin config in database
    try {
      if (!prisma || !prisma.adminConfig) {
        return NextResponse.json(
          { 
            ok: false, 
            error: { 
              code: 'CONFIGURATION_ERROR', 
              message: 'Database configuration error. Please restart the development server.'
            } 
          },
          { status: 500 }
        );
      }

      await prisma.adminConfig.upsert({
        where: { id: 'admin' },
        update: {
          passwordHash: hashedPassword,
        },
        create: {
          id: 'admin',
          passwordHash: hashedPassword,
        },
      });
    } catch (dbError: any) {
      console.error('[POST /api/admin/password] Database update error:', dbError?.message || dbError);
      
      // Check if it's a table doesn't exist error
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist') || dbError?.message?.includes('relation')) {
        return NextResponse.json(
          { 
            ok: false, 
            error: { 
              code: 'DATABASE_ERROR', 
              message: 'Database table not found. Please run: npx prisma migrate deploy'
            } 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'INTERNAL_ERROR', 
            message: dbError?.message || 'Failed to save password to database.' 
          } 
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      data: {
        message: 'Password updated successfully',
      },
    });
  } catch (error: any) {
    console.error('[POST /api/admin/password] Error:', error?.message || error);
    return NextResponse.json(
      { 
        ok: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error?.message || 'Failed to change password' 
        } 
      },
      { status: 500 }
    );
  }
}



