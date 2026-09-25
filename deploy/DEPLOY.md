# Deploying koter-gym

This project deploys on the **Klivo Docker hosting platform** (Traefik reverse
proxy, one container per site). No CI is required — the platform builds and runs
the repository's `docker-compose.yml` on deploy.

## What CEF generated for deployment

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage Next.js **standalone** build; the runtime listens on port **3000** as a non-root user. |
| `docker-compose.yml` | The platform-contract compose: container `hosting_koter_web`, network `client_koter_net`, `env_file: .env`, named data volume, capped logs, no Docker labels. |
| `.dockerignore` | Keeps `.env`, `.git`, `node_modules`, and `.next` out of the build context. |

`next.config.mjs` sets `output: 'standalone'`, which the Dockerfile relies on.

## How the platform reaches the container

For every site the platform writes a Traefik route to

```text
http://<container name>:<container port>
```

over the client's private network. Both values come from the panel, so the
repository has to agree with the panel on each of them:

| Setting | Panel | Repository |
| --- | --- | --- |
| Container name | `hosting_<client>_web` when the site slug equals the client slug, `hosting_<client>_<site>_web` otherwise | `container_name: hosting_koter_web` |
| Network | `client_<client>_net` — the only network the compose validator accepts | `client_koter_net` |
| Port | the site's **Container port** (defaults to 80) | `PORT=3000` (Dockerfile, `.env`) and `expose: '3000'` |

A mismatch in any row leaves the container running and healthy but unreachable,
and visitors get the platform's "site unavailable" page (a 502 underneath).

## Deploy steps

1. **Create the client and the site in one step**, with the slug **`koter`**
   (Clients → + New Client → set the domain; template *None* for a repo deploy).
   Entering the domain there creates the first site with the same slug, which is
   what makes the live container name `hosting_koter_web`. A site added later
   under a different slug would be routed to `hosting_koter_<site>_web` instead.
   If the slug ever changes, rename the service, container and network in
   `docker-compose.yml` to match.
2. **Container port: 3000.** Set it on the new-client form, or later under
   Sites → site → Container port. It must equal `PORT`; the platform default of
   80 does not.
3. **Environment**: under **Sites → site → Environment**, paste `.env.example`
   and fill it in. The panel writes the site's `.env`, which the compose loads via
   `env_file`; secrets are never baked into the image. Required:

   | Variable | Value |
   | --- | --- |
   | `SITE_URL` | the public origin, e.g. `https://kotergym.hu` (no trailing slash) |
   | `JWT_SECRET` | at least 32 characters — see `.env.example` for the generator |
   | `ADMIN_EMAIL` | the admin sign-in address |
   | `ADMIN_PASSWORD_HASH` | `npm run admin:hash -- "<password>"` |
   | `PORT` | `3000` — or leave it out; the image already defaults to 3000 |

   Save, then **Apply now**. A plain restart keeps the old environment; Apply
   recreates the container with the new one.
4. **Point the code at the platform**: set the site's GitHub repo + branch and
   **Deploy now**, or push to the configured branch to auto-deploy (webhook).
5. The platform validates the compose (rejecting privileged mode, the Docker
   socket, or foreign networks), builds the image, starts `hosting_koter_web` on
   `client_koter_net`, and Traefik routes the domain to it — issuing a Let's
   Encrypt certificate on first request in production.

## Moving an existing deployment from port 80

Deployments made before the port was aligned listened on 80. To move one:

1. Sites → site → **Container port** → `3000`. The Traefik route is rewritten
   immediately.
2. Sites → site → **Environment**: change `PORT=80` to `PORT=3000` (or delete
   the line), and save.
3. **Deploy now**, so the new image is built and the container recreated.

## Verifying a deployment

On the VPS, the container should report `healthy`, and the address Traefik uses
should answer from inside the client network:

```bash
docker inspect --format '{{.State.Health.Status}}' hosting_koter_web
```

```bash
docker run --rm --network client_koter_net curlimages/curl -fsS http://hosting_koter_web:3000/api/health
```

`{"status":"ok"}` from the second command means routing is correct end to end
on the container side; if the domain still shows "site unavailable", compare the
panel's Container port with the port in that URL.

## Review previews

A review preview runs the same image, but the platform copies neither `env_file`
nor `volumes` into the preview. The public pages render normally from the seeded
defaults; the admin stays signed out because its secrets are absent. Preview
content is discarded when the link expires and never touches the live volume.

## Local check (optional)

```bash
docker compose -f docker-compose.local.yml up --build
# open http://localhost:8080
```
