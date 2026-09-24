import { headers } from 'next/headers';

/**
 * The per-request CSP nonce minted by middleware.ts.
 *
 * Any inline <script> a server component emits (the JSON-LD blocks) must carry
 * it, or the browser will refuse to run it under the nonce-based policy.
 */
export async function cspNonce(): Promise<string | undefined> {
  return (await headers()).get('x-nonce') ?? undefined;
}
