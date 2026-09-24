'use client';

import { useActionState } from 'react';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Checkbox, Field, FormMessage, Input, Panel, Submit, Textarea } from '@/components/admin/ui';
import { archivePricingAction, savePricingAction, type ActionState } from '@/lib/actions/content';
import { formatPrice } from '@/lib/site';
import type { PricingItem } from '@/lib/types';

/**
 * One ticket type's editor. The same form creates and updates: with no `item` it
 * posts without an id and the action inserts, otherwise it carries the id and
 * the action updates. That keeps one set of fields and one validation schema.
 */
export function PricingForm({ item }: { item?: PricingItem }): React.JSX.Element {
  const [state, action] = useActionState<ActionState, FormData>(savePricingAction, {});
  const editing = item !== undefined;

  return (
    <Panel
      title={editing ? item.name : 'Új jegytípus'}
      description={editing ? `Jelenlegi ár: ${formatPrice(item.price, item.currency)}` : 'Tetszőleges számú további jegytípus hozható létre.'}
    >
      <form action={action} className="flex flex-col gap-5">
        {editing && <input type="hidden" name="id" value={item.id} />}
        <FormMessage state={state} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Megnevezés" name={`name-${item?.id ?? 'new'}`}>
            <Input
              name="name"
              id={`name-${item?.id ?? 'new'}`}
              required
              maxLength={80}
              defaultValue={item?.name ?? ''}
              placeholder="Pl. Felnőtt"
            />
          </Field>

          <Field label="Ár (Ft)" name={`price-${item?.id ?? 'new'}`}>
            <Input
              name="price"
              id={`price-${item?.id ?? 'new'}`}
              type="number"
              min={0}
              step={100}
              required
              defaultValue={item?.price ?? ''}
              placeholder="17000"
            />
          </Field>

          <Field label="Időszak" name={`period-${item?.id ?? 'new'}`} hint="Az ár mellett jelenik meg.">
            <Input
              name="period"
              id={`period-${item?.id ?? 'new'}`}
              maxLength={32}
              defaultValue={item?.period ?? ''}
              placeholder="/ hó"
            />
          </Field>

          <Field label="Sorrend" name={`sort-${item?.id ?? 'new'}`} hint="Kisebb szám előrébb kerül.">
            <Input
              name="sort_order"
              id={`sort-${item?.id ?? 'new'}`}
              type="number"
              min={0}
              defaultValue={item?.sort_order ?? 0}
            />
          </Field>
        </div>

        <Field label="Leírás" name={`desc-${item?.id ?? 'new'}`}>
          <Textarea
            name="description"
            id={`desc-${item?.id ?? 'new'}`}
            maxLength={600}
            defaultValue={item?.description ?? ''}
            placeholder="Egy-két mondat arról, mit tartalmaz."
          />
        </Field>

        <input type="hidden" name="currency" value={item?.currency ?? 'HUF'} />

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--k-line)] pt-5">
          <Checkbox label="Megjelenik az oldalon" name="active" defaultChecked={(item?.active ?? 1) === 1} />
          <Submit>{editing ? 'Mentés' : 'Létrehozás'}</Submit>
        </div>
      </form>

      {editing && (
        <form action={archivePricingAction} className="mt-5 border-t border-[var(--k-line)] pt-5">
          <input type="hidden" name="id" value={item.id} />
          <ConfirmButton message={`Biztosan archiválod ezt: „${item.name}”? Az oldalról azonnal eltűnik.`}>
            Archiválás
          </ConfirmButton>
        </form>
      )}
    </Panel>
  );
}
