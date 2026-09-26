/**
 * Cookie consent — the model shared by the server and the browser.
 *
 * The site itself sets no analytics or marketing cookies. The one thing that
 * needs a visitor's permission is the embedded Google Map: loading it lets
 * Google set its own cookies and receive the visitor's IP address, so under the
 * GDPR and the ePrivacy rules it may only load after an explicit yes.
 *
 * The answer is kept in a first-party cookie. Storing the choice is itself
 * strictly necessary — without it the question would return on every page — so
 * it needs no consent of its own. Being a cookie rather than localStorage, the
 * server reads it too, and renders the map straight away for a visitor who has
 * already agreed instead of flashing the placeholder first.
 *
 * Imported by client components: no Node built-ins, nothing server-only.
 */

export const CONSENT_COOKIE = 'koter_consent';

/**
 * Bumped whenever the categories below change. An answer given under an older
 * version is treated as no answer, so the visitor is asked again.
 */
export const CONSENT_VERSION = 1;

/** Six months, after which the question is asked again. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

/** The legal page the banner and the map placeholder link to. */
export const COOKIE_POLICY_SLUG = 'suti-tajekoztato';

export interface Consent {
  /** Third-party map embeds (Google Maps). */
  readonly maps: boolean;
}

/** Reads a stored answer. Anything malformed, or from another version, counts as none. */
export function parseConsent(value: string | undefined): Consent | null {
  if (value === undefined || value === '') {
    return null;
  }
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(decodeURIComponent(value));
  } catch {
    return null;
  }
  if (params.get('v') !== String(CONSENT_VERSION)) {
    return null;
  }
  const maps = params.get('maps');
  if (maps !== '0' && maps !== '1') {
    return null;
  }
  return { maps: maps === '1' };
}

/** The cookie value for an answer: `v=1&maps=1`, URI-encoded so it is a valid cookie value. */
export function serializeConsent(consent: Consent): string {
  return encodeURIComponent(
    new URLSearchParams({ v: String(CONSENT_VERSION), maps: consent.maps ? '1' : '0' }).toString(),
  );
}
