import { prisma } from './prisma';
import { validateDatabaseUrl } from './env';

interface SafeQueryResult<T> {
  ok: boolean;
  data: T;
  errorCode?: string;
  errorMessage?: string;
  degraded?: boolean;
}

/**
 * Safe database query wrapper with retry logic for SQLite locked errors
 * Returns structured result with ok flag and degraded status
 */
export async function safeDbQuery<T>(
  query: () => Promise<T>,
  fallback: T,
  retries = 2
): Promise<SafeQueryResult<T>> {
  // Validate database URL first
  const dbValidation = validateDatabaseUrl();
  if (!dbValidation.valid) {
    return {
      ok: false,
      data: fallback,
      errorCode: 'ENV_MISSING',
      errorMessage: dbValidation.error || 'Database configuration invalid',
      degraded: true,
    };
  }

  let lastError: any = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await query();
      return {
        ok: true,
        data,
      };
    } catch (error: any) {
      lastError = error;
      const errorCode = error?.code || 'UNKNOWN';
      const errorMessage = error?.message || 'Database error';
      
      // Log error in development with more details
      if (process.env.NODE_ENV === 'development') {
        console.error(`[safeDbQuery] Attempt ${attempt + 1}/${retries + 1} failed:`, {
          code: errorCode,
          message: errorMessage,
          error: error,
          stack: error?.stack,
        });
      }
      
      // Handle SQLite locked error with retry
      if (errorCode === 'SQLITE_BUSY' || errorCode === 'P1008' || errorMessage?.includes('locked')) {
        if (attempt < retries) {
          // Wait before retry (exponential backoff: 50ms, 100ms)
          const delay = 50 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue; // Retry
        } else {
          // Max retries reached
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              '[safeDbQuery] SQLite database locked after retries. Close DB viewers and restart dev server.'
            );
          }
          return {
            ok: false,
            data: fallback,
            errorCode: 'DB_LOCKED',
            errorMessage: 'Database is locked. Please try again later.',
            degraded: true,
          };
        }
      }
      
      // Handle connection errors
      if (errorCode === 'P1001' || errorCode === 'P1008') {
        return {
          ok: false,
          data: fallback,
          errorCode: 'DB_CONNECTION',
          errorMessage: 'Database connection error',
          degraded: true,
        };
      }
      
      // Handle Prisma client not initialized
      if (errorCode === 'P1000' || errorMessage?.includes('PrismaClient')) {
        return {
          ok: false,
          data: fallback,
          errorCode: 'PRISMA_NOT_INITIALIZED',
          errorMessage: 'Database client not initialized',
          degraded: true,
        };
      }
      
      // For other errors, return fallback but mark as degraded
      // Provide more specific error message based on error code
      let errorMsg = 'Database query failed';
      if (errorCode === 'P2002') {
        errorMsg = 'Unique constraint violation';
      } else if (errorCode === 'P2025') {
        errorMsg = 'Record not found';
      } else if (errorMessage?.includes('no such table')) {
        errorMsg = 'Database table not found. Please run migrations.';
      } else if (errorMessage?.includes('no such column')) {
        errorMsg = 'Database schema mismatch. Please run migrations.';
      } else if (errorMessage) {
        errorMsg = `Database error: ${errorMessage}`;
      }
      
      return {
        ok: false,
        data: fallback,
        errorCode,
        errorMessage: errorMsg,
        degraded: true,
      };
    }
  }
  
  // Should never reach here, but TypeScript needs it
  return {
    ok: false,
    data: fallback,
    errorCode: 'UNKNOWN',
    errorMessage: 'Unknown database error',
    degraded: true,
  };
}

