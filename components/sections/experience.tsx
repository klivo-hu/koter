import classesImage from '@/assets/classes.webp';
import crossfightImage from '@/assets/crossfight.webp';
import { SectionHeading } from '@/components/ui/section-heading';
import { StaticImage } from '@/components/ui/media';

const DISCIPLINES = [
  {
    title: 'Erőterem',
    body: 'Szabad súlyok, állványok, fekvenyomó padok és erőgépek. Minden, amiből komolyan lehet emelni — és hely hozzá.',
  },
  {
    title: 'Crossfight & boksz',
    body: 'Zsákok, kesztyűk, küzdőtér. Thai box és funkcionális edzés ugyanabban a teremben.',
  },
  {
    title: 'Csoportos órák',
    body: 'Női edzések, gyerekfoglalkozások és tánctermi órák heti rendszerességgel a nagyteremben.',
  },
  {
    title: 'Sportegyesület',
    body: 'Fighter & Builder SE. Aki versenyezni akar, nálunk el tud indulni — és van kivel készülni.',
  },
] as const;

/**
 * What you can actually do here.
 *
 * Four disciplines as a numbered editorial list, with two photographs placed
 * beside them at different heights. The list is the content; the pictures are
 * there to keep the column from becoming a wall of text.
 */
export function Experience(): React.JSX.Element {
  return (
    <section className="k-section k-surface-turf">
      <div className="k-container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading lines={['Négy dolog,', 'amiért', 'ide jársz.']} size="lg" />
            <p className="k-body-muted mt-8">
              Testépítés, küzdősport és csoportos edzés egy helyen. Nem kell három bérlet három terembe.
            </p>

            <div className="mt-12 hidden lg:block" data-reveal="mask">
              <StaticImage
                src={crossfightImage}
                alt="Bokszedzés a Kóter Gym küzdőterében, zsákokkal és kesztyűs edzőpárokkal"
                ratio="3 / 2"
                sizes="38vw"
              />
            </div>
          </div>

          <ol className="lg:col-span-7" data-reveal="group">
            {DISCIPLINES.map((item, index) => (
              <li
                key={item.title}
                className="group grid grid-cols-[auto_1fr] gap-x-6 border-t border-[var(--k-line)] py-9 last:border-b sm:gap-x-10 lg:py-11"
              >
                <span
                  aria-hidden="true"
                  className="pt-1 font-mono text-xs tabular-nums text-[var(--k-muted)] transition-colors duration-500 group-hover:text-[var(--k-red)]"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="k-display-md text-[var(--k-bone)] transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--k-muted)] sm:text-base">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 lg:hidden" data-reveal="mask">
          <StaticImage
            src={crossfightImage}
            alt="Bokszedzés a Kóter Gym küzdőterében, zsákokkal és kesztyűs edzőpárokkal"
            ratio="3 / 2"
            sizes="92vw"
          />
        </div>

        <div className="mt-6 lg:mt-20 lg:w-[62%] lg:translate-x-[38%]" data-reveal="mask">
          <StaticImage
            src={classesImage}
            alt="Csoportos súlyzós edzés a Kóter Gym termében"
            ratio="16 / 9"
            sizes="(min-width: 1024px) 58vw, 92vw"
          />
        </div>
      </div>
    </section>
  );
}
