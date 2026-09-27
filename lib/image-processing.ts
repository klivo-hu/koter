import sharp from 'sharp';

/**
 * Process-wide image-processing settings, applied once at server start (see
 * instrumentation.ts). They reach every sharp caller in the process — the
 * Next.js image optimiser as much as lib/uploads.ts — because libvips, the
 * library underneath sharp, holds this state globally.
 *
 * libvips keeps recently used operations and their pixel buffers in a cache of
 * its own (up to 50 MB by default), for pipelines that repeat work. Nothing here
 * does: the optimiser stores every finished image on disk and never re-encodes
 * it, and an upload is processed once. The cache would only hold memory —
 * measured on the production image, turning it off lowers what the server keeps
 * after a burst of image requests by ≈30 MB.
 */
export function configureImageProcessing(): void {
  sharp.cache(false);
}
