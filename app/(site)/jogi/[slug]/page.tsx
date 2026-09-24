import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { RichText } from '@/components/ui/rich-text';
import { getLegalPage, listLegalPages } from '@/lib/repositories';
import { absoluteUrl } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

interface Params {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (page === null) {
    return { title: 'Nem található' };
  }
  return {
    title: page.title,
    description: `${page.title} — Kóter Gym & Crossfight Aréna.`,
    alternates: { canonical: `/jogi/${page.slug}` },
    openGraph: { url: absoluteUrl(`/jogi/${page.slug}`), title: page.title },
    // Legal boilerplate has no business competing in search results.
    robots: { index: false, follow: true },
  };
}

export default async function LegalPageView({ params }: Params): Promise<React.JSX.Element> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (page === null) {
    notFound();
  }

  const others = listLegalPages().filter((item) => item.slug !== page.slug);
  const updated = new Date(page.updated_at.replace(' ', 'T'));
  const updatedLabel = Number.isNaN(updated.getTime())
    ? ''
    : new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(updated);

  return (
    <>
      <PageHeader lines={[page.title]} />

      <section className="k-section-tight">
        <div className="k-container grid gap-14 lg:grid-cols-12 lg:gap-16">
          <article className="lg:col-span-8">
            <div className="border-t border-[var(--k-line)] pt-12" data-reveal="up">
              <RichText content={page.content} />
            </div>
            {updatedLabel !== '' && (
              <p className="mt-14 border-t border-[var(--k-line)] pt-6 text-xs uppercase tracking-[0.16em] text-[var(--k-muted)]">
                Utoljára frissítve: {updatedLabel}
              </p>
            )}
          </article>

          {others.length > 0 && (
            <nav aria-label="További jogi oldalak" className="lg:col-span-3 lg:col-start-10">
              <h2 className="k-index mb-6 border-t border-[var(--k-line)] pt-12">További dokumentumok</h2>
              <ul className="flex flex-col gap-3">
                {others.map((item) => (
                  <li key={item.slug}>
                    <a
                      href={`/jogi/${item.slug}`}
                      className="text-sm text-[var(--k-muted)] underline-offset-4 transition-colors hover:text-[var(--k-bone)] hover:underline"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
