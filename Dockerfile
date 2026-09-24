# syntax=docker/dockerfile:1
#
# KÓTER GYM — production image.
#
# Multi-stage build of the Next.js standalone output. The runtime listens on
# port 80, as the Klivo platform's Traefik routing expects.
#
# Debian slim rather than Alpine on purpose: better-sqlite3 and sharp both ship
# prebuilt glibc binaries, so nothing is compiled here and the build stays fast
# and reproducible. On musl the same install would need a C++ toolchain.
#
# Note: `npm run build` fetches the Archivo and Inter web fonts once, so the
# build stage needs network access. The fonts are then baked into the image and
# the running container never calls out.

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
ENV NODE_ENV=production \
    PORT=80 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/app/data \
    DATABASE_PATH=/app/data/koter.db \
    UPLOAD_DIR=/app/data/uploads

# libcap lets the unprivileged runtime user bind port 80; it is removed again so
# the shipped image carries no extra tooling.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libcap2-bin \
 && setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(which node)")" \
 && apt-get purge -y libcap2-bin \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Native modules, with their compiled binaries, straight from the clean install.
COPY --from=prod-deps --chown=node:node /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=prod-deps --chown=node:node /app/node_modules/bindings ./node_modules/bindings
COPY --from=prod-deps --chown=node:node /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=prod-deps --chown=node:node /app/node_modules/sharp ./node_modules/sharp
COPY --from=prod-deps --chown=node:node /app/node_modules/@img ./node_modules/@img

# The database and uploads live here; the platform mounts a volume over it.
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data

USER node
EXPOSE 80
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:80/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
