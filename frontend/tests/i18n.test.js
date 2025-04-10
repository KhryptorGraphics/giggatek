/**
 * GigGatek Internationalization Tests
 * Tests for the i18n functionality
 */

// Import the I18n class
import { I18n } from '../js/i18n';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            common: {
                home: 'Home',
                products: 'Products'
            },
            test: {
                key: 'Test Value',
                interpolation: 'Hello, {{name}}!'
            }
        })
    })
);

// Mock DOM elements and events
document.documentElement = {
    lang: '',
    dir: ''
};

document.body = {
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
    }
};

document.querySelectorAll = jest.fn(() => []);
window.dispatchEvent = jest.fn();
window.addEventListener = jest.fn();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('I18n', () => {
    let i18n;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create a new instance for each test
        i18n = new I18n({
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'es', 'fr', 'de', 'ar'],
            rtlLanguages: ['ar']
        });
        
        // Mock translations
        i18n.translations = {
            en: {
                common: {
                    home: 'Home',
                    products: 'Products'
                },
                test: {
                    key: 'Test Value',
                    interpolation: 'Hello, {{name}}!'
                }
            },
            es: {
                common: {
                    home: 'Inicio',
                    products: 'Productos'
                },
                test: {
                    key: 'Valor de Prueba',
                    interpolation: '¡Hola, {{name}}!'
                }
            }
        };
    });

    describe('constructor', () => {
        test('should initialize with default options', () => {
            const defaultI18n = new I18n();
            expect(defaultI18n.options.defaultLanguage).toBe('en');
            expect(defaultI18n.options.supportedLanguages).toContain('en');
            expect(defaultI18n.options.supportedLanguages).toContain('es');
            expect(defaultI18n.options.supportedLanguages).toContain('fr');
            expect(defaultI18n.options.supportedLanguages).toContain('de');
            expect(defaultI18n.options.rtlLanguages).toContain('ar');
        });

        test('should initialize with custom options', () => {
            const customI18n = new I18n({
                defaultLanguage: 'fr',
                supportedLanguages: ['fr', 'en'],
                rtlLanguages: ['ar', 'he']
            });
            expect(customI18n.options.defaultLanguage).toBe('fr');
            expect(customI18n.options.supportedLanguages).toEqual(['fr', 'en']);
            expect(customI18n.options.rtlLanguages).toEqual(['ar', 'he']);
        });
    });

    describe('determineLanguage', () => {
        test('should return language from localStorage if available', () => {
            localStorageMock.getItem.mockReturnValueOnce('es');
            expect(i18n.determineLanguage()).toBe('es');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('giggatek_language');
        });

        test('should return default language if stored language is not supported', () => {
            localStorageMock.getItem.mockReturnValueOnce('it');
            expect(i18n.determineLanguage()).toBe('en');
        });

        test('should return language from URL parameter if available', () => {
            // Mock URL parameters
            const originalLocation = window.location;
            delete window.location;
            window.location = {
                search: '?lang=fr'
            };
            
            expect(i18n.determineLanguage()).toBe('fr');
            
            // Restore original location
            window.location = originalLocation;
        });

        test('should return language from browser if available', () => {
            // Mock navigator.language
            const originalNavigator = window.navigator;
            delete window.navigator;
            window.navigator = {
                language: 'de-DE'
            };
            
            expect(i18n.determineLanguage()).toBe('de');
            
            // Restore original navigator
            window.navigator = originalNavigator;
        });

        test('should return default language if no other language is determined', () => {
            // Mock empty localStorage, URL, and navigator
            localStorageMock.getItem.mockReturnValueOnce(null);
            
            const originalLocation = window.location;
            delete window.location;
            window.location = {
                search: ''
            };
            
            const originalNavigator = window.navigator;
            delete window.navigator;
            window.navigator = {
                language: 'it-IT'
            };
            
            expect(i18n.determineLanguage()).toBe('en');
            
            // Restore originals
            window.location = originalLocation;
            window.navigator = originalNavigator;
        });
    });

    describe('loadTranslations', () => {
        test('should load translations for a language', async () => {
            await i18n.loadTranslations('fr');
            expect(fetch).toHaveBeenCalledWith('translations/fr.json');
            expect(i18n.translations.fr).toBeDefined();
        });

        test('should return cached translations if available', async () => {
            i18n.translations.fr = { test: 'cached' };
            const result = await i18n.loadTranslations('fr');
            expect(fetch).not.toHaveBeenCalled();
            expect(result).toEqual({ test: 'cached' });
        });

        test('should fall back to default language if loading fails', async () => {
            // Mock fetch to fail for 'de' but succeed for 'en'
            global.fetch.mockImplementationOnce(() => Promise.reject('Network error'));
            
            await i18n.loadTranslations('de');
            
            // Should try to load 'de' first, then fall back to 'en'
            expect(fetch).toHaveBeenCalledWith('translations/de.json');
            expect(fetch).toHaveBeenCalledWith('translations/en.json');
        });
    });

    describe('translate', () => {
        test('should translate a key', () => {
            expect(i18n.translate('test.key')).toBe('Test Value');
        });

        test('should handle nested keys', () => {
            expect(i18n.translate('common.home')).toBe('Home');
            expect(i18n.translate('common.products')).toBe('Products');
        });

        test('should interpolate variables', () => {
            expect(i18n.translate('test.interpolation', { name: 'World' })).toBe('Hello, World!');
        });

        test('should return the key if translation is not found', () => {
            expect(i18n.translate('nonexistent.key')).toBe('nonexistent.key');
        });

        test('should fall back to default language if translation is not found in current language', () => {
            i18n.currentLanguage = 'es';
            i18n.translations.es.test = {}; // Remove the 'key' from Spanish translations
            
            expect(i18n.translate('test.key')).toBe('Test Value');
        });
    });

    describe('changeLanguage', () => {
        test('should change the current language', async () => {
            await i18n.changeLanguage('es');
            
            expect(i18n.currentLanguage).toBe('es');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('giggatek_language', 'es');
            expect(document.documentElement.lang).toBe('es');
            expect(document.body.classList.add).toHaveBeenCalledWith('lang-es');
        });

        test('should handle RTL languages', async () => {
            await i18n.changeLanguage('ar');
            
            expect(document.documentElement.dir).toBe('rtl');
            expect(document.body.classList.add).toHaveBeenCalledWith('rtl');
        });

        test('should handle LTR languages', async () => {
            // First set to RTL
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
            
            // Then change to LTR
            await i18n.changeLanguage('en');
            
            expect(document.documentElement.dir).toBe('ltr');
            expect(document.body.classList.remove).toHaveBeenCalledWith('rtl');
        });

        test('should not change if language is not supported', async () => {
            await i18n.changeLanguage('it');
            
            expect(i18n.currentLanguage).not.toBe('it');
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

        test('should not change if language is already current', async () => {
            i18n.currentLanguage = 'en';
            await i18n.changeLanguage('en');
            
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(document.documentElement.lang).not.toBe('en');
        });

        test('should dispatch event when language changes', async () => {
            await i18n.changeLanguage('es');
            
            expect(window.dispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'i18n:languageChanged',
                    detail: expect.objectContaining({
                        language: 'es',
                        isRTL: false
                    })
                })
            );
        });
    });

    describe('formatters', () => {
        test('should format dates according to the current language', () => {
            i18n.currentLanguage = 'en';
            const date = new Date(2023, 0, 1); // January 1, 2023
            
            // Mock Intl.DateTimeFormat
            const originalDateTimeFormat = Intl.DateTimeFormat;
            Intl.DateTimeFormat = jest.fn(() => ({
                format: () => 'January 1, 2023'
            }));
            
            expect(i18n.formatDate(date)).toBe('January 1, 2023');
            expect(Intl.DateTimeFormat).toHaveBeenCalledWith('en', expect.any(Object));
            
            // Restore original
            Intl.DateTimeFormat = originalDateTimeFormat;
        });

        test('should format numbers according to the current language', () => {
            i18n.currentLanguage = 'en';
            
            // Mock Intl.NumberFormat
            const originalNumberFormat = Intl.NumberFormat;
            Intl.NumberFormat = jest.fn(() => ({
                format: () => '1,234.56'
            }));
            
            expect(i18n.formatNumber(1234.56)).toBe('1,234.56');
            expect(Intl.NumberFormat).toHaveBeenCalledWith('en', {});
            
            // Restore original
            Intl.NumberFormat = originalNumberFormat;
        });

        test('should format currency according to the current language', () => {
            i18n.currentLanguage = 'en';
            
            // Mock Intl.NumberFormat
            const originalNumberFormat = Intl.NumberFormat;
            Intl.NumberFormat = jest.fn(() => ({
                format: () => '$99.99'
            }));
            
            expect(i18n.formatCurrency(99.99, 'USD')).toBe('$99.99');
            expect(Intl.NumberFormat).toHaveBeenCalledWith('en', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Restore original
            Intl.NumberFormat = originalNumberFormat;
        });
    });
});
