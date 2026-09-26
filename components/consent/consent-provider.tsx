'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CONSENT_COOKIE, CONSENT_MAX_AGE_SECONDS, serializeConsent, type Consent } from '@/lib/consent';

/**
 * The visitor's cookie choice, shared by the banner, every map on the page and
 * the footer's settings button.
 *
 * It starts from what the server read out of the request's cookie, so the first
 * render already matches the answer and nothing flips after hydration. The site
 * layout persists across client-side navigations, so once given, an answer holds
 * for the whole visit without another round trip.
 */

interface ConsentApi {
  /** The stored answer, or null while the visitor has not answered. */
  readonly consent: Consent | null;
  /** True while the visitor has reopened the settings to change an answer. */
  readonly reviewing: boolean;
  /** The cookie policy page, or null while the admin has it unpublished. */
  readonly policyHref: string | null;
  readonly decide: (consent: Consent) => void;
  readonly review: () => void;
}

const ConsentContext = createContext<ConsentApi | null>(null);

function store(consent: Consent): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(consent)}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function ConsentProvider({
  initial,
  policyHref,
  children,
}: {
  initial: Consent | null;
  policyHref: string | null;
  children: React.ReactNode;
}): React.JSX.Element {
  const [consent, setConsent] = useState<Consent | null>(initial);
  const [reviewing, setReviewing] = useState(false);

  const decide = useCallback((next: Consent) => {
    store(next);
    setConsent(next);
    setReviewing(false);
  }, []);

  const review = useCallback(() => setReviewing(true), []);

  const value = useMemo(
    () => ({ consent, reviewing, policyHref, decide, review }),
    [consent, reviewing, policyHref, decide, review],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentApi {
  const context = useContext(ConsentContext);
  if (context === null) {
    throw new Error('useConsent must be used inside <ConsentProvider>.');
  }
  return context;
}
