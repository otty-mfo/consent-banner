# consent-banner

Selfhosted, GTM-ből teljesen konfigurálható cookie consent banner Google Consent Mode v2-höz. GDPR-kompatibilis 4 kategóriás modell (Elengedhetetlen / Beállítások / Statisztikai / Marketing), egyenrangú súlyú Elfogadás/Elutasítás gombokkal, opcionális consent-naplózással.

> **Jogi felelősség-kizárás:** ez a szoftver a [`LICENSE`](LICENSE) fájlban található MIT licenc feltételei szerint, "AS IS", mindennemű garancia nélkül kerül közreadásra. A szerző nem vállal felelősséget a használatából eredő semmilyen jogi következményért (beleértve egy esetleges GDPR-megfelelőségi hiányosságot is). A tényleges éles bevezetés előtt mindenképp szakképzett adatvédelmi jogász bevonása javasolt annak ellenőrzésére, hogy a konkrét konfiguráció megfelel-e az alkalmazandó jogszabályoknak.

## Tartalomjegyzék

- [Hogyan működik](#hogyan-működik)
- [Gyors telepítés](#gyors-telepítés)
- [Tag mezők — teljes referencia](#tag-mezők--teljes-referencia)
- [Design döntések és a GDPR-megfelelés](#design-döntések-és-a-gdpr-megfelelés)
- [Cross-Domain Consent működése](#cross-domain-consent-működése)
- [Consent naplózás (opcionális)](#consent-naplózás-opcionális)
- [Biztonsági megfontolások](#biztonsági-megfontolások)
- [Adblocker-detektálás](#adblocker-detektálás)
- [Verziózás és release folyamat](#verziózás-és-release-folyamat)
- [Helyi tesztelés](#helyi-tesztelés)
- [Támogatott nyelvek](#támogatott-nyelvek)
- [Fájlstruktúra](#fájlstruktúra)

## Hogyan működik

A rendszer két fájlból áll:

- **`banner.js`** — egyetlen, önmagában futtatható szkript. Betöltéskor beolvassa a `window.__omfBannerConfig` objektumot, felépíti a DOM-ot (stílus + markup), és kezeli a hozzájárulás mentését/visszatöltését egy **cookie-ban** (nem localStorage-ban — ez teszi lehetővé a cross-domain megosztást is).
- **`GCMv2-Consent-Banner.tpl`** — egyetlen GTM sablon-tag, ami a konténerbe importálva mindent elintéz: beállítja a Consent Mode v2 alapállapotát, visszatölti a korábbi döntést cookie-ból, beállítja a banner konfigurációját a GTM felületen kitöltött mezők alapján, és betölti a `banner.js`-t jsDelivr-ről (GitHub release/git tag alapján verziózva).

A 4 kategória a Google Consent Mode v2 jelzéseire képeződik le:

| Kategória | Consent Mode v2 jelzés(ek) | Alapállapot |
|---|---|---|
| Elengedhetetlen | `functionality_storage`, `security_storage` | mindig `granted` |
| Beállítások (Personalization) | `personalization_storage` | alapból `denied`, felhasználó dönt |
| Statisztikai (Analytics) | `analytics_storage` | alapból `denied`, felhasználó dönt |
| Marketing (Advertising) | `ad_storage`, `ad_user_data`, `ad_personalization` | alapból `denied`, felhasználó dönt |

A `Marketing` kategória automatikusan gátolja a Google Ads Enhanced Conversions-t is (`ad_user_data` ezen a kategórián keresztül áll `granted`/`denied`-re). Meta Pixel / TikTok Pixel esetén ez **nem automatikus** — azoknál a GTM tag saját "Consent Settings" részén kell bekapcsolni, hogy a tag `ad_storage` (és/vagy `ad_user_data`) consent-et követeljen a lefutáshoz, lásd [Design döntések](#design-döntések-és-a-gdpr-megfelelés) alul.

## Gyors telepítés

1. **GTM sablon importálása**: Templates → Import → `GCMv2-Consent-Banner.tpl`.
2. **Tag létrehozása** a sablonból, kitöltve a mezőket (lásd lent a teljes referenciát).
3. **Trigger**: a beépített **"Consent Initialization - All Pages"** trigger típus, hogy garantáltan minden más tag előtt lefusson.
4. **Publikálás.**

Ennyi — nincs szükség a weboldal saját kódjába nyúlni, minden GTM-ből megy.

## Tag mezők — teljes referencia

### Megjelenés / Téma

| Mező | Mit befolyásol |
|---|---|
| **Fő szín (mainColor)** | A címsor szövege, a linkek szövege + nyílikon, a részletes süti-táblázat oszlopfejlécei, a kategória-címkék a "Sütik testreszabása" nézetben, a bekapcsolt (ON) kapcsolók sávjának háttere, a **"Rendben"** gomb kitöltött háttere |
| **Másodlagos szín (secondaryColor)** | A kikapcsolt (OFF) kapcsolók sávjának háttere, minden gomb szegélye (border), az **"Elutasítás"** gomb kitöltött háttere |
| **Kiemelő szín (accentColor)** | A kapcsolók (toggle) pöttyének színe kikapcsolt állapotban, fókusz-keret billentyűzetes navigációnál |
| **Banner pozíciója** | Középre / Jobbra lent / Balra lent — mobilon (767px alatt) mindig középen, olvashatóság miatt |
| **Betűtípus (fontFamily)** | CSS `font-family` érték, pl. `Arial, sans-serif` (alapértelmezett) vagy `"Poppins", sans-serif` — a teljes banner erre vált |
| **Betűtípus stíluslap URL-je (fontUrl)** | Opcionális. Csak akkor kell, ha a választott font nincs már betöltve az oldalon (pl. Google Fonts link: `https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap`). Ha a weboldal saját fontja már be van töltve, ezt üresen hagyva a banner azt használja. |

### Linkek

- **Adatkezelési tájékoztató elérési útja** — csak a domain utáni rész kell, pl. `/adatkezelesi-tajekoztato` (nem a teljes URL).

### Nyelv

- Legördülőből választható 14 nyelv, vagy **Automatikus** (a böngésző nyelvét használja, ismeretlen nyelvnél angolra esik vissza).

### Cookie beállítások

- **Cookie neve** — alapértelmezett `omf_consent_state`. Csak akkor módosítsd, ha ütközne egy másik cookie-val — **figyelem**: ha megváltoztatod, a `.tpl` `WEB_PERMISSIONS` blokkjában a `get_cookies` engedély cookie-név-listáját is frissíteni kell kézzel, különben a sandboxed JS permission-hibával elszáll induláskor (ez egy GTM-sablon-szintű korlátozás, nem konfigurálható dinamikusan).
- **Cookie domain** — aldomainek közötti megosztáshoz, pl. `.pelda.hu`.
- **Cookie lejárata (nap)** — alapértelmezett 365.

### Cross-Domain Consent

Lásd [Cross-Domain Consent működése](#cross-domain-consent-működése) lent.

### Süti lista (Részletes tájékoztató)

Checkboxok szolgáltatónként (Google Analytics, Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads, Microsoft Clarity, Microsoft/Bing Ads, Reddit Ads, Cloudflare, OpenAI/ChatGPT Ads). Csak azokat pipáld be, amelyek ténylegesen futnak az adott oldalon — ez vezérli, hogy a banner "Részletes süti tájékoztató" nézete mely sütiket sorolja fel kategóriánként. A konkrét süti-lista (név, szolgáltató, cél, lejárat, típus) a `banner.js`-ben van, magyar nyelven; a saját hozzájárulás-cookie mindig automatikusan bekerül az Elengedhetetlen listába.

### Consent naplózás (opcionális)

Lásd [Consent naplózás](#consent-naplózás-opcionális) lent.

### Speciális beállítások

- **Banner script alap URL (jsDelivr)** — csak akkor módosítsd, ha másik GitHub repót/fiókot használtok.
- **Banner script verzió (git tag)** — pl. `v1.4.0`. Lásd [Verziózás](#verziózás-és-release-folyamat).

## Design döntések és a GDPR-megfelelés

A banner UI-ja szándékosan követi a szigorúbb (EDPB Taskforce / belga DPA) értelmezést a cookie bannerek dark pattern-jeiről:

- **Nincs előre bepipált kapcsoló.** A "Sütik testreszabása" nézetben a Beállítások/Statisztikai/Marketing kapcsolók alapból kikapcsoltak — csak az Elengedhetetlen aktív. Az előre bepipált opció kifejezett dark pattern, amit kerülni kell.
- **Explicit "Elutasítás" gomb az első rétegen**, nem csak "Rendben" + "Sütik testreszabása". Sok adatvédelmi hatóság (CNIL, belga DPA, EDPB Taskforce) elvárja, hogy az elutasítás ugyanolyan könnyen elérhető legyen, mint az elfogadás, almenü/kattintás-sorozat nélkül.
- **Egyenrangú vizuális súly.** Az "Elutasítás" és a "Rendben" gomb azonos méretű, betűtípusú, kontrasztú — csak a háttérszínük tér el (fő szín vs. másodlagos szín). Ez azért fontos, mert sok hatóság kifejezetten tiltja, hogy az elfogadás gomb vizuálisan dominánsabb legyen, mint az elutasítás.
- **Visszavonás ugyanolyan könnyű, mint az elfogadás.** A lebegő fogaskerék-ikon bármikor újranyitja a bannert, a korábbi döntés betöltve.

Amit **nem** old meg automatikusan a Consent Mode v2:

- **Meta Pixel / TikTok Pixel GTM tag-ek nem olvassák natívan** a `gtag('consent', 'update', ...)` jelzést. Ezeken a tag-eken a GTM felületén be kell kapcsolni: *Tag Settings → Consent Settings → Require additional consent for tag to fire*, és kiválasztani a megfelelő consent type-ot (`ad_storage`, és ha hashelt adatot (Advanced Matching) is küld a tag, `ad_user_data` is).
- **Szerveroldali küldések (Meta CAPI, TikTok Events API, Enhanced Conversions szerveroldalról), ha NEM GTM-en (sGTM) keresztül mennek**, hanem közvetlen backend/CRM hívással: ott a banner semmilyen formában nem gátol automatikusan semmit, mert a böngészőben élő consent-állapotot a backend nem látja. Ott a backend logikának kell ellenőriznie (pl. a naplózott consent-rekord vagy a cookie alapján), mielőtt hashelt adatot küldene tovább.
- Ha **szerveroldali GTM-en** keresztül mennek ezek a hívások, és a consent-állapot megfelelően van továbbítva a kliens → szerver konténer felé, akkor igen, működhet automatikusan — de minden egyes szerveroldali tag-en is külön be kell állítani a Consent Settings-et, nem öröklődik automatikusan.

## Cross-Domain Consent működése

Ha be van kapcsolva (célhosztnevek vesszővel elválasztva megadva), a banner minden, a célhosztnevek egyikére mutató linkre kattintáskor hozzáfűzi a mentett hozzájárulást tartalmazó `omf_consent` URL paramétert. A célhosztra érkezéskor a `banner.js` automatikusan beolvassa ezt a paramétert, elmenti cookie-ba, majd eltünteti az URL-ből — így a látogatónak nem kell újra döntenie a második domainen.

**Az átadott érték alá van írva** egy HMAC-SHA256 aláírással (a böngésző natív Web Crypto API-ján keresztül), a tag "Aláíró kulcs (secret)" mezőjében megadott közös kulccsal. Enélkül bárki craftolhatna egy linket (`?omf_consent=marketing,statistics`), ami a látogató tudta/interakciója nélkül, csendben állítana be teljes hozzájárulást — ezt az aláírás zárja ki: a fogadó oldal csak akkor fogadja el a bejövő paramétert, ha az aláírás a saját, ugyanazzal a kulccsal újraszámolt értékkel egyezik, egyébként simán megjeleníti a bannert, mintha első látogatás lenne. **Mindkét (vagy több) domain GTM tagjében ugyanazt a kulcsot kell beállítani.**

## Consent naplózás (opcionális)

A GDPR 7. cikk (1) bekezdése szerint az adatkezelőnek igazolnia kell tudnia, hogy egy adott látogató mikor, mit fogadott el — a böngészőben élő cookie önmagában ezt nem bizonyítja semmilyen központi, lekérdezhető formában. Ezért a banner opcionálisan el tudja küldeni minden tényleges döntést egy külső naplózó endpointnak.

- **Ha a "Naplózó endpoint URL" mező üres** (alapértelmezett): a funkció teljesen ki van kapcsolva, semmilyen hálózati hívás nem történik.
- **Ha ki van töltve**: minden explicit döntésnél (Rendben / Elutasítás / Beállítások mentése / cross-domain öröklés) egy fire-and-forget `fetch()` POST hívás megy ki, **soha nem blokkolja a UI-t**, egy esetleges hiba (hálózat, adblocker) nem töri el a consent mentését.

A payload mezői:

| Mező | Jelentés |
|---|---|
| `consentId` | Böngészőnkénti, cookie-ban tárolt UUID (`cookieName + '_id'` cookie), ugyanaz marad egy látogató ismételt döntéseinél — ezzel korrelálható egy adott böngésző teljes consent-története |
| `domain`, `pageUrl` | A döntés pillanatában aktuális host/URL |
| `actionType` | `accept_all` / `reject_all` / `save_preferences` / `cross_domain_inherit` |
| `preferences`, `statistics`, `marketing` | boolean, az adott kategória állapota |
| `adblockDetected` | lásd [Adblocker-detektálás](#adblocker-detektálás) |
| `bannerVersion`, `privacyPolicyUrl`, `language`, `userAgent` | kontextus a későbbi audithoz (melyik szöveg/verzió volt érvényben) |

**Megjegyzés:** a végpont IP-címet nem kap és nem is tud kapni — az Apps Script Web App API nem adja oda a hívó IP-jét a scriptnek, ez adatminimalizálási szempontból bónusz, nem hátrány.

### Kész implementáció: Google Apps Script + Google Sheets

[`apps-script/ConsentLogger.gs`](apps-script/ConsentLogger.gs) egy kész, bemásolható Web App, ami a beérkező `domain` mező alapján automatikusan **domainenként külön Spreadsheetbe** írja a sorokat — ha egy domainhez még nincs Spreadsheet, automatikusan létrehoz egyet egy **"consent_logs" nevű Drive mappában** (azt is automatikusan létrehozva, ha még nem létezik), elmenti a párosítást (Script Properties), és emailt küld a script-tulajdonosnak a linkkel.

Ez azért fontos, mert **ugyanaz az egy Web App URL használható több weboldal/ügyfél GTM sablonjában is, anélkül, hogy látnák egymás adatait** — a szétválasztás a script belsejében, fájlszinten történik (nem csak egy közös Sheet különböző füleiként, amit bárki látna, aki hozzáfér a fájlhoz).

#### Hozzáférés-szabályozás — ki mit lát

Két teljesen különálló dolog van:

1. **Az Apps Script Web App "Who has access" beállítása** — ennek **"Anyone"**-nek kell lennie, mert anonim weboldal-látogatók böngészőjéből hívjuk, bejelentkezés nélkül. Ez **csak azt engedi meg, hogy bárki meghívja a `doPost` függvényt** és visszakapjon egy `{ok:true}` választ — semmi mást. Nem ad hozzáférést a mögöttes Spreadsheetekhez.
2. **A Spreadsheetek saját megosztási beállítása** — ez marad **"Restricted"**, és csak a konkrét, névre szóló embereket (vagy egy Google Workspace domaint) add hozzá, akiknek látniuk kell az adott ügyfél adatát. Ez azért működik, mert a script **"Execute as: Me"** módban fut — a scriptnek (és rajta keresztül a hívóknak) *a tulajdonos* jogosultságával van hozzáférése a Spreadsheethez, függetlenül attól, ki hívja meg kívülről a Web App URL-t.

A "Megosztott secret" mező **kötelező** a `ConsentLogger.gs`-ben (ha a script oldali `SHARED_SECRET` Script Property üres, a script minden kérést elutasít — nem indul el "nyitottan"). Ez nem egy feltörhetetlen titok (az endpoint URL-je és az érték is megtalálható a kliensoldali kódban annak, aki az adott ügyfél weboldalának forráskódját megnézi), de konkrétan ez zárja ki azt, hogy bárki csak úgy, a `domain` mező változtatgatásával tömegesen generáljon ismeretlen-domaines rekordokat (lásd lent a domain-limitet is).

#### Telepítés — több ügyfél / multi-tenant routing

1. `script.google.com` → **New project** (álló/standalone script, NE egy konkrét Sheet "Extensions > Apps Script" menüjéből indítsd).
2. Illeszd be a [`apps-script/ConsentLogger.gs`](apps-script/ConsentLogger.gs) tartalmát.
3. Project Settings → Script Properties:
   - `SHARED_SECRET` — **kötelező**, egy saját titkos érték (ugyanezt másold a GTM tag "Megosztott secret" mezőjébe). Ha üresen hagyod, a script minden kérést elutasít.
   - *(opcionális)* minden ügyfél domainjéhez egy property: key = `domain:` + a domain neve (pl. `domain:pospartner.hu`), value = egy már meglévő Spreadsheet ID-ja, ha nem automatikus létrehozást szeretnél, hanem egy adott fájlt.
4. **Deploy → New deployment → Web app**: Execute as: *Me*, Who has access: *Anyone* → a kapott URL-t másold minden ügyfél GTM tagjének "Naplózó endpoint URL" mezőjébe (lehet ugyanaz mindegyiknél).
5. Új domain első beérkező kérésénél a script automatikusan létrehoz egy `ConsentLog - <domain>` Spreadsheetet, és emailt küld — **ez alapból csak a script-tulajdonosnak elérhető**, az ügyfél embereinek hozzáférését kézzel kell utólag megadnod (ez tudatos döntés kell hogy maradjon, nem automatizált). Ez legfeljebb `MAX_AUTO_DOMAINS` (alapértelmezett 25) darab domainig automatikus — efölött az ismeretlen domainek egy közös "OVERFLOW" Spreadsheetbe terelődnek, hogy egy hibás vagy visszaélésszerű küldéssorozat ne tudjon korlátlan sok fájlt/emailt generálni.
6. A beírt mezők (domain, pageUrl, userAgent stb.) Google Sheets "formula injection" ellen szűrve vannak — ha egy érték `=`, `+`, `-` vagy `@` karakterrel kezdődne, a script egy vezető aposztróffal szöveges értelmezést kényszerít ki, mielőtt a Sheetbe írná.

#### Önálló (egy-domaines) használat

Ha valaki a saját weboldalához, a fenti multi-tenant routing nélkül, teljesen önállóan akarja beállítani a naplózást, a lépések ugyanazok (1-4 fent), de az 5. lépésnél nincs más teendő: az első valódi látogatói döntésnél a script a domainjéhez nem talál routing-bejegyzést, ezért automatikusan létrehoz egy saját Spreadsheetet a saját Drive-jában, és emailt küld neki (a script-tulajdonos, tehát az ő fiókjára oldódik fel) a linkkel. A multi-tenant routing ebben az esetben teljesen láthatatlan marad — egyetlen domainre lebutítva magától egyetlen auto-generált Spreadsheetként viselkedik.

## Biztonsági megfontolások

A kódbázis át lett nézve támadói szemszögből, az alábbi hardening-intézkedésekkel:

- **Cross-domain consent hamisítás elleni védelem**: az `omf_consent` URL paraméter HMAC-SHA256-tal alá van írva egy megosztott kulccsal (lásd [Cross-Domain Consent működése](#cross-domain-consent-működése)). Enélkül egy támadó egy sima linkkel (`?omf_consent=marketing,statistics`) csendben, interakció nélkül tudott volna teljes hozzájárulást beállítani bárkinél, aki rákattint.
- **Replay-védelem az aláírt tokenen**: a token tartalmaz egy időbélyeget is, 2 perces lejárati ablakkal. Enélkül a puszta aláírás önmagában nem lett volna elég — mivel csak 8 lehetséges kategória-kombináció van, egy támadónak elég lett volna *egyetlen* valódi tokent megfigyelnie (pl. a saját böngészőjében elfogadva a sütiket, vagy egy bárhol megosztott linkből), hogy azt utána korlátlanul, bármeddig újrajátszhassa más áldozatokon. A lejárati ablak miatt egy ellopott/megosztott token percek alatt érvénytelenné válik, miközben a valódi, azonnali kattintás-továbbítás még mindig zökkenőmentesen működik (a token percenként frissül a háttérben, amíg az oldal nyitva van).
- **CSS injection elleni védelem a szín- és betűtípus-mezőknél**: a `mainColor`/`secondaryColor`/`accentColor` értékek HEX-szín mintára, a `fontFamily` egy szűk, biztonságos karakterkészletre van validálva, mielőtt egy `<style>` blokk szövegébe kerülnének. Ezek a mezők nyers string-interpolációval épülnek be a CSS-be (nem HTML-kontextusban vannak, tehát a HTML-escape itt nem védene) — érvénytelen/gyanús érték esetén a biztonságos alapértelmezettre esnek vissza, ahelyett hogy kitörhetnének a `:root{}` blokkból és tetszőleges CSS szabályt (pl. elrejtett Elutasítás gomb, hamis overlay) injektálhatnának.
- **Google Sheets formula injection elleni védelem**: a `ConsentLogger.gs` minden string mezőt szűr, mielőtt Sheetbe írná — `=`, `+`, `-`, `@` kezdetű értékek elé aposztróf kerül, hogy a Sheets ne próbálja képletként kiértékelni őket (ami adatkiszivárgásra vagy phishing-linkek elrejtésére lenne használható).
- **Kötelező megosztott secret a naplózó endpointnál**: a `SHARED_SECRET` Script Property nélkül a `ConsentLogger.gs` minden kérést elutasít — nincs "nyitott" alapállapot.
- **Domain-limit az automatikus Spreadsheet-létrehozásnál**: `MAX_AUTO_DOMAINS` fölött az ismeretlen domainek egy közös overflow Spreadsheetbe terelődnek, hogy egy visszaélésszerű küldéssorozat ne tudjon korlátlan sok fájlt/emailt generálni.
- **HTML-escape minden dinamikus, GTM-mezőből származó értéken**, ami a banner markup-jába kerül (`privacyPolicyUrl`, `cookieName`, `cookieExpiryDays`) — defense-in-depth, ha a GTM konténerhez való hozzáférés valaha alacsonyabb bizalmi szintű felhasználókkal is megosztásra kerülne.
- **`Secure` cookie-flag** HTTPS-oldalon, protokoll-downgrade elleni védelemként.
- A naplózó endpoint hibaüzenetei nem szivárogtatnak ki nyers kivétel-szöveget a hívónak (`Logger.log()`-ba kerül, a válasz generikus).

## Adblocker-detektálás

A banner egy best-effort, cosmetic-filter alapú heurisztikával (egy rejtett "csali" `<div>` beszúrása ismert AdBlock-class-nevekkel, majd ~100ms után ellenőrzi, eltüntette-e a böngésző) megpróbálja észlelni, hogy a látogatónál fut-e hirdetésblokkoló, és ezt az `adblockDetected` mezőben továbbítja a naplózó endpointnak (ha be van kapcsolva).

**Ez nem 100%-os:**
- A böngésző-szintű védelmeket (Safari ITP, Brave Shields, Firefox strict ETP) nem feltétlenül kapja el — csak a cosmetic-filter (DOM/CSS-alapú) blokkolókat (AdBlock Plus, uBlock Origin alaplistái).
- A legagresszívabb blokkolók esetenként magát a naplózó `fetch()` hívást is blokkolhatják, ha a végpont URL-je "trackeres" mintázatúnak tűnik — emiatt a mért arány inkább **alsó becslés**, mint pontos mérőszám (pont az dobja ki legnagyobb eséllyel a mintából, aki a legagresszívabban blokkol).

## Verziózás és release folyamat

A `main` branch mindig a legfrissebb, potenciálisan instabil kódot tartalmazza. **Éles használatra mindig egy konkrét git tag/release verziót állíts be** a tag "Speciális beállítások" részében (pl. `v1.4.0`), soha ne a `main` branch-et — így egy jövőbeli módosítás nem megy élesbe automatikusan minden ügyfél oldalán.

Új verzió kiadása:
1. GitHub → **Releases** → **Draft a new release**
2. Tag: `vX.Y.Z` (pl. `v1.4.0`)
3. **Publish release**
4. A tag "Banner script verzió" mezőjében írd át `vX.Y.Z`-re, majd mentsd/publikáld a GTM konténer új verzióját

**Fontos:** a jsDelivr CDN a konkrét git tag-hez tartozó fájlt cache-eli — egy helyi módosítás csak akkor jelenik meg élesben, ha új tag/release készül és a GTM tag verzió-mezője erre frissül.

## Helyi tesztelés

A `banner.js` egy önálló szkript, bármilyen statikus HTML oldalról tesztelhető helyi szerverrel:

```html
<script>
window.__omfBannerConfig = {
  mainColor: '#4F74CB',
  secondaryColor: '#9CA3AF',
  accentColor: '#4F9EFB',
  bannerPosition: 'center',
  privacyPolicyUrl: '/adatkezelesi-tajekoztato',
  defaultLang: 'hu',
  cookieExpiryDays: 365,
  crossDomain: { enabled: false, hosts: [] },
  cookieVendors: { ga: true, googleAds: true, meta: true, cloudflare: true }
};
</script>
<script src="banner.js"></script>
```

A consent-naplózás teszteléséhez elég egy helyi szerver, ami fogadja a POST kéréseket (`consentLogUrl` a configban egy `http://localhost:xxxx` címre mutasson) — nem kell hozzá valódi Apps Script deploy a fejlesztés alatt.

## Támogatott nyelvek

en, hu, de, es, fr, it, pt, ro, sk, bg, hr, cs, pl, ja

## Fájlstruktúra

```
consent-mode/
├── banner.js                      # a tényleges consent banner szkript (jsDelivr-ről töltődik be)
├── GCMv2-Consent-Banner.tpl        # GTM sablon-tag (Consent Mode v2 init + banner betöltő)
├── assets/
│   └── settings-icon.svg          # a lebegő fogaskerék-ikon
├── apps-script/
│   └── ConsentLogger.gs           # opcionális consent-naplózó Apps Script Web App
├── README.md
└── LICENSE
```

## Licenc

MIT — lásd [`LICENSE`](LICENSE).
