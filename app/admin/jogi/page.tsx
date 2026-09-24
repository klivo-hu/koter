import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { LegalForm } from '@/components/admin/legal-forms';
import { requireAdminPage } from '@/lib/auth/guard';
import { listLegalPagesAdmin } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminLegalPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const pages = listLegalPagesAdmin();

  return (
    <AdminPage>
      <AdminPageHead
        title="Jogi oldalak"
        description="Az adatkezelési tájékoztató, az ÁSZF és az impresszum — és bármilyen további dokumentum. A láblécben automatikusan megjelennek. A szövegek vázlatok: publikálás előtt jogi szakértővel nézesd át őket."
      />

      <div className="flex flex-col gap-8">
        <LegalForm />
        {pages.map((page) => (
          <LegalForm key={page.id} page={page} />
        ))}
      </div>
    </AdminPage>
  );
}
