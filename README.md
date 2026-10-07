# consent-banner

Selfhosted, konfigurálható cookie consent banner Google Consent Mode v2-höz (GDPR-kompatibilis 4 kategóriás modell: Elengedhetetlen / Beállítások / Statisztikai / Marketing), GTM sablon (`.tpl`) felületről konfigurálható módon.

## Hogyan működik

A `banner.js` egyetlen, önmagában futtatható szkript. Betöltéskor beolvassa a `window.__parBannerConfig` objektumot (ezt a GTM sablon állítja be), felépíti a DOM-ot (stílus + markup), és kezeli a hozzájárulás mentését/visszatöltését egy **cookie-ban** (nem localStorage-ban, ez teszi lehetővé a cross-domain megosztást is).

A 4 kategória a Google Consent Mode v2 jelzéseire képeződik le:

| Kategória | Consent Mode v2 jelzés(ek) | Alapállapot |
|---|---|---|
| Elengedhetetlen | `functionality_storage`, `security_storage` | mindig `granted` |
| Beállítások (Personalization) | `personalization_storage` | felhasználó dönt |
| Statisztikai (Analytics) | `analytics_storage` | felhasználó dönt |
| Marketing (Advertising) | `ad_storage`, `ad_user_data`, `ad_personalization` | felhasználó dönt |

## Egy GTM tag szükséges

**Consent + Banner tag** (`GCMv2-Consent-Banner.tpl`): egyetlen tag, ami mindent elvégez. Beállítja a Consent Mode alapállapotát (minden `denied`, kivéve a szükséges kategóriák), a mentett cookie alapján azonnal frissíti azt, ha a látogató korábban már döntött, majd beállítja a `window.__parBannerConfig`-ot a GTM felületen kitöltött mezők alapján, és betölti a `banner.js`-t jsDelivr-ről.

A tag triggerének a beépített **"Consent Initialization - All Pages"** trigger típust állítsd be, hogy garantáltan minden más tag előtt lefusson.

## Tag mezői (GTM felületen)

- **Megjelenés**: kiemelő szín (HEX), a cím, a linkek és a kapcsolók feliratának színe (a gombok fixen fekete-fehérek)
- **Linkek**: Adatkezelési tájékoztató elérési útja, **csak a domain utáni rész kell**, pl. `/adatkezelesi-tajekoztato` (nem a teljes URL)
- **Nyelv**: legördülőből választható 14 nyelv, vagy automatikus (böngésző nyelve)
- **Cookie beállítások**: cookie neve, domainje (aldomainek közti megosztáshoz), lejárati ideje
- **Cross-Domain Consent**: bekapcsolható, célhosztnevek vesszővel elválasztva
- **Süti lista (Részletes tájékoztató)**: checkboxok szolgáltatónként (Google Analytics, Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads, Microsoft Clarity, Microsoft/Bing Ads, Reddit Ads, Cloudflare). Csak azokat pipáld be, amelyek ténylegesen futnak az adott oldalon — ez vezérli, hogy a banner "Részletes süti tájékoztató" nézete mely sütiket sorolja fel kategóriánként (Elengedhetetlen/Beállítások/Statisztikai/Marketing). A konkrét süti-lista (név, szolgáltató, cél, lejárat, típus) a `banner.js`-ben van, csak magyar nyelven; a saját hozzájárulás-cookie (`cookieName`) mindig automatikusan bekerül az Elengedhetetlen listába.
- **Speciális beállítások**: jsDelivr script URL + verziószám (git tag)

## Cross-Domain Consent működése

Ha be van kapcsolva, a banner minden, a célhosztnevek egyikére mutató linkre kattintáskor hozzáfűzi a mentett hozzájárulást tartalmazó `par_consent` URL paramétert. A célhosztra érkezéskor a banner.js automatikusan beolvassa ezt a paramétert, elmenti cookie-ba, majd eltünteti az URL-ből, így a látogatónak nem kell újra döntenie a második domainen.

## Verziózás

A `main` branch mindig a legfrissebb, potenciálisan instabil kódot tartalmazza. **Éles használatra mindig egy konkrét git tag/release verziót állíts be** a tag "Speciális beállítások" részében (pl. `v1.2.0`), soha ne a `main` branch-et, így egy jövőbeli módosítás nem megy élesbe automatikusan minden ügyfél oldalán.

Új verzió kiadása:
1. GitHub → **Releases** → **Draft a new release**
2. Tag: `vX.Y.Z` (pl. `v1.2.0`)
3. **Publish release**
4. A tag "Banner script verzió" mezőjében írd át `vX.Y.Z`-re, majd mentsd/publikáld a GTM konténer új verzióját

## Támogatott nyelvek

en, hu, de, es, fr, it, pt, ro, sk, bg, hr, cs, pl, ja
