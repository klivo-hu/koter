'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/site';

/**
 * Gets every picture loaded before the visitor reaches it, in three stages.
 *
 * 1. Lookahead — on every page, from the moment it hydrates. Native lazy loading
 *    starts a download only once a picture is near the viewport, and how near is
 *    the browser's call: Chrome looks 1250–2500px ahead, Firefox and Safari far
 *    less. A quick scroll outruns that, and a picture still in flight when its
 *    reveal plays — or one the image optimiser has to encode on its first
 *    request — arrives late. So each lazy picture, and the map frame, switches
 *    to eager once it is within a screen and a half below the viewport (or one
 *    above, scrolling back up), the same distance in every browser. It is
 *    watched through the box around its reveal wrapper, which is never clipped
 *    or moved by the reveal itself, so the animation cannot affect when it fires.
 *
 * 2. The rest of this page — once it has loaded and the browser is idle, every
 *    remaining lazy picture goes eager. They were lazy only so the first screen
 *    would not compete with them for bandwidth.
 *
 * 3. The other pages — once per visit, their HTML is fetched, the <img> tags are
 *    read out of it (a parsed document is inert: nothing in it loads or runs) and
 *    each picture is requested with that page's own srcset and sizes. The browser
 *    therefore picks exactly the file the page will ask for later, and moving
 *    between pages shows pictures straight from the cache.
 *
 * Stages 2 and 3 run a few pictures at a time, at low priority, and not at all
 * when the visitor has asked to save data or is on a very slow connection.
 */

const PAGES = ['/', ...NAV.map((item) => item.href)];
const CONCURRENCY = 4;
/** One screen above, a screen and a half below. */
const LOOKAHEAD = '100% 0px 150% 0px';
const LAZY = 'img[loading="lazy"], iframe[loading="lazy"]';

interface NetworkInformation {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

type LazyMedia = HTMLImageElement | HTMLIFrameElement;

function constrained(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return connection?.saveData === true || /2g$/.test(connection?.effectiveType ?? '');
}

/** Stage 1. Returns the teardown. */
function lookahead(): () => void {
  const watched = new Map<Element, LazyMedia[]>();
  for (const media of document.querySelectorAll<LazyMedia>(LAZY)) {
    // The reveal wrapper may be clipped; the box around it never is.
    const box = media.closest('[data-reveal]')?.parentElement ?? media;
    watched.set(box, [...(watched.get(box) ?? []), media]);
  }
  if (watched.size === 0) {
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        for (const media of watched.get(entry.target) ?? []) {
          media.loading = 'eager';
        }
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: LOOKAHEAD },
  );
  for (const box of watched.keys()) {
    observer.observe(box);
  }
  return () => observer.disconnect();
}

/** Stage 2. */
function loadCurrentPage(): void {
  for (const media of document.querySelectorAll<LazyMedia>(LAZY)) {
    media.loading = 'eager';
  }
}

function preload(source: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'low';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    // sizes before srcset, src last: the same order the parser applies them in.
    image.sizes = source.getAttribute('sizes') ?? '';
    image.srcset = source.getAttribute('srcset') ?? '';
    image.src = source.getAttribute('src') ?? '';
  });
}

/** Stage 3. */
async function warmOtherPages(current: string, signal: AbortSignal): Promise<void> {
  const seen = new Set<string>();

  for (const page of PAGES) {
    if (page === current) {
      continue;
    }

    let html: string;
    try {
      const response = await fetch(page, { signal, credentials: 'same-origin' });
      if (!response.ok) {
        continue;
      }
      html = await response.text();
    } catch {
      return; // aborted, or offline — either way there is nothing more to do
    }

    const images = Array.from(
      new DOMParser().parseFromString(html, 'text/html').querySelectorAll('img'),
    ).filter((image) => {
      const key = image.getAttribute('srcset') ?? image.getAttribute('src') ?? '';
      if (key === '' || key.startsWith('data:') || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    for (let start = 0; start < images.length; start += CONCURRENCY) {
      if (signal.aborted) {
        return;
      }
      await Promise.all(images.slice(start, start + CONCURRENCY).map(preload));
    }
  }
}

/** Runs `task` once the page has loaded and the browser is idle. Returns the cancel. */
function whenIdle(task: () => void): () => void {
  // Safari has no requestIdleCallback; a short timeout after load stands in for it.
  const hasIdle = typeof window.requestIdleCallback === 'function';
  let handle = 0;
  const schedule = (): void => {
    handle = hasIdle ? window.requestIdleCallback(task, { timeout: 4000 }) : window.setTimeout(task, 1500);
  };
  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
  return () => {
    window.removeEventListener('load', schedule);
    if (hasIdle) {
      window.cancelIdleCallback(handle);
    } else {
      window.clearTimeout(handle);
    }
  };
}

let warmedOtherPages = false;

export function ImageWarmup(): null {
  const pathname = usePathname();

  // Stages 1 and 2, for every page the visitor lands on.
  useEffect(() => {
    const stopLookahead = lookahead();
    const cancelIdle = constrained() ? () => undefined : whenIdle(loadCurrentPage);
    return () => {
      stopLookahead();
      cancelIdle();
    };
  }, [pathname]);

  // Stage 3, once per visit: the site layout stays mounted across navigations.
  useEffect(() => {
    if (warmedOtherPages || constrained()) {
      return;
    }
    const controller = new AbortController();
    const cancelIdle = whenIdle(() => {
      warmedOtherPages = true;
      void warmOtherPages(window.location.pathname, controller.signal);
    });
    return () => {
      controller.abort();
      cancelIdle();
    };
  }, []);

  return null;
}
