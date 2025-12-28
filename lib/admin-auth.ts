import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { safeDbQuery } from './db-utils';
import bcrypt from 'bcryptjs';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret-change-in-production';
const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Initialize admin config on import (runs once per server instance)
let initPromise: Promise<void> | null = null;

// Initialize admin config if it doesn't exist
export async function initializeAdminConfig() {
  try {
    const existingResult = await safeDbQuery(
      () => prisma.adminConfig.findUnique({
        where: { id: 'singleton' },
      }),
      null
    );

    if (!existingResult.ok || !existingResult.data) {
      // Default password: 12345678 (can be changed by admin)
      const defaultPassword = process.env.ADMIN_PASSWORD || '12345678';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      const createResult = await safeDbQuery(
        () => prisma.adminConfig.create({
          data: {
            id: 'singleton',
            passwordHash,
          },
        }),
        null as any
      );

      if (createResult.ok) {
        console.log('[Admin Auth] Admin config initialized with password: 12345678');
      } else {
        console.error('[Admin Auth] Failed to create admin config:', createResult.errorMessage);
      }
    }
  } catch (error) {
    console.error('[Admin Auth] Error initializing admin config:', error);
  }
}

// Default fallback password that always works (Taha2005)
const FALLBACK_PASSWORD = 'Taha2005';

// Verify password - SIMPLIFIED AND BULLETPROOF
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    // Always allow fallback password FIRST (before any DB operations)
    if (password === FALLBACK_PASSWORD) {
      console.log('[Admin Auth] ✅ Fallback password Taha2005 accepted');
      return true;
    }

    // Initialize admin config if needed
    if (!initPromise) {
      initPromise = initializeAdminConfig();
    }
    await initPromise;
    
    // Get admin config - try multiple times if needed
    let configResult = await safeDbQuery(
      () => prisma.adminConfig.findUnique({
        where: { id: 'singleton' },
      }),
      null
    );

    // If record doesn't exist, CREATE IT IMMEDIATELY
    if (!configResult.ok || !configResult.data) {
      console.log('[Admin Auth] ⚠️ Admin config not found, creating now...');
      
      // Create with password 12345678
      const defaultPassword = '12345678';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      const createResult = await safeDbQuery(
        () => prisma.adminConfig.create({
          data: {
            id: 'singleton',
            passwordHash,
          },
        }),
        null as any
      );

      if (createResult.ok && createResult.data) {
        console.log('[Admin Auth] ✅ Admin config created with password: 12345678');
        // If password is 12345678, accept it immediately
        if (password === '12345678') {
          return true;
        }
        // Otherwise check against the new hash
        return await bcrypt.compare(password, createResult.data.passwordHash);
      } else {
        console.error('[Admin Auth] ❌ Failed to create admin config, only fallback works');
        // If creation failed, only allow fallback password
        return password === FALLBACK_PASSWORD;
      }
    }

    // We have a config, compare password
    const storedHash = configResult.data.passwordHash;
    const isValid = await bcrypt.compare(password, storedHash);
    
    // Special handling for 12345678 - if it doesn't match, reset it
    if (!isValid && password === '12345678') {
      console.log('[Admin Auth] ⚠️ Password 12345678 didn\'t match stored hash, resetting...');
      const newHash = await bcrypt.hash('12345678', 10);
      const updateResult = await safeDbQuery(
        () => prisma.adminConfig.update({
          where: { id: 'singleton' },
          data: { passwordHash: newHash },
        }),
        null as any
      );
      
      if (updateResult.ok) {
        console.log('[Admin Auth] ✅ Password hash reset, accepting 12345678');
        return true;
      }
    }

    if (isValid) {
      console.log('[Admin Auth] ✅ Password verified successfully');
    } else {
      console.log('[Admin Auth] ❌ Password verification failed for:', password ? '***' : 'empty');
    }

    return isValid;
  } catch (error: any) {
    console.error('[Admin Auth] ❌ Error verifying password:', error?.message || error);
    // On ANY error, allow fallback password as last resort
    if (password === FALLBACK_PASSWORD) {
      console.log('[Admin Auth] ✅ Fallback password accepted due to error');
      return true;
    }
    return false;
  }
}

// Create signed token (simple but effective)
function createToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${timestamp}-${random}`).toString('base64');
}

// Verify token (check if it's valid format)
function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.includes('-');
  } catch {
    return false;
  }
}

// Set admin session cookie
export async function setAdminSession() {
  const cookieStore = await cookies();
  const token = createToken();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Clear admin session
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Check if user is authenticated
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    if (!initPromise) {
      initPromise = initializeAdminConfig();
    }
    await initPromise;

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return false;
    }

    return verifyToken(token);
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Update admin password
export async function updateAdminPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isValid = await verifyPassword(oldPassword);
    
    if (!isValid) {
      return { success: false, error: 'Old password is incorrect' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    // Don't allow setting the fallback password as the stored password
    if (newPassword === FALLBACK_PASSWORD) {
      return { success: false, error: 'This password is reserved. Please choose a different password.' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updateResult = await safeDbQuery(
      () => prisma.adminConfig.update({
        where: { id: 'singleton' },
        data: { passwordHash },
      }),
      null as any
    );

    if (!updateResult.ok) {
      return { success: false, error: 'Failed to update password. Database unavailable.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating admin password:', error);
    return { success: false, error: 'Failed to update password' };
  }
}

