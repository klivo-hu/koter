import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

export default function NotFound(): React.JSX.Element {
  return (
    <section className="flex min-h-[70svh] items-center">
      <div className="k-container pt-[var(--k-header-h)]">
        <p className="k-display-hero leading-none text-[var(--k-line-strong)]" aria-hidden="true">
          404
        </p>
        <SectionHeading as="h1" lines={['Ez az oldal', 'nincs meg.']} size="lg" className="mt-6" />
        <p className="k-body-muted mt-8">
          Lehet, hogy elírtad a címet, vagy az oldal már nem létezik.
        </p>
        <div className="mt-10">
          <ButtonLink href="/" variant="solid" size="lg">
            Vissza a főoldalra
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
