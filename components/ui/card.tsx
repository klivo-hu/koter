import { cn } from '@/lib/cn';

/** A surface card. Consistent slots (title, body) across every grid. */
export function Card({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface p-6', className)}>
      {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
      {children ? <div className={title ? 'mt-2 text-foreground/80' : 'text-foreground/80'}>{children}</div> : null}
    </div>
  );
}
