import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp, { type Metadata, type OutputInfo, type Sharp } from 'sharp';
import { MAX_UPLOAD_BYTES, UPLOAD_DIR } from '@/lib/env';
import { insertMedia } from '@/lib/repositories';
import type { MediaRecord } from '@/lib/types';

/**
 * Image ingestion.
 *
 * Nothing the browser claims is trusted. The bytes are decoded by sharp, which
 * fails on anything that is not a real raster image, and only then re-encoded to
 * WebP. That re-encode is what makes the upload safe: a polyglot file, an SVG
 * with a script, or an executable renamed to .jpg never survives it, and the
 * stored file is always a freshly written WebP with a generated name.
 */

const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 12000;
const OUTPUT_MAX_EDGE = 2400;

export interface UploadFailure {
  readonly ok: false;
  readonly error: string;
}

export interface UploadSuccess {
  readonly ok: true;
  readonly media: MediaRecord;
}

export type UploadResult = UploadSuccess | UploadFailure;

function fail(error: string): UploadFailure {
  return { ok: false, error };
}

export async function storeUpload(file: File): Promise<UploadResult> {
  if (file.size === 0) {
    return fail('A fájl üres.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return fail(`A fájl túl nagy (max. ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).`);
  }
  if (!ACCEPTED.has(file.type)) {
    return fail('Csak JPEG, PNG, WebP, AVIF vagy GIF tölthető fel.');
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  let pipeline: Sharp;
  let metadata: Metadata;
  try {
    // `limitInputPixels` caps decompression-bomb inputs before any work happens.
    pipeline = sharp(bytes, { limitInputPixels: MAX_DIMENSION * MAX_DIMENSION, failOn: 'error' });
    metadata = await pipeline.metadata();
  } catch {
    return fail('A fájl nem értelmezhető képként.');
  }

  const { width, height, format } = metadata;
  if (width === undefined || height === undefined || format === undefined) {
    return fail('A kép méretei nem olvashatók ki.');
  }
  // The real, decoded format has to match one we accept — not the declared type.
  if (!['jpeg', 'png', 'webp', 'avif', 'gif'].includes(format)) {
    return fail('Nem támogatott képformátum.');
  }
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return fail(`A kép túl kicsi (legalább ${MIN_DIMENSION}×${MIN_DIMENSION} képpont kell).`);
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return fail(`A kép túl nagy (legfeljebb ${MAX_DIMENSION} képpont oldalanként).`);
  }

  const id = randomBytes(12).toString('base64url');
  const filename = `${id}.webp`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  let output: OutputInfo;
  try {
    output = await sharp(bytes, { limitInputPixels: MAX_DIMENSION * MAX_DIMENSION })
      .rotate() // honour EXIF orientation, then drop all metadata (incl. GPS)
      .resize({ width: OUTPUT_MAX_EDGE, height: OUTPUT_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    // The visitor-facing message stays generic; the cause belongs in the server log.
    console.error('[uploads] A kép WebP-re alakítása nem sikerült:', error);
    return fail('A kép feldolgozása nem sikerült.');
  }

  // A 20px-wide preview, inlined into the markup, so the layout never flashes.
  const blurBuffer = await sharp(bytes).resize(20, null, { fit: 'inside' }).webp({ quality: 45 }).toBuffer();

  const media: MediaRecord = {
    id,
    url: `/api/media/${filename}`,
    kind: 'upload',
    filename,
    mime: 'image/webp',
    width: output.width,
    height: output.height,
    bytes: output.size,
    blur: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
    created_at: '',
  };

  insertMedia(media);
  return { ok: true, media };
}

/** Removes an uploaded file from disk. Bundled assets are left alone. */
export async function deleteUploadFile(record: MediaRecord): Promise<void> {
  if (record.kind !== 'upload') {
    return;
  }
  // Defend against a crafted filename ever escaping the upload directory.
  const target = path.resolve(UPLOAD_DIR, path.basename(record.filename));
  if (!target.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    return;
  }
  await fs.rm(target, { force: true });
}
