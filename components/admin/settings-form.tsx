'use client';

import { useActionState } from 'react';
import { Field, FormMessage, Input, Panel, Submit, Textarea } from '@/components/admin/ui';
import { saveSettingsAction, type ActionState } from '@/lib/actions/content';
import type { SiteSettings } from '@/lib/types';

export interface SettingField {
  readonly key: string;
  readonly label: string;
  readonly hint?: string;
  readonly type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  readonly rows?: 'tall';
}

/**
 * A group of site settings.
 *
 * Only the keys listed in this form are submitted, and the action independently
 * restricts what it will write — so a crafted field name cannot reach a setting
 * the screen does not offer. A value left empty means "not published yet": the
 * public pages drop the whole row rather than showing an empty label.
 */
export function SettingsForm({
  title,
  description,
  fields,
  settings,
}: {
  title: string;
  description?: string;
  fields: readonly SettingField[];
  settings: SiteSettings;
}): React.JSX.Element {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsAction, {});

  return (
    <Panel title={title} description={description}>
      <form action={action} className="flex flex-col gap-5">
        <FormMessage state={state} />

        {fields.map((field) => (
          <Field key={field.key} label={field.label} name={field.key} hint={field.hint}>
            {field.type === 'textarea' ? (
              <Textarea
                name={field.key}
                id={field.key}
                defaultValue={settings[field.key] ?? ''}
                className={field.rows === 'tall' ? 'min-h-56' : undefined}
              />
            ) : (
              <Input
                name={field.key}
                id={field.key}
                type={field.type ?? 'text'}
                defaultValue={settings[field.key] ?? ''}
              />
            )}
          </Field>
        ))}

        <div className="flex justify-end border-t border-[var(--k-line)] pt-5">
          <Submit>Mentés</Submit>
        </div>
      </form>
    </Panel>
  );
}
