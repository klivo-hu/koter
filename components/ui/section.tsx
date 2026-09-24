import { useId } from 'react';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/cn';

/** A titled content region. Wraps content in a labelled `section` for correct document structure. */
export function Section({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={title ? headingId : undefined} className={cn('py-16', className)}>
      <Container>
        {title ? (
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight">
            {title}
          </h2>
        ) : null}
        <div className={title ? 'mt-8' : undefined}>{children}</div>
      </Container>
    </section>
  );
}
