import { SITE_NAME } from '@/lib/site';
import { absoluteUrl } from '@/lib/seo/site-url';
import type { PricingItem, SiteSettings } from '@/lib/types';

/**
 * Structured data, built from the same settings the pages render — so it can
 * never drift from what a visitor sees. Fields that are still blank are left out
 * entirely rather than emitted empty.
 */

type Json = Record<string, unknown>;

export function organisationJsonLd(settings: SiteSettings): Json {
  const address = settings['contact_address'] ?? '';
  const city = settings['contact_city'] ?? '';
  const phone = settings['contact_phone'] ?? '';
  const email = settings['contact_email'] ?? '';
  const socials = [settings['social_facebook'], settings['social_instagram']].filter(
    (value): value is string => value !== undefined && value !== '',
  );

  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    description:
      'Edzőterem, küzdőtér és sportegyesület Hatvan belvárosában, 2015 óta. Szabad súlyok, erőgépek, crossfight, boksz és csoportos foglalkozások.',
    image: absoluteUrl('/hero-poster.jpg'),
  };

  if (address !== '') {
    data['address'] = {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city === '' ? 'Hatvan' : city,
      addressCountry: 'HU',
    };
  }
  if (phone !== '') {
    data['telephone'] = phone;
  }
  if (email !== '') {
    data['email'] = email;
  }
  if (socials.length > 0) {
    data['sameAs'] = socials;
  }

  return data;
}

/** Ticket types as an offer catalogue, so search engines can read the prices. */
export function pricingJsonLd(items: readonly PricingItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Bérletek és jegyek',
    url: absoluteUrl('/arak'),
    itemListElement: items.map((item, index) => ({
      '@type': 'Offer',
      position: index + 1,
      name: item.name,
      description: item.description,
      price: item.price,
      priceCurrency: item.currency,
      availability: 'https://schema.org/InStock',
    })),
  };
}

/** Breadcrumb trail for a second-level page. */
export function breadcrumbJsonLd(title: string, path: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Főoldal', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(path) },
    ],
  };
}
