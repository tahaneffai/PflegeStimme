/**
 * Standardized API response types and helpers
 * Ensures consistent response format across all API routes
 */

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  degraded?: boolean;
}

export interface ApiErrorResponse {
  ok: false;
  data: null | any[] | Record<string, any>;
  error: {
    code: string;
    message: string;
  };
  degraded?: boolean;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, degraded: boolean = false): ApiSuccessResponse<T> {
  if (degraded) {
    return {
      ok: true,
      data,
      degraded: true,
    };
  }
  
  return {
    ok: true,
    data,
  };
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: string,
  message: string,
  degraded: boolean = false,
  fallbackData: any[] | Record<string, any> = []
): ApiErrorResponse {
  if (degraded) {
    return {
      ok: false,
      data: fallbackData,
      error: {
        code,
        message,
      },
      degraded: true,
    };
  }
  
  return {
    ok: false,
    data: fallbackData,
    error: {
      code,
      message,
    },
  };
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  ENV_MISSING: 'ENV_MISSING',
  DB_CONNECTION: 'DB_CONNECTION',
  DB_LOCKED: 'DB_LOCKED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

