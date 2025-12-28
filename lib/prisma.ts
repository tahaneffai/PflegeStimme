import { PrismaClient } from '@prisma/client';
import { getEnv } from './env';

// Ensure DATABASE_URL is set in process.env before Prisma tries to read it
// This is needed because Prisma validates the schema at load time
if (!process.env.DATABASE_URL) {
  const defaultDbUrl = 'file:./prisma/dev.db';
  if (process.env.NODE_ENV !== 'production') {
    process.env.DATABASE_URL = defaultDbUrl;
    console.warn(
      `[Prisma] DATABASE_URL not set in environment, using default: ${defaultDbUrl}. ` +
      'Create .env.local file to set it explicitly.'
    );
  }
}

// Prevent multiple PrismaClient instances in development (Fast Refresh)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure PrismaClient is a singleton
// Use validated environment variable
let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    const env = getEnv();
    prismaInstance = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    });

    if (env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }

    return prismaInstance;
  } catch (error: any) {
    console.error('[Prisma] Failed to initialize PrismaClient:', error?.message || error);
    // Return a client anyway, but it may fail on first query
    // This allows the app to start and show proper error messages
    return new PrismaClient({
      log: ['error'],
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

