import { jwtVerify } from 'jose';
import { JWT_AUDIENCE, JWT_ISSUER } from '@/lib/auth/constants';

/**
 * Token verification for the Edge middleware.
 *
 * Kept separate from lib/auth/session.ts because that module reaches for
 * node:crypto and node:path, neither of which exists in the Edge runtime. This
 * file uses only jose and process.env, so the middleware stays on the edge.
 *
 * Verification only — issuing a token is a Node-side concern.
 */
export async function verifyEdgeToken(token: string): Promise<string | null> {
  const secret = process.env.JWT_SECRET;
  if (secret === undefined || secret === '') {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
