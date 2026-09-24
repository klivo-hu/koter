'use client';

import { useActionState } from 'react';
import { Field, FormMessage, Input, Submit } from '@/components/admin/ui';
import { loginAction, type LoginState } from '@/lib/actions/auth';

export function LoginForm(): React.JSX.Element {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="mt-10 flex flex-col gap-5">
      <FormMessage state={state} />

      <Field label="E-mail cím" name="email">
        <Input
          type="email"
          name="email"
          autoComplete="username"
          required
          autoFocus
          placeholder="admin@kotergym.hu"
        />
      </Field>

      <Field label="Jelszó" name="password">
        <Input type="password" name="password" autoComplete="current-password" required />
      </Field>

      <div className="mt-2">
        <Submit>Belépés</Submit>
      </div>
    </form>
  );
}
