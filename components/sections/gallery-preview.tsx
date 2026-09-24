import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { GalleryView } from '@/lib/types';

/**
 * A cut of the gallery on the home page: the same edge-to-edge masonry, trimmed
 * to whole cycles at every breakpoint so the band always ends level.
 */
export function GalleryPreview({ items }: { items: readonly GalleryView[] }): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="k-section">
      <div className="k-container">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading lines={['A terem', 'belülről.']} size="xl" />
          <div data-reveal="up">
            <ButtonLink href="/galeria" variant="outline" size="md">
              Teljes galéria
            </ButtonLink>
          </div>
        </div>
      </div>

      <GalleryGrid items={items} className="mt-14 lg:mt-20" priorityCount={0} flush />
    </section>
  );
}
