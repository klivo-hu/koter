import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { SettingsForm, type SettingField } from '@/components/admin/settings-form';
import { requireAdminPage } from '@/lib/auth/guard';
import { getSettings } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

const ABOUT: readonly SettingField[] = [
  {
    key: 'about_heading',
    label: 'Rólunk főcím',
    hint: 'A vessző előtti rész kerül az első sorba. Alapértelmezés: „Gyere, tartozz közénk.”',
  },
  { key: 'about_intro', label: 'Bevezető', type: 'textarea', hint: 'A főcím alatt, nagyobb betűvel.' },
  {
    key: 'about_body',
    label: 'Bemutatkozó szöveg',
    type: 'textarea',
    rows: 'tall',
    hint: 'Két üres sor új bekezdést kezd.',
  },
  { key: 'awards_intro', label: 'Elismerések bevezető', type: 'textarea' },
];

const BRAND: readonly SettingField[] = [
  { key: 'site_name', label: 'Oldal neve' },
  { key: 'site_tagline', label: 'Szlogen' },
];

export default async function AdminContentPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const settings = getSettings();

  return (
    <AdminPage>
      <AdminPageHead
        title="Rólunk / tartalmak"
        description="A Rólunk oldal szövegei. Ezek nincsenek beégetve a kódba — amit itt mentesz, az jelenik meg."
      />

      <div className="flex flex-col gap-8">
        <SettingsForm title="Rólunk oldal" fields={ABOUT} settings={settings} />
        <SettingsForm title="Márka" fields={BRAND} settings={settings} />
      </div>
    </AdminPage>
  );
}
