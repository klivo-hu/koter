import type { Metadata } from 'next';
import { TrainerCard } from '@/components/cards/trainer-card';
import { PageHeader } from '@/components/ui/page-header';
import { listTrainers } from '@/lib/repositories';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/lib/seo/site-url';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edzők',
  description:
    'A Kóter Gym & Crossfight Aréna személyi edzői: elérhetőség, szakterület és bemutatkozás. Hatvan.',
  alternates: { canonical: '/edzok' },
  openGraph: { url: absoluteUrl('/edzok'), title: 'Edzők' },
};

export default function TrainersPage(): React.JSX.Element {
  const trainers = listTrainers();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Edzők', '/edzok')} />

      <PageHeader
        lines={['Akik', 'visznek.']}
        lead="Személyi edzés, felkészítés, technikajavítás. Keresd őket közvetlenül — megbeszélitek, mire van szükséged."
      />

      <section className="k-section-tight k-surface-metal">
        <div className="k-container">
          {trainers.length === 0 ? (
            <p className="k-body-muted border-t border-[var(--k-line)] pt-10">
              Az edzők bemutatkozása hamarosan felkerül. Addig is kérdezz a recepción — megmondjuk, ki mivel foglalkozik.
            </p>
          ) : (
            <div
              className="grid gap-x-8 gap-y-16 border-t border-[var(--k-line)] pt-14 sm:grid-cols-2 lg:grid-cols-3"
              data-reveal="group"
            >
              {trainers.map((trainer) => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
