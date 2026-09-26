import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/site';
import type { PricingItem } from '@/lib/types';

/**
 * A ticket type.
 *
 * The price is the card — set at display scale, with the name above it and one
 * sentence below. No feature checklist, no "most popular" flag, no badge: the
 * three products differ by price and audience, and the type says so on its own.
 * The red rule under the price is the only ornament, and it grows on hover.
 */
export function PriceCard({
  item,
  index,
  className,
}: {
  item: PricingItem;
  index: number;
  className?: string;
}): React.JSX.Element {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col justify-between gap-12 border border-[var(--k-line)] bg-[var(--k-ink)] p-8 transition-colors duration-500 ease-out hover:bg-[var(--k-ink-card)] sm:p-10 lg:p-12',
        className,
      )}
    >
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[length:var(--k-title)] font-semibold leading-tight text-[var(--k-bone)]">{item.name}</h3>
          <span
            aria-hidden="true"
            className="font-mono text-xs tabular-nums text-[var(--k-muted)] transition-colors duration-500 group-hover:text-[var(--k-red)]"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <p className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="k-display-lg normal-case text-[var(--k-bone)]">{formatPrice(item.price, item.currency)}</span>
          {item.period !== '' && (
            <span className="text-sm text-[var(--k-muted)]">{item.period}</span>
          )}
        </p>

        <span
          aria-hidden="true"
          className="mt-8 block h-[2px] w-16 bg-[var(--k-red)] transition-all duration-500 ease-out group-hover:w-full"
        />
      </div>

      {item.description !== '' && (
        <p className="text-sm leading-relaxed text-[var(--k-muted)]">{item.description}</p>
      )}
    </article>
  );
}
