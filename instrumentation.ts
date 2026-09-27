/**
 * Runs once when the server starts, before it handles its first request.
 *
 * Only the Node.js server processes images; the middleware runs on the edge
 * runtime, which has no sharp. The Node-only setup therefore lives in its own
 * module, imported behind the runtime check so the edge bundle never pulls it in.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { configureImageProcessing } = await import('./lib/image-processing');
    configureImageProcessing();
  }
}
