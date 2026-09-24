import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { adminCredentials } from '@/lib/env';
import { currentSession, type AdminSession } from '@/lib/auth/session';

/**
 * Server-side authorisation.
 *
 * Every admin page and every admin API route calls one of these. The middleware
 * in middleware.ts is only a fast redirect for a nicer experience — it is not the
 * security boundary. Authorisation is re-checked here, on the server, for each
 * request, so an API endpoint can never be reached without a valid session even
 * if the middleware is bypassed.
 */

/** Verifies the session and that it still matches the configured admin account. */
async function authorisedSession(): Promise<AdminSession | null> {
  const session = await currentSession();
  if (session === null) {
    return null;
  }
  // If ADMIN_EMAIL changes, previously issued tokens stop being accepted.
  const { email } = adminCredentials();
  return session.sub === email ? session : null;
}

/** For admin pages: redirects to the login screen when not signed in. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await authorisedSession();
  if (session === null) {
    redirect('/admin/belepes');
  }
  return session;
}

/** For admin API routes: returns a 401 response instead of a redirect. */
export async function requireAdminApi(): Promise<{ session: AdminSession } | { response: NextResponse }> {
  const session = await authorisedSession();
  if (session === null) {
    return {
      response: NextResponse.json(
        { error: 'Nincs jogosultság.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      ),
    };
  }
  return { session };
}

/** True when the current visitor is a signed-in admin. */
export async function isAdmin(): Promise<boolean> {
  return (await authorisedSession()) !== null;
}
