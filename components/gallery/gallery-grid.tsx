import { DbImage } from '@/components/ui/media';
import { cn } from '@/lib/cn';
import type { GalleryView } from '@/lib/types';

/**
 * The gallery: a tight, edge-to-edge masonry of landscape and portrait tiles.
 *
 * Every column holds one landscape (≈3:2) and one portrait (≈2:3) tile per
 * cycle, in alternating order, so neighbouring columns interlock and all of
 * them come out level at the end of each cycle. Mechanically: the grid's rows
 * are a sixth of a column wide (container query units), a landscape tile spans
 * 4 rows and a portrait one 9, and `grid-auto-flow: dense` drops each picture
 * into the first gap it fits. Which positions in the cycle are portrait depends
 * on the column count, so the cycle is listed per breakpoint below — and the
 * same table sizes each srcset request for the crop the picture actually gets.
 *
 * The admin controls only the order; any number of pictures works. With
 * `flush`, only whole cycles are shown, so a preview never ends ragged.
 */

interface Layout {
  /** Columns at this breakpoint — the grid classes below use the same counts. */
  readonly columns: number;
  /** Rendered width of one column, in vw, for the sizes attribute. */
  readonly vw: number;
  /** Media condition for the sizes attribute (Tailwind's md / lg / xl), or '' for the base. */
  readonly media: string;
  /** 1-based positions within one cycle (two tiles per column) that are portrait. */
  readonly tall: readonly number[];
  /** Tailwind classes for this breakpoint, written out in full so the compiler sees them. */
  readonly classes: {
    readonly wide: string;
    readonly tall: string;
    readonly show: string;
    readonly hide: string;
  };
}

const LAYOUTS: readonly Layout[] = [
  {
    columns: 5,
    vw: 20,
    media: '(min-width: 1280px)',
    tall: [2, 4, 6, 7, 8],
    classes: {
      wide: 'xl:row-[span_4]',
      tall: 'xl:row-[span_9]',
      show: 'xl:block',
      hide: 'xl:hidden',
    },
  },
  {
    columns: 4,
    vw: 25,
    media: '(min-width: 1024px)',
    tall: [2, 4, 5, 6],
    classes: {
      wide: 'lg:row-[span_4]',
      tall: 'lg:row-[span_9]',
      show: 'lg:block',
      hide: 'lg:hidden',
    },
  },
  {
    columns: 3,
    vw: 34,
    media: '(min-width: 768px)',
    tall: [2, 4, 5],
    classes: {
      wide: 'md:row-[span_4]',
      tall: 'md:row-[span_9]',
      show: 'md:block',
      hide: 'md:hidden',
    },
  },
  {
    columns: 2,
    vw: 50,
    media: '',
    tall: [2, 3],
    classes: { wide: 'row-[span_4]', tall: 'row-[span_9]', show: 'block', hide: 'hidden' },
  },
];

/** Tile shapes as width ÷ height. */
const WIDE = 3 / 2;
const TALL = 2 / 3;

function isTall(layout: Layout, index: number): boolean {
  return layout.tall.includes((index % (layout.columns * 2)) + 1);
}

/**
 * A cover crop needs more source pixels than the tile is wide whenever the
 * picture is wider than the tile's shape — a landscape photo in a portrait
 * tile most of all — so each breakpoint's width is scaled by that factor.
 */
function sizesFor(index: number, aspect: number): string {
  return LAYOUTS.map((layout) => {
    const shape = isTall(layout, index) ? TALL : WIDE;
    const width = `${Math.ceil(layout.vw * Math.max(1, aspect / shape))}vw`;
    return layout.media === '' ? width : `${layout.media} ${width}`;
  }).join(', ');
}

function tileClasses(index: number, count: number, flush: boolean): string {
  return LAYOUTS.map((layout) => {
    const cycle = layout.columns * 2;
    // Whole cycles only; with fewer pictures than one cycle, show them all.
    const shown = count < cycle ? count : Math.floor(count / cycle) * cycle;
    return cn(
      isTall(layout, index) ? layout.classes.tall : layout.classes.wide,
      flush && (index < shown ? layout.classes.show : layout.classes.hide),
    );
  }).join(' ');
}

export function GalleryGrid({
  items,
  className,
  priorityCount = 2,
  flush = false,
}: {
  items: readonly GalleryView[];
  className?: string;
  priorityCount?: number;
  flush?: boolean;
}): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('px-[clamp(0.25rem,1.25vw,1.5rem)] [container-type:inline-size]', className)}
    >
      <ul
        className={cn(
          'grid grid-flow-row-dense gap-1',
          'grid-cols-2 [--cols:2] md:grid-cols-3 md:[--cols:3] lg:grid-cols-4 lg:[--cols:4] xl:grid-cols-5 xl:[--cols:5]',
          // One row is a sixth of a column's width.
          'auto-rows-[calc((100cqi_-_(var(--cols)_-_1)_*_0.25rem)_/_var(--cols)_/_6)]',
        )}
      >
        {items.map((item, index) => {
          const label = item.alt === '' ? item.title : item.alt;

          return (
            <li
              key={item.id}
              className={cn('group relative', tileClasses(index, items.length, flush))}
            >
              <figure className="h-full" data-reveal="mask">
                <DbImage
                  media={item.media}
                  alt={label}
                  fill
                  sizes={sizesFor(index, item.media.width / item.media.height)}
                  priority={index < priorityCount}
                  imageClassName="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
                />

                {item.title !== '' && (
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(6_6_7/0.85)] to-transparent px-4 pb-3 pt-12 text-sm text-[var(--k-bone)] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {item.title}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
