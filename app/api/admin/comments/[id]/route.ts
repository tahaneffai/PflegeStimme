import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH: Update comment status (approve/reject) or content (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, status, content } = body;

    const updateData: any = {};

    // Handle action-based updates (approve/reject)
    if (action === 'approve') {
      updateData.status = 'APPROVED';
    } else if (action === 'reject') {
      updateData.status = 'REJECTED';
    }

    // Handle direct status update
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      updateData.status = status;
    }

    // Handle content update
    if (content !== undefined) {
      if (typeof content !== 'string') {
        return NextResponse.json(
          { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Content must be a string' } },
          { status: 400 }
        );
      }
      const trimmedContent = content.trim();
      if (trimmedContent.length < 20 || trimmedContent.length > 2000) {
        return NextResponse.json(
          { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Content must be between 20 and 2000 characters' } },
          { status: 400 }
        );
      }
      updateData.content = trimmedContent;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'No valid update provided' } },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: comment.id,
        message: comment.content, // Frontend expects 'message'
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } },
        { status: 404 }
      );
    }
    console.error('[PATCH /api/admin/comments/[id]] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update comment' } },
      { status: 500 }
    );
  }
}

// DELETE: Delete comment (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await prisma.comment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      ok: true,
      data: { message: 'Comment deleted successfully' },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } },
        { status: 404 }
      );
    }
    console.error('[DELETE /api/admin/comments/[id]] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete comment' } },
      { status: 500 }
    );
  }
}
