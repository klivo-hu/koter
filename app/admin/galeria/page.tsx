import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { GalleryForm } from '@/components/admin/gallery-forms';
import { requireAdminPage } from '@/lib/auth/guard';
import { listGalleryAdmin } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const items = listGalleryAdmin();

  return (
    <AdminPage>
      <AdminPageHead
        title="Galéria"
        description="A galéria képei. A sorrend határozza meg, melyik kép hova kerül az editorial elrendezésben — a rendszer hat lépésenként ismétli a ritmust."
      />

      <div className="flex flex-col gap-8">
        <GalleryForm />
        {items.map((item) => (
          <GalleryForm key={item.id} item={item} />
        ))}
      </div>
    </AdminPage>
  );
}
