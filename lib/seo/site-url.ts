import 'server-only';
import { SITE_URL_FALLBACK } from '@/lib/site';

/**
 * The public origin, resolved on the server at request time.
 *
 * This deliberately reads `SITE_URL` rather than `NEXT_PUBLIC_SITE_URL`:
 * anything prefixed `NEXT_PUBLIC_` is inlined into the bundle when the image is
 * built, so setting it in the hosting panel afterwards would have no effect and
 * every canonical tag, sitemap entry and Open Graph URL would still point at
 * whatever the build machine happened to have. Read here, one environment
 * variable on the running container is enough to move the site to a new domain.
 *
 * `NEXT_PUBLIC_SITE_URL` is still honoured as a fallback so an existing
 * deployment keeps working.
 */
export function siteUrl(): string {
  const value = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK;
  return value.replace(/\/+$/, '');
}

/** Absolute URL for canonical tags, sitemap entries and Open Graph. */
export function absoluteUrl(path = '/'): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
