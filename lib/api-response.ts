/**
 * Standardized API response types and helpers
 * Ensures consistent response format across all API routes
 */

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  degraded?: false;
}

export interface ApiErrorResponse {
  ok: false;
  data: null | any[];
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
export function successResponse<T>(data: T, degraded = false): ApiSuccessResponse<T> {
  return {
    ok: true,
    data,
    ...(degraded ? { degraded: true } : {}),
  };
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: string,
  message: string,
  degraded = false,
  fallbackData: any[] = []
): ApiErrorResponse {
  return {
    ok: false,
    data: fallbackData,
    error: {
      code,
      message,
    },
    ...(degraded ? { degraded: true } : {}),
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

