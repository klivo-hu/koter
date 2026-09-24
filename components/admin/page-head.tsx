export function AdminPageHead({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <header className="mb-10 flex flex-col justify-between gap-6 border-b border-[var(--k-line)] pb-8 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--k-bone)] lg:text-3xl">{title}</h1>
        {description !== undefined && <p className="mt-2 max-w-xl text-sm text-[var(--k-muted)]">{description}</p>}
      </div>
      {children}
    </header>
  );
}

/** The padded column every admin screen sits in. */
export function AdminPage({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10 lg:py-14">{children}</div>;
}
