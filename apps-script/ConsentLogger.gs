/**
 * Consent-naplózó Apps Script Web App a GCMv2 Consent + Banner sablonhoz.
 *
 * Több weboldal/ügyfél esetén EGYETLEN közös Web App URL-t használsz minden
 * GTM sablonban, de minden domain adata a SAJÁT, külön Spreadsheet fájljába
 * kerül - a routing a beérkező `domain` mező alapján történik (lásd lent).
 * Ez valódi elkülönítést ad: aki csak az egyik ügyfél Spreadsheetjéhez fér
 * hozzá, az a másikét nem is látja - ellentétben azzal, mintha egy közös
 * Sheet különböző füleit használnánk, amit bárki látna, aki a fájlt megnyitja.
 *
 * Telepítés (FONTOS: ÁLLÓ/standalone script, NEM egy konkrét Sheethez kötött):
 * 1. script.google.com > New project (ne egy Sheet "Extensions > Apps Script"
 *    menüjéből indítsd, mert ez később egy konkrét Sheethez kötné a projektet).
 * 2. Illeszd be ezt a kódot.
 * 3. Project Settings (bal oldali fogaskerék) > Script Properties > Add property:
 *    - `SHARED_SECRET` - egy saját, titkos szöveg. EZ KÖTELEZŐ (nem opcionális!):
 *      ha üresen hagyod, a script MINDEN kérést elutasít, nem indul el üres
 *      secret-tel. Ugyanezt az értéket másold a GTM tag "Megosztott secret"
 *      mezőjébe is.
 *    - *(opcionális)* minden ügyfél domainjéhez egy property: key = `domain:` +
 *      a domain neve (pl. `domain:pospartner.hu`), value = egy már meglévő
 *      Spreadsheet ID-ja. Ha egy domainhez nincs ilyen property, a script
 *      automatikusan létrehoz egy újat és elmenti ide - utána már azt használja.
 * FONTOS: ha egy már korábban deployolt projektbe illeszted be ezt a frissített
 * kódot (a `consent_logs` mappás verziót), a script most a Drive-hoz is
 * hozzáfér (`DriveApp`), nem csak a Sheets-hez - ez tágabb jogosultság, mint
 * korábban, ezért újra le kell futtatnod a Deploy > Manage deployments > Edit
 * (a ceruza ikon) > New version > Deploy lépést, és az engedélykérő ablak
 * ismét felugrik (Advanced > Go to... (unsafe) > Allow).
 *
 * 4. Deploy > New deployment > Web app:
 *    - Execute as: Me (a te fiókod)
 *    - Who has access: Anyone
 *    (Ez a lépés KÖTELEZŐ, mert anonim weboldal-látogatók böngészőjéből hívjuk,
 *    bejelentkezés nélkül. Ez NEM teszi az adatot nyilvánossá - a script a TE
 *    jogosultságoddal fut, a mögöttes Spreadsheetek saját megosztása marad
 *    a mérvadó, lásd lent. A SHARED_SECRET viszont megszűri, hogy csak az
 *    tudjon írni, aki ismeri a kulcsot.)
 * 5. A kapott "Web app URL"-t másold be minden ügyfél GTM tagjének
 *    "Naplózó endpoint URL" mezőjébe - lehet ugyanaz mindegyiknél.
 *
 * ÚJ ÜGYFÉL FELVÉTELE:
 * Az első beérkező kérésnél, ha a domainhez még nincs property, a script
 * automatikusan létrehoz egy "ConsentLog - <domain>" nevű új Spreadsheetet
 * egy "consent_logs" nevű Drive mappában (ha a mappa még nem létezik, azt is
 * létrehozza), és emailt küld neked a script-tulajdonos címére (lásd NOTIFY_EMAIL) a
 * létrejött fájl linkjével. EZ A FÁJL ALAPBÓL CSAK NEKED ÉRHETŐ EL - az ügyfél
 * saját embereinek hozzáférését neked kell utólag, kézzel megadnod (Drive-ban
 * megosztás), mert ez egy tudatos, emberi döntés kell hogy maradjon, nem
 * automatizált. Az automatikus létrehozás `MAX_AUTO_DOMAINS` darabra van
 * korlátozva - efölött az ismeretlen domainek egy közös "OVERFLOW" Spreadsheetbe
 * kerülnek, hogy egy hibás/visszaélésszerű küldés (pl. folyamatosan változó,
 * kitalált domain értékekkel) ne tudjon korlátlan sok fájlt és emailt generálni.
 *
 * A SPREADSHEETEK MEGOSZTÁSA:
 * Egyiket se állítsd "Anyone with the link"-re. A script "Execute as: Me"
 * miatt a scriptnek (és rajta keresztül a hívóknak) nincs szüksége arra, hogy
 * bármelyik Spreadsheet nyilvános legyen. Mindegyiket hagyd "Restricted"
 * (korlátozott) módban, és csak az adott ügyfélhöz tartozó konkrét embereket
 * add hozzá névre szólóan (vagy a saját Google Workspace domainjüket, ha az
 * ügyfélnek van ilyenje).
 */

var MAX_AUTO_DOMAINS = 25;

var SHARED_SECRET = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET') || '';
var NOTIFY_EMAIL = Session.getEffectiveUser().getEmail();

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (!SHARED_SECRET || data.secret !== SHARED_SECRET) {
      return jsonResponse({ ok: false, error: 'forbidden' });
    }

    var domain = sanitizeDomain_(data.domain);
    var sheet = getOrCreateLogSheet_(domain);
    sheet.appendRow([
      new Date(),
      sanitizeForSheet_(data.consentId || ''),
      sanitizeForSheet_(domain),
      sanitizeForSheet_(data.pageUrl || ''),
      sanitizeForSheet_(data.actionType || ''),
      data.preferences === true,
      data.statistics === true,
      data.marketing === true,
      sanitizeForSheet_(data.adblockDetected === null || data.adblockDetected === undefined ? '' : data.adblockDetected),
      sanitizeForSheet_(data.bannerVersion || ''),
      sanitizeForSheet_(data.privacyPolicyUrl || ''),
      sanitizeForSheet_(data.language || ''),
      sanitizeForSheet_(data.userAgent || '')
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    Logger.log('ConsentLogger doPost error: ' + err);
    return jsonResponse({ ok: false, error: 'internal_error' });
  }
}

/**
 * Megakadályozza a Google Sheets "formula injection" támadást: ha egy cella
 * tartalma =, +, -, @ karakterrel kezdődik, a Sheets megpróbálja képletként
 * kiértékelni (pl. =IMPORTXML(...) adatot szivárogtathat ki, =HYPERLINK(...)
 * phishing-linket rejthet el). Egy vezető aposztróf kikényszeríti a szöveges
 * értelmezést, a Google saját ajánlása szerint.
 */
function sanitizeForSheet_(value) {
  if (typeof value !== 'string') return value;
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

/** Levágja a vezérlő karaktereket és korlátozza a hosszt, mielőtt fájlnévként/property-kulcsként használnánk. */
function sanitizeDomain_(domain) {
  var d = (domain || 'ismeretlen-domain').toString().replace(/[\r\n\t]/g, '');
  return d.substring(0, 253) || 'ismeretlen-domain';
}

/**
 * Domainenkénti routing: visszaadja (és szükség esetén létrehozza) a konkrét
 * domainhez tartozó Spreadsheet "ConsentLog" fülét. A domain -> spreadsheetId
 * párosítás a Script Properties-ben van tárolva (`domain:<domain>` kulcs alatt),
 * kódmódosítás/redeploy nélkül bővíthető. `MAX_AUTO_DOMAINS` fölött az új,
 * ismeretlen domainek egy közös overflow Spreadsheetbe terelődnek.
 */
function getOrCreateLogSheet_(domain) {
  var props = PropertiesService.getScriptProperties();
  var propKey = 'domain:' + domain;
  var spreadsheetId = props.getProperty(propKey);
  var ss;
  var isNew = false;

  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
  } else if (countAutoDomains_(props) >= MAX_AUTO_DOMAINS) {
    ss = getOrCreateOverflowSpreadsheet_(props);
  } else {
    ss = SpreadsheetApp.create('ConsentLog - ' + domain);
    DriveApp.getFileById(ss.getId()).moveTo(getOrCreateLogsFolder_());
    props.setProperty(propKey, ss.getId());
    isNew = true;
  }

  var sheet = ss.getSheetByName('ConsentLog');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('ConsentLog');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp', 'consent_id', 'domain', 'page_url', 'action_type',
      'preferences', 'statistics', 'marketing', 'adblock_detected',
      'banner_version', 'privacy_policy_url', 'language', 'user_agent'
    ]);
    sheet.setFrozenRows(1);
  }

  if (isNew && NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'Új domain a consent-naplózóban: ' + domain,
        'Új Spreadsheet jött létre automatikusan a(z) "' + domain + '" domain consent-naplójához:\n' +
        ss.getUrl() + '\n\n' +
        'Ez alapból csak a te Google-fiókodhoz van hozzárendelve. Ha az ügyfélnek is ' +
        'látnia kell, oszd meg kézzel a megfelelő emberekkel (Restricted módban, ne ' +
        '"Anyone with the link"-kel).'
      );
    } catch (mailErr) {
      // Ha a mail küldés sikertelen (pl. napi kvóta), a naplózás akkor is folytatódik.
    }
  }

  return sheet;
}

function getOrCreateLogsFolder_() {
  var folders = DriveApp.getFoldersByName('consent_logs');
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder('consent_logs');
}

function countAutoDomains_(props) {
  var all = props.getKeys();
  var count = 0;
  for (var i = 0; i < all.length; i++) {
    if (all[i].indexOf('domain:') === 0) count++;
  }
  return count;
}

function getOrCreateOverflowSpreadsheet_(props) {
  var id = props.getProperty('OVERFLOW_SHEET_ID');
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  var ss = SpreadsheetApp.create('ConsentLog - OVERFLOW (domain limit elérve)');
  DriveApp.getFileById(ss.getId()).moveTo(getOrCreateLogsFolder_());
  props.setProperty('OVERFLOW_SHEET_ID', ss.getId());
  if (NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'Consent-naplózó: domain-limit elérve',
        'A MAX_AUTO_DOMAINS (' + MAX_AUTO_DOMAINS + ') limit elérve - az ezután érkező, ' +
        'még ismeretlen domainek egy közös OVERFLOW Spreadsheetbe kerülnek:\n' + ss.getUrl() + '\n\n' +
        'Ha ez várt (valóban ennyi ügyfél van), emeld meg a MAX_AUTO_DOMAINS értéket a scriptben, ' +
        'vagy vedd fel kézzel a Script Properties-ben a hiányzó domain -> Spreadsheet ID párosításokat.'
      );
    } catch (mailErr) {}
  }
  return ss;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
