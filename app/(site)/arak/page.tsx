import type { Metadata } from 'next';
import { PriceCard } from '@/components/cards/price-card';
import { PageHeader } from '@/components/ui/page-header';
import { listPricing } from '@/lib/repositories';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/lib/seo/site-url';
import { breadcrumbJsonLd, pricingJsonLd } from '@/lib/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Árak',
  description:
    'A Kóter Gym & Crossfight Aréna bérletei és jegyei: diák- és felnőtt havi bérlet, valamint napi jegy. Hatvan belvárosában.',
  alternates: { canonical: '/arak' },
  openGraph: { url: absoluteUrl('/arak'), title: 'Árak' },
};

export default function PricingPage(): React.JSX.Element {
  const items = listPricing();

  return (
    <>
      <JsonLd data={[pricingJsonLd(items), breadcrumbJsonLd('Árak', '/arak')]} />

      <PageHeader
        lines={['Bérletek', 'és jegyek.']}
        lead="Egy bérlet, az egész terem. Nincs külön díj a küzdőtérért vagy a kardió részlegért."
      />

      <section className="k-section-tight k-surface-turf">
        <div className="k-container">
          {items.length === 0 ? (
            <p className="k-body-muted border-t border-[var(--k-line)] pt-10">
              Az árak frissítés alatt. Gyere be a terembe, és megmondjuk pontosan.
            </p>
          ) : (
            <div
              className="grid gap-px border border-[var(--k-line)] bg-[var(--k-line)] sm:grid-cols-2 lg:grid-cols-3"
              data-reveal="group"
            >
              {items.map((item, index) => (
                <PriceCard key={item.id} item={item} index={index} className="border-0" />
              ))}
            </div>
          )}

          <div className="mt-16 grid gap-10 border-t border-[var(--k-line)] pt-12 md:grid-cols-2" data-reveal="group">
            <p className="k-body-muted text-sm">
              A diákbérlet 18 év alattiaknak érvényes, diákigazolvány felmutatásával. A bérletek a megváltás napjától
              számítva egy hónapig érvényesek, és másra nem ruházhatók át.
            </p>
            <p className="k-body-muted text-sm">
              A napi jegy egyszeri belépésre jogosít a teljes teremre. Bérletváltás és fizetés a helyszínen, a
              recepción.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
