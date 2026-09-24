/**
 * Builds the two self-hosted typefaces: Archivo for display and Inter for text,
 * each cut down to exactly the characters the site sets — Basic Latin,
 * Latin-1, the Hungarian Ő ő Ű ű and a handful of typographic marks — with
 * their variable axes intact (Archivo keeps width and weight, Inter weight).
 * The API ignores narrower axis ranges for a text subset, so the full ranges
 * are requested.
 *
 * Google's own split would serve each family as `latin` plus `latin-ext`: four
 * preloaded files, about 300 KB, where the second half of every pair is mostly
 * Vietnamese and Central European letters Hungarian never uses except ő and ű.
 * These are two files, fetched once from the Google Fonts API (both faces are
 * OFL), which cuts a subset for the `text` it is given.
 *
 *   assets/fonts/archivo.woff2   Archivo, wdth 62–125, wght 100–900
 *   assets/fonts/inter.woff2     Inter, wght 100–900
 *
 * A character outside the set still renders, in the metric-matched fallback.
 *
 * Run with: npm run assets:fonts
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'assets', 'fonts');

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

const CHARACTERS =
  String.fromCodePoint(...range(0x20, 0x7e)) + // Basic Latin
  String.fromCodePoint(...range(0xa0, 0xff)) + // Latin-1: á é í ó ö ú ü and capitals, ©, ×
  'ŐőŰű' + // the Hungarian double acutes, the only letters needed beyond Latin-1
  '–—‘’‚“”„•…€™→↗−≈'; // typographic marks

const FAMILIES = [
  { file: 'archivo.woff2', family: 'Archivo:wdth,wght@62..125,100..900' },
  { file: 'inter.woff2', family: 'Inter:wght@100..900' },
] as const;

// The API picks the font format from the user agent; a current browser gets woff2.
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const text = encodeURIComponent(CHARACTERS);

await fs.mkdir(OUT, { recursive: true });

for (const { file, family } of FAMILIES) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${text}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!css.ok) {
    throw new Error(`${family}: the Google Fonts API answered ${css.status}`);
  }
  const url = /url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/.exec(await css.text())?.[1];
  if (url === undefined) {
    throw new Error(`${family}: no woff2 source in the stylesheet`);
  }
  const font = Buffer.from(await (await fetch(url)).arrayBuffer());
  await fs.writeFile(path.join(OUT, file), font);
  console.log(`${file.padEnd(14)} ${(font.length / 1024).toFixed(1)} KB`);
}
