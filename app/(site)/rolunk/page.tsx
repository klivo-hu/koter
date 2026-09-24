import type { Metadata } from 'next';
import awardImage from '@/assets/award.webp';
import teamMain from '@/assets/team-main.webp';
import teamSecond from '@/assets/team-second.webp';
import { MapSection } from '@/components/sections/map-section';
import { SocialLinks, socialLinksFrom } from '@/components/site/social-links';
import { StaticImage } from '@/components/ui/media';
import { PageHeader } from '@/components/ui/page-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { listAwards, getSettings } from '@/lib/repositories';
import { JsonLd } from '@/components/seo/json-ld';
import { telHref } from '@/lib/site';
import { absoluteUrl } from '@/lib/seo/site-url';
import { breadcrumbJsonLd, organisationJsonLd } from '@/lib/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Rólunk',
  description:
    'A Kóter Gym & Crossfight Aréna 2015 óta működik Hatvan belvárosában. A terem, a csapat, az eredmények és a helyszín.',
  alternates: { canonical: '/rolunk' },
  openGraph: { url: absoluteUrl('/rolunk'), title: 'Rólunk' },
};

export default function AboutPage(): React.JSX.Element {
  const settings = getSettings();
  const awards = listAwards();
  const socials = socialLinksFrom(settings);

  const heading = settings['about_heading'] ?? 'Gyere, tartozz közénk.';
  const intro = settings['about_intro'] ?? '';
  const body = settings['about_body'] ?? '';
  const address = settings['contact_address'] ?? '';
  const phone = settings['contact_phone'] ?? '';
  const email = settings['contact_email'] ?? '';
  const hours = settings['opening_hours'] ?? '';
  const mapUrl = settings['map_embed_url'] ?? '';
  const awardsIntro = settings['awards_intro'] ?? '';

  // The slogan is authored as two sentences; split on the comma so the line
  // break lands where the meaning does.
  const headingLines = heading.includes(',')
    ? [`${heading.slice(0, heading.indexOf(',')).trim()},`, heading.slice(heading.indexOf(',') + 1).trim()]
    : [heading];

  const contact = [
    { label: 'Cím', value: address, href: '' },
    { label: 'Telefon', value: phone, href: phone === '' ? '' : telHref(phone) },
    { label: 'E-mail', value: email, href: email === '' ? '' : `mailto:${email}` },
    { label: 'Nyitvatartás', value: hours, href: '' },
  ].filter((item) => item.value !== '');

  return (
    <>
      <JsonLd data={[organisationJsonLd(settings), breadcrumbJsonLd('Rólunk', '/rolunk')]} />

      <PageHeader lines={headingLines} lead={intro === '' ? undefined : intro} />

      {/* ---------------------------------------------------------- the gym */}
      <section className="k-section-tight">
        <div className="k-container grid gap-14 border-t border-[var(--k-line)] pt-14 lg:grid-cols-12 lg:gap-16 lg:pt-20">
          <div className="lg:col-span-5" data-reveal="mask">
            <StaticImage
              src={teamMain}
              alt="A Kóter Gym versenycsapata a klub zászlajával, érmekkel és kupákkal a teremben"
              ratio="4 / 3"
              sizes="(min-width: 1024px) 40vw, 92vw"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {body !== '' && (
              <div className="flex flex-col gap-6" data-reveal="group">
                {body.split('\n\n').map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="k-body-muted whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- the people */}
      <section className="k-section k-surface-metal">
        <div className="k-container">
          <SectionHeading lines={['A csapat.']} size="xl" />
          <p className="k-body-muted mt-8">
            Versenyzők, edzők és tagok. Aki nálunk készül, azt elkísérjük a versenyre is.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-12 lg:mt-20 lg:gap-8">
            <div className="sm:col-span-7" data-reveal="mask">
              <StaticImage
                src={teamSecond}
                alt="A Kóter Gym csapata érmekkel és oklevelekkel egy verseny után"
                ratio="3 / 4"
                sizes="(min-width: 640px) 56vw, 92vw"
              />
            </div>
            <div className="sm:col-span-4 sm:col-start-9 sm:self-end sm:pb-12" data-reveal="mask">
              <StaticImage
                src={awardImage}
                alt="A Kóter Gym vezetője oklevelet vesz át egy hatvani díjátadón"
                ratio="4 / 3"
                sizes="(min-width: 640px) 32vw, 92vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ awards */}
      {/* The heading on top, one card per award beneath it; cards in a row share
          a height, and the issuer line is pinned to the bottom so they align. */}
      <section className="k-section">
        <div className="k-container">
          <SectionHeading lines={['Díjak és', 'elismerések.']} size="lg" />
          {awardsIntro !== '' && <p className="k-body-muted mt-8 text-sm">{awardsIntro}</p>}

          {awards.length === 0 ? (
            <p className="k-body-muted mt-12 border-t border-[var(--k-line)] pt-8 text-sm lg:mt-16">
              Elismerések feltöltés alatt.
            </p>
          ) : (
            <ol
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-5"
              data-reveal="group"
            >
              {awards.map((award) => (
                <li
                  key={award.id}
                  className="flex flex-col border border-[var(--k-line)] border-t-2 border-t-[var(--k-red)] bg-[var(--k-ink-card)] p-6 lg:p-7"
                >
                  <span className="k-display-md tabular-nums text-[var(--k-red)]">{award.year}</span>
                  <h3 className="mt-6 text-[var(--k-title)] font-semibold leading-snug text-[var(--k-bone)]">
                    {award.title}
                  </h3>
                  {award.description !== '' && (
                    <p className="mt-3 text-sm text-[var(--k-muted)]">{award.description}</p>
                  )}
                  {award.issuer !== '' && (
                    <p className="mt-auto pt-6 text-xs uppercase tracking-[0.16em] text-[var(--k-muted)]">
                      {award.source_url === '' ? (
                        award.issuer
                      ) : (
                        <a
                          href={award.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 transition-colors hover:text-[var(--k-bone)] hover:underline"
                        >
                          {award.issuer}
                        </a>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- location */}
      <section className="k-section k-surface-turf">
        <div className="k-container">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading lines={['Hol', 'találsz?']} size="xl" />
              {contact.length > 0 && (
                <dl className="mt-10 border-t border-[var(--k-line)]" data-reveal="group">
                  {contact.map((item) => (
                    <div key={item.label} className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-[var(--k-line)] py-6">
                      <dt className="text-xs uppercase tracking-[0.18em] text-[var(--k-muted)]">{item.label}</dt>
                      <dd className="text-right text-[var(--k-bone)]">
                        {item.href === '' ? (
                          <span className="whitespace-pre-line">{item.value}</span>
                        ) : (
                          <a
                            href={item.href}
                            className="underline-offset-4 transition-colors hover:text-[var(--k-red-hot)] hover:underline"
                          >
                            {item.value}
                          </a>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="lg:col-span-7" data-reveal="mask">
              <MapSection embedUrl={mapUrl} address={address} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ social */}
      {socials.length > 0 && (
        <section className="k-section">
          <div className="k-container">
            <SectionHeading lines={['Kövess', 'minket.']} size="xl" />
            <p className="k-body-muted mt-8">
              Edzésvideók, versenybeszámolók és minden, ami a teremben történik.
            </p>
            <div className="mt-12 border border-[var(--k-line)] lg:mt-16" data-reveal="up">
              <SocialLinks links={socials} variant="stacked" />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
