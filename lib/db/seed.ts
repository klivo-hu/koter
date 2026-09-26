import type BetterSqlite3 from 'better-sqlite3';
import { SEED_GALLERY } from '@/lib/generated/seed-media';
import { LEGAL_PAGES } from './legal-content';

/**
 * Default content, written once into an empty database.
 *
 * Everything here is a *starting point* the admin can change, extend or delete —
 * the three ticket types are seed data, not a fixed set. Re-running is safe: each
 * table is only filled when it is still empty, so an operator's edits are never
 * overwritten by a container restart.
 *
 * Facts that could not be verified (phone, e-mail, opening hours) are seeded
 * empty rather than invented; the front end hides whatever is still blank.
 */

const PRICING: ReadonlyArray<[string, number, string, string, number]> = [
  [
    '18 év alatti diák',
    16000,
    '/ hó',
    'Havi bérlet 18 év alatti diákoknak, diákigazolvány felmutatásával. Korlátlan belépés a nyitvatartási időben.',
    10,
  ],
  [
    'Felnőtt',
    17000,
    '/ hó',
    'Havi bérlet felnőtteknek. Korlátlan belépés az erőterembe, a küzdőtérbe és a kardió részlegbe.',
    20,
  ],
  [
    'Napi jegy',
    3000,
    '/ alkalom',
    'Egyszeri belépő a teljes teremre. Ha csak beugranál, vagy először néznél körül.',
    30,
  ],
];

/**
 * Recognitions listed on the gym's public Sport Turul profile. Recorded exactly as
 * that source states them, with the source URL kept on every row — no award, year
 * or number is invented here.
 */
const SOURCE_URL = 'https://www.sportturul.eu/profile-21572-koter-gym-crossfight-arena';
const AWARDS: ReadonlyArray<[string, string, string]> = [
  ['Projekt díjazottja — arany', '2025', ''],
  ['Projekt díjazottja — arany', '2024', ''],
  ['Projekt díjazottja — arany', '2023', ''],
  ['Projekt díjazottja — arany', '2022', ''],
  ['Projekt díjazottja — ezüst', '2021', ''],
];

/** Editable site-wide values. Blank means "not verified yet" — the UI hides it. */
const SETTINGS: ReadonlyArray<[string, string]> = [
  ['site_name', 'Kóter Gym & Crossfight Aréna'],
  ['site_tagline', 'Gyere, tartozz közénk.'],
  ['contact_address', 'Hatvan, Tabán út 13.'],
  ['contact_city', 'Hatvan'],
  ['contact_phone', ''],
  ['contact_email', ''],
  ['opening_hours', ''],
  ['social_facebook', 'https://www.facebook.com/p/K%C3%B3ter-Gym-Crossfight-Ar%C3%A9na-100044449878024/?locale=hu_HU'],
  ['social_instagram', 'https://www.instagram.com/kotergym/?hl=hu'],
  [
    'map_embed_url',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2687.0341496548363!2d19.686999077470464!3d47.66433298398748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47404d42058c9c91%3A0x911a8fc07462e22d!2sK%C3%B3ter%20Gym%20%26%20Crossfight%20Ar%C3%A9na!5e0!3m2!1shu!2shu!4v1789673777179',
  ],
  ['about_heading', 'Gyere, tartozz közénk.'],
  [
    'about_intro',
    'A Kóter Gym & Crossfight Aréna 2015 óta működik Hatvan belvárosában. Erőterem, küzdőtér és csoportos foglalkozások egy helyen — és egy csapat, amelyik számon kér.',
  ],
  [
    'about_body',
    'Szabad súlyok, állványok, padok, erőgépek és kardió. Külön küzdőtér zsákokkal és tánctermi órákkal. ' +
      'Testépítés, thai box és más dinamikus edzésformák.\n\n' +
      'Nem wellness. Nem stúdió. Edzőterem, ahová azért jársz, mert haladni akarsz — és ahol ezt észreveszik rajtad.',
  ],
  [
    'awards_intro',
    'A terem a Sport Turul szakmai nyilvántartásában évek óta szerepel. Az alábbi elismerések a nyilvános profilon feltüntetett adatok.',
  ],
];

export function seedDefaults(database: BetterSqlite3.Database): void {
  const isEmpty = (table: string): boolean =>
    (database.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n === 0;

  const seed = database.transaction(() => {
    if (isEmpty('pricing_items')) {
      const insert = database.prepare(
        `INSERT INTO pricing_items (name, price, currency, period, description, sort_order, active)
         VALUES (?, ?, 'HUF', ?, ?, ?, 1)`,
      );
      for (const [name, price, period, description, order] of PRICING) {
        insert.run(name, price, period, description, order);
      }
    }

    if (isEmpty('awards')) {
      const insert = database.prepare(
        `INSERT INTO awards (title, year, issuer, description, source_url, sort_order, active)
         VALUES (?, ?, 'Sport Turul', ?, ?, ?, 1)`,
      );
      let order = 0;
      for (const [title, year, description] of AWARDS) {
        order += 10;
        insert.run(title, year, description, SOURCE_URL, order);
      }
    }

    if (isEmpty('legal_pages')) {
      const insert = database.prepare(
        `INSERT INTO legal_pages (slug, title, content, sort_order, active) VALUES (?, ?, ?, ?, 1)`,
      );
      for (const page of LEGAL_PAGES) {
        insert.run(page.slug, page.title, page.content, page.sortOrder);
      }
    }

    const setSetting = database.prepare(
      `INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING`,
    );
    for (const [key, value] of SETTINGS) {
      setSetting.run(key, value);
    }

    // The bundled photographs are registered as media so the gallery behaves
    // identically whether a picture shipped with the site or was uploaded later.
    if (isEmpty('gallery_items')) {
      const insertMedia = database.prepare(
        `INSERT INTO media (id, url, kind, filename, mime, width, height, bytes, blur)
         VALUES (?, ?, 'bundled', ?, 'image/webp', ?, ?, ?, ?)
         ON CONFLICT (id) DO NOTHING`,
      );
      const insertItem = database.prepare(
        `INSERT INTO gallery_items (image, title, alt, sort_order, active) VALUES (?, ?, ?, ?, 1)`,
      );
      for (const item of SEED_GALLERY) {
        insertMedia.run(item.id, item.url, item.filename, item.width, item.height, item.bytes, item.blur);
        insertItem.run(item.id, item.title, item.alt, item.sortOrder);
      }
    }
  });

  seed();
}
