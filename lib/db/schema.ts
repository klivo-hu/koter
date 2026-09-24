/**
 * KÓTER GYM — relational schema (single source of truth).
 *
 * Kept as a TypeScript constant rather than a .sql file so it is always part of
 * the Next.js standalone bundle — the container never has to trace a data file.
 * Every piece of editable content lives here; nothing the admin can change is
 * hard-coded in a component.
 */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Ticket and membership types shown on /arak.
CREATE TABLE IF NOT EXISTS pricing_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  price       INTEGER NOT NULL,                       -- whole HUF, no decimals
  currency    TEXT    NOT NULL DEFAULT 'HUF',
  period      TEXT    NOT NULL DEFAULT '',            -- e.g. "/ hó", "/ alkalom"
  description TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  archived    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Personal trainers shown on /edzok. Images are uploaded from the admin.
CREATE TABLE IF NOT EXISTS trainers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  role        TEXT    NOT NULL DEFAULT '',
  phone       TEXT    NOT NULL DEFAULT '',
  email       TEXT    NOT NULL DEFAULT '',
  bio         TEXT    NOT NULL DEFAULT '',
  image       TEXT,                                   -- media id, NULL => placeholder
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  archived    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Editorial gallery on /galeria.
CREATE TABLE IF NOT EXISTS gallery_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  image       TEXT    NOT NULL,                       -- media id
  title       TEXT    NOT NULL DEFAULT '',
  alt         TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  archived    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Awards / recognitions on /rolunk. Seeded empty on purpose: nothing is invented.
CREATE TABLE IF NOT EXISTS awards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  year        TEXT    NOT NULL DEFAULT '',
  issuer      TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  source_url  TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  archived    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Legal documents rendered at /jogi/<slug>.
CREATE TABLE IF NOT EXISTS legal_pages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Free-form key/value site settings (contact details, social links, about copy).
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Uploaded media. The blur placeholder is generated once, at upload time, so the
-- front end never shows a spinner or flashes white while an image decodes.
CREATE TABLE IF NOT EXISTS media (
  id          TEXT PRIMARY KEY,                       -- opaque, url-safe
  url         TEXT    NOT NULL,                       -- public URL to render
  kind        TEXT    NOT NULL DEFAULT 'upload',      -- 'upload' | 'bundled'
  filename    TEXT    NOT NULL,
  mime        TEXT    NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  bytes       INTEGER NOT NULL,
  blur        TEXT    NOT NULL DEFAULT '',            -- base64 data URL, ~200 bytes
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pricing_order ON pricing_items (archived, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_trainers_order ON trainers (archived, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_items (archived, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awards_order  ON awards (archived, active, sort_order);
`;
