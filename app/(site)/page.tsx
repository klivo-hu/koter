import type { Metadata } from 'next';
import { BrandIntro } from '@/components/sections/brand-intro';
import { Experience } from '@/components/sections/experience';
import { GalleryPreview } from '@/components/sections/gallery-preview';
import { Hero } from '@/components/sections/hero';
import { LocationSection } from '@/components/sections/location-section';
import { PricingPreview } from '@/components/sections/pricing-preview';
import { SocialSection } from '@/components/sections/social-section';
import { TrainersPreview } from '@/components/sections/trainers-preview';
import { listGallery, listPricing, listTrainers, getSettings } from '@/lib/repositories';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_NAME } from '@/lib/site';
import { absoluteUrl } from '@/lib/seo/site-url';
import { organisationJsonLd } from '@/lib/seo/jsonld';

// Prices, trainers and gallery pictures are all editable from the admin, so the
// page is rendered per request. Each read is a local SQLite query measured in
// microseconds — there is no network round trip to wait on.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // Absolute: the home page is the one title the layout's "%s — name" template
  // must not wrap, or the site name appears twice.
  title: { absolute: `${SITE_NAME} — Hatvan` },
  description:
    'Edzőterem, küzdőtér és sportegyesület Hatvan belvárosában, 2015 óta. Szabad súlyok, erőgépek, crossfight, boksz és csoportos foglalkozások.',
  alternates: { canonical: '/' },
  openGraph: { url: absoluteUrl('/'), title: `${SITE_NAME} — Hatvan` },
};

export default function HomePage(): React.JSX.Element {
  const settings = getSettings();
  const pricing = listPricing();
  const trainers = listTrainers();
  // One full masonry cycle at the widest layout (five columns × two tiles).
  const gallery = listGallery(10);

  return (
    <>
      {/* Structured data is generated from the same settings the page renders. */}
      <JsonLd data={organisationJsonLd(settings)} />
      <Hero videoSrc={process.env.NEXT_PUBLIC_HERO_VIDEO ?? ''} />
      <BrandIntro />
      <Experience />
      <PricingPreview items={pricing} />
      <TrainersPreview trainers={trainers} />
      <GalleryPreview items={gallery} />
      <LocationSection settings={settings} />
      <SocialSection settings={settings} />
    </>
  );
}
