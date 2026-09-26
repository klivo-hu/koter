# koter-gym — Kóter Gym & Crossfight Aréna

Project instructions for Claude Code. A **fullstack** Next.js application scaffolded
by the Claude Enterprise Framework (CEF) and built out on top of it: a Hungarian
public site for a gym in Hatvan, plus a JWT-protected back office.

## How this project is organized

- `.cef/` — CEF configuration, blueprint and memory. **Start here.**
  - `manifest.yaml` — the project's single source of truth for the intelligence,
    design and generation engines. Editing it changes what CEF plans and generates.
  - `generated/` — the blueprint, page map, SEO and content strategy CEF derived.
  - `memory/`, `reports/`, `client/` — project memory, the twelve quality-gate
    reports, and the immutable approval trail.
- `app/` — routes.
  - `app/(site)/` — the five public pages plus `/jogi/[slug]`; carries the public chrome.
  - `app/admin/` — the back office; its own chrome, never indexed.
  - `app/api/` — media serving and the health probe.
- `components/` — `site/`, `sections/`, `cards/`, `gallery/`, `motion/`, `ui/`, `admin/`.
- `lib/` — `db/` (schema + seed), `repositories.ts`, `actions/` (server actions),
  `auth/`, `uploads.ts`, `seo/`, `motion.ts`.
- `assets/` — photographs imported by `next/image` (build-time optimised).
- `public/gallery/` — the bundled gallery derivatives the database is seeded with.
- `source-assets/` — the client's untouched originals; `npm run assets:prepare` derives everything else.
- `scripts/` — asset preparation, icon generation, password hashing.

## Stack

- Framework: **Next.js 15 (App Router)** · Language: **TypeScript (strict)** · Package manager: **npm**
- Styling: **Tailwind CSS**, wired to the CSS custom properties in `app/globals.css`
- Animation: **GSAP + ScrollTrigger** (not framer-motion)
- Data: **SQLite** via `better-sqlite3` · Auth: **JWT** (`jose`) + scrypt · CMS: **none** (own admin)
- Images: `next/image` + `sharp` · Deployment: **Docker** (one container, port 3000 —
  must match the hosting panel's Container port; see `deploy/DEPLOY.md`)
- Node: **22 LTS** — matches the Docker image; `better-sqlite3` has no prebuild for Node 24.

## Rules that are not negotiable here

- **Nothing the admin can edit may be hard-coded in a component.** Prices, trainers,
  gallery items, awards, legal text, contact details and social links all come from
  the database through `lib/repositories.ts`.
- **Never invent content.** No fabricated awards, numbers, opening hours, phone
  numbers or testimonials. A value that is not verified is seeded empty, and the
  UI drops the row rather than showing a placeholder.
- **Never generate trainer portraits.** The image field exists so the gym uploads
  its own; until then the card shows a monogram plate.
- **Every server action re-checks the session** with `requireAdminAction()`.
  Middleware is a convenience redirect, not the security boundary.
- Accessibility (WCAG 2.2 AA), security, performance and legal are **floors**.
- Prefer server components; client JavaScript must earn its place.
- Legal documents are **drafts** and must be reviewed by a qualified legal
  professional before publication.
- **No third-party embed loads without consent.** The Google map goes through
  `MapSection`'s consent gate (`lib/consent.ts`); a new embed needs a consent
  category, a `CONSENT_VERSION` bump and a line in the cookie policy.
- Seed changes never reach a running site. Content that must, goes through a
  numbered step in `lib/db/migrations.ts` that never overwrites admin edits.

## Design system

Defined once in `app/globals.css` as CSS custom properties, exposed to Tailwind in
`tailwind.config.ts`, and mapped onto CEF's `--cef-*` token contract.

- Ground `#060607`, type `#F2F0ED`, one red accent `#D7141A`.
- Red is for display type, rules and UI only — never small body text (3.9:1),
  and never as text on the turf surface, where it clashes; use a red rule there.
- No hairline borders between sections (or under the header): sections are told
  apart by surface and space, and surfaces fade in and out (`.k-surface-*`).
- Two families: Archivo (display, uppercase, variable width axis) and Inter (text).
- No eyebrow labels, status pills, badges or decorative icons anywhere on the public site.

## Commands

```bash
npm install
npm run dev              # http://localhost:3000
npm run verify           # typecheck + lint + production build
npm run assets:prepare   # re-derive assets/ and public/gallery/ from source-assets/ (`-- logo` for one step)
npm run assets:textures  # re-derive the turf and tread-plate section textures
npm run assets:icons     # re-derive the favicon set from the logo
npm run admin:hash -- "password"   # value for ADMIN_PASSWORD_HASH
```

Node must be 22.x. See `README.md` for Docker and `deploy/DEPLOY.md` for the host.
