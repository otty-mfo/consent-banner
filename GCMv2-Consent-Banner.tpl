___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Consent Mode v2 - Consent + Banner (custom)",
  "description": "Beállítja a Consent Mode v2 alapállapotát, visszatölti a korábban mentett hozzájárulást a cookie-ból, majd betölti a Selfhosted banner.js szkriptet a megadott jsDelivr verzióról.",
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "GROUP",
    "name": "appearanceGroup",
    "displayName": "Megjelenés",
    "groupStyle": "ZIPPY_OPEN",
    "subParams": [
      {
        "type": "TEXT",
        "name": "primaryColor",
        "displayName": "Kiemelő szín (HEX)",
        "simpleValueType": true,
        "defaultValue": "#4F74CB",
        "valueHint": "#4F74CB",
        "help": "A cím, a linkek és a kapcsolók feliratának színe. A gombok színét a lenti két mező szabályozza."
      },
      {
        "type": "TEXT",
        "name": "buttonColor",
        "displayName": "Gomb szín (HEX)",
        "simpleValueType": true,
        "defaultValue": "#000000",
        "valueHint": "#000000",
        "help": "A fő gomb (pl. 'Összes elfogadása') háttérszíne. A felirat ekkor fehér marad, ezért túl világos szín választásakor a szöveg nehezen olvasható lehet."
      },
      {
        "type": "TEXT",
        "name": "buttonBorderColor",
        "displayName": "Gomb kerete szín (HEX)",
        "simpleValueType": true,
        "defaultValue": "#000000",
        "valueHint": "#000000",
        "help": "A banner összes gombjának (pl. 'Sütik testreszabása', 'Elfogadás a kijelöltek alapján') keretszíne."
      },
      {
        "type": "SELECT",
        "name": "bannerPosition",
        "displayName": "Banner pozíciója",
        "simpleValueType": true,
        "defaultValue": "center",
        "selectItems": [
          { "value": "center", "displayValue": "Középre" },
          { "value": "bottom-right", "displayValue": "Jobbra lent" },
          { "value": "bottom-left", "displayValue": "Balra lent" }
        ],
        "help": "A banner ablak elhelyezkedése a képernyőn. Mobilon (767px alatt) mindig középen jelenik meg a jobb olvashatóság érdekében."
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "linksGroup",
    "displayName": "Linkek",
    "groupStyle": "ZIPPY_OPEN",
    "subParams": [
      {
        "type": "TEXT",
        "name": "privacyPolicyPath",
        "displayName": "Adatkezelési tájékoztató elérési útja",
        "simpleValueType": true,
        "valueValidators": [
          {
            "type": "NON_EMPTY"
          }
        ],
        "help": "Csak a domain utáni rész kell, NEM a teljes URL. Pl. ha a teljes cím https://pelda.hu/adatkezelesi-tajekoztato, ide csak ezt írd: /adatkezelesi-tajekoztato"
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "languageGroup",
    "displayName": "Nyelv",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "SELECT",
        "name": "defaultLang",
        "displayName": "Alapértelmezett nyelv",
        "simpleValueType": true,
        "defaultValue": "",
        "selectItems": [
          { "value": "", "displayValue": "Automatikus (böngésző nyelve)" },
          { "value": "hu", "displayValue": "Magyar" },
          { "value": "en", "displayValue": "English" },
          { "value": "de", "displayValue": "Deutsch" },
          { "value": "es", "displayValue": "Español" },
          { "value": "fr", "displayValue": "Français" },
          { "value": "it", "displayValue": "Italiano" },
          { "value": "pt", "displayValue": "Português" },
          { "value": "ro", "displayValue": "Română" },
          { "value": "sk", "displayValue": "Slovenčina" },
          { "value": "bg", "displayValue": "Български" },
          { "value": "hr", "displayValue": "Hrvatski" },
          { "value": "cs", "displayValue": "Čeština" },
          { "value": "pl", "displayValue": "Polski" },
          { "value": "ja", "displayValue": "日本語" }
        ],
        "help": "Ha 'Automatikus'-ra hagyod, a banner a látogató böngészőjének nyelvét próbálja használni."
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "cookieGroup",
    "displayName": "Cookie beállítások",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "cookieName",
        "displayName": "Cookie neve",
        "simpleValueType": true,
        "defaultValue": "par_consent_state",
        "help": "Csak akkor módosítsd, ha ütközne egy másik cookie-val."
      },
      {
        "type": "TEXT",
        "name": "cookieDomain",
        "displayName": "Cookie domain",
        "simpleValueType": true,
        "defaultValue": "",
        "help": "Hagyd üresen a jelenlegi domainhez. Aldomainek közötti megosztáshoz add meg így: .pelda.hu"
      },
      {
        "type": "TEXT",
        "name": "cookieExpiryDays",
        "displayName": "Cookie lejárata (nap)",
        "simpleValueType": true,
        "defaultValue": "365"
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "crossDomainGroup",
    "displayName": "Cross-Domain Consent",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "CHECKBOX",
        "name": "enableCrossDomain",
        "checkboxText": "Cross-domain consent megosztás engedélyezése",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Ha engedélyezed, a hozzájárulás URL paraméteren (par_consent) keresztül átadódik a megadott célhosztokra mutató linkeken kattintáskor. A bejövő paramétert a céloldal automatikusan feldolgozza és eltünteti az URL-ből."
      },
      {
        "type": "TEXT",
        "name": "crossDomainHosts",
        "displayName": "Célhosztnevek",
        "simpleValueType": true,
        "defaultValue": "",
        "help": "Vesszővel elválasztott hosztnevek, pl.: shop.pelda.hu, blog.pelda.hu. A jelenlegi domain automatikusan kimarad.",
        "enablingConditions": [
          {
            "paramName": "enableCrossDomain",
            "paramValue": true,
            "type": "EQUALS"
          }
        ]
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "cookieListGroup",
    "displayName": "Süti lista (Részletes tájékoztató)",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "CHECKBOX",
        "name": "includeGoogleAnalytics",
        "checkboxText": "Google Analytics (GA4)",
        "simpleValueType": true,
        "defaultValue": true,
        "help": "A _ga / _ga_# sütik feltüntetése a Statisztikai listában."
      },
      {
        "type": "CHECKBOX",
        "name": "includeGoogleAds",
        "checkboxText": "Google Ads",
        "simpleValueType": true,
        "defaultValue": true,
        "help": "A _gcl_au / _gcl_ls / pagead sütik feltüntetése a Marketing listában."
      },
      {
        "type": "CHECKBOX",
        "name": "includeMetaAds",
        "checkboxText": "Meta (Facebook/Instagram) Ads",
        "simpleValueType": true,
        "defaultValue": true,
        "help": "A _fbp és lastExternalReferrer* sütik feltüntetése a Marketing listában."
      },
      {
        "type": "CHECKBOX",
        "name": "includeTikTokAds",
        "checkboxText": "TikTok Ads",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Csak akkor pipáld be, ha az oldalon fut TikTok pixel/hirdetés."
      },
      {
        "type": "CHECKBOX",
        "name": "includeLinkedInAds",
        "checkboxText": "LinkedIn Ads / Insight Tag",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Csak akkor pipáld be, ha az oldalon fut LinkedIn Insight Tag vagy beágyazás."
      },
      {
        "type": "CHECKBOX",
        "name": "includeMicrosoftClarity",
        "checkboxText": "Microsoft Clarity",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Csak akkor pipáld be, ha az oldalon fut Clarity heatmap/session replay szkript."
      },
      {
        "type": "CHECKBOX",
        "name": "includeMicrosoftAds",
        "checkboxText": "Microsoft/Bing Ads (UET)",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Csak akkor pipáld be, ha ténylegesen fut Microsoft/Bing Ads kampány - a UET tag néha a Clarity taggel együtt települ, aktív kampány nélkül is."
      },
      {
        "type": "CHECKBOX",
        "name": "includeRedditAds",
        "checkboxText": "Reddit Ads",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Csak akkor pipáld be, ha az oldalon fut Reddit pixel/hirdetés."
      },
      {
        "type": "CHECKBOX",
        "name": "includeCloudflare",
        "checkboxText": "Cloudflare (bot-védelem)",
        "simpleValueType": true,
        "defaultValue": true,
        "help": "A __cf_bm süti feltüntetése az Elengedhetetlen listában, ha az oldal Cloudflare mögött fut."
      },
      {
        "type": "CHECKBOX",
        "name": "includeOpenAIAds",
        "checkboxText": "OpenAI / ChatGPT Ads",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Csak akkor pipáld be, ha az oldalon fut az OpenAI konverziómérő pixelje (ChatGPT-ben futó hirdetések attribúciójához). A __oppref süti feltüntetése a Marketing listában."
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "advancedGroup",
    "displayName": "Speciális beállítások",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "scriptBaseUrl",
        "displayName": "Banner script alap URL (jsDelivr)",
        "simpleValueType": true,
        "defaultValue": "https://cdn.jsdelivr.net/gh/otty-mfo/consent-banner",
        "help": "Csak akkor módosítsd, ha másik GitHub repót/fiókot használtok."
      },
      {
        "type": "TEXT",
        "name": "scriptVersion",
        "displayName": "Banner script verzió (git tag)",
        "simpleValueType": true,
        "defaultValue": "v1.3.0",
        "help": "A GitHub Releases alatt létrehozott tag neve, pl. v1.3.0. Új verzió esetén itt lehet frissíteni; publikálás (GTM verzió mentése) nélkül nem lép élesbe a régi oldalakon."
      }
    ]
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

const log = require('logToConsole');
const setInWindow = require('setInWindow');
const injectScript = require('injectScript');
const makeNumber = require('makeNumber');
const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const getCookieValues = require('getCookieValues');

const cookieName = data.cookieName || 'par_consent_state';

// ---- 1) Consent Mode v2 alapállapot + visszatöltés cookie-ból ----

setDefaultConsentState({
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'personalization_storage': 'denied',
  'functionality_storage': 'granted',
  'security_storage': 'granted',
  'wait_for_update': 1000,
});

const storedValues = getCookieValues(cookieName);
if (storedValues && storedValues.length > 0) {
  const categories = storedValues[0];
  const has = function (key) {
    return categories.indexOf(key) > -1;
  };
  updateConsentState({
    'ad_storage': has('marketing') ? 'granted' : 'denied',
    'ad_user_data': has('marketing') ? 'granted' : 'denied',
    'ad_personalization': has('marketing') ? 'granted' : 'denied',
    'analytics_storage': has('statistics') ? 'granted' : 'denied',
    'personalization_storage': has('personalization') ? 'granted' : 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  });
}

// ---- 2) Banner konfiguráció beállítása + banner.js betöltése ----

const crossDomainHostsList = (data.crossDomainHosts || '')
  .split(',')
  .map(function (h) { return h.trim(); })
  .filter(function (h) { return h.length > 0; });

const config = {
  primaryColor: data.primaryColor || '#4F74CB',
  buttonColor: data.buttonColor || '#000000',
  buttonBorderColor: data.buttonBorderColor || '#000000',
  bannerPosition: data.bannerPosition || 'center',
  privacyPolicyUrl: data.privacyPolicyPath || '',
  defaultLang: data.defaultLang || '',
  cookieName: cookieName,
  cookieDomain: data.cookieDomain || '',
  cookieExpiryDays: makeNumber(data.cookieExpiryDays) || 365,
  crossDomain: {
    enabled: data.enableCrossDomain === true,
    hosts: crossDomainHostsList
  },
  cookieVendors: {
    ga: data.includeGoogleAnalytics === true,
    googleAds: data.includeGoogleAds === true,
    meta: data.includeMetaAds === true,
    tiktok: data.includeTikTokAds === true,
    linkedin: data.includeLinkedInAds === true,
    clarity: data.includeMicrosoftClarity === true,
    microsoftAds: data.includeMicrosoftAds === true,
    reddit: data.includeRedditAds === true,
    cloudflare: data.includeCloudflare === true,
    openai: data.includeOpenAIAds === true
  }
};

log('parBanner config =', config);

setInWindow('__parBannerConfig', config, true);

const baseUrl = data.scriptBaseUrl || 'https://cdn.jsdelivr.net/gh/otty-mfo/consent-banner';
const version = data.scriptVersion || 'v1.3.0';
const scriptUrl = baseUrl + '@' + version + '/banner.js';

injectScript(scriptUrl, data.gtmOnSuccess, data.gtmOnFailure, scriptUrl);


___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_consent",
        "versionId": "1"
      },
      "param": [
        {
          "key": "consentTypes",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "ad_storage" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "analytics_storage" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "functionality_storage" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "personalization_storage" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "security_storage" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "ad_user_data" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "consentType" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" }
                ],
                "mapValue": [
                  { "type": 1, "string": "ad_personalization" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true }
                ]
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "get_cookies",
        "versionId": "1"
      },
      "param": [
        {
          "key": "cookieAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "cookieNames",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "par_consent_state"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_globals",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keys",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "key" },
                  { "type": 1, "string": "read" },
                  { "type": 1, "string": "write" },
                  { "type": 1, "string": "execute" }
                ],
                "mapValue": [
                  { "type": 1, "string": "__parBannerConfig" },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": true },
                  { "type": 8, "boolean": false }
                ]
              }
            ]
          }
        }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "inject_script",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://cdn.jsdelivr.net/*"
              }
            ]
          }
        }
      ]
    },
    "isRequired": true
  }
]


___TESTS___

scenarios: []


___NOTES___

Created on 9/29/2026. Egyesített Init + Banner Loader sablon (korábban két külön tag volt: GCMv2-Init.tpl + GCMv2-Banner-Loader.tpl).
