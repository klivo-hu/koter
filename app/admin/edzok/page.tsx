import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { TrainerForm } from '@/components/admin/trainer-forms';
import { requireAdminPage } from '@/lib/auth/guard';
import { listTrainersAdmin } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminTrainersPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const trainers = listTrainersAdmin();

  return (
    <AdminPage>
      <AdminPageHead
        title="Edzők"
        description="Név, elérhetőség, bemutatkozás és profilkép. A profilképeket ide kell feltölteni — amíg nincs kép, a publikus kártyán monogramos helyőrző jelenik meg."
      />

      <div className="flex flex-col gap-8">
        <TrainerForm />
        {trainers.map((trainer) => (
          <TrainerForm key={trainer.id} trainer={trainer} />
        ))}
      </div>
    </AdminPage>
  );
}
