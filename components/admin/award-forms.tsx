'use client';

import { useActionState } from 'react';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Checkbox, Field, FormMessage, Input, Panel, Submit, Textarea } from '@/components/admin/ui';
import { archiveAwardAction, saveAwardAction, type ActionState } from '@/lib/actions/content';
import type { Award } from '@/lib/types';

/**
 * A recognition.
 *
 * The source URL field exists so every entry can point at where it is published.
 * Nothing here is generated: an award only appears on the site because someone
 * entered it with a source.
 */
export function AwardForm({ award }: { award?: Award }): React.JSX.Element {
  const [state, action] = useActionState<ActionState, FormData>(saveAwardAction, {});
  const editing = award !== undefined;
  const key = award?.id ?? 'new';

  return (
    <Panel title={editing ? `${award.year} — ${award.title}` : 'Új elismerés'}>
      <form action={action} className="flex flex-col gap-5">
        {editing && <input type="hidden" name="id" value={award.id} />}
        <FormMessage state={state} />

        <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
          <Field label="Megnevezés" name={`title-${key}`}>
            <Input name="title" id={`title-${key}`} required maxLength={160} defaultValue={award?.title ?? ''} />
          </Field>

          <Field label="Év" name={`year-${key}`}>
            <Input name="year" id={`year-${key}`} maxLength={16} defaultValue={award?.year ?? ''} className="sm:w-28" />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Kiadó / forrás neve" name={`issuer-${key}`}>
            <Input name="issuer" id={`issuer-${key}`} maxLength={120} defaultValue={award?.issuer ?? ''} />
          </Field>

          <Field label="Sorrend" name={`sort-${key}`} hint="Kisebb szám előrébb kerül.">
            <Input name="sort_order" id={`sort-${key}`} type="number" min={0} defaultValue={award?.sort_order ?? 0} />
          </Field>
        </div>

        <Field label="Forrás URL" name={`source-${key}`} hint="A kiadó nevére kattintva ide vezet a link.">
          <Input
            name="source_url"
            id={`source-${key}`}
            type="url"
            maxLength={500}
            defaultValue={award?.source_url ?? ''}
            placeholder="https://"
          />
        </Field>

        <Field label="Leírás" name={`desc-${key}`}>
          <Textarea name="description" id={`desc-${key}`} maxLength={600} defaultValue={award?.description ?? ''} />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--k-line)] pt-5">
          <Checkbox label="Megjelenik az oldalon" name="active" defaultChecked={(award?.active ?? 1) === 1} />
          <Submit>{editing ? 'Mentés' : 'Létrehozás'}</Submit>
        </div>
      </form>

      {editing && (
        <form action={archiveAwardAction} className="mt-5 border-t border-[var(--k-line)] pt-5">
          <input type="hidden" name="id" value={award.id} />
          <ConfirmButton message="Biztosan archiválod ezt az elismerést?">Archiválás</ConfirmButton>
        </form>
      )}
    </Panel>
  );
}
