import { TrainerCard } from '@/components/cards/trainer-card';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { TrainerView } from '@/lib/types';

/** Up to three trainers on the home page. Hidden entirely while the roster is empty. */
export function TrainersPreview({ trainers }: { trainers: readonly TrainerView[] }): React.JSX.Element | null {
  if (trainers.length === 0) {
    return null;
  }

  return (
    <section className="k-section k-surface-metal">
      <div className="k-container">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading lines={['Akik', 'visznek.']} size="xl" />
          <div data-reveal="up">
            <ButtonLink href="/edzok" variant="outline" size="md">
              Minden edző
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3" data-reveal="group">
          {trainers.slice(0, 3).map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      </div>
    </section>
  );
}
