# Internationalization (i18n) Documentation

## Overview

GigGatek has been enhanced with internationalization (i18n) support to make the application accessible to users in different languages. This document provides information about how the i18n functionality works, how to use it, and how to maintain it.

## Table of Contents

1. [Features](#features)
2. [Implementation](#implementation)
3. [Translation Files](#translation-files)
4. [Usage](#usage)
5. [Adding New Languages](#adding-new-languages)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Maintenance](#maintenance)

## Features

- **Multiple Language Support**: Currently supports English, Spanish, French, German, Arabic, and Japanese
- **Language Detection**: Automatically detects the user's preferred language
- **Language Switching**: Allows users to switch between languages
- **Translation Interpolation**: Supports variable interpolation in translations
- **Fallback Mechanism**: Falls back to default language if a translation is missing
- **Responsive Design**: Language switcher adapts to different screen sizes
- **Persistent Preferences**: Remembers the user's language preference
- **RTL Support**: Full support for right-to-left languages like Arabic

## Implementation

The i18n functionality is implemented using a custom JavaScript module that handles translations and language switching.

### Key Components

- **I18n Class**: Main JavaScript class for managing i18n functionality
- **Translation Files**: JSON files containing translations for each language
- **Language Switcher**: UI element for switching between languages
- **Data Attributes**: HTML attributes for marking translatable content

### Initialization

The i18n module is initialized when the DOM is loaded:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    window.i18n = new I18n();
});
```

## Translation Files

Translation files are JSON files located in the `translations` directory. Each language has its own file named with the language code (e.g., `en.json`, `es.json`).

### Structure

Translation files are structured as nested objects with keys representing translation paths:

```json
{
  "common": {
    "home": "Home",
    "products": "Products",
    "rentToOwn": "Rent-to-Own"
  },
  "home": {
    "hero": {
      "title": "Quality Tech, Flexible Options",
      "subtitle": "Discover premium refurbished computer hardware..."
    }
  }
}
```

### Supported Languages

Currently, the following languages are supported:

- English (`en`)
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Arabic (`ar`) - with RTL support
- Japanese (`ja`)

## Usage

### Marking Content for Translation

To mark content for translation, add the `data-i18n` attribute with the translation key:

```html
<h1 data-i18n="home.hero.title">Quality Tech, Flexible Options</h1>
```

### Translating Attributes

To translate an attribute, use the `data-i18n-attr` attribute:

```html
<input type="text" placeholder="Search..." data-i18n="common.search" data-i18n-attr="placeholder">
```

### Translating HTML Content

To translate HTML content, use the `data-i18n-html` attribute:

```html
<div data-i18n-html="home.features.description">
  <p>Feature description with <strong>HTML</strong> content.</p>
</div>
```

### Variable Interpolation

To include variables in translations, use double curly braces:

```json
{
  "orders": {
    "showing": "Showing {{start}}-{{end}} of {{total}} orders"
  }
}
```

And provide the variables when translating:

```javascript
i18n.translate('orders.showing', { start: 1, end: 10, total: 50 });
```

### Programmatic Translation

To translate content programmatically, use the `translate` method:

```javascript
const message = i18n.translate('notifications.addedToCart', { product: productName });
notifications.success(message);
```

### Formatting

The i18n module provides methods for formatting dates, numbers, and currencies:

```javascript
// Format date
const formattedDate = i18n.formatDate(new Date(), { year: 'numeric', month: 'long', day: 'numeric' });

// Format number
const formattedNumber = i18n.formatNumber(1234.56, { maximumFractionDigits: 2 });

// Format currency
const formattedPrice = i18n.formatCurrency(99.99, 'USD');
```

## Adding New Languages

To add a new language, follow these steps:

1. Create a new translation file in the `translations` directory (e.g., `it.json` for Italian)
2. Copy the structure from an existing translation file (e.g., `en.json`)
3. Translate all the strings to the new language
4. Add the language code to the `supportedLanguages` array in the I18n constructor
5. Add the language name to the `getLanguageName` method
6. Add the language flag to the `img/flags` directory
7. Add the language flag CSS class to the `i18n.css` file
8. If the language is RTL, add it to the `rtlLanguages` array in the I18n constructor

### RTL Support

The i18n module includes full support for right-to-left (RTL) languages like Arabic. When a RTL language is selected, the following changes are applied:

1. The `dir` attribute on the `html` element is set to `rtl`
2. The `rtl` class is added to the `body` element
3. CSS rules for RTL languages are applied, including:
   - Reversed flex directions
   - Mirrored margins and paddings
   - Adjusted text alignment
   - Flipped positioning for dropdowns and menus

To add RTL support for a new language, simply add the language code to the `rtlLanguages` array in the I18n constructor:

```javascript
this.options = {
    defaultLanguage: options.defaultLanguage || 'en',
    supportedLanguages: options.supportedLanguages || ['en', 'es', 'fr', 'de', 'ar', 'ja'],
    rtlLanguages: options.rtlLanguages || ['ar', 'he', 'fa', 'ur', 'your_rtl_language'],
    // ...
};
```

Example:

```javascript
// Add to supportedLanguages array
this.options = {
    defaultLanguage: options.defaultLanguage || 'en',
    supportedLanguages: options.supportedLanguages || ['en', 'es', 'fr', 'de', 'it'],
    // ...
};

// Add to getLanguageName method
getLanguageName(code) {
    const languageNames = {
        'en': 'English',
        'es': 'Español',
        'fr': 'Français',
        'de': 'Deutsch',
        'it': 'Italiano'
    };

    return languageNames[code] || code;
}
```

## Best Practices

### Translation Keys

- Use descriptive, hierarchical keys (e.g., `home.hero.title`)
- Group related translations under common parents
- Use consistent naming conventions
- Keep keys in English, even for other languages

### Translation Content

- Keep translations concise
- Maintain consistent tone and style across languages
- Consider cultural differences and idioms
- Provide context for translators when necessary

### HTML Content

- Minimize HTML in translations
- Use placeholders for complex HTML structures
- Consider different text lengths in different languages

### Performance

- Load translations asynchronously
- Cache translations after loading
- Use a fallback mechanism for missing translations

## Testing

### Manual Testing

Test the i18n functionality manually by:

1. Switching between languages
2. Checking that all content is translated
3. Verifying that variable interpolation works
4. Testing on different devices and screen sizes

### Automated Testing

The i18n functionality includes comprehensive automated tests using Jest. The tests cover all major functionality, including language detection, translation loading, key translation, variable interpolation, language switching, and RTL support.

To run the tests, use the following command:

```bash
npm test
```

The test file is located at `tests/i18n.test.js` and includes the following test suites:

- **constructor**: Tests initialization with default and custom options
- **determineLanguage**: Tests language detection from various sources
- **loadTranslations**: Tests loading translations for different languages
- **translate**: Tests translating keys, handling nested keys, and interpolating variables
- **changeLanguage**: Tests changing languages, including RTL languages
- **formatters**: Tests date, number, and currency formatting

Example tests:

```javascript
// Test translation loading
test('should load translations for a language', async () => {
    const i18n = new I18n();
    await i18n.loadTranslations('en');
    expect(i18n.translations.en).toBeDefined();
});

// Test translation function
test('should translate a key', () => {
    const i18n = new I18n();
    i18n.translations.en = { test: { key: 'Test Value' } };
    expect(i18n.translate('test.key')).toBe('Test Value');
});

// Test variable interpolation
test('should interpolate variables in translations', () => {
    const i18n = new I18n();
    i18n.translations.en = { test: { key: 'Hello, {{name}}!' } };
    expect(i18n.translate('test.key', { name: 'World' })).toBe('Hello, World!');
});

// Test RTL language support
test('should handle RTL languages', async () => {
    const i18n = new I18n();
    await i18n.changeLanguage('ar');

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.body.classList.add).toHaveBeenCalledWith('rtl');
});
```

## Maintenance

### Adding New Content

When adding new content to the application:

1. Add the content with appropriate `data-i18n` attributes
2. Add the translation keys to all language files
3. Provide translations for all supported languages

### Updating Translations

When updating translations:

1. Update the translation in all language files
2. Test the changes in all supported languages
3. Consider the impact on layout and design

### Translation Management

For larger projects, consider using a translation management system:

1. Export translations to a format compatible with translation tools
2. Send translations to professional translators
3. Import translated content back into the application

### Monitoring

Monitor the i18n functionality in production:

1. Track language usage to prioritize translation efforts
2. Monitor for missing translations
3. Collect feedback from users in different regions
