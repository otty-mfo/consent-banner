/*!
 * Selfhosted, config-driven cookie consent banner for Google Consent Mode v2.
 * Reads window.__parBannerConfig (set by the GTM template) for:
 * primaryColor, bannerPosition, privacyPolicyUrl, defaultLang,
 * cookieName, cookieDomain, cookieExpiryDays,
 * crossDomain: { enabled, hosts: [...] }
 */
(function () {
	var cfg = window.__parBannerConfig || {};
	var primaryColor = cfg.primaryColor || '#4F74CB';
	var allowedPositions = ['center', 'bottom-right', 'bottom-left'];
	var bannerPosition = allowedPositions.indexOf(cfg.bannerPosition) > -1 ? cfg.bannerPosition : 'center';
	var settingsButtonSide = bannerPosition === 'bottom-left' ? 'right' : 'left';
	var privacyPolicyUrl = cfg.privacyPolicyUrl || '';
	var cookieName = cfg.cookieName || cfg.storageKey || 'par_consent_state';
	var cookieDomain = cfg.cookieDomain || '';
	var cookieExpiryDays = cfg.cookieExpiryDays || 365;
	var crossDomainEnabled = !!(cfg.crossDomain && cfg.crossDomain.enabled);
	var crossDomainHosts = (cfg.crossDomain && cfg.crossDomain.hosts) || [];

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
},
},
'translate': function() {
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

	// ---- inject CSS ----
	function injectStyle() {
		var style = document.createElement('style');
		style.textContent = `:root{--par-primary: ${primaryColor};}
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
	border: 1px solid #000000!important;
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
	background-color: #000000;
}
.par-modal__button--active:hover,
.par-modal__button--active:focus {
	background-color: #4d4d4d;
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
	background-image: url("https://cdn.jsdelivr.net/gh/patakiattilaroland-ppc/consent-banner@v1.0.0/assets/settings-icon.svg");
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
                <img class="par-modal__icon" src="https://cdn.jsdelivr.net/gh/patakiattilaroland-ppc/consent-banner@v1.0.0/assets/settings-icon.svg" alt="" aria-hidden="true">
            </div>
            <div class="par-modal__body">
				<span class="par-body-title-text"></span>
				<span class="par-body-description-text"></span>               
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
			
            <div class="par-modal__footer">
                <button class="par-modal__button" id="par-goto-selection"><span class="par-footer-open-settings-text"></span></button>
				<button id="par-accept-selection" class="par-modal__button show_on_settings"><span class="par-footer-accept-selection-text"></span></button>
                <button id="par-accept-all" class="par-modal__button par-modal__button--active"><span class="par-footer-accept-all-text"></span></button>
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
	}

	function openParSettingsPanel(id) {
		document.getElementById(id).classList.add('open');
		document.getElementById('par-goto-selection').classList.remove('show-it');
		document.getElementById('par-accept-selection').classList.remove('hide-it');
		document.getElementById('par-goto-selection').classList.add('hide-it');
		document.getElementById('par-accept-selection').classList.add('show-it');
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
