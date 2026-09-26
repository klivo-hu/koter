import { ConsentProvider } from '@/components/consent/consent-provider';
import { CookieBanner } from '@/components/consent/cookie-banner';
import { MotionRoot } from '@/components/motion/motion-root';
import { PageTransition } from '@/components/motion/page-transition';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { ImageWarmup } from '@/components/site/image-warmup';
import { IntroCurtain } from '@/components/site/intro-curtain';
import { COOKIE_POLICY_SLUG } from '@/lib/consent';
import { readConsent } from '@/lib/consent-server';
import { INTRO_SKIP_SCRIPT } from '@/lib/intro-curtain';
import { cspNonce } from '@/lib/nonce';
import { getLegalPage } from '@/lib/repositories';

/**
 * The public site's chrome. The admin does not use it.
 *
 * The visitor's cookie choice is read from the request here, once, so the
 * banner and every map render in their final state on the server; the cookie
 * policy is linked only while that page is published.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }): Promise<React.JSX.Element> {
  const [consent, nonce] = await Promise.all([readConsent(), cspNonce()]);
  const policyHref = getLegalPage(COOKIE_POLICY_SLUG) === null ? null : `/jogi/${COOKIE_POLICY_SLUG}`;

  return (
    <ConsentProvider initial={consent} policyHref={policyHref}>
      {/* Must run before the curtain below is parsed; see lib/intro-curtain.ts. */}
      <script
        nonce={nonce}
        // The browser clears the nonce attribute once parsed, so the client sees "".
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }}
      />
      <IntroCurtain />
      <a href="#fotartalom" className="k-skip">
        Ugrás a tartalomra
      </a>
      <MotionRoot />
      <PageTransition />
      <ImageWarmup />
      <Header />
      <main id="fotartalom">{children}</main>
      <Footer />
      <CookieBanner />
    </ConsentProvider>
  );
}
