import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { safeDbQuery } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

// PATCH: Update voice (message and/or status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, status } = body;

    const updateData: any = {};

    // Update message if provided
    if (message !== undefined) {
      if (typeof message !== 'string') {
        return NextResponse.json(
          { error: 'Message must be a string' },
          { status: 400 }
        );
      }

      const trimmedMessage = message.trim();

      if (trimmedMessage.length < 20) {
        return NextResponse.json(
          { error: 'Message must be at least 20 characters' },
          { status: 400 }
        );
      }

      if (trimmedMessage.length > 2000) {
        return NextResponse.json(
          { error: 'Message must be less than 2000 characters' },
          { status: 400 }
        );
      }

      // Sanitize message for safety
      const sanitizedMessage = trimmedMessage
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');

      updateData.message = sanitizedMessage;
    }

    // Update status if provided
    if (status !== undefined) {
      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be PENDING, APPROVED, or REJECTED' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Use safeDbQuery for database operations
    const updateResult = await safeDbQuery(
      () => prisma.anonymousVoice.update({
        where: { id: params.id },
        data: updateData,
      }),
      null as any
    );

    if (!updateResult.ok) {
      if (updateResult.errorCode === 'P2025' || updateResult.errorMessage?.includes('not found')) {
        return NextResponse.json(
          { error: 'Voice not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to update voice',
          degraded: true,
          message: 'Database temporarily unavailable. Please try again later.',
        },
        { status: 200 }
      );
    }

    const voice = updateResult.data;

    return NextResponse.json({
      id: voice.id,
      message: voice.message,
      topicTags: voice.topicTags,
      createdAt: voice.createdAt.toISOString(),
      status: voice.status,
    });
  } catch (error: any) {
    console.error('[PATCH /api/admin/voices/[id]] Unexpected error:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error?.message?.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update voice',
        degraded: true,
        message: 'Temporary unavailable. Please try again later.',
      },
      { status: 200 }
    );
  }
}

// DELETE: Delete voice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use safeDbQuery for database operations
    const deleteResult = await safeDbQuery(
      () => prisma.anonymousVoice.delete({
        where: { id: params.id },
      }),
      null as any
    );

    if (!deleteResult.ok) {
      if (deleteResult.errorCode === 'P2025' || deleteResult.errorMessage?.includes('not found')) {
        return NextResponse.json(
          { error: 'Voice not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to delete voice',
          degraded: true,
          message: 'Database temporarily unavailable. Please try again later.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/admin/voices/[id]] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete voice',
        degraded: true,
        message: 'Temporary unavailable. Please try again later.',
      },
      { status: 200 }
    );
  }
}

