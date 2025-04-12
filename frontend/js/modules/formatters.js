/**
 * Formatters Module
 * Utility functions for formatting values consistently across the application
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: USD)
 * @param {string} locale - The locale to use (default: en-US)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format a date
 * @param {Date|string|number} date - The date to format
 * @param {string} format - The format to use (short, medium, long, full)
 * @param {string} locale - The locale to use (default: en-US)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'medium', locale = 'en-US') {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const options = {
        short: { month: 'numeric', day: 'numeric', year: '2-digit' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
        full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };
    
    return new Intl.DateTimeFormat(locale, options[format]).format(dateObj);
}

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} locale - The locale to use (default: en-US)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 0, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
}

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} locale - The locale to use (default: en-US)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 0, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}
