/*!
 * Selfhosted, config-driven cookie consent banner for Google Consent Mode v2.
 * Reads window.__omfBannerConfig (set by the GTM template) for:
 * mainColor, secondaryColor, accentColor, bannerPosition, privacyPolicyUrl, defaultLang,
 * fontFamily (CSS font-family value), fontUrl (optional stylesheet URL, e.g. Google Fonts CSS2 link),
 * cookieName, cookieDomain, cookieExpiryDays,
 * crossDomain: { enabled, hosts: [...], secret (required for the link to actually carry signed consent) },
 * consentLogUrl (optional Apps Script Web App endpoint), consentLogSecret (optional shared secret)
 */
(function () {
	// These two values get written raw into a <style> block's text content (not
	// HTML), so escapeHtml() would be the wrong defense here - a value containing
	// "}" could terminate the surrounding CSS rule early and inject arbitrary CSS
	// (e.g. hide the Reject button, overlay fake content). Restrict to a safe charset instead.
	function sanitizeHexColor(value, fallback) {
		return /^#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{2})?)?$/.test(value || '') ? value : fallback;
	}
	function sanitizeFontFamily(value, fallback) {
		return /^[A-Za-z0-9\s,'".\-]+$/.test(value || '') ? value : fallback;
	}

	var cfg = window.__omfBannerConfig || {};
	var mainColor = sanitizeHexColor(cfg.mainColor, '#4F74CB');
	var secondaryColor = sanitizeHexColor(cfg.secondaryColor, '#9CA3AF');
	var accentColor = sanitizeHexColor(cfg.accentColor, '#4F9EFB');
	var allowedPositions = ['center', 'bottom-right', 'bottom-left'];
	var bannerPosition = allowedPositions.indexOf(cfg.bannerPosition) > -1 ? cfg.bannerPosition : 'center';
	var settingsButtonSide = bannerPosition === 'bottom-left' ? 'right' : 'left';
	var privacyPolicyUrl = cfg.privacyPolicyUrl || '';
	var cookieName = cfg.cookieName || cfg.storageKey || 'omf_consent_state';
	var cookieDomain = cfg.cookieDomain || '';
	var cookieExpiryDays = cfg.cookieExpiryDays || 365;
	var crossDomainEnabled = !!(cfg.crossDomain && cfg.crossDomain.enabled);
	var crossDomainHosts = (cfg.crossDomain && cfg.crossDomain.hosts) || [];
	var crossDomainSecret = (cfg.crossDomain && cfg.crossDomain.secret) || '';
	var cookieVendors = cfg.cookieVendors || {};
	var fontFamily = sanitizeFontFamily(cfg.fontFamily, 'Arial, sans-serif');
	var fontUrl = cfg.fontUrl || '';
	var consentLogUrl = cfg.consentLogUrl || '';
	var consentLogSecret = cfg.consentLogSecret || '';
	var adblockDetected = null;
	var bannerVersion = cfg.scriptVersion || '';

	function escapeHtml(str) {
		return String(str).replace(/[&<>"']/g, function (ch) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
		});
	}

	// ---- translations ----
var OmfDictionary = {
'defaultLang' : 'en',
'trans_words': {
'en' : {				
	'omf-header-title-text' : '<p>This website uses cookies</p>',
	'omf-body-title-text' : '<p>To ensure the proper functioning of the website, the use of certain cookies is essential. Additionally, we use cookies for statistical, marketing measurement, and advertising purposes. These latter cookies are loaded only after clicking the "Accept" button. For more information about cookies, please refer to our Privacy Policy.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Privacy Policy</a></p>`,
	'omf-body-necessary-title-text' : 'Necessary',
	'omf-body-preferences-title-text' : 'Personalization',
	'omf-body-analytics-title-text' : 'Statistics',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Manage Cookies',
	'omf-footer-accept-selection-text' : 'Save preferences',
	'omf-footer-accept-all-text' : 'Accept',
	'omf-footer-reject-all-text' : 'Reject All',
	'omf-body-details-link-text' : 'Open detailed cookie notice',
	'omf-footer-back-text' : 'Back',
},
'hu' : {			
	'omf-header-title-text' : '<p>Ez a weboldal sütiket használ</p>',
	'omf-body-title-text' : '<p>Az oldal helyes működéséhez elengedhetetlen bizonyos cookie-k használata. Továbbá statisztikai, marketing mérési és hirdetési célból is használunk cookie-kat. Utóbbiak a Rendben gombra kattintás után töltődnek be. A sütikről bővebb tájékoztatás az adatkezelési tájékoztatóban olvasható.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Adatkezelési tájékoztató</a></p>`,
	'omf-body-necessary-title-text' : 'Elengedhetetlen',
	'omf-body-preferences-title-text' : 'Beállítások',
	'omf-body-analytics-title-text' : 'Statisztikai',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Sütik testreszabása',
	'omf-footer-accept-selection-text' : 'Beállítások mentése',
	'omf-footer-accept-all-text' : 'Rendben',
	'omf-footer-reject-all-text' : 'Elutasítás',
	'omf-body-details-link-text' : 'Részletes süti tájékoztató megnyitása',
	'omf-footer-back-text' : 'Vissza',
},
'de' : {			
	'omf-header-title-text' : '<p>Diese Website verwendet Cookies</p>',
	'omf-body-title-text' : '<p>Für das ordnungsgemäße Funktionieren der Seite ist die Verwendung bestimmter Cookies unerlässlich. Darüber hinaus verwenden wir Cookies zu statistischen, Marketing- und Werbezwecken. Diese werden erst nach dem Klick auf „Alle akzeptieren“ geladen. Weitere Informationen zu Cookies finden Sie in der Datenschutzerklärung.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span>Datenschutzerklärung</a></p>`,
	'omf-body-necessary-title-text' : 'Unverzichtbar',
	'omf-body-preferences-title-text' : 'Personalisierung',
	'omf-body-analytics-title-text' : 'Statistiken',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Cookies anpassen',
	'omf-footer-accept-selection-text' : 'Auswahl bestätigen',
	'omf-footer-accept-all-text' : 'Alle akzeptieren',
	'omf-footer-reject-all-text' : 'Alle ablehnen',
	'omf-body-details-link-text' : 'Detaillierte Cookie-Erklärung öffnen',
	'omf-footer-back-text' : 'Zurück',
},
'es' : {				
	'omf-header-title-text' : '<p>Este sitio web utiliza cookies</p>',
	'omf-body-title-text' : '<p>Para garantizar el correcto funcionamiento del sitio web, es esencial el uso de ciertas cookies. Además, utilizamos cookies con fines estadísticos, de medición de marketing y de publicidad. Estas últimas cookies se cargan solo después de hacer clic en el botón "Aceptar". Para obtener más información sobre las cookies, consulte nuestra Política de Privacidad.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Política de Privacidad</a></p>`,
	'omf-body-necessary-title-text' : 'Necesarias',
	'omf-body-preferences-title-text' : 'Personalización',
	'omf-body-analytics-title-text' : 'Estadísticas',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Gestionar cookies',
	'omf-footer-accept-selection-text' : 'Guardar preferencias',
	'omf-footer-accept-all-text' : 'Aceptar',
	'omf-footer-reject-all-text' : 'Rechazar todo',
	'omf-body-details-link-text' : 'Abrir información detallada de cookies',
	'omf-footer-back-text' : 'Atrás',
},
'fr' : {			
	'omf-header-title-text' : '<p>Informations sur les cookies</p>',
	'omf-body-title-text' : '<p>Lutilisation de certains cookies est essentielle au bon fonctionnement du site Web. Nous utilisons également des cookies à des fins statistiques, de mesures marketing et publicitaires. Ces derniers sont chargés lorsque vous cliquez sur le bouton Accepter. Vous pouvez trouver plus d informations sur les cookies dans la section de la politique de confidentialité.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span>Politique de confidentialité</a></p>`,
	'omf-body-necessary-title-text' : 'Fonctionnels',
	'omf-body-preferences-title-text' : 'Préférences',
	'omf-body-analytics-title-text' : 'Statistiques',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Paramètres',
	'omf-footer-accept-selection-text' : 'Afficher les paramètres',
	'omf-footer-accept-all-text' : 'Accepter',
	'omf-footer-reject-all-text' : 'Tout refuser',
	'omf-body-details-link-text' : 'Ouvrir les informations détaillées sur les cookies',
	'omf-footer-back-text' : 'Retour',
},
'it' : {				
	'omf-header-title-text' : '<p>Questo sito web utilizza i cookie</p>',
	'omf-body-title-text' : '<p>Per garantire il corretto funzionamento del sito web, è essenziale l\'uso di alcuni cookie. Inoltre, utilizziamo cookie per scopi statistici, di misurazione del marketing e pubblicitari. Questi ultimi cookie vengono caricati solo dopo aver cliccato sul pulsante "Accetta". Per maggiori informazioni sui cookie, consultare la nostra Informativa sulla Privacy.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Informativa sulla Privacy</a></p>`,
	'omf-body-necessary-title-text' : 'Necessari',
	'omf-body-preferences-title-text' : 'Personalizzazione',
	'omf-body-analytics-title-text' : 'Statistiche',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Gestisci cookie',
	'omf-footer-accept-selection-text' : 'Salva preferenze',
	'omf-footer-accept-all-text' : 'Accetta',
	'omf-footer-reject-all-text' : 'Rifiuta tutto',
	'omf-body-details-link-text' : 'Apri informativa dettagliata sui cookie',
	'omf-footer-back-text' : 'Indietro',
},
'pt' : {				
	'omf-header-title-text' : '<p>Este site utiliza cookies</p>',
	'omf-body-title-text' : '<p>Para garantir o correto funcionamento do site, é essencial o uso de determinados cookies. Além disso, utilizamos cookies para fins estatísticos, de medição de marketing e de publicidade. Estes últimos cookies são carregados apenas após clicar no botão "Aceitar". Para mais informações sobre os cookies, consulte a nossa Política de Privacidade.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Política de Privacidade</a></p>`,
	'omf-body-necessary-title-text' : 'Necessários',
	'omf-body-preferences-title-text' : 'Personalização',
	'omf-body-analytics-title-text' : 'Estatísticas',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Gerir cookies',
	'omf-footer-accept-selection-text' : 'Guardar preferências',
	'omf-footer-accept-all-text' : 'Aceitar',
	'omf-footer-reject-all-text' : 'Rejeitar tudo',
	'omf-body-details-link-text' : 'Abrir informação detalhada sobre cookies',
	'omf-footer-back-text' : 'Voltar',
},
'ro' : {			
	'omf-header-title-text' : '<p>Setări cookie</p>',
	'omf-body-title-text' : '<p>Utilizarea anumitor cookie-uri este esențială pentru ca site-ul să funcționeze corect. De asemenea, folosim cookie-uri în scopuri statistice, de măsurare de marketing și de publicitate. Acestea din urmă sunt încărcate când faceți clic pe butonul Accepta toate. Puteți obține mai multe informații despre cookie-uri prin pagina Politica de Confidențialitate.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span>Politica de confidențialitate</a></p>`,
	'omf-body-necessary-title-text' : 'Necesar',
	'omf-body-preferences-title-text' : 'Preferințe',
	'omf-body-analytics-title-text' : 'Statistici',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Gestionați cookie-urile',
	'omf-footer-accept-selection-text' : 'Confirmați selecția',
	'omf-footer-accept-all-text' : 'Accepta toate',
	'omf-footer-reject-all-text' : 'Respinge tot',
	'omf-body-details-link-text' : 'Deschide informațiile detaliate despre cookie-uri',
	'omf-footer-back-text' : 'Înapoi',
},
'sk' : {			
	'omf-header-title-text' : '<p>Správa súhlasu so súbormi cookie</p>',
	'omf-body-title-text' : '<p>Pre správne fungovanie stránky je nevyhnutné používanie určitých súborov cookie. Okrem toho používame súbory cookie aj na štatistické, marketingové merania a reklamné účely. Tieto súbory cookie sa načítajú po kliknutí na tlačidlo „Prijať“. Podrobnejšie informácie o súboroch cookie nájdete v našom oznámení o spracúvaní osobných údajov.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span>Zásady ochrany osobných údajove</a></p>`,
	'omf-body-necessary-title-text' : 'Funkčné',
	'omf-body-preferences-title-text' : 'Predvoľby',
	'omf-body-analytics-title-text' : 'Štatistiky',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Zobraziť preferencie',
	'omf-footer-accept-selection-text' : 'Uloženie predvolieb',
	'omf-footer-accept-all-text' : 'Prijať',
	'omf-footer-reject-all-text' : 'Odmietnuť všetko',
	'omf-body-details-link-text' : 'Otvoriť podrobné informácie o súboroch cookie',
	'omf-footer-back-text' : 'Späť',
},
'bg' : {			
	'omf-header-title-text' : '<p>Информация за бисквитки</p>',
	'omf-body-title-text' : '<p>Използването на определени бисквитки е от съществено значение за правилното функциониране на уебсайта. Ние също така използваме бисквитки за статистически, маркетингови измервания и рекламни цели. Последните се зареждат, когато щракнете върху бутона „Приемам“. Повече информация за бисквитките можете да намерите в раздела за поверителност.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span>Политика за защита на личните данни</a></p>`,
	'omf-body-necessary-title-text' : 'Функционален',
	'omf-body-preferences-title-text' : 'Предпочитания',
	'omf-body-analytics-title-text' : 'Статистика',
	'omf-body-marketing-title-text' : 'Маркетинг',
	'omf-footer-open-settings-text' : 'Настройки',
	'omf-footer-accept-selection-text' : 'Преглед на настройките',
	'omf-footer-accept-all-text' : 'Приемам',
	'omf-footer-reject-all-text' : 'Отхвърли всички',
	'omf-body-details-link-text' : 'Отвори подробна информация за бисквитките',
	'omf-footer-back-text' : 'Назад',
},
'hr' : {			
	'omf-header-title-text' : '<p>Informacije o kolačićima</p>',
	'omf-body-title-text' : '<p>Korištenje određenih kolačića nužno je za pravilno funkcioniranje web stranice. Također koristimo kolačiće za statističke, marketinške mjere i reklamne svrhe. Ovi kolačići se učitavaju kada kliknete na gumb „Prihvaćam”. Više informacija o kolačićima možete pronaći u odjeljku o privatnosti.</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span>Politika zaštite privatnosti</a></p>`,
	'omf-body-necessary-title-text' : 'Funkcionalni',
	'omf-body-preferences-title-text' : 'Preferencije',
	'omf-body-analytics-title-text' : 'Statistika',
	'omf-body-marketing-title-text' : 'Marketing',
	'omf-footer-open-settings-text' : 'Postavke',
	'omf-footer-accept-selection-text' : 'Pregled postavki',
	'omf-footer-accept-all-text' : 'Prihvaćam',
	'omf-footer-reject-all-text' : 'Odbij sve',
	'omf-body-details-link-text' : 'Otvori detaljne informacije o kolačićima',
	'omf-footer-back-text' : 'Natrag',
},
'cs' : {
    'omf-header-title-text' : '<p>Tato webová stránka používá soubory cookie</p>',
    'omf-body-title-text' : '<p>Pro zajištění správného fungování webu je nezbytné použití určitých souborů cookie. Dále používáme soubory cookie pro statistické účely, měření marketingu a reklamní účely. Tyto soubory cookie se načítají pouze po kliknutí na tlačítko "Přijmout". Více informací o souborech cookie naleznete v našich Zásadách ochrany osobních údajů.</p>',
    'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Zásady ochrany osobních údajů</a></p>`,
    'omf-body-necessary-title-text' : 'Nezbytné',
    'omf-body-preferences-title-text' : 'Personalizace',
    'omf-body-analytics-title-text' : 'Statistiky',
    'omf-body-marketing-title-text' : 'Marketing',
    'omf-footer-open-settings-text' : 'Spravovat cookies',
    'omf-footer-accept-selection-text' : 'Uložit preference',
    'omf-footer-accept-all-text' : 'Přijmout',
    'omf-footer-reject-all-text' : 'Odmítnout vše',
    'omf-body-details-link-text' : 'Otevřít podrobné informace o souborech cookie',
    'omf-footer-back-text' : 'Zpět',
},
'pl' : {				
    'omf-header-title-text' : '<p>Ta strona używa plików cookie</p>',
    'omf-body-title-text' : '<p>Aby zapewnić prawidłowe działanie strony, niektóre pliki cookie są niezbędne. Dodatkowo wykorzystujemy pliki cookie do celów statystycznych, marketingowych oraz reklamowych. Te dodatkowe pliki cookie są ładowane dopiero po kliknięciu przycisku „Akceptuję”. Więcej informacji na temat plików cookie znajdziesz w naszej Polityce Prywatności.</p>',
    'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> Polityka Prywatności</a></p>`,
    'omf-body-necessary-title-text' : 'Niezbędne',
    'omf-body-preferences-title-text' : 'Personalizacja',
    'omf-body-analytics-title-text' : 'Statystyka',
    'omf-body-marketing-title-text' : 'Marketing',
    'omf-footer-open-settings-text' : 'Zarządzaj plikami cookie',
    'omf-footer-accept-selection-text' : 'Zapisz preferencje',
    'omf-footer-accept-all-text' : 'Akceptuję',
    'omf-footer-reject-all-text' : 'Odrzuć wszystkie',
    'omf-body-details-link-text' : 'Otwórz szczegółowe informacje o plikach cookie',
    'omf-footer-back-text' : 'Wstecz',
},
'ja' : {				
	'omf-header-title-text' : '<p>このウェブサイトはクッキーを使用しています</p>',
	'omf-body-title-text' : '<p>ウェブサイトを正しく機能させるためには、特定のクッキーの使用が不可欠です。さらに、統計、マーケティングの測定、広告の目的でクッキーを使用しています。これらのクッキーは「同意する」ボタンをクリックした後にのみ読み込まれます。クッキーに関する詳細については、プライバシーポリシーをご覧ください。</p>',
	'omf-body-description-text' : `<p><a class="policy_url" href="${escapeHtml(privacyPolicyUrl)}" target="_blank"><span></span> プライバシーポリシー</a></p>`,
	'omf-body-necessary-title-text' : '必須',
	'omf-body-preferences-title-text' : 'パーソナライズ',
	'omf-body-analytics-title-text' : '統計',
	'omf-body-marketing-title-text' : 'マーケティング',
	'omf-footer-open-settings-text' : 'クッキーを管理',
	'omf-footer-accept-selection-text' : '設定を保存',
	'omf-footer-accept-all-text' : '同意する',
	'omf-footer-reject-all-text' : 'すべて拒否',
	'omf-body-details-link-text' : '詳細なクッキー通知を開く',
	'omf-footer-back-text' : '戻る',
},
},
'resolveLang': function() {
	var lang = '';
		if (navigator.languages && navigator.languages.length > 0) {
			lang = navigator.languages[0];
		} else if (navigator.language) {
			lang = navigator.language;
		} else {
			lang = OmfDictionary['defaultLang'];
		}
			lang = lang.split('-')[0].toLowerCase();
			if (typeof lang == 'undefined' || typeof OmfDictionary['trans_words'][lang] == 'undefined' || lang == '') {lang = OmfDictionary['defaultLang'];}
			return lang;
	},
	'text': function(omfkey) {
		var lang = OmfDictionary.resolveLang();
		return OmfDictionary['trans_words'][lang][omfkey] || OmfDictionary['trans_words'][OmfDictionary['defaultLang']][omfkey] || '';
	},
	'translate': function() {
			var lang = OmfDictionary.resolveLang();
			var elements = false;
			for (var omfkey in OmfDictionary['trans_words'][lang]) {
				if (OmfDictionary['trans_words'][lang].hasOwnProperty(omfkey)) {
					elements = document.getElementsByClassName(omfkey);
					if (elements.length) {
						elements[0].outerHTML = OmfDictionary['trans_words'][lang][omfkey];
					}
				}
			}
		},
	}

	OmfDictionary.defaultLang = cfg.defaultLang || OmfDictionary.defaultLang;

	// ---- cookie catalog for the detailed cookie notice (hu-only content, vendor-gated) ----
	// Each entry: category (necessary|preferences|statistics|marketing), vendor (optional key
	// toggled from the GTM tag's "Süti lista" checkboxes; entries without a vendor are always shown).
	var COOKIE_CATALOG = [
		{ category: 'necessary', vendor: 'cloudflare', name: '__cf_bm', provider: 'Cloudflare', providerUrl: 'https://www.cloudflare.com/privacypolicy/', purpose: 'Megkülönbözteti az embereket a botoktól. Ez előnyös a weboldal számára, hogy érvényes jelentéseket készíthessen a weboldal használatáról.', duration: '1 nap', type: 'HTTP-süti' },

		{ category: 'necessary', vendor: 'ga', name: 'test_cookie', provider: 'Google', providerUrl: 'https://business.safety.google/privacy/', purpose: 'Ellenőrzi, hogy a látogató böngészője támogatja-e a sütik használatát.', duration: '1 nap', type: 'HTTP-süti' },
		{ category: 'statistics', vendor: 'ga', name: '_ga', provider: 'Google', providerUrl: 'https://business.safety.google/privacy/', purpose: 'A Google Analytics használja a látogató eszközére és viselkedésére vonatkozó adatok küldésére. Több eszközön és marketingcsatornán keresztül követi a látogatót.', duration: '2 év', type: 'HTTP-süti' },
		{ category: 'statistics', vendor: 'ga', name: '_ga_#', provider: 'Google', providerUrl: 'https://business.safety.google/privacy/', purpose: 'A Google Analytics használja a látogató eszközére és viselkedésére vonatkozó adatok küldésére. Több eszközön és marketingcsatornán keresztül követi a látogatót.', duration: '2 év', type: 'HTTP-süti' },

		{ category: 'marketing', vendor: 'googleAds', name: '_gcl_au', provider: 'Google', providerUrl: 'https://business.safety.google/privacy/', purpose: 'A weboldal hirdetési tevékenységének hatékonyságát méri, a hirdetések konverziós arányára vonatkozó adatok gyűjtésével, több weboldalon keresztül.', duration: '3 hónap', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'googleAds', name: '_gcl_ls', provider: 'Google', providerUrl: 'https://business.safety.google/privacy/', purpose: 'A weboldal hirdetési tevékenységének hatékonyságát méri, a hirdetések konverziós arányára vonatkozó adatok gyűjtésével, több weboldalon keresztül.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'googleAds', name: 'pagead/1p-user-list/#', provider: 'Google', providerUrl: 'https://business.safety.google/privacy/', purpose: 'Nyomon követi, hogy a látogató érdeklődést mutatott-e bizonyos termékek vagy események iránt több weboldalon keresztül, és érzékeli, hogyan navigál az oldalak között. Hirdetési tevékenység mérésére és az oldalak közötti jutalékfizetés elősegítésére szolgál.', duration: 'Munkamenet', type: 'Pixelkövető' },

		{ category: 'marketing', vendor: 'meta', name: '_fbp', provider: 'Meta Platforms, Inc.', providerUrl: 'https://www.facebook.com/policy.php/', purpose: 'A Facebook ezt használja különféle hirdetési termékek megjelenítésére, például harmadik féltől származó hirdetők valós idejű ajánlattételéhez.', duration: '3 hónap', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'meta', name: 'lastExternalReferrer', provider: 'Meta Platforms, Inc.', providerUrl: 'https://www.facebook.com/policy.php/', purpose: 'Érzékeli, hogyan érte el a látogató a weboldalt, az utolsó URL-cím regisztrálásával.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'meta', name: 'lastExternalReferrerTime', provider: 'Meta Platforms, Inc.', providerUrl: 'https://www.facebook.com/policy.php/', purpose: 'Érzékeli, hogyan érte el a látogató a weboldalt, az utolsó URL-cím regisztrálásával.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },

		{ category: 'statistics', vendor: 'tiktok', name: '_tt_enable_cookie', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'A TikTok közösségi hálózati szolgáltatás használja a beágyazott szolgáltatások használatának nyomon követésére.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'tiktok', name: 'tt_appInfo', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'A TikTok közösségi hálózati szolgáltatás használja a beágyazott szolgáltatások használatának nyomon követésére.', duration: 'Munkamenet', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'tiktok', name: 'tt_pixel_session_index', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'A TikTok közösségi hálózati szolgáltatás használja a beágyazott szolgáltatások használatának nyomon követésére.', duration: 'Munkamenet', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'tiktok', name: 'tt_sessionId', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'A TikTok közösségi hálózati szolgáltatás használja a beágyazott szolgáltatások használatának nyomon követésére.', duration: 'Munkamenet', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'tiktok', name: '_ttp', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'A TikTok közösségi hálózati szolgáltatás használja a beágyazott szolgáltatások használatának nyomon követésére.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'tiktok', name: 'ttcsid', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'A látogatót több weboldalon keresztül nyomon követi, hogy a preferenciái alapján releváns hirdetést jelenítsen meg.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'tiktok', name: 'ttcsid_#', provider: 'TikTok', providerUrl: 'https://www.tiktok.com/legal/privacy-policy?lang=en', purpose: 'Méri a látogató és a weboldalon található hirdetési bannerek közötti konverziós arányt, a hirdetések relevanciájának optimalizálása érdekében.', duration: '1 év', type: 'HTTP-süti' },

		{ category: 'necessary', vendor: 'linkedin', name: 'bcookie', provider: 'LinkedIn', providerUrl: 'https://www.linkedin.com/legal/privacy-policy', purpose: 'Kéretlen tartalmak (spam) észlelésére és a weboldal biztonságának javítására szolgál.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'necessary', vendor: 'linkedin', name: 'li_gc', provider: 'LinkedIn', providerUrl: 'https://www.linkedin.com/legal/privacy-policy', purpose: 'Tárolja a látogató süti-hozzájárulási állapotát az aktuális domainhez.', duration: '180 nap', type: 'HTTP-süti' },
		{ category: 'preferences', vendor: 'linkedin', name: 'lidc', provider: 'LinkedIn', providerUrl: 'https://www.linkedin.com/legal/privacy-policy', purpose: 'Regisztrálja, hogy melyik szerverfürt szolgálja ki a látogatót. Terheléselosztással összefüggésben, a felhasználói élmény optimalizálására használt.', duration: '1 nap', type: 'HTTP-süti' },

		{ category: 'statistics', vendor: 'clarity', name: '_clck', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-us/privacystatement', purpose: 'Adatokat gyűjt a látogató navigációjáról és viselkedéséről a weboldalon. Statisztikai jelentések és hőtérképek összeállítására szolgál a weboldal tulajdonosa számára.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'statistics', vendor: 'clarity', name: '_clsk', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-us/privacystatement', purpose: 'Regisztrálja a látogatók weboldalon mutatott viselkedésére vonatkozó statisztikai adatokat. A weboldal üzemeltetője belső elemzésre használja.', duration: '1 nap', type: 'HTTP-süti' },
		{ category: 'statistics', vendor: 'clarity', name: 'c.gif', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-us/privacystatement', purpose: 'Adatokat gyűjt a látogató navigációjáról és viselkedéséről a weboldalon. Statisztikai jelentések és hőtérképek összeállítására szolgál a weboldal tulajdonosa számára.', duration: 'Munkamenet', type: 'Pixelkövető' },
		{ category: 'statistics', vendor: 'clarity', name: '_cltk', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-us/privacystatement', purpose: 'Regisztrálja a látogatók weboldalon mutatott viselkedésére vonatkozó statisztikai adatokat. A weboldal üzemeltetője belső elemzésre használja.', duration: 'Munkamenet', type: 'Helyi HTML-tárhely' },

		{ category: 'marketing', vendor: 'microsoftAds', name: '_uetsid', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'A látogatókat több weboldalon keresztül nyomon követi, hogy a preferenciái alapján releváns hirdetést jelenítsen meg.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'microsoftAds', name: '_uetsid_exp', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'Tartalmazza az azonos nevű süti lejárati dátumát.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'microsoftAds', name: '_uetvid', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'A látogatókat több weboldalon keresztül nyomon követi, hogy a preferenciái alapján releváns hirdetést jelenítsen meg.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'microsoftAds', name: '_uetvid_exp', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'Tartalmazza az azonos nevű süti lejárati dátumát.', duration: 'Tartós', type: 'Helyi HTML-tárhely' },
		{ category: 'marketing', vendor: 'microsoftAds', name: 'MR', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'A látogatókat több weboldalon keresztül nyomon követi, hogy a preferenciái alapján releváns hirdetést jelenítsen meg.', duration: '7 nap', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'microsoftAds', name: 'MUID', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'A Microsoft egyedi felhasználói azonosítóként használja széles körben. A süti lehetővé teszi a felhasználó nyomon követését az azonosító Microsoft-domainek közötti szinkronizálásával.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'microsoftAds', name: 'SRM_B', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-US/privacystatement', purpose: 'Nyomon követi a látogató interakcióját a weboldal keresősáv-funkciójával. Ezek az adatok releváns termékek vagy szolgáltatások megjelenítésére használhatók.', duration: '1 év', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'microsoftAds', name: 'ANONCHK', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-us/privacystatement', purpose: 'Adatokat regisztrál a látogatókról több látogatás és több weboldal alapján. Ezt az információt a weboldalakon megjelenő hirdetések hatékonyságának mérésére használják.', duration: '1 nap', type: 'HTTP-süti' },
		{ category: 'marketing', vendor: 'microsoftAds', name: 'SM', provider: 'Microsoft', providerUrl: 'https://privacy.microsoft.com/en-us/privacystatement', purpose: 'Egyedi azonosítót regisztrál, amely visszatérő látogatások során azonosítja a látogató eszközét, ugyanazt a hirdetési hálózatot használó weboldalakon. Az azonosítót célzott hirdetések megjelenítésére használják.', duration: 'Munkamenet', type: 'HTTP-süti' },

		{ category: 'marketing', vendor: 'reddit', name: 'rp.gif', provider: 'Reddit', providerUrl: 'https://www.redditinc.com/policies/privacy-policy', purpose: 'A Reddit.com megosztás gomb funkciójának megvalósításához szükséges.', duration: 'Munkamenet', type: 'Pixelkövető' },
		{ category: 'marketing', vendor: 'reddit', name: '_rdt_uuid', provider: 'Reddit', providerUrl: 'https://www.redditinc.com/policies/privacy-policy', purpose: 'A látogatókat több weboldalon keresztül nyomon követi, hogy a preferenciái alapján releváns hirdetést jelenítsen meg.', duration: '3 hónap', type: 'HTTP-süti' },

		{ category: 'marketing', vendor: 'openai', name: '__oppref', provider: 'OpenAI OpCo, LLC', providerUrl: 'https://openai.com/policies/privacy-policy/', purpose: 'A ChatGPT-ben megjelenő hirdetésre történő kattintást köti össze a hirdető weboldalán bekövetkező későbbi konverzióval (attribúció).', duration: '~30 nap', type: 'HTTP-süti' }
	];

	function buildCookieTables() {
		var titleKeys = {
			necessary: 'omf-body-necessary-title-text',
			preferences: 'omf-body-preferences-title-text',
			statistics: 'omf-body-analytics-title-text',
			marketing: 'omf-body-marketing-title-text'
		};
		var groups = { necessary: [], preferences: [], statistics: [], marketing: [] };

		COOKIE_CATALOG.forEach(function (c) {
			if (c.vendor && cookieVendors[c.vendor] !== true) return;
			groups[c.category].push(c);
		});

		groups.necessary.unshift({
			name: cookieName,
			provider: 'Saját (első fél)',
			providerUrl: '',
			purpose: 'Tárolja a látogató süti-hozzájárulási beállításait ezen a domainen.',
			duration: cookieExpiryDays + ' nap',
			type: 'HTTP-süti'
		});

		var html = '';
		['necessary', 'preferences', 'statistics', 'marketing'].forEach(function (cat, idx) {
			var rows = groups[cat];
			if (!rows.length) return;
			var rowsHtml = rows.map(function (c) {
				var providerCell = c.providerUrl
					? '<a href="' + escapeHtml(c.providerUrl) + '" target="_blank" rel="noopener noreferrer nofollow">' + escapeHtml(c.provider) + '</a>'
					: escapeHtml(c.provider);
				return '<tr><td>' + escapeHtml(c.name) + '</td><td>' + providerCell + '</td><td>' + escapeHtml(c.purpose) + '</td><td>' + escapeHtml(c.duration) + '</td><td>' + escapeHtml(c.type) + '</td></tr>';
			}).join('');
			html += '<details' + (idx === 0 ? ' open' : '') + '>' +
				'<summary>' + OmfDictionary.text(titleKeys[cat]) + ' (' + rows.length + ')</summary>' +
				'<div class="omf-cookie-table-wrapper"><table class="omf-cookie-table"><thead><tr><th>Név</th><th>Szolgáltató</th><th>Cél</th><th>Max. tárolási idő</th><th>Típus</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' +
				'</details>';
		});
		return html;
	}

	// ---- inject optional webfont stylesheet (e.g. a Google Fonts CSS2 URL) ----
	function injectFont() {
		if (!fontUrl) return;
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = fontUrl;
		document.head.appendChild(link);
	}

	// ---- inject CSS ----
	function injectStyle() {
		var style = document.createElement('style');
		style.textContent = `:root{--omf-main: ${mainColor}; --omf-secondary: ${secondaryColor}; --omf-accent: ${accentColor}; --omf-font: ${fontFamily};}
.omf-modal{
	position: fixed!important;
	width: 100vw!important;
	height: 100vh!important;
	top: 0!important;
	left: 0!important;
	right: 0!important;
	bottom: 0!important;
	inset: 0!important;
	z-index: 99999!important;
	display: flex!important;
	justify-content: center!important;
	align-items: center!important;
	overflow: hidden!important;
	outline: 0!important;
	transition: opacity .15s linear!important;
	font-size: 16px;
	line-height: 1.5em;
	font-weight: 400;
	letter-spacing: normal;
	color: #212121;
	background-color: rgba(20,20,20,.75)!important;
	font-family: var(--omf-font)!important;
	font-optical-sizing: auto;
}
.omf-modal:not(.open) {
	display: none!important;
	opacity: 0!important;
}
.omf-modal.open {
	overflow-x: hidden!important;
	overflow-y: auto!important;
}
.omf-modal--position-bottom-right {
	justify-content: flex-end!important;
	align-items: flex-end!important;
}
.omf-modal--position-bottom-left {
	justify-content: flex-start!important;
	align-items: flex-end!important;
}
.omf-modal--position-bottom-right .omf-modal__dialog,
.omf-modal--position-bottom-left .omf-modal__dialog {
	margin: 1em;
	max-inline-size: 26em;
}
.omf-modal__header p {
	font-size: 24px!important;
	font-weight: 700!important;
	line-height: 1.1em!important;
	color: var(--omf-main)!important;
}
.omf-modal .omf-modal__dialog {
	transition: transform .3s ease-out;
	transform: translate(0,-50px);
	position: relative;
	margin: 1.75em auto;
	inline-size: calc(100% - 1em);
	pointer-events: none;
	max-inline-size: 42em;
	max-block-size: 80vh;
}
.omf-modal.open .omf-modal__dialog {
	transform: none;
    font-size: initial;
}
.omf-modal__content {
	position: relative;
	display: flex;
	flex-direction: column;
	inline-size: 100%;
	pointer-events: auto;
	background-color: #ffffff;
	background-clip: padding-box;
	border: 1px solid #000000;
	border-radius: 0.5em;
	outline: 0;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: stretch;
	align-content: normal;
	gap: 20px;
	padding: 30px;
}
.omf-modal__content > * {
	padding: 0;
}
.omf-modal__content > * > * {
	margin-block: unset;
}
.omf-modal__header {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	align-content: normal;
	gap: 20px;
	padding-bottom: 0;
}
.omf-modal__icon {
	inline-size: 2em;
	block-size: 2em;
	flex-shrink: 0;
}
.omf-modal__body > p {
	color: #212121;
}
.omf-modal__body > p, .omf-modal__body > p > a{
	font-size: 14px!important;
	line-height: 1.3em!important;
}
.omf-modal__body > p > a {
	color: var(--omf-main);
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: center;
	align-content: normal;
	line-height: 1.3em;
	gap: 10px;
}
.omf-modal__body > p > a > span{
	display: block;
	width: 8px;
	height: 8px;
	border-top: 1px solid var(--omf-main);
	border-right: 1px solid var(--omf-main);
	transform: rotate(45deg);
}
.omf-modal__body > * + * {
	margin-top: .8em;
}
.omf-modal__footer {
	display: flex;
	align-items: stretch;
	gap: 2em;
	padding-top: 0;
}
.omf-modal_settings{
	display: none;
}
.omf-modal_settings.open{
	display: block;
}
.omf-modal_details{
	display: none;
}
.omf-modal_details.open{
	display: block;
}
.omf-modal_details details + details{
	margin-top: .5em;
}
.omf-cookie-table-wrapper{
	overflow-x: auto;
}
.omf-cookie-table{
	width: 100%;
	min-width: 34em;
	table-layout: fixed;
	border-collapse: collapse;
	font-size: 12px;
	line-height: 1.4em;
}
.omf-cookie-table th,
.omf-cookie-table td{
	text-align: left;
	vertical-align: top;
	padding: 6px 8px;
	border-bottom: 1px solid #dadce0;
	white-space: normal;
	overflow-wrap: break-word;
	word-break: break-word;
}
.omf-cookie-table th{
	font-weight: bold;
	color: var(--omf-main);
}
.omf-cookie-table th:nth-child(1), .omf-cookie-table td:nth-child(1){ width: 14%; }
.omf-cookie-table th:nth-child(2), .omf-cookie-table td:nth-child(2){ width: 14%; }
.omf-cookie-table th:nth-child(3), .omf-cookie-table td:nth-child(3){ width: 42%; }
.omf-cookie-table th:nth-child(4), .omf-cookie-table td:nth-child(4){ width: 15%; }
.omf-cookie-table th:nth-child(5), .omf-cookie-table td:nth-child(5){ width: 15%; }
.omf-link-button{
	background: transparent;
	border: none;
	padding: 0;
	cursor: pointer;
	color: var(--omf-main);
	font-size: 14px!important;
	text-decoration: underline;
	font-family: var(--omf-font)!important;
}
.omf-modal_settings-wrapper{
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: center;
	align-items: center;
	align-content: normal;
	gap: 20px;
}
.omf-switch_field{
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: center;
	align-content: normal;
	gap:5px;
	flex-grow: 1;
	flex-basis: 0;
}
.omf-switch_field .omf-switch_title{
	font-size: 16px!important;
	text-align: center;
	font-weight: bold;
	color: var(--omf-main);
}
.omf-switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}
.omf-switch input { 
	opacity: 0;
	width: 0;
	height: 0;
}
.omf-slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--omf-secondary);
	-webkit-transition: .3s;
	transition: .3s;
	border-radius: 34px;
}
.omf-slider:before {
	position: absolute;
	content: "";
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: var(--omf-accent);
	-webkit-transition: .3s;
	transition: .3s;
	border-radius: 50%;
}

input:checked + .omf-slider {
	background-color: var(--omf-main);
}
input:focus + .omf-slider {
	box-shadow: 0 0 1px var(--omf-accent);
}
input:checked + .omf-slider:before {
	-webkit-transform: translateX(26px);
	-ms-transform: translateX(26px);
	transform: translateX(26px);
	background-color: #fff;
}
input:disabled + .omf-slider {
	background-color: #e5e7eb;
}
input:disabled + .omf-slider:before {
	background-color: var(--omf-main);
}
.omf-modal__button {
	flex:  1!important;
	color: #000000;
	background-color: #ffffff;
	background-image: none;
	border-radius: .3em!important;
	padding: 0.7em 1em!important;
	cursor: pointer;
	font-size: 16px!important;
	font-weight: bold!important;
	transition: background-color .3s;
	font-family: var(--omf-font)!important;
	font-optical-sizing: auto;
	border: 1px solid var(--omf-secondary)!important;
}
 .omf-modal__button.show_on_settings{
	 display: none;
 }
 .omf-modal__button.show-it{
	 display: block;
 }	 
 .omf-modal__button.hide-it{
	 display: none;
 }
.omf-modal__button:hover,
.omf-modal__button:focus {
	background-color: #f0f0f0;
	background-image: none;
	color: #000000;
}
.omf-modal__button--active {
	color: #ffffff;
	background-color: var(--omf-main);
}
.omf-modal__button--active:hover,
.omf-modal__button--active:focus {
	background-color: var(--omf-main);
	filter: brightness(0.85);
	color: #ffffff;
}
.omf-modal__button--reject {
	color: #ffffff;
	background-color: var(--omf-secondary);
	border-color: var(--omf-secondary)!important;
}
.omf-modal__button--reject:hover,
.omf-modal__button--reject:focus {
	background-color: var(--omf-secondary);
	filter: brightness(0.85);
	color: #ffffff;
}
.omf-modal__button--settings, .omf-modal__button--settings:hover {
	position: fixed;
	display: flex;
	justify-content: center;
	align-items: center;
	inset-block-end: 1em;
	inset-inline-start: 1em;
	border: none;
	background: transparent;
	z-index: 99998;
	cursor: pointer;
	background-image: url("https://cdn.jsdelivr.net/gh/otty-mfo/consent-banner@v1.4.0/assets/settings-icon.svg");
	background-repeat: no-repeat;
	background-size: contain;
	width: 3em;
	height: 3em;
}
.omf-modal__button--settings--right, .omf-modal__button--settings--right:hover {
	inset-inline-start: auto;
	inset-inline-end: 1em;
}
.omf-modal__button--settings svg {
	inline-size: 1em;
	block-size: 1em;
}
.omf-modal__button-close {
	border: none;
	background: transparent;
	float: right;
	font-size: 2em!important;
	cursor: pointer;
}
.omf-modal__button-close:hover{
	color: #333333;
}
.omf-modal details {
	padding: .5em;
	border: 1px solid #dadce0;
	border-radius: .25em;
}
.omf-modal details summary {
	cursor: pointer;
}
.omf-modal details summary > * {
	display: inline;
}
details[open] summary {
	border-bottom: 1px solid #dadce0;
	margin-bottom: 0.5em;
}
.omf-modal details > div > * {
	margin-bottom: unset;
}
.omf-modal details > div > * + * {
	margin-top: .5em;
}

@media only screen and (max-width:767px){
	.omf-modal{
	}
	.omf-modal--position-bottom-right,
	.omf-modal--position-bottom-left {
		justify-content: center!important;
		align-items: center!important;
	}
	.omf-modal .omf-modal__dialog {
		max-inline-size: 90vw;
	}
	.omf-modal--position-bottom-right .omf-modal__dialog,
	.omf-modal--position-bottom-left .omf-modal__dialog {
		margin: 1.75em auto;
		max-inline-size: 90vw;
	}
	.omf-modal__content {
		width: 90vw;
		box-sizing: border-box;
		gap: 5px;
		padding: 3vw;
	}
	
	.omf-modal__header {
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		gap: 5px;
		padding-bottom: 0;
	}
	.omf-modal__icon {
		inline-size: 1.5em;
		block-size: 1.5em;
	}

	.omf-modal__header p{
		font-size: 20px!important;
	}
    .omf-modal__body > p, .omf-modal__body > p > a{
	    font-size: 14px!important;
    }
	.omf-modal__footer {
		flex-direction:column-reverse;
		gap: 10px;
		margin-top: 10px;
	}
	.omf-modal_settings-wrapper{
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
		align-content: normal;
		gap: 10px;
	}
	
	.omf-switch_field{
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
		align-content: normal;
		gap: 10px;
		width: 100%;
	}
	.omf-switch_field .omf-switch_title{
		font-size: 16px!important;
		text-align: left!important;
	}
	.omf-switch {
		width: 56px;
		height: 28px;
	}
	.omf-slider:before {
		width: 20px;
		height: 20px;
	}
	input:checked + .omf-slider:before {
		-webkit-transform: translateX(28px);
		-ms-transform: translateX(28px);
		transform: translateX(28px);
		background-color: #fff;
	}
    .omf-modal__button--settings, .omf-modal__button--settings:hover {
	    width: 2.75em;
	    height: 2.75em;
	    inset-block-end: max(0.75em, env(safe-area-inset-bottom));
	    inset-inline-start: 0.75em;
    }
    .omf-modal__button--settings--right, .omf-modal__button--settings--right:hover {
	    inset-inline-start: auto;
	    inset-inline-end: 0.75em;
    }
}
`;
		document.head.appendChild(style);
	}

	// ---- inject markup ----
	function injectMarkup() {
		var wrap = document.createElement('div');
		wrap.innerHTML = `<div id="omf-accept" class="omf-modal omf-modal--position-${bannerPosition}">
    <div role="dialog" class="omf-modal__dialog" aria-label="Cookie Consent">
        <div class="omf-modal__content">
            <div class="omf-modal__header">
                <span class="omf-header-title-text"></span>
                <img class="omf-modal__icon" src="https://cdn.jsdelivr.net/gh/otty-mfo/consent-banner@v1.4.0/assets/settings-icon.svg" alt="" aria-hidden="true">
            </div>
            <div class="omf-modal__body">
				<span class="omf-body-title-text"></span>
				<span class="omf-body-description-text"></span>
				<p><button type="button" class="omf-link-button" id="omf-goto-details"><span class="omf-body-details-link-text"></span></button></p>
            </div>
			<div class="omf-modal_settings" id="OmfSettingsPanel">
				<div class="omf-modal_settings-wrapper">
					<div class="omf-switch_field">
						<span class="omf-switch_title"><span class="omf-body-necessary-title-text"></span></span>
						<label class="omf-switch">
							<input id="consent-necessary" type="checkbox" value="cookiesNecessary" autocomplete="off" checked disabled/>
							<span class="omf-slider"></span>
						</label>
					</div>
					<div class="omf-switch_field">
						<span class="omf-switch_title"><span class="omf-body-preferences-title-text"></span></span>
						<label class="omf-switch">
							<input id="consent-preferences" type="checkbox" value="cookiesPreferences" autocomplete="off">
							<span class="omf-slider"></span>
						</label>
					</div>
					<div class="omf-switch_field">
						<span class="omf-switch_title"><span class="omf-body-analytics-title-text"></span></span>
						<label class="omf-switch">
							<input id="consent-analytics" type="checkbox" value="cookiesAnalytics" autocomplete="off">
							<span class="omf-slider"></span>
						</label>
					</div>
					<div class="omf-switch_field">
						<span class="omf-switch_title"><span class="omf-body-marketing-title-text"></span></span>
						<label class="omf-switch">
							<input id="consent-marketing" type="checkbox" value="cookiesMarketing" autocomplete="off">
							<span class="omf-slider"></span>
						</label>
					</div>
				</div>
			</div>
			<div class="omf-modal_details" id="OmfDetailsPanel"></div>

            <div class="omf-modal__footer">
                <button class="omf-modal__button" id="omf-goto-selection"><span class="omf-footer-open-settings-text"></span></button>
				<button id="omf-accept-selection" class="omf-modal__button show_on_settings"><span class="omf-footer-accept-selection-text"></span></button>
                <button id="omf-reject-all" class="omf-modal__button omf-modal__button--reject"><span class="omf-footer-reject-all-text"></span></button>
                <button id="omf-accept-all" class="omf-modal__button omf-modal__button--active"><span class="omf-footer-accept-all-text"></span></button>
				<button id="omf-back-from-details" class="omf-modal__button show_on_settings"><span class="omf-footer-back-text"></span></button>
            </div>
        </div>
    </div>
</div>				

`;
		while (wrap.firstChild) { document.body.appendChild(wrap.firstChild); }

		var btn = document.createElement('div');
		var settingsButtonClass = 'omf-modal__button--settings' + (settingsButtonSide === 'right' ? ' omf-modal__button--settings--right' : '');
		btn.innerHTML = `<button type="button" class="${settingsButtonClass}" id="omf-open-settings" aria-label="Cookie Settings"></button>`;
		document.body.appendChild(btn.firstChild);
	}

	// ---- consent logic (cookie-based, with optional cross-domain sharing) ----

	function getCookie(name) {
		var escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
		var match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
		return match ? decodeURIComponent(match[1]) : null;
	}

	function setCookie(name, value, days, domain) {
		var expires = '';
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = '; expires=' + date.toUTCString();
		}
		var domainPart = domain ? '; domain=' + domain : '';
		var securePart = window.location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = name + '=' + encodeURIComponent(value) + expires + domainPart + '; path=/; SameSite=Lax' + securePart;
	}

	function getOrCreateConsentId() {
		var idCookieName = cookieName + '_id';
		var existing = getCookie(idCookieName);
		if (existing) return existing;
		var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0;
			var v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
		setCookie(idCookieName, id, cookieExpiryDays, cookieDomain);
		return id;
	}

	// ---- ad blocker detection (best-effort, cosmetic-filter heuristic only) ----
	function detectAdblock(callback) {
		try {
			var bait = document.createElement('div');
			bait.className = 'adsbox ad-banner textAd text-ads pub_300x250 text_ads';
			bait.setAttribute('aria-hidden', 'true');
			bait.style.cssText = 'position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;';
			document.body.appendChild(bait);
			setTimeout(function () {
				var blocked = !bait.offsetParent || bait.offsetHeight === 0 || bait.offsetWidth === 0 ||
					(window.getComputedStyle && window.getComputedStyle(bait).display === 'none');
				if (bait.parentNode) { bait.parentNode.removeChild(bait); }
				callback(!!blocked);
			}, 100);
		} catch (e) {
			callback(null);
		}
	}

	// ---- optional consent decision logging (fire-and-forget, never blocks the UI) ----
	function sendConsentLog(actionType, consent) {
		if (!consentLogUrl) return;
		try {
			var payload = {
				consentId: getOrCreateConsentId(),
				domain: window.location.hostname,
				pageUrl: window.location.href,
				actionType: actionType,
				preferences: consent.personalization_storage === 'granted',
				statistics: consent.analytics_storage === 'granted',
				marketing: consent.ad_storage === 'granted',
				adblockDetected: adblockDetected,
				bannerVersion: bannerVersion,
				privacyPolicyUrl: privacyPolicyUrl,
				language: OmfDictionary.resolveLang(),
				userAgent: navigator.userAgent,
				secret: consentLogSecret
			};
			fetch(consentLogUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain;charset=utf-8' },
				body: JSON.stringify(payload)
			})['catch'](function () {});
		} catch (e) {}
	}

	function categoriesFromConsent(consent) {
		var parts = ['necessary'];
		if (consent.personalization_storage === 'granted') parts.push('personalization');
		if (consent.analytics_storage === 'granted') parts.push('statistics');
		if (consent.ad_storage === 'granted') parts.push('marketing');
		return parts.join(',');
	}

	function consentFromCategories(categories) {
		var has = function (key) { return categories.indexOf(key) > -1; };
		return {
			ad_storage: has('marketing') ? 'granted' : 'denied',
			ad_user_data: has('marketing') ? 'granted' : 'denied',
			ad_personalization: has('marketing') ? 'granted' : 'denied',
			analytics_storage: has('statistics') ? 'granted' : 'denied',
			personalization_storage: has('personalization') ? 'granted' : 'denied',
			functionality_storage: 'granted',
			security_storage: 'granted'
		};
	}

	function applyConsent(consent, persist, actionType) {
		var isFirst = persist && getCookie(cookieName) === null;
		gtag('consent', 'update', consent);
		if (persist) {
			setCookie(cookieName, categoriesFromConsent(consent), cookieExpiryDays, cookieDomain);
			refreshCrossDomainSignature();
		}
		var payload = {
			event: 'gtm_consent_update',
			consent_personalization: consent.personalization_storage,
			consent_statistics: consent.analytics_storage,
			consent_marketing: consent.ad_storage
		};
		dataLayer.push(payload);
		if (isFirst) {
			var firstPayload = {};
			for (var key in payload) { if (payload.hasOwnProperty(key)) { firstPayload[key] = payload[key]; } }
			firstPayload.event = 'omf_first_consent_update';
			dataLayer.push(firstPayload);
		}
		if (persist && actionType) {
			sendConsentLog(actionType, consent);
		}
	}

	function readCrossDomainParamsFromUrl() {
		if (!crossDomainEnabled) return null;
		var params = new URLSearchParams(window.location.search);
		if (!params.has('omf_consent')) return null;
		return params.get('omf_consent');
	}

	function stripCrossDomainParamFromUrl() {
		var params = new URLSearchParams(window.location.search);
		if (!params.has('omf_consent')) return;
		params.delete('omf_consent');
		var query = params.toString();
		var newUrl = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
		window.history.replaceState({}, '', newUrl);
	}

	// ---- cross-domain consent signing (HMAC-SHA256 via Web Crypto) ----
	// Prevents an attacker from forging ?omf_consent=marketing,statistics on a shared
	// link to silently grant consent on a visitor's behalf. Both domains sharing
	// consent must be configured with the SAME crossDomainSecret.

	function hmacSignHex(message, secret) {
		if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
			return Promise.resolve(null);
		}
		var enc = new TextEncoder();
		return window.crypto.subtle.importKey(
			'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
		).then(function (key) {
			return window.crypto.subtle.sign('HMAC', key, enc.encode(message));
		}).then(function (sigBuffer) {
			var bytes = new Uint8Array(sigBuffer);
			var hex = '';
			for (var i = 0; i < bytes.length; i++) {
				hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
			}
			return hex;
		}, function () {
			return null;
		});
	}

	// A signature alone only proves "someone who knows the secret produced this
	// exact category combination" - since there are only 8 possible combinations,
	// an attacker doesn't need to break the HMAC, they just need to observe ONE
	// legitimate token once (e.g. by using the banner themselves, or from any
	// shared link) and can then replay that same token against unlimited other
	// victims, forever. A timestamp + short expiry window closes this: a replayed
	// token goes stale almost immediately, while a genuine click-through (which
	// happens within seconds of the token being minted) still works normally.
	var CROSS_DOMAIN_TOKEN_MAX_AGE_MS = 2 * 60 * 1000;

	var signedCrossDomainParam = null;

	function refreshCrossDomainSignature() {
		signedCrossDomainParam = null;
		if (!crossDomainEnabled || !crossDomainSecret) return;
		var stored = getCookie(cookieName);
		if (!stored) return;
		var ts = String(Date.now());
		hmacSignHex(stored + '.' + ts, crossDomainSecret).then(function (hex) {
			if (hex) { signedCrossDomainParam = stored + '.' + ts + '.' + hex; }
		});
	}

	function verifyCrossDomainParam(raw, callback) {
		if (!crossDomainSecret) { callback(null); return; }
		var parts = raw.split('.');
		if (parts.length !== 3) { callback(null); return; }
		var categoriesStr = parts[0];
		var ts = parts[1];
		var sig = parts[2];
		var age = Date.now() - Number(ts);
		if (!ts || isNaN(age) || age < 0 || age > CROSS_DOMAIN_TOKEN_MAX_AGE_MS) { callback(null); return; }
		hmacSignHex(categoriesStr + '.' + ts, crossDomainSecret).then(function (expected) {
			callback(expected && expected === sig ? categoriesStr.split(',') : null);
		});
	}

	function setupCrossDomainLinks() {
		if (!crossDomainEnabled || !crossDomainHosts.length) return;
		document.addEventListener('click', function (ev) {
			if (!signedCrossDomainParam) return;
			var link = ev.target.closest ? ev.target.closest('a[href]') : null;
			if (!link) return;
			var linkUrl;
			try { linkUrl = new URL(link.href, window.location.href); } catch (e) { return; }
			if (crossDomainHosts.indexOf(linkUrl.hostname) === -1) return;
			linkUrl.searchParams.set('omf_consent', signedCrossDomainParam);
			link.href = linkUrl.toString();
		}, true);
	}

	function openOmfModal(id) {
		document.getElementById(id).classList.add('open');
		document.body.classList.add('omf-modal-open');
		var stored = getCookie(cookieName);
		if (stored !== null) {
			var categories = stored.split(',');
			var has = function (key) { return categories.indexOf(key) > -1; };
			document.getElementById('consent-marketing').checked = has('marketing');
			document.getElementById('consent-analytics').checked = has('statistics');
			document.getElementById('consent-preferences').checked = has('personalization');
			document.getElementById('consent-necessary').checked = true;
			document.getElementById('OmfSettingsPanel').classList.remove('open');
			document.getElementById('omf-goto-selection').classList.remove('hide-it');
			document.getElementById('omf-accept-selection').classList.remove('show-it');
			document.getElementById('omf-goto-selection').classList.add('show-it');
			document.getElementById('omf-accept-selection').classList.add('hide-it');
		}
		closeOmfDetailsPanel();
	}

	function openOmfSettingsPanel(id) {
		closeOmfDetailsPanel();
		document.getElementById(id).classList.add('open');
		document.getElementById('omf-goto-selection').classList.remove('show-it');
		document.getElementById('omf-accept-selection').classList.remove('hide-it');
		document.getElementById('omf-goto-selection').classList.add('hide-it');
		document.getElementById('omf-accept-selection').classList.add('show-it');
	}

	function openOmfDetailsPanel() {
		document.getElementById('OmfSettingsPanel').classList.remove('open');
		document.getElementById('OmfDetailsPanel').classList.add('open');
		document.getElementById('omf-goto-selection').classList.add('hide-it');
		document.getElementById('omf-accept-selection').classList.add('hide-it');
		document.getElementById('omf-reject-all').classList.add('hide-it');
		document.getElementById('omf-accept-all').classList.add('hide-it');
		document.getElementById('omf-back-from-details').classList.remove('hide-it');
		document.getElementById('omf-back-from-details').classList.add('show-it');
	}

	function closeOmfDetailsPanel() {
		document.getElementById('OmfDetailsPanel').classList.remove('open');
		document.getElementById('omf-back-from-details').classList.remove('show-it');
		document.getElementById('omf-back-from-details').classList.add('hide-it');
		document.getElementById('omf-goto-selection').classList.remove('hide-it');
		document.getElementById('omf-accept-selection').classList.remove('show-it');
		document.getElementById('omf-reject-all').classList.remove('hide-it');
		document.getElementById('omf-accept-all').classList.remove('hide-it');
	}

	function acceptAllCookies() {
		document.getElementById('consent-marketing').checked = true;
		document.getElementById('consent-analytics').checked = true;
		document.getElementById('consent-preferences').checked = true;
		document.getElementById('consent-necessary').checked = true;
		acceptSelectedCookies('accept_all');
	}

	function rejectAllCookies() {
		document.getElementById('consent-marketing').checked = false;
		document.getElementById('consent-analytics').checked = false;
		document.getElementById('consent-preferences').checked = false;
		document.getElementById('consent-necessary').checked = true;
		acceptSelectedCookies('reject_all');
	}

	function acceptSelectedCookies(actionType) {
		var consent = {
			ad_storage: document.getElementById('consent-marketing').checked ? 'granted' : 'denied',
			ad_user_data: document.getElementById('consent-marketing').checked ? 'granted' : 'denied',
			ad_personalization: document.getElementById('consent-marketing').checked ? 'granted' : 'denied',
			analytics_storage: document.getElementById('consent-analytics').checked ? 'granted' : 'denied',
			personalization_storage: document.getElementById('consent-preferences').checked ? 'granted' : 'denied',
			functionality_storage: 'granted',
			security_storage: 'granted'
		};
		applyConsent(consent, true, actionType || 'save_preferences');
		document.querySelector('.omf-modal.open').classList.remove('open');
		document.body.classList.remove('omf-modal-open');
	}

	window.dataLayer = window.dataLayer || [];
	function gtag() { dataLayer.push(arguments); }

	function isOnPolicyPage() {
		if (!privacyPolicyUrl) return false;
		try {
			var href = new URL(privacyPolicyUrl, window.location.href);
			var hrefPath = String(href.pathname) + '/';
			var urlPath = String(window.location.pathname) + '/';
			return urlPath.indexOf(hrefPath) === 0;
		} catch (e) {
			return false;
		}
	}

	function init() {
		detectAdblock(function (blocked) { adblockDetected = blocked; });
		injectFont();
		injectStyle();
		injectMarkup();
		OmfDictionary.translate();
		document.getElementById('OmfDetailsPanel').innerHTML = buildCookieTables();

		var incoming = readCrossDomainParamsFromUrl();
		if (incoming) {
			verifyCrossDomainParam(incoming, function (categories) {
				if (categories) {
					applyConsent(consentFromCategories(categories), true, 'cross_domain_inherit');
				} else if (getCookie(cookieName) === null && !isOnPolicyPage()) {
					openOmfModal('omf-accept');
				}
				stripCrossDomainParamFromUrl();
			});
		} else if (getCookie(cookieName) === null) {
			if (!isOnPolicyPage()) { openOmfModal('omf-accept'); }
		}

		refreshCrossDomainSignature();
		if (crossDomainEnabled && crossDomainSecret) {
			setInterval(refreshCrossDomainSignature, 60 * 1000);
		}
		setupCrossDomainLinks();

		document.getElementById('omf-accept-all').addEventListener('click', function () {
			acceptAllCookies();
		});
		document.getElementById('omf-reject-all').addEventListener('click', function () {
			rejectAllCookies();
		});
		document.getElementById('omf-accept-selection').addEventListener('click', function () {
			acceptSelectedCookies();
		});
		document.getElementById('omf-goto-selection').addEventListener('click', function () {
			openOmfSettingsPanel('OmfSettingsPanel');
		});
		document.getElementById('omf-goto-details').addEventListener('click', function () {
			openOmfDetailsPanel();
		});
		document.getElementById('omf-back-from-details').addEventListener('click', function () {
			closeOmfDetailsPanel();
		});
		document.getElementById('omf-open-settings').addEventListener('click', function () {
			openOmfModal('omf-accept');
		});
	}

	if (document.body) {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
