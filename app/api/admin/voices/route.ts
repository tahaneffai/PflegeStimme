import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { safeDbQuery } from '@/lib/db-utils';
import { errorResponse, successResponse, ErrorCodes } from '@/lib/api-response';

// Explicitly set Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AdminVoiceItem {
  id: string;
  message: string;
  topicTags: string | null;
  createdAt: string;
  status: string;
}

interface AdminVoicesResponse {
  voices: AdminVoiceItem[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page') || '1';
    const sizeParam = searchParams.get('size') || '20';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'all';

    const page = Math.max(1, parseInt(pageParam) || 1);
    const size = Math.min(50, Math.max(1, parseInt(sizeParam) || 20)); // Cap at 50
    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }
    if (search) {
      // SQLite doesn't support case-insensitive search directly, so we use contains
      where.message = {
        contains: search,
      };
    }

    // Build orderBy
    const orderBy = sort === 'newest'
      ? { createdAt: 'desc' as const }
      : { createdAt: 'asc' as const };

    // Fetch voices with safe error handling
    const [voicesResult, totalResult] = await Promise.all([
      safeDbQuery(
        () => prisma.anonymousVoice.findMany({
          where,
          orderBy,
          skip,
          take: size,
        }),
        []
      ),
      safeDbQuery(
        () => prisma.anonymousVoice.count({ where }),
        0
      ),
    ]);

    const voices = voicesResult.data || [];
    const total = totalResult.data || 0;
    const isDegraded = voicesResult.degraded || totalResult.degraded;
    const isOk = voicesResult.ok && totalResult.ok;

    // Map voices with type safety
    const voiceItems: AdminVoiceItem[] = voices.map((v: any) => ({
      id: String(v.id || ''),
      message: String(v.message || ''),
      topicTags: v.topicTags ? String(v.topicTags) : null,
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
      status: String(v.status || 'PENDING'),
    }));

    const responseData: AdminVoicesResponse = {
      voices: voiceItems,
      pagination: {
        page,
        size,
        total: Number(total) || 0,
        totalPages: Math.ceil((Number(total) || 0) / size),
        hasMore: skip + size < (Number(total) || 0),
      },
    };

    // Always return 200, even if degraded
    if (isOk && !isDegraded) {
      return NextResponse.json({
        ...successResponse(responseData),
        ...responseData, // Include data at root level for backward compatibility
      }, { status: 200 });
    } else {
      // Degraded state
      const response = successResponse(responseData, true);
      return NextResponse.json({
        ...response,
        ...responseData, // Include data at root level for backward compatibility
        ...(process.env.NODE_ENV === 'development' ? {
          _debug: {
            voicesError: voicesResult.errorCode,
            totalError: totalResult.errorCode,
          },
        } : {}),
      }, { status: 200 });
    }
  } catch (error: any) {
    // This catch should rarely trigger, but if it does, return 200 with degraded
    console.error('[GET /api/admin/voices] Unexpected error:', error);
    
    const pageParam = request.nextUrl.searchParams.get('page') || '1';
    const sizeParam = request.nextUrl.searchParams.get('size') || '20';
    const page = Math.max(1, parseInt(pageParam) || 1);
    const size = Math.min(50, Math.max(1, parseInt(sizeParam) || 20));

    const fallbackData: AdminVoicesResponse = {
      voices: [],
      pagination: {
        page,
        size,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };

    const response = errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch voices. Please try again later.',
      true,
      fallbackData
    );

    return NextResponse.json({
      ...response,
      ...fallbackData,
      ...(process.env.NODE_ENV === 'development' ? {
        _debug: {
          error: error?.message || 'Unknown error',
        },
      } : {}),
    }, { status: 200 });
  }
}

