import { PriceCard } from '@/components/cards/price-card';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { PricingItem } from '@/lib/types';

/** The ticket types on the home page. Renders nothing when none are published. */
export function PricingPreview({ items }: { items: readonly PricingItem[] }): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="k-section">
      <div className="k-container">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading lines={['Bérletek', 'és jegyek.']} size="xl" />
          <div data-reveal="up">
            <ButtonLink href="/arak" variant="outline" size="md">
              Minden ár
            </ButtonLink>
          </div>
        </div>

        <div
          className="mt-14 grid gap-px border border-[var(--k-line)] bg-[var(--k-line)] sm:grid-cols-2 lg:mt-20 lg:grid-cols-3"
          data-reveal="group"
        >
          {items.slice(0, 3).map((item, index) => (
            <PriceCard key={item.id} item={item} index={index} className="border-0" />
          ))}
        </div>
      </div>
    </section>
  );
}
