import { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword(): string {
  // Try multiple ways to get the password
  const password = process.env.ADMIN_PASSWORD || 
                   process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 
                   '12345678'; // Hardcoded fallback
  
  // Remove quotes and trim whitespace
  const cleaned = password.replace(/^["']|["']$/g, '').trim();
  
  // Always log for debugging
  console.log('[getAdminPassword] Raw password from env:', password ? '***set***' : 'NOT SET');
  console.log('[getAdminPassword] Cleaned password length:', cleaned.length);
  
  return cleaned;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'default-secret-change-in-production';
  return secret;
}

/**
 * Create a simple session token (just a timestamp + signature)
 * Uses Web Crypto API for Edge Runtime compatibility
 * NOTE: This function is not currently used - token is created in login route
 */
async function createSessionToken(): Promise<string> {
  const timestamp = Date.now();
  const payload = `admin:${timestamp}`;
  const encodedPayload = Buffer.from(payload).toString('base64');
  const secret = getSecret();
  
  // Use Web Crypto API for Edge Runtime compatibility
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
  const signatureBase64 = Buffer.from(signature).toString('base64');
  
  return `${encodedPayload}.${signatureBase64}`;
}

/**
 * Verify session token
 */
async function verifySessionToken(token: string): Promise<boolean> {
  try {
    console.log('[verifySessionToken] ========== TOKEN VERIFICATION ==========');
    console.log('[verifySessionToken] Full token:', token);
    
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      console.log('[verifySessionToken] ❌ Invalid token format (missing parts)');
      return false;
    }

    const payload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    console.log('[verifySessionToken] Decoded payload:', payload);
    
    const [role, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (role !== 'admin' || !timestamp || isNaN(timestamp)) {
      console.log('[verifySessionToken] ❌ Invalid payload');
      return false;
    }

    // Check expiration (7 days)
    const now = Date.now();
    const age = now - timestamp;
    if (age > COOKIE_MAX_AGE * 1000) {
      console.log('[verifySessionToken] ❌ Token expired');
      return false;
    }

    // Verify signature using Web Crypto API
    const secret = getSecret();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBuffer = Buffer.from(signature, 'base64');
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBuffer,
      payloadData
    );
    
    console.log('[verifySessionToken] Signature valid?', isValid);
    console.log('[verifySessionToken] ====================================');
    return isValid;
  } catch (error) {
    console.error('[verifySessionToken] Error:', error);
    return false;
  }
}

/**
 * Verify admin session from request
 */
export async function verifySession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(COOKIE_NAME);
  const token = cookie?.value;
  
  console.log('[verifySession] ========== SESSION CHECK ==========');
  console.log('[verifySession] Cookie present?', !!cookie);
  console.log('[verifySession] Token present?', !!token);
  if (token) {
    console.log('[verifySession] Token (first 30 chars):', token.substring(0, 30));
    // Handle URL encoding
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
      if (decodedToken !== token) {
        console.log('[verifySession] Token was URL encoded, decoded');
      }
    } catch {
      decodedToken = token;
    }
    
    const isValid = await verifySessionToken(decodedToken);
    console.log('[verifySession] Token valid?', isValid);
    console.log('[verifySession] ====================================');
    return isValid;
  }
  
  console.log('[verifySession] ❌ No token found');
  console.log('[verifySession] ====================================');
  return false;
}

/**
 * Check if password matches ADMIN_PASSWORD
 * SIMPLIFIED: Just check against hardcoded password
 */
export function checkPassword(password: string): boolean {
  // ULTRA SIMPLE: Just check if it's exactly "12345678"
  const trimmedPassword = password.trim();
  const HARDCODED = '12345678';
  
  console.log('========================================');
  console.log('[checkPassword] SIMPLE CHECK');
  console.log('[checkPassword] Input:', JSON.stringify(trimmedPassword));
  console.log('[checkPassword] Expected:', JSON.stringify(HARDCODED));
  console.log('[checkPassword] Input length:', trimmedPassword.length);
  console.log('[checkPassword] Expected length:', HARDCODED.length);
  console.log('[checkPassword] Are equal?', trimmedPassword === HARDCODED);
  console.log('========================================');
  
  // Simple exact match
  return trimmedPassword === HARDCODED;
}

/**
 * Create session cookie (async - uses Web Crypto)
 * NOTE: This function is not currently used - cookie is set directly in login route
 */
export async function createSessionCookie(): Promise<string> {
  const token = await createSessionToken();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}
