import introImage from '@/assets/intro.webp';
import { SectionHeading } from '@/components/ui/section-heading';
import { StaticImage } from '@/components/ui/media';

/**
 * The first thing after the hero: what this place actually is.
 *
 * An asymmetric two-column block — type on the left at seven columns, a tall
 * photograph on the right at five, offset downward so the two never line up.
 * The offset is what stops it reading like a template.
 */
export function BrandIntro(): React.JSX.Element {
  return (
    <section className="k-section border-t border-[var(--k-line)]">
      <div className="k-container grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading lines={['Nem stúdió.', 'Edzőterem.']} size="xl" />

          <div className="mt-10 flex flex-col gap-6 lg:mt-14" data-reveal="group">
            <p className="k-lead">
              Szabad súlyok, állványok, padok, erőgépek és kardió. Külön küzdőtér zsákokkal, és egy nagyterem, ahol
              csoportos órák mennek.
            </p>
            <p className="k-body-muted">
              2015 óta ugyanazzal a hozzáállással: aki bejön, azt megnézik, megszólítják, és ha kell, kijavítják. Nem
              arctalan bérletgyár — közösség, ahol számon kérik rajtad, ha két hétig nem jössz.
            </p>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-px border-t border-[var(--k-line)] sm:grid-cols-3" data-reveal="group">
            {[
              { value: '2015', label: 'Óta nyitva' },
              { value: '3', label: 'Külön terem' },
              { value: 'Hatvan', label: 'Belváros' },
            ].map((stat) => (
              <div key={stat.label} className="border-b border-[var(--k-line)] py-7 pr-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="k-display-md block text-[var(--k-bone)]">{stat.value}</span>
                  <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-[var(--k-muted)]">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:pt-24" data-reveal="mask">
          <StaticImage
            src={introImage}
            alt="Fekvenyomó pad és guggolóállvány a Kóter Gym erőtermében"
            ratio="4 / 5"
            sizes="(min-width: 1024px) 38vw, 92vw"
          />
        </div>
      </div>
    </section>
  );
}
