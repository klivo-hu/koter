'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logo from '@/assets/koter-logo-large.png';
import { INTRO_SEEN_KEY } from '@/lib/intro-curtain';

/** Keys that scroll the page; held back while the curtain is down. */
const SCROLL_KEYS = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

/**
 * How long the curtain stays in the document once it starts to lift. While it is
 * there, CSS holds the hero's entrance back by the curtain's length; removing it
 * earlier would shorten those delays while the headline is still rising and make
 * it jump. The last headline line lands ≈1.4s after the lift begins.
 */
const LINGER_MS = 1600;

/** Fallback release, should the lift's animation events never arrive (animations disabled). */
const RELEASE_MS = 3600;

type Phase = 'holding' | 'lifting' | 'gone';

/**
 * The intro curtain: the mark, large, on the site's ground, for two seconds on
 * the first load of the home page — long enough for the hero photograph, the
 * hero clip and the pictures below the fold to start arriving — and then lifted
 * away as the headline rises (see .k-curtain in globals.css).
 *
 * The timing is CSS alone, counted from the first paint, so it runs the same
 * with or without JavaScript and can never stick. This component only does what
 * CSS cannot: it remembers for the rest of the tab's session that the curtain
 * has played (a pre-paint script in the site layout then keeps it from drawing
 * again), keeps the page from being scrolled while it is down, and takes it out
 * of the document afterwards.
 *
 * It renders only on the document's first render at "/". The site layout stays
 * mounted across client-side navigations, so returning to the home page later
 * never brings it back.
 */
export function IntroCurtain(): React.JSX.Element | null {
  const pathname = usePathname();
  const [firstPath] = useState(pathname);
  const [phase, setPhase] = useState<Phase>(firstPath === '/' ? 'holding' : 'gone');

  // Already played in this tab, or motion is unwanted: CSS never drew it; drop it.
  useEffect(() => {
    if (phase !== 'holding') {
      return;
    }
    const skipped =
      document.documentElement.classList.contains('k-curtain-skip') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skipped) {
      setPhase('gone');
      return;
    }
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Storage refused (private mode, blocked site data): it simply plays again next time.
    }
  }, [phase]);

  // The page holds still until the curtain starts to lift.
  useEffect(() => {
    if (phase !== 'holding') {
      return;
    }
    const block = (event: Event): void => event.preventDefault();
    const keys = (event: KeyboardEvent): void => {
      if (SCROLL_KEYS.has(event.key)) {
        event.preventDefault();
      }
    };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', keys);
    const release = window.setTimeout(() => setPhase('gone'), RELEASE_MS);
    return () => {
      window.clearTimeout(release);
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', keys);
    };
  }, [phase]);

  // Out of the document a moment after it has lifted.
  useEffect(() => {
    if (phase !== 'lifting') {
      return;
    }
    const timer = window.setTimeout(() => setPhase('gone'), LINGER_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // And straight away if the visitor moves on before that.
  useEffect(() => {
    if (pathname !== firstPath) {
      setPhase('gone');
    }
  }, [pathname, firstPath]);

  if (phase === 'gone') {
    return null;
  }

  return (
    <div
      className="k-curtain"
      aria-hidden="true"
      onAnimationStart={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'k-curtain-lift') {
          setPhase('lifting');
        }
      }}
    >
      <div className="k-curtain-mark">
        <Image
          src={logo}
          alt=""
          priority
          sizes="(min-width: 1024px) 300px, 200px"
          className="h-auto w-[clamp(11rem,22vw,18.75rem)] bg-transparent"
        />
        <span className="k-curtain-bar" />
      </div>
    </div>
  );
}
