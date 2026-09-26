/**
 * Site-wide constants that are structural rather than editorial content.
 *
 * Imported by client components, so it must stay free of Node built-ins and of
 * anything server-only. The public origin is resolved in lib/seo/site-url.ts,
 * which reads it per request on the server.
 */

export const SITE_NAME = 'Kóter Gym & Crossfight Aréna';
export const SITE_SHORT = 'Kóter Gym';
export const LOCALE = 'hu_HU';

/** Used only when no origin is configured — local development. */
export const SITE_URL_FALLBACK = 'http://localhost:3000';

/** The public navigation. Five pages, nothing else. */
export const NAV = [
  { href: '/arak', label: 'Árak' },
  { href: '/edzok', label: 'Edzők' },
  { href: '/galeria', label: 'Galéria' },
  { href: '/rolunk', label: 'Rólunk' },
] as const;

/** Whole forints, grouped the Hungarian way: 17 000 Ft. */
export function formatPrice(amount: number, currency = 'HUF'): string {
  const formatted = new Intl.NumberFormat('hu-HU', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
  return currency === 'HUF' ? `${formatted} Ft` : `${formatted} ${currency}`;
}

/** A phone number as a tel: target, with formatting characters removed. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/*
 * Links to Google Maps. These are plain navigation to Google's own site, not an
 * embed, so unlike the map frame they need no cookie consent.
 */

/** A place on Google Maps, found by name and address. */
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Route planning to a place, from wherever the visitor is. */
export function mapsDirectionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

