/**
 * Renders the admin's legal copy.
 *
 * A deliberately tiny subset of Markdown — headings, blockquotes, list items and
 * paragraphs — parsed into React elements. Nothing is ever passed to
 * dangerouslySetInnerHTML, so whatever is typed into the admin editor is text and
 * can never become markup: stored XSS has no route in.
 */

type Block =
  | { kind: 'h2' | 'h3'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'p'; text: string };

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  const chunks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (trimmed === '') {
      continue;
    }

    const lines = trimmed.split('\n').map((line) => line.trim());

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      blocks.push({ kind: 'list', items: lines.map((line) => line.replace(/^[-*]\s+/, '')) });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: trimmed.slice(4) });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ kind: 'h2', text: trimmed.slice(2) });
      continue;
    }
    if (trimmed.startsWith('> ')) {
      blocks.push({ kind: 'quote', text: lines.map((line) => line.replace(/^>\s?/, '')).join(' ') });
      continue;
    }
    blocks.push({ kind: 'p', text: trimmed });
  }

  return blocks;
}

/** Strips the bold markers the seed copy uses; emphasis is carried by the styling. */
function clean(text: string): string {
  return text.replace(/\*\*/g, '');
}

export function RichText({ content }: { content: string }): React.JSX.Element {
  const blocks = parse(content);

  return (
    <div className="flex flex-col gap-7">
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`;

        switch (block.kind) {
          case 'h2':
            return (
              <h2 key={key} className="k-display-md mt-8 text-[var(--k-bone)] first:mt-0">
                {clean(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} className="mt-6 text-[var(--k-title)] font-semibold text-[var(--k-bone)]">
                {clean(block.text)}
              </h3>
            );
          case 'quote':
            return (
              <p
                key={key}
                className="border-l-2 border-[var(--k-red)] bg-[var(--k-ink-card)] px-6 py-5 text-sm leading-relaxed text-[var(--k-bone)]"
              >
                {clean(block.text)}
              </p>
            );
          case 'list':
            return (
              <ul key={key} className="flex flex-col gap-3">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-4 text-[var(--k-muted)]">
                    <span aria-hidden="true" className="mt-[0.65em] h-px w-4 flex-none bg-[var(--k-red)]" />
                    <span>{clean(item)}</span>
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={key} className="whitespace-pre-line text-[var(--k-muted)]">
                {clean(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
