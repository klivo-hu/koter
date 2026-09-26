# Architecture decisions

Why this project is built the way it is. Written for whoever maintains it next.

---

## 1. CEF is the framework; the product is built on its output

CEF scaffolded the project, planned it, resolved the design tokens, generated the
Next.js App Router baseline, the SEO routes and the Docker deploy bundle, and it
grades the result across twelve quality gates.

Everything CEF generates is a *baseline*. The Kóter Gym product — the design
system, the motion system, the database, the admin and the upload pipeline — is
built on top of that baseline, inside CEF's folder contract and against its
`--cef-*` design-token contract.

**Consequence worth knowing:** `cef review` inspects the generator's in-memory
file set, not the files on disk. It therefore reports on the CEF baseline, not on
this application. Its `security` and `legal` warnings say "no middleware" and "no
individual legal pages" because *CEF's generator* emits neither — this app has a
nonce-based CSP in `middleware.ts` and all the Hungarian legal documents in the
database. Read those gate results as a report on the scaffold.

## 2. The planned page set differs from the client's information architecture

CEF's page planner derives pages from an industry profile. The catalogue has no
fitness/gym profile, so the project classifies as **hospitality** — genuinely the
closest fit for a membership venue, and the reason the plan includes a gallery.

That profile also plans `menu` and `reservations`, and the feature planner adds
`signup` and `blog`. The client's agreed IA is exactly five public pages, so those
four were not built. The delta is recorded in `.cef/manifest.yaml` under
`metadata.notes`, which is the input the planner actually reads.

## 3. SQLite, not Postgres

CEF's deployment contract is one container per site. A second database service
would break it. The data set is small and overwhelmingly read-heavy, so
`better-sqlite3` is a better fit than a network database: reads are synchronous
and take microseconds, which is why the public pages can render per request with
no cache in front of them and still be fast.

The database file and the uploads share one directory (`DATA_DIR`), so persistence
is a single volume mount.

## 4. Node 22, not 24

`better-sqlite3` publishes no prebuilt binary for Node 24, so Node 24 would force
a source build and a C++ toolchain into the image. The Dockerfile, the local
toolchain and `package.json` all pin Node 22 LTS.

## 5. Server Actions rather than a REST admin API

Every mutation is a Server Action in `lib/actions/`, each beginning with
`requireAdminAction()`. This keeps the attack surface to one authorisation check
per mutation with no separately addressable, enumerable admin endpoints. The
session cookie is `SameSite=Strict`, which covers CSRF for same-origin form posts.

`middleware.ts` also redirects signed-out visitors away from `/admin`, but it is a
convenience, not the boundary — authorisation is re-verified server-side on every
page and every action.

## 6. The password hash is dot-separated, not `$`-separated

`scrypt.1.<salt>.<key>` rather than the conventional `scrypt$1$...`. The hash is
configured through `.env`, and dotenv expands `$name` references — a `$`-separated
hash is silently truncated and every login then fails with no useful error. Dots
cannot appear in base64url output, so they separate the fields unambiguously.

## 7. `SITE_URL`, not `NEXT_PUBLIC_SITE_URL`

Anything prefixed `NEXT_PUBLIC_` is inlined into the bundle at build time. A
canonical URL configured that way would be frozen to whatever the build machine
had, and setting it later in the hosting panel would do nothing. `SITE_URL` is
read on the server per request (`lib/seo/site-url.ts`), so one environment
variable on the running container moves the site to a new domain.

## 8. CSS owns visual state; GSAP only plays the transition

Learned from a real defect. The mobile menu originally became visible *because*
its animation ran, so an interrupted tween left it half-drawn with unreachable
links. Now `.k-mobile-panel[data-open]` decides what is shown and GSAP animates
from the closed state, clearing its inline styles on complete *and* on interrupt.

The same principle covers the scroll reveals: `[data-reveal]` elements are only
hidden once the motion controller has mounted and added `.k-motion-ready`, so a
page whose JavaScript fails renders fully visible rather than blank.

## 9. Images never flash, never shift

Site photographs are static imports, so `next/image` knows their dimensions and
generates a blur placeholder at build time. Database-backed images carry width,
height and a 20px blur data URL measured once at ingest. Every frame reserves its
box with an explicit `aspect-ratio` over the page's own dark surface. There is no
spinner and no "loading" text anywhere, by design.

The hero is the clearest case: the still is the LCP element, loaded with
`priority` and `fetchPriority="high"`; the video is fetched afterwards and only on
a large screen, with motion allowed and no data-saver hint, then faded in over it.

## 10. Uploads are re-encoded, never stored as received

`lib/uploads.ts` decodes with sharp and re-encodes to WebP under a generated name.
That re-encode is the security control: a polyglot file, an SVG carrying script,
or an executable renamed `.jpg` does not survive it. EXIF — including GPS — is
dropped in the same step. The declared MIME type is never trusted; the decoded
format is what is checked.

## 11. The Google map loads only after consent

The embedded map is the one thing on the site that sends visitor data to a third
party (Google sets its own cookies and receives the IP address), so under the
GDPR and the ePrivacy rules it may only load after an explicit yes. The site sets
no analytics or marketing cookies, so consent has exactly one category.

The choice lives in a first-party cookie (`koter_consent`, 6 months), not in
localStorage, because the server reads it: `app/(site)/layout.tsx` renders the
banner and every map in their final state, so nothing flips after hydration.
Until the visitor agrees, `MapSection` shows a placeholder in the same box that
explains why, loads the map on request (that click is the consent) and links to
Google Maps as a plain link, which needs none. Refusing is one click, the same
size as accepting, and the footer's "Süti-beállítások" reopens the choice on
every page. Changing the categories means bumping `CONSENT_VERSION` in
`lib/consent.ts`, which asks everyone again.

## 12. Content migrations, not seed edits, reach a running site

The seed only fills empty tables, so editing it never reaches a database that
already exists. `lib/db/migrations.ts` holds numbered steps tracked by SQLite's
`user_version`; each runs once, in a transaction with its version bump. Steps
must be harmless on a freshly seeded database and must never overwrite what an
operator edited: migration 1 adds the cookie policy only if its slug is missing,
and rewrites the privacy policy's cookie section only while that section is
still word for word the seeded original. The legal copy itself lives in
`lib/db/legal-content.ts`, shared by the seed and the migrations.

## 13. The intro curtain is timed by CSS, not by JavaScript

The home page opens behind a two-second curtain with the mark, so the hero
photograph, the hero clip and the first pictures below the fold are already
arriving when it lifts. The timing is a CSS animation counted from the first
paint: it behaves the same with or without JavaScript and can never stick. The
hero's own CSS entrances are offset by the same amount while the curtain is in
the document, so the headline rises as it leaves. JavaScript only does what CSS
cannot — remembers per tab that it has played (a pre-paint inline script then
keeps CSS from drawing it again), holds scrolling while it is down, and removes
it afterwards. It never shows on a deep link to another page, and never under
reduced motion.

## 14. Pictures load a screen and a half ahead, in every browser

Native lazy loading decides for itself how far ahead to fetch (Chrome
1250–2500px, Firefox and Safari far less), so a quick scroll outran it and a
picture arrived as its reveal played. `ImageWarmup` now watches every lazy
picture (and the map frame) from hydration and switches it to eager 1.5 screens
before it reaches the viewport, then, once the page is idle, loads the rest of
the page and warms the other pages' pictures into the cache.

**Known, not yet addressed:** the Next.js image optimiser encodes each size on
its first request and keeps the result in `.next/cache/images`, which lives in
the container and is emptied by every redeploy. The first visitors after a
deploy therefore wait for encodes (measured ≈0.18s per AVIF at 1280w on a fast
desktop; several times that on a small VPS, and a page's worth run at once).
Moving that cache onto the data volume would keep it across deploys; it needs a
Dockerfile change that should be tested on the platform first.

## 15. The tread-plate texture is a derived photograph

`assets/textures/metal.webp` is derived from `source-assets/metal-plate.jpg`, a
photoreal render generated with Higgsfield (Seedream 5.0 Flash) because no usable
close-up of the gym's own floor exists. `npm run assets:textures` measures the
lens lattice, cuts a window of whole periods, flattens the lighting and
cross-fades each edge with a half-window-shifted copy, so the tile repeats with no
seam. Being a photograph, it is darkened harder in CSS than the old drawn plate
was, to keep muted text above AA contrast.
