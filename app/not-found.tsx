import Link from 'next/link';

/**
 * Global 404 — for URLs that match no route group, so it renders on the bare
 * document shell without the site's header and footer.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center">
      <div className="k-container">
        <p className="k-display-hero leading-none text-[var(--k-line-strong)]" aria-hidden="true">
          404
        </p>
        <h1 className="k-display-lg mt-6">Ez az oldal nincs meg.</h1>
        <p className="k-body-muted mt-6">Lehet, hogy elírtad a címet, vagy az oldal már nem létezik.</p>
        <Link
          href="/"
          className="mt-10 inline-flex h-14 items-center bg-[var(--k-red)] px-9 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--k-bone)] transition-colors hover:bg-[var(--k-red-hot)]"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </main>
  );
}
