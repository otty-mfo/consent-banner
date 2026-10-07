/*!
 * Selfhosted, config-driven cookie consent banner for Google Consent Mode v2.
 * Reads window.__parBannerConfig (set by the GTM template) for:
 * primaryColor, buttonColor, buttonBorderColor, bannerPosition, privacyPolicyUrl, defaultLang,
 * cookieName, cookieDomain, cookieExpiryDays,
 * crossDomain: { enabled, hosts: [...] }
 */
(function () {
	var cfg = window.__parBannerConfig || {};
	var primaryColor = cfg.primaryColor || '#4F74CB';
	var buttonColor = cfg.buttonColor || '#000000';
	var buttonBorderColor = cfg.buttonBorderColor || '#000000';
	var allowedPositions = ['center', 'bottom-right', 'bottom-left'];
	var bannerPosition = allowedPositions.indexOf(cfg.bannerPosition) > -1 ? cfg.bannerPosition : 'center';
	var settingsButtonSide = bannerPosition === 'bottom-left' ? 'right' : 'left';
	var privacyPolicyUrl = cfg.privacyPolicyUrl || '';
	var cookieName = cfg.cookieName || cfg.storageKey || 'par_consent_state';
	var cookieDomain = cfg.cookieDomain || '';
	var cookieExpiryDays = cfg.cookieExpiryDays || 365;
	var crossDomainEnabled = !!(cfg.crossDomain && cfg.crossDomain.enabled);
	var crossDomainHosts = (cfg.crossDomain && cfg.crossDomain.hosts) || [];
	var cookieVendors = cfg.cookieVendors || {};

	// ---- translations ----
var ParDictionary = {
'defaultLang' : 'en',
'trans_words': {
'en' : {				
	'par-header-title-text' : '<p>This website uses cookies</p>',
	'par-body-title-text' : '<p>To ensure the proper functioning of the website, the use of certain cookies is essential. Additionally, we use cookies for statistical, marketing measurement, and advertising purposes. These latter cookies are loaded only after clicking the "Accept" button. For more information about cookies, please refer to our Privacy Policy.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Privacy Policy</a></p>`,
	'par-body-necessary-title-text' : 'Necessary',
	'par-body-preferences-title-text' : 'Personalization',
	'par-body-analytics-title-text' : 'Statistics',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Manage Cookies',
	'par-footer-accept-selection-text' : 'Save preferences',
	'par-footer-accept-all-text' : 'Accept',
	'par-body-details-link-text' : 'Open detailed cookie notice',
	'par-footer-back-text' : 'Back',
},
'hu' : {			
	'par-header-title-text' : '<p>Ez a weboldal sütiket használ</p>',
	'par-body-title-text' : '<p>Az oldal helyes működéséhez elengedhetetlen bizonyos cookie-k használata. Továbbá statisztikai, marketing mérési és hirdetési célból is használunk cookie-kat. Utóbbiak a Rendben gombra kattintás után töltődnek be. A sütikről bővebb tájékoztatás az adatkezelési tájékoztatóban olvasható.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Adatkezelési tájékoztató</a></p>`,
	'par-body-necessary-title-text' : 'Elengedhetetlen',
	'par-body-preferences-title-text' : 'Beállítások',
	'par-body-analytics-title-text' : 'Statisztikai',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Sütik testreszabása',
	'par-footer-accept-selection-text' : 'Beállítások mentése',
	'par-footer-accept-all-text' : 'Rendben',
	'par-body-details-link-text' : 'Részletes süti tájékoztató megnyitása',
	'par-footer-back-text' : 'Vissza',
},
'de' : {			
	'par-header-title-text' : '<p>Diese Website verwendet Cookies</p>',
	'par-body-title-text' : '<p>Für das ordnungsgemäße Funktionieren der Seite ist die Verwendung bestimmter Cookies unerlässlich. Darüber hinaus verwenden wir Cookies zu statistischen, Marketing- und Werbezwecken. Diese werden erst nach dem Klick auf „Alle akzeptieren“ geladen. Weitere Informationen zu Cookies finden Sie in der Datenschutzerklärung.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span>Datenschutzerklärung</a></p>`,
	'par-body-necessary-title-text' : 'Unverzichtbar',
	'par-body-preferences-title-text' : 'Personalisierung',
	'par-body-analytics-title-text' : 'Statistiken',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Cookies anpassen',
	'par-footer-accept-selection-text' : 'Auswahl bestätigen',
	'par-footer-accept-all-text' : 'Alle akzeptieren',
	'par-body-details-link-text' : 'Detaillierte Cookie-Erklärung öffnen',
	'par-footer-back-text' : 'Zurück',
},
'es' : {				
	'par-header-title-text' : '<p>Este sitio web utiliza cookies</p>',
	'par-body-title-text' : '<p>Para garantizar el correcto funcionamiento del sitio web, es esencial el uso de ciertas cookies. Además, utilizamos cookies con fines estadísticos, de medición de marketing y de publicidad. Estas últimas cookies se cargan solo después de hacer clic en el botón "Aceptar". Para obtener más información sobre las cookies, consulte nuestra Política de Privacidad.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Política de Privacidad</a></p>`,
	'par-body-necessary-title-text' : 'Necesarias',
	'par-body-preferences-title-text' : 'Personalización',
	'par-body-analytics-title-text' : 'Estadísticas',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Gestionar cookies',
	'par-footer-accept-selection-text' : 'Guardar preferencias',
	'par-footer-accept-all-text' : 'Aceptar',
	'par-body-details-link-text' : 'Abrir información detallada de cookies',
	'par-footer-back-text' : 'Atrás',
},
'fr' : {			
	'par-header-title-text' : '<p>Informations sur les cookies</p>',
	'par-body-title-text' : '<p>Lutilisation de certains cookies est essentielle au bon fonctionnement du site Web. Nous utilisons également des cookies à des fins statistiques, de mesures marketing et publicitaires. Ces derniers sont chargés lorsque vous cliquez sur le bouton Accepter. Vous pouvez trouver plus d informations sur les cookies dans la section de la politique de confidentialité.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span>Politique de confidentialité</a></p>`,
	'par-body-necessary-title-text' : 'Fonctionnels',
	'par-body-preferences-title-text' : 'Préférences',
	'par-body-analytics-title-text' : 'Statistiques',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Paramètres',
	'par-footer-accept-selection-text' : 'Afficher les paramètres',
	'par-footer-accept-all-text' : 'Accepter',
	'par-body-details-link-text' : 'Ouvrir les informations détaillées sur les cookies',
	'par-footer-back-text' : 'Retour',
},
'it' : {				
	'par-header-title-text' : '<p>Questo sito web utilizza i cookie</p>',
	'par-body-title-text' : '<p>Per garantire il corretto funzionamento del sito web, è essenziale l\'uso di alcuni cookie. Inoltre, utilizziamo cookie per scopi statistici, di misurazione del marketing e pubblicitari. Questi ultimi cookie vengono caricati solo dopo aver cliccato sul pulsante "Accetta". Per maggiori informazioni sui cookie, consultare la nostra Informativa sulla Privacy.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Informativa sulla Privacy</a></p>`,
	'par-body-necessary-title-text' : 'Necessari',
	'par-body-preferences-title-text' : 'Personalizzazione',
	'par-body-analytics-title-text' : 'Statistiche',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Gestisci cookie',
	'par-footer-accept-selection-text' : 'Salva preferenze',
	'par-footer-accept-all-text' : 'Accetta',
	'par-body-details-link-text' : 'Apri informativa dettagliata sui cookie',
	'par-footer-back-text' : 'Indietro',
},
'pt' : {				
	'par-header-title-text' : '<p>Este site utiliza cookies</p>',
	'par-body-title-text' : '<p>Para garantir o correto funcionamento do site, é essencial o uso de determinados cookies. Além disso, utilizamos cookies para fins estatísticos, de medição de marketing e de publicidade. Estes últimos cookies são carregados apenas após clicar no botão "Aceitar". Para mais informações sobre os cookies, consulte a nossa Política de Privacidade.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Política de Privacidade</a></p>`,
	'par-body-necessary-title-text' : 'Necessários',
	'par-body-preferences-title-text' : 'Personalização',
	'par-body-analytics-title-text' : 'Estatísticas',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Gerir cookies',
	'par-footer-accept-selection-text' : 'Guardar preferências',
	'par-footer-accept-all-text' : 'Aceitar',
	'par-body-details-link-text' : 'Abrir informação detalhada sobre cookies',
	'par-footer-back-text' : 'Voltar',
},
'ro' : {			
	'par-header-title-text' : '<p>Setări cookie</p>',
	'par-body-title-text' : '<p>Utilizarea anumitor cookie-uri este esențială pentru ca site-ul să funcționeze corect. De asemenea, folosim cookie-uri în scopuri statistice, de măsurare de marketing și de publicitate. Acestea din urmă sunt încărcate când faceți clic pe butonul Accepta toate. Puteți obține mai multe informații despre cookie-uri prin pagina Politica de Confidențialitate.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span>Politica de confidențialitate</a></p>`,
	'par-body-necessary-title-text' : 'Necesar',
	'par-body-preferences-title-text' : 'Preferințe',
	'par-body-analytics-title-text' : 'Statistici',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Gestionați cookie-urile',
	'par-footer-accept-selection-text' : 'Confirmați selecția',
	'par-footer-accept-all-text' : 'Accepta toate',
	'par-body-details-link-text' : 'Deschide informațiile detaliate despre cookie-uri',
	'par-footer-back-text' : 'Înapoi',
},
'sk' : {			
	'par-header-title-text' : '<p>Správa súhlasu so súbormi cookie</p>',
	'par-body-title-text' : '<p>Pre správne fungovanie stránky je nevyhnutné používanie určitých súborov cookie. Okrem toho používame súbory cookie aj na štatistické, marketingové merania a reklamné účely. Tieto súbory cookie sa načítajú po kliknutí na tlačidlo „Prijať“. Podrobnejšie informácie o súboroch cookie nájdete v našom oznámení o spracúvaní osobných údajov.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span>Zásady ochrany osobných údajove</a></p>`,
	'par-body-necessary-title-text' : 'Funkčné',
	'par-body-preferences-title-text' : 'Predvoľby',
	'par-body-analytics-title-text' : 'Štatistiky',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Zobraziť preferencie',
	'par-footer-accept-selection-text' : 'Uloženie predvolieb',
	'par-footer-accept-all-text' : 'Prijať',
	'par-body-details-link-text' : 'Otvoriť podrobné informácie o súboroch cookie',
	'par-footer-back-text' : 'Späť',
},
'bg' : {			
	'par-header-title-text' : '<p>Информация за бисквитки</p>',
	'par-body-title-text' : '<p>Използването на определени бисквитки е от съществено значение за правилното функциониране на уебсайта. Ние също така използваме бисквитки за статистически, маркетингови измервания и рекламни цели. Последните се зареждат, когато щракнете върху бутона „Приемам“. Повече информация за бисквитките можете да намерите в раздела за поверителност.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span>Политика за защита на личните данни</a></p>`,
	'par-body-necessary-title-text' : 'Функционален',
	'par-body-preferences-title-text' : 'Предпочитания',
	'par-body-analytics-title-text' : 'Статистика',
	'par-body-marketing-title-text' : 'Маркетинг',
	'par-footer-open-settings-text' : 'Настройки',
	'par-footer-accept-selection-text' : 'Преглед на настройките',
	'par-footer-accept-all-text' : 'Приемам',
	'par-body-details-link-text' : 'Отвори подробна информация за бисквитките',
	'par-footer-back-text' : 'Назад',
},
'hr' : {			
	'par-header-title-text' : '<p>Informacije o kolačićima</p>',
	'par-body-title-text' : '<p>Korištenje određenih kolačića nužno je za pravilno funkcioniranje web stranice. Također koristimo kolačiće za statističke, marketinške mjere i reklamne svrhe. Ovi kolačići se učitavaju kada kliknete na gumb „Prihvaćam”. Više informacija o kolačićima možete pronaći u odjeljku o privatnosti.</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span>Politika zaštite privatnosti</a></p>`,
	'par-body-necessary-title-text' : 'Funkcionalni',
	'par-body-preferences-title-text' : 'Preferencije',
	'par-body-analytics-title-text' : 'Statistika',
	'par-body-marketing-title-text' : 'Marketing',
	'par-footer-open-settings-text' : 'Postavke',
	'par-footer-accept-selection-text' : 'Pregled postavki',
	'par-footer-accept-all-text' : 'Prihvaćam',
	'par-body-details-link-text' : 'Otvori detaljne informacije o kolačićima',
	'par-footer-back-text' : 'Natrag',
},
'cs' : {
    'par-header-title-text' : '<p>Tato webová stránka používá soubory cookie</p>',
    'par-body-title-text' : '<p>Pro zajištění správného fungování webu je nezbytné použití určitých souborů cookie. Dále používáme soubory cookie pro statistické účely, měření marketingu a reklamní účely. Tyto soubory cookie se načítají pouze po kliknutí na tlačítko "Přijmout". Více informací o souborech cookie naleznete v našich Zásadách ochrany osobních údajů.</p>',
    'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Zásady ochrany osobních údajů</a></p>`,
    'par-body-necessary-title-text' : 'Nezbytné',
    'par-body-preferences-title-text' : 'Personalizace',
    'par-body-analytics-title-text' : 'Statistiky',
    'par-body-marketing-title-text' : 'Marketing',
    'par-footer-open-settings-text' : 'Spravovat cookies',
    'par-footer-accept-selection-text' : 'Uložit preference',
    'par-footer-accept-all-text' : 'Přijmout',
    'par-body-details-link-text' : 'Otevřít podrobné informace o souborech cookie',
    'par-footer-back-text' : 'Zpět',
},
'pl' : {				
    'par-header-title-text' : '<p>Ta strona używa plików cookie</p>',
    'par-body-title-text' : '<p>Aby zapewnić prawidłowe działanie strony, niektóre pliki cookie są niezbędne. Dodatkowo wykorzystujemy pliki cookie do celów statystycznych, marketingowych oraz reklamowych. Te dodatkowe pliki cookie są ładowane dopiero po kliknięciu przycisku „Akceptuję”. Więcej informacji na temat plików cookie znajdziesz w naszej Polityce Prywatności.</p>',
    'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> Polityka Prywatności</a></p>`,
    'par-body-necessary-title-text' : 'Niezbędne',
    'par-body-preferences-title-text' : 'Personalizacja',
    'par-body-analytics-title-text' : 'Statystyka',
    'par-body-marketing-title-text' : 'Marketing',
    'par-footer-open-settings-text' : 'Zarządzaj plikami cookie',
    'par-footer-accept-selection-text' : 'Zapisz preferencje',
    'par-footer-accept-all-text' : 'Akceptuję',
    'par-body-details-link-text' : 'Otwórz szczegółowe informacje o plikach cookie',
    'par-footer-back-text' : 'Wstecz',
},
'ja' : {				
	'par-header-title-text' : '<p>このウェブサイトはクッキーを使用しています</p>',
	'par-body-title-text' : '<p>ウェブサイトを正しく機能させるためには、特定のクッキーの使用が不可欠です。さらに、統計、マーケティングの測定、広告の目的でクッキーを使用しています。これらのクッキーは「同意する」ボタンをクリックした後にのみ読み込まれます。クッキーに関する詳細については、プライバシーポリシーをご覧ください。</p>',
	'par-body-description-text' : `<p><a class="policy_url" href="${privacyPolicyUrl}" target="_blank"><span></span> プライバシーポリシー</a></p>`,
	'par-body-necessary-title-text' : '必須',
	'par-body-preferences-title-text' : 'パーソナライズ',
	'par-body-analytics-title-text' : '統計',
	'par-body-marketing-title-text' : 'マーケティング',
	'par-footer-open-settings-text' : 'クッキーを管理',
	'par-footer-accept-selection-text' : '設定を保存',
	'par-footer-accept-all-text' : '同意する',
	'par-body-details-link-text' : '詳細なクッキー通知を開く',
	'par-footer-back-text' : '戻る',
},
},
'resolveLang': function() {
	var lang = '';
		if (navigator.languages && navigator.languages.length > 0) {
			lang = navigator.languages[0];
		} else if (navigator.language) {
			lang = navigator.language;
		} else {
			lang = ParDictionary['defaultLang'];
		}
			lang = lang.split('-')[0].toLowerCase();
			if (typeof lang == 'undefined' || typeof ParDictionary['trans_words'][lang] == 'undefined' || lang == '') {lang = ParDictionary['defaultLang'];}
			return lang;
	},
	'text': function(parkey) {
		var lang = ParDictionary.resolveLang();
		return ParDictionary['trans_words'][lang][parkey] || ParDictionary['trans_words'][ParDictionary['defaultLang']][parkey] || '';
	},
	'translate': function() {
			var lang = ParDictionary.resolveLang();
			var elements = false;
			for (var parkey in ParDictionary['trans_words'][lang]) {
				if (ParDictionary['trans_words'][lang].hasOwnProperty(parkey)) {
					elements = document.getElementsByClassName(parkey);
					if (elements.length) {
						elements[0].outerHTML = ParDictionary['trans_words'][lang][parkey];
					}
				}
			}
		},
	}

	ParDictionary.defaultLang = cfg.defaultLang || ParDictionary.defaultLang;

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
		{ category: 'marketing', vendor: 'reddit', name: '_rdt_uuid', provider: 'Reddit', providerUrl: 'https://www.redditinc.com/policies/privacy-policy', purpose: 'A látogatókat több weboldalon keresztül nyomon követi, hogy a preferenciái alapján releváns hirdetést jelenítsen meg.', duration: '3 hónap', type: 'HTTP-süti' }
	];

	function buildCookieTables() {
		var titleKeys = {
			necessary: 'par-body-necessary-title-text',
			preferences: 'par-body-preferences-title-text',
			statistics: 'par-body-analytics-title-text',
			marketing: 'par-body-marketing-title-text'
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
					? '<a href="' + c.providerUrl + '" target="_blank" rel="noopener noreferrer nofollow">' + c.provider + '</a>'
					: c.provider;
				return '<tr><td>' + c.name + '</td><td>' + providerCell + '</td><td>' + c.purpose + '</td><td>' + c.duration + '</td><td>' + c.type + '</td></tr>';
			}).join('');
			html += '<details' + (idx === 0 ? ' open' : '') + '>' +
				'<summary>' + ParDictionary.text(titleKeys[cat]) + ' (' + rows.length + ')</summary>' +
				'<div class="par-cookie-table-wrapper"><table class="par-cookie-table"><thead><tr><th>Név</th><th>Szolgáltató</th><th>Cél</th><th>Max. tárolási idő</th><th>Típus</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' +
				'</details>';
		});
		return html;
	}

	// ---- inject CSS ----
	function injectStyle() {
		var style = document.createElement('style');
		style.textContent = `:root{--par-primary: ${primaryColor}; --par-button: ${buttonColor}; --par-button-border: ${buttonBorderColor};}
.par-modal{
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
	font-family: "Montserrat", sans-serif!important;
	font-optical-sizing: auto;
}
.par-modal:not(.open) {
	display: none!important;
	opacity: 0!important;
}
.par-modal.open {
	overflow-x: hidden!important;
	overflow-y: auto!important;
}
.par-modal--position-bottom-right {
	justify-content: flex-end!important;
	align-items: flex-end!important;
}
.par-modal--position-bottom-left {
	justify-content: flex-start!important;
	align-items: flex-end!important;
}
.par-modal--position-bottom-right .par-modal__dialog,
.par-modal--position-bottom-left .par-modal__dialog {
	margin: 1em;
	max-inline-size: 26em;
}
.par-modal__header p {
	font-size: 24px!important;
	font-weight: 700!important;
	line-height: 1.1em!important;
	color: var(--par-primary)!important;
}
.par-modal .par-modal__dialog {
	transition: transform .3s ease-out;
	transform: translate(0,-50px);
	position: relative;
	margin: 1.75em auto;
	inline-size: calc(100% - 1em);
	pointer-events: none;
	max-inline-size: 42em;
	max-block-size: 80vh;
}
.par-modal.open .par-modal__dialog {
	transform: none;
    font-size: initial;
}
.par-modal__content {
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
.par-modal__content > * {
	padding: 0;
}
.par-modal__content > * > * {
	margin-block: unset;
}
.par-modal__header {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	align-content: normal;
	gap: 20px;
	padding-bottom: 0;
}
.par-modal__icon {
	inline-size: 2em;
	block-size: 2em;
	flex-shrink: 0;
}
.par-modal__body > p {
	color: #212121;
}
.par-modal__body > p, .par-modal__body > p > a{
	font-size: 14px!important;
	line-height: 1.3em!important;
}
.par-modal__body > p > a {
	color: var(--par-primary);
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: center;
	align-content: normal;
	line-height: 1.3em;
	gap: 10px;
}
.par-modal__body > p > a > span{
	display: block;
	width: 8px;
	height: 8px;
	border-top: 1px solid var(--par-primary);
	border-right: 1px solid var(--par-primary);
	transform: rotate(45deg);
}
.par-modal__body > * + * {
	margin-top: .8em;
}
.par-modal__footer {
	display: flex;
	align-items: stretch;
	gap: 2em;
	padding-top: 0;
}
.par-modal_settings{
	display: none;
}
.par-modal_settings.open{
	display: block;
}
.par-modal_details{
	display: none;
}
.par-modal_details.open{
	display: block;
}
.par-modal_details details + details{
	margin-top: .5em;
}
.par-cookie-table-wrapper{
	overflow-x: auto;
}
.par-cookie-table{
	width: 100%;
	min-width: 34em;
	table-layout: fixed;
	border-collapse: collapse;
	font-size: 12px;
	line-height: 1.4em;
}
.par-cookie-table th,
.par-cookie-table td{
	text-align: left;
	vertical-align: top;
	padding: 6px 8px;
	border-bottom: 1px solid #dadce0;
	white-space: normal;
	overflow-wrap: break-word;
	word-break: break-word;
}
.par-cookie-table th{
	font-weight: bold;
	color: var(--par-primary);
}
.par-cookie-table th:nth-child(1), .par-cookie-table td:nth-child(1){ width: 14%; }
.par-cookie-table th:nth-child(2), .par-cookie-table td:nth-child(2){ width: 14%; }
.par-cookie-table th:nth-child(3), .par-cookie-table td:nth-child(3){ width: 42%; }
.par-cookie-table th:nth-child(4), .par-cookie-table td:nth-child(4){ width: 15%; }
.par-cookie-table th:nth-child(5), .par-cookie-table td:nth-child(5){ width: 15%; }
.par-link-button{
	background: transparent;
	border: none;
	padding: 0;
	cursor: pointer;
	color: var(--par-primary);
	font-size: 14px!important;
	text-decoration: underline;
	font-family: "Montserrat", sans-serif!important;
}
.par-modal_settings-wrapper{
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: center;
	align-items: center;
	align-content: normal;
	gap: 20px;
}
.par-switch_field{
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
.par-switch_field .par-switch_title{
	font-size: 16px!important;
	text-align: center;
	font-weight: bold;
	color: var(--par-primary);
}
.par-switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}
.par-switch input { 
	opacity: 0;
	width: 0;
	height: 0;
}
.par-slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--par-primary);
	-webkit-transition: .3s;
	transition: .3s;
	border-radius: 34px;
}
.par-slider:before {
	position: absolute;
	content: "";
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: #afe1ff;
	-webkit-transition: .3s;
	transition: .3s;
	border-radius: 50%;
}

input:checked + .par-slider {
	background-color: #0056eb;
}
input:focus + .par-slider {
	box-shadow: 0 0 1px #2196F3;
}
input:checked + .par-slider:before {
	-webkit-transform: translateX(26px);
	-ms-transform: translateX(26px);
	transform: translateX(26px);
	background-color: #fff;
}
input:disabled + .par-slider {
	background-color: #e6f5ff;
}
input:disabled + .par-slider:before {
	background-color: #0056eb;
}
.par-modal__button {
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
	font-family: "Montserrat", sans-serif!important;
	font-optical-sizing: auto;
	border: 1px solid var(--par-button-border)!important;
}
 .par-modal__button.show_on_settings{
	 display: none;
 }
 .par-modal__button.show-it{
	 display: block;
 }	 
 .par-modal__button.hide-it{
	 display: none;
 }
.par-modal__button:hover,
.par-modal__button:focus {
	background-color: #f0f0f0;
	background-image: none;
	color: #000000;
}
.par-modal__button--active {
	color: #ffffff;
	background-color: var(--par-button);
}
.par-modal__button--active:hover,
.par-modal__button--active:focus {
	background-color: var(--par-button);
	filter: brightness(0.85);
	color: #ffffff;
}
.par-modal__button--settings, .par-modal__button--settings:hover {
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
	background-image: url("https://cdn.jsdelivr.net/gh/otty-mfo/consent-banner@v1.1.0/assets/settings-icon.svg");
	background-repeat: no-repeat;
	background-size: contain;
	width: 3em;
	height: 3em;
}
.par-modal__button--settings--right, .par-modal__button--settings--right:hover {
	inset-inline-start: auto;
	inset-inline-end: 1em;
}
.par-modal__button--settings svg {
	inline-size: 1em;
	block-size: 1em;
}
.par-modal__button-close {
	border: none;
	background: transparent;
	float: right;
	font-size: 2em!important;
	cursor: pointer;
}
.par-modal__button-close:hover{
	color: #333333;
}
.par-modal details {
	padding: .5em;
	border: 1px solid #dadce0;
	border-radius: .25em;
}
.par-modal details summary {
	cursor: pointer;
}
.par-modal details summary > * {
	display: inline;
}
details[open] summary {
	border-bottom: 1px solid #dadce0;
	margin-bottom: 0.5em;
}
.par-modal details > div > * {
	margin-bottom: unset;
}
.par-modal details > div > * + * {
	margin-top: .5em;
}

@media only screen and (max-width:767px){
	.par-modal{
	}
	.par-modal--position-bottom-right,
	.par-modal--position-bottom-left {
		justify-content: center!important;
		align-items: center!important;
	}
	.par-modal .par-modal__dialog {
		max-inline-size: 90vw;
	}
	.par-modal--position-bottom-right .par-modal__dialog,
	.par-modal--position-bottom-left .par-modal__dialog {
		margin: 1.75em auto;
		max-inline-size: 90vw;
	}
	.par-modal__content {
		width: 90vw;
		box-sizing: border-box;
		gap: 5px;
		padding: 3vw;
	}
	
	.par-modal__header {
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		gap: 5px;
		padding-bottom: 0;
	}
	.par-modal__icon {
		inline-size: 1.5em;
		block-size: 1.5em;
	}

	.par-modal__header p{
		font-size: 20px!important;
	}
    .par-modal__body > p, .par-modal__body > p > a{
	    font-size: 14px!important;
    }
	.par-modal__footer {
		flex-direction:column-reverse;
		gap: 10px;
		margin-top: 10px;
	}
	.par-modal_settings-wrapper{
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
		align-content: normal;
		gap: 10px;
	}
	
	.par-switch_field{
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
		align-content: normal;
		gap: 10px;
		width: 100%;
	}
	.par-switch_field .par-switch_title{
		font-size: 16px!important;
		text-align: left!important;
	}
	.par-switch {
		width: 56px;
		height: 28px;
	}
	.par-slider:before {
		width: 20px;
		height: 20px;
	}
	input:checked + .par-slider:before {
		-webkit-transform: translateX(28px);
		-ms-transform: translateX(28px);
		transform: translateX(28px);
		background-color: #fff;
	}
    .par-modal__button--settings, .par-modal__button--settings:hover {
	    width: 2.75em;
	    height: 2.75em;
	    inset-block-end: max(0.75em, env(safe-area-inset-bottom));
	    inset-inline-start: 0.75em;
    }
    .par-modal__button--settings--right, .par-modal__button--settings--right:hover {
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
		wrap.innerHTML = `<div id="par-accept" class="par-modal par-modal--position-${bannerPosition}">
    <div role="dialog" class="par-modal__dialog" aria-label="Cookie Consent">
        <div class="par-modal__content">
            <div class="par-modal__header">
                <span class="par-header-title-text"></span>
                <img class="par-modal__icon" src="https://cdn.jsdelivr.net/gh/otty-mfo/consent-banner@v1.1.0/assets/settings-icon.svg" alt="" aria-hidden="true">
            </div>
            <div class="par-modal__body">
				<span class="par-body-title-text"></span>
				<span class="par-body-description-text"></span>
				<p><button type="button" class="par-link-button" id="par-goto-details"><span class="par-body-details-link-text"></span></button></p>
            </div>
			<div class="par-modal_settings" id="ParSettingsPanel">
				<div class="par-modal_settings-wrapper">
					<div class="par-switch_field">
						<span class="par-switch_title"><span class="par-body-necessary-title-text"></span></span>
						<label class="par-switch">
							<input id="consent-necessary" type="checkbox" value="cookiesNecessary" autocomplete="off" checked disabled/>
							<span class="par-slider"></span>
						</label>
					</div>
					<div class="par-switch_field">
						<span class="par-switch_title"><span class="par-body-preferences-title-text"></span></span>
						<label class="par-switch">
							<input id="consent-preferences" type="checkbox" value="cookiesPreferences" autocomplete="off" checked>
							<span class="par-slider"></span>
						</label>
					</div>
					<div class="par-switch_field">
						<span class="par-switch_title"><span class="par-body-analytics-title-text"></span></span>
						<label class="par-switch">
							<input id="consent-analytics" type="checkbox" value="cookiesAnalytics" autocomplete="off" checked>
							<span class="par-slider"></span>
						</label>
					</div>
					<div class="par-switch_field">
						<span class="par-switch_title"><span class="par-body-marketing-title-text"></span></span>
						<label class="par-switch">
							<input id="consent-marketing" type="checkbox" value="cookiesMarketing" autocomplete="off" checked>
							<span class="par-slider"></span>
						</label>
					</div>
				</div>
			</div>
			<div class="par-modal_details" id="ParDetailsPanel"></div>

            <div class="par-modal__footer">
                <button class="par-modal__button" id="par-goto-selection"><span class="par-footer-open-settings-text"></span></button>
				<button id="par-accept-selection" class="par-modal__button show_on_settings"><span class="par-footer-accept-selection-text"></span></button>
                <button id="par-accept-all" class="par-modal__button par-modal__button--active"><span class="par-footer-accept-all-text"></span></button>
				<button id="par-back-from-details" class="par-modal__button show_on_settings"><span class="par-footer-back-text"></span></button>
            </div>
        </div>
    </div>
</div>				

`;
		while (wrap.firstChild) { document.body.appendChild(wrap.firstChild); }

		var btn = document.createElement('div');
		var settingsButtonClass = 'par-modal__button--settings' + (settingsButtonSide === 'right' ? ' par-modal__button--settings--right' : '');
		btn.innerHTML = `<button type="button" class="${settingsButtonClass}" id="par-open-settings" aria-label="Cookie Settings"></button>`;
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
		document.cookie = name + '=' + encodeURIComponent(value) + expires + domainPart + '; path=/; SameSite=Lax';
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

	function applyConsent(consent, persist) {
		var isFirst = persist && getCookie(cookieName) === null;
		gtag('consent', 'update', consent);
		if (persist) {
			setCookie(cookieName, categoriesFromConsent(consent), cookieExpiryDays, cookieDomain);
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
			firstPayload.event = 'par_first_consent_update';
			dataLayer.push(firstPayload);
		}
	}

	function readCrossDomainParamsFromUrl() {
		if (!crossDomainEnabled) return null;
		var params = new URLSearchParams(window.location.search);
		if (!params.has('par_consent')) return null;
		return params.get('par_consent').split(',');
	}

	function stripCrossDomainParamFromUrl() {
		var params = new URLSearchParams(window.location.search);
		if (!params.has('par_consent')) return;
		params.delete('par_consent');
		var query = params.toString();
		var newUrl = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
		window.history.replaceState({}, '', newUrl);
	}

	function setupCrossDomainLinks() {
		if (!crossDomainEnabled || !crossDomainHosts.length) return;
		document.addEventListener('click', function (ev) {
			var stored = getCookie(cookieName);
			if (!stored) return;
			var link = ev.target.closest ? ev.target.closest('a[href]') : null;
			if (!link) return;
			var linkUrl;
			try { linkUrl = new URL(link.href, window.location.href); } catch (e) { return; }
			if (crossDomainHosts.indexOf(linkUrl.hostname) === -1) return;
			linkUrl.searchParams.set('par_consent', stored);
			link.href = linkUrl.toString();
		}, true);
	}

	function openParModal(id) {
		document.getElementById(id).classList.add('open');
		document.body.classList.add('par-modal-open');
		var stored = getCookie(cookieName);
		if (stored !== null) {
			var categories = stored.split(',');
			var has = function (key) { return categories.indexOf(key) > -1; };
			document.getElementById('consent-marketing').checked = has('marketing');
			document.getElementById('consent-analytics').checked = has('statistics');
			document.getElementById('consent-preferences').checked = has('personalization');
			document.getElementById('consent-necessary').checked = true;
			document.getElementById('ParSettingsPanel').classList.remove('open');
			document.getElementById('par-goto-selection').classList.remove('hide-it');
			document.getElementById('par-accept-selection').classList.remove('show-it');
			document.getElementById('par-goto-selection').classList.add('show-it');
			document.getElementById('par-accept-selection').classList.add('hide-it');
		}
		closeParDetailsPanel();
	}

	function openParSettingsPanel(id) {
		closeParDetailsPanel();
		document.getElementById(id).classList.add('open');
		document.getElementById('par-goto-selection').classList.remove('show-it');
		document.getElementById('par-accept-selection').classList.remove('hide-it');
		document.getElementById('par-goto-selection').classList.add('hide-it');
		document.getElementById('par-accept-selection').classList.add('show-it');
	}

	function openParDetailsPanel() {
		document.getElementById('ParSettingsPanel').classList.remove('open');
		document.getElementById('ParDetailsPanel').classList.add('open');
		document.getElementById('par-goto-selection').classList.add('hide-it');
		document.getElementById('par-accept-selection').classList.add('hide-it');
		document.getElementById('par-accept-all').classList.add('hide-it');
		document.getElementById('par-back-from-details').classList.remove('hide-it');
		document.getElementById('par-back-from-details').classList.add('show-it');
	}

	function closeParDetailsPanel() {
		document.getElementById('ParDetailsPanel').classList.remove('open');
		document.getElementById('par-back-from-details').classList.remove('show-it');
		document.getElementById('par-back-from-details').classList.add('hide-it');
		document.getElementById('par-goto-selection').classList.remove('hide-it');
		document.getElementById('par-accept-selection').classList.remove('show-it');
		document.getElementById('par-accept-all').classList.remove('hide-it');
	}

	function acceptAllCookies() {
		document.getElementById('consent-marketing').checked = true;
		document.getElementById('consent-analytics').checked = true;
		document.getElementById('consent-preferences').checked = true;
		document.getElementById('consent-necessary').checked = true;
		acceptSelectedCookies();
	}

	function acceptSelectedCookies() {
		var consent = {
			ad_storage: document.getElementById('consent-marketing').checked ? 'granted' : 'denied',
			ad_user_data: document.getElementById('consent-marketing').checked ? 'granted' : 'denied',
			ad_personalization: document.getElementById('consent-marketing').checked ? 'granted' : 'denied',
			analytics_storage: document.getElementById('consent-analytics').checked ? 'granted' : 'denied',
			personalization_storage: document.getElementById('consent-preferences').checked ? 'granted' : 'denied',
			functionality_storage: 'granted',
			security_storage: 'granted'
		};
		applyConsent(consent, true);
		document.querySelector('.par-modal.open').classList.remove('open');
		document.body.classList.remove('par-modal-open');
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
		injectStyle();
		injectMarkup();
		ParDictionary.translate();
		document.getElementById('ParDetailsPanel').innerHTML = buildCookieTables();

		var incoming = readCrossDomainParamsFromUrl();
		if (incoming) {
			applyConsent(consentFromCategories(incoming), true);
			stripCrossDomainParamFromUrl();
		} else if (getCookie(cookieName) === null) {
			if (!isOnPolicyPage()) { openParModal('par-accept'); }
		}

		setupCrossDomainLinks();

		document.getElementById('par-accept-all').addEventListener('click', function () {
			acceptAllCookies();
		});
		document.getElementById('par-accept-selection').addEventListener('click', function () {
			acceptSelectedCookies();
		});
		document.getElementById('par-goto-selection').addEventListener('click', function () {
			openParSettingsPanel('ParSettingsPanel');
		});
		document.getElementById('par-goto-details').addEventListener('click', function () {
			openParDetailsPanel();
		});
		document.getElementById('par-back-from-details').addEventListener('click', function () {
			closeParDetailsPanel();
		});
		document.getElementById('par-open-settings').addEventListener('click', function () {
			openParModal('par-accept');
		});
	}

	if (document.body) {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
