# Requirements

The project MUST satisfy each active capability:

- **Foundation**: The non-negotiable baseline: server-first architecture, strict TypeScript, focused modules, and the priority order. Everything else builds on this.
- **Security**: Validate all input, guard every trust boundary, and keep secrets server-only. Assume hostile input from the first line. Security is a floor.
- **Performance**: Treat Core Web Vitals (LCP, CLS, INP) and bundle size as hard budgets. A page over budget is not finished, regardless of how it looks.
- **Legal**: Ship required legal pages (privacy, terms, cookies, impressum)…
- **Frontend**: Build from design tokens and a reusable component system. Every component ships all states; layouts are intentional, not centered-by-default.
- **Accessibility**: Build to WCAG 2.2 AA from the first line. Semantic elements, reachable focus, sufficient contrast, and full keyboard operation. Accessibility is a floor.
- **SEO**: Every public page ships unique metadata, a canonical URL, structured data, and a sitemap entry. Semantic headings and descriptive internal links.
- **Docker**: Define environments as code that build reproducibly from a clean checkout. Multi-stage production image, healthcheck, and no secrets baked into any layer.
- **Deployment**: Release safely and reversibly: reproducible artifact, configured secrets, health checks, and a tested rollback…
- **AI SEO**: Make content citable by AI answer engines: a truthful llms.txt, consistent Schema.org entities, and extractable, question-shaped content structure.
- **Motion**: Admit motion only when it communicates. Keep it under 300ms, honor prefers-reduced-motion, and stay within the performance budget.
