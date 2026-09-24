# koter-gym — CEF Context

> Generated 2026-09-18T13:50:08.377Z. Token-optimized context for Claude Code — regenerate with `cef context`.

## Project Summary
- Name: koter-gym
- Type: fullstack
- Summary: Kóter Gym & Crossfight Aréna edzőterem, küzdősport venue és sportegyesület Hatvanban, 2015 óta…

## Architecture Summary
Server-first, token-optimized. 11 capability modules active; floors (accessibility, security, performance, legal) are non-negotiable. Full memory: `.cef/memory/architecture.md`.

## Current Progress
0% complete — 0 completed, 0 in progress, 0 blocked, 16 upcoming.

## Enabled Engines
core → architecture → design → accessibility → components → docker → deployment → experience → legal → motion → performance → platform → security → seo → ai-seo → validation

## Enabled Capabilities
- **foundation** — The non-negotiable baseline: server-first architecture, strict TypeScript, focused modules, and the priority order. Everything else builds on this. · modules/foundation/ (load on demand)
- **security** — Validate all input, guard every trust boundary, and keep secrets server-only. Assume hostile input from the first line. Security is a floor. · modules/security/ (load on demand)
- **performance** — Treat Core Web Vitals (LCP, CLS, INP) and bundle size as hard budgets. A page over budget is not finished, regardless of how it looks. · modules/performance/ (load on demand)
- **legal** — Ship required legal pages (privacy, terms, cookies, impressum)… · modules/legal/ (load on demand)
- **frontend** — Build from design tokens and a reusable component system. Every component ships all states; layouts are intentional, not centered-by-default. · modules/frontend/ (load on demand)
- **accessibility** — Build to WCAG 2.2 AA from the first line. Semantic elements, reachable focus, sufficient contrast, and full keyboard operation. Accessibility is a floor. · modules/accessibility/ (load on demand)
- **seo** — Every public page ships unique metadata, a canonical URL, structured data, and a sitemap entry. Semantic headings and descriptive internal links. · modules/seo/ (load on demand)
- **docker** — Define environments as code that build reproducibly from a clean checkout. Multi-stage production image, healthcheck, and no secrets baked into any layer. · modules/docker/ (load on demand)
- **deployment** — Release safely and reversibly: reproducible artifact, configured secrets, health checks, and a tested rollback… · modules/deployment/ (load on demand)
- **ai-seo** — Make content citable by AI answer engines: a truthful llms.txt, consistent Schema.org entities, and extractable, question-shaped content structure. · modules/ai-seo/ (load on demand)
- **motion** — Admit motion only when it communicates. Keep it under 300ms, honor prefers-reduced-motion, and stay within the performance budget. · modules/motion/ (load on demand)

## Framework Version & Technology Stack
- Framework: nextjs (framework version 2)
- Language: typescript
- Package manager: npm
- Build: next
- Deployment: docker
- Database: sqlite

## Directory Overview
- `Dockerfile` — Project files
- `content` — Project files
- `public` — Static assets

## Coding Standards
- **Foundation:** Build server-first with strict TypeScript. Keep files focused, name for intent, and resolve trade-offs by the priority order (correctness > accessibility > performance).
- **Security:** Validate and sanitize input at every boundary, enforce authorization server-side, parameterize queries, set security headers, and never expose secrets to the client.
- **Performance:** Keep client JS minimal and within budget. Prioritize the LCP image, size media, defer below-fold work, and measure against the budget before shipping.
- **Legal:** Include the required legal pages for the jurisdiction. Treat generated legal text as a draft; state clearly that it needs review by a qualified legal professional.
- **Frontend:** Use design tokens and shared components with defined variants and states. Compose layouts for the content; render empty, loading, and error states.
- **Accessibility:** Use semantic controls with visible focus and AA contrast. Every flow is keyboard operable; honor reduced motion; label every control.
- **SEO:** Author a unique title, description, and canonical per page; emit JSON-LD for its type; keep one h1 with ordered headings; keep the sitemap and robots current.
- **Docker:** Provide a multi-stage Dockerfile and compose that build reproducibly, expose a healthcheck, and never bake secrets into an image layer.
- **Deployment:** Ship an immutable versioned artifact with configured secrets and health checks; verify a tested rollback path; promote preview -> staging -> production, never straight to prod.
- **AI SEO:** Ship a truthful llms.txt, keep Schema.org entities consistent across pages, and structure facts in semantic elements under clear, question-shaped headings.
- **Motion:** Add motion only where it conveys state or hierarchy. Duration <= 300ms, standard easing, and always honor prefers-reduced-motion.

## Active Skills & MCPs
- Skills: emil-frontend-design, emil-motion, frontend-design, seo-skill, taste, uiux-pro-max
- MCPs: chrome-devtools

## Current Milestone
—

## Outstanding Tasks
- [ ] Establish constitution and rules
- [ ] Wire memory and decision log
- [ ] Define structure and boundaries
- [ ] Record architecture decisions
- [ ] Resolve design tokens
- [ ] Define component variants
- [ ] Audit semantics and focus order
- [ ] Verify WCAG 2.2 AA conformance
- [ ] Build the component library
- [ ] Document component states

## Known Constraints
- WCAG 2.2 AA
- Legal compliance and required disclosures
- Performance budget (Core Web Vitals)
- Security — defensible against hostile input
- No placeholder or fabricated content

## Open Decisions
None open.

## Recent Changes
- Generated .cef/manifest.yaml
- Generated .cef/memory.md
- Generated .cef/project.json
- Generated .cef/runtime.json
- Generated .editorconfig
- Generated .env

## Next Recommended Action
Establish constitution and rules
