/**
 * Asset preparation — run once, at authoring time (`npm run assets:prepare`).
 *
 * The client's original photographs live in ./source-assets as multi-hundred-KB
 * JPEGs straight off a phone. Shipping those would blow the image budget, so
 * this script derives what the site actually serves:
 *
 *   • site images  -> ./assets/*.webp          (statically imported by next/image,
 *                                               which then emits srcset + AVIF/WebP
 *                                               and its own blur placeholder)
 *   • gallery      -> ./public/gallery/*.webp  (database-driven, so metadata and a
 *                                               blur placeholder are emitted next to
 *                                               them for the seeder)
 *   • logo         -> ./assets/koter-logo.png  (black background keyed out to alpha;
 *                                               koter-logo-large.png at twice the size
 *                                               for the intro curtain)
 *   • hero poster  -> ./public/hero-poster.jpg (the <video> poster; must be a real
 *                                               file, not a static import)
 *
 * The gallery set and the site-section set are disjoint on purpose: no photograph
 * appears both in a section and in the gallery.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'source-assets');
const ASSETS = path.join(ROOT, 'assets');
const PUBLIC_GALLERY = path.join(ROOT, 'public', 'gallery');
const GENERATED = path.join(ROOT, 'lib', 'generated');

/** Photographs used inside site sections. Never repeated in the gallery. */
const SITE_IMAGES: ReadonlyArray<{ file: string; out: string; width: number }> = [
  { file: 'terem4.jpg', out: 'hero', width: 2400 },
  { file: 'terem3.jpg', out: 'intro', width: 1800 },
  { file: 'fogllakozas2.jpg', out: 'crossfight', width: 1800 },
  { file: 'foglalkozas6.jpg', out: 'classes', width: 1800 },
  { file: 'rolunk.jpg', out: 'team-main', width: 2200 },
  { file: 'rolunk3.jpg', out: 'team-second', width: 1600 },
  { file: 'dija1.jpg', out: 'award', width: 1600 },
];

/** Photographs reserved for the gallery. Disjoint from SITE_IMAGES. */
const GALLERY_IMAGES: ReadonlyArray<{ file: string; title: string; alt: string }> = [
  { file: 'terem1.jpg', title: 'Géptermi szárny', alt: 'A Kóter Gym géptermi szárnya súlyzókkal és gépsorral' },
  { file: 'terem5.jpg', title: 'Gépsor', alt: 'Erőgépek sora a Kóter Gym edzőtermében' },
  { file: 'terem2.jpg', title: 'A terem', alt: 'Enteriőr részletek a Kóter Gym edzőterméből és a recepcióról' },
  { file: 'montázs1.jpg', title: 'Kóter Gym 2015', alt: 'Montázs a Kóter Gym termeiről a klub emblémájával' },
  { file: 'foglalkozas1.jpg', title: 'Gyerekedzés', alt: 'Gyerekek fekvőtámaszt csinálnak a Kóter Gym küzdőtermében' },
  { file: 'foglalkozas2.jpg', title: 'Nyári tábor', alt: 'A Kóter Gym gyerekcsapata a klub zászlajával a szabadban' },
  { file: 'foglalkozas3.jpg', title: 'Tánctermi óra', alt: 'Tánctermi foglalkozás a Kóter Gym nagytermében' },
  { file: 'foglalkozas4.jpg', title: 'The Lab csapat', alt: 'A The Lab tánciskola csoportja a Kóter Gym termében' },
  { file: 'foglalkozas5.jpg', title: 'Koreográfia', alt: 'Táncosok gyakorolnak a Kóter Gym tánctermében' },
  { file: 'rolunk2.jpg', title: 'Versenycsapat', alt: 'A Kóter Gym versenyzői érmekkel és oklevelekkel' },
];

const WEBP = { quality: 82, effort: 5 } as const;

async function ensure(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** A 20px-wide WebP, inlined as a data URL — the placeholder that prevents any flash. */
async function blurPlaceholder(input: string): Promise<string> {
  const buffer = await sharp(input).resize(20, null, { fit: 'inside' }).webp({ quality: 45 }).toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

async function buildSiteImages(): Promise<void> {
  await ensure(ASSETS);
  for (const image of SITE_IMAGES) {
    const from = path.join(SRC, image.file);
    const to = path.join(ASSETS, `${image.out}.webp`);
    await sharp(from)
      .rotate()
      .resize({ width: image.width, withoutEnlargement: true })
      .webp(WEBP)
      .toFile(to);
    const { size } = await fs.stat(to);
    console.log(`site    ${image.out.padEnd(12)} ${(size / 1024).toFixed(0).padStart(5)} KB`);
  }

  // The <video> poster has to be a real file the browser can fetch before hydration.
  await sharp(path.join(SRC, 'terem4.jpg'))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 68, progressive: true, mozjpeg: true })
    .toFile(path.join(ROOT, 'public', 'hero-poster.jpg'));
  console.log('poster  public/hero-poster.jpg');
}

async function buildGallery(): Promise<void> {
  await ensure(PUBLIC_GALLERY);
  await ensure(GENERATED);

  const records: string[] = [];
  let order = 0;

  for (const item of GALLERY_IMAGES) {
    const from = path.join(SRC, item.file);
    const slug = path.basename(item.file, path.extname(item.file)).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const to = path.join(PUBLIC_GALLERY, `${slug}.webp`);

    const info = await sharp(from)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp(WEBP)
      .toFile(to);

    const blur = await blurPlaceholder(from);
    const { size } = await fs.stat(to);
    order += 10;

    records.push(
      `  {
    id: 'seed-${slug}',
    url: '/gallery/${slug}.webp',
    filename: '${slug}.webp',
    width: ${info.width},
    height: ${info.height},
    bytes: ${size},
    blur: '${blur}',
    title: ${JSON.stringify(item.title)},
    alt: ${JSON.stringify(item.alt)},
    sortOrder: ${order},
  },`,
    );
    console.log(`gallery ${slug.padEnd(14)} ${info.width}x${info.height}  ${(size / 1024).toFixed(0).padStart(5)} KB`);
  }

  const file = `/**
 * Generated by scripts/prepare-assets.ts — do not edit by hand.
 * Metadata for the bundled gallery photographs the database is seeded with.
 */
export interface SeedMedia {
  readonly id: string;
  readonly url: string;
  readonly filename: string;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly blur: string;
  readonly title: string;
  readonly alt: string;
  readonly sortOrder: number;
}

export const SEED_GALLERY: readonly SeedMedia[] = [
${records.join('\n')}
];
`;
  await fs.writeFile(path.join(GENERATED, 'seed-media.ts'), file, 'utf8');
  console.log(`\nwrote lib/generated/seed-media.ts (${GALLERY_IMAGES.length} items)`);
}

/**
 * The supplied logo is white artwork on a solid black JPEG. Keying the black out
 * to alpha lets it sit on any surface without a visible box around it.
 *
 * Two sizes: the header and footer mark at the source's own resolution, and a
 * large one for the intro curtain, where the mark is set several times bigger.
 * The source is only 447px square, so the large one is resampled up (Lanczos)
 * *before* keying — the key then produces clean edges, where a browser scaling
 * the small file up would blur them.
 */
async function buildLogoFile(scale: number, file: string): Promise<void> {
  const from = path.join(SRC, 'koterlogo.jpg');
  const { width = 0 } = await sharp(from).metadata();
  const base = sharp(from)
    .rotate()
    .resize(
      scale === 1
        ? { width: 640, withoutEnlargement: true }
        : { width: Math.round(width * scale), kernel: 'lanczos3' },
    );
  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    // Luminance drives alpha: pure black disappears, white artwork stays opaque.
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const alpha = Math.max(0, Math.min(255, Math.round((luma - 18) * (255 / (235 - 18)))));
    rgba[o] = 255;
    rgba[o + 1] = 255;
    rgba[o + 2] = 255;
    rgba[o + 3] = alpha;
  }

  const out = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 2 })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(ASSETS, file));

  console.log(`logo    assets/${file} ${out.width}×${out.height} (black keyed to alpha)`);
}

async function buildLogo(): Promise<void> {
  await buildLogoFile(1, 'koter-logo.png');
  await buildLogoFile(2, 'koter-logo-large.png');
}

const STEPS = { site: buildSiteImages, gallery: buildGallery, logo: buildLogo } as const;
type Step = keyof typeof STEPS;

const isStep = (name: string): name is Step => Object.hasOwn(STEPS, name);

/**
 * Every step by default. Name steps to run only those, e.g.
 * `npm run assets:prepare -- logo` rebuilds the logos without re-encoding a photo.
 */
async function main(): Promise<void> {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((name) => !isStep(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown step: ${unknown.join(', ')}. Available: ${Object.keys(STEPS).join(', ')}.`);
  }
  const steps = requested.length === 0 ? (Object.keys(STEPS) as Step[]) : requested.filter(isStep);

  console.log('Preparing Kóter Gym assets…\n');
  for (const step of steps) {
    await STEPS[step]();
    console.log('');
  }
  console.log('Done.');
}

await main();
