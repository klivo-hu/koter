/**
 * Generates the favicon set from the club's own logo — nothing is drawn or
 * invented here, the mark is just placed on the brand's black and padded.
 *
 *   app/icon.png        512×512, used by Next.js for <link rel="icon">
 *   app/apple-icon.png  180×180, iOS home screen
 *   app/favicon.ico     48×48 PNG wrapped in an ICO container, so a browser
 *                       asking for /favicon.ico directly gets a real file
 *                       instead of a 404
 *
 * Run with: npm run assets:icons
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const LOGO = path.join(ROOT, 'assets', 'koter-logo.png');
const INK = { r: 6, g: 6, b: 7, alpha: 1 };

/** The logo centred on the brand ground, with breathing room around it. */
async function icon(size: number): Promise<Buffer> {
  const inner = Math.round(size * 0.78);
  const mark = await sharp(LOGO)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Wraps a single PNG in an ICO container (the PNG-in-ICO form every browser reads). */
function ico(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.byteLength, 8);
  entry.writeUInt32LE(header.byteLength + entry.byteLength, 12);

  return Buffer.concat([header, entry, png]);
}

async function main(): Promise<void> {
  const app = path.join(ROOT, 'app');

  await fs.writeFile(path.join(app, 'icon.png'), await icon(512));
  await fs.writeFile(path.join(app, 'apple-icon.png'), await icon(180));
  await fs.writeFile(path.join(app, 'favicon.ico'), ico(await icon(48), 48));

  console.log('wrote app/icon.png, app/apple-icon.png, app/favicon.ico');
}

await main();
