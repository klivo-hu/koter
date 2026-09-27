'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Checkbox, Field, FormMessage, ImageInput, Input, Panel, Submit, megabytes } from '@/components/admin/ui';
import { archiveGalleryAction, saveGalleryAction, type ActionState } from '@/lib/actions/content';
import type { GalleryView } from '@/lib/types';

/** Adds or edits one gallery photograph. */
export function GalleryForm({
  item,
  maxUploadBytes,
}: {
  item?: GalleryView;
  /** MAX_UPLOAD_BYTES, handed down from the server page. */
  maxUploadBytes: number;
}): React.JSX.Element {
  const [state, action] = useActionState<ActionState, FormData>(saveGalleryAction, {});
  const editing = item !== undefined;
  const key = item?.id ?? 'new';

  return (
    <Panel title={editing ? (item.title === '' ? `#${item.id}` : item.title) : 'Új kép'}>
      <form action={action} className="flex flex-col gap-5">
        {editing && <input type="hidden" name="id" value={item.id} />}
        <FormMessage state={state} />

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          {editing && (
            <Image
              src={item.media.url}
              alt={item.alt === '' ? item.title : item.alt}
              width={item.media.width}
              height={item.media.height}
              sizes="160px"
              className="h-28 w-40 border border-[var(--k-line)] object-cover"
            />
          )}

          <Field
            label={editing ? 'Kép cseréje' : 'Kép'}
            name={`image-${key}`}
            hint={`JPEG, PNG, WebP vagy AVIF, legfeljebb ${megabytes(maxUploadBytes)}. Automatikusan WebP formátumra alakul és legfeljebb 2400 képpontra méreteződik.`}
          >
            <ImageInput name="image" id={`image-${key}`} maxBytes={maxUploadBytes} required={!editing} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cím" name={`title-${key}`} hint="A kép alatt jelenik meg.">
            <Input name="title" id={`title-${key}`} maxLength={120} defaultValue={item?.title ?? ''} />
          </Field>

          <Field label="Sorrend" name={`sort-${key}`} hint="Kisebb szám előrébb kerül.">
            <Input name="sort_order" id={`sort-${key}`} type="number" min={0} defaultValue={item?.sort_order ?? 0} />
          </Field>
        </div>

        <Field
          label="Alt szöveg"
          name={`alt-${key}`}
          hint="Mit ábrázol a kép? Képernyőolvasók ezt olvassák fel. Cím híján ez jelenik meg."
        >
          <Input name="alt" id={`alt-${key}`} maxLength={240} defaultValue={item?.alt ?? ''} />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--k-line)] pt-5">
          <Checkbox label="Megjelenik a galériában" name="active" defaultChecked={(item?.active ?? 1) === 1} />
          <Submit>{editing ? 'Mentés' : 'Feltöltés'}</Submit>
        </div>
      </form>

      {editing && (
        <form action={archiveGalleryAction} className="mt-5 border-t border-[var(--k-line)] pt-5">
          <input type="hidden" name="id" value={item.id} />
          <ConfirmButton message="Biztosan archiválod ezt a képet?">Archiválás</ConfirmButton>
        </form>
      )}
    </Panel>
  );
}
