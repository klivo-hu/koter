# Jogi tartalmak

Ebben a projektben a jogi dokumentumok **nem fájlból**, hanem az adatbázisból
jönnek, és az admin felületen szerkeszthetők:

- Tábla: `legal_pages` (`lib/db/schema.ts`)
- Kezdeti tartalom: `lib/db/seed.ts`
- Admin: `/admin/jogi`
- Publikus megjelenés: `/jogi/<slug>`

Így egy szövegmódosításhoz nem kell újratelepíteni az alkalmazást, és a lábléc
automatikusan felveszi az újonnan létrehozott dokumentumokat is.

A seedelt szövegek **vázlatok**, és a rendszer láthatóan meg is jelöli őket.
Publikálás előtt ki kell egészíteni az üzemeltető valós adataival, és jogi
szakértővel át kell nézetni. A CEF nem nyújt jogi tanácsadást.
