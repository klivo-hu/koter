import { DbImage, PortraitPlaceholder } from '@/components/ui/media';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/site';
import type { TrainerView } from '@/lib/types';

/**
 * A personal trainer.
 *
 * Portrait, name, one paragraph, and the two ways to reach them. Portraits are
 * uploaded from the admin — until one exists the card shows a composed monogram
 * plate in the same 4:5 frame, so a half-filled roster still looks deliberate and
 * nothing ever shifts when the real photograph arrives.
 */
export function TrainerCard({ trainer, className }: { trainer: TrainerView; className?: string }): React.JSX.Element {
  return (
    <article className={cn('group flex flex-col', className)}>
      <div className="relative overflow-hidden">
        {trainer.media === null ? (
          <PortraitPlaceholder name={trainer.name} />
        ) : (
          <DbImage
            media={trainer.media}
            alt={`${trainer.name}${trainer.role === '' ? '' : `, ${trainer.role}`}`}
            ratio="4 / 5"
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
            imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] w-0 bg-[var(--k-red)] transition-[width] duration-700 ease-out group-hover:w-full"
        />
      </div>

      <div className="flex flex-1 flex-col pt-7">
        <h3 className="k-display-md text-[var(--k-bone)]">{trainer.name}</h3>
        {trainer.role !== '' && (
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-[var(--k-red)]">{trainer.role}</p>
        )}
        {trainer.bio !== '' && (
          <p className="mt-5 flex-1 text-sm leading-relaxed text-[var(--k-muted)]">{trainer.bio}</p>
        )}

        {(trainer.phone !== '' || trainer.email !== '') && (
          <div className="mt-7 flex flex-col gap-2 border-t border-[var(--k-line)] pt-5">
            {trainer.phone !== '' && (
              <a
                href={telHref(trainer.phone)}
                className="w-fit text-sm text-[var(--k-bone)] underline-offset-4 transition-colors hover:text-[var(--k-red-hot)] hover:underline"
              >
                {trainer.phone}
              </a>
            )}
            {trainer.email !== '' && (
              <a
                href={`mailto:${trainer.email}`}
                className="w-fit break-all text-sm text-[var(--k-muted)] underline-offset-4 transition-colors hover:text-[var(--k-bone)] hover:underline"
              >
                {trainer.email}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
