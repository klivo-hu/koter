import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { UPLOAD_DIR } from '@/lib/env';

/**
 * Serves an uploaded image.
 *
 * Uploads live on a writable volume outside the build, so they cannot be served
 * from /public. This route is the only way out of that directory, and it is
 * deliberately narrow: the request may name a file, never a path. The name is
 * pattern-checked, reduced to its basename, resolved, and then re-checked to be
 * inside the upload directory — so `..`, an absolute path or an encoded
 * separator all end at a 404 rather than at a file elsewhere on disk.
 *
 * Files are content-addressed by a random id and never overwritten, so they are
 * safe to cache immutably.
 */

const NAME = /^[A-Za-z0-9_-]{1,64}\.webp$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<NextResponse> {
  const { file } = await params;

  if (!NAME.test(file)) {
    return new NextResponse(null, { status: 404 });
  }

  const root = path.resolve(UPLOAD_DIR);
  const target = path.resolve(root, path.basename(file));
  if (target !== path.join(root, path.basename(file))) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const bytes = await fs.readFile(target);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
