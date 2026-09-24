import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/nav';
import { isAdmin } from '@/lib/auth/guard';

export const metadata: Metadata = {
  title: 'Admin',
  // The back office must never appear in a search index.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The back office shell.
 *
 * The navigation is only rendered for a verified session, so the login screen —
 * which lives under /admin but outside the guard — shows nothing but its form.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }): Promise<React.JSX.Element> {
  const signedIn = await isAdmin();

  return (
    <div className="min-h-screen bg-[var(--k-ink)]">
      <a href="#admin-tartalom" className="k-skip">
        Ugrás a tartalomra
      </a>
      {signedIn && <AdminNav />}
      <main id="admin-tartalom" className={signedIn ? 'lg:pl-64' : ''}>
        {children}
      </main>
    </div>
  );
}
