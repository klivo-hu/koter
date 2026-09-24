import { MotionRoot } from '@/components/motion/motion-root';
import { PageTransition } from '@/components/motion/page-transition';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { ImageWarmup } from '@/components/site/image-warmup';

/** The public site's chrome. The admin does not use it. */
export default function SiteLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <a href="#fotartalom" className="k-skip">
        Ugrás a tartalomra
      </a>
      <MotionRoot />
      <PageTransition />
      <ImageWarmup />
      <Header />
      <main id="fotartalom">{children}</main>
      <Footer />
    </>
  );
}
