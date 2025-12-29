import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: Fetch approved comments only
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') || 'approved';
    const pageParam = request.nextUrl.searchParams.get('page') || '1';
    const sizeParam = request.nextUrl.searchParams.get('size') || '20';

    const page = Math.max(1, parseInt(pageParam) || 1);
    const size = Math.min(50, Math.max(1, parseInt(sizeParam) || 20));
    const skip = (page - 1) * size;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: size,
      }),
      prisma.comment.count({
        where: {
          status: 'APPROVED',
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        items: comments.map((c) => ({
          id: c.id,
          message: c.content, // Frontend expects 'message'
          content: c.content, // Also include 'content' for compatibility
          createdAt: c.createdAt.toISOString(),
        })),
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
        hasMore: skip + size < total,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/comments] Error:', error);
    console.error('[GET /api/comments] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        ok: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error?.message || 'Failed to fetch comments' 
        } 
      },
      { status: 500 }
    );
  }
}

// POST: Create new comment (status: PENDING by default)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Support both 'content' and 'message' field names
    const content = body.content || body.message;

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Content is required' } },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    // Match frontend validation: 20-2000 characters
    if (trimmedContent.length < 20) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Content must be at least 20 characters' } },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Content must be at most 2000 characters' } },
        { status: 400 }
      );
    }

    // Create comment with PENDING status
    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: comment.id,
        message: 'Your comment has been submitted and is pending approval.',
      },
    });
  } catch (error: any) {
    console.error('[POST /api/comments] Error:', error);
    console.error('[POST /api/comments] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        ok: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error?.message || 'Failed to create comment' 
        } 
      },
      { status: 500 }
    );
  }
}
