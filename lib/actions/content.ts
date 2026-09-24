'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminAction } from '@/lib/actions/guard';
import {
  archiveAward,
  archiveGalleryItem,
  archivePricing,
  archiveTrainer,
  createAward,
  createGalleryItem,
  createLegalPage,
  createPricing,
  createTrainer,
  deleteLegalPage,
  getGalleryItem,
  getMedia,
  getTrainer,
  setSettings,
  updateAward,
  updateGalleryItem,
  updateLegalPage,
  updatePricing,
  updateTrainer,
} from '@/lib/repositories';
import { deleteUploadFile, storeUpload } from '@/lib/uploads';

/**
 * Every write the admin can perform.
 *
 * Each action starts by re-verifying the session, then validates its input with
 * zod before anything reaches the database — the browser's own `required` and
 * `type` attributes are a convenience, never the check that counts.
 *
 * After a successful write the affected public routes are revalidated, so an
 * edit is visible on the site immediately.
 */

export interface ActionState {
  readonly ok?: boolean;
  readonly error?: string;
  readonly message?: string;
}

const PUBLIC_ROUTES = ['/', '/arak', '/edzok', '/galeria', '/rolunk'] as const;

function refresh(...extra: string[]): void {
  for (const route of [...PUBLIC_ROUTES, ...extra]) {
    revalidatePath(route);
  }
}

function fail(error: string): ActionState {
  return { ok: false, error };
}

function done(message: string): ActionState {
  return { ok: true, message };
}

/** Turns a zod failure into the first human-readable message. */
function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Érvénytelen adat.';
}

const text = (max: number) => z.string().trim().max(max);
const checkbox = z.preprocess((value) => (value === 'on' || value === '1' ? 1 : 0), z.number());
const order = z.preprocess(
  (value) => Number.parseInt(String(value ?? '0'), 10) || 0,
  z.number().int().min(0).max(100000),
);

/* ---------------------------------------------------------------- pricing */

const pricingSchema = z.object({
  name: text(80).min(1, 'A jegytípus neve kötelező.'),
  price: z.preprocess(
    (value) => Number.parseInt(String(value ?? '').replace(/\s/g, ''), 10),
    z.number({ invalid_type_error: 'Az ár csak szám lehet.' }).int().min(0, 'Az ár nem lehet negatív.').max(100000000),
  ),
  currency: text(8).default('HUF'),
  period: text(32).default(''),
  description: text(600).default(''),
  sort_order: order,
  active: checkbox,
});

export async function savePricingAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminAction();

  const parsed = pricingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  const input = { ...parsed.data, currency: parsed.data.currency === '' ? 'HUF' : parsed.data.currency };

  if (Number.isInteger(id) && id > 0) {
    updatePricing(id, input);
    refresh();
    return done('Jegytípus mentve.');
  }

  createPricing(input);
  refresh();
  return done('Jegytípus létrehozva.');
}

export async function archivePricingAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isInteger(id) && id > 0) {
    archivePricing(id);
    refresh();
  }
}

/* --------------------------------------------------------------- trainers */

const trainerSchema = z.object({
  name: text(80).min(1, 'Az edző neve kötelező.'),
  role: text(80).default(''),
  phone: text(40).default(''),
  email: z.union([z.literal(''), z.string().trim().email('Érvénytelen e-mail cím.')]).default(''),
  bio: text(1200).default(''),
  sort_order: order,
  active: checkbox,
});

/**
 * Reads an optional image from the form and stores it.
 * Returns the new media id, `undefined` when no file was chosen, or an error.
 */
async function readImage(formData: FormData): Promise<{ id?: string } | { error: string }> {
  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) {
    return {};
  }
  const result = await storeUpload(file);
  return result.ok ? { id: result.media.id } : { error: result.error };
}

export async function saveTrainerAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminAction();

  const parsed = trainerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  const uploaded = await readImage(formData);
  if ('error' in uploaded) {
    return fail(uploaded.error);
  }

  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  const editing = Number.isInteger(id) && id > 0 ? getTrainer(id) : null;

  // Keep the current portrait unless a new one was uploaded or it was cleared.
  const cleared = formData.get('remove_image') === 'on';
  const image = uploaded.id ?? (cleared ? null : (editing?.image ?? null));

  if (editing !== null) {
    updateTrainer(editing.id, { ...parsed.data, image });
    // A replaced or removed portrait leaves a file behind; drop it.
    if (editing.image !== null && editing.image !== image) {
      const old = getMedia(editing.image);
      if (old !== null) {
        await deleteUploadFile(old);
      }
    }
    refresh();
    return done('Edző mentve.');
  }

  createTrainer({ ...parsed.data, image });
  refresh();
  return done('Edző létrehozva.');
}

export async function archiveTrainerAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isInteger(id) && id > 0) {
    archiveTrainer(id);
    refresh();
  }
}

/* ---------------------------------------------------------------- gallery */

const gallerySchema = z.object({
  title: text(120).default(''),
  alt: text(240).default(''),
  sort_order: order,
  active: checkbox,
});

export async function saveGalleryAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminAction();

  const parsed = gallerySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  const uploaded = await readImage(formData);
  if ('error' in uploaded) {
    return fail(uploaded.error);
  }

  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  const editing = Number.isInteger(id) && id > 0 ? getGalleryItem(id) : null;

  if (editing !== null) {
    const image = uploaded.id ?? editing.image;
    updateGalleryItem(editing.id, { ...parsed.data, image });
    if (uploaded.id !== undefined && editing.image !== uploaded.id) {
      const old = getMedia(editing.image);
      if (old !== null) {
        await deleteUploadFile(old);
      }
    }
    refresh('/galeria');
    return done('Galéria elem mentve.');
  }

  if (uploaded.id === undefined) {
    return fail('Új galéria elemhez képet kell feltölteni.');
  }

  createGalleryItem({ ...parsed.data, image: uploaded.id });
  refresh('/galeria');
  return done('Kép hozzáadva a galériához.');
}

export async function archiveGalleryAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isInteger(id) && id > 0) {
    archiveGalleryItem(id);
    refresh('/galeria');
  }
}

/* ----------------------------------------------------------------- awards */

const awardSchema = z.object({
  title: text(160).min(1, 'A díj megnevezése kötelező.'),
  year: text(16).default(''),
  issuer: text(120).default(''),
  description: text(600).default(''),
  source_url: z.union([z.literal(''), z.string().trim().url('Érvénytelen forrás URL.')]).default(''),
  sort_order: order,
  active: checkbox,
});

export async function saveAwardAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminAction();

  const parsed = awardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isInteger(id) && id > 0) {
    updateAward(id, parsed.data);
    refresh();
    return done('Elismerés mentve.');
  }

  createAward(parsed.data);
  refresh();
  return done('Elismerés létrehozva.');
}

export async function archiveAwardAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isInteger(id) && id > 0) {
    archiveAward(id);
    refresh();
  }
}

/* ------------------------------------------------------------ legal pages */

const legalSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'A webcím (slug) kötelező.')
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'A slug csak kisbetűt, számot és kötőjelet tartalmazhat.'),
  title: text(160).min(1, 'A cím kötelező.'),
  content: z.string().max(60000).default(''),
  sort_order: order,
  active: checkbox,
});

export async function saveLegalAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminAction();

  const parsed = legalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  try {
    if (Number.isInteger(id) && id > 0) {
      updateLegalPage(id, parsed.data);
      refresh(`/jogi/${parsed.data.slug}`);
      return done('Jogi oldal mentve.');
    }
    createLegalPage(parsed.data);
    refresh(`/jogi/${parsed.data.slug}`);
    return done('Jogi oldal létrehozva.');
  } catch {
    // The only constraint that can fail here is the unique slug.
    return fail('Ezzel a webcímmel már létezik oldal.');
  }
}

export async function deleteLegalAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isInteger(id) && id > 0) {
    deleteLegalPage(id);
    refresh();
  }
}

/* --------------------------------------------------------------- settings */

/** Keys the settings screens may write. Anything else in the form is ignored. */
const SETTING_KEYS = [
  'site_name',
  'site_tagline',
  'contact_address',
  'contact_city',
  'contact_phone',
  'contact_email',
  'opening_hours',
  'social_facebook',
  'social_instagram',
  'map_embed_url',
  'about_heading',
  'about_intro',
  'about_body',
  'awards_intro',
] as const;

export async function saveSettingsAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminAction();

  const values: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    const value = formData.get(key);
    if (value !== null) {
      values[key] = String(value).trim().slice(0, 8000);
    }
  }

  for (const key of ['social_facebook', 'social_instagram', 'map_embed_url'] as const) {
    const value = values[key];
    if (value !== undefined && value !== '' && !/^https:\/\//.test(value)) {
      return fail('A hivatkozásoknak https:// címmel kell kezdődniük.');
    }
  }

  const email = values['contact_email'];
  if (email !== undefined && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail('Érvénytelen e-mail cím.');
  }

  setSettings(values);
  refresh();
  return done('Beállítások mentve.');
}
