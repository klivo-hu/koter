import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';
import { verifyEdgeToken } from '@/lib/auth/edge';

/**
 * Edge middleware.
 *
 * Two jobs: send signed-out visitors to the login screen before an admin page is
 * ever rendered, and set the security headers on every response. It deliberately
 * does *not* carry the authorisation decision — lib/auth/guard.ts re-verifies the
 * session on the server for every page and API route, so bypassing this file
 * gains nothing.
 *
 * The content-security policy is nonce-based rather than 'unsafe-inline': a fresh
 * nonce is minted per request, handed to Next.js through the x-nonce header (which
 * stamps it onto its own bootstrap scripts) and read by the few server components
 * that emit inline JSON-LD. With 'strict-dynamic', scripts those trusted scripts
 * load are allowed and nothing else is — so an injected <script> cannot execute.
 */

function nonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function policy(value: string): string {
  const development = process.env.NODE_ENV !== 'production';

  return [
    "default-src 'self'",
    // React Refresh compiles with eval in development only; never in a build.
    `script-src 'self' 'nonce-${value}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    // Next.js and Tailwind both emit inline <style>; styles cannot be nonced here.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws: wss:' : ''}`,
    // The location map is the one third-party frame the site allows.
    'frame-src https://www.google.com',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function harden(response: NextResponse, value: string): NextResponse {
  response.headers.set('Content-Security-Policy', policy(value));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const value = nonce();
  const headers = new Headers(request.headers);
  headers.set('x-nonce', value);

  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/admin/belepes';

  if (pathname.startsWith('/admin') && !isLogin) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const subject = token === undefined ? null : await verifyEdgeToken(token);
    if (subject === null) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/belepes';
      url.search = '';
      return harden(NextResponse.redirect(url), value);
    }
  }

  return harden(NextResponse.next({ request: { headers } }), value);
}

export const config = {
  // Static assets and the image optimiser need no policy evaluation.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|gallery/|hero-poster.jpg).*)'],
};
