import type { Metadata } from 'next';
import awardImage from '@/assets/award.webp';
import teamMain from '@/assets/team-main.webp';
import teamSecond from '@/assets/team-second.webp';
import { LocationSection } from '@/components/sections/location-section';
import { SocialSection } from '@/components/sections/social-section';
import { StaticImage } from '@/components/ui/media';
import { PageHeader } from '@/components/ui/page-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { listAwards, getSettings } from '@/lib/repositories';
import { JsonLd } from '@/components/seo/json-ld';
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

  const heading = settings['about_heading'] ?? 'Gyere, tartozz közénk.';
  const intro = settings['about_intro'] ?? '';
  const awardsIntro = settings['awards_intro'] ?? '';
  const [opening = '', ...paragraphs] = (settings['about_body'] ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '');

  // The slogan is authored as two sentences; split on the comma so the line
  // break lands where the meaning does.
  const headingLines = heading.includes(',')
    ? [`${heading.slice(0, heading.indexOf(',')).trim()},`, heading.slice(heading.indexOf(',') + 1).trim()]
    : [heading];

  return (
    <>
      <JsonLd data={[organisationJsonLd(settings), breadcrumbJsonLd('Rólunk', '/rolunk')]} />

      <PageHeader lines={headingLines} lead={intro === '' ? undefined : intro} />

      {/* ------------------------------------------------------------ the gym */}
      {/* The admin's own copy: the first paragraph set large, the rest beside it. */}
      {opening !== '' && (
        <section className="pb-[var(--k-section-tight)] pt-10 lg:pt-14">
          <div className="k-container grid gap-8 lg:grid-cols-12 lg:gap-16">
            <p className="k-lead whitespace-pre-line lg:col-span-6" data-reveal="up">
              {opening}
            </p>
            {paragraphs.length > 0 && (
              <div className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8" data-reveal="group">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="k-body-muted whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- the team */}
      {/* Both team photographs in one row of equal height: the wide one at two
          thirds, the tall one at a third, which is close to each picture's own
          shape, so neither is cropped hard. Stacked on phones. */}
      <section
        id="csapat"
        aria-labelledby="csapat-cim"
        className="k-section k-surface-metal scroll-mt-[var(--k-header-h)]"
      >
        <div className="k-container">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHeading id="csapat-cim" lines={['A csapat.']} size="xl" />
            </div>
            <p className="k-body-muted lg:col-span-5 lg:col-start-8" data-reveal="up">
              Versenyzők, edzők és tagok. Aki nálunk készül, azt elkísérjük a versenyre is.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:aspect-[7/3] sm:grid-cols-12 sm:gap-5 lg:mt-16 lg:gap-6">
            <div className="sm:col-span-8" data-reveal="mask">
              <StaticImage
                src={teamMain}
                alt="A Kóter Gym versenycsapata a klub zászlajával, érmekkel és kupákkal a teremben"
                fill
                className="max-sm:aspect-[3/2]"
                sizes="(min-width: 1440px) 900px, (min-width: 640px) 64vw, 92vw"
              />
            </div>
            <div className="sm:col-span-4" data-reveal="mask" data-reveal-delay="0.12">
              <StaticImage
                src={teamSecond}
                alt="A Kóter Gym csapata érmekkel és oklevelekkel egy verseny után"
                fill
                className="max-sm:aspect-[4/5]"
                imageClassName="object-[50%_62%]"
                sizes="(min-width: 1440px) 440px, (min-width: 640px) 32vw, 92vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ awards */}
      {/* The heading beside the photograph of an award evening, one card per
          award beneath; cards in a row share a height, and the issuer line is
          pinned to the bottom so they align. */}
      <section className="k-section">
        <div className="k-container">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading lines={['Díjak és', 'elismerések.']} size="lg" />
              {awardsIntro !== '' && <p className="k-body-muted mt-8 text-sm">{awardsIntro}</p>}
            </div>
            <div className="lg:col-span-6 lg:col-start-7" data-reveal="mask">
              <StaticImage
                src={awardImage}
                alt="A Kóter Gym vezetője oklevelet vesz át egy hatvani díjátadón"
                ratio="3 / 2"
                sizes="(min-width: 1440px) 660px, (min-width: 1024px) 46vw, 92vw"
              />
            </div>
          </div>

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
                  <h3 className="mt-6 text-[length:var(--k-title)] font-semibold leading-snug text-[var(--k-bone)]">
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
      <LocationSection settings={settings} />

      {/* ------------------------------------------------------------ social */}
      <SocialSection settings={settings} />
    </>
  );
}
