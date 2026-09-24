'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { DUR, EASE, EASE_IN } from '@/lib/motion';

/**
 * A short curtain between routes.
 *
 * Deliberately brief (≈0.5s end to end) and non-blocking: the panel wipes over
 * and straight back off, so navigation never feels like waiting. It is skipped
 * entirely on first load and whenever reduced motion is requested.
 */
export function PageTransition(): React.JSX.Element {
  const panel = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    const element = panel.current;
    if (element === null) {
      return;
    }
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timeline = gsap.timeline();
    timeline
      .set(element, { transformOrigin: 'bottom', scaleY: 0, opacity: 1 })
      .to(element, { scaleY: 1, duration: DUR.fast, ease: EASE_IN })
      .set(element, { transformOrigin: 'top' })
      .to(element, { scaleY: 0, duration: DUR.base, ease: EASE })
      .set(element, { opacity: 0 });

    return () => {
      timeline.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] opacity-0"
      style={{ backgroundColor: 'var(--k-red)', transform: 'scaleY(0)' }}
    />
  );
}
