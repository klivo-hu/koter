import { cn } from '@/lib/cn';

/**
 * Facebook and Instagram, drawn as inline SVG rather than pulled from an icon
 * package — two marks do not justify a dependency, and inline paths cost nothing
 * to load. Both open in a new tab with rel="noopener noreferrer".
 */

const MARKS = {
  facebook: (
    <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V3.1A19 19 0 0 0 14.8 3C12.5 3 11 4.4 11 7v1.5H8.6V11H11v8h3v-8h2.3l.4-2.5H14Z" />
  ),
  instagram: (
    <>
      <path d="M12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8Zm0 7.25a2.85 2.85 0 1 1 0-5.7 2.85 2.85 0 0 1 0 5.7Z" />
      <circle cx="16.6" cy="7.4" r="1.03" />
      <path d="M16.9 3H7.1A4.1 4.1 0 0 0 3 7.1v9.8A4.1 4.1 0 0 0 7.1 21h9.8a4.1 4.1 0 0 0 4.1-4.1V7.1A4.1 4.1 0 0 0 16.9 3Zm2.5 13.9a2.5 2.5 0 0 1-2.5 2.5H7.1a2.5 2.5 0 0 1-2.5-2.5V7.1a2.5 2.5 0 0 1 2.5-2.5h9.8a2.5 2.5 0 0 1 2.5 2.5v9.8Z" />
    </>
  ),
} as const;

export interface SocialLink {
  readonly network: keyof typeof MARKS;
  readonly label: string;
  readonly href: string;
}

/** Builds the list from settings, dropping any network that has no URL set. */
export function socialLinksFrom(settings: Readonly<Record<string, string>>): SocialLink[] {
  const links: SocialLink[] = [];
  const facebook = settings['social_facebook'];
  const instagram = settings['social_instagram'];
  if (facebook !== undefined && facebook !== '') {
    links.push({ network: 'facebook', label: 'Facebook', href: facebook });
  }
  if (instagram !== undefined && instagram !== '') {
    links.push({ network: 'instagram', label: 'Instagram', href: instagram });
  }
  return links;
}

export function SocialLinks({
  links,
  variant = 'inline',
  className,
}: {
  links: readonly SocialLink[];
  variant?: 'inline' | 'stacked';
  className?: string;
}): React.JSX.Element | null {
  if (links.length === 0) {
    return null;
  }

  if (variant === 'stacked') {
    return (
      <ul className={cn('grid gap-px bg-[var(--k-line)] sm:grid-cols-2', className)}>
        {links.map((link) => (
          <li key={link.network}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-6 bg-[var(--k-ink)] px-6 py-8 transition-colors duration-300 hover:bg-[var(--k-ink-card)] sm:px-8 sm:py-10"
            >
              <span className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current text-[var(--k-bone)]">
                  {MARKS[link.network]}
                </svg>
                <span className="k-display-md text-[var(--k-bone)] transition-colors group-hover:text-[var(--k-red-hot)]">
                  {link.label}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 flex-none stroke-current text-[var(--k-muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--k-bone)]"
                fill="none"
                strokeWidth="1.5"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
              <span className="sr-only">(új lapon nyílik meg)</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn('flex items-center gap-3', className)}>
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (új lapon nyílik meg)`}
            className="flex h-11 w-11 items-center justify-center border border-[var(--k-line)] text-[var(--k-muted)] transition-colors duration-300 hover:border-[var(--k-bone)] hover:text-[var(--k-bone)]"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
              {MARKS[link.network]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
