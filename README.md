# consent-banner

Selfhosted, konfigurálható cookie consent banner Google Consent Mode v2-höz (GDPR-kompatibilis 4 kategóriás modell: Elengedhetetlen / Beállítások / Statisztikai / Marketing), GTM sablon (`.tpl`) felületről konfigurálható módon.

## Hogyan működik

A `banner.js` egyetlen, önmagában futtatható szkript. Betöltéskor beolvassa a `window.__parBannerConfig` objektumot (ezt a GTM "Banner Loader" sablon állítja be), felépíti a DOM-ot (stílus + markup), és kezeli a hozzájárulás mentését/visszatöltését egy **cookie-ban** (nem localStorage-ban, ez teszi lehetővé a cross-domain megosztást is).

A 4 kategória a Google Consent Mode v2 jelzéseire képeződik le:

| Kategória | Consent Mode v2 jelzés(ek) | Alapállapot |
|---|---|---|
| Elengedhetetlen | `functionality_storage`, `security_storage` | mindig `granted` |
| Beállítások (Personalization) | `personalization_storage` | felhasználó dönt |
| Statisztikai (Analytics) | `analytics_storage` | felhasználó dönt |
| Marketing (Advertising) | `ad_storage`, `ad_user_data`, `ad_personalization` | felhasználó dönt |

## Két GTM tag szükséges

1. **Init tag** (`GCMv2-Init.tpl`): a legelső, ami minden más tag előtt lefut. Beállítja a Consent Mode alapállapotát (minden `denied`, kivéve a szükséges kategóriák), majd a mentett cookie alapján azonnal frissíti azt, ha a látogató korábban már döntött.
2. **Banner Loader tag** (`GCMv2-Banner-Loader.tpl`): ez tölti be a látható bannert. Beállítja a `window.__parBannerConfig`-ot a GTM felületen kitöltött mezők alapján, majd betölti a `banner.js`-t jsDelivr-ről.

Mindkét tag ugyanarra a triggerre (**All Pages**) fusson, az Init tag-nek kell elsőnek lefutnia (GTM Tag Sequencing vagy a Consent Initialization trigger típus segítségével).

## Banner Loader tag mezői (GTM felületen)

- **Megjelenés**: kiemelő szín (HEX), a cím, a linkek és a kapcsolók feliratának színe (a gombok fixen fekete-fehérek)
- **Linkek**: Adatkezelési tájékoztató elérési útja, **csak a domain utáni rész kell**, pl. `/adatkezelesi-tajekoztato` (nem a teljes URL)
- **Nyelv**: legördülőből választható 14 nyelv, vagy automatikus (böngésző nyelve)
- **Cookie beállítások**: cookie neve, domainje (aldomainek közti megosztáshoz), lejárati ideje
- **Cross-Domain Consent**: bekapcsolható, célhosztnevek vesszővel elválasztva
- **Speciális beállítások**: jsDelivr script URL + verziószám (git tag)

## Cross-Domain Consent működése

Ha be van kapcsolva, a banner minden, a célhosztnevek egyikére mutató linkre kattintáskor hozzáfűzi a mentett hozzájárulást tartalmazó `par_consent` URL paramétert. A célhosztra érkezéskor a banner.js automatikusan beolvassa ezt a paramétert, elmenti cookie-ba, majd eltünteti az URL-ből, így a látogatónak nem kell újra döntenie a második domainen.

## Verziózás

A `main` branch mindig a legfrissebb, potenciálisan instabil kódot tartalmazza. **Éles használatra mindig egy konkrét git tag/release verziót állíts be** a Banner Loader tag "Speciális beállítások" részében (pl. `v1.0.0`), soha ne a `main` branch-et, így egy jövőbeli módosítás nem megy élesbe automatikusan minden ügyfél oldalán.

Új verzió kiadása:
1. GitHub → **Releases** → **Draft a new release**
2. Tag: `vX.Y.Z` (pl. `v1.1.0`)
3. **Publish release**
4. A Banner Loader tag "Banner script verzió" mezőjében írd át `vX.Y.Z`-re, majd mentsd/publikáld a GTM konténer új verzióját

## Támogatott nyelvek

en, hu, de, es, fr, it, pt, ro, sk, bg, hr, cs, pl, ja
