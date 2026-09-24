import { AdminPage, AdminPageHead } from '@/components/admin/page-head';
import { SettingsForm, type SettingField } from '@/components/admin/settings-form';
import { requireAdminPage } from '@/lib/auth/guard';
import { getSettings } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

const CONTACT: readonly SettingField[] = [
  { key: 'contact_address', label: 'Cím', hint: 'Ahogy az oldalon megjelenjen.' },
  { key: 'contact_city', label: 'Város', hint: 'A strukturált adatokhoz (keresők ezt olvassák).' },
  { key: 'contact_phone', label: 'Telefonszám', type: 'tel', hint: 'Üresen hagyva nem jelenik meg sehol.' },
  { key: 'contact_email', label: 'E-mail cím', type: 'email', hint: 'Üresen hagyva nem jelenik meg sehol.' },
  {
    key: 'opening_hours',
    label: 'Nyitvatartás',
    type: 'textarea',
    hint: 'Soronként egy bejegyzés. Üresen hagyva a sor eltűnik az oldalról.',
  },
];

const SOCIAL: readonly SettingField[] = [
  { key: 'social_facebook', label: 'Facebook oldal URL', type: 'url', hint: 'https:// címmel.' },
  { key: 'social_instagram', label: 'Instagram profil URL', type: 'url', hint: 'https:// címmel.' },
];

const MAP: readonly SettingField[] = [
  {
    key: 'map_embed_url',
    label: 'Google Maps beágyazás URL',
    type: 'url',
    hint: 'A Google Térkép „Beágyazás” kódjából csak az iframe src értéke kell.',
  },
];

export default async function AdminSettingsPage(): Promise<React.JSX.Element> {
  await requireAdminPage();
  const settings = getSettings();

  return (
    <AdminPage>
      <AdminPageHead
        title="Elérhetőség, közösségi, térkép"
        description="Ezek az adatok a láblécben, a főoldal alján és a Rólunk oldalon jelennek meg. Amelyik mező üres, az a publikus oldalon egyszerűen kimarad."
      />

      <div className="flex flex-col gap-8">
        <SettingsForm title="Elérhetőség" fields={CONTACT} settings={settings} />
        <SettingsForm title="Közösségi oldalak" fields={SOCIAL} settings={settings} />
        <SettingsForm title="Térkép" fields={MAP} settings={settings} />
      </div>
    </AdminPage>
  );
}
