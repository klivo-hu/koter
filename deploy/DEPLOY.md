# Deploying koter-gym

This project is generated to deploy on the **Klivo Docker hosting platform**
(Traefik reverse proxy, one container per site). No CI is required — the platform
builds and runs the repository's `docker-compose.yml` on deploy.

## What CEF generated for deployment

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage Next.js **standalone** build; the runtime listens on port 80. |
| `docker-compose.yml` | The platform-contract compose: container `hosting_koter-gym_web`, network `client_koter-gym_net`, `env_file: .env`, capped logs, no Docker labels. |
| `.dockerignore` | Keeps `.env`, `.git`, `node_modules`, and `.next` out of the build context. |

`next.config.mjs` sets `output: 'standalone'`, which the Dockerfile relies on.

## Deploy steps

1. **Create the client/site in the panel** with the slug **`koter-gym`** (Clients →
   + New Client → set the domain; template *None* for a repo deploy). The
   container name and network above must match this slug — regenerate with
   `cef generate --client-slug <your-slug>` if it differs.
2. **Container port** must be **80** (the platform default), matching
   the Dockerfile's `EXPOSE 80`.
3. **Environment**: set runtime variables under **Sites → site → Environment**.
   At minimum set `NEXT_PUBLIC_SITE_URL` to the site's public URL (see
   `.env.example`). The panel writes `.env`, which the compose loads via
   `env_file`. Secrets are never baked into the image.
4. **Point the code at the platform**: set the client's GitHub repo + branch and
   **Deploy now**, or push to the configured branch to auto-deploy (webhook).
5. The platform validates the compose (rejecting privileged mode, the Docker
   socket, or foreign networks), builds the image, starts `hosting_koter-gym_web` on
   `client_koter-gym_net`, and Traefik routes the domain to it — issuing a Let's Encrypt
   certificate on first request in production.

## Local check (optional)

```bash
docker build -t koter-gym .
docker run --rm -e NEXT_PUBLIC_SITE_URL=http://localhost -p 8080:80 koter-gym
# open http://localhost:8080
```
