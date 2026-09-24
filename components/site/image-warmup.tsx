'use client';

import { useEffect } from 'react';
import { NAV } from '@/lib/site';

/**
 * Loads the pictures the visitor has not scrolled to yet, and those of the
 * other pages, once the first screen is done.
 *
 * Once the current page has finished loading and the browser is idle, this
 * first switches the page's own lazy images to eager — they were lazy only so
 * the first screen would not compete with them — and then fetches the other
 * public pages' HTML, reads the <img> tags out of it (a parsed
 * document is inert: nothing in it loads or runs) and requests each picture
 * with that page's own srcset and sizes. The browser therefore picks exactly the
 * file the page will ask for later, and moving between pages shows pictures
 * straight from the cache instead of loading them in.
 *
 * It runs once per visit — the site layout stays mounted across navigations —
 * a few pictures at a time, at low priority, and not at all when the visitor
 * has asked to save data or is on a very slow connection.
 */

const PAGES = ['/', ...NAV.map((item) => item.href)];
const CONCURRENCY = 4;

interface NetworkInformation {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
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

/** The current page first: pictures still waiting on lazy loading start now. */
function loadCurrentPage(): void {
  for (const image of document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
    image.loading = 'eager';
  }
}

async function warm(current: string, signal: AbortSignal): Promise<void> {
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

export function ImageWarmup(): null {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData === true || /2g$/.test(connection?.effectiveType ?? '')) {
      return;
    }

    const controller = new AbortController();
    // Safari has no requestIdleCallback; a short timeout after load stands in for it.
    const hasIdle = typeof window.requestIdleCallback === 'function';
    let idle = 0;

    const start = (): void => {
      const run = (): void => {
        loadCurrentPage();
        void warm(window.location.pathname, controller.signal);
      };
      idle = hasIdle
        ? window.requestIdleCallback(run, { timeout: 4000 })
        : window.setTimeout(run, 1500);
    };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }

    return () => {
      controller.abort();
      window.removeEventListener('load', start);
      if (hasIdle) {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }
    };
  }, []);

  return null;
}
