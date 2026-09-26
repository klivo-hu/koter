import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';
import type { MediaRecord } from '@/lib/types';

/**
 * Every photograph on the site goes through one of these two components.
 *
 * Both reserve their box before the bytes arrive (a fixed aspect-ratio frame with
 * the page's own dark surface behind it) and both hand next/image a blur
 * placeholder, so an image fades in from its own colours. There is no spinner, no
 * "loading…" text, no white flash and no layout shift at any point.
 *
 * `priority` marks the first-screen images: preloaded, fetched first, eager.
 * Everything else starts lazy, so it never competes with the first screen for
 * bandwidth — and once the page is idle, ImageWarmup switches it all to eager,
 * so every picture is loaded long before a scroll reveal brings it into view.
 */

interface FrameProps {
  ratio?: string;
  className?: string;
  children: React.ReactNode;
}

function Frame({ ratio, className, children }: FrameProps): React.JSX.Element {
  return (
    <div className={cn('k-media', className)} style={ratio === undefined ? undefined : { aspectRatio: ratio }}>
      {children}
    </div>
  );
}

/**
 * A photograph bundled with the site. The static import gives next/image the real
 * dimensions and a generated blur placeholder at build time.
 */
export function StaticImage({
  src,
  alt,
  sizes,
  ratio,
  fill = false,
  className,
  imageClassName,
  priority = false,
  quality = 82,
}: {
  src: StaticImageData;
  alt: string;
  sizes: string;
  ratio?: string;
  /** Take the full size of the parent box (e.g. a grid cell) instead of a fixed ratio. */
  fill?: boolean;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  quality?: number;
}): React.JSX.Element {
  return (
    <Frame ratio={ratio} className={cn(fill && 'h-full', className)}>
      <Image
        src={src}
        alt={alt}
        sizes={sizes}
        quality={quality}
        placeholder="blur"
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className={cn('h-full w-full object-cover', imageClassName)}
        {...(ratio === undefined && !fill ? {} : { fill: true })}
      />
    </Frame>
  );
}

/**
 * A photograph the admin uploaded (or one of the bundled gallery pictures the
 * database was seeded with). Dimensions and the blur placeholder come from the
 * media row, which was measured once at ingest time.
 */
export function DbImage({
  media,
  alt,
  sizes,
  ratio,
  className,
  imageClassName,
  fill = false,
  priority = false,
  quality = 80,
}: {
  media: MediaRecord;
  alt: string;
  sizes: string;
  ratio?: string;
  /** Take the full size of the parent box (e.g. a grid cell) instead of a fixed ratio. */
  fill?: boolean;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  quality?: number;
}): React.JSX.Element {
  const blur = media.blur === '' ? {} : { placeholder: 'blur' as const, blurDataURL: media.blur };

  if (ratio === undefined && !fill) {
    return (
      <Frame className={className}>
        <Image
          src={media.url}
          alt={alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          quality={quality}
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          className={cn('h-auto w-full', imageClassName)}
          {...blur}
        />
      </Frame>
    );
  }

  return (
    <Frame ratio={ratio} className={cn(fill && 'h-full', className)}>
      <Image
        src={media.url}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        className={cn('object-cover', imageClassName)}
        {...blur}
      />
    </Frame>
  );
}

/**
 * Shown where a trainer has no portrait yet. A composed monogram plate rather
 * than a broken image icon, so an empty roster still looks deliberate.
 */
export function PortraitPlaceholder({
  name,
  ratio = '4 / 5',
  className,
}: {
  name: string;
  ratio?: string;
  className?: string;
}): React.JSX.Element {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <div
      className={cn(
        'k-media flex items-center justify-center border border-[var(--k-line)] bg-[var(--k-ink-card)]',
        className,
      )}
      style={{ aspectRatio: ratio }}
      aria-hidden="true"
    >
      <span
        className="select-none text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-none tracking-tighter text-[var(--k-line-strong)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {initials === '' ? 'KG' : initials}
      </span>
    </div>
  );
}
