import { SectionHeading } from '@/components/ui/section-heading';

const STATS = [
  { value: '2015', label: 'Óta nyitva' },
  { value: '3', label: 'Külön terem' },
  { value: 'Hatvan', label: 'Belváros' },
] as const;

/**
 * The first thing after the hero: what it is like to train here, in one compact
 * band.
 *
 * Type only — the hero above and the feature rows below carry the photographs,
 * and what the gym is equipped with is told row by row there, so this band says
 * who is welcome and how they are looked after. The headline and the two
 * sentences share a row; the three figures sit beneath, divided only from each
 * other, so nothing rules the band off from the sections around it.
 */
export function BrandIntro(): React.JSX.Element {
  return (
    <section className="k-section-tight">
      <div className="k-container">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeading lines={['Nem stúdió.', 'Edzőterem.']} size="lg" />
          </div>

          <div className="flex flex-col gap-5 lg:col-span-5 lg:col-start-8" data-reveal="group">
            <p className="k-lead">
              Nálunk nem számít, honnan indulsz. Akár most lépsz be először edzőterembe, akár évek óta edzel, itt a
              saját tempódban fejlődhetsz.
            </p>
            <p className="k-body-muted">
              2015 óta barátságos közösség vagyunk Hatvan belvárosában. Ha elakadsz, szólj bátran: segítünk beállítani
              a gépet, megmutatjuk a helyes technikát — és mindig örülünk, ha újra látunk.
            </p>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-3 lg:mt-16" data-reveal="group">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse justify-end gap-2 border-l border-[var(--k-line)] py-2 pl-4 first:border-l-0 first:pl-0 sm:pl-8 lg:pl-10"
            >
              <dt className="text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--k-muted)] sm:text-xs">
                {stat.label}
              </dt>
              <dd className="font-display text-[clamp(1.25rem,3vw,2.5rem)] font-extrabold uppercase leading-none tracking-[-0.01em] text-[var(--k-bone)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
