'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminCredentials } from '@/lib/env';
import { verifyPassword } from '@/lib/auth/password';
import { clearSessionCookie, createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { checkLoginAttempt, clearLoginAttempts, recordFailedLogin } from '@/lib/auth/throttle';
import { requireAdminAction } from '@/lib/actions/guard';

/** The client address, as the reverse proxy reports it. */
async function clientKey(): Promise<string> {
  const header = await headers();
  const forwarded = header.get('x-forwarded-for');
  return (forwarded?.split(',')[0] ?? header.get('x-real-ip') ?? 'unknown').trim();
}

/** Shape returned to the login form by React's useActionState. */
export interface LoginState {
  readonly error?: string;
}

/**
 * Signs an administrator in.
 *
 * Both a wrong address and a wrong password produce the same message and the
 * same amount of work — the password is verified even when the address does not
 * match — so the form cannot be used to discover whether an account exists.
 */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (email === '' || password === '') {
    return { error: 'Add meg az e-mail címet és a jelszót.' };
  }

  const key = await clientKey();
  const verdict = checkLoginAttempt(key);
  if (!verdict.allowed) {
    return { error: `Túl sok sikertelen próbálkozás. Próbáld újra ${verdict.retryInMinutes} perc múlva.` };
  }

  const admin = adminCredentials();
  if (admin.email === '' || admin.passwordHash === '') {
    return { error: 'Az admin fiók nincs beállítva. Töltsd ki az ADMIN_EMAIL és ADMIN_PASSWORD_HASH értékeket.' };
  }

  const passwordOk = await verifyPassword(password, admin.passwordHash);
  if (!passwordOk || email !== admin.email) {
    recordFailedLogin(key);
    return { error: 'Hibás e-mail cím vagy jelszó.' };
  }

  clearLoginAttempts(key);
  await setSessionCookie(await createSessionToken(admin.email));
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await requireAdminAction();
  await clearSessionCookie();
  redirect('/admin/belepes');
}
