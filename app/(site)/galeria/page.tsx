import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { PageHeader } from '@/components/ui/page-header';
import { listGallery } from '@/lib/repositories';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/lib/seo/site-url';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galéria',
  description:
    'Képek a Kóter Gym & Crossfight Aréna termeiről, edzéseiről és csapatáról. Erőterem, küzdőtér és csoportos foglalkozások Hatvanban.',
  alternates: { canonical: '/galeria' },
  openGraph: { url: absoluteUrl('/galeria'), title: 'Galéria' },
};

export default function GalleryPage(): React.JSX.Element {
  const items = listGallery();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Galéria', '/galeria')} />

      <PageHeader
        lines={['A terem', 'belülről.']}
        lead="Erőterem, küzdőtér, nagyterem — és a csapat, amelyik használja."
      />

      {/* The pictures run edge to edge, so the grid sits outside the page container. */}
      <section className="k-section-tight">
        {items.length === 0 ? (
          <div className="k-container">
            <p className="k-body-muted">A galéria feltöltés alatt.</p>
          </div>
        ) : (
          <GalleryGrid items={items} />
        )}
      </section>
    </>
  );
}
