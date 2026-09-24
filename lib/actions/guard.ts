import 'server-only';
import { adminCredentials } from '@/lib/env';
import { currentSession } from '@/lib/auth/session';

/**
 * The authorisation check every server action begins with.
 *
 * Server Actions are POST endpoints like any other, so each one re-verifies the
 * session here rather than trusting that the caller came from an admin page. It
 * throws instead of redirecting: an action reached without a session is not a
 * navigation, it is a request that must fail.
 */
export async function requireAdminAction(): Promise<string> {
  const session = await currentSession();
  const { email } = adminCredentials();
  if (session === null || session.sub !== email) {
    throw new Error('Nincs jogosultság ehhez a művelethez.');
  }
  return session.sub;
}
