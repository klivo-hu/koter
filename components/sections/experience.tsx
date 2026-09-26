import type { StaticImageData } from 'next/image';
import classesImage from '@/assets/classes.webp';
import crossfightImage from '@/assets/crossfight.webp';
import introImage from '@/assets/intro.webp';
import teamImage from '@/assets/team-main.webp';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { StaticImage } from '@/components/ui/media';
import { cn } from '@/lib/cn';

interface Offer {
  readonly title: string;
  readonly tagline: string;
  readonly body: string;
  readonly image: StaticImageData;
  readonly alt: string;
  readonly action: { readonly href: string; readonly label: string; readonly primary?: boolean };
}

const OFFERS: readonly Offer[] = [
  {
    title: 'Erőterem',
    tagline: 'Minden, amiből emelni lehet.',
    body: 'Szabad súlyok, állványok, fekvenyomó padok, erőgépek és kardió — és hely hozzá, hogy komolyan dolgozz.',
    image: introImage,
    alt: 'Fekvenyomó pad és guggolóállvány a Kóter Gym erőtermében',
    action: { href: '/arak', label: 'Bérletek és árak' },
  },
  {
    title: 'Crossfight & boksz',
    tagline: 'Zsák, kesztyű, küzdőtér.',
    body: 'Thai box és funkcionális edzés ugyanabban a teremben. Aki versenyezni akar, a Fighter & Builder SE színeiben el is indulhat — és van kivel készülnie.',
    image: crossfightImage,
    alt: 'Bokszedzés a Kóter Gym küzdőterében, zsákokkal és kesztyűs edzőpárokkal',
    action: { href: '/rolunk#csapat', label: 'A csapat' },
  },
  {
    title: 'Csoportos órák',
    tagline: 'Együtt könnyebb végigcsinálni.',
    body: 'Női edzések, gyerekfoglalkozások és tánctermi órák heti rendszerességgel a nagyteremben.',
    image: classesImage,
    alt: 'Csoportos súlyzós edzés a Kóter Gym termében',
    action: { href: '/galeria', label: 'Képek az órákról' },
  },
  {
    title: 'Személyi edzés',
    tagline: 'Látható eredményt szeretnél?',
    body: 'Személyre szabott edzés, technikajavítás és felkészítés egy edzővel, aki csak rád figyel. Keresd közvetlenül az edzőinket, és megbeszélitek, mire van szükséged.',
    image: teamImage,
    alt: 'A Kóter Gym versenycsapata a klub zászlajával, érmekkel és kupákkal a teremben',
    action: { href: '/edzok', label: 'Az edzőink', primary: true },
  },
];

/**
 * What you can actually do here.
 *
 * Four offers as alternating rows — photograph on one side, the offer on the
 * other, swapping sides row by row so the eye zig-zags down the section. Each row
 * says what it is (the red title), why you would want it (one line in caps), how
 * it works (one short paragraph), and where to go next. Personal training, the
 * last row, is the one solid action: it leads to the trainers.
 *
 * On narrow screens every row stacks photograph-first, the same way each time.
 */
export function Experience(): React.JSX.Element {
  return (
    <section className="k-section k-surface-turf">
      <div className="k-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading lines={['Négy dolog,', 'amiért ide jársz.']} size="lg" />
          </div>
          <p className="k-body-muted lg:col-span-4 lg:col-start-9" data-reveal="up">
            Testépítés, küzdősport, csoportos óra és személyi edzés egy helyen. Nem kell három bérlet három terembe.
          </p>
        </div>

        <ol className="mt-16 flex flex-col gap-20 lg:mt-24 lg:gap-28">
          {OFFERS.map((offer, index) => {
            const flipped = index % 2 === 1;
            return (
              <li key={offer.title} className="group grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-x-16">
                <div
                  className={cn('lg:col-span-6 lg:row-start-1', flipped ? 'lg:col-start-7' : 'lg:col-start-1')}
                  data-reveal="mask"
                >
                  <StaticImage
                    src={offer.image}
                    alt={offer.alt}
                    ratio="16 / 10"
                    sizes="(min-width: 1440px) 660px, (min-width: 1024px) 46vw, 92vw"
                    imageClassName="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <div
                  className={cn('lg:col-span-5 lg:row-start-1', flipped ? 'lg:col-start-1' : 'lg:col-start-8')}
                  data-reveal="group"
                >
                  <h3 className="k-display-lg text-[var(--k-red)]">{offer.title}</h3>
                  <p className="mt-5 font-display text-[length:var(--k-title)] font-bold uppercase leading-tight tracking-[0.01em] text-[var(--k-bone)]">
                    {offer.tagline}
                  </p>
                  <p className="k-body-muted mt-4">{offer.body}</p>
                  <div className="mt-8">
                    <ButtonLink href={offer.action.href} variant={offer.action.primary ? 'solid' : 'outline'} size="md">
                      {offer.action.label}
                    </ButtonLink>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
