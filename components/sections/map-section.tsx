'use client';

import Link from 'next/link';
import { useConsent } from '@/components/consent/consent-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { SITE_NAME, mapsSearchUrl } from '@/lib/site';

/**
 * The location map.
 *
 * The Google embed sits inside the page's own frame — a hairline border rather
 * than the rounded card Google hands out — in the map's own colours, so streets,
 * parks and the pin read the way visitors know them from their phones. It is
 * lazy-loaded and given a title, because an untitled iframe is an unlabelled
 * landmark for anyone navigating by keyboard or screen reader.
 *
 * The frame is only requested once the visitor has agreed to Google's cookies
 * (see lib/consent.ts). Until then the same box holds a placeholder that says
 * why the map is missing, loads it on request — a click there is the consent —
 * and offers the map on Google's own site as a plain link, which needs none.
 *
 * The component fills whatever box its parent gives it; the caller owns the size.
 */
export function MapSection({
  embedUrl,
  address,
  className,
}: {
  embedUrl: string;
  address: string;
  className?: string;
}): React.JSX.Element | null {
  const { consent, policyHref, decide } = useConsent();

  if (embedUrl === '') {
    return null;
  }

  const place = address === '' ? SITE_NAME : address;
  const query = address === '' ? SITE_NAME : `${SITE_NAME}, ${address}`;

  return (
    <div className={cn('relative overflow-hidden border border-[var(--k-line)] bg-[var(--k-ink-raised)]', className)}>
      {consent?.maps === true ? (
        <iframe
          src={embedUrl}
          title={`Térkép — ${place}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="k-map-placeholder absolute inset-0 flex flex-col justify-end gap-6 p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-[length:var(--k-title)] font-semibold leading-snug text-[var(--k-bone)]">{place}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--k-muted)]">
              A térkép a Google Maps szolgáltatásával töltődik be, ezért a Google sütiket helyezhet el a böngésződben.
              {policyHref !== null && (
                <>
                  {' '}
                  <Link
                    href={policyHref}
                    className="whitespace-nowrap text-[var(--k-bone)] underline underline-offset-4 transition-colors hover:text-[var(--k-red-hot)]"
                  >
                    Részletek
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="bone" size="sm" onClick={() => decide({ maps: true })}>
              Térkép betöltése
            </Button>
            <ButtonLink href={mapsSearchUrl(query)} external variant="outline" size="sm">
              Megnyitás a Google Térképen
              <span className="sr-only"> (új lapon nyílik meg)</span>
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
