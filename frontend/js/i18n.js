/**
 * GigGatek Internationalization Module
 * Handles translations and language switching
 */

class I18n {
    constructor(options = {}) {
        this.options = {
            defaultLanguage: 'en',
            supportedLanguages: ['en'],
            storageKey: options.storageKey || 'giggatek_language',
            translationsPath: options.translationsPath || 'translations',
            ...options
        };

        this.currentLanguage = this.options.defaultLanguage;
        this.translations = {};
        this.isLoaded = false;
        this.loadingPromise = null;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the i18n module
     */
    async init() {
        try {
            // Add loading class to body
            document.body.classList.add('i18n-loading');

            // Set current language to English
            this.currentLanguage = 'en';

            // Load translations
            await this.loadTranslations(this.currentLanguage);

            // Translate the page
            this.translatePage();

            // Set language attribute on html element
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';

            // Mark as loaded
            this.isLoaded = true;

            // Dispatch event
            window.dispatchEvent(new CustomEvent('i18n:loaded', {
                detail: { language: 'en', isRTL: false }
            }));

            // Remove loading class
            document.body.classList.remove('i18n-loading');
        } catch (error) {
            console.error('Error initializing i18n:', error);
            // Remove loading class in case of error
            document.body.classList.remove('i18n-loading');
        }
    }

    /**
     * Determine the current language
     * @returns {string} The current language code (always 'en')
     */
    determineLanguage() {
        // Always return English as we're only supporting English
        return 'en';
    }

    /**
     * Load translations for a language
     * @param {string} language - The language code
     * @returns {Promise} A promise that resolves when translations are loaded
     */
    async loadTranslations(language) {
        if (this.translations[language]) {
            return this.translations[language];
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${this.options.translationsPath}/${language}.json`);

                if (!response.ok) {
                    throw new Error(`Failed to load translations for ${language}`);
                }

                const translations = await response.json();
                this.translations[language] = translations;

                resolve(translations);
                this.loadingPromise = null;
            } catch (error) {
                console.error(`Error loading translations for ${language}:`, error);

                // Fallback to default language if not already trying to load it
                if (language !== this.options.defaultLanguage) {
                    console.log(`Falling back to default language: ${this.options.defaultLanguage}`);
                    await this.loadTranslations(this.options.defaultLanguage);
                    resolve(this.translations[this.options.defaultLanguage]);
                } else {
                    reject(error);
                }

                this.loadingPromise = null;
            }
        });

        return this.loadingPromise;
    }

    /**
     * Translate the page
     */
    translatePage() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);

            if (translation) {
                // Check if element has data-i18n-attr attribute
                const attr = element.getAttribute('data-i18n-attr');
                if (attr) {
                    // Translate attribute
                    element.setAttribute(attr, translation);
                } else {
                    // Translate content
                    element.textContent = translation;
                }
            }
        });

        // Translate elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);

            if (translation) {
                element.setAttribute('placeholder', translation);
            }
        });

        // Translate elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.translate(key);

            if (translation) {
                element.setAttribute('title', translation);
            }
        });

        // Translate elements with data-i18n-html attribute
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.translate(key);

            if (translation) {
                element.innerHTML = translation;
            }
        });
    }

    /**
     * Set up language switcher (not needed for English-only site)
     */
    setupLanguageSwitcher() {
        // Hide any language switcher elements since we only support English
        document.querySelectorAll('.language-switcher, .language-select, .language-dropdown').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Get the name of a language
     * @param {string} code - The language code
     * @returns {string} The language name (always 'English')
     */
    getLanguageName(code) {
        return 'English';
    }

    /**
     * Change the current language
     * @param {string} language - The language code (only 'en' is supported)
     * @returns {Promise} A promise that resolves when the language is changed
     */
    async changeLanguage(language) {
        // Only English is supported
        if (language !== 'en') {
            console.error('Only English is supported');
            return;
        }

        if (language === this.currentLanguage) {
            return;
        }

        try {
            // Add a loading class to the body
            document.body.classList.add('i18n-loading');

            // Load translations
            await this.loadTranslations(language);

            // Update current language
            this.currentLanguage = language;

            // Save to localStorage
            localStorage.setItem(this.options.storageKey, language);

            // Update language attribute on html element
            document.documentElement.lang = language;

            // Set LTR direction
            document.documentElement.dir = 'ltr';

            // Translate the page
            this.translatePage();

            // Dispatch event
            window.dispatchEvent(new CustomEvent('i18n:languageChanged', {
                detail: { language, isRTL: false }
            }));

            // Refresh dynamic content
            this.refreshDynamicContent();

            // Remove loading class
            document.body.classList.remove('i18n-loading');
        } catch (error) {
            console.error(`Error loading translations: ${error}`);
            // Remove loading class in case of error
            document.body.classList.remove('i18n-loading');
        }
    }

    /**
     * Translate a key
     * @param {string} key - The translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} The translated string
     */
    translate(key, params = {}) {
        if (!key) return '';

        // Get translations for current language
        const translations = this.translations[this.currentLanguage] || {};

        // Split key by dots to support nested objects
        const keys = key.split('.');
        let translation = translations;

        // Traverse the translations object
        for (const k of keys) {
            translation = translation[k];

            if (translation === undefined) {
                // Key not found, try fallback to default language
                if (this.currentLanguage !== this.options.defaultLanguage) {
                    const defaultTranslations = this.translations[this.options.defaultLanguage] || {};
                    let defaultTranslation = defaultTranslations;

                    for (const dk of keys) {
                        defaultTranslation = defaultTranslation[dk];

                        if (defaultTranslation === undefined) {
                            // Key not found in default language either, return the key
                            return key;
                        }
                    }

                    translation = defaultTranslation;
                    break;
                } else {
                    // Key not found in default language, return the key
                    return key;
                }
            }
        }

        // If translation is not a string, return the key
        if (typeof translation !== 'string') {
            return key;
        }

        // Interpolate parameters
        return this.interpolate(translation, params);
    }

    /**
     * Interpolate parameters in a string
     * @param {string} string - The string to interpolate
     * @param {Object} params - Parameters for interpolation
     * @returns {string} The interpolated string
     */
    interpolate(string, params) {
        return string.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const value = params[key.trim()];
            return value !== undefined ? value : match;
        });
    }

    /**
     * Refresh dynamic content
     */
    refreshDynamicContent() {
        // Dispatch event for components to refresh their content
        window.dispatchEvent(new CustomEvent('i18n:refresh'));

        // If notifications module is available, translate notifications
        if (window.notifications) {
            window.notifications.translateNotifications();
        }

        // If cart module is available, refresh cart
        if (window.cart && typeof window.cart.refreshCart === 'function') {
            window.cart.refreshCart();
        }
    }

    /**
     * Format a date according to the current language
     * @param {Date|string|number} date - The date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} The formatted date
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);

        // Define region-specific date format presets for English-speaking markets
        const datePresets = {
            'en-US': {
                short: { year: 'numeric', month: 'numeric', day: 'numeric' }, // MM/DD/YYYY
                medium: { year: 'numeric', month: 'short', day: 'numeric' }, // Jan 1, 2023
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, // Sunday, January 1, 2023
                time: { hour: 'numeric', minute: 'numeric', hour12: true }, // 3:30 PM
                dateTime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true } // Jan 1, 2023, 3:30 PM
            },
            'en-GB': {
                short: { year: 'numeric', month: 'numeric', day: 'numeric' }, // DD/MM/YYYY
                medium: { year: 'numeric', month: 'short', day: 'numeric' }, // 1 Jan 2023
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, // Sunday, 1 January 2023
                time: { hour: 'numeric', minute: 'numeric', hour12: false }, // 15:30
                dateTime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false } // 1 Jan 2023, 15:30
            },
            'en-CA': {
                short: { year: 'numeric', month: 'numeric', day: 'numeric' }, // YYYY-MM-DD
                medium: { year: 'numeric', month: 'short', day: 'numeric' }, // Jan 1, 2023
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, // Sunday, January 1, 2023
                time: { hour: 'numeric', minute: 'numeric', hour12: true }, // 3:30 PM
                dateTime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true } // Jan 1, 2023, 3:30 PM
            },
            'en-AU': {
                short: { year: 'numeric', month: 'numeric', day: 'numeric' }, // DD/MM/YYYY
                medium: { year: 'numeric', month: 'short', day: 'numeric' }, // 1 Jan 2023
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, // Sunday, 1 January 2023
                time: { hour: 'numeric', minute: 'numeric', hour12: true }, // 3:30 PM
                dateTime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true } // 1 Jan 2023, 3:30 PM
            }
        };

        // Determine the appropriate locale based on user's region
        // This could be enhanced with actual region detection
        const locale = 'en-US'; // Default to US format

        // Get preset for current locale or fallback to US English
        const preset = datePresets[locale] || datePresets['en-US'];

        // If options includes a preset key, use the preset
        let formatOptions = { ...options };
        if (options.preset && preset[options.preset]) {
            delete formatOptions.preset;
            formatOptions = { ...preset[options.preset], ...formatOptions };
        }

        // Default options if none provided
        if (Object.keys(formatOptions).length === 0) {
            formatOptions = preset.medium;
        }

        return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
    }

    /**
     * Format a number according to the current language
     * @param {number} number - The number to format
     * @param {Object} options - Intl.NumberFormat options
     * @returns {string} The formatted number
     */
    formatNumber(number, options = {}) {
        // Define language-specific number format presets
        const numberPresets = {
            'en': {
                decimal: { maximumFractionDigits: 2 },
                percent: { style: 'percent', maximumFractionDigits: 2 },
                compact: { notation: 'compact', compactDisplay: 'short' }
            },
            'ja': {
                decimal: { maximumFractionDigits: 0 },
                percent: { style: 'percent', maximumFractionDigits: 0 },
                compact: { notation: 'compact', compactDisplay: 'short' }
            }
        };

        // Get preset for current language or fallback to English
        const preset = numberPresets[this.currentLanguage] || numberPresets['en'];

        // If options includes a preset key, use the preset
        let formatOptions = { ...options };
        if (options.preset && preset[options.preset]) {
            delete formatOptions.preset;
            formatOptions = { ...preset[options.preset], ...formatOptions };
        }

        return new Intl.NumberFormat(this.currentLanguage, formatOptions).format(number);
    }

    /**
     * Format a currency according to the current language
     * @param {number} amount - The amount to format
     * @param {string} currency - The currency code (USD, CAD, GBP, AUD, etc.)
     * @param {Object} options - Additional formatting options
     * @returns {string} The formatted currency
     */
    formatCurrency(amount, currency = 'USD', options = {}) {
        // Define currency format presets for different English-speaking markets
        const currencyPresets = {
            'USD': {
                standard: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
                compact: { style: 'currency', currency: 'USD', notation: 'compact', compactDisplay: 'short' }
            },
            'CAD': {
                standard: { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
                compact: { style: 'currency', currency: 'CAD', notation: 'compact', compactDisplay: 'short' }
            },
            'GBP': {
                standard: { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 },
                compact: { style: 'currency', currency: 'GBP', notation: 'compact', compactDisplay: 'short' }
            },
            'AUD': {
                standard: { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
                compact: { style: 'currency', currency: 'AUD', notation: 'compact', compactDisplay: 'short' }
            }
        };

        // Get preset for current currency or fallback to USD
        const preset = currencyPresets[currency] || currencyPresets['USD'];

        // If options includes a preset key, use the preset
        let formatOptions = { ...options };
        if (options.preset && preset[options.preset]) {
            delete formatOptions.preset;
            formatOptions = { ...preset[options.preset], ...formatOptions };
        } else {
            // Default to standard preset
            formatOptions = { ...preset.standard, ...formatOptions };
        }

        // Use appropriate locale based on currency
        let locale = 'en-US';
        if (currency === 'GBP') locale = 'en-GB';
        if (currency === 'CAD') locale = 'en-CA';
        if (currency === 'AUD') locale = 'en-AU';

        return new Intl.NumberFormat(locale, formatOptions).format(amount);
    }

    /**
     * Load language-specific fonts (simplified for English-only)
     * @param {string} language - The language code
     */
    loadLanguageFonts(language) {
        // Get the language font link element
        const fontLink = document.getElementById('language-font');
        if (!fontLink) return;

        // Set to English font
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

        // Update the font link if needed
        if (fontLink.href !== fontUrl) {
            fontLink.href = fontUrl;
        }
    }
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.i18n = new I18n();
});

// Export the I18n class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n };
}
