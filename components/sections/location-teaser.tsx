import { MapSection } from '@/components/sections/map-section';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { telHref } from '@/lib/site';
import type { SiteSettings } from '@/lib/types';

/**
 * Where the gym is — the last thing before the footer. The contact details sit
 * above a square map of the same address; the social links live on the Rólunk
 * page and in the footer, so they are not repeated here. The map uses the same
 * embed URL as the Rólunk page and is left out while that setting is blank.
 *
 * Every line here comes from settings, and each one is dropped when it is still
 * blank, so the block never shows an empty label or a placeholder dash.
 */
export function LocationTeaser({ settings }: { settings: SiteSettings }): React.JSX.Element {
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
    <section className="k-section border-t border-[var(--k-line)] bg-[var(--k-ink-raised)]">
      <div className="k-container grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <SectionHeading lines={['Gyere be,', 'nézz körül.']} size="lg" />
          <p className="k-body-muted mt-8">
            Nem kell előre bejelentkezni. Gyere be nyitvatartási időben, nézd meg a termet, és kérdezz.
          </p>
          <div className="mt-10" data-reveal="up">
            <ButtonLink href="/rolunk" variant="solid" size="lg">
              Rólunk
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {details.length > 0 && (
            <dl className="border-t border-[var(--k-line)]" data-reveal="group">
              {details.map((detail) => (
                <div key={detail.label} className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-[var(--k-line)] py-6">
                  <dt className="text-xs uppercase tracking-[0.18em] text-[var(--k-muted)]">{detail.label}</dt>
                  <dd className="text-right text-[var(--k-bone)]">
                    {detail.href === '' ? (
                      <span className="whitespace-pre-line">{detail.value}</span>
                    ) : (
                      <a href={detail.href} className="underline-offset-4 transition-colors hover:text-[var(--k-red-hot)] hover:underline">
                        {detail.value}
                      </a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {mapUrl !== '' && (
            <div className="mt-10" data-reveal="mask">
              <MapSection embedUrl={mapUrl} address={address} aspectRatio="1 / 1" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
