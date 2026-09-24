import { cn } from '@/lib/cn';

/** The page's horizontal frame. `tight` narrows it for long-form reading. */
export function Container({
  children,
  className,
  tight = false,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  tight?: boolean;
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'article';
}): React.JSX.Element {
  return <Tag className={cn(tight ? 'k-container-tight' : 'k-container', className)}>{children}</Tag>;
}
