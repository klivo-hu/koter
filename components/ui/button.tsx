import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * The site's one action style: a square-cornered, letter-spaced block.
 *
 * `solid` is bone on red — 4.6:1, which clears AA for normal text, so the label
 * stays legible at every size. The hover state slides a fill across rather than
 * changing colour, which keeps contrast constant throughout the transition.
 */
export const buttonVariants = cva(
  [
    'group relative inline-flex items-center justify-center overflow-hidden',
    'font-semibold uppercase tracking-[0.14em]',
    'transition-colors duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-45',
  ].join(' '),
  {
    variants: {
      variant: {
        solid: 'bg-[var(--k-red)] text-[var(--k-bone)] hover:bg-[var(--k-red-hot)]',
        bone: 'bg-[var(--k-bone)] text-[var(--k-ink)] hover:bg-white',
        outline:
          'border border-[var(--k-line-strong)] text-[var(--k-bone)] hover:border-[var(--k-bone)] hover:bg-[var(--k-bone)] hover:text-[var(--k-ink)]',
        ghost: 'text-[var(--k-bone)] hover:text-[var(--k-red-hot)]',
      },
      size: {
        sm: 'h-10 px-5 text-[0.6875rem]',
        md: 'h-12 px-7 text-xs',
        lg: 'h-14 px-9 text-[0.8125rem] sm:h-16 sm:px-12 sm:text-sm',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & Variants): React.JSX.Element {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  external = false,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Variants &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>): React.JSX.Element {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
