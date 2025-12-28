/**
 * Environment variable validation and access
 * Provides clear error messages when required env vars are missing
 */

interface EnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  ADMIN_PASSWORD?: string;
  ADMIN_SECRET?: string;
}

let validatedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (validatedEnv) {
    return validatedEnv;
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  const NODE_ENV = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];

  // Validate DATABASE_URL
  if (!DATABASE_URL) {
    const defaultDbUrl = 'file:./prisma/dev.db';
    if (NODE_ENV === 'production') {
      throw new Error(
        'DATABASE_URL environment variable is required in production. ' +
        'Please set it in your Vercel project settings.'
      );
    }
    // In development, use default but warn
    console.warn(
      `[Env] DATABASE_URL not set, using default: ${defaultDbUrl}. ` +
      'Set DATABASE_URL in .env.local for custom configuration.'
    );
    validatedEnv = {
      DATABASE_URL: defaultDbUrl,
      NODE_ENV,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      ADMIN_SECRET: process.env.ADMIN_SECRET,
    };
    return validatedEnv;
  }

  validatedEnv = {
    DATABASE_URL,
    NODE_ENV,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  };

  return validatedEnv;
}

/**
 * Check if database URL is valid for current environment
 */
export function validateDatabaseUrl(): { valid: boolean; error?: string } {
  try {
    const env = getEnv();
    const url = env.DATABASE_URL;

    if (!url) {
      return {
        valid: false,
        error: 'DATABASE_URL is not set',
      };
    }

    // For SQLite, check if it's a file URL
    if (url.startsWith('file:')) {
      return { valid: true };
    }

    // For other databases, basic URL validation
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'DATABASE_URL is not a valid URL',
      };
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error?.message || 'Unknown error validating DATABASE_URL',
    };
  }
}

