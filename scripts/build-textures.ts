/**
 * Builds the section-background textures from the gym's own materials: the
 * artificial turf strip and the steel tread plate. Both tile seamlessly, so CSS
 * can repeat them across a section of any size, and both come out the same on
 * every run.
 *
 *   assets/textures/turf.webp   512×512  turf fibres, procedural, dark and desaturated
 *   assets/textures/metal.webp  1024 px  diamond tread plate, derived from source-assets/metal-plate.jpg
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
 * Diamond tread plate, from a photograph rather than drawn.
 *
 * The source (source-assets/metal-plate.jpg) is a photoreal render of worn
 * steel plate — generated with Higgsfield (Seedream 5.0 Flash), because there is
 * no usable close-up of the gym's own floor. A picture like that does not tile:
 * its edges are a frame, and it is lit from one corner. So the tile is derived:
 *
 *   1. The lens lattice's period is measured on each axis by autocorrelation.
 *   2. An interior window is cut that spans a whole, even number of periods,
 *      chosen where the image best matches itself one window further on — so
 *      the lenses meet their neighbours across every edge.
 *   3. The corner-to-corner lighting is fitted with a smooth surface and divided
 *      out, so repeats do not step in brightness. CSS adds its own falloff.
 *   4. Each axis is cross-faded near its edges with a copy of itself shifted by
 *      half a window. Half a window is a whole number of periods, so the lenses
 *      coincide and only the scratches and grime blend, and the copy's edges are
 *      the window's continuous middle — every edge now runs into its opposite.
 */
const METAL_SOURCE = path.join(process.cwd(), 'source-assets', 'metal-plate.jpg');
/** The frame and the cut lenses round the source's edge are never sampled. */
const METAL_MARGIN = 56;
/** Lattice periods, in source pixels, the search looks between. */
const METAL_PERIOD_RANGE: readonly [number, number] = [160, 420];
/** Share of the window, on each side, over which the shifted copy fades in. */
const METAL_SEAM = 0.2;
/** Width of the delivered tile, in pixels; CSS draws it at a little over half this. */
const METAL_WIDTH = 1024;

interface Plane {
  readonly width: number;
  readonly height: number;
  readonly data: Float32Array;
  readonly channels: 1 | 2 | 3 | 4;
}

const at = (plane: Plane, x: number, y: number, channel = 0): number =>
  plane.data[(y * plane.width + x) * plane.channels + channel] ?? 0;

/** Mean absolute difference between the plate and itself moved `shift` pixels along one axis. */
function mismatch(grey: Plane, shift: number, axis: 'x' | 'y'): number {
  const x1 = grey.width - METAL_MARGIN - (axis === 'x' ? shift : 0);
  const y1 = grey.height - METAL_MARGIN - (axis === 'y' ? shift : 0);
  let sum = 0;
  let count = 0;
  for (let y = METAL_MARGIN; y < y1; y += 3) {
    for (let x = METAL_MARGIN; x < x1; x += 3) {
      const moved = axis === 'x' ? at(grey, x + shift, y) : at(grey, x, y + shift);
      sum += Math.abs(at(grey, x, y) - moved);
      count += 1;
    }
  }
  return count === 0 ? Number.POSITIVE_INFINITY : sum / count;
}

function bestShift(grey: Plane, axis: 'x' | 'y', from: number, to: number): number {
  let best = from;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let shift = from; shift <= to; shift += 1) {
    const score = mismatch(grey, shift, axis);
    if (score < bestScore) {
      bestScore = score;
      best = shift;
    }
  }
  return best;
}

/**
 * The window length on one axis: the lattice period, then the even multiple of
 * it that still fits inside the margins, refined to where the plate repeats best.
 */
function windowLength(grey: Plane, axis: 'x' | 'y'): number {
  const size = axis === 'x' ? grey.width : grey.height;
  const period = bestShift(grey, axis, METAL_PERIOD_RANGE[0], METAL_PERIOD_RANGE[1]);
  const usable = size - METAL_MARGIN * 2;
  const periods = Math.floor(usable / period / 2) * 2;
  if (periods < 2) {
    throw new Error(`metal: the source is too small for its ${period}px lattice on the ${axis} axis`);
  }
  const target = periods * period;
  const slack = Math.min(24, Math.floor((usable - target) / 2) + 12);
  const length = bestShift(grey, axis, target - slack, Math.min(usable, target + slack));
  console.log(`metal       ${axis}: period ${period}px, window ${length}px (${periods} periods)`);
  return length;
}

/** Solves A·x = b in place (Gaussian elimination with partial pivoting). */
function solve(matrix: number[][], vector: number[]): number[] {
  const n = vector.length;
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(matrix[row]?.[column] ?? 0) > Math.abs(matrix[pivot]?.[column] ?? 0)) {
        pivot = row;
      }
    }
    [matrix[column], matrix[pivot]] = [matrix[pivot] ?? [], matrix[column] ?? []];
    [vector[column], vector[pivot]] = [vector[pivot] ?? 0, vector[column] ?? 0];
    const head = matrix[column] ?? [];
    for (let row = column + 1; row < n; row += 1) {
      const current = matrix[row] ?? [];
      const factor = (current[column] ?? 0) / (head[column] ?? 1);
      for (let k = column; k < n; k += 1) {
        current[k] = (current[k] ?? 0) - factor * (head[k] ?? 0);
      }
      vector[row] = (vector[row] ?? 0) - factor * (vector[column] ?? 0);
    }
  }
  const result = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = vector[row] ?? 0;
    for (let k = row + 1; k < n; k += 1) {
      sum -= (matrix[row]?.[k] ?? 0) * (result[k] ?? 0);
    }
    result[row] = sum / (matrix[row]?.[row] ?? 1);
  }
  return result;
}

/** Terms of the quadratic lighting surface at normalised coordinates u, v in 0..1. */
const terms = (u: number, v: number): number[] => [1, u, v, u * u, v * v, u * v];

/**
 * Least-squares fit of a smooth quadratic surface to the window's brightness.
 * A surface this stiff follows the lighting and ignores the lenses and the dirt.
 */
function lightingSurface(grey: Plane): (u: number, v: number) => number {
  const normal = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
  const target = new Array<number>(6).fill(0);
  for (let y = 0; y < grey.height; y += 4) {
    for (let x = 0; x < grey.width; x += 4) {
      const row = terms(x / grey.width, y / grey.height);
      const value = at(grey, x, y);
      for (let i = 0; i < 6; i += 1) {
        target[i] = (target[i] ?? 0) + (row[i] ?? 0) * value;
        const line = normal[i] ?? [];
        for (let j = 0; j < 6; j += 1) {
          line[j] = (line[j] ?? 0) + (row[i] ?? 0) * (row[j] ?? 0);
        }
      }
    }
  }
  const coefficients = solve(normal, target);
  return (u, v) => terms(u, v).reduce((sum, term, index) => sum + term * (coefficients[index] ?? 0), 0);
}

const smoothstep = (low: number, high: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
};

/** 1 across the middle of an axis, easing to 0 over the outer METAL_SEAM of it on both sides. */
const edgeWeight = (index: number, length: number): number =>
  smoothstep(0, METAL_SEAM, Math.min(index, length - 1 - index) / length);

/** Cross-fades a plane with itself shifted by half its length along one axis. */
function wrapAxis(plane: Plane, axis: 'x' | 'y'): Plane {
  const { width, height, channels } = plane;
  const data = new Float32Array(plane.data.length);
  const half = Math.round((axis === 'x' ? width : height) / 2);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const weight = axis === 'x' ? edgeWeight(x, width) : edgeWeight(y, height);
      const sx = axis === 'x' ? (x + half) % width : x;
      const sy = axis === 'y' ? (y + half) % height : y;
      for (let channel = 0; channel < channels; channel += 1) {
        data[(y * width + x) * channels + channel] =
          at(plane, x, y, channel) * weight + at(plane, sx, sy, channel) * (1 - weight);
      }
    }
  }
  return { width, height, channels, data };
}

async function readPlane(image: ReturnType<typeof sharp>): Promise<Plane> {
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, channels: info.channels, data: Float32Array.from(data) };
}

async function buildMetal(): Promise<void> {
  const source = sharp(METAL_SOURCE).removeAlpha();
  const { width = 0, height = 0 } = await source.metadata();

  const grey = await readPlane(source.clone().greyscale());
  const windowWidth = windowLength(grey, 'x');
  const windowHeight = windowLength(grey, 'y');
  const region = {
    left: Math.round((width - windowWidth) / 2),
    top: Math.round((height - windowHeight) / 2),
    width: windowWidth,
    height: windowHeight,
  };

  const colour = await readPlane(source.clone().extract(region));
  const light = lightingSurface(await readPlane(source.clone().extract(region).greyscale()));
  const mean = light(0.5, 0.5);
  const flat = new Float32Array(colour.data.length);
  for (let y = 0; y < colour.height; y += 1) {
    for (let x = 0; x < colour.width; x += 1) {
      const gain = mean / Math.max(1, light(x / colour.width, y / colour.height));
      for (let channel = 0; channel < colour.channels; channel += 1) {
        const index = (y * colour.width + x) * colour.channels + channel;
        flat[index] = (colour.data[index] ?? 0) * gain;
      }
    }
  }

  const tile = wrapAxis(wrapAxis({ ...colour, data: flat }, 'x'), 'y');
  const bytes = Buffer.alloc(tile.data.length);
  for (let index = 0; index < tile.data.length; index += 1) {
    bytes[index] = Math.max(0, Math.min(255, Math.round(tile.data[index] ?? 0)));
  }

  const target = path.join(OUT, 'metal.webp');
  const info = await sharp(bytes, { raw: { width: tile.width, height: tile.height, channels: tile.channels } })
    .resize({ width: METAL_WIDTH, kernel: 'lanczos3' })
    .webp({ quality: 58, effort: 6, smartSubsample: true })
    .toFile(target);
  console.log(`metal.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}

await fs.mkdir(OUT, { recursive: true });
await buildTurf();
await buildMetal();
