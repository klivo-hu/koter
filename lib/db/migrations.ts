import type BetterSqlite3 from 'better-sqlite3';
import {
  COOKIE_POLICY_PAGE,
  PRIVACY_COOKIES_SECTION,
  PRIVACY_COOKIES_SECTION_V0,
  PRIVACY_POLICY_SLUG,
} from './legal-content';

/**
 * Content migrations for databases that were seeded by an earlier release.
 *
 * The seed only fills empty tables, so changing it never reaches a site that is
 * already running. Each step here brings such a database forward once; SQLite's
 * `user_version` records how far a database has come, and every step runs in its
 * own transaction together with the version bump, so a failure leaves nothing
 * half-applied and the step is simply retried on the next start.
 *
 * Steps must be safe on a freshly seeded database too — there they find the new
 * content already in place and change nothing — and must never overwrite text an
 * operator has edited in the admin.
 */

type Migration = (database: BetterSqlite3.Database) => void;

const MIGRATIONS: readonly Migration[] = [
  /**
   * 1 — cookie consent for the Google Maps embed. Adds the cookie policy, and
   * rewrites the privacy policy's cookie section, but only while that section
   * is still word for word the one the seed wrote.
   */
  (database) => {
    const exists = database
      .prepare('SELECT 1 FROM legal_pages WHERE slug = ?')
      .get(COOKIE_POLICY_PAGE.slug);
    if (exists === undefined) {
      database
        .prepare('INSERT INTO legal_pages (slug, title, content, sort_order, active) VALUES (?, ?, ?, ?, 1)')
        .run(COOKIE_POLICY_PAGE.slug, COOKIE_POLICY_PAGE.title, COOKIE_POLICY_PAGE.content, COOKIE_POLICY_PAGE.sortOrder);
    }

    const privacy = database
      .prepare('SELECT id, content FROM legal_pages WHERE slug = ?')
      .get(PRIVACY_POLICY_SLUG) as { id: number; content: string } | undefined;
    if (privacy === undefined) {
      return;
    }
    const content = privacy.content.replace(/\r\n/g, '\n');
    if (content.includes(PRIVACY_COOKIES_SECTION_V0)) {
      database
        .prepare("UPDATE legal_pages SET content = ?, updated_at = datetime('now') WHERE id = ?")
        .run(content.replace(PRIVACY_COOKIES_SECTION_V0, PRIVACY_COOKIES_SECTION), privacy.id);
    } else if (!content.includes(PRIVACY_COOKIES_SECTION)) {
      console.warn(
        '[migrations] Az adatkezelési tájékoztató süti szakaszát az admin már átírta, ezért automatikusan nem frissült. ' +
          'Egészítsd ki kézzel a Google Térkép és a hozzájárulás leírásával (lásd: Süti tájékoztató).',
      );
    }
  },
];

/** Applies every step this database has not seen yet, in order. */
export function migrate(database: BetterSqlite3.Database): void {
  const current = database.pragma('user_version', { simple: true }) as number;
  for (let version = current; version < MIGRATIONS.length; version += 1) {
    const step = MIGRATIONS[version];
    if (step === undefined) {
      continue;
    }
    database.transaction(() => {
      step(database);
      database.pragma(`user_version = ${version + 1}`);
    })();
  }
}
