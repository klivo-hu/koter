import { SocialLinks, socialLinksFrom } from '@/components/site/social-links';
import { SectionHeading } from '@/components/ui/section-heading';
import type { SiteSettings } from '@/lib/types';

/**
 * Follow the gym — one section, used unchanged on the home page and on Rólunk.
 *
 * The heading and one line on the left, the networks as large link blocks on the
 * right. The links come from settings (see socialLinksFrom), and the whole
 * section is left out while none is set.
 */
export function SocialSection({ settings }: { settings: SiteSettings }): React.JSX.Element | null {
  const links = socialLinksFrom(settings);
  if (links.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="kovess-minket" className="k-section-tight">
      <div className="k-container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading id="kovess-minket" lines={['Kövess', 'minket.']} size="lg" />
          <p className="k-body-muted mt-6">Edzésvideók, versenybeszámolók és minden, ami a teremben történik.</p>
        </div>

        <div className="border border-[var(--k-line)] lg:col-span-7" data-reveal="up">
          <SocialLinks links={links} variant="stacked" />
        </div>
      </div>
    </section>
  );
}
