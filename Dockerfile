# syntax=docker/dockerfile:1
#
# KÓTER GYM — production image.
#
# Multi-stage build of the Next.js standalone output.
#
# Port contract: the server listens on 3000 (`docker.port` in .cef/manifest.yaml).
# The Klivo platform's Traefik routes to http://hosting_<slug>_web:<container port>,
# so the site's "Container port" in the hosting panel must be 3000 as well. A
# mismatch leaves the container healthy but unreachable, and the platform serves
# its "site unavailable" page in its place.
#
# 3000 is unprivileged, so the non-root runtime user binds it without file
# capabilities (setcap) or any extra packages in the runtime stage.
#
# Debian slim rather than Alpine on purpose: better-sqlite3 and sharp both ship
# prebuilt glibc binaries, so nothing is compiled here and the build stays fast
# and reproducible. On musl the same install would need a C++ toolchain.
#
# The web fonts are committed under assets/fonts and loaded with next/font/local,
# so neither the build nor the running container fetches anything at runtime.

# ---------------------------------------------------------------- base
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# --------------------------------------------------- dependencies (build)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---------------------------------------------- dependencies (runtime only)
# A second, dev-free install. The native modules are copied from here into the
# runner, because Next's file tracer cannot follow better-sqlite3's runtime
# binding lookup and would otherwise leave the .node binary behind.
FROM base AS prod-deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# --------------------------------------------------------------- build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# -------------------------------------------------------------- runtime
FROM base AS runner
# PORT may be overridden from the site's .env (compose `env_file`); the
# HEALTHCHECK below reads the same variable, so the probe follows it.
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/app/data \
    DATABASE_PATH=/app/data/koter.db \
    UPLOAD_DIR=/app/data/uploads

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Native modules, with their compiled binaries, straight from the clean install.
COPY --from=prod-deps --chown=node:node /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=prod-deps --chown=node:node /app/node_modules/bindings ./node_modules/bindings
COPY --from=prod-deps --chown=node:node /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=prod-deps --chown=node:node /app/node_modules/sharp ./node_modules/sharp
COPY --from=prod-deps --chown=node:node /app/node_modules/@img ./node_modules/@img

# The database and uploads live here. docker-compose.yml mounts a named volume
# over it; Docker seeds an empty named volume from this directory, ownership
# included, so the first start is writable by the runtime user.
#
# Deliberately no `VOLUME` instruction: the platform's review previews run this
# image without the compose volumes, and an image-level VOLUME would leave an
# orphaned anonymous volume behind for every preview.
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data

USER node
EXPOSE 3000

# Probes the route that touches SQLite, so an unwritable data volume marks the
# container unhealthy. Bounded below Docker's own timeout so a hung server
# counts as a failure rather than a stalled probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT || 3000}/api/health`, { signal: AbortSignal.timeout(4000) }).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", "server.js"]
