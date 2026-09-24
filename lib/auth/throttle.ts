import 'server-only';

/**
 * Login throttling.
 *
 * Failed attempts are counted per client address in a sliding window and the
 * form is refused once the limit is reached. The counter lives in memory, which
 * is exactly right for this deployment: one container, one process, no shared
 * cache to keep in sync — and a restart clearing it is not a weakness worth
 * adding a dependency for.
 *
 * A successful sign-in clears the address immediately, so a person who simply
 * mistyped is never locked out for long.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

interface Attempts {
  count: number;
  first: number;
}

const attempts = new Map<string, Attempts>();

/** Drops windows that have expired, so the map cannot grow without bound. */
function sweep(now: number): void {
  for (const [key, record] of attempts) {
    if (now - record.first > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export interface ThrottleVerdict {
  readonly allowed: boolean;
  /** Whole minutes until the window resets, when blocked. */
  readonly retryInMinutes: number;
}

export function checkLoginAttempt(key: string): ThrottleVerdict {
  const now = Date.now();
  sweep(now);

  const record = attempts.get(key);
  if (record === undefined || now - record.first > WINDOW_MS) {
    return { allowed: true, retryInMinutes: 0 };
  }
  if (record.count < MAX_ATTEMPTS) {
    return { allowed: true, retryInMinutes: 0 };
  }
  return {
    allowed: false,
    retryInMinutes: Math.max(1, Math.ceil((WINDOW_MS - (now - record.first)) / 60000)),
  };
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const record = attempts.get(key);
  if (record === undefined || now - record.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return;
  }
  record.count += 1;
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}
