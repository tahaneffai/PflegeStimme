import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeDbQuery } from '@/lib/db-utils';
import { errorResponse, successResponse, ErrorCodes } from '@/lib/api-response';

// Explicitly set Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VoiceItem {
  id: string;
  message: string;
  topicTags: string | null;
  createdAt: string;
}

interface VoicesResponse {
  items: VoiceItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// GET: Fetch paginated voices
// NEVER returns 500 - always returns 200 with degraded flag if DB fails
export async function GET(request: NextRequest) {
  try {
    // Parse query params safely with defaults and validation
    const pageParam = request.nextUrl.searchParams.get('page') || '1';
    const sizeParam = request.nextUrl.searchParams.get('size') || '12';
    const sortParam = request.nextUrl.searchParams.get('sort') || 'newest';

    const page = Math.max(1, parseInt(pageParam) || 1);
    const size = Math.min(50, Math.max(1, parseInt(sizeParam) || 12)); // Cap at 50
    const sort = sortParam === 'oldest' ? 'oldest' : 'newest';

    const skip = (page - 1) * size;

    // Build orderBy
    const orderBy = sort === 'newest' 
      ? { createdAt: 'desc' as const }
      : { createdAt: 'asc' as const };

    // Fetch voices with safe error handling
    const [voicesResult, totalResult] = await Promise.all([
      safeDbQuery(
        () => prisma.anonymousVoice.findMany({
          where: {
            status: 'APPROVED',
          },
          orderBy,
          skip,
          take: size,
        }),
        []
      ),
      safeDbQuery(
        () => prisma.anonymousVoice.count({
          where: {
            status: 'APPROVED',
          },
        }),
        0
      ),
    ]);

    const voices = voicesResult.data || [];
    const total = totalResult.data || 0;
    const isDegraded = voicesResult.degraded || totalResult.degraded;
    const isOk = voicesResult.ok && totalResult.ok;

    // Map voices to response format with type safety
    const items: VoiceItem[] = voices.map((v: any) => ({
      id: String(v.id || ''),
      message: String(v.message || ''),
      topicTags: v.topicTags ? String(v.topicTags) : null,
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    }));

    const responseData: VoicesResponse = {
      items,
      page,
      size,
      total: Number(total) || 0,
      totalPages: Math.ceil((Number(total) || 0) / size),
      hasMore: skip + size < (Number(total) || 0),
    };

    // Always return 200, even if degraded
    if (isOk && !isDegraded) {
      return NextResponse.json(successResponse(responseData), { status: 200 });
    } else {
      // Degraded state - return success response with degraded flag
      const response = successResponse(responseData, true);
      return NextResponse.json({
        ...response,
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
    console.error('[GET /api/voices] Unexpected error:', error);
    
    const pageParam = request.nextUrl.searchParams.get('page') || '1';
    const sizeParam = request.nextUrl.searchParams.get('size') || '12';
    const page = Math.max(1, parseInt(pageParam) || 1);
    const size = Math.min(50, Math.max(1, parseInt(sizeParam) || 12));

    const fallbackData: VoicesResponse = {
      items: [],
      page,
      size,
      total: 0,
      totalPages: 0,
      hasMore: false,
    };

    const response = errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch voices. Please try again later.',
      true,
      []
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

// POST: Create a new voice submission
// Returns 200 with degraded flag if DB fails, never 500
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, topicTags } = body;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Message is required'
        ),
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 20) {
      return NextResponse.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Message must be at least 20 characters'
        ),
        { status: 400 }
      );
    }

    if (trimmedMessage.length > 2000) {
      return NextResponse.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Message must be less than 2000 characters'
        ),
        { status: 400 }
      );
    }

    // Enhanced sanitization: remove potential HTML/script tags and dangerous patterns
    const sanitizedMessage = trimmedMessage
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();

    // Sanitize topicTags if provided
    const sanitizedTags = topicTags
      ? topicTags
          .split(',')
          .map((tag: string) => tag.trim().replace(/[<>]/g, ''))
          .filter((tag: string) => tag.length > 0)
          .slice(0, 5) // Limit to 5 tags
          .join(',')
      : null;

    // Create voice with PENDING status using safeDbQuery
    const createResult = await safeDbQuery(
      () => prisma.anonymousVoice.create({
        data: {
          message: sanitizedMessage,
          topicTags: sanitizedTags,
          status: 'PENDING',
        },
      }),
      null as any
    );

    if (createResult.ok) {
      return NextResponse.json(
        successResponse({
          pending: true,
          message: 'Thanks. Your message was received and will appear after review.',
        }),
        { status: 200 }
      );
    } else {
      // DB failed but return 200 with degraded status
      const errorResp = errorResponse(
        createResult.errorCode || ErrorCodes.DB_QUERY_FAILED,
        createResult.errorMessage || 'Database unavailable. Please try again later.',
        true
      );
      return NextResponse.json({
        ...errorResp,
        message: 'Temporary unavailable. Please try again later.',
      }, { status: 200 });
    }
  } catch (error: any) {
    // This catch should rarely trigger, but if it does, return 200 with degraded
    console.error('[POST /api/voices] Unexpected error:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error?.message?.includes('JSON')) {
      return NextResponse.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid request body format'
        ),
        { status: 400 }
      );
    }

    // For any other unexpected error, return 200 with degraded
    const errorResp = errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Temporary unavailable. Please try again later.',
      true
    );
    return NextResponse.json({
      ...errorResp,
      ...(process.env.NODE_ENV === 'development' ? {
        _debug: {
          error: error?.message || 'Unknown error',
        },
      } : {}),
    }, { status: 200 });
  }
}

