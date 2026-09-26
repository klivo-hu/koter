'use client';

import { useActionState } from 'react';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Checkbox, Field, FormMessage, Input, Panel, Submit, Textarea } from '@/components/admin/ui';
import { deleteLegalAction, saveLegalAction, type ActionState } from '@/lib/actions/content';
import type { LegalPage } from '@/lib/types';

/**
 * A legal document.
 *
 * The body is plain text with a small amount of Markdown — `## heading`,
 * `- list item`, `> note`, `[text](https://…)` — rendered into React elements
 * rather than injected as HTML, so nothing typed here can become markup on the
 * public page.
 */
export function LegalForm({ page }: { page?: LegalPage }): React.JSX.Element {
  const [state, action] = useActionState<ActionState, FormData>(saveLegalAction, {});
  const editing = page !== undefined;
  const key = page?.id ?? 'new';

  return (
    <Panel
      title={editing ? page.title : 'Új jogi oldal'}
      description={editing ? `Elérhető: /jogi/${page.slug}` : undefined}
    >
      <form action={action} className="flex flex-col gap-5">
        {editing && <input type="hidden" name="id" value={page.id} />}
        <FormMessage state={state} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cím" name={`title-${key}`}>
            <Input name="title" id={`title-${key}`} required maxLength={160} defaultValue={page?.title ?? ''} />
          </Field>

          <Field label="Webcím (slug)" name={`slug-${key}`} hint="Csak kisbetű, szám és kötőjel.">
            <Input
              name="slug"
              id={`slug-${key}`}
              required
              maxLength={80}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={page?.slug ?? ''}
              placeholder="adatkezelesi-tajekoztato"
            />
          </Field>
        </div>

        <Field
          label="Tartalom"
          name={`content-${key}`}
          hint="Formázás: ## alcím, - felsorolás, > kiemelt megjegyzés, [szöveg](https://… vagy /jogi/…) hivatkozás. Üres sor választja el a bekezdéseket."
        >
          <Textarea
            name="content"
            id={`content-${key}`}
            defaultValue={page?.content ?? ''}
            className="min-h-96 font-mono text-xs leading-relaxed"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Sorrend" name={`sort-${key}`} hint="A láblécben ebben a sorrendben jelennek meg.">
            <Input name="sort_order" id={`sort-${key}`} type="number" min={0} defaultValue={page?.sort_order ?? 0} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--k-line)] pt-5">
          <Checkbox label="Publikálva" name="active" defaultChecked={(page?.active ?? 1) === 1} />
          <Submit>{editing ? 'Mentés' : 'Létrehozás'}</Submit>
        </div>
      </form>

      {editing && (
        <form action={deleteLegalAction} className="mt-5 border-t border-[var(--k-line)] pt-5">
          <input type="hidden" name="id" value={page.id} />
          <ConfirmButton message={`Biztosan véglegesen törlöd ezt: „${page.title}”? Ez nem vonható vissza.`}>
            Végleges törlés
          </ConfirmButton>
        </form>
      )}
    </Panel>
  );
}
