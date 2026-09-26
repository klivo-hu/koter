import 'server-only';
import { cookies } from 'next/headers';
import { CONSENT_COOKIE, parseConsent, type Consent } from '@/lib/consent';

/** The visitor's stored cookie choice for this request, or null when they have not answered yet. */
export async function readConsent(): Promise<Consent | null> {
  return parseConsent((await cookies()).get(CONSENT_COOKIE)?.value);
}
