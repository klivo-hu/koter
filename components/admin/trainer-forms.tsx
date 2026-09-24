'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Checkbox, Field, FormMessage, Input, Panel, Submit, Textarea } from '@/components/admin/ui';
import { archiveTrainerAction, saveTrainerAction, type ActionState } from '@/lib/actions/content';
import type { TrainerView } from '@/lib/types';

/**
 * A trainer's editor, including the portrait upload.
 *
 * Portraits are never generated — the field is here precisely so the gym can
 * supply its own. Until one is uploaded the public card shows a monogram plate,
 * so an empty field is a valid state rather than a broken image.
 */
export function TrainerForm({ trainer }: { trainer?: TrainerView }): React.JSX.Element {
  const [state, action] = useActionState<ActionState, FormData>(saveTrainerAction, {});
  const editing = trainer !== undefined;
  const key = trainer?.id ?? 'new';

  return (
    <Panel
      title={editing ? trainer.name : 'Új edző'}
      description={editing ? undefined : 'A profilkép később is feltölthető.'}
    >
      <form action={action} className="flex flex-col gap-5">
        {editing && <input type="hidden" name="id" value={trainer.id} />}
        <FormMessage state={state} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Név" name={`name-${key}`}>
            <Input name="name" id={`name-${key}`} required maxLength={80} defaultValue={trainer?.name ?? ''} />
          </Field>

          <Field label="Szakterület" name={`role-${key}`} hint="Pl. Erőemelés, Thai box">
            <Input name="role" id={`role-${key}`} maxLength={80} defaultValue={trainer?.role ?? ''} />
          </Field>

          <Field label="Telefonszám" name={`phone-${key}`}>
            <Input name="phone" id={`phone-${key}`} type="tel" maxLength={40} defaultValue={trainer?.phone ?? ''} />
          </Field>

          <Field label="E-mail cím" name={`email-${key}`}>
            <Input name="email" id={`email-${key}`} type="email" maxLength={120} defaultValue={trainer?.email ?? ''} />
          </Field>
        </div>

        <Field label="Bemutatkozás" name={`bio-${key}`}>
          <Textarea name="bio" id={`bio-${key}`} maxLength={1200} defaultValue={trainer?.bio ?? ''} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          {trainer?.media != null && (
            <div className="w-32">
              <Image
                src={trainer.media.url}
                alt={`${trainer.name} jelenlegi profilképe`}
                width={trainer.media.width}
                height={trainer.media.height}
                sizes="128px"
                className="h-40 w-32 border border-[var(--k-line)] object-cover"
              />
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-[var(--k-muted)]">
                <input type="checkbox" name="remove_image" className="h-4 w-4 accent-[var(--k-red)]" />
                Kép törlése
              </label>
            </div>
          )}

          <Field
            label={trainer?.media == null ? 'Profilkép' : 'Profilkép cseréje'}
            name={`image-${key}`}
            hint="JPEG, PNG, WebP vagy AVIF. Legalább 200×200 képpont, legfeljebb 8 MB. A feltöltött kép automatikusan WebP formátumra alakul."
          >
            <Input
              name="image"
              id={`image-${key}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="file:mr-4 file:border-0 file:bg-[var(--k-ink-card)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-[var(--k-bone)]"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Sorrend" name={`sort-${key}`} hint="Kisebb szám előrébb kerül.">
            <Input name="sort_order" id={`sort-${key}`} type="number" min={0} defaultValue={trainer?.sort_order ?? 0} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--k-line)] pt-5">
          <Checkbox label="Megjelenik az oldalon" name="active" defaultChecked={(trainer?.active ?? 1) === 1} />
          <Submit>{editing ? 'Mentés' : 'Létrehozás'}</Submit>
        </div>
      </form>

      {editing && (
        <form action={archiveTrainerAction} className="mt-5 border-t border-[var(--k-line)] pt-5">
          <input type="hidden" name="id" value={trainer.id} />
          <ConfirmButton message={`Biztosan archiválod őt: „${trainer.name}”?`}>Archiválás</ConfirmButton>
        </form>
      )}
    </Panel>
  );
}
