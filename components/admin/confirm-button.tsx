'use client';

import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/cn';

/**
 * A destructive submit that asks first.
 *
 * The confirmation is a plain `confirm()` rather than a modal: it cannot be
 * missed, it cannot be styled away, and if scripting is off the form still
 * submits — which is the safe direction for an action the admin explicitly
 * clicked. Archiving is reversible in the database, so this is a guard against
 * a slip, not a lock.
 */
export function ConfirmButton({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      className={cn(
        'inline-flex h-11 items-center justify-center border border-[var(--k-line-strong)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--k-muted)] transition-colors hover:border-[var(--cef-danger)] hover:text-[var(--cef-danger)] disabled:opacity-50',
        className,
      )}
    >
      {pending ? 'Folyamatban…' : children}
    </button>
  );
}
