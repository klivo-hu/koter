import { db, now } from '@/lib/db';
import type {
  Award,
  GalleryItem,
  GalleryView,
  LegalPage,
  MediaRecord,
  PricingItem,
  SiteSettings,
  Trainer,
  TrainerView,
} from '@/lib/types';

/**
 * Data access for every editable entity.
 *
 * Read helpers return only what the public site is allowed to see (active, not
 * archived, in the admin's order). Admin helpers return everything. Keeping both
 * behind one module means a page can never accidentally query a draft row.
 */

/* ------------------------------------------------------------------ media */

export function getMedia(id: string): MediaRecord | null {
  return (db().prepare('SELECT * FROM media WHERE id = ?').get(id) as MediaRecord | undefined) ?? null;
}

export function insertMedia(record: Omit<MediaRecord, 'created_at'>): void {
  db()
    .prepare(
      `INSERT INTO media (id, url, kind, filename, mime, width, height, bytes, blur, created_at)
       VALUES (@id, @url, @kind, @filename, @mime, @width, @height, @bytes, @blur, @created_at)`,
    )
    .run({ ...record, created_at: now() });
}

/** Uploaded media that no trainer or gallery row still points at. */
export function listOrphanMedia(): MediaRecord[] {
  return db()
    .prepare(
      `SELECT * FROM media
        WHERE kind = 'upload'
          AND id NOT IN (SELECT image FROM trainers WHERE image IS NOT NULL)
          AND id NOT IN (SELECT image FROM gallery_items)
        ORDER BY created_at DESC`,
    )
    .all() as MediaRecord[];
}

/* ---------------------------------------------------------------- pricing */

export function listPricing(): PricingItem[] {
  return db()
    .prepare('SELECT * FROM pricing_items WHERE archived = 0 AND active = 1 ORDER BY sort_order, id')
    .all() as PricingItem[];
}

export function listPricingAdmin(): PricingItem[] {
  return db()
    .prepare('SELECT * FROM pricing_items WHERE archived = 0 ORDER BY sort_order, id')
    .all() as PricingItem[];
}

export function getPricing(id: number): PricingItem | null {
  return (
    (db().prepare('SELECT * FROM pricing_items WHERE id = ?').get(id) as PricingItem | undefined) ?? null
  );
}

export interface PricingInput {
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  sort_order: number;
  active: number;
}

export function createPricing(input: PricingInput): number {
  const result = db()
    .prepare(
      `INSERT INTO pricing_items (name, price, currency, period, description, sort_order, active, created_at, updated_at)
       VALUES (@name, @price, @currency, @period, @description, @sort_order, @active, @ts, @ts)`,
    )
    .run({ ...input, ts: now() });
  return Number(result.lastInsertRowid);
}

export function updatePricing(id: number, input: PricingInput): void {
  db()
    .prepare(
      `UPDATE pricing_items SET name = @name, price = @price, currency = @currency, period = @period,
              description = @description, sort_order = @sort_order, active = @active, updated_at = @ts
        WHERE id = @id`,
    )
    .run({ ...input, id, ts: now() });
}

export function archivePricing(id: number): void {
  db().prepare('UPDATE pricing_items SET archived = 1, active = 0, updated_at = ? WHERE id = ?').run(now(), id);
}

/* --------------------------------------------------------------- trainers */

function withMedia<T extends { image: string | null }>(rows: T[]): Array<T & { media: MediaRecord | null }> {
  return rows.map((row) => ({ ...row, media: row.image ? getMedia(row.image) : null }));
}

export function listTrainers(): TrainerView[] {
  const rows = db()
    .prepare('SELECT * FROM trainers WHERE archived = 0 AND active = 1 ORDER BY sort_order, id')
    .all() as Trainer[];
  return withMedia(rows);
}

export function listTrainersAdmin(): TrainerView[] {
  const rows = db().prepare('SELECT * FROM trainers WHERE archived = 0 ORDER BY sort_order, id').all() as Trainer[];
  return withMedia(rows);
}

export function getTrainer(id: number): Trainer | null {
  return (db().prepare('SELECT * FROM trainers WHERE id = ?').get(id) as Trainer | undefined) ?? null;
}

export interface TrainerInput {
  name: string;
  role: string;
  phone: string;
  email: string;
  bio: string;
  image: string | null;
  sort_order: number;
  active: number;
}

export function createTrainer(input: TrainerInput): number {
  const result = db()
    .prepare(
      `INSERT INTO trainers (name, role, phone, email, bio, image, sort_order, active, created_at, updated_at)
       VALUES (@name, @role, @phone, @email, @bio, @image, @sort_order, @active, @ts, @ts)`,
    )
    .run({ ...input, ts: now() });
  return Number(result.lastInsertRowid);
}

export function updateTrainer(id: number, input: TrainerInput): void {
  db()
    .prepare(
      `UPDATE trainers SET name = @name, role = @role, phone = @phone, email = @email, bio = @bio,
              image = @image, sort_order = @sort_order, active = @active, updated_at = @ts
        WHERE id = @id`,
    )
    .run({ ...input, id, ts: now() });
}

export function archiveTrainer(id: number): void {
  db().prepare('UPDATE trainers SET archived = 1, active = 0, updated_at = ? WHERE id = ?').run(now(), id);
}

/* ---------------------------------------------------------------- gallery */

function joinGallery(rows: GalleryItem[]): GalleryView[] {
  const views: GalleryView[] = [];
  for (const row of rows) {
    const media = getMedia(row.image);
    // A row whose media vanished is skipped rather than rendered broken.
    if (media) {
      views.push({ ...row, media });
    }
  }
  return views;
}

export function listGallery(limit?: number): GalleryView[] {
  const rows = db()
    .prepare('SELECT * FROM gallery_items WHERE archived = 0 AND active = 1 ORDER BY sort_order, id')
    .all() as GalleryItem[];
  const views = joinGallery(rows);
  return limit === undefined ? views : views.slice(0, limit);
}

export function listGalleryAdmin(): GalleryView[] {
  const rows = db()
    .prepare('SELECT * FROM gallery_items WHERE archived = 0 ORDER BY sort_order, id')
    .all() as GalleryItem[];
  return joinGallery(rows);
}

export function getGalleryItem(id: number): GalleryItem | null {
  return (db().prepare('SELECT * FROM gallery_items WHERE id = ?').get(id) as GalleryItem | undefined) ?? null;
}

export interface GalleryInput {
  image: string;
  title: string;
  alt: string;
  sort_order: number;
  active: number;
}

export function createGalleryItem(input: GalleryInput): number {
  const result = db()
    .prepare(
      `INSERT INTO gallery_items (image, title, alt, sort_order, active, created_at, updated_at)
       VALUES (@image, @title, @alt, @sort_order, @active, @ts, @ts)`,
    )
    .run({ ...input, ts: now() });
  return Number(result.lastInsertRowid);
}

export function updateGalleryItem(id: number, input: GalleryInput): void {
  db()
    .prepare(
      `UPDATE gallery_items SET image = @image, title = @title, alt = @alt, sort_order = @sort_order,
              active = @active, updated_at = @ts
        WHERE id = @id`,
    )
    .run({ ...input, id, ts: now() });
}

export function archiveGalleryItem(id: number): void {
  db().prepare('UPDATE gallery_items SET archived = 1, active = 0, updated_at = ? WHERE id = ?').run(now(), id);
}

/* ----------------------------------------------------------------- awards */

export function listAwards(): Award[] {
  return db()
    .prepare('SELECT * FROM awards WHERE archived = 0 AND active = 1 ORDER BY sort_order, id')
    .all() as Award[];
}

export function listAwardsAdmin(): Award[] {
  return db().prepare('SELECT * FROM awards WHERE archived = 0 ORDER BY sort_order, id').all() as Award[];
}

export function getAward(id: number): Award | null {
  return (db().prepare('SELECT * FROM awards WHERE id = ?').get(id) as Award | undefined) ?? null;
}

export interface AwardInput {
  title: string;
  year: string;
  issuer: string;
  description: string;
  source_url: string;
  sort_order: number;
  active: number;
}

export function createAward(input: AwardInput): number {
  const result = db()
    .prepare(
      `INSERT INTO awards (title, year, issuer, description, source_url, sort_order, active, created_at, updated_at)
       VALUES (@title, @year, @issuer, @description, @source_url, @sort_order, @active, @ts, @ts)`,
    )
    .run({ ...input, ts: now() });
  return Number(result.lastInsertRowid);
}

export function updateAward(id: number, input: AwardInput): void {
  db()
    .prepare(
      `UPDATE awards SET title = @title, year = @year, issuer = @issuer, description = @description,
              source_url = @source_url, sort_order = @sort_order, active = @active, updated_at = @ts
        WHERE id = @id`,
    )
    .run({ ...input, id, ts: now() });
}

export function archiveAward(id: number): void {
  db().prepare('UPDATE awards SET archived = 1, active = 0, updated_at = ? WHERE id = ?').run(now(), id);
}

/* ------------------------------------------------------------ legal pages */

export function listLegalPages(): LegalPage[] {
  return db()
    .prepare('SELECT * FROM legal_pages WHERE active = 1 ORDER BY sort_order, id')
    .all() as LegalPage[];
}

export function listLegalPagesAdmin(): LegalPage[] {
  return db().prepare('SELECT * FROM legal_pages ORDER BY sort_order, id').all() as LegalPage[];
}

export function getLegalPage(slug: string): LegalPage | null {
  return (
    (db().prepare('SELECT * FROM legal_pages WHERE slug = ? AND active = 1').get(slug) as LegalPage | undefined) ??
    null
  );
}

export function getLegalPageById(id: number): LegalPage | null {
  return (db().prepare('SELECT * FROM legal_pages WHERE id = ?').get(id) as LegalPage | undefined) ?? null;
}

export interface LegalInput {
  slug: string;
  title: string;
  content: string;
  sort_order: number;
  active: number;
}

export function createLegalPage(input: LegalInput): number {
  const result = db()
    .prepare(
      `INSERT INTO legal_pages (slug, title, content, sort_order, active, created_at, updated_at)
       VALUES (@slug, @title, @content, @sort_order, @active, @ts, @ts)`,
    )
    .run({ ...input, ts: now() });
  return Number(result.lastInsertRowid);
}

export function updateLegalPage(id: number, input: LegalInput): void {
  db()
    .prepare(
      `UPDATE legal_pages SET slug = @slug, title = @title, content = @content,
              sort_order = @sort_order, active = @active, updated_at = @ts
        WHERE id = @id`,
    )
    .run({ ...input, id, ts: now() });
}

export function deleteLegalPage(id: number): void {
  db().prepare('DELETE FROM legal_pages WHERE id = ?').run(id);
}

/* --------------------------------------------------------------- settings */

export function getSettings(): SiteSettings {
  const rows = db().prepare('SELECT key, value FROM site_settings').all() as Array<{
    key: string;
    value: string;
  }>;
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function setSettings(values: Readonly<Record<string, string>>): void {
  const upsert = db().prepare(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  );
  const write = db().transaction(() => {
    for (const [key, value] of Object.entries(values)) {
      upsert.run(key, value, now());
    }
  });
  write();
}
