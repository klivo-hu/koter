import { cn } from '@/lib/cn';

/**
 * The location.
 *
 * The Google embed sits inside the page's own frame — a hairline border rather
 * than the rounded card Google hands out — in the map's own colours, so streets,
 * parks and the pin read the way visitors know them from their phones. It is
 * lazy-loaded and given a title, because an untitled iframe is an unlabelled
 * landmark for anyone navigating by keyboard or screen reader.
 */
export function MapSection({
  embedUrl,
  address,
  aspectRatio = '16 / 10',
  className,
}: {
  embedUrl: string;
  address: string;
  /** CSS aspect-ratio of the frame: a wide column on Rólunk, a square on the home page. */
  aspectRatio?: string;
  className?: string;
}): React.JSX.Element | null {
  if (embedUrl === '') {
    return null;
  }

  return (
    <div className={cn('border border-[var(--k-line)] bg-[var(--k-ink-raised)]', className)}>
      <div
        className="relative w-full"
        style={{ aspectRatio, minHeight: '320px' }}
      >
        <iframe
          src={embedUrl}
          title={`Térkép — ${address === '' ? 'Kóter Gym & Crossfight Aréna' : address}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
