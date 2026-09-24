import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { JWT_AUDIENCE, JWT_ISSUER, SESSION_COOKIE } from '@/lib/auth/constants';
import { SESSION_TTL_SECONDS, jwtSecret } from '@/lib/env';

/**
 * Admin sessions: a short-lived HS256 JWT in an httpOnly cookie.
 *
 * The token is never readable from JavaScript (httpOnly), never leaves the site
 * (SameSite=Strict, which also removes the need for a separate CSRF token on the
 * admin's same-origin form posts), and is only sent over TLS in production.
 *
 * This module is Node-only. The Edge middleware uses lib/auth/edge.ts instead.
 */

export { SESSION_COOKIE };

export interface AdminSession {
  readonly sub: string;
  readonly jti: string;
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(email)
    .setJti(randomUUID())
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(jwtSecret());
}

export async function readSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string') {
      return null;
    }
    return { sub: payload.sub, jti: payload.jti };
  } catch {
    return null;
  }
}

/** The session of the current request, or null when signed out or expired. */
export async function currentSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token === undefined ? null : readSessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
