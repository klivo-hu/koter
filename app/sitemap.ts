import type { MetadataRoute } from 'next';
import { listLegalPages } from '@/lib/repositories';
import { absoluteUrl } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

/**
 * The five public pages, plus whichever legal documents exist in the database.
 * The admin area is excluded — it is disallowed in robots.txt and requires a
 * session anyway.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/arak'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/edzok'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/galeria'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/rolunk'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  for (const page of listLegalPages()) {
    pages.push({
      url: absoluteUrl(`/jogi/${page.slug}`),
      lastModified: new Date(page.updated_at.replace(' ', 'T')),
      changeFrequency: 'yearly',
      priority: 0.2,
    });
  }

  return pages;
}
