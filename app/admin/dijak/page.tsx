import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { AwardForm } from '@/components/admin/award-forms';
import { requireAdminPage } from '@/lib/auth/guard';
import { listAwardsAdmin } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminAwardsPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const awards = listAwardsAdmin();

  return (
    <AdminPage>
      <AdminPageHead
        title="Díjak, elismerések"
        description="A Rólunk oldal elismerések szekciója. Minden bejegyzéshez érdemes forrást megadni, hogy ellenőrizhető maradjon."
      />

      <div className="flex flex-col gap-8">
        <AwardForm />
        {awards.map((award) => (
          <AwardForm key={award.id} award={award} />
        ))}
      </div>
    </AdminPage>
  );
}
