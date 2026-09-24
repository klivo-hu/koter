import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { isAdmin } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Belépés',
  robots: { index: false, follow: false },
};

export default async function LoginPage(): Promise<React.JSX.Element> {
  // Already signed in: no reason to show the form again.
  if (await isAdmin()) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="k-display-md text-[var(--k-bone)]">Admin belépés</h1>
        <p className="mt-3 text-sm text-[var(--k-muted)]">
          Kóter Gym &amp; Crossfight Aréna tartalomkezelő.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
