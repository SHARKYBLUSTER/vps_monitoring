/**
 * VPS Monitoring - Internationalization (i18n) Manager
 * Gère les traductions pour l'interface utilisateur
 */

class I18n {
  constructor() {
    this.translations = {};
    this.currentLang = 'fr';
    this.loaded = false;
    this.loadingPromise = null;
  }

  /**
   * Charge les traductions pour une langue
   * @param {string} lang - Code de la langue (ex: 'fr', 'en')
   * @returns {Promise<void>}
   */
  async load(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      this.loaded = true;
      return;
    }

    try {
      const response = await fetch(`/js/translations/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
      }
      this.translations[lang] = await response.json();
      this.currentLang = lang;
      this.loaded = true;
      localStorage.setItem('vps_monitoring_lang', lang);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Charger le français par défaut
      if (lang !== 'fr') {
        await this.load('fr');
      } else {
        this.currentLang = 'fr';
        this.loaded = true;
      }
    }
  }

  /**
   * Initialise i18n avec la langue sauvegardée ou par défaut
   */
  async init() {
    const savedLang = localStorage.getItem('vps_monitoring_lang') || 'fr';
    await this.load(savedLang);
  }

  /**
   * Traduit une clé de traduction
   * @param {string} key - Clé de traduction (ex: 'common.logout')
   * @param {Object} params - Paramètres optionnels pour la traduction
   * @returns {string}
   */
  t(key, params = {}) {
    if (!this.loaded) return key;

    const keys = key.split('.');
    let value = this.translations[this.currentLang];

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // Retourne la clé si non trouvée
      }
    }

    // Remplacement des paramètres (ex: "Bonjour {name}" -> "Bonjour John")
    if (typeof value === 'string') {
      for (const [param, val] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
      }
    }

    return value;
  }

  /**
   * Retourne la langue actuelle
   * @returns {string}
   */
  getCurrentLang() {
    return this.currentLang;
  }

  /**
   * Change de langue
   * @param {string} lang - Code de la nouvelle langue
   * @returns {Promise<void>}
   */
  async changeLanguage(lang) {
    await this.load(lang);
    this.updatePage();
  }

  /**
   * Met à jour toute la page avec la nouvelle langue
   */
  updatePage() {
    const event = new CustomEvent('languageChanged', {
      detail: { lang: this.currentLang }
    });
    window.dispatchEvent(event);
  }

  /**
   * Traduit un élément HTML avec l'attribut data-i18n
   * @param {HTMLElement} element - Élément à traduire
   */
  translateElement(element) {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = this.t(key);
      if (element.textContent !== translation) {
        element.textContent = translation;
      }
    }

    // Gérer les placeholders
    const placeholder = element.getAttribute('data-i18n-placeholder');
    if (placeholder) {
      element.placeholder = this.t(placeholder);
    }

    // Gérer les titres
    const title = element.getAttribute('data-i18n-title');
    if (title) {
      element.title = this.t(title);
    }
  }

  /**
   * Traduit tous les éléments avec l'attribut data-i18n
   */
  translateAll() {
    document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-title]').forEach(el => {
      this.translateElement(el);
    });
  }
}

// Initialisation de l'instance globale
const i18n = new I18n();

// Initialiser immédiatement
i18n.init().then(() => {
  // Traduire tous les éléments au chargement
  i18n.translateAll();
  
  // Écouter les changements de langue
  window.addEventListener('languageChanged', () => {
    i18n.translateAll();
  });
});

// Exporter pour usage dans d'autres scripts
window.i18n = i18n;

// Fonction utilitaire pour changer de langue (peut être appelée depuis HTML)
function changeLanguage(lang) {
  window.i18n.changeLanguage(lang);
}
