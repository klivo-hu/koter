import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';

/**
 * The opening block of every inner page.
 *
 * Deliberately tall and mostly empty: the headline sits alone with the top
 * navigation clear above it, which is what separates an inner page from the
 * hero without needing a second banner image on each one. It is always on the
 * first screen, so it enters with CSS from the first paint rather than on scroll.
 */
export function PageHeader({
  lines,
  lead,
  className,
}: {
  lines: readonly string[];
  lead?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <header className={cn('k-container pb-4 pt-[calc(var(--k-header-h)+clamp(4rem,11vw,9rem))]', className)}>
      <SectionHeading as="h1" lines={lines} size="xl" className="max-w-[14ch]" intro />
      {lead !== undefined && (
        <p
          className="k-lead k-intro-rise mt-8 lg:mt-10"
          style={{ '--k-intro-delay': '0.25s' } as React.CSSProperties}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
