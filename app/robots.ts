import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site-url';

// Rendered per request, not at build time: the sitemap URL comes from SITE_URL,
// which is set on the running container rather than baked into the image.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
