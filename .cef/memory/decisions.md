# Decisions

- **Framework: nextjs** — Chosen at scaffold time; server-first rendering is the default.
- **Language: typescript** — Type safety is a non-negotiable; strict mode is on.
- **Package manager: npm** — Reproducible installs from a committed lockfile.
- **Deployment target: docker** — Releases are reproducible and reversible.
- **Database: sqlite** — Persistence chosen at scaffold time.
- **Server-first architecture** — Less client JavaScript, faster loads, secrets stay on the server.
