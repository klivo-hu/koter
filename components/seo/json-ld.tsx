import { cspNonce } from '@/lib/nonce';

/**
 * Emits structured data as an inline script carrying the request's CSP nonce.
 *
 * The payload is always an object this codebase built from database values and
 * then serialised — never a string from a request — so JSON.stringify output is
 * the only thing that ever reaches the tag.
 */
export async function JsonLd({ data }: { data: unknown }): Promise<React.JSX.Element> {
  const nonce = await cspNonce();
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // The browser clears a nonce attribute's value once the document is parsed
      // (so a page cannot read its own nonce back out), which makes the client
      // see "" where the server sent a value. The tag is inert metadata and is
      // never re-rendered, so the difference is expected rather than a defect.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
