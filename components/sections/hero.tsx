import Image from 'next/image';
import heroImage from '@/assets/hero.webp';
import { HeroVideo } from '@/components/sections/hero-media';
import { HeroIntro } from '@/components/sections/hero-intro';
import { ButtonLink } from '@/components/ui/button';

/**
 * The loudest thing on the site.
 *
 * Full viewport, one photograph, one headline, one action. The still is loaded
 * with priority and fetchPriority="high"; everything else in the hero is text,
 * and all of it enters with CSS from the first paint (see .k-intro in
 * globals.css), so nothing on the first screen waits for the JavaScript.
 */
export function Hero({ videoSrc }: { videoSrc: string }): React.JSX.Element {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[var(--k-ink)]">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="A Kóter Gym erőterme: fekvenyomó padok, guggolóállványok és a falon a klub piros emblémája"
          fill
          priority
          fetchPriority="high"
          quality={78}
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-center"
        />
        <HeroVideo src={videoSrc} />

        {/* Two overlays: one grounds the type, one keeps the whole frame cinematic. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(6,6,7,0.96) 0%, rgba(6,6,7,0.72) 32%, rgba(6,6,7,0.32) 62%, rgba(6,6,7,0.55) 100%)',
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[var(--k-ink)] opacity-25" />
      </div>

      <div className="k-container relative z-10 pb-16 pt-40 sm:pb-20 lg:pb-24">
        <HeroIntro />

        <div className="mt-10 flex flex-col gap-10 lg:mt-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <p
            className="k-lead k-intro-rise max-w-md text-[var(--k-bone)]/85"
            style={{ '--k-intro-delay': '0.45s' } as React.CSSProperties}
          >
            Erőterem, küzdőtér és egy csapat, amelyik számon kér. Hatvan belvárosában, 2015 óta.
          </p>

          <div
            className="k-intro-rise"
            style={{ '--k-intro-delay': '0.6s' } as React.CSSProperties}
          >
            <ButtonLink href="/rolunk" variant="solid" size="lg">
              Rólunk
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
