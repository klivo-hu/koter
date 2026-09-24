/**
 * Draws the section-background textures from the gym's own materials: the
 * artificial turf strip and the steel tread plate. Both are procedural — drawn
 * from fixed seeds, so every run produces the same bytes — and both tile
 * seamlessly, so CSS can repeat them across a section of any size.
 *
 *   assets/textures/turf.webp   512×512  turf fibres, dark and desaturated
 *   assets/textures/metal.webp  960×960  dark diamond tread plate, rendered from a height field
 *
 * Run with: npm run assets:textures
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Imported by app/globals.css, so the build hashes them and caches them for a year.
const OUT = path.join(process.cwd(), 'assets', 'textures');

/** mulberry32 — a tiny seeded PRNG, so the textures are reproducible. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number): string => value.toFixed(1);

/* ------------------------------------------------------------------ turf */

const TURF_SIZE = 512;

interface FibreLayer {
  readonly count: number;
  /** HSL lightness range, in percent. Later layers are brighter: the fibre tips. */
  readonly light: readonly [number, number];
  readonly width: readonly [number, number];
  readonly length: readonly [number, number];
}

const FIBRE_LAYERS: readonly FibreLayer[] = [
  { count: 5200, light: [9, 17], width: [1.6, 2.4], length: [12, 24] },
  { count: 4200, light: [15, 26], width: [1.2, 2.0], length: [10, 22] },
  { count: 1700, light: [24, 38], width: [0.8, 1.4], length: [8, 18] },
];

function turfSvg(): string {
  const next = random(2015);
  const between = ([low, high]: readonly [number, number]): number => low + next() * (high - low);
  const S = TURF_SIZE;
  const paths: string[] = [];

  for (const layer of FIBRE_LAYERS) {
    for (let index = 0; index < layer.count; index += 1) {
      const x = next() * S;
      const y = next() * S;
      const length = between(layer.length);
      // The fibres lean one way, as turf does seen from standing height, with
      // enough scatter that no grain lines up into stripes.
      const angle = -Math.PI / 2 + (next() - 0.5) * 2.2;
      const bend = (next() - 0.5) * 0.8 * length;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      const cx = (x + x2) / 2 + Math.cos(angle + Math.PI / 2) * bend * 0.4;
      const cy = (y + y2) / 2 + Math.sin(angle + Math.PI / 2) * bend * 0.4;

      const hue = 98 + next() * 26;
      const saturation = 30 + next() * 22;
      const stroke = `hsl(${round(hue)} ${round(saturation)}% ${round(between(layer.light))}%)`;
      const width = round(between(layer.width));

      const minX = Math.min(x, x2, cx);
      const maxX = Math.max(x, x2, cx);
      const minY = Math.min(y, y2, cy);
      const maxY = Math.max(y, y2, cy);

      // A fibre that crosses an edge is drawn again on the opposite side, which
      // is what makes the tile seamless.
      for (const dx of [-S, 0, S]) {
        for (const dy of [-S, 0, S]) {
          if (minX + dx > S + 3 || maxX + dx < -3 || minY + dy > S + 3 || maxY + dy < -3) {
            continue;
          }
          paths.push(
            `<path d="M${round(x + dx)} ${round(y + dy)}Q${round(cx + dx)} ${round(cy + dy)} ${round(x2 + dx)} ${round(y2 + dy)}" stroke="${stroke}" stroke-width="${width}"/>`,
          );
        }
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">`,
    `<rect width="${S}" height="${S}" fill="hsl(112 34% 7%)"/>`,
    '<g fill="none" stroke-linecap="round">',
    ...paths,
    '</g></svg>',
  ].join('');
}

async function buildTurf(): Promise<void> {
  const target = path.join(OUT, 'turf.webp');
  const info = await sharp(Buffer.from(turfSvg()))
    .blur(0.4)
    .webp({ quality: 70, effort: 6 })
    .toFile(target);
  console.log(`turf.webp   ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}

/* ----------------------------------------------------------------- metal */

/*
 * Diamond tread plate, rendered rather than drawn. A height field — raised
 * lenses on a slightly uneven plate, with scratches cut into it — is lit the
 * way a renderer lights a material: diffuse and specular light from the upper
 * left, a cast shadow behind every lens, grime settled round their bases,
 * polished wear on their tops, a mottled mill finish and stains on the plate,
 * and straight scratches and scuffs from things dragged across it. Every noise
 * field is periodic over the tile and every stroke wraps, so it repeats without
 * a seam. The steel is dark on purpose; the highlights keep it reading as metal.
 */
const METAL_SIZE = 960;
const METAL_PITCH = 60; // 16 lenses per side; an even count keeps the checkerboard seamless
const METAL_ALBEDO = 0.3; // dark steel…
const METAL_SPECULAR = 0.7; // …that still catches the light

type Noise = (x: number, y: number, period: number) => number;

/** Perlin noise that repeats with any integer period: the basis of every seamless field. */
function periodicNoise(seed: number): Noise {
  const next = random(seed);
  const perm = Array.from({ length: 256 }, (_, index) => index);
  for (let index = 255; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    const held = perm[index] ?? 0;
    perm[index] = perm[swap] ?? 0;
    perm[swap] = held;
  }
  const gx = new Float64Array(256);
  const gy = new Float64Array(256);
  for (let index = 0; index < 256; index += 1) {
    const angle = next() * Math.PI * 2;
    gx[index] = Math.cos(angle);
    gy[index] = Math.sin(angle);
  }
  const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
  const corner = (ix: number, iy: number, dx: number, dy: number, period: number): number => {
    const px = ((ix % period) + period) % period;
    const py = ((iy % period) + period) % period;
    const hash = perm[((perm[px & 255] ?? 0) + py) & 255] ?? 0;
    return (gx[hash] ?? 0) * dx + (gy[hash] ?? 0) * dy;
  };
  return (x, y, period) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const u = fade(fx);
    const v = fade(fy);
    const n00 = corner(x0, y0, fx, fy, period);
    const n10 = corner(x0 + 1, y0, fx - 1, fy, period);
    const n01 = corner(x0, y0 + 1, fx, fy - 1, period);
    const n11 = corner(x0 + 1, y0 + 1, fx - 1, fy - 1, period);
    const top = n00 + u * (n10 - n00);
    const bottom = n01 + u * (n11 - n01);
    return top + v * (bottom - top);
  };
}

/** Fractal sum over the tile (x, y in 0..1). Each octave doubles an integer period, so it still wraps. */
function fbm(
  noise: Noise,
  x: number,
  y: number,
  period: number,
  octaves: number,
  gain = 0.5,
): number {
  let sum = 0;
  let amplitude = 1;
  let norm = 0;
  let p = period;
  for (let octave = 0; octave < octaves; octave += 1) {
    sum += amplitude * noise(x * p, y * p, p);
    norm += amplitude;
    amplitude *= gain;
    p *= 2;
  }
  return sum / norm;
}

const smoothstep = (low: number, high: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
};

const cell = (x: number, y: number): number =>
  (((y % METAL_SIZE) + METAL_SIZE) % METAL_SIZE) * METAL_SIZE +
  (((x % METAL_SIZE) + METAL_SIZE) % METAL_SIZE);

const sample = (field: Float32Array, x: number, y: number): number => field[cell(x, y)] ?? 0;

/** Box blur that wraps round the tile edges; three passes approximate a gaussian. */
function blur(field: Float32Array, radius: number, passes: number): Float32Array {
  const S = METAL_SIZE;
  const width = radius * 2 + 1;
  let source = field;
  for (let pass = 0; pass < passes; pass += 1) {
    const across = new Float32Array(S * S);
    const down = new Float32Array(S * S);
    for (let y = 0; y < S; y += 1) {
      let sum = 0;
      for (let k = -radius; k <= radius; k += 1) sum += sample(source, k, y);
      for (let x = 0; x < S; x += 1) {
        across[y * S + x] = sum / width;
        sum += sample(source, x + radius + 1, y) - sample(source, x - radius, y);
      }
    }
    for (let x = 0; x < S; x += 1) {
      let sum = 0;
      for (let k = -radius; k <= radius; k += 1) sum += sample(across, x, k);
      for (let y = 0; y < S; y += 1) {
        down[y * S + x] = sum / width;
        sum += sample(across, x, y + radius + 1) - sample(across, x, y - radius);
      }
    }
    source = down;
  }
  return source;
}

interface Lens {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  /** Half-length and half-width at the waist, in pixels. */
  readonly a: number;
  readonly w: number;
  readonly height: number;
  /** How polished the top is, 0..1. */
  readonly wear: number;
}

/** The raised lenses, one per cell, alternating diagonals, each slightly imperfect. */
function lensField(next: () => number): { height: Float32Array; top: Float32Array } {
  const S = METAL_SIZE;
  const P = METAL_PITCH;
  const count = S / P;
  const lenses: Lens[] = [];
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      const diagonal = (row + column) % 2 === 0 ? 45 : -45;
      lenses.push({
        x: (column + 0.5) * P + (next() - 0.5) * 1.4,
        y: (row + 0.5) * P + (next() - 0.5) * 1.4,
        angle: (diagonal + (next() - 0.5) * 3) * (Math.PI / 180),
        a: P * (0.445 + next() * 0.02),
        w: P * (0.125 + next() * 0.012),
        height: 5.2 * (0.92 + next() * 0.16),
        wear: 0.55 + next() * 0.45,
      });
    }
  }

  const height = new Float32Array(S * S);
  const top = new Float32Array(S * S);
  const SUB = 3; // 3×3 samples per pixel, so the rims are smooth
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const lens = lenses[Math.floor(y / P) * count + Math.floor(x / P)];
      if (lens === undefined) {
        continue;
      }
      const cos = Math.cos(lens.angle);
      const sin = Math.sin(lens.angle);
      let h = 0;
      let polish = 0;
      for (let sy = 0; sy < SUB; sy += 1) {
        for (let sx = 0; sx < SUB; sx += 1) {
          const dx = x + (sx + 0.5) / SUB - lens.x;
          const dy = y + (sy + 0.5) / SUB - lens.y;
          const along = (dx * cos + dy * sin) / lens.a;
          if (Math.abs(along) >= 1) {
            continue;
          }
          const half = lens.w * Math.sqrt(1 - along * along) * (1 - 0.35 * along * along);
          const across = Math.abs(-dx * sin + dy * cos) / half;
          if (across >= 1) {
            continue;
          }
          // A rounded ridge that tapers to points at both ends.
          const profile = Math.sqrt(1 - across * across) * Math.pow(1 - along * along, 0.15);
          h += lens.height * profile;
          polish += smoothstep(0.55, 0.95, profile) * lens.wear;
        }
      }
      height[y * S + x] = h / (SUB * SUB);
      top[y * S + x] = polish / (SUB * SUB);
    }
  }
  return { height, top };
}

/** Straight scratches plus a few scuffs — bundles of parallel ones, where something was dragged. */
function scratchField(next: () => number): Float32Array {
  const S = METAL_SIZE;
  const strokes: { x: number; y: number; length: number; angle: number }[] = [];
  for (let index = 0; index < 420; index += 1) {
    strokes.push({
      x: next() * S,
      y: next() * S,
      length: 12 + next() * next() * 280,
      angle: next() * Math.PI * 2,
    });
  }
  for (let index = 0; index < 14; index += 1) {
    const x = next() * S;
    const y = next() * S;
    const angle = next() * Math.PI * 2;
    const length = 90 + next() * 260;
    const lines = 5 + Math.floor(next() * 10);
    for (let line = 0; line < lines; line += 1) {
      const offset = (next() - 0.5) * 26;
      strokes.push({
        x: x - Math.sin(angle) * offset,
        y: y + Math.cos(angle) * offset,
        length: length * (0.5 + next() * 0.5),
        angle: angle + (next() - 0.5) * 0.04,
      });
    }
  }

  const scratches = new Float32Array(S * S);
  for (const stroke of strokes) {
    let { x, y, angle } = stroke;
    const curve = (next() - 0.5) * 0.0016;
    const width = 0.45 + next() * 0.7;
    const strength = 0.35 + next() * 0.65;
    for (let t = 0; t < stroke.length; t += 0.5) {
      x += Math.cos(angle) * 0.5;
      y += Math.sin(angle) * 0.5;
      angle += curve;
      const ends = Math.min(1, t / 8, (stroke.length - t) / 8);
      for (let oy = -2; oy <= 2; oy += 1) {
        for (let ox = -2; ox <= 2; ox += 1) {
          const px = Math.floor(x) + ox;
          const py = Math.floor(y) + oy;
          const distance = Math.hypot(px + 0.5 - x, py + 0.5 - y);
          const cover = Math.max(0, 1 - distance / (width + 0.5)) * strength * ends;
          const index = cell(px, py);
          if (cover > (scratches[index] ?? 0)) {
            scratches[index] = cover;
          }
        }
      }
    }
  }
  return scratches;
}

function renderMetal(): Buffer {
  const S = METAL_SIZE;
  const next = random(160);
  const { height, top } = lensField(next);
  const scratches = scratchField(next);

  const relief = periodicNoise(11);
  const grainNoise = periodicNoise(12);
  const mottleNoise = periodicNoise(13);
  const stainNoise = periodicNoise(14);
  const dustNoise = periodicNoise(15);
  const grain = new Float32Array(S * S);
  const mottle = new Float32Array(S * S);
  const stain = new Float32Array(S * S);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const u = x / S;
      const v = y / S;
      const index = y * S + x;
      grain[index] = fbm(grainNoise, u, v, 96, 2);
      mottle[index] =
        fbm(mottleNoise, u, v, 8, 5, 0.6) * 0.75 + fbm(mottleNoise, u, v, 2, 2) * 0.25;
      stain[index] =
        smoothstep(0.12, 0.5, fbm(stainNoise, u, v, 6, 5, 0.6)) * 0.55 +
        smoothstep(0.15, 0.45, fbm(dustNoise, u, v, 16, 3)) * 0.4;
      // The plate is not flat: a gentle roll, a fine grain, the grooves of the scratches.
      height[index] =
        (height[index] ?? 0) +
        fbm(relief, u, v, 8, 4) * 0.55 +
        (grain[index] ?? 0) * 0.12 -
        (scratches[index] ?? 0) * 0.35;
    }
  }
  const surface = blur(height, 1, 1);
  const neighbourhood = blur(surface, 4, 3);

  const light = [-0.48, -0.62, 0.62].map((c, _, all) => c / Math.hypot(...all)) as [
    number,
    number,
    number,
  ];
  const planar = Math.hypot(light[0], light[1]);
  const toLight = [light[0] / planar, light[1] / planar, light[2] / planar] as const;
  const half = [light[0], light[1], light[2] + 1].map((c, _, all) => c / Math.hypot(...all)) as [
    number,
    number,
    number,
  ];
  const toSrgb = (c: number): number =>
    Math.round(255 * Math.pow(Math.min(1, Math.max(0, c)), 1 / 2.2));

  const rgb = Buffer.alloc(S * S * 3);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const index = y * S + x;
      const h = surface[index] ?? 0;
      let nx = -(sample(surface, x + 1, y) - sample(surface, x - 1, y)) / 2;
      let ny = -(sample(surface, x, y + 1) - sample(surface, x, y - 1)) / 2;
      let nz = 1;
      const length = Math.hypot(nx, ny, nz);
      nx /= length;
      ny /= length;
      nz /= length;

      // Cast shadow: walk toward the light and see whether a lens rises above the ray.
      let occlusion = 0;
      for (let t = 1; t <= 18; t += 1) {
        const above =
          sample(surface, Math.round(x + toLight[0] * t), Math.round(y + toLight[1] * t)) -
          (h + t * toLight[2]);
        occlusion = Math.max(occlusion, above);
      }
      const shadow = 1 - 0.72 * Math.min(1, occlusion / 1.4);
      const cavity = Math.max(0, (neighbourhood[index] ?? 0) - h);
      const ambientOcclusion = 1 - Math.min(0.5, cavity * 0.16);

      const polish = top[index] ?? 0;
      const scratch = scratches[index] ?? 0;
      const dirt = stain[index] ?? 0;
      const diffuse = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
      const gloss = 14 + 70 * polish + 50 * scratch;
      const specular =
        Math.pow(Math.max(0, nx * half[0] + ny * half[1] + nz * half[2]), gloss) *
        (0.22 + 0.45 * polish + 0.4 * scratch) *
        (1 - 0.6 * dirt) *
        (gloss / 30);
      // Reflected surroundings: brighter overhead, darker toward the floor.
      const environment = 0.3 + 0.5 * smoothstep(-0.5, 0.5, -2 * nz * ny);

      let albedo = 0.5 + 0.22 * (mottle[index] ?? 0) + 0.07 * (grain[index] ?? 0);
      albedo *= 1 - 0.45 * dirt - 0.35 * Math.min(1, cavity * 0.25);
      albedo += 0.16 * polish + 0.22 * scratch;
      const lit =
        albedo * (0.24 * environment + 0.76 * diffuse * shadow) * ambientOcclusion * METAL_ALBEDO;
      const shine = specular * METAL_SPECULAR;

      rgb[index * 3] = toSrgb(lit * (0.97 + 0.05 * dirt) + shine * 0.9);
      rgb[index * 3 + 1] = toSrgb(lit * 0.99 + shine * 0.95);
      rgb[index * 3 + 2] = toSrgb(lit * (1.03 - 0.07 * dirt) + shine);
    }
  }
  return rgb;
}

async function buildMetal(): Promise<void> {
  const target = path.join(OUT, 'metal.webp');
  const info = await sharp(renderMetal(), {
    raw: { width: METAL_SIZE, height: METAL_SIZE, channels: 3 },
  })
    .webp({ quality: 62, effort: 6 })
    .toFile(target);
  console.log(`metal.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}

await fs.mkdir(OUT, { recursive: true });
await buildTurf();
await buildMetal();
