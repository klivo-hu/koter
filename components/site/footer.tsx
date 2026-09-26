import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/koter-logo.png';
import { ConsentSettingsButton } from '@/components/consent/consent-settings-button';
import { SocialLinks, socialLinksFrom } from '@/components/site/social-links';
import { listLegalPages, getSettings } from '@/lib/repositories';
import { NAV, SITE_NAME, telHref } from '@/lib/site';

const legalLinkClass =
  'text-sm text-[var(--k-muted)] underline-offset-4 transition-colors hover:text-[var(--k-bone)] hover:underline';

/**
 * The footer. Quiet by design: the mark, the three columns, one hairline.
 *
 * The legal pages sit side by side on one row (wrapping on narrow screens) and
 * come from the database — adding one in the admin makes it appear here with no
 * code change. The cookie settings close the row: withdrawing consent must stay
 * one click away on every page.
 */
export function Footer(): React.JSX.Element {
  const settings = getSettings();
  const legal = listLegalPages();
  const socials = socialLinksFrom(settings);

  const address = settings['contact_address'] ?? '';
  const phone = settings['contact_phone'] ?? '';
  const email = settings['contact_email'] ?? '';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--k-ink)]">
      <div className="k-container py-16 lg:py-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80" aria-label={`${SITE_NAME} — főoldal`}>
              <Image src={logo} alt="" sizes="150px" className="h-12 w-auto" style={{ width: 'auto' }} />
            </Link>
            <p className="k-body-muted mt-6 max-w-sm text-sm">
              Edzőterem, küzdőtér és sportegyesület Hatvanban, 2015 óta.
            </p>
            <SocialLinks links={socials} className="mt-8" />
          </div>

          <nav aria-label="Oldaltérkép" className="lg:col-span-3">
            <h2 className="k-index mb-6">Oldalak</h2>
            <ul className="flex flex-col gap-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--k-muted)] transition-colors hover:text-[var(--k-bone)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h2 className="k-index mb-6">Elérhetőség</h2>
            <address className="flex flex-col gap-3 not-italic">
              {address !== '' && <span className="text-[var(--k-muted)]">{address}</span>}
              {phone !== '' && (
                <a href={telHref(phone)} className="text-[var(--k-muted)] transition-colors hover:text-[var(--k-bone)]">
                  {phone}
                </a>
              )}
              {email !== '' && (
                <a
                  href={`mailto:${email}`}
                  className="text-[var(--k-muted)] transition-colors hover:text-[var(--k-bone)]"
                >
                  {email}
                </a>
              )}
            </address>
          </div>
        </div>

        <hr className="k-rule my-12 lg:my-16" />

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <nav aria-label="Jogi információk">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {legal.map((page) => (
                <li key={page.slug}>
                  <Link href={`/jogi/${page.slug}`} className={legalLinkClass}>
                    {page.title}
                  </Link>
                </li>
              ))}
              <li>
                <ConsentSettingsButton className={legalLinkClass} />
              </li>
            </ul>
          </nav>

          <p className="text-sm text-[var(--k-muted)]">
            © {year} {SITE_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
