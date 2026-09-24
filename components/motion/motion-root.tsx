'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DUR, EASE, SHIFT, STAGGER } from '@/lib/motion';

/**
 * The single motion controller for the whole site.
 *
 * Sections stay server components and only mark themselves up with
 * `data-reveal="…"`; this client component finds them and animates them. That
 * keeps the JavaScript on the page to one small controller instead of a wrapper
 * component per animated element.
 *
 * Reduced motion is handled by gsap.matchMedia: when the user prefers less
 * motion the same elements are simply made visible with no movement at all.
 *
 * Only what is below the fold is hidden. On the first load, anything already on
 * screen has been visible since the server-rendered paint; hiding it now to
 * animate it back in would flash, and would hold the largest paint back until
 * this script arrived. The first screen's own entrances are CSS (.k-intro).
 * After a client-side navigation the new page mounts under the already-hidden
 * state, so there everything animates as before.
 */

let firstLoad = true;

/** Marks every reveal target currently inside the viewport as already revealed. */
function keepOnScreenContent(): void {
  for (const element of document.querySelectorAll<HTMLElement>('[data-reveal]:not(.k-revealed)')) {
    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      element.classList.add('k-revealed');
    }
  }
}

type RevealKind = 'up' | 'fade' | 'mask' | 'lines' | 'group';

function revealKind(element: Element): RevealKind {
  const value = element.getAttribute('data-reveal');
  switch (value) {
    case 'fade':
    case 'mask':
    case 'lines':
    case 'group':
      return value;
    default:
      return 'up';
  }
}

export function MotionRoot(): null {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (firstLoad) {
      firstLoad = false;
      keepOnScreenContent();
    }

    // Only now may CSS hide un-revealed elements: if the script never runs, or
    // fails, everything stays visible instead of leaving a blank page behind.
    document.documentElement.classList.add('k-motion-ready');

    const media = gsap.matchMedia();

    media.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { reduced } = context.conditions as { motion: boolean; reduced: boolean };
        const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]:not(.k-revealed)');

        if (reduced) {
          gsap.set(targets, { clearProps: 'all' });
          for (const element of targets) {
            element.classList.add('k-revealed');
          }
          return;
        }

        for (const element of targets) {
          const kind = revealKind(element);
          const delay = Number.parseFloat(element.getAttribute('data-reveal-delay') ?? '0');
          const trigger = { scrollTrigger: { trigger: element, start: 'top 88%', once: true } };

          const play = (): void => {
            element.classList.add('k-revealed');
          };

          if (kind === 'group' || kind === 'lines') {
            const children = gsap.utils.toArray<HTMLElement>(
              kind === 'lines' ? ':scope .k-line-inner' : ':scope > *',
              element,
            );
            if (children.length === 0) {
              continue;
            }
            gsap.set(element, { opacity: 1 });
            // 145% clears the whole line box, including the padding that keeps
            // Hungarian double acutes from being clipped, so nothing peeks above
            // the mask while a line is still travelling.
            gsap.set(children, {
              yPercent: kind === 'lines' ? 145 : 0,
              y: kind === 'lines' ? 0 : SHIFT,
              opacity: kind === 'lines' ? 1 : 0,
            });
            gsap.to(children, {
              yPercent: 0,
              y: 0,
              opacity: 1,
              duration: kind === 'lines' ? DUR.slow : DUR.base,
              ease: EASE,
              stagger: STAGGER,
              delay,
              ...trigger,
              onStart: play,
              onComplete: () => gsap.set(children, { clearProps: 'transform' }),
            });
            continue;
          }

          if (kind === 'mask') {
            gsap.set(element, { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' });
            gsap.to(element, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: DUR.slow,
              ease: EASE,
              delay,
              ...trigger,
              onStart: play,
              onComplete: () => gsap.set(element, { clearProps: 'clipPath' }),
            });
            continue;
          }

          gsap.fromTo(
            element,
            { opacity: 0, y: kind === 'fade' ? 0 : SHIFT },
            {
              opacity: 1,
              y: 0,
              duration: DUR.base,
              ease: EASE,
              delay,
              ...trigger,
              onStart: play,
              onComplete: () => gsap.set(element, { clearProps: 'transform' }),
            },
          );
        }

        ScrollTrigger.refresh();
      },
    );

    return () => {
      media.revert();
      for (const trigger of ScrollTrigger.getAll()) {
        trigger.kill();
      }
    };
    // Re-scan after every navigation: the new page's elements need triggers too.
  }, [pathname]);

  return null;
}
