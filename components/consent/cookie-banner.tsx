'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useConsent } from '@/components/consent/consent-provider';
import { Button } from '@/components/ui/button';

/**
 * The cookie notice.
 *
 * Shown until the visitor answers, and again whenever they reopen it from the
 * footer. It is a non-modal bar at the foot of the screen: the page stays fully
 * usable behind it, and nothing optional loads until a choice is made.
 *
 * Refusing is exactly as easy as accepting — two buttons of the same size, side
 * by side, one click each — as the EDPB's cookie-banner guidance requires. The
 * server renders it for a visitor without a stored answer, so it is part of the
 * first paint rather than popping in after hydration.
 */
export function CookieBanner(): React.JSX.Element | null {
  const { consent, reviewing, policyHref, decide } = useConsent();
  const region = useRef<HTMLElement>(null);
  const open = consent === null || reviewing;

  // Reopened from the footer: take keyboard focus to the choice being changed.
  useEffect(() => {
    if (reviewing) {
      region.current?.focus();
    }
  }, [reviewing]);

  if (!open) {
    return null;
  }

  return (
    <section
      ref={region}
      tabIndex={-1}
      aria-labelledby="suti-cim"
      data-reviewing={reviewing ? '' : undefined}
      className="k-consent pointer-events-none fixed inset-x-0 bottom-0 z-[60] pb-[max(1rem,env(safe-area-inset-bottom))] outline-none"
    >
      <div className="k-container">
        <div className="pointer-events-auto flex flex-col gap-5 border border-[var(--k-line-strong)] bg-[rgb(12_12_14/0.97)] p-5 shadow-[0_24px_60px_rgb(0_0_0/0.55)] backdrop-blur-md sm:p-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
          <div className="flex-1">
            <h2 id="suti-cim" className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--k-bone)]">
              Sütik és térkép
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--k-muted)]">
              Az oldal csak a működéséhez szükséges sütiket használja. A beágyazott Google Térkép betöltésekor viszont a
              Google saját sütiket helyezhet el, és megkapja például az IP-címedet, ezért a térképet csak a
              hozzájárulásoddal jelenítjük meg. A döntésedet bármikor megváltoztathatod a lábléc „Süti-beállítások”
              gombjával.
              {policyHref !== null && (
                <>
                  {' '}
                  <Link
                    href={policyHref}
                    className="whitespace-nowrap text-[var(--k-bone)] underline underline-offset-4 transition-colors hover:text-[var(--k-red-hot)]"
                  >
                    Süti tájékoztató
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="grid flex-none grid-cols-2 gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => decide({ maps: false })}>
              Elutasítom
            </Button>
            <Button type="button" variant="bone" size="sm" onClick={() => decide({ maps: true })}>
              Elfogadom
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
