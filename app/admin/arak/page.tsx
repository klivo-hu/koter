import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { PricingForm } from '@/components/admin/pricing-forms';
import { requireAdminPage } from '@/lib/auth/guard';
import { listPricingAdmin } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const items = listPricingAdmin();

  return (
    <AdminPage>
      <AdminPageHead
        title="Árak"
        description="A jegy- és bérlettípusok. A három induló típus csak alapértelmezés — bármennyi továbbit létre lehet hozni, és bármelyik archiválható."
      />

      <div className="flex flex-col gap-8">
        <PricingForm />
        {items.map((item) => (
          <PricingForm key={item.id} item={item} />
        ))}
      </div>
    </AdminPage>
  );
}
