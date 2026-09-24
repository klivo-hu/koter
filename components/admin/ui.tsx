'use client';

import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/cn';
import type { ActionState } from '@/lib/actions/content';

/**
 * The admin's form kit.
 *
 * The back office shares the public site's ink, bone and red, but drops the
 * editorial typography for something plainer and denser — this is a tool, and it
 * should read like one. Every control is a real form element, so the screens
 * work with the keyboard and degrade to plain HTML if the JavaScript fails.
 */

export function Field({
  label,
  name,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--k-muted)]">
        {label}
      </label>
      {children}
      {hint !== undefined && <p className="text-xs text-[var(--k-muted)]">{hint}</p>}
    </div>
  );
}

const control =
  'w-full border border-[var(--k-line)] bg-[var(--k-ink)] px-4 py-3 text-sm text-[var(--k-bone)] ' +
  'placeholder:text-[var(--k-muted)] transition-colors focus:border-[var(--k-red)] focus:outline-none ' +
  'focus-visible:outline-none';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return <input {...props} id={props.id ?? props.name} className={cn(control, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>): React.JSX.Element {
  return (
    <textarea
      {...props}
      id={props.id ?? props.name}
      className={cn(control, 'min-h-32 resize-y leading-relaxed', props.className)}
    />
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}): React.JSX.Element {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--k-bone)]">
      <input
        type="checkbox"
        name={name}
        id={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 flex-none accent-[var(--k-red)]"
      />
      {label}
    </label>
  );
}

/** Submit button that reports the form's pending state. */
export function Submit({
  children = 'Mentés',
  variant = 'solid',
}: {
  children?: React.ReactNode;
  variant?: 'solid' | 'quiet' | 'danger';
}): React.JSX.Element {
  const { pending } = useFormStatus();
  const styles = {
    solid: 'bg-[var(--k-red)] text-[var(--k-bone)] hover:bg-[var(--k-red-hot)]',
    quiet: 'border border-[var(--k-line-strong)] text-[var(--k-bone)] hover:bg-[var(--k-ink-card)]',
    danger: 'border border-[var(--k-line-strong)] text-[var(--k-muted)] hover:border-[var(--cef-danger)] hover:text-[var(--cef-danger)]',
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        'inline-flex h-11 items-center justify-center px-6 text-xs font-semibold uppercase tracking-[0.14em] transition-colors disabled:opacity-50',
        styles,
      )}
    >
      {pending ? 'Folyamatban…' : children}
    </button>
  );
}

/** Success or failure feedback for a form, announced to assistive technology. */
export function FormMessage({ state }: { state: ActionState }): React.JSX.Element | null {
  if (state.error === undefined && state.message === undefined) {
    return null;
  }
  const failed = state.error !== undefined;
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'border-l-2 px-4 py-3 text-sm',
        failed
          ? 'border-[var(--cef-danger)] bg-[rgba(255,90,95,0.08)] text-[var(--cef-danger)]'
          : 'border-[var(--cef-success)] bg-[rgba(74,222,128,0.07)] text-[var(--cef-success)]',
      )}
    >
      {failed ? state.error : state.message}
    </p>
  );
}

/** A framed block that groups one record's fields. */
export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <section className={cn('border border-[var(--k-line)] bg-[var(--k-ink-raised)] p-6 lg:p-8', className)}>
      {title !== undefined && (
        <header className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--k-bone)]">{title}</h2>
          {description !== undefined && <p className="mt-1 text-sm text-[var(--k-muted)]">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
