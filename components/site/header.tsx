'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import logo from '@/assets/koter-logo.png';
import { cn } from '@/lib/cn';
import { DUR, EASE, EASE_IN } from '@/lib/motion';
import { NAV, SITE_NAME } from '@/lib/site';

/**
 * The site header.
 *
 * Transparent over the hero, and once the page scrolls past it, a solid dark bar
 * that shades softly into the page beneath — a shadow, not a hairline, so it
 * never cuts across the sections' flow. That is the only thing it reacts to — no
 * hide-on-scroll, no shrinking, no animated logo.
 *
 * On small screens the navigation becomes a full-screen panel: focus is trapped
 * inside it while open, Escape closes it, and the page behind it cannot scroll.
 */
export function Header(): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Solid state after the first viewport-ish of scrolling.
  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any navigation closes the panel.
  useEffect(() => setOpen(false), [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    toggle.current?.focus();
  }, []);

  // Open/close animation, plus scroll lock and focus handling.
  //
  // The panel's visible state is owned by CSS (see .k-mobile-panel), never by the
  // animation: GSAP only plays the transition and then clears its own inline
  // styles. If a tween is interrupted — a backgrounded tab throttles rAF mid-
  // flight — the menu still ends up fully open and usable rather than frozen
  // half-drawn with invisible links.
  useEffect(() => {
    const element = panel.current;
    if (element === null) {
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const links = gsap.utils.toArray<HTMLElement>('a, button', element);
    const settle = (): void => {
      gsap.set(element, { clearProps: 'opacity,visibility,clipPath' });
      gsap.set(links, { clearProps: 'opacity,visibility,transform,translate,rotate,scale' });
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      element.removeAttribute('inert');

      if (reduced) {
        settle();
      } else {
        const timeline = gsap.timeline({ onComplete: settle, onInterrupt: settle });
        timeline
          .from(element, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: DUR.base,
            ease: EASE,
          })
          .from(
            links,
            { y: 34, autoAlpha: 0, duration: DUR.base, ease: EASE, stagger: 0.055 },
            '-=0.34',
          );
      }

      // Move focus into the panel so the keyboard follows the eye.
      window.setTimeout(() => links[0]?.focus(), reduced ? 0 : 220);

      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          close();
          return;
        }
        if (event.key !== 'Tab' || links.length === 0) {
          return;
        }
        const first = links[0];
        const last = links[links.length - 1];
        if (first === undefined || last === undefined) {
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }

    document.body.style.overflow = '';
    element.setAttribute('inert', '');
    if (reduced) {
      settle();
    } else {
      gsap.to(element, { opacity: 0, duration: DUR.fast, ease: EASE_IN, onComplete: settle, onInterrupt: settle });
    }
    return;
  }, [open, close]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[80] transition-[background-color,box-shadow] duration-300 ease-out',
          scrolled || open
            ? 'bg-[rgba(6,6,7,0.92)] shadow-[0_18px_36px_-24px_rgb(0_0_0/0.9)] backdrop-blur-md'
            : 'bg-transparent',
        )}
        style={{ height: 'var(--k-header-h)' }}
      >
        <div className="k-container flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            className="relative z-10 flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label={`${SITE_NAME} — főoldal`}
          >
            <Image
              src={logo}
              alt=""
              priority
              sizes="(min-width: 1024px) 128px, 104px"
              className="h-9 w-auto lg:h-11"
              style={{ width: 'auto' }}
            />
            <span className="sr-only">{SITE_NAME}</span>
          </Link>

          <nav aria-label="Fő navigáció" className="hidden items-center gap-9 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative py-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] transition-colors',
                    active ? 'text-[var(--k-bone)]' : 'text-[var(--k-muted)] hover:text-[var(--k-bone)]',
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px bg-[var(--k-red)] transition-[width] duration-300 ease-out',
                      active ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobil-menu"
            className="relative z-10 -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          >
            <span className="sr-only">{open ? 'Menü bezárása' : 'Menü megnyitása'}</span>
            <span aria-hidden="true" className="relative block h-3.5 w-7">
              <span
                className={cn(
                  'absolute left-0 block h-px w-full bg-[var(--k-bone)] transition-transform duration-300 ease-out',
                  open ? 'top-1.5 rotate-45' : 'top-0',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 block h-px bg-[var(--k-bone)] transition-all duration-300 ease-out',
                  open ? 'top-1.5 w-full -rotate-45' : 'top-3 w-2/3',
                )}
              />
            </span>
          </button>
        </div>
      </header>

      <div
        ref={panel}
        id="mobil-menu"
        inert
        data-open={open ? 'true' : 'false'}
        className="k-mobile-panel fixed inset-0 z-[70] flex flex-col justify-between bg-[var(--k-ink)] md:hidden"
        style={{ paddingTop: 'var(--k-header-h)' }}
      >
        <nav aria-label="Mobil navigáció" className="k-container flex flex-1 flex-col justify-center gap-1 pb-10">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className="k-display-md border-b border-[var(--k-line)] py-5 text-[var(--k-bone)] transition-colors hover:text-[var(--k-red-hot)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="k-container pb-12">
          <Link
            href="/rolunk"
            className="inline-flex h-14 w-full items-center justify-center bg-[var(--k-red)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--k-bone)]"
          >
            Rólunk
          </Link>
        </div>
      </div>
    </>
  );
}
