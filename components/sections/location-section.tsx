import { MapSection } from '@/components/sections/map-section';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { SITE_NAME, mapsDirectionsUrl, telHref } from '@/lib/site';
import type { SiteSettings } from '@/lib/types';

/**
 * Where the gym is and how to reach it — one section, used unchanged on the
 * home page and on Rólunk, so the two can never drift apart.
 *
 * The contact details and the route-planning action share a column with the
 * heading, and the map beside them stretches to that column's height (never
 * below a usable minimum), so neither side leaves a gap under the other. On
 * narrow screens the map drops beneath at a fixed ratio.
 *
 * Every line comes from settings and is dropped while still blank, so the block
 * never shows an empty label or a placeholder dash. The map is left out while
 * its embed URL is blank, and only loads once the visitor has agreed to Google's
 * cookies (see MapSection).
 */
export function LocationSection({ settings }: { settings: SiteSettings }): React.JSX.Element {
  const address = settings['contact_address'] ?? '';
  const phone = settings['contact_phone'] ?? '';
  const email = settings['contact_email'] ?? '';
  const hours = settings['opening_hours'] ?? '';
  const mapUrl = settings['map_embed_url'] ?? '';

  const details = [
    { label: 'Cím', value: address, href: '' },
    { label: 'Telefon', value: phone, href: phone === '' ? '' : telHref(phone) },
    { label: 'E-mail', value: email, href: email === '' ? '' : `mailto:${email}` },
    { label: 'Nyitvatartás', value: hours, href: '' },
  ].filter((detail) => detail.value !== '');

  return (
    <section aria-labelledby="helyszin" className="k-section-tight k-surface-raised">
      <div className="k-container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col lg:col-span-5">
          <SectionHeading id="helyszin" lines={['Gyere be,', 'nézz körül.']} size="lg" />
          <p className="k-body-muted mt-6">
            Nem kell előre bejelentkezni. Gyere be nyitvatartási időben, nézd meg a termet, és kérdezz.
          </p>

          {details.length > 0 && (
            <dl className="mt-8 border-t border-[var(--k-line)]" data-reveal="group">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-[var(--k-line)] py-5"
                >
                  <dt className="text-xs uppercase tracking-[0.18em] text-[var(--k-muted)]">{detail.label}</dt>
                  <dd className="text-right text-[var(--k-bone)]">
                    {detail.href === '' ? (
                      <span className="whitespace-pre-line">{detail.value}</span>
                    ) : (
                      <a
                        href={detail.href}
                        className="underline-offset-4 transition-colors hover:text-[var(--k-red-hot)] hover:underline"
                      >
                        {detail.value}
                      </a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {address !== '' && (
            <div className="mt-8 lg:mt-auto lg:pt-10" data-reveal="up">
              <ButtonLink href={mapsDirectionsUrl(`${SITE_NAME}, ${address}`)} external variant="solid" size="lg">
                Útvonaltervezés
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </ButtonLink>
            </div>
          )}
        </div>

        {mapUrl !== '' && (
          <div className="lg:col-span-7" data-reveal="mask">
            <MapSection
              embedUrl={mapUrl}
              address={address}
              className="aspect-[4/3] min-h-[20rem] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[26rem]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
