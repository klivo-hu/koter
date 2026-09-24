import { cn } from '@/lib/cn';

/**
 * A section's headline, revealed line by line.
 *
 * Copy arrives as an array of lines so the break points are authored, not left
 * to the browser — the hierarchy reads the same at every width. There is no
 * label or tag above the heading anywhere on the site; the type carries it.
 *
 * Headings further down reveal on scroll (GSAP). A first-screen heading passes
 * `intro` instead: the same line-by-line rise, done in CSS from the first
 * paint, so it never waits for the script.
 */
export function SectionHeading({
  lines,
  as: Tag = 'h2',
  size = 'lg',
  className,
  id,
  intro = false,
}: {
  lines: readonly string[];
  as?: 'h1' | 'h2' | 'h3';
  size?: 'hero' | 'xl' | 'lg' | 'md';
  className?: string;
  id?: string;
  intro?: boolean;
}): React.JSX.Element {
  const scale = {
    hero: 'k-display-hero',
    xl: 'k-display-xl',
    lg: 'k-display-lg',
    md: 'k-display-md',
  }[size];

  return (
    <Tag
      id={id}
      className={cn(scale, intro && 'k-intro', className)}
      {...(intro ? {} : { 'data-reveal': 'lines' })}
    >
      {lines.map((line, index) => (
        <span className="k-line" key={line}>
          <span
            className="k-line-inner"
            style={intro ? ({ '--k-line-index': index } as React.CSSProperties) : undefined}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
