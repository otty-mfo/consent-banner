___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Consent Mode v2 - Banner Loader (custom)",
  "description": "Beállítja a banner konfigurációját (window.__parBannerConfig), majd betölti a Selfhosted banner.js szkriptet a megadott jsDelivr verzióról.",
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
        "help": "A cím, a linkek és a kapcsolók feliratának színe. A gombok (Rendben / Sütik testreszabása) színe fixen fekete-fehér, ezt a mező nem befolyásolja."
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
        "help": "Csak akkor módosítsd, ha ütközne egy másik cookie-val. Az Init tag-nek ugyanezt a nevet kell használnia."
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
    "name": "advancedGroup",
    "displayName": "Speciális beállítások",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "scriptBaseUrl",
        "displayName": "Banner script alap URL (jsDelivr)",
        "simpleValueType": true,
        "defaultValue": "https://cdn.jsdelivr.net/gh/patakiattilaroland-ppc/consent-banner",
        "help": "Csak akkor módosítsd, ha másik GitHub repót/fiókot használtok."
      },
      {
        "type": "TEXT",
        "name": "scriptVersion",
        "displayName": "Banner script verzió (git tag)",
        "simpleValueType": true,
        "defaultValue": "v1.0.0",
        "help": "A GitHub Releases alatt létrehozott tag neve, pl. v1.0.0. Új verzió esetén itt lehet frissíteni; publikálás (GTM verzió mentése) nélkül nem lép élesbe a régi oldalakon."
      }
    ]
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

const log = require('logToConsole');
const setInWindow = require('setInWindow');
const injectScript = require('injectScript');
const makeNumber = require('makeNumber');

const crossDomainHostsList = (data.crossDomainHosts || '')
  .split(',')
  .map(function (h) { return h.trim(); })
  .filter(function (h) { return h.length > 0; });

const config = {
  primaryColor: data.primaryColor || '#4F74CB',
  bannerPosition: data.bannerPosition || 'center',
  privacyPolicyUrl: data.privacyPolicyPath || '',
  defaultLang: data.defaultLang || '',
  cookieName: data.cookieName || 'par_consent_state',
  cookieDomain: data.cookieDomain || '',
  cookieExpiryDays: makeNumber(data.cookieExpiryDays) || 365,
  crossDomain: {
    enabled: data.enableCrossDomain === true,
    hosts: crossDomainHostsList
  }
};

log('parBanner config =', config);

setInWindow('__parBannerConfig', config, true);

const baseUrl = data.scriptBaseUrl || 'https://cdn.jsdelivr.net/gh/patakiattilaroland-ppc/consent-banner';
const version = data.scriptVersion || 'v1.0.0';
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

Created on 9/28/2026


