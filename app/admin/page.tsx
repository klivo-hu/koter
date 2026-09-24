import Link from 'next/link';
import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { requireAdminPage } from '@/lib/auth/guard';
import {
  listAwardsAdmin,
  listGalleryAdmin,
  listLegalPagesAdmin,
  listPricingAdmin,
  listTrainersAdmin,
  getSettings,
} from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard(): Promise<React.JSX.Element> {
  await requireAdminPage();

  const pricing = listPricingAdmin();
  const trainers = listTrainersAdmin();
  const gallery = listGalleryAdmin();
  const awards = listAwardsAdmin();
  const legal = listLegalPagesAdmin();
  const settings = getSettings();

  const cards = [
    { href: '/admin/arak', label: 'Jegytípusok', total: pricing.length, live: pricing.filter((i) => i.active === 1).length },
    { href: '/admin/edzok', label: 'Edzők', total: trainers.length, live: trainers.filter((i) => i.active === 1).length },
    { href: '/admin/galeria', label: 'Galéria képek', total: gallery.length, live: gallery.filter((i) => i.active === 1).length },
    { href: '/admin/dijak', label: 'Elismerések', total: awards.length, live: awards.filter((i) => i.active === 1).length },
    { href: '/admin/jogi', label: 'Jogi oldalak', total: legal.length, live: legal.filter((i) => i.active === 1).length },
  ];

  // Contact details are the one thing the public pages hide when blank, so an
  // incomplete set is worth surfacing here rather than leaving to be noticed.
  const missing = (
    [
      ['contact_phone', 'telefonszám'],
      ['contact_email', 'e-mail cím'],
      ['opening_hours', 'nyitvatartás'],
    ] as const
  )
    .filter(([key]) => (settings[key] ?? '') === '')
    .map(([, label]) => label);

  return (
    <AdminPage>
      <AdminPageHead
        title="Áttekintés"
        description="Innen szerkeszthető a publikus oldal minden tartalma. A mentés azonnal látszik az oldalon."
      />

      {missing.length > 0 && (
        <p className="mb-10 border-l-2 border-[var(--k-red)] bg-[var(--k-ink-card)] px-5 py-4 text-sm text-[var(--k-bone)]">
          Még nincs kitöltve: {missing.join(', ')}. Amíg üres, a publikus oldal nem jeleníti meg.{' '}
          <Link href="/admin/beallitasok" className="underline underline-offset-4">
            Kitöltöm
          </Link>
        </p>
      )}

      <ul className="grid gap-px border border-[var(--k-line)] bg-[var(--k-line)] sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col justify-between gap-6 bg-[var(--k-ink-raised)] p-6 transition-colors hover:bg-[var(--k-ink-card)]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--k-muted)]">
                {card.label}
              </span>
              <span>
                <span className="block text-4xl font-semibold tabular-nums text-[var(--k-bone)]">{card.total}</span>
                <span className="mt-1 block text-xs text-[var(--k-muted)]">{card.live} látható az oldalon</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
