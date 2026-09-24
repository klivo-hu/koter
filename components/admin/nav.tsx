'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { logoutAction } from '@/lib/actions/auth';

const ITEMS = [
  { href: '/admin', label: 'Áttekintés' },
  { href: '/admin/arak', label: 'Árak' },
  { href: '/admin/edzok', label: 'Edzők' },
  { href: '/admin/galeria', label: 'Galéria' },
  { href: '/admin/tartalmak', label: 'Rólunk / tartalmak' },
  { href: '/admin/dijak', label: 'Díjak, elismerések' },
  { href: '/admin/jogi', label: 'Jogi oldalak' },
  { href: '/admin/beallitasok', label: 'Elérhetőség, közösségi' },
] as const;

/**
 * The admin sidebar. A plain scrollable column on desktop; on smaller screens it
 * collapses to a horizontal strip above the content rather than a hidden drawer,
 * because a back office is used with both hands and a visible map beats a menu.
 */
export function AdminNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigáció"
      className="border-b border-[var(--k-line)] bg-[var(--k-ink-raised)] lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r"
    >
      <div className="flex items-center justify-between gap-4 px-6 py-5 lg:block lg:px-6 lg:py-8">
        <Link href="/" className="block text-sm font-semibold uppercase tracking-[0.16em] text-[var(--k-bone)]">
          Kóter Gym
          <span className="mt-1 block text-[0.6875rem] font-normal normal-case tracking-[0.14em] text-[var(--k-muted)]">
            Adminisztráció
          </span>
        </Link>
        <form action={logoutAction} className="lg:hidden">
          <button
            type="submit"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--k-muted)] transition-colors hover:text-[var(--k-bone)]"
          >
            Kilépés
          </button>
        </form>
      </div>

      <ul className="flex gap-1 overflow-x-auto px-4 pb-3 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-6">
        {ITEMS.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-none lg:flex-auto">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap border-l-2 px-4 py-2.5 text-sm transition-colors lg:whitespace-normal',
                  active
                    ? 'border-[var(--k-red)] bg-[var(--k-ink-card)] text-[var(--k-bone)]'
                    : 'border-transparent text-[var(--k-muted)] hover:bg-[var(--k-ink-card)] hover:text-[var(--k-bone)]',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden border-t border-[var(--k-line)] px-6 py-6 lg:block">
        <Link
          href="/"
          className="block text-xs uppercase tracking-[0.14em] text-[var(--k-muted)] transition-colors hover:text-[var(--k-bone)]"
        >
          Publikus oldal
        </Link>
        <form action={logoutAction} className="mt-4">
          <button
            type="submit"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--k-muted)] transition-colors hover:text-[var(--k-red-hot)]"
          >
            Kilépés
          </button>
        </form>
      </div>
    </nav>
  );
}
