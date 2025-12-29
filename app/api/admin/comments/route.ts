import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: List all comments with filters (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify session
    const isAuthenticated = await verifySession(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const pageParam = request.nextUrl.searchParams.get('page') || '1';
    const sizeParam = request.nextUrl.searchParams.get('size') || '20';
    const statusParam = request.nextUrl.searchParams.get('status');
    const searchParam = request.nextUrl.searchParams.get('search');

    const page = Math.max(1, parseInt(pageParam) || 1);
    const size = Math.min(50, Math.max(1, parseInt(sizeParam) || 20));
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    if (statusParam && statusParam !== 'all') {
      where.status = statusParam.toUpperCase();
    }
    if (searchParam) {
      where.content = { contains: searchParam, mode: 'insensitive' };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: size,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        comments: comments.map((c) => ({
          id: c.id,
          message: c.content, // Frontend expects 'message'
          content: c.content, // Also include 'content'
          status: c.status,
          createdAt: c.createdAt.toISOString(),
        })),
        pagination: {
          page,
          size,
          total,
          totalPages: Math.ceil(total / size),
          hasMore: skip + size < total,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/comments] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch comments' } },
      { status: 500 }
    );
  }
}
