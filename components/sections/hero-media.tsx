'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The hero's moving background.
 *
 * The still image underneath is the real LCP element — it is a statically
 * imported, priority-loaded next/image, so the largest paint never waits on
 * video. Only once the page is up does this decide whether to fetch the clip at
 * all: never on a small screen, never on a metered or slow connection, and never
 * when the visitor asked for reduced motion. When it does load, it fades in over
 * the still, so there is no cut and nothing moves.
 *
 * There is no poster: the clip stays transparent until it can play, and the
 * optimised still underneath is what shows until then — a poster would be a
 * second copy of that frame, downloaded and never seen.
 *
 * Swapping the footage is a one-line change: point NEXT_PUBLIC_HERO_VIDEO at a
 * new file. With the variable unset the hero is simply the still photograph.
 */
export function HeroVideo({ src }: { src: string }): React.JSX.Element | null {
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (src === '') {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // Phones get the photograph: the clip is neither worth the bytes nor the battery.
    if (!window.matchMedia('(min-width: 768px)').matches) {
      return;
    }
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData === true) {
      return;
    }
    if (connection?.effectiveType !== undefined && /2g/.test(connection.effectiveType)) {
      return;
    }
    setEnabled(true);
  }, [src]);

  useEffect(() => {
    const element = video.current;
    if (!enabled || element === null) {
      return;
    }
    const onReady = (): void => setReady(true);
    element.addEventListener('canplay', onReady, { once: true });
    // Autoplay can still be refused; the still image stays in that case.
    void element.play().catch(() => undefined);
    return () => element.removeEventListener('canplay', onReady);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <video
      ref={video}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      // Only ever rendered once the checks above passed, so buffer eagerly: on
      // the first load this runs under the intro curtain, which is its head start.
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
