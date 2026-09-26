import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { absoluteUrl, siteUrl } from '@/lib/seo/site-url';
import { LOCALE, SITE_NAME } from '@/lib/site';

/**
 * The root layout carries only the document shell and the typefaces.
 *
 * The public site's chrome lives in app/(site)/layout.tsx and the back office's
 * in app/admin/layout.tsx, so the two surfaces share a document but nothing else.
 *
 * Two families, no more. Archivo carries every headline — a wide grotesk that
 * holds up at 7.5rem — and Inter does the reading. Both are self-hosted by
 * next/font with a metric-matched fallback, so swapping in the real face causes
 * no reflow and the layout never shifts.
 *
 * Each family is one file cut to the characters the site sets, Hungarian ő and
 * ű included (scripts/build-fonts.ts): two preloads of ~170 KB in all, where
 * Google's latin + latin-ext split was four of ~300 KB. Both stay variable —
 * Archivo's width axis is what makes the headlines poster-wide.
 */
const archivo = localFont({
  src: '../assets/fonts/archivo.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-display',
  preload: true,
  adjustFontFallback: 'Arial',
});

const inter = localFont({
  src: '../assets/fonts/inter.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-body',
  preload: true,
  adjustFontFallback: 'Arial',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Hatvan`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Edzőterem, küzdőtér és sportegyesület Hatvan belvárosában, 2015 óta. Szabad súlyok, erőgépek, crossfight és csoportos foglalkozások. Gyere, tartozz közénk.',
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: LOCALE,
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Hatvan`,
    description:
      'Edzőterem, küzdőtér és sportegyesület Hatvan belvárosában, 2015 óta. Gyere, tartozz közénk.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Hatvan`,
    description: 'Edzőterem, küzdőtér és sportegyesület Hatvan belvárosában, 2015 óta.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#060607',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    // suppressHydrationWarning: the intro curtain's pre-paint script may add a
    // class to <html> before React hydrates (see lib/intro-curtain.ts).
    <html lang="hu" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
