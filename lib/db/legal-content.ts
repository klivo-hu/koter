import { COOKIE_POLICY_SLUG } from '@/lib/consent';

/**
 * The starting copy of the legal documents.
 *
 * Written into an empty database by the seed, and used by the migrations to
 * bring an already-seeded database up to date. After that the admin owns the
 * text: nothing here overwrites an edit (see lib/db/migrations.ts).
 *
 * Every document is a draft. It must be completed with the operator's real
 * details and reviewed by a legal professional before publication, which the
 * notice at the top of each one says in so many words.
 */

export const LEGAL_DRAFT_NOTICE =
  '> **PIROS VONAL — JOGI ELLENŐRZÉS SZÜKSÉGES.** Ez a szöveg kiindulási vázlat, nem jogi tanácsadás. ' +
  'Publikálás előtt egészítsd ki az üzemeltető valós adataival, és nézesd át jogi szakértővel. ' +
  'A tartalom az admin felületen szerkeszthető.\n';

/** Section 6 of the privacy policy as first seeded, before the site embedded a consent-gated map. */
export const PRIVACY_COOKIES_SECTION_V0 = `## 6. Sütik

A weboldal a működéséhez feltétlenül szükséges sütiket használ. Az admin felületre való bejelentkezés egy munkamenet-sütit állít be, amely kijelentkezéskor vagy lejáratkor törlődik.
`;

/** Section 6 of the privacy policy: the necessary cookies and the Google Maps embed. */
export const PRIVACY_COOKIES_SECTION = `## 6. Sütik és a beágyazott térkép

A weboldal a saját működéséhez csak feltétlenül szükséges sütiket használ: az egyik a sütikkel kapcsolatos döntésedet tárolja, a másik az admin felületre bejelentkezett munkatársak munkamenetét tartja fenn. Ezekhez nem kell hozzájárulás.

A főoldalon és a Rólunk oldalon a terem helyét a Google Ireland Limited által szolgáltatott Google Térkép mutatja. A térkép csak a kifejezett hozzájárulásod után töltődik be; ekkor a Google megkapja az IP-címedet és a böngésződ technikai adatait, és saját sütiket helyezhet el. Az adatkezelés jogalapja a hozzájárulásod (GDPR 6. cikk (1) bekezdés a) pont), amelyet a lábléc „Süti-beállítások” gombjával bármikor visszavonhatsz.

A sütik részletes listáját a [Süti tájékoztató](/jogi/${COOKIE_POLICY_SLUG}) tartalmazza.
`;

export const PRIVACY_POLICY = `${LEGAL_DRAFT_NOTICE}
## 1. Az adatkezelő

Üzemeltető: [Cégnév]
Székhely: [Székhely]
E-mail: [E-mail cím]
Telefon: [Telefonszám]
Nyilvántartási szám: [Nyilvántartási szám]

## 2. A kezelt adatok köre

A weboldal használatához nem szükséges regisztráció. Személyes adatot akkor kezelünk, ha te magad adod meg (például e-mailben vagy telefonon felveszed velünk a kapcsolatot).

## 3. Az adatkezelés célja és jogalapja

A megadott adatokat kizárólag a megkeresésed megválaszolására, illetve a tagsági jogviszony kezelésére használjuk. Az adatkezelés jogalapja a GDPR 6. cikk (1) bekezdés a) pont szerinti hozzájárulás, illetve b) pont szerinti szerződés teljesítése.

## 4. Adatmegőrzés

Az adatokat csak a cél eléréséhez szükséges ideig, illetve a jogszabályban előírt megőrzési időig tároljuk.

## 5. Az érintett jogai

Kérheted személyes adataid hozzáférését, helyesbítését, törlését, az adatkezelés korlátozását, valamint élhetsz az adathordozhatósághoz való joggal. Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhatsz.

${PRIVACY_COOKIES_SECTION}`;

export const COOKIE_POLICY = `${LEGAL_DRAFT_NOTICE}
## 1. Mik azok a sütik?

A sütik (cookie-k) kis szöveges fájlok, amelyeket egy weboldal a böngésződben tárol, hogy később újra kiolvassa őket. Egy részük a weboldal működéséhez szükséges, másokat külső szolgáltatók helyeznek el.

## 2. Feltétlenül szükséges sütik

Ezek nélkül a weboldal nem tudná megjegyezni a beállításaidat, ezért elhelyezésükhöz nem kell hozzájárulás (az elektronikus hírközlésről szóló 2003. évi C. törvény 155. § (4) bekezdése alapján).

- koter_consent — a sütikkel kapcsolatos döntésedet tárolja, hogy ne kérdezzük meg minden oldalon. Saját süti, élettartama 6 hónap.
- koter_admin_session — csak az admin felületre bejelentkezett munkatársaknál jön létre, és a bejelentkezést tartja fenn. Saját süti, kijelentkezéskor, de legkésőbb 8 óra után törlődik.

## 3. Külső tartalom: Google Térkép

A főoldalon és a Rólunk oldalon a terem helyét beágyazott Google Térkép mutatja. A térképet a Google Ireland Limited (Gordon House, Barrow Street, Dublin 4, Írország) szolgáltatja.

A térkép csak akkor töltődik be, ha ehhez kifejezetten hozzájárulsz: a sütisávban az „Elfogadom” gombbal, vagy a térkép helyén a „Térkép betöltése” gombbal. Addig a böngésződ a térkép miatt semmilyen kapcsolatot nem létesít a Google szervereivel.

Betöltéskor a Google megkapja az IP-címedet és a böngésződ technikai adatait, és saját sütiket helyezhet el vagy olvashat ki (például a NID sütit), amelyeket a saját szabályai szerint kezel. Az adatok az Egyesült Államokba is továbbításra kerülhetnek; a Google LLC az EU–USA adatvédelmi keretrendszer (Data Privacy Framework) szerint tanúsított. Az adatkezelés jogalapja a hozzájárulásod (GDPR 6. cikk (1) bekezdés a) pont).

A „Megnyitás a Google Térképen” és az „Útvonaltervezés” gomb egyszerű hivatkozás: a Google oldalát nyitja meg új lapon, ahol a Google saját tájékoztatója az irányadó.

- [A Google adatvédelmi irányelvei](https://policies.google.com/privacy?hl=hu)
- [Hogyan használja a Google a sütiket](https://policies.google.com/technologies/cookies?hl=hu)

## 4. Statisztika és marketing

A weboldal nem használ látogatottságmérő (analitikai), hirdetési vagy közösségi média követő sütiket. A Facebookra és az Instagramra mutató hivatkozások egyszerű linkek: a közösségi oldalak csak akkor kapnak adatot, ha rájuk kattintasz.

## 5. A hozzájárulás visszavonása

A döntésedet bármikor megváltoztathatod az oldal alján, a láblécben található „Süti-beállítások” gombbal. A visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét. A már elhelyezett sütiket a böngésződ beállításaiban törölheted.

## 6. További információ

A személyes adatok kezeléséről az [Adatkezelési tájékoztató](/jogi/adatkezelesi-tajekoztato) szól részletesen.
`;

export const TERMS = `${LEGAL_DRAFT_NOTICE}
## 1. A szolgáltató

Üzemeltető: [Cégnév]
Székhely: [Székhely]
Adószám: [Adószám]

## 2. A szolgáltatás tárgya

Az üzemeltető edzőtermi szolgáltatást nyújt bérlet, illetve napijegy ellenében, a mindenkor érvényes árlista szerint.

## 3. Bérletek és jegyek

A bérletek a megváltás napjától a megjelölt időtartamra érvényesek, másra át nem ruházhatók. A napijegy egyszeri belépésre jogosít.

## 4. Házirend

A terem használata a kifüggesztett házirend elfogadásával történik. Az edzés saját felelősségre végezhető.

## 5. Felelősség

Az üzemeltető felelősségére a Polgári Törvénykönyv rendelkezései az irányadók.

## 6. Panaszkezelés

Panasszal az üzemeltetőhöz, illetve a területileg illetékes békéltető testülethez fordulhatsz.
`;

export const IMPRINT = `${LEGAL_DRAFT_NOTICE}
## Az üzemeltető adatai

Név: [Cégnév]
Székhely: [Székhely]
Adószám: [Adószám]
Nyilvántartási szám: [Nyilvántartási szám]
E-mail: [E-mail cím]
Telefon: [Telefonszám]

## Tárhelyszolgáltató

Név: [Tárhelyszolgáltató neve]
Székhely: [Tárhelyszolgáltató székhelye]
E-mail: [Tárhelyszolgáltató e-mail címe]
`;

export interface LegalSeed {
  readonly slug: string;
  readonly title: string;
  readonly content: string;
  readonly sortOrder: number;
}

export const PRIVACY_POLICY_SLUG = 'adatkezelesi-tajekoztato';

export const COOKIE_POLICY_PAGE: LegalSeed = {
  slug: COOKIE_POLICY_SLUG,
  title: 'Süti tájékoztató',
  content: COOKIE_POLICY,
  sortOrder: 15,
};

export const LEGAL_PAGES: readonly LegalSeed[] = [
  { slug: PRIVACY_POLICY_SLUG, title: 'Adatkezelési tájékoztató', content: PRIVACY_POLICY, sortOrder: 10 },
  COOKIE_POLICY_PAGE,
  { slug: 'aszf', title: 'Általános szerződési feltételek', content: TERMS, sortOrder: 20 },
  { slug: 'impresszum', title: 'Impresszum', content: IMPRINT, sortOrder: 30 },
];
