# Kóter Gym & Crossfight Aréna

A Kóter Gym & Crossfight Aréna (Hatvan, Tabán út 13.) prémium bemutatkozó
weboldala, saját adminisztrációs felülettel.

Next.js 15 (App Router) · TypeScript · Tailwind CSS · GSAP · SQLite · Docker
Claude Enterprise Framework (CEF) alapokon.

---

## Mit tud

**Publikus oldal (magyar, öt oldal)**

| Útvonal | Tartalom |
| --- | --- |
| `/` | Hero (videó/fotó háttérrel), bemutatkozás, kínálat, árak, edzők, galéria, helyszín |
| `/arak` | Bérlet- és jegytípusok |
| `/edzok` | Személyi edzők, elérhetőséggel |
| `/galeria` | Editorial fotógaléria |
| `/rolunk` | Bemutatkozás, csapat, elismerések, térkép, közösségi oldalak |
| `/jogi/<slug>` | Jogi dokumentumok (adatkezelés, ÁSZF, impresszum, …) |

**Admin (`/admin`, JWT-vel védett)**

Árak · Edzők (képfeltöltéssel) · Galéria (képfeltöltéssel) · Rólunk-szövegek ·
Díjak és elismerések · Jogi oldalak · Elérhetőség, közösségi linkek, térkép.

Minden szerkeszthető tartalom adatbázisból jön — a kódban semmi sincs beégetve.

---

## Indítás fejlesztéshez

Node **22 LTS** szükséges (a `better-sqlite3` natív modulnak nincs előre fordított
csomagja Node 24-hez, és a Docker image is 22-est használ).

```bash
npm install
cp .env.example .env
```

Töltsd ki a `.env` kötelező értékeit:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"   # JWT_SECRET
npm run admin:hash -- "a-választott-jelszó"                                      # ADMIN_PASSWORD_HASH
```

```bash
npm run dev     # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Az adatbázis és a kezdeti tartalom az első indításkor automatikusan létrejön a
`DATA_DIR` alatt.

---

## Docker

**Helyi futtatás friss gépen** (semmi mást nem kell telepíteni, csak Dockert):

```bash
cp .env.example .env
# töltsd ki: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
docker compose -f docker-compose.local.yml up --build
```

Ezután: <http://localhost:8080> — az admin: <http://localhost:8080/admin>

**Éles (Klivo hosting platform):**

```bash
docker compose up --build -d
```

A `docker-compose.yml` a platform szerződését követi: `hosting_koter_web`
konténer a `client_koter_net` külső hálózaton, **3000-es porton**, `.env`-ből
olvasott környezettel. A panelben a site **Container port** mezője is 3000
legyen, és a `.env`-ben lévő `PORT` ugyanezt az értéket tartsa — eltérés esetén
a Traefik nem éri el a konténert, és a platform „az oldal nem elérhető” oldalát
mutatja. A részletes lépések: [`deploy/DEPLOY.md`](deploy/DEPLOY.md).

> A betűkészletek a repóban vannak (`assets/fonts`, `npm run assets:fonts`), a
> build nem tölt le fontot. A futó konténer nem hálózik ki.

### Adatmegőrzés

A SQLite adatbázis és **minden feltöltött kép** a `/app/data` könyvtárban él, amit
mindkét compose fájl névvel ellátott kötetre csatol. Kötet nélkül egy újradeploy
törölné az árakat, edzőket és a galériát.

---

## Környezeti változók

Teljes lista és magyarázat: [`.env.example`](.env.example).

| Változó | Kötelező | Mire jó |
| --- | --- | --- |
| `SITE_URL` | ajánlott | Publikus origin (canonical, sitemap, OG). Futásidőben olvassuk. |
| `JWT_SECRET` | **igen** | Admin munkamenet aláírása, min. 32 karakter. |
| `ADMIN_EMAIL` | **igen** | Az egyetlen admin fiók. |
| `ADMIN_PASSWORD_HASH` | **igen** | A jelszó scrypt hash-e — sosem a jelszó. |
| `SESSION_TTL_SECONDS` | nem | Munkamenet élettartama (alap: 8 óra). |
| `DATA_DIR` / `DATABASE_PATH` / `UPLOAD_DIR` | nem | Írható tároló útvonalak. |
| `MAX_UPLOAD_BYTES` | nem | Feltöltési méretkorlát (alap: 8 MB). |
| `NEXT_PUBLIC_HERO_VIDEO` | nem | A hero videó útvonala. Üresen csak a fotó látszik. |

Éles környezetben az alkalmazás **nem indul el**, ha egy kötelező érték hiányzik.
A `.env` soha nem kerül gitbe és nem kerül bele a Docker image-be sem.

---

## Hero videó cseréje

1. Tedd a fájlt ide: `public/media/hero.mp4`
2. Állítsd be: `NEXT_PUBLIC_HERO_VIDEO=/media/hero.mp4`

A videó csak asztali gépen, csökkentett mozgás kérése nélkül és nem takarékos
kapcsolaton töltődik be; addig — és mobilon mindig — a fotó látszik. A fotó az
LCP elem, tehát a videó sosem lassítja az első megjelenítést.

---

## Képek

Az eredeti fényképek a `source-assets/` könyvtárban vannak. Az oldal a származtatott
változatokat szolgálja ki:

```bash
npm run assets:prepare   # assets/*.webp + public/gallery/*.webp + blur placeholderek
npm run assets:icons     # favicon, app ikon, apple ikon a logóból
```

A szekciókban és a galériában **nincs képátfedés** — a két készlet szándékosan
diszjunkt.

---

## Ellenőrzés

```bash
npm run verify     # tsc --noEmit + eslint + next build
```

CEF minőségi kapuk és jóváhagyás:

```bash
cef review --theme creative --url https://kotergym.hu
cef qa --theme creative
cef score --theme creative
cef release-check --theme creative
```

---

## Jogi tartalom

A `/jogi/...` oldalak szövegei **vázlatok**, és a rendszer láthatóan meg is jelöli
őket. Publikálás előtt egészítsd ki az üzemeltető valós adataival, és nézesd át
jogi szakértővel.
